import { IonButton, IonIcon, IonSpinner, useIonAlert } from '@ionic/react';
import { flagOutline, folderOpenOutline, listOutline, refreshOutline, settingsOutline } from 'ionicons/icons';
import { useMemo, useState } from 'react';
import { useAppState } from '../../state/AppContext';
import { PlayerPanel } from './PlayerPanel';
import { DataModal, FinishModal, HistoryModal, SettingsModal } from './modals';
import { SetupScreen } from './SetupScreen';

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

const topbarActions = [
  { label: 'Historico', icon: listOutline, panel: 'history' },
  { label: 'Dados', icon: folderOpenOutline, panel: 'data' },
  { label: 'Finalizar', icon: flagOutline, panel: 'finish' },
  { label: 'Config.', icon: settingsOutline, panel: 'settings' }
] as const;

const readImageFile = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ''));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });

export const HomeScreen = () => {
  const [activePanel, setActivePanel] = useState<PanelName>(null);
  const [dismissedAutoFinishKey, setDismissedAutoFinishKey] = useState<string | null>(null);
  const [presentAlert] = useIonAlert();
  const {
    data,
    hydrated,
    matchDurationLabel,
    startMatch,
    updatePlayerLife,
    renamePlayer,
    updatePlayerBackground,
    addPlayer,
    removePlayer,
    setInitialLife,
    setLocation,
    resetActiveMatch,
    finishMatch,
    clearActiveMatch,
    saveLocation,
    deleteLocation,
    saveSettings,
    setThemeMode,
    exportJson,
    exportCsv,
    importJsonFile
  } = useAppState();

  const activeMatch = data.activeMatch;
  const currentLocation = useMemo(
    () => data.locations.find((location) => location.id === activeMatch?.locationId),
    [activeMatch?.locationId, data.locations]
  );

  const playerLayoutClasses = activeMatch
    ? layoutClassMap[activeMatch.players.length] ?? layoutClassMap[4]
    : layoutClassMap[4];
  const playerOrientationClasses = activeMatch
    ? orientationClassMap[activeMatch.players.length] ?? orientationClassMap[4]
    : orientationClassMap[4];

  const confirmStartNewMatch = () => {
    presentAlert({
      header: 'Nova partida',
      message: 'Voltar para a tela inicial encerra a partida em andamento sem salvar vencedor.',
      buttons: [
        'Cancelar',
        {
          text: 'Voltar',
          role: 'destructive',
          handler: clearActiveMatch
        }
      ]
    });
  };

  const confirmReset = () => {
    presentAlert({
      header: 'Resetar partida',
      message: 'As vidas e o historico em tempo real serao reiniciados.',
      buttons: ['Cancelar', { text: 'Resetar', role: 'destructive', handler: resetActiveMatch }]
    });
  };

  const handleLifeChange = (playerId: string, delta: number) => {
    if (!activeMatch) {
      return;
    }

    const projectedPlayers = activeMatch.players.map((player) =>
      player.id === playerId ? { ...player, life: player.life + delta } : player
    );
    const positivePlayers = projectedPlayers.filter((player) => player.life > 0);
    const changedPlayer = projectedPlayers.find((player) => player.id === playerId);
    const autoFinishKey = `${activeMatch.id}:${projectedPlayers
      .map((player) => `${player.id}:${player.life}`)
      .join('|')}`;

    updatePlayerLife(playerId, delta);

    if (
      positivePlayers.length === 1 &&
      changedPlayer?.life !== undefined &&
      changedPlayer.life <= 0 &&
      autoFinishKey !== dismissedAutoFinishKey
    ) {
      const winner = positivePlayers[0];
      presentAlert({
        header: 'Vitoria detectada',
        message: `${winner.name || 'Jogador'} e o ultimo jogador com vida positiva.`,
        buttons: [
          {
            text: 'Cancelar',
            role: 'cancel',
            handler: () => setDismissedAutoFinishKey(autoFinishKey)
          },
          {
            text: 'Confirmar',
            handler: () => finishMatch(winner.id)
          }
        ]
      });
    }
  };

  const handleBackgroundImage = async (playerId: string, file: File) => {
    const dataUrl = await readImageFile(file);
    updatePlayerBackground(playerId, dataUrl);
  };

  if (!hydrated) {
    return (
      <div className="app-loading">
        <IonSpinner name="crescent" />
      </div>
    );
  }

  if (!activeMatch) {
    return (
      <SetupScreen
        data={data}
        onStartMatch={startMatch}
        onSaveLocation={saveLocation}
        onDeleteLocation={deleteLocation}
      />
    );
  }

  return (
    <>
      <main className={`app-shell players-${activeMatch.players.length}`}>
        <header className="topbar">
          <div>
            <p className="topbar__eyebrow">Magic Life Counter</p>
            <h1>Partida ativa</h1>
          </div>
          <div className="topbar__side">
            <div className="topbar__stats">
              <div className="stat-pill">
                <span>Tempo</span>
                <strong>{matchDurationLabel}</strong>
              </div>
              <div className="stat-pill">
                <span>Local</span>
                <strong>{currentLocation?.name ?? 'Sem local'}</strong>
              </div>
            </div>
            <div className="topbar__actions" aria-label="Acoes da partida">
              {topbarActions.map((action) => (
                <IonButton
                  key={action.panel}
                  fill="outline"
                  size="small"
                  className="topbar-action"
                  onClick={() => setActivePanel(action.panel)}
                >
                  <IonIcon icon={action.icon} slot="start" />
                  {action.label}
                </IonButton>
              ))}
              <IonButton fill="outline" size="small" className="topbar-action" onClick={confirmReset}>
                <IonIcon icon={refreshOutline} slot="start" />
                Resetar
              </IonButton>
            </div>
          </div>
        </header>

        <section className="arena">
          {activeMatch.players.map((player, index) => (
            <PlayerPanel
              key={player.id}
              player={player}
              layoutClassName={playerLayoutClasses[index]}
              orientationClassName={playerOrientationClasses[index]}
              onRename={renamePlayer}
              onLifeChange={handleLifeChange}
              onBackgroundImage={handleBackgroundImage}
            />
          ))}

        </section>

        <footer className="quick-actions">
          <IonButton fill="outline" onClick={confirmStartNewMatch}>
            Nova partida
          </IonButton>
        </footer>
      </main>

      <HistoryModal isOpen={activePanel === 'history'} onDismiss={() => setActivePanel(null)} data={data} />
      <DataModal
        isOpen={activePanel === 'data'}
        onDismiss={() => setActivePanel(null)}
        onExportJson={exportJson}
        onExportCsv={exportCsv}
        onImportJsonFile={async (file) => {
          const result = await importJsonFile(file);
          if (result.ok) {
            setActivePanel(null);
          }
          return result;
        }}
      />
      <FinishModal
        isOpen={activePanel === 'finish'}
        onDismiss={() => setActivePanel(null)}
        data={data}
        onFinish={finishMatch}
      />
      <SettingsModal
        isOpen={activePanel === 'settings'}
        onDismiss={() => setActivePanel(null)}
        data={data}
        onSetInitialLife={setInitialLife}
        onSetLocation={setLocation}
        onSaveSettings={saveSettings}
        onSetThemeMode={setThemeMode}
        onAddPlayer={addPlayer}
        onRemovePlayer={removePlayer}
        onSaveLocation={saveLocation}
        onDeleteLocation={deleteLocation}
        onStartMatch={(payload) => {
          startMatch(payload);
          setActivePanel(null);
        }}
      />
    </>
  );
};
