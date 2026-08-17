import { Component, input, output, ChangeDetectionStrategy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Language } from '../../models/heardle.models';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, FormsModule],
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

  // Tracks mobile menu state
  readonly isMenuOpen = signal(false);

  readonly modeOptions: Array<{ label: string; value: 'daily' | 'random' }> = [
    { label: 'Daily', value: 'daily' },
    { label: 'Practice', value: 'random' }
  ];

  toggleMenu() {
    this.isMenuOpen.update(open => !open);
  }

  onLanguageChange(code: string) {
    if (code) {
      this.languageChange.emit(code);
    }
  }

  emitMode(value: string) {
    this.modeChange.emit(value as 'daily' | 'random');
  }
}