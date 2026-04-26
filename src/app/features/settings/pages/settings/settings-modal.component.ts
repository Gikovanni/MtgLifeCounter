import { Component, EventEmitter, Input, Output } from '@angular/core';
import {
  IonButton,
  IonContent,
  IonInput,
  IonItem,
  IonLabel,
  IonList,
  IonModal,
  IonSelect,
  IonSelectOption,
  IonTextarea
} from '@ionic/angular/standalone';
import { INITIAL_LIFE_OPTIONS, MAX_PLAYERS, MIN_PLAYERS } from '../../../../core/constants/storage-keys';
import type { AppData, ThemeMode } from '../../../../core/models/app-data.model';

@Component({
  selector: 'app-settings-modal',
  standalone: true,
  imports: [IonButton, IonContent, IonInput, IonItem, IonLabel, IonList, IonModal, IonSelect, IonSelectOption, IonTextarea],
  templateUrl: './settings-modal.component.html'
})
export class SettingsModalComponent {
  @Input({ required: true }) isOpen = false;
  @Input({ required: true }) data!: AppData;
  @Output() dismiss = new EventEmitter<void>();
  @Output() setInitialLife = new EventEmitter<number>();
  @Output() setLocation = new EventEmitter<string | null>();
  @Output() saveSettings = new EventEmitter<{ defaultInitialLife: number; defaultPlayerCount: number }>();
  @Output() setThemeMode = new EventEmitter<ThemeMode>();
  @Output() addPlayer = new EventEmitter<void>();
  @Output() removePlayer = new EventEmitter<string>();
  @Output() saveLocation = new EventEmitter<{ name: string; notes: string }>();
  @Output() deleteLocation = new EventEmitter<string>();
  @Output() startMatch = new EventEmitter<{ initialLife: number; playerCount: number; locationId: string | null }>();

  readonly initialLifeOptions = INITIAL_LIFE_OPTIONS;
  readonly playerOptions = [2, 3, 4, 5, 6];
  readonly maxPlayers = MAX_PLAYERS;
  readonly minPlayers = MIN_PLAYERS;
  locationName = '';
  locationNotes = '';

  numberValue(value: unknown) {
    return Number(value);
  }

  stringValue(value: unknown) {
    return String(value ?? '');
  }

  themeValue(value: unknown): ThemeMode {
    return value === 'light' ? 'light' : 'dark';
  }

  setLocationValue(value: unknown) {
    this.setLocation.emit(value === '__none__' ? null : String(value));
  }

  saveNewLocation() {
    this.saveLocation.emit({ name: this.locationName.trim(), notes: this.locationNotes.trim() });
    this.locationName = '';
    this.locationNotes = '';
  }

  startCurrentSettings() {
    const activeMatch = this.data.activeMatch;

    if (!activeMatch) {
      return;
    }

    this.startMatch.emit({
      initialLife: activeMatch.initialLife,
      playerCount: activeMatch.players.length,
      locationId: activeMatch.locationId
    });
  }
}
