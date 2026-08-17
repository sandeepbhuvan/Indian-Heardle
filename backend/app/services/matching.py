import re
import unicodedata
from rapidfuzz import fuzz
from typing import List, Tuple
from app.models import Song

def normalize_string(text: str) -> str:
    """Normalize string by removing diacritics, punctuation, extra spaces, and lowercasing."""
    if not text:
        return ""
    # Normalize unicode (decompose accented chars)
    normalized = unicodedata.normalize('NFKD', text)
    # Remove accents/diacritics
    ascii_text = ''.join(c for c in normalized if not unicodedata.combining(c))
    # Replace punctuation with whitespace
    clean_text = re.sub(r'[^\w\s]', ' ', ascii_text)
    # Collapse multiple whitespaces
    return ' '.join(clean_text.lower().split())

def match_guess_to_song(guess_text: str, target_song: Song) -> Tuple[bool, str, float]:
    """
    Evaluates a user guess against a target Song (title, artist, movie/album, aliases).
    Returns (is_correct, status ["correct", "close", "incorrect"], best_score [0..100]).
    """
    norm_guess = normalize_string(guess_text)
    if not norm_guess:
        return False, "incorrect", 0.0

    # Build candidate target strings
    candidates = [
        target_song.title,
        f"{target_song.title} {target_song.artist}",
        f"{target_song.title} {target_song.movie_or_album or ''}",
    ]
    if target_song.aliases and isinstance(target_song.aliases, list):
        candidates.extend(target_song.aliases)

    best_score = 0.0
    for cand in candidates:
        if not cand:
            continue
        norm_cand = normalize_string(cand)
        if not norm_cand:
            continue

        # Exact normalized match
        if norm_guess == norm_cand:
            return True, "correct", 100.0

        # Partial token sort ratio & standard ratio
        score_ratio = fuzz.ratio(norm_guess, norm_cand)
        score_token_set = fuzz.token_set_ratio(norm_guess, norm_cand)
        score_token_sort = fuzz.token_sort_ratio(norm_guess, norm_cand)
        score_partial = fuzz.partial_ratio(norm_guess, norm_cand)

        max_curr = max(score_ratio, score_token_set, score_token_sort, score_partial)
        if max_curr > best_score:
            best_score = max_curr

    # Scoring thresholds
    if best_score >= 88.0:
        return True, "correct", best_score
    elif best_score >= 70.0:
        return False, "close", best_score
    else:
        return False, "incorrect", best_score
