import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import {
  IonButton,
  IonIcon,
  IonInput,
  IonItem,
  IonLabel,
  IonList,
  IonSelect,
  IonSelectOption,
  IonTextarea
} from '@ionic/angular/standalone';
import { INITIAL_LIFE_OPTIONS } from '../../../../core/constants/storage-keys';
import type { AppData, LocationRecord, MatchSettings } from '../../../../core/models/app-data.model';

@Component({
  selector: 'app-setup-screen',
  standalone: true,
  imports: [IonButton, IonIcon, IonInput, IonItem, IonLabel, IonList, IonSelect, IonSelectOption, IonTextarea],
  templateUrl: './match-setup.component.html',
  styleUrl: './match-setup.component.scss'
})
export class SetupScreenComponent implements OnChanges {
  @Input({ required: true }) data!: AppData;
  @Output() startMatch = new EventEmitter<MatchSettings>();
  @Output() saveLocation = new EventEmitter<{ id?: string; name: string; notes: string }>();
  @Output() deleteLocation = new EventEmitter<string>();

  readonly initialLifeOptions = INITIAL_LIFE_OPTIONS;
  readonly playerOptions = [2, 3, 4, 5, 6];
  initialLife = 20;
  playerCount = 4;
  locationId: string | null = null;
  editingLocation: LocationRecord | null = null;
  locationName = '';
  locationNotes = '';
  matchesByLocation = new Map<string, number>();

  ngOnChanges(changes: SimpleChanges) {
    if (changes['data']) {
      this.initialLife = this.data.settings.defaultInitialLife;
      this.playerCount = this.data.settings.defaultPlayerCount;
      this.locationId = this.data.settings.lastSelectedLocationId;
      this.matchesByLocation = this.buildMatchesByLocation();
    }
  }

  numberValue(value: unknown) {
    return Number(value);
  }

  stringValue(value: unknown) {
    return String(value ?? '');
  }

  setSelectedLocation(value: unknown) {
    this.locationId = value === '__none__' ? null : String(value);
  }

  beginEditLocation(location: LocationRecord) {
    this.editingLocation = location;
    this.locationName = location.name;
    this.locationNotes = location.notes;
  }

  clearLocationForm() {
    this.editingLocation = null;
    this.locationName = '';
    this.locationNotes = '';
  }

  saveCurrentLocation() {
    this.saveLocation.emit({
      id: this.editingLocation?.id,
      name: this.locationName.trim(),
      notes: this.locationNotes.trim()
    });
    this.clearLocationForm();
  }

  private buildMatchesByLocation() {
    const counts = new Map<string, number>();
    this.data.matchHistory.forEach((match) => {
      if (match.locationId) {
        counts.set(match.locationId, (counts.get(match.locationId) ?? 0) + 1);
      }
    });
    return counts;
  }
}
