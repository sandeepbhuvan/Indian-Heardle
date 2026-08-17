import { Component, input, computed, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GuessAttempt } from '../../models/heardle.models';

@Component({
  selector: 'app-guess-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './guess-list.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GuessListComponent {
  // Angular Signal Inputs
  readonly attempts = input<GuessAttempt[]>([]);
  readonly currentAttemptIndex = input<number>(0);
  readonly isGameOver = input<boolean>(false);
  readonly maxAttempts = input<number>(6);

  // Computed slots array signal
  readonly slots = computed(() => {
    return Array.from({ length: this.maxAttempts() }, (_, i) => i);
  });
}
