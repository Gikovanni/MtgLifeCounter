import { Component, EventEmitter, Input, OnChanges, Output } from '@angular/core';
import { IonButton, IonContent, IonItem, IonLabel, IonList, IonModal, IonSelect, IonSelectOption } from '@ionic/angular/standalone';
import type { AppData } from '../../../../core/models/app-data.model';

@Component({
  selector: 'app-finish-modal',
  standalone: true,
  imports: [IonButton, IonContent, IonItem, IonLabel, IonList, IonModal, IonSelect, IonSelectOption],
  templateUrl: './match-finish-modal.component.html'
})
export class FinishModalComponent implements OnChanges {
  @Input({ required: true }) isOpen = false;
  @Input({ required: true }) data!: AppData;
  @Output() dismiss = new EventEmitter<void>();
  @Output() finish = new EventEmitter<string>();
  winnerPlayerId = '';

  ngOnChanges() {
    if (this.isOpen) {
      this.winnerPlayerId = this.data.activeMatch?.players[0]?.id ?? '';
    }
  }

  stringValue(value: unknown) {
    return String(value ?? '');
  }

  saveResult() {
    this.finish.emit(this.winnerPlayerId);
    this.dismiss.emit();
  }
}
