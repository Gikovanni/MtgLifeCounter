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
} from '@ionic/react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { INITIAL_LIFE_OPTIONS, MAX_PLAYERS, MIN_PLAYERS } from '../../core/constants';
import type { AppData, CompletedMatch, ThemeMode } from '../../core/types';
import { formatDuration } from '../../core/utils';

interface BaseModalProps {
  isOpen: boolean;
  onDismiss: () => void;
}

interface SettingsModalProps extends BaseModalProps {
  data: AppData;
  onSetInitialLife: (initialLife: number) => void;
  onSetLocation: (locationId: string | null) => void;
  onSaveSettings: (payload: { defaultInitialLife: number; defaultPlayerCount: number }) => void;
  onSetThemeMode: (themeMode: ThemeMode) => void;
  onAddPlayer: () => void;
  onRemovePlayer: (playerId: string) => void;
  onSaveLocation: (payload: { id?: string; name: string; notes: string }) => void;
  onDeleteLocation: (locationId: string) => void;
  onStartMatch: (payload: { initialLife: number; playerCount: number; locationId: string | null }) => void;
}

export const SettingsModal = ({
  isOpen,
  onDismiss,
  data,
  onSetInitialLife,
  onSetLocation,
  onSaveSettings,
  onSetThemeMode,
  onAddPlayer,
  onRemovePlayer,
  onSaveLocation,
  onDeleteLocation,
  onStartMatch
}: SettingsModalProps) => {
  const [locationName, setLocationName] = useState('');
  const [locationNotes, setLocationNotes] = useState('');
  const activeMatch = data.activeMatch;

  if (!activeMatch) {
    return null;
  }

  return (
    <IonModal className="sheet-modal" isOpen={isOpen} onDidDismiss={onDismiss} initialBreakpoint={0.95} breakpoints={[0, 0.95]}>
      <IonContent className="sheet">
        <div className="sheet__content">
          <div className="sheet__header">
            <div>
              <p className="sheet__eyebrow">Configuracoes</p>
              <h2>Partida e locais</h2>
            </div>
            <IonButton fill="clear" onClick={onDismiss}>
              Fechar
            </IonButton>
          </div>

          <IonList inset>
            <IonItem>
              <IonLabel>Vida inicial</IonLabel>
              <IonSelect
                value={activeMatch.initialLife}
                interface="popover"
                onIonChange={(event) => onSetInitialLife(Number(event.detail.value))}
              >
                {INITIAL_LIFE_OPTIONS.map((option) => (
                  <IonSelectOption key={option} value={option}>
                    {option}
                  </IonSelectOption>
                ))}
              </IonSelect>
            </IonItem>
            <IonItem>
              <IonLabel>Local atual</IonLabel>
              <IonSelect
                value={activeMatch.locationId ?? '__none__'}
                interface="popover"
                onIonChange={(event) =>
                  onSetLocation(event.detail.value === '__none__' ? null : String(event.detail.value))
                }
              >
                <IonSelectOption value="__none__">Sem local</IonSelectOption>
                {data.locations.map((location) => (
                  <IonSelectOption key={location.id} value={location.id}>
                    {location.name}
                  </IonSelectOption>
                ))}
              </IonSelect>
            </IonItem>
          </IonList>

          <section className="sheet__section">
            <div className="section-heading">
              <h3>Jogadores</h3>
              <IonButton
                fill="solid"
                className="add-player-button"
                onClick={onAddPlayer}
                disabled={activeMatch.players.length >= MAX_PLAYERS}
              >
                Adicionar jogador
              </IonButton>
            </div>
            <div className="settings-players">
              {activeMatch.players.map((player) => (
                <div key={player.id} className="settings-player-row">
                  <span className="swatch" style={{ background: player.color }} />
                  <span>{player.name}</span>
                  <IonButton
                    fill="clear"
                    color="danger"
                    disabled={activeMatch.players.length <= MIN_PLAYERS}
                    onClick={() => onRemovePlayer(player.id)}
                  >
                    Remover
                  </IonButton>
                </div>
              ))}
            </div>
          </section>

          <section className="sheet__section">
            <div className="section-heading">
              <h3>Preferencias</h3>
            </div>
            <IonList inset>
              <IonItem>
                <IonLabel>Tema</IonLabel>
                <IonSelect
                  value={data.settings.themeMode}
                  interface="popover"
                  onIonChange={(event) => onSetThemeMode(event.detail.value as ThemeMode)}
                >
                  <IonSelectOption value="dark">Escuro</IonSelectOption>
                  <IonSelectOption value="light">Claro</IonSelectOption>
                </IonSelect>
              </IonItem>
              <IonItem>
                <IonLabel>Vida padrao</IonLabel>
                <IonSelect
                  value={data.settings.defaultInitialLife}
                  interface="popover"
                  onIonChange={(event) =>
                    onSaveSettings({
                      defaultInitialLife: Number(event.detail.value),
                      defaultPlayerCount: data.settings.defaultPlayerCount
                    })
                  }
                >
                  {INITIAL_LIFE_OPTIONS.map((option) => (
                    <IonSelectOption key={option} value={option}>
                      {option}
                    </IonSelectOption>
                  ))}
                </IonSelect>
              </IonItem>
              <IonItem>
                <IonLabel>Jogadores padrao</IonLabel>
                <IonSelect
                  value={data.settings.defaultPlayerCount}
                  interface="popover"
                  onIonChange={(event) =>
                    onSaveSettings({
                      defaultInitialLife: data.settings.defaultInitialLife,
                      defaultPlayerCount: Number(event.detail.value)
                    })
                  }
                >
                  {[2, 3, 4, 5, 6].map((option) => (
                    <IonSelectOption key={option} value={option}>
                      {option}
                    </IonSelectOption>
                  ))}
                </IonSelect>
              </IonItem>
            </IonList>
          </section>

          <section className="sheet__section">
            <div className="section-heading">
              <h3>Locais</h3>
            </div>
            <div className="locations-form">
              <IonInput
                label="Nome"
                labelPlacement="stacked"
                value={locationName}
                onIonInput={(event) => setLocationName(String(event.detail.value ?? ''))}
              />
              <IonTextarea
                label="Observacoes"
                labelPlacement="stacked"
                value={locationNotes}
                autoGrow
                onIonInput={(event) => setLocationNotes(String(event.detail.value ?? ''))}
              />
              <IonButton
                fill="solid"
                disabled={!locationName.trim()}
                onClick={() => {
                  onSaveLocation({ name: locationName.trim(), notes: locationNotes.trim() });
                  setLocationName('');
                  setLocationNotes('');
                }}
              >
                Salvar local
              </IonButton>
            </div>
            <div className="locations-list">
              {data.locations.map((location) => (
                <div key={location.id} className="location-row">
                  <div>
                    <strong>{location.name}</strong>
                    {location.notes ? <p>{location.notes}</p> : null}
                  </div>
                  <IonButton fill="clear" color="danger" onClick={() => onDeleteLocation(location.id)}>
                    Excluir
                  </IonButton>
                </div>
              ))}
            </div>
          </section>

          <section className="sheet__section">
            <IonButton
              expand="block"
              onClick={() =>
                onStartMatch({
                  initialLife: activeMatch.initialLife,
                  playerCount: activeMatch.players.length,
                  locationId: activeMatch.locationId
                })
              }
            >
              Iniciar nova partida
            </IonButton>
          </section>
        </div>
      </IonContent>
    </IonModal>
  );
};

interface HistoryModalProps extends BaseModalProps {
  data: AppData;
}

export const HistoryModal = ({ isOpen, onDismiss, data }: HistoryModalProps) => {
  const [showCompleted, setShowCompleted] = useState(false);
  const [selectedLocationId, setSelectedLocationId] = useState('__all__');
  const activeMatch = data.activeMatch;

  const filteredMatches = useMemo(() => {
    if (selectedLocationId === '__all__') {
      return data.matchHistory;
    }

    return data.matchHistory.filter((match) => match.locationId === selectedLocationId);
  }, [data.matchHistory, selectedLocationId]);

  const locationMap = useMemo(
    () => new Map(data.locations.map((location) => [location.id, location.name])),
    [data.locations]
  );

  return (
    <IonModal className="sheet-modal" isOpen={isOpen} onDidDismiss={onDismiss} initialBreakpoint={0.95} breakpoints={[0, 0.95]}>
      <IonContent className="sheet">
        <div className="sheet__content">
          <div className="sheet__header">
            <div>
              <p className="sheet__eyebrow">Historico</p>
              <h2>{showCompleted ? 'Partidas encerradas' : 'Alteracoes em tempo real'}</h2>
            </div>
            <div className="sheet__header-actions">
              <IonButton fill={showCompleted ? 'solid' : 'outline'} onClick={() => setShowCompleted((value) => !value)}>
                {showCompleted ? 'Ver partida atual' : 'Ver partidas'}
              </IonButton>
              <IonButton fill="clear" onClick={onDismiss}>
                Fechar
              </IonButton>
            </div>
          </div>

          {showCompleted ? (
            <>
              <IonList inset>
                <IonItem>
                  <IonLabel>Filtrar por local</IonLabel>
                  <IonSelect
                    value={selectedLocationId}
                    interface="popover"
                    onIonChange={(event) => setSelectedLocationId(String(event.detail.value))}
                  >
                    <IonSelectOption value="__all__">Todos</IonSelectOption>
                    {data.locations.map((location) => (
                      <IonSelectOption key={location.id} value={location.id}>
                        {location.name}
                      </IonSelectOption>
                    ))}
                  </IonSelect>
                </IonItem>
              </IonList>
              <div className="history-list">
                {filteredMatches.map((match) => (
                  <CompletedMatchCard key={match.id} match={match} locationName={locationMap.get(match.locationId ?? '')} />
                ))}
                {filteredMatches.length === 0 ? <IonNote>Nenhuma partida encontrada.</IonNote> : null}
              </div>
            </>
          ) : (
            <div className="history-list">
              {activeMatch?.events
                .slice()
                .reverse()
                .map((event) => {
                  const player = activeMatch.players.find((item) => item.id === event.playerId);
                  return (
                    <div key={event.id} className="history-row">
                      <strong>{player?.name ?? 'Jogador'}</strong>
                      <span>{event.delta > 0 ? `+${event.delta}` : event.delta}</span>
                      <small>
                        {event.previousLife} {'->'} {event.nextLife} at{' '}
                        {new Date(event.timestamp).toLocaleTimeString('pt-BR')}
                      </small>
                    </div>
                  );
                })}
              {!activeMatch || activeMatch.events.length === 0 ? <IonNote>Sem alteracoes registradas nesta partida.</IonNote> : null}
            </div>
          )}
        </div>
      </IonContent>
    </IonModal>
  );
};

const CompletedMatchCard = ({
  match,
  locationName
}: {
  match: CompletedMatch;
  locationName?: string;
}) => {
  const winner = match.players.find((player) => player.id === match.winnerPlayerId);

  return (
    <article className="completed-match-card">
      <div className="completed-match-card__header">
        <strong>{winner?.name ?? 'Sem vencedor'}</strong>
        <span>{new Date(match.endedAt).toLocaleDateString('pt-BR')}</span>
      </div>
      <p>{locationName || 'Sem local'}</p>
      <small>{formatDuration(match.durationMs)}</small>
      <div className="completed-match-card__players">
        {match.players.map((player) => (
          <span key={player.id}>{player.name}</span>
        ))}
      </div>
    </article>
  );
};

interface DataModalProps extends BaseModalProps {
  onExportJson: () => Promise<void>;
  onExportCsv: () => Promise<void>;
  onImportJsonFile: (file: File) => Promise<{ ok: boolean; message: string }>;
}

export const DataModal = ({ isOpen, onDismiss, onExportJson, onExportCsv, onImportJsonFile }: DataModalProps) => {
  const [status, setStatus] = useState('');
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  return (
    <IonModal className="sheet-modal" isOpen={isOpen} onDidDismiss={onDismiss} initialBreakpoint={0.7} breakpoints={[0, 0.7, 0.95]}>
      <IonContent className="sheet">
        <div className="sheet__content">
          <div className="sheet__header">
            <div>
              <p className="sheet__eyebrow">Dados</p>
              <h2>Backup e exportacao</h2>
            </div>
            <IonButton fill="clear" onClick={onDismiss}>
              Fechar
            </IonButton>
          </div>

          <div className="data-actions">
            <IonButton expand="block" onClick={() => void onExportJson()}>
              Exportar JSON
            </IonButton>
            <IonButton expand="block" fill="outline" onClick={() => void onExportCsv()}>
              Exportar CSV
            </IonButton>
            <IonButton expand="block" fill="solid" color="secondary" onClick={() => fileInputRef.current?.click()}>
              Importar backup JSON
            </IonButton>
            <input
              ref={fileInputRef}
              type="file"
              accept="application/json"
              hidden
              onChange={async (event) => {
                const file = event.target.files?.[0];
                if (!file) {
                  return;
                }

                const result = await onImportJsonFile(file);
                setStatus(result.message);
                event.target.value = '';
              }}
            />
            {status ? <IonNote>{status}</IonNote> : null}
          </div>
        </div>
      </IonContent>
    </IonModal>
  );
};

interface FinishModalProps extends BaseModalProps {
  data: AppData;
  onFinish: (winnerPlayerId: string) => void;
}

export const FinishModal = ({ isOpen, onDismiss, data, onFinish }: FinishModalProps) => {
  const activeMatch = data.activeMatch;
  const [winnerPlayerId, setWinnerPlayerId] = useState(activeMatch?.players[0]?.id ?? '');

  useEffect(() => {
    if (isOpen) {
      setWinnerPlayerId(activeMatch?.players[0]?.id ?? '');
    }
  }, [activeMatch?.players, isOpen]);

  if (!activeMatch) {
    return null;
  }

  return (
    <IonModal className="sheet-modal" isOpen={isOpen} onDidDismiss={onDismiss} initialBreakpoint={0.55} breakpoints={[0, 0.55]}>
      <IonContent className="sheet">
        <div className="sheet__content">
          <div className="sheet__header">
            <div>
              <p className="sheet__eyebrow">Finalizar</p>
              <h2>Encerrar partida atual</h2>
            </div>
            <IonButton fill="clear" onClick={onDismiss}>
              Fechar
            </IonButton>
          </div>

          <IonList inset>
            <IonItem>
              <IonLabel>Vencedor</IonLabel>
              <IonSelect
                value={winnerPlayerId}
                interface="popover"
                onIonChange={(event) => setWinnerPlayerId(String(event.detail.value))}
              >
                {activeMatch.players.map((player) => (
                  <IonSelectOption key={player.id} value={player.id}>
                    {player.name}
                  </IonSelectOption>
                ))}
              </IonSelect>
            </IonItem>
          </IonList>
          <IonButton
            expand="block"
            color="secondary"
            onClick={() => {
              onFinish(winnerPlayerId);
              onDismiss();
            }}
          >
            Salvar resultado
          </IonButton>
        </div>
      </IonContent>
    </IonModal>
  );
};
