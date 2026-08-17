import { Component, input, output, computed, signal, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RevealResponse, GuessAttempt } from '../../models/heardle.models';
import confetti from 'canvas-confetti';

@Component({
  selector: 'app-results-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './results-modal.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ResultsModalComponent implements OnInit {
  readonly reveal = input<RevealResponse | null>(null);
  readonly isWin = input<boolean>(false);
  readonly attempts = input<GuessAttempt[]>([]);
  readonly gameMode = input<'daily' | 'random'>('daily');
  readonly languageName = input<string>('Hindi');

  readonly close = output<void>();
  readonly playAgain = output<void>();
  readonly playPractice = output<void>();

  readonly copied = signal<boolean>(false);

  readonly emojiPattern = computed(() => {
    return this.attempts().map((att) => {
      if (att.isCorrect) return '🟩';
      if (att.status === 'close') return '🟨';
      if (att.isSkipped) return '⬛';
      return '🟥';
    }).join('');
  });

  ngOnInit() {
    if (this.isWin()) {
      this.triggerConfetti();
    }
  }

  copyScore() {
    const triesCount = this.isWin() ? this.attempts().length : 'X';
    const text = `Indian Heardle (${this.languageName()}) ${this.gameMode() === 'daily' ? 'Daily' : 'Practice'}\n🔊 ${triesCount}/6\n${this.emojiPattern()}\nPlay at: ${window.location.origin}`;
    navigator.clipboard.writeText(text).then(() => {
      this.copied.set(true);
      setTimeout(() => this.copied.set(false), 2500);
    });
  }

  triggerConfetti() {
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch (e) {}
  }

  onImgError(event: any) {
    event.target.src = 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300';
  }

  onClose() {
    this.close.emit();
  }
}
