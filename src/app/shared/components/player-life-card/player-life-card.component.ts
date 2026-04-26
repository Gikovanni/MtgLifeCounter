import { Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import type { Player } from '../../../core/models/player.model';

@Component({
  selector: 'app-player-card',
  standalone: true,
  imports: [MatButtonModule, MatIconModule, MatInputModule],
  templateUrl: './player-life-card.component.html',
  styleUrl: './player-life-card.component.scss'
})
export class PlayerCardComponent {
  @Input({ required: true }) player!: Player;
  @Input({ required: true }) layoutClassName = '';
  @Input({ required: true }) orientationClassName = '';
  @Input() pendingLifeDelta = 0;
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

  inputValue(event: Event) {
    return (event.target as HTMLInputElement).value;
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
