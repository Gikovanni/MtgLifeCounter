import { Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { IonButton, IonContent, IonModal, IonNote } from '@ionic/angular/standalone';

@Component({
  selector: 'app-data-modal',
  standalone: true,
  imports: [IonButton, IonContent, IonModal, IonNote],
  templateUrl: './data-modal.component.html'
})
export class DataModalComponent {
  @Input({ required: true }) isOpen = false;
  @Output() dismiss = new EventEmitter<void>();
  @Output() exportJson = new EventEmitter<void>();
  @Output() exportCsv = new EventEmitter<void>();
  @Output() importJsonFile = new EventEmitter<File>();
  @ViewChild('fileInput', { static: true }) fileInput!: ElementRef<HTMLInputElement>;
  status = '';

  handleFile(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (file) {
      this.importJsonFile.emit(file);
    }

    input.value = '';
  }

  setStatus(status: string) {
    this.status = status;
  }
}
