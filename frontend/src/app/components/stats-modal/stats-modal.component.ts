import { Component, input, output, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GameStats } from '../../models/heardle.models';
import { DialogModule } from 'primeng/dialog';
import { ProgressBarModule } from 'primeng/progressbar';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-stats-modal',
  standalone: true,
  imports: [CommonModule, DialogModule, ProgressBarModule, ButtonModule],
  templateUrl: './stats-modal.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StatsModalComponent {
  readonly stats = input<GameStats>({
    played: 0,
    winRate: 0,
    currentStreak: 0,
    maxStreak: 0,
    guessesDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 }
  });

  readonly close = output<void>();

  getBarWidth(guessNumber: number): number {
    const s = this.stats();
    const maxVal = Math.max(1, ...Object.values(s.guessesDistribution));
    const count = s.guessesDistribution[guessNumber] || 0;
    return (count / maxVal) * 100;
  }

  onClose() {
    this.close.emit();
  }
}
