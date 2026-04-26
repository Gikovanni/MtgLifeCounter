import { Component, ViewChild, inject } from '@angular/core';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { AlertController, IonContent, IonSpinner } from '@ionic/angular/standalone';
import { AppStateService } from './core/services/match.service';
import { DataModalComponent, FinishModalComponent, HistoryModalComponent, SettingsModalComponent } from './app-modals.component';
import { DiceRollDialogComponent } from './features/match/components/dice-roll-dialog/dice-roll-dialog.component';
import { MatchMenuAction, MatchMenuBottomSheetComponent } from './features/match/components/match-menu-bottom-sheet/match-menu-bottom-sheet.component';
import { PlayerCardComponent } from './shared/components/player-life-card/player-life-card.component';
import { SetupScreenComponent } from './features/match/pages/match-setup/match-setup.component';
import type { ActiveMatch, MatchSettings, Player } from './core/models/app-data.model';

type PanelName = 'history' | 'data' | 'finish' | 'settings' | null;

interface PendingLifeChange {
  matchId: string;
  playerId: string;
  previousLife: number;
  nextLife: number;
  timeoutId: ReturnType<typeof window.setTimeout>;
}

const LIFE_HISTORY_DEBOUNCE_MS = 5000;

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
    IonContent,
    IonSpinner,
    MatButtonModule,
    MatIconModule,
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
  private readonly bottomSheet = inject(MatBottomSheet);
  private readonly dialog = inject(MatDialog);
  activePanel: PanelName = null;
  dismissedAutoFinishKey: string | null = null;
  private readonly pendingLifeChanges = new Map<string, PendingLifeChange>();
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

  pendingLifeDelta(playerId: string) {
    const pending = this.pendingLifeChanges.get(playerId);

    if (!pending) {
      return 0;
    }

    return pending.nextLife - pending.previousLife;
  }

  openMatchMenu() {
    const sheetRef = this.bottomSheet.open<MatchMenuBottomSheetComponent, unknown, MatchMenuAction>(
      MatchMenuBottomSheetComponent,
      {
        panelClass: 'match-menu-sheet',
        data: {
          duration: this.state.matchDurationLabel(),
          location: this.currentLocationName()
        }
      }
    );

    sheetRef.afterDismissed().subscribe((action) => {
      if (!action) {
        return;
      }

      this.handleMenuAction(action);
    });
  }

  private handleMenuAction(action: MatchMenuAction) {
    if (action === 'reset') {
      void this.confirmReset();
      return;
    }

    if (action === 'newMatch') {
      void this.confirmStartNewMatch();
      return;
    }

    if (action === 'dice') {
      this.openDiceDialog();
      return;
    }

    this.activePanel = action;
  }

  private openDiceDialog() {
    this.dialog.open(DiceRollDialogComponent, {
      panelClass: 'dice-dialog-panel',
      width: 'min(360px, calc(100vw - 32px))'
    });
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
          handler: () => {
            this.flushPendingLifeChanges();
            this.state.clearActiveMatch();
          }
        }
      ]
    });
    await alert.present();
  }

  async confirmReset() {
    const alert = await this.alertController.create({
      header: 'Resetar partida',
      message: 'As vidas e o historico em tempo real serao reiniciados.',
      buttons: [
        'Cancelar',
        {
          text: 'Resetar',
          role: 'destructive',
          handler: () => {
            this.clearPendingLifeChanges();
            this.state.resetActiveMatch();
          }
        }
      ]
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

    this.queueLifeChange(activeMatch.id, player, delta);
    this.state.updatePlayerLife(player.id, delta, false);

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
    this.flushPendingLifeChanges();
    this.state.startMatch(payload);
    this.activePanel = null;
  }

  finishMatch(winnerPlayerId: string) {
    this.flushPendingLifeChanges();
    this.state.finishMatch(winnerPlayerId);
  }

  private queueLifeChange(matchId: string, player: Player, delta: number) {
    const existing = this.pendingLifeChanges.get(player.id);
    const pending: PendingLifeChange = existing
      ? {
          ...existing,
          nextLife: existing.nextLife + delta
        }
      : {
          matchId,
          playerId: player.id,
          previousLife: player.life,
          nextLife: player.life + delta,
          timeoutId: 0
        };

    if (existing) {
      window.clearTimeout(existing.timeoutId);
    }

    pending.timeoutId = window.setTimeout(() => {
      this.flushPendingLifeChange(player.id);
    }, LIFE_HISTORY_DEBOUNCE_MS);

    this.pendingLifeChanges.set(player.id, pending);
  }

  private flushPendingLifeChange(playerId: string) {
    const pending = this.pendingLifeChanges.get(playerId);

    if (!pending) {
      return;
    }

    window.clearTimeout(pending.timeoutId);
    this.pendingLifeChanges.delete(playerId);

    if (pending.previousLife === pending.nextLife || this.data().activeMatch?.id !== pending.matchId) {
      return;
    }

    this.state.recordPlayerLifeChange(pending.playerId, pending.previousLife, pending.nextLife);
  }

  private flushPendingLifeChanges() {
    Array.from(this.pendingLifeChanges.keys()).forEach((playerId) => {
      this.flushPendingLifeChange(playerId);
    });
  }

  private clearPendingLifeChanges() {
    this.pendingLifeChanges.forEach((pending) => {
      window.clearTimeout(pending.timeoutId);
    });
    this.pendingLifeChanges.clear();
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
          handler: () => {
            this.flushPendingLifeChanges();
            this.state.finishMatch(winner.id);
          }
        }
      ]
    });

    if (this.data().activeMatch?.id === activeMatch.id) {
      await alert.present();
    }
  }
}
