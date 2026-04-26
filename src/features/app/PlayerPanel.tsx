import { IonButton, IonIcon, IonInput } from '@ionic/react';
import { imageOutline } from 'ionicons/icons';
import { useRef } from 'react';
import type { Player } from '../../core/types';

interface PlayerPanelProps {
  player: Player;
  layoutClassName: string;
  orientationClassName: string;
  onRename: (playerId: string, name: string) => void;
  onLifeChange: (playerId: string, delta: number) => void;
  onBackgroundImage: (playerId: string, file: File) => void;
}

export const PlayerPanel = ({
  player,
  layoutClassName,
  orientationClassName,
  onRename,
  onLifeChange,
  onBackgroundImage
}: PlayerPanelProps) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const panelStyle = {
    backgroundColor: player.color
  };
  const backgroundStyle = {
    backgroundImage: player.backgroundImageDataUrl ? `url("${player.backgroundImageDataUrl}")` : undefined
  };

  return (
    <article className={`arena-player ${layoutClassName}`} style={panelStyle}>
      {player.backgroundImageDataUrl ? (
        <div
          className={`arena-player__background ${orientationClassName}`}
          style={backgroundStyle}
          aria-hidden="true"
        />
      ) : null}
      <div className="arena-player__tools">
        <IonButton
          aria-label="Adicionar imagem"
          fill="clear"
          color="dark"
          onClick={() => fileInputRef.current?.click()}
        >
          <IonIcon icon={imageOutline} />
        </IonButton>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          hidden
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) {
              onBackgroundImage(player.id, file);
            }
            event.target.value = '';
          }}
        />
      </div>
      <div className={`arena-player__inner ${orientationClassName}`}>
        <IonInput
          className="arena-player__name"
          aria-label={`Nome de ${player.name || 'jogador'}`}
          value={player.name}
          placeholder="Jogador"
          onIonInput={(event) => onRename(player.id, String(event.detail.value ?? ''))}
        />
        <div className="arena-player__life">{player.life}</div>
      </div>
      <div className="arena-player__actions" aria-label={`Ajustar vida de ${player.name || 'jogador'}`}>
        <IonButton
          className="arena-player__life-button"
          fill="solid"
          shape="round"
          onClick={() => onLifeChange(player.id, -1)}
        >
          <span aria-hidden="true">-</span>
        </IonButton>
        <IonButton
          className="arena-player__life-button"
          fill="solid"
          shape="round"
          onClick={() => onLifeChange(player.id, 1)}
        >
          <span aria-hidden="true">+</span>
        </IonButton>
      </div>
    </article>
  );
};
