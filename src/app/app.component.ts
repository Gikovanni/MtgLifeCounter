import { Component, ViewChild, inject } from '@angular/core';
import { AlertController, IonButton, IonContent, IonIcon, IonSpinner } from '@ionic/angular/standalone';
import { AppStateService } from './core/services/match.service';
import { DataModalComponent, FinishModalComponent, HistoryModalComponent, SettingsModalComponent } from './app-modals.component';
import { PlayerCardComponent } from './shared/components/player-life-card/player-life-card.component';
import { SetupScreenComponent } from './features/match/pages/match-setup/match-setup.component';
import type { ActiveMatch, MatchSettings, Player } from './core/models/app-data.model';

type PanelName = 'history' | 'data' | 'finish' | 'settings' | null;

const layoutClassMap: Record<number, string[]> = {
  2: ['arena-player--two-top', 'arena-player--two-bottom'],
  3: ['arena-player--three-top', 'arena-player--three-left', 'arena-player--three-right'],
  4: ['arena-player--quad-a', 'arena-player--quad-b', 'arena-player--quad-c', 'arena-player--quad-d'],
  5: [
    'arena-player--five-top',
    'arena-player--five-upper-left',
    'arena-player--five-upper-right',
    'arena-player--five-lower-left',
    'arena-player--five-lower-right'
  ],
  6: [
    'arena-player--six-top',
    'arena-player--six-upper-left',
    'arena-player--six-upper-right',
    'arena-player--six-lower-left',
    'arena-player--six-lower-right',
    'arena-player--six-bottom'
  ]
};

const orientationClassMap: Record<number, string[]> = {
  2: ['arena-player__inner--top', 'arena-player__inner--bottom'],
  3: ['arena-player__inner--top', 'arena-player__inner--left', 'arena-player__inner--right'],
  4: [
    'arena-player__inner--top-left',
    'arena-player__inner--top-right',
    'arena-player__inner--bottom-left',
    'arena-player__inner--bottom-right'
  ],
  5: [
    'arena-player__inner--top',
    'arena-player__inner--left',
    'arena-player__inner--right',
    'arena-player__inner--bottom-left',
    'arena-player__inner--bottom-right'
  ],
  6: [
    'arena-player__inner--top',
    'arena-player__inner--top',
    'arena-player__inner--top',
    'arena-player__inner--bottom',
    'arena-player__inner--bottom',
    'arena-player__inner--bottom'
  ]
};

const readImageFile = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ''));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    IonButton,
    IonContent,
    IonIcon,
    IonSpinner,
    DataModalComponent,
    FinishModalComponent,
    HistoryModalComponent,
    PlayerCardComponent,
    SettingsModalComponent,
    SetupScreenComponent
  ],
  templateUrl: './app.component.html'
})
export class AppComponent {
  readonly state = inject(AppStateService);
  private readonly alertController = inject(AlertController);
  activePanel: PanelName = null;
  dismissedAutoFinishKey: string | null = null;
  @ViewChild('dataModal') dataModal?: DataModalComponent;

  data() {
    return this.state.data();
  }

  currentLocationName() {
    const data = this.data();
    const locationId = data.activeMatch?.locationId;
    return data.locations.find((location) => location.id === locationId)?.name ?? 'Sem local';
  }

  playerLayoutClass(index: number) {
    const playerCount = this.data().activeMatch?.players.length ?? 4;
    return (layoutClassMap[playerCount] ?? layoutClassMap[4])[index] ?? '';
  }

  playerOrientationClass(index: number) {
    const playerCount = this.data().activeMatch?.players.length ?? 4;
    return (orientationClassMap[playerCount] ?? orientationClassMap[4])[index] ?? '';
  }

  async confirmStartNewMatch() {
    const alert = await this.alertController.create({
      header: 'Nova partida',
      message: 'Voltar para a tela inicial encerra a partida em andamento sem salvar vencedor.',
      buttons: [
        'Cancelar',
        {
          text: 'Voltar',
          role: 'destructive',
          handler: () => this.state.clearActiveMatch()
        }
      ]
    });
    await alert.present();
  }

  async confirmReset() {
    const alert = await this.alertController.create({
      header: 'Resetar partida',
      message: 'As vidas e o historico em tempo real serao reiniciados.',
      buttons: ['Cancelar', { text: 'Resetar', role: 'destructive', handler: () => this.state.resetActiveMatch() }]
    });
    await alert.present();
  }

  handleLifeChange(player: Player, delta: number) {
    const activeMatch = this.data().activeMatch;

    if (!activeMatch) {
      return;
    }

    const projectedPlayers = activeMatch.players.map((item) =>
      item.id === player.id ? { ...item, life: item.life + delta } : item
    );
    const positivePlayers = projectedPlayers.filter((item) => item.life > 0);
    const changedPlayer = projectedPlayers.find((item) => item.id === player.id);
    const autoFinishKey = `${activeMatch.id}:${projectedPlayers.map((item) => `${item.id}:${item.life}`).join('|')}`;

    this.state.updatePlayerLife(player.id, delta);

    if (
      positivePlayers.length === 1 &&
      changedPlayer?.life !== undefined &&
      changedPlayer.life <= 0 &&
      autoFinishKey !== this.dismissedAutoFinishKey
    ) {
      void this.presentAutoFinishAlert(activeMatch, positivePlayers[0], autoFinishKey);
    }
  }

  async handleBackgroundImage(playerId: string, file: File) {
    const dataUrl = await readImageFile(file);
    this.state.updatePlayerBackground(playerId, dataUrl);
  }

  async handleImportJsonFile(file: File) {
    const result = await this.state.importJsonFile(file);
    this.dataModal?.setStatus(result.message);

    if (result.ok) {
      this.activePanel = null;
    }
  }

  startMatchFromSettings(payload: MatchSettings) {
    this.state.startMatch(payload);
    this.activePanel = null;
  }

  private async presentAutoFinishAlert(activeMatch: ActiveMatch, winner: Player, autoFinishKey: string) {
    const alert = await this.alertController.create({
      header: 'Vitoria detectada',
      message: `${winner.name || 'Jogador'} e o ultimo jogador com vida positiva.`,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          handler: () => {
            this.dismissedAutoFinishKey = autoFinishKey;
          }
        },
        {
          text: 'Confirmar',
          handler: () => this.state.finishMatch(winner.id)
        }
      ]
    });

    if (this.data().activeMatch?.id === activeMatch.id) {
      await alert.present();
    }
  }
}
