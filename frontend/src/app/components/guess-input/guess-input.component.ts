import { Component, input, output, signal, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { SongSearchItem } from '../../models/heardle.models';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-guess-input',
  standalone: true,
  imports: [CommonModule, FormsModule, AutoCompleteModule, ButtonModule],
  templateUrl: './guess-input.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GuessInputComponent {
  private apiService = inject(ApiService);

  readonly languageCode = input<string>('hi');
  readonly disabled = input<boolean>(false);
  readonly nextSnippetDuration = input<number>(1);

  readonly guessSubmit = output<{ songId?: number; guessText: string }>();
  readonly skipTurn = output<void>();

  readonly suggestions = signal<SongSearchItem[]>([]);
  readonly selectedSong = signal<SongSearchItem | string | null>(null);

  searchSongs(event: { query: string }) {
    const query = event.query;
    if (!query || !query.trim()) {
      this.suggestions.set([]);
      return;
    }

    this.apiService.searchSongs(this.languageCode(), query).subscribe({
      next: (results) => {
        this.suggestions.set(results);
      },
      error: () => {
        this.suggestions.set([]);
      }
    });
  }

  selectSuggestion(event: any) {
    const item: SongSearchItem = event.value;
    this.selectedSong.set(item);
  }

  clearInput() {
    this.selectedSong.set(null);
    this.suggestions.set([]);
  }

  onKeyDown(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      this.onSubmitGuess();
    }
  }

  onSkip() {
    if (this.disabled()) return;
    this.skipTurn.emit();
  }

  onSubmitGuess() {
    if (this.disabled()) return;
    const song = this.selectedSong();
    if (!song) return;

    if (typeof song === 'string') {
      this.guessSubmit.emit({
        guessText: song.trim()
      });
    } else {
      this.guessSubmit.emit({
        songId: song.id,
        guessText: `${song.title} — ${song.artist}`
      });
    }

    this.clearInput();
  }
}
