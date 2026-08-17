# Multi-Language Heardle-Style Game — Solution Document
*Angular + FastAPI | Aug 2026*

## 1. Executive Summary
A song-guessing game (à la heardle.akashparmar.com) with a **language dropdown** that
restricts the daily/random song pool to the selected language(s). To stay on the right
side of music licensing, the design **never stores or serves raw audio/video files** —
all playback happens through platforms' own official embedded players, and the backend
only stores metadata (video IDs, titles, language tags).

## 2. Licensing & Platform Policy Constraints (current as of Aug 2026)

| Approach | Verdict | Why |
|---|---|---|
| Store ripped MP3s in your own DB | ❌ Not viable | Requires sync/performance licenses from labels & publishers; ripping is infringement regardless of app size. |
| Unofficial/reverse-engineered APIs (ytmusicapi, librespot, `yt-dlp` audio extraction, unofficial "heardle APIs") | ❌ Avoid | Violates platform ToS, unstable, real ban/legal exposure. |
| Spotify Web Playback SDK (official, user logs into own Premium) | ⚠️ Small-scale only | Development Mode is capped at **5 allow-listed users** and requires the app owner to hold Premium; **Extended Quota Mode (needed for a public app) is now restricted to registered organizations with ≥250k monthly active users** (tightened May 2025, again Feb 2026). Not realistic for an indie public launch. |
| YouTube IFrame Player API (official embed) | ✅ Recommended | No user login/auth required at all — same access level as watching youtube.com. Natively supports `start`/`end` params to clip playback. Free, scales to any number of users. |

**Bottom line:** build the public-facing game on YouTube's official embed. Keep Spotify
as an optional, capped "premium mode" for a small private group if you want it, not the
primary/public path.

## 3. High-Level Architecture

```
Angular (SPA)                         FastAPI (backend)
─────────────────                     ─────────────────
LanguageSelector ───────────────────▶ GET /catalog/languages
GameBoard                             GET /game/daily?lang=xx
 └─ YT.Player (hidden iframe)         GET /game/random?lang=xx
 └─ progressive snippet timer         POST /game/guess
GuessInput (autocomplete) ──────────▶ GET /catalog/search?lang=xx&q=
(optional) SpotifyLoginButton ──────▶ /auth/spotify/* (only if premium mode enabled)

                                       Postgres: songs, languages,
                                       daily_challenges, guesses
```

Backend **never** touches audio/video bytes — it only returns a `video_id` +
`snippet_start_seconds`; the browser streams directly from YouTube's own CDN via the
embed, under YouTube's ad-supported terms.

## 4. Frontend (Angular)
- **LanguageSelectorComponent** — dropdown from `/catalog/languages`, drives which song pool is queried.
- **GameBoardComponent** — owns the `YT.Player` instance:
  - `cueVideoById({ videoId, startSeconds })`
  - `playVideo()` then `setTimeout(() => player.pauseVideo(), snippetMs)` for progressive lengths (1s → 2s → 4s → 7s → 11s → 16s, same as original Heardle)
  - Using the JS API instead of a static `?start=&end=` URL gives frame-accurate pausing.
- **GuessInputComponent** — autocomplete hitting `/catalog/search`, restricted to the currently selected language(s) so users aren't guessing across pools.
- **(Optional) SpotifyLoginComponent** — only if you build the capped premium mode; OAuth PKCE flow, initializes Web Playback SDK, uses `seek()`/`togglePlay()` for snippet control.

## 5. Backend (FastAPI)
- `GET /catalog/languages` — static/curated list.
- `GET /catalog/songs?language=xx&q=` — autocomplete search scoped to language.
- `GET /game/daily?language=xx` / `GET /game/random?language=xx` — returns `video_id`, `snippet_start_seconds`, and difficulty step lengths. **Does not return title/artist** until the round ends (avoids spoiling via network tab).
- `POST /game/guess` — fuzzy-matches guess text (e.g. `rapidfuzz`) against title/artist + known aliases (important for multi-language: transliterations, alternate spellings), returns correct/close/incorrect, advances attempt count.
- Admin/cron script — periodically pulls curated public playlists per language via YouTube Data API v3 `playlistItems.list` (official, cheap: list calls cost a few quota units against a 10,000/day free quota), tags each song's language, writes `video_id + title + artist + language` into Postgres. This is the only place external APIs are called for content — no per-user auth needed for this part.
- `/auth/spotify/*` — **only if you build the optional premium mode**: OAuth code exchange with PKCE, encrypted refresh-token storage, capped to your 5 allow-listed test users.

## 6. Data Model (Postgres)
```
languages(code PK, display_name)

songs(
  id PK, youtube_video_id, title, artist, language FK,
  snippet_start_seconds, aliases text[]  -- alt spellings/transliterations
)

daily_challenges(id PK, date, language FK, song_id FK)

guesses(id PK, session_id, song_id FK, attempt_number, guess_text, correct, created_at)

-- only if optional Spotify mode is built:
spotify_tokens(user_id PK, refresh_token_encrypted)
```

## 7. Snippet Playback Flow (YouTube path)
1. User picks language → Angular calls `/game/daily?language=xx`.
2. Backend returns `{ video_id, snippet_lengths: [1,2,4,7,11,16], start_offset }` (no title).
3. Frontend lazy-loads the IFrame API, creates a hidden/minimal `YT.Player`, cues the video at `start_offset`, plays, and auto-pauses at the current snippet length.
4. On each wrong guess, next attempt re-plays from `start_offset` for the next (longer) snippet length.
5. On correct guess or final attempt, frontend requests a `/game/reveal/{challenge_id}` endpoint that finally returns title/artist/album art for the results screen.

## 8. Build Order
1. FastAPI skeleton + Postgres models.
2. Catalog-curation script for 2–3 starter languages.
3. Angular shell: language dropdown + single-language static game.
4. YouTube IFrame integration + progressive snippet logic.
5. Guess/autocomplete + scoring.
6. Expand language coverage.
7. *(Optional)* Spotify SDK as a capped "premium mode" toggle for a small private group.

## 9. Explicitly Out of Scope
- Local storage/caching of copyrighted audio or video files.
- Any reverse-engineered/unofficial scraping API for pulling playable audio.
- Public-facing Spotify playback beyond the 5-user Development Mode cap (not achievable without a registered organization + 250k MAU, per current Spotify policy).

## 10. Key Sources
- Spotify quota modes (Dev Mode 5-user cap, allow-listing): https://developer.spotify.com/documentation/web-api/concepts/quota-modes
- Spotify Extended Quota Mode org/MAU requirement: https://developer.spotify.com/blog/2025-04-15-updating-the-criteria-for-web-api-extended-access
- Spotify Feb 2026 Dev Mode migration details: https://developer.spotify.com/documentation/web-api/tutorials/february-2026-migration-guide
- YouTube IFrame Player API (no auth required): https://developers.google.com/youtube/iframe_api_reference
- YouTube embed `start`/`end` clip params: https://developers.google.com/youtube/player_parameters
