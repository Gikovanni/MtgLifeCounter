import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { IonButton, IonContent, IonItem, IonLabel, IonList, IonModal, IonNote, IonSelect, IonSelectOption } from '@ionic/angular/standalone';
import type { AppData, CompletedMatch } from '../../../../core/models/app-data.model';
import { formatDuration } from '../../../../core/utils/match.util';

@Component({
  selector: 'app-history-modal',
  standalone: true,
  imports: [IonButton, IonContent, IonItem, IonLabel, IonList, IonModal, IonNote, IonSelect, IonSelectOption],
  templateUrl: './match-history-modal.component.html'
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
