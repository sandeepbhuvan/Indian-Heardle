from pydantic import BaseModel, ConfigDict
from typing import List, Optional, Union
from datetime import date

class LanguageSchema(BaseModel):
    code: str
    display_name: str
    native_name: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


class SongSearchItem(BaseModel):
    id: int
    title: str
    artist: str
    movie_or_album: Optional[str] = None
    language_code: str
    formatted_label: str

    model_config = ConfigDict(from_attributes=True)


class GameChallengeResponse(BaseModel):
    challenge_id: int
    game_mode: str # 'daily' or 'random'
    language_code: str
    youtube_video_id: str
    snippet_start_seconds: int
    snippet_lengths: List[int] = [1, 2, 4, 7, 11, 16]
    max_attempts: int = 6
    date: date | str | None = None


class GuessRequest(BaseModel):
    challenge_id: int
    song_id: Optional[int] = None
    guess_text: str
    attempt_number: int
    session_id: Optional[str] = "anon"


class GuessResponse(BaseModel):
    is_correct: bool
    status: str # "correct", "close", "incorrect"
    attempt_number: int
    matched_song: Optional[SongSearchItem] = None
    feedback_message: Optional[str] = None


class RevealResponse(BaseModel):
    challenge_id: int
    song_id: int
    title: str
    artist: str
    movie_or_album: Optional[str] = None
    release_year: Optional[int] = None
    language_code: str
    youtube_video_id: str
    youtube_url: str
    cover_image_url: Optional[str] = None
