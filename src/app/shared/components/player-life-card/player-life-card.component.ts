import { Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { IonButton, IonIcon, IonInput } from '@ionic/angular/standalone';
import type { Player } from '../../../core/models/player.model';

@Component({
  selector: 'app-player-card',
  standalone: true,
  imports: [IonButton, IonIcon, IonInput],
  templateUrl: './player-life-card.component.html',
  styleUrl: './player-life-card.component.scss'
})
export class PlayerCardComponent {
  @Input({ required: true }) player!: Player;
  @Input({ required: true }) layoutClassName = '';
  @Input({ required: true }) orientationClassName = '';
  @Output() rename = new EventEmitter<string>();
  @Output() lifeChange = new EventEmitter<number>();
  @Output() backgroundFile = new EventEmitter<File>();
  @ViewChild('fileInput', { static: true }) fileInput!: ElementRef<HTMLInputElement>;

  get backgroundImageStyle() {
    return this.player.backgroundImageDataUrl ? `url("${this.player.backgroundImageDataUrl}")` : undefined;
  }

  stringValue(value: unknown) {
    return String(value ?? '');
  }

  handleBackgroundImage(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (file) {
      this.backgroundFile.emit(file);
    }

    input.value = '';
  }
}
