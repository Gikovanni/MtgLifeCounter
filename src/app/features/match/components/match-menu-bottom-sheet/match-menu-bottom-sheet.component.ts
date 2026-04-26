import { Component, inject } from '@angular/core';
import { MAT_BOTTOM_SHEET_DATA, MatBottomSheetRef } from '@angular/material/bottom-sheet';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';

export type MatchMenuAction = 'history' | 'data' | 'finish' | 'settings' | 'dice' | 'reset' | 'newMatch';

interface MatchMenuData {
  duration: string;
  location: string;
}

@Component({
  selector: 'app-match-menu-bottom-sheet',
  standalone: true,
  imports: [MatButtonModule, MatIconModule, MatListModule],
  templateUrl: './match-menu-bottom-sheet.component.html'
})
export class MatchMenuBottomSheetComponent {
  private readonly bottomSheetRef = inject<MatBottomSheetRef<MatchMenuBottomSheetComponent, MatchMenuAction>>(MatBottomSheetRef);
  readonly data = inject<MatchMenuData>(MAT_BOTTOM_SHEET_DATA);

  close(action: MatchMenuAction) {
    this.bottomSheetRef.dismiss(action);
  }
}
