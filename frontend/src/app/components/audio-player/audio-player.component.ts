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

  getSegmentWeight(index: number): number {
    const diffs = [1, 1, 2, 3, 4, 5];
    return diffs[index] || 2;
  }

  onPlayClick() {
    this.playToggle.emit();
  }
}
