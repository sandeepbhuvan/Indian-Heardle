from fastapi import APIRouter, Depends, Query, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy.sql.expression import func
from datetime import date, datetime, timezone
from typing import Optional
import random

from app.database import get_db
from app.models import Language, Song, DailyChallenge, GuessHistory
from app.schemas import GameChallengeResponse, GuessRequest, GuessResponse, RevealResponse, SongSearchItem
from app.services.matching import match_guess_to_song

router = APIRouter(prefix="/game", tags=["game"])

def get_or_create_daily_challenge(db: Session, language_code: str, target_date: date) -> DailyChallenge:
    """Gets today's challenge for the given language or picks a deterministic/random song to create one."""
    challenge = db.query(DailyChallenge).filter(
        DailyChallenge.language_code == language_code,
        DailyChallenge.date == target_date
    ).first()

    if not challenge:
        # Pick a song for this language
        songs = db.query(Song).filter(Song.language_code == language_code).all()
        if not songs:
            # Fallback to any song in catalog if language specific has none
            songs = db.query(Song).all()
        
        if not songs:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"No songs found in catalog for language '{language_code}'"
            )
        
        # Use date integer as seed for deterministic daily pick
        day_seed = int(target_date.strftime("%Y%m%d"))
        random.seed(day_seed + hash(language_code))
        chosen_song = random.choice(songs)
        random.seed() # reset seed

        challenge = DailyChallenge(
            date=target_date,
            language_code=language_code,
            song_id=chosen_song.id
        )
        db.add(challenge)
        db.commit()
        db.refresh(challenge)

    return challenge


@router.get("/daily", response_model=GameChallengeResponse)
def get_daily_challenge(
    language: str = Query("hi", description="Language code (e.g. 'hi', 'ta', 'te', 'pa')"),
    db: Session = Depends(get_db)
):
    """
    Returns today's daily challenge metadata for snippet playback (NO spoilers: no title or artist returned).
    """
    today = date.today()
    lang_code = language.lower()
    challenge = get_or_create_daily_challenge(db, lang_code, today)
    
    song = challenge.song
    return GameChallengeResponse(
        challenge_id=challenge.id,
        game_mode="daily",
        language_code=lang_code,
        youtube_video_id=song.youtube_video_id,
        snippet_start_seconds=song.snippet_start_seconds,
        snippet_lengths=[1, 2, 4, 7, 11, 16],
        max_attempts=6,
        date=str(challenge.date) if challenge.date else None
    )


@router.get("/random", response_model=GameChallengeResponse)
def get_random_challenge(
    language: Optional[str] = Query(None, description="Language code (or any if omitted)"),
    db: Session = Depends(get_db)
):
    """
    Generates a random practice game challenge (NO spoilers).
    """
    query = db.query(Song)
    if language:
        query = query.filter(Song.language_code == language.lower())
    
    song = query.order_by(func.random()).first()
    if not song:
        raise HTTPException(status_code=404, detail="No songs found for practice mode.")
    
    # We create a pseudo challenge ID using the negative of the song ID or an ephemeral representation
    return GameChallengeResponse(
        challenge_id=song.id, # for random mode, challenge_id maps directly to song_id
        game_mode="random",
        language_code=song.language_code,
        youtube_video_id=song.youtube_video_id,
        snippet_start_seconds=song.snippet_start_seconds,
        snippet_lengths=[1, 2, 4, 7, 11, 16],
        max_attempts=6,
        date=str(date.today())
    )


@router.post("/guess", response_model=GuessResponse)
def submit_guess(
    payload: GuessRequest,
    is_random: bool = Query(False, description="Whether this guess is for random practice mode"),
    db: Session = Depends(get_db)
):
    """
    Evaluates a user guess against the target challenge song.
    Handles exact and fuzzy matches for transliterated text.
    """
    if is_random:
        # In random mode, challenge_id is the song_id
        target_song = db.query(Song).filter(Song.id == payload.challenge_id).first()
    else:
        challenge = db.query(DailyChallenge).filter(DailyChallenge.id == payload.challenge_id).first()
        if not challenge:
            raise HTTPException(status_code=404, detail="Daily challenge not found")
        target_song = challenge.song

    if not target_song:
        raise HTTPException(status_code=404, detail="Target song not found")

    # If payload provided song_id (selected directly from autocomplete dropdown)
    is_correct = False
    status_str = "incorrect"
    matched_item = None
    feedback = ""

    if payload.song_id:
        selected_song = db.query(Song).filter(Song.id == payload.song_id).first()
        if selected_song:
            matched_item = SongSearchItem(
                id=selected_song.id,
                title=selected_song.title,
                artist=selected_song.artist,
                movie_or_album=selected_song.movie_or_album,
                language_code=selected_song.language_code,
                formatted_label=f"{selected_song.title} — {selected_song.artist}"
            )
            if selected_song.id == target_song.id:
                is_correct = True
                status_str = "correct"
                feedback = "Brilliant! You got it!"
            else:
                # Check if artists match for a hint
                if selected_song.artist.lower() in target_song.artist.lower() or target_song.artist.lower() in selected_song.artist.lower():
                    status_str = "close"
                    feedback = f"Close! Right artist, but wrong song ({selected_song.title})."
                else:
                    status_str = "incorrect"
                    feedback = f"Incorrect guess: {selected_song.title}"
    
    if not is_correct and not payload.song_id and payload.guess_text:
        # Free-text fuzzy match evaluation
        is_match, match_status, score = match_guess_to_song(payload.guess_text, target_song)
        is_correct = is_match
        status_str = match_status
        if is_correct:
            feedback = "Correct! Spot on!"
        elif status_str == "close":
            feedback = "You are very close! Check spelling or artist."
        else:
            feedback = f"Incorrect guess."

    # Record guess history in database
    guess_record = GuessHistory(
        session_id=payload.session_id or "anon",
        song_id=target_song.id,
        attempt_number=payload.attempt_number,
        guess_text=payload.guess_text,
        is_correct=is_correct,
        created_at=datetime.now(timezone.utc)
    )
    db.add(guess_record)
    db.commit()

    return GuessResponse(
        is_correct=is_correct,
        status=status_str,
        attempt_number=payload.attempt_number,
        matched_song=matched_item,
        feedback_message=feedback
    )


@router.get("/reveal/{challenge_id}", response_model=RevealResponse)
def reveal_song(
    challenge_id: int,
    is_random: bool = Query(False, description="Whether this reveal is for random practice mode"),
    db: Session = Depends(get_db)
):
    """
    Reveals full song details (title, artist, album art, YouTube link) once game ends.
    """
    if is_random:
        song = db.query(Song).filter(Song.id == challenge_id).first()
    else:
        challenge = db.query(DailyChallenge).filter(DailyChallenge.id == challenge_id).first()
        if not challenge:
            raise HTTPException(status_code=404, detail="Challenge not found")
        song = challenge.song

    if not song:
        raise HTTPException(status_code=404, detail="Song not found")

    cover = song.cover_image_url
    if not cover and song.youtube_video_id:
        cover = f"https://img.youtube.com/vi/{song.youtube_video_id}/hqdefault.jpg"

    return RevealResponse(
        challenge_id=challenge_id,
        song_id=song.id,
        title=song.title,
        artist=song.artist,
        movie_or_album=song.movie_or_album,
        release_year=song.release_year,
        language_code=song.language_code,
        youtube_video_id=song.youtube_video_id,
        youtube_url=f"https://www.youtube.com/watch?v={song.youtube_video_id}",
        cover_image_url=cover
    )
