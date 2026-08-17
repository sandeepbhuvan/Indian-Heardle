import { Component, output, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-help-modal',
  standalone: true,
  imports: [CommonModule, DialogModule, ButtonModule],
  templateUrl: './help-modal.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HelpModalComponent {
  readonly close = output<void>();

  onClose() {
    this.close.emit();
  }
}
