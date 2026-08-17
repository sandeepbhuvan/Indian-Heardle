import { Component, input, output, computed, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-audio-player',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './audio-player.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AudioPlayerComponent {
  // Angular Signal Inputs
  readonly snippetLengths = input<number[]>([1, 2, 4, 7, 11, 16]);
  readonly currentAttemptIndex = input<number>(0);
  readonly isAudioLoading = input<boolean>(false);
  readonly isGameOver = input<boolean>(false);
  readonly isPlaying = input<boolean>(false);
  readonly progress = input<number>(0);

  // Angular Signal Outputs
  readonly playToggle = output<void>();

  // Computed signal for currently unlocked snippet length
  readonly currentSnippetLength = computed(() => {
    const lengths = this.snippetLengths();
    const idx = Math.min(this.currentAttemptIndex(), lengths.length - 1);
    return lengths[idx] || 16;
  });

  // Computed signal for dynamic timeline segments
  readonly segments = computed(() => {
    const lengths = this.snippetLengths();
    return lengths.map((length, index) => {
      const weight = index === 0 ? length : length - lengths[index - 1];
      return { length, weight };
    });
  });

  onPlayClick() {
    this.playToggle.emit();
  }
}