import { Component, signal, computed, OnInit, OnDestroy, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../services/api.service';
import { YoutubePlayerService } from '../../services/youtube-player.service';
import {
  Language,
  GameChallenge,
  GuessAttempt,
  RevealResponse,
  GameStats
} from '../../models/heardle.models';
import { NavbarComponent } from '../navbar/navbar.component';
import { AudioPlayerComponent } from '../audio-player/audio-player.component';
import { GuessListComponent } from '../guess-list/guess-list.component';
import { GuessInputComponent } from '../guess-input/guess-input.component';
import { ResultsModalComponent } from '../results-modal/results-modal.component';
import { StatsModalComponent } from '../stats-modal/stats-modal.component';
import { HelpModalComponent } from '../help-modal/help-modal.component';

@Component({
  selector: 'app-game-board',
  standalone: true,
  imports: [
    CommonModule,
    NavbarComponent,
    AudioPlayerComponent,
    GuessListComponent,
    GuessInputComponent,
    ResultsModalComponent,
    StatsModalComponent,
    HelpModalComponent
  ],
  templateUrl: './game-board.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GameBoardComponent implements OnInit, OnDestroy {
  private apiService = inject(ApiService);
  public ytService = inject(YoutubePlayerService);

  // Modern Angular Signals
  readonly languages = signal<Language[]>([]);
  readonly selectedLanguage = signal<string>('hi');
  readonly gameMode = signal<'daily' | 'random'>('daily');

  readonly challenge = signal<GameChallenge | null>(null);
  readonly attempts = signal<GuessAttempt[]>([]);
  readonly isGameOver = signal<boolean>(false);
  readonly isWin = signal<boolean>(false);
  readonly revealData = signal<RevealResponse | null>(null);

  readonly isLoading = signal<boolean>(true);
  readonly isAudioLoading = signal<boolean>(false);
  readonly errorMessage = signal<string>('');

  readonly showResultsModal = signal<boolean>(false);
  readonly showStatsModal = signal<boolean>(false);
  readonly showHelpModal = signal<boolean>(false);

  readonly stats = signal<GameStats>({
    played: 0,
    winRate: 0,
    currentStreak: 0,
    maxStreak: 0,
    guessesDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 }
  });

  // Computed signals
  readonly currentLanguageName = computed(() => {
    const list = this.languages();
    const currCode = this.selectedLanguage();
    const found = list.find(x => x.code === currCode);
    return found ? found.display_name : 'Indian';
  });

  readonly nextSnippetDuration = computed(() => {
    const ch = this.challenge();
    if (!ch?.snippet_lengths || ch.snippet_lengths.length === 0) return 1;
    
    const currentCount = this.attempts().length;
    const nextIdx = Math.min(currentCount + 1, ch.snippet_lengths.length - 1);
    const currIdx = Math.min(currentCount, ch.snippet_lengths.length - 1);
    return (ch.snippet_lengths[nextIdx] || 16) - (ch.snippet_lengths[currIdx] || 1);
  });

  ngOnInit() {
    this.loadStats();
    this.loadLanguages();
  }

  ngOnDestroy() {
    this.ytService.stopSnippet();
  }

  loadLanguages() {
    this.apiService.getLanguages().subscribe({
      next: (langs) => {
        this.languages.set(langs);
        if (langs.length > 0 && !this.selectedLanguage()) {
          this.selectedLanguage.set(langs[0].code);
        }
        this.loadGameChallenge();
      },
      error: (err) => {
        console.error('Failed to load languages', err);
        const fallback = [
          { code: 'hi', display_name: 'Hindi (Bollywood)', native_name: 'हिन्दी' },
          { code: 'ta', display_name: 'Tamil (Kollywood)', native_name: 'தமிழ்' },
          { code: 'te', display_name: 'Telugu (Tollywood)', native_name: 'తెలుగు' },
          { code: 'pa', display_name: 'Punjabi Pop', native_name: 'ਪੰਜਾਬੀ' },
          { code: 'ml', display_name: 'Malayalam', native_name: 'മലയാളം' },
          { code: 'kn', display_name: 'Kannada', native_name: 'ಕನ್ನಡ' }
        ];
        this.languages.set(fallback);
        
        // Ensure language is selected for fallback as well
        if (fallback.length > 0 && !this.selectedLanguage()) {
          this.selectedLanguage.set(fallback[0].code);
        }
        this.loadGameChallenge();
      }
    });
  }

  loadGameChallenge() {
    this.isLoading.set(true);
    this.errorMessage.set('');
    this.attempts.set([]);
    this.isGameOver.set(false);
    this.isWin.set(false);
    this.revealData.set(null);

    const mode = this.gameMode();
    const lang = this.selectedLanguage();

    const req$ = mode === 'daily'
      ? this.apiService.getDailyChallenge(lang)
      : this.apiService.getRandomChallenge(lang);

    req$.subscribe({
      next: (res) => {
        this.challenge.set(res);
        this.isLoading.set(false);
        this.setupYouTubePlayer(res.youtube_video_id, res.snippet_start_seconds);
      },
      error: (err) => {
        console.error('Could not load song challenge', err);
        this.isLoading.set(false);
        this.errorMessage.set('Could not load song challenge. Please make sure the backend is running.');
      }
    });
  }

  setupYouTubePlayer(videoId: string, startSeconds: number) {
    this.isAudioLoading.set(true);
    // Directly setup the player since the container is at the root level and always present in the DOM
    this.ytService.createPlayer('yt-player-container', videoId, startSeconds)
      .then(() => {
        this.isAudioLoading.set(false);
      })
      .catch((err) => {
        console.error('Error creating YT player', err);
        this.isAudioLoading.set(false);
        this.errorMessage.set('Failed to initialize the audio player.');
      });
  }

  handlePlaySnippet() {
    const ch = this.challenge();
    if (!ch?.snippet_lengths || ch.snippet_lengths.length === 0) return;
    
    const currentCount = this.attempts().length;
    const snippetSecs = ch.snippet_lengths[Math.min(currentCount, ch.snippet_lengths.length - 1)] || 16;
    this.ytService.playSnippet(ch.snippet_start_seconds, snippetSecs);
  }

  onLanguageSelect(langCode: string) {
    this.selectedLanguage.set(langCode);
    this.loadGameChallenge();
  }

  onModeSelect(mode: 'daily' | 'random') {
    this.gameMode.set(mode);
    this.loadGameChallenge();
  }

  startNewRandomGame() {
    this.showResultsModal.set(false);
    this.gameMode.set('random');
    this.loadGameChallenge();
  }

  onSkipTurn() {
    const ch = this.challenge();
    if (!ch || this.isGameOver()) return;

    this.attempts.update(prev => [
      ...prev,
      {
        guessText: 'Skipped',
        isSkipped: true,
        isCorrect: false,
        status: 'skipped'
      }
    ]);

    this.checkGameStatus();
  }

  onGuessSubmit(event: { songId?: number; guessText: string }) {
    const ch = this.challenge();
    if (!ch || this.isGameOver()) return;

    this.errorMessage.set('');

    const attemptNumber = this.attempts().length + 1;
    const isRandom = this.gameMode() === 'random';

    this.apiService.submitGuess({
      challenge_id: ch.challenge_id,
      song_id: event.songId,
      guess_text: event.guessText,
      attempt_number: attemptNumber
    }, isRandom).subscribe({
      next: (res) => {
        this.attempts.update(prev => [
          ...prev,
          {
            guessText: event.guessText,
            isSkipped: false,
            isCorrect: res.is_correct,
            status: res.status,
            feedback: res.feedback_message
          }
        ]);

        if (res.is_correct) {
          this.isWin.set(true);
          this.endGame();
        } else {
          this.checkGameStatus();
        }
      },
      error: (err) => {
        console.error('Error submitting guess', err);
        this.errorMessage.set('Failed to submit guess. Please try again.');
      }
    });
  }

  checkGameStatus() {
    const ch = this.challenge();
    if (!ch) return;
    if (this.attempts().length >= ch.max_attempts) {
      this.isWin.set(false);
      this.endGame();
    }
  }

  endGame() {
    const ch = this.challenge();
    if (!ch) return;
    this.isGameOver.set(true);
    this.updateStats(this.isWin(), this.attempts().length);

    const isRandom = this.gameMode() === 'random';
    this.apiService.revealSong(ch.challenge_id, isRandom).subscribe({
      next: (reveal) => {
        this.revealData.set(reveal);
        this.showResultsModal.set(true);
      },
      error: (err) => {
        console.error('Error revealing song details', err);
        this.errorMessage.set('Failed to load song results.');
      }
    });
  }

  loadStats() {
    try {
      const saved = localStorage.getItem('heardle_stats');
      if (saved) {
        this.stats.set(JSON.parse(saved));
      }
    } catch (e) {
      console.warn('Could not parse local stats', e);
    }
  }

  updateStats(win: boolean, attemptsCount: number) {
    const curr = { ...this.stats() };
    curr.played += 1;
    if (win) {
      curr.currentStreak += 1;
      if (curr.currentStreak > curr.maxStreak) {
        curr.maxStreak = curr.currentStreak;
      }
      curr.guessesDistribution = {
        ...curr.guessesDistribution,
        [attemptsCount]: (curr.guessesDistribution[attemptsCount] || 0) + 1
      };
    } else {
      curr.currentStreak = 0;
    }
    const totalWins = Object.values(curr.guessesDistribution).reduce((a, b) => a + b, 0);
    curr.winRate = Math.round((totalWins / curr.played) * 100);

    this.stats.set(curr);
    try {
      localStorage.setItem('heardle_stats', JSON.stringify(curr));
    } catch (e) {
      console.error('Could not save local stats', e);
    }
  }
}