from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Date, JSON, Text
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from app.database import Base

class Language(Base):
    __tablename__ = "languages"

    code = Column(String(10), primary_key=True, index=True) # e.g. 'hi', 'ta', 'te', 'pa', 'ml', 'kn'
    display_name = Column(String(100), nullable=False)
    native_name = Column(String(100), nullable=True)
    order_index = Column(Integer, default=0)

    songs = relationship("Song", back_populates="language")
    daily_challenges = relationship("DailyChallenge", back_populates="language")


class Song(Base):
    __tablename__ = "songs"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    youtube_video_id = Column(String(32), nullable=False, index=True)
    title = Column(String(255), nullable=False, index=True)
    artist = Column(String(255), nullable=False)
    movie_or_album = Column(String(255), nullable=True)
    release_year = Column(Integer, nullable=True)
    language_code = Column(String(10), ForeignKey("languages.code"), nullable=False, index=True)
    snippet_start_seconds = Column(Integer, default=0) # start offset for best hook/snippet
    cover_image_url = Column(String(512), nullable=True)
    # Stored as JSON list of strings to accommodate both SQLite and Postgres
    aliases = Column(JSON, default=list)

    language = relationship("Language", back_populates="songs")
    daily_challenges = relationship("DailyChallenge", back_populates="song")
    guesses = relationship("GuessHistory", back_populates="song")


class DailyChallenge(Base):
    __tablename__ = "daily_challenges"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    date = Column(Date, nullable=False, index=True)
    language_code = Column(String(10), ForeignKey("languages.code"), nullable=False, index=True)
    song_id = Column(Integer, ForeignKey("songs.id"), nullable=False)

    language = relationship("Language", back_populates="daily_challenges")
    song = relationship("Song", back_populates="daily_challenges")


class GuessHistory(Base):
    __tablename__ = "guesses"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    session_id = Column(String(128), nullable=False, index=True)
    song_id = Column(Integer, ForeignKey("songs.id"), nullable=False)
    attempt_number = Column(Integer, nullable=False)
    guess_text = Column(String(255), nullable=False)
    is_correct = Column(Boolean, default=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    song = relationship("Song", back_populates="guesses")
