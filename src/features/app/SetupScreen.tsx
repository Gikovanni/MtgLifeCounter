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
} from '@ionic/react';
import { addOutline, createOutline, locationOutline, trashOutline } from 'ionicons/icons';
import { useMemo, useState } from 'react';
import { INITIAL_LIFE_OPTIONS } from '../../core/constants';
import type { AppData, LocationRecord, MatchSettings } from '../../core/types';

interface SetupScreenProps {
  data: AppData;
  onStartMatch: (settings: MatchSettings) => void;
  onSaveLocation: (payload: { id?: string; name: string; notes: string }) => void;
  onDeleteLocation: (locationId: string) => void;
}

export const SetupScreen = ({
  data,
  onStartMatch,
  onSaveLocation,
  onDeleteLocation
}: SetupScreenProps) => {
  const [initialLife, setInitialLife] = useState(data.settings.defaultInitialLife);
  const [playerCount, setPlayerCount] = useState(data.settings.defaultPlayerCount);
  const [locationId, setLocationId] = useState<string | null>(data.settings.lastSelectedLocationId);
  const [editingLocation, setEditingLocation] = useState<LocationRecord | null>(null);
  const [locationName, setLocationName] = useState('');
  const [locationNotes, setLocationNotes] = useState('');

  const matchesByLocation = useMemo(() => {
    const counts = new Map<string, number>();
    data.matchHistory.forEach((match) => {
      if (match.locationId) {
        counts.set(match.locationId, (counts.get(match.locationId) ?? 0) + 1);
      }
    });
    return counts;
  }, [data.matchHistory]);

  const beginEditLocation = (location: LocationRecord) => {
    setEditingLocation(location);
    setLocationName(location.name);
    setLocationNotes(location.notes);
  };

  const clearLocationForm = () => {
    setEditingLocation(null);
    setLocationName('');
    setLocationNotes('');
  };

  return (
    <main className="setup-shell">
      <section className="setup-header">
        <div>
          <p className="topbar__eyebrow">Magic Life Counter</p>
          <h1>Nova partida</h1>
        </div>
      </section>

      <section className="setup-grid">
        <div className="setup-panel">
          <h2>Configuracao</h2>
          <IonList inset>
            <IonItem>
              <IonLabel>Jogadores</IonLabel>
              <IonSelect
                value={playerCount}
                interface="popover"
                onIonChange={(event) => setPlayerCount(Number(event.detail.value))}
              >
                {[2, 3, 4, 5, 6].map((option) => (
                  <IonSelectOption key={option} value={option}>
                    {option}
                  </IonSelectOption>
                ))}
              </IonSelect>
            </IonItem>
            <IonItem>
              <IonLabel>Vida inicial</IonLabel>
              <IonSelect
                value={initialLife}
                interface="popover"
                onIonChange={(event) => setInitialLife(Number(event.detail.value))}
              >
                {INITIAL_LIFE_OPTIONS.map((option) => (
                  <IonSelectOption key={option} value={option}>
                    {option}
                  </IonSelectOption>
                ))}
              </IonSelect>
            </IonItem>
            <IonItem>
              <IonLabel>Local</IonLabel>
              <IonSelect
                value={locationId ?? '__none__'}
                interface="popover"
                onIonChange={(event) =>
                  setLocationId(event.detail.value === '__none__' ? null : String(event.detail.value))
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
          <IonButton
            expand="block"
            size="large"
            onClick={() => onStartMatch({ initialLife, playerCount, locationId })}
          >
            Iniciar partida
          </IonButton>
        </div>

        <div className="setup-panel">
          <div className="section-heading">
            <h2>Locais</h2>
            <IonIcon icon={locationOutline} />
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
            <div className="setup-location-actions">
              <IonButton
                disabled={!locationName.trim()}
                onClick={() => {
                  onSaveLocation({
                    id: editingLocation?.id,
                    name: locationName.trim(),
                    notes: locationNotes.trim()
                  });
                  clearLocationForm();
                }}
              >
                <IonIcon slot="start" icon={editingLocation ? createOutline : addOutline} />
                {editingLocation ? 'Atualizar' : 'Adicionar'}
              </IonButton>
              {editingLocation ? (
                <IonButton fill="clear" color="medium" onClick={clearLocationForm}>
                  Cancelar
                </IonButton>
              ) : null}
            </div>
          </div>

          <div className="locations-list">
            {data.locations.map((location) => (
              <div key={location.id} className="location-row">
                <div>
                  <strong>{location.name}</strong>
                  <p>{matchesByLocation.get(location.id) ?? 0} partidas</p>
                </div>
                <div className="location-row__actions">
                  <IonButton fill="clear" onClick={() => beginEditLocation(location)}>
                    <IonIcon icon={createOutline} />
                  </IonButton>
                  <IonButton fill="clear" color="danger" onClick={() => onDeleteLocation(location.id)}>
                    <IonIcon icon={trashOutline} />
                  </IonButton>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
};
