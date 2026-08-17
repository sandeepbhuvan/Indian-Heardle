from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import or_
from typing import List, Optional

from app.database import get_db
from app.models import Language, Song
from app.schemas import LanguageSchema, SongSearchItem

router = APIRouter(prefix="/catalog", tags=["catalog"])

@router.get("/languages", response_model=List[LanguageSchema])
def get_languages(db: Session = Depends(get_db)):
    """Retrieve all available language categories ordered by display priority."""
    languages = db.query(Language).order_by(Language.order_index, Language.display_name).all()
    return languages

@router.get("/songs", response_model=List[SongSearchItem])
def search_songs(
    language: Optional[str] = Query(None, description="Language code filter e.g. 'hi', 'ta'"),
    q: Optional[str] = Query("", description="Search term for song title, artist, or movie"),
    limit: int = Query(25, ge=1, le=100),
    db: Session = Depends(get_db)
):
    """
    Search catalog songs for the autocomplete dropdown, scoped by language.
    """
    query = db.query(Song)
    if language:
        query = query.filter(Song.language_code == language.lower())
    
    if q and q.strip():
        search_pattern = f"%{q.strip()}%"
        query = query.filter(
            or_(
                Song.title.ilike(search_pattern),
                Song.artist.ilike(search_pattern),
                Song.movie_or_album.ilike(search_pattern)
            )
        )
    
    songs = query.order_by(Song.title).limit(limit).all()
    
    results = []
    for s in songs:
        label = f"{s.title} — {s.artist}"
        if s.movie_or_album:
            label += f" ({s.movie_or_album})"
        results.append(SongSearchItem(
            id=s.id,
            title=s.title,
            artist=s.artist,
            movie_or_album=s.movie_or_album,
            language_code=s.language_code,
            formatted_label=label
        ))
    return results
