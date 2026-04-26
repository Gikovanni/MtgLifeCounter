import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { AppStateService } from '../../../../core/services/match.service';

@Component({
  selector: 'app-dice-roll-dialog',
  standalone: true,
  imports: [MatButtonModule, MatButtonToggleModule, MatDialogModule, MatIconModule],
  templateUrl: './dice-roll-dialog.component.html'
})
export class DiceRollDialogComponent {
  private readonly state = inject(AppStateService);
  selectedDie: 6 | 20 = 6;
  lastResult: number | null = null;

  roll() {
    this.lastResult = this.state.rollDice(this.selectedDie);
  }
}
