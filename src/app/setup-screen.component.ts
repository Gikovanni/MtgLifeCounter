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
import { INITIAL_LIFE_OPTIONS } from '../core/constants';
import type { AppData, LocationRecord, MatchSettings } from '../core/types';

@Component({
  selector: 'app-setup-screen',
  standalone: true,
  imports: [IonButton, IonIcon, IonInput, IonItem, IonLabel, IonList, IonSelect, IonSelectOption, IonTextarea],
  template: `
    <main class="setup-shell">
      <section class="setup-header">
        <div>
          <p class="topbar__eyebrow">Magic Life Counter</p>
          <h1>Nova partida</h1>
        </div>
      </section>

      <section class="setup-grid">
        <div class="setup-panel">
          <h2>Configuracao</h2>
          <ion-list inset>
            <ion-item>
              <ion-label>Jogadores</ion-label>
              <ion-select [value]="playerCount" interface="popover" (ionChange)="playerCount = numberValue($event.detail.value)">
                @for (option of playerOptions; track option) {
                  <ion-select-option [value]="option">{{ option }}</ion-select-option>
                }
              </ion-select>
            </ion-item>
            <ion-item>
              <ion-label>Vida inicial</ion-label>
              <ion-select [value]="initialLife" interface="popover" (ionChange)="initialLife = numberValue($event.detail.value)">
                @for (option of initialLifeOptions; track option) {
                  <ion-select-option [value]="option">{{ option }}</ion-select-option>
                }
              </ion-select>
            </ion-item>
            <ion-item>
              <ion-label>Local</ion-label>
              <ion-select [value]="locationId ?? '__none__'" interface="popover" (ionChange)="setSelectedLocation($event.detail.value)">
                <ion-select-option value="__none__">Sem local</ion-select-option>
                @for (location of data.locations; track location.id) {
                  <ion-select-option [value]="location.id">{{ location.name }}</ion-select-option>
                }
              </ion-select>
            </ion-item>
          </ion-list>
          <ion-button expand="block" size="large" (click)="startMatch.emit({ initialLife, playerCount, locationId })">
            Iniciar partida
          </ion-button>
        </div>

        <div class="setup-panel">
          <div class="section-heading">
            <h2>Locais</h2>
            <ion-icon name="location-outline"></ion-icon>
          </div>
          <div class="locations-form">
            <ion-input
              label="Nome"
              labelPlacement="stacked"
              [value]="locationName"
              (ionInput)="locationName = stringValue($event.detail.value)"
            ></ion-input>
            <ion-textarea
              label="Observacoes"
              labelPlacement="stacked"
              [value]="locationNotes"
              [autoGrow]="true"
              (ionInput)="locationNotes = stringValue($event.detail.value)"
            ></ion-textarea>
            <div class="setup-location-actions">
              <ion-button [disabled]="!locationName.trim()" (click)="saveCurrentLocation()">
                <ion-icon slot="start" [name]="editingLocation ? 'create-outline' : 'add-outline'"></ion-icon>
                {{ editingLocation ? 'Atualizar' : 'Adicionar' }}
              </ion-button>
              @if (editingLocation) {
                <ion-button fill="clear" color="medium" (click)="clearLocationForm()">Cancelar</ion-button>
              }
            </div>
          </div>

          <div class="locations-list">
            @for (location of data.locations; track location.id) {
              <div class="location-row">
                <div>
                  <strong>{{ location.name }}</strong>
                  <p>{{ matchesByLocation.get(location.id) ?? 0 }} partidas</p>
                </div>
                <div class="location-row__actions">
                  <ion-button fill="clear" (click)="beginEditLocation(location)">
                    <ion-icon name="create-outline"></ion-icon>
                  </ion-button>
                  <ion-button fill="clear" color="danger" (click)="deleteLocation.emit(location.id)">
                    <ion-icon name="trash-outline"></ion-icon>
                  </ion-button>
                </div>
              </div>
            }
          </div>
        </div>
      </section>
    </main>
  `
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
