import { Component, input, output, signal, computed, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../services/api.service';
import { SongSearchItem } from '../../models/heardle.models';

@Component({
  selector: 'app-guess-input',
  standalone: true,
  imports: [CommonModule],
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
  readonly selectedSong = signal<SongSearchItem | null>(null);
  readonly inputText = signal<string>('');
  readonly showDropdown = signal<boolean>(false);
  readonly activeIndex = signal<number>(-1);

  private searchTimeout: any = null;

  onInputChange(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.inputText.set(value);
    this.selectedSong.set(null);
    this.activeIndex.set(-1);

    if (this.searchTimeout) clearTimeout(this.searchTimeout);

    if (!value.trim()) {
      this.suggestions.set([]);
      this.showDropdown.set(false);
      return;
    }

    this.searchTimeout = setTimeout(() => {
      this.apiService.searchSongs(this.languageCode(), value.trim()).subscribe({
        next: (results) => {
          this.suggestions.set(results);
          this.showDropdown.set(results.length > 0);
        },
        error: () => {
          this.suggestions.set([]);
          this.showDropdown.set(false);
        }
      });
    }, 200);
  }

  onFocus() {
    if (this.suggestions().length > 0) {
      this.showDropdown.set(true);
    }
  }

  onBlur() {
    // Delay hide so mousedown on item fires first
    setTimeout(() => this.showDropdown.set(false), 150);
  }

  selectItem(item: SongSearchItem) {
    this.selectedSong.set(item);
    this.inputText.set(item.formatted_label || `${item.title} — ${item.artist}`);
    this.showDropdown.set(false);
    this.suggestions.set([]);
  }

  onKeyDown(event: KeyboardEvent) {
    const items = this.suggestions();
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      this.activeIndex.set(Math.min(this.activeIndex() + 1, items.length - 1));
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      this.activeIndex.set(Math.max(this.activeIndex() - 1, -1));
    } else if (event.key === 'Enter') {
      if (this.activeIndex() >= 0 && items[this.activeIndex()]) {
        this.selectItem(items[this.activeIndex()]);
      } else {
        this.onSubmitGuess();
      }
    } else if (event.key === 'Escape') {
      this.showDropdown.set(false);
    }
  }

  onSkip() {
    if (this.disabled()) return;
    this.skipTurn.emit();
  }

  onSubmitGuess() {
    if (this.disabled()) return;
    const song = this.selectedSong();
    const text = this.inputText().trim();
    if (!song && !text) return;

    if (song) {
      this.guessSubmit.emit({
        songId: song.id,
        guessText: `${song.title} — ${song.artist}`
      });
    } else {
      this.guessSubmit.emit({ guessText: text });
    }

    this.inputText.set('');
    this.selectedSong.set(null);
    this.suggestions.set([]);
    this.showDropdown.set(false);
  }
}
