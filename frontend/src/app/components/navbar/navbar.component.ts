import { Component, input, output, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Language } from '../../models/heardle.models';
import { SelectModule } from 'primeng/select';
import { SelectButtonModule } from 'primeng/selectbutton';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, FormsModule, SelectModule, SelectButtonModule, ButtonModule],
  templateUrl: './navbar.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NavbarComponent {
  readonly languages = input<Language[]>([]);
  readonly selectedLanguage = input<string>('hi');
  readonly gameMode = input<'daily' | 'random'>('daily');

  readonly languageChange = output<string>();
  readonly modeChange = output<'daily' | 'random'>();
  readonly openHelp = output<void>();
  readonly openStats = output<void>();

  readonly modeOptions = [
    { label: 'Daily', value: 'daily' },
    { label: 'Practice', value: 'random' }
  ];

  onLanguageChange(code: string) {
    if (code) {
      this.languageChange.emit(code);
    }
  }
}
