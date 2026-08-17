export interface Language {
  code: string;
  display_name: string;
  native_name?: string;
}

export interface SongSearchItem {
  id: number;
  title: string;
  artist: string;
  movie_or_album?: string;
  language_code: string;
  formatted_label: string;
}

export interface GameChallenge {
  challenge_id: number;
  game_mode: 'daily' | 'random';
  language_code: string;
  youtube_video_id: string;
  snippet_start_seconds: number;
  snippet_lengths: number[]; // [1, 2, 4, 7, 11, 16]
  max_attempts: number;
  date?: string;
}

export interface GuessRequest {
  challenge_id: number;
  song_id?: number;
  guess_text: string;
  attempt_number: number;
  session_id?: string;
}

export interface GuessResponse {
  is_correct: boolean;
  status: 'correct' | 'close' | 'incorrect';
  attempt_number: number;
  matched_song?: SongSearchItem;
  feedback_message?: string;
}

export interface RevealResponse {
  challenge_id: number;
  song_id: number;
  title: string;
  artist: string;
  movie_or_album?: string;
  release_year?: number;
  language_code: string;
  youtube_video_id: string;
  youtube_url: string;
  cover_image_url?: string;
}

export interface GuessAttempt {
  guessText: string;
  isSkipped: boolean;
  isCorrect: boolean;
  status?: 'correct' | 'close' | 'incorrect' | 'skipped';
  feedback?: string;
}

export interface GameStats {
  played: number;
  winRate: number;
  currentStreak: number;
  maxStreak: number;
  guessesDistribution: { [key: number]: number };
}
