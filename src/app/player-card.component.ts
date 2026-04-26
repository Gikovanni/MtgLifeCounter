import { Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { IonButton, IonIcon, IonInput } from '@ionic/angular/standalone';
import type { Player } from '../core/types';

@Component({
  selector: 'app-player-card',
  standalone: true,
  imports: [IonButton, IonIcon, IonInput],
  template: `
    <article [class]="'arena-player ' + layoutClassName" [style.backgroundColor]="player.color">
      @if (player.backgroundImageDataUrl) {
        <div
          class="arena-player__background"
          [class]="orientationClassName"
          [style.backgroundImage]="backgroundImageStyle"
          aria-hidden="true"
        ></div>
      }

      <div class="arena-player__tools">
        <ion-button aria-label="Adicionar imagem" fill="clear" color="dark" (click)="fileInput.click()">
          <ion-icon name="image-outline"></ion-icon>
        </ion-button>
        <input
          #fileInput
          type="file"
          accept="image/*"
          hidden
          (change)="handleBackgroundImage($event)"
        />
      </div>

      <div class="arena-player__inner" [class]="orientationClassName">
        <ion-input
          class="arena-player__name"
          [attr.aria-label]="'Nome de ' + (player.name || 'jogador')"
          [value]="player.name"
          placeholder="Jogador"
          (ionInput)="rename.emit(stringValue($event.detail.value))"
        ></ion-input>
        <div class="arena-player__life">{{ player.life }}</div>
      </div>

      <div class="arena-player__actions" [attr.aria-label]="'Ajustar vida de ' + (player.name || 'jogador')">
        <ion-button class="arena-player__life-button" fill="solid" shape="round" (click)="lifeChange.emit(-1)">
          <span aria-hidden="true">-</span>
        </ion-button>
        <ion-button class="arena-player__life-button" fill="solid" shape="round" (click)="lifeChange.emit(1)">
          <span aria-hidden="true">+</span>
        </ion-button>
      </div>
    </article>
  `,
  styles: [
    `
      :host {
        display: contents;
      }
    `
  ]
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
