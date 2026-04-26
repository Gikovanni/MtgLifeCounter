import { Component, ElementRef, EventEmitter, Input, OnChanges, Output, SimpleChanges, ViewChild } from '@angular/core';
import {
  IonButton,
  IonContent,
  IonInput,
  IonItem,
  IonLabel,
  IonList,
  IonModal,
  IonNote,
  IonSelect,
  IonSelectOption,
  IonTextarea
} from '@ionic/angular/standalone';
import { INITIAL_LIFE_OPTIONS, MAX_PLAYERS, MIN_PLAYERS } from '../core/constants';
import type { AppData, CompletedMatch, ThemeMode } from '../core/types';
import { formatDuration } from '../core/utils';

@Component({
  selector: 'app-settings-modal',
  standalone: true,
  imports: [IonButton, IonContent, IonInput, IonItem, IonLabel, IonList, IonModal, IonSelect, IonSelectOption, IonTextarea],
  template: `
    @if (data.activeMatch) {
      <ion-modal class="sheet-modal" [isOpen]="isOpen" (didDismiss)="dismiss.emit()" [initialBreakpoint]="0.95" [breakpoints]="[0, 0.95]">
        <ng-template>
          <ion-content class="sheet">
            <div class="sheet__content">
              <div class="sheet__header">
                <div>
                  <p class="sheet__eyebrow">Configuracoes</p>
                  <h2>Partida e locais</h2>
                </div>
                <ion-button fill="clear" (click)="dismiss.emit()">Fechar</ion-button>
              </div>

              <ion-list inset>
                <ion-item>
                  <ion-label>Vida inicial</ion-label>
                  <ion-select [value]="data.activeMatch.initialLife" interface="popover" (ionChange)="setInitialLife.emit(numberValue($event.detail.value))">
                    @for (option of initialLifeOptions; track option) {
                      <ion-select-option [value]="option">{{ option }}</ion-select-option>
                    }
                  </ion-select>
                </ion-item>
                <ion-item>
                  <ion-label>Local atual</ion-label>
                  <ion-select [value]="data.activeMatch.locationId ?? '__none__'" interface="popover" (ionChange)="setLocationValue($event.detail.value)">
                    <ion-select-option value="__none__">Sem local</ion-select-option>
                    @for (location of data.locations; track location.id) {
                      <ion-select-option [value]="location.id">{{ location.name }}</ion-select-option>
                    }
                  </ion-select>
                </ion-item>
              </ion-list>

              <section class="sheet__section">
                <div class="section-heading">
                  <h3>Jogadores</h3>
                  <ion-button fill="solid" class="add-player-button" (click)="addPlayer.emit()" [disabled]="data.activeMatch.players.length >= maxPlayers">
                    Adicionar jogador
                  </ion-button>
                </div>
                <div class="settings-players">
                  @for (player of data.activeMatch.players; track player.id) {
                    <div class="settings-player-row">
                      <span class="swatch" [style.background]="player.color"></span>
                      <span>{{ player.name }}</span>
                      <ion-button fill="clear" color="danger" [disabled]="data.activeMatch.players.length <= minPlayers" (click)="removePlayer.emit(player.id)">
                        Remover
                      </ion-button>
                    </div>
                  }
                </div>
              </section>

              <section class="sheet__section">
                <div class="section-heading">
                  <h3>Preferencias</h3>
                </div>
                <ion-list inset>
                  <ion-item>
                    <ion-label>Tema</ion-label>
                    <ion-select [value]="data.settings.themeMode" interface="popover" (ionChange)="setThemeMode.emit(themeValue($event.detail.value))">
                      <ion-select-option value="dark">Escuro</ion-select-option>
                      <ion-select-option value="light">Claro</ion-select-option>
                    </ion-select>
                  </ion-item>
                  <ion-item>
                    <ion-label>Vida padrao</ion-label>
                    <ion-select [value]="data.settings.defaultInitialLife" interface="popover" (ionChange)="saveSettings.emit({ defaultInitialLife: numberValue($event.detail.value), defaultPlayerCount: data.settings.defaultPlayerCount })">
                      @for (option of initialLifeOptions; track option) {
                        <ion-select-option [value]="option">{{ option }}</ion-select-option>
                      }
                    </ion-select>
                  </ion-item>
                  <ion-item>
                    <ion-label>Jogadores padrao</ion-label>
                    <ion-select [value]="data.settings.defaultPlayerCount" interface="popover" (ionChange)="saveSettings.emit({ defaultInitialLife: data.settings.defaultInitialLife, defaultPlayerCount: numberValue($event.detail.value) })">
                      @for (option of playerOptions; track option) {
                        <ion-select-option [value]="option">{{ option }}</ion-select-option>
                      }
                    </ion-select>
                  </ion-item>
                </ion-list>
              </section>

              <section class="sheet__section">
                <div class="section-heading">
                  <h3>Locais</h3>
                </div>
                <div class="locations-form">
                  <ion-input label="Nome" labelPlacement="stacked" [value]="locationName" (ionInput)="locationName = stringValue($event.detail.value)"></ion-input>
                  <ion-textarea label="Observacoes" labelPlacement="stacked" [value]="locationNotes" [autoGrow]="true" (ionInput)="locationNotes = stringValue($event.detail.value)"></ion-textarea>
                  <ion-button fill="solid" [disabled]="!locationName.trim()" (click)="saveNewLocation()">Salvar local</ion-button>
                </div>
                <div class="locations-list">
                  @for (location of data.locations; track location.id) {
                    <div class="location-row">
                      <div>
                        <strong>{{ location.name }}</strong>
                        @if (location.notes) {
                          <p>{{ location.notes }}</p>
                        }
                      </div>
                      <ion-button fill="clear" color="danger" (click)="deleteLocation.emit(location.id)">Excluir</ion-button>
                    </div>
                  }
                </div>
              </section>

              <section class="sheet__section">
                <ion-button expand="block" (click)="startCurrentSettings()">Iniciar nova partida</ion-button>
              </section>
            </div>
          </ion-content>
        </ng-template>
      </ion-modal>
    }
  `
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

@Component({
  selector: 'app-history-modal',
  standalone: true,
  imports: [IonButton, IonContent, IonItem, IonLabel, IonList, IonModal, IonNote, IonSelect, IonSelectOption],
  template: `
    <ion-modal class="sheet-modal" [isOpen]="isOpen" (didDismiss)="dismiss.emit()" [initialBreakpoint]="0.95" [breakpoints]="[0, 0.95]">
      <ng-template>
        <ion-content class="sheet">
          <div class="sheet__content">
            <div class="sheet__header">
              <div>
                <p class="sheet__eyebrow">Historico</p>
                <h2>{{ showCompleted ? 'Partidas encerradas' : 'Alteracoes em tempo real' }}</h2>
              </div>
              <div class="sheet__header-actions">
                <ion-button [fill]="showCompleted ? 'solid' : 'outline'" (click)="showCompleted = !showCompleted">
                  {{ showCompleted ? 'Ver partida atual' : 'Ver partidas' }}
                </ion-button>
                <ion-button fill="clear" (click)="dismiss.emit()">Fechar</ion-button>
              </div>
            </div>

            @if (showCompleted) {
              <ion-list inset>
                <ion-item>
                  <ion-label>Filtrar por local</ion-label>
                  <ion-select [value]="selectedLocationId" interface="popover" (ionChange)="selectedLocationId = stringValue($event.detail.value)">
                    <ion-select-option value="__all__">Todos</ion-select-option>
                    @for (location of data.locations; track location.id) {
                      <ion-select-option [value]="location.id">{{ location.name }}</ion-select-option>
                    }
                  </ion-select>
                </ion-item>
              </ion-list>
              <div class="history-list">
                @for (match of filteredMatches(); track match.id) {
                  <article class="completed-match-card">
                    <div class="completed-match-card__header">
                      <strong>{{ winnerName(match) }}</strong>
                      <span>{{ dateLabel(match.endedAt) }}</span>
                    </div>
                    <p>{{ locationName(match.locationId) }}</p>
                    <small>{{ durationLabel(match.durationMs) }}</small>
                    <div class="completed-match-card__players">
                      @for (player of match.players; track player.id) {
                        <span>{{ player.name }}</span>
                      }
                    </div>
                  </article>
                }
                @if (filteredMatches().length === 0) {
                  <ion-note>Nenhuma partida encontrada.</ion-note>
                }
              </div>
            } @else {
              <div class="history-list">
                @for (event of activeEvents(); track event.id) {
                  <div class="history-row">
                    <strong>{{ playerName(event.playerId) }}</strong>
                    <span>{{ event.delta > 0 ? '+' + event.delta : event.delta }}</span>
                    <small>{{ event.previousLife }} -> {{ event.nextLife }} at {{ timeLabel(event.timestamp) }}</small>
                  </div>
                }
                @if (!data.activeMatch || data.activeMatch.events.length === 0) {
                  <ion-note>Sem alteracoes registradas nesta partida.</ion-note>
                }
              </div>
            }
          </div>
        </ion-content>
      </ng-template>
    </ion-modal>
  `
})
export class HistoryModalComponent implements OnChanges {
  @Input({ required: true }) isOpen = false;
  @Input({ required: true }) data!: AppData;
  @Output() dismiss = new EventEmitter<void>();

  showCompleted = false;
  selectedLocationId = '__all__';
  private locationMap = new Map<string, string>();

  ngOnChanges(changes: SimpleChanges) {
    if (changes['data']) {
      this.locationMap = new Map(this.data.locations.map((location) => [location.id, location.name]));
    }
  }

  stringValue(value: unknown) {
    return String(value ?? '');
  }

  filteredMatches() {
    if (this.selectedLocationId === '__all__') {
      return this.data.matchHistory;
    }

    return this.data.matchHistory.filter((match) => match.locationId === this.selectedLocationId);
  }

  activeEvents() {
    return this.data.activeMatch?.events.slice().reverse() ?? [];
  }

  playerName(playerId: string) {
    return this.data.activeMatch?.players.find((player) => player.id === playerId)?.name ?? 'Jogador';
  }

  winnerName(match: CompletedMatch) {
    return match.players.find((player) => player.id === match.winnerPlayerId)?.name ?? 'Sem vencedor';
  }

  locationName(locationId: string | null) {
    return locationId ? this.locationMap.get(locationId) ?? 'Sem local' : 'Sem local';
  }

  dateLabel(value: string) {
    return new Date(value).toLocaleDateString('pt-BR');
  }

  timeLabel(value: string) {
    return new Date(value).toLocaleTimeString('pt-BR');
  }

  durationLabel(value: number) {
    return formatDuration(value);
  }
}

@Component({
  selector: 'app-data-modal',
  standalone: true,
  imports: [IonButton, IonContent, IonModal, IonNote],
  template: `
    <ion-modal class="sheet-modal" [isOpen]="isOpen" (didDismiss)="dismiss.emit()" [initialBreakpoint]="0.7" [breakpoints]="[0, 0.7, 0.95]">
      <ng-template>
        <ion-content class="sheet">
          <div class="sheet__content">
            <div class="sheet__header">
              <div>
                <p class="sheet__eyebrow">Dados</p>
                <h2>Backup e exportacao</h2>
              </div>
              <ion-button fill="clear" (click)="dismiss.emit()">Fechar</ion-button>
            </div>

            <div class="data-actions">
              <ion-button expand="block" (click)="exportJson.emit()">Exportar JSON</ion-button>
              <ion-button expand="block" fill="outline" (click)="exportCsv.emit()">Exportar CSV</ion-button>
              <ion-button expand="block" fill="solid" color="secondary" (click)="fileInput.click()">Importar backup JSON</ion-button>
              <input #fileInput type="file" accept="application/json" hidden (change)="handleFile($event)" />
              @if (status) {
                <ion-note>{{ status }}</ion-note>
              }
            </div>
          </div>
        </ion-content>
      </ng-template>
    </ion-modal>
  `
})
export class DataModalComponent {
  @Input({ required: true }) isOpen = false;
  @Output() dismiss = new EventEmitter<void>();
  @Output() exportJson = new EventEmitter<void>();
  @Output() exportCsv = new EventEmitter<void>();
  @Output() importJsonFile = new EventEmitter<File>();
  @ViewChild('fileInput', { static: true }) fileInput!: ElementRef<HTMLInputElement>;
  status = '';

  handleFile(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (file) {
      this.importJsonFile.emit(file);
    }

    input.value = '';
  }

  setStatus(status: string) {
    this.status = status;
  }
}

@Component({
  selector: 'app-finish-modal',
  standalone: true,
  imports: [IonButton, IonContent, IonItem, IonLabel, IonList, IonModal, IonSelect, IonSelectOption],
  template: `
    @if (data.activeMatch) {
      <ion-modal class="sheet-modal" [isOpen]="isOpen" (didDismiss)="dismiss.emit()" [initialBreakpoint]="0.55" [breakpoints]="[0, 0.55]">
        <ng-template>
          <ion-content class="sheet">
            <div class="sheet__content">
              <div class="sheet__header">
                <div>
                  <p class="sheet__eyebrow">Finalizar</p>
                  <h2>Encerrar partida atual</h2>
                </div>
                <ion-button fill="clear" (click)="dismiss.emit()">Fechar</ion-button>
              </div>

              <ion-list inset>
                <ion-item>
                  <ion-label>Vencedor</ion-label>
                  <ion-select [value]="winnerPlayerId" interface="popover" (ionChange)="winnerPlayerId = stringValue($event.detail.value)">
                    @for (player of data.activeMatch.players; track player.id) {
                      <ion-select-option [value]="player.id">{{ player.name }}</ion-select-option>
                    }
                  </ion-select>
                </ion-item>
              </ion-list>
              <ion-button expand="block" color="secondary" (click)="saveResult()">Salvar resultado</ion-button>
            </div>
          </ion-content>
        </ng-template>
      </ion-modal>
    }
  `
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
