import { bootstrapApplication } from '@angular/platform-browser';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideIonicAngular } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  addOutline,
  createOutline,
  flagOutline,
  folderOpenOutline,
  imageOutline,
  listOutline,
  locationOutline,
  refreshOutline,
  settingsOutline,
  trashOutline
} from 'ionicons/icons';
import { AppComponent } from './app/app.component';

addIcons({
  addOutline,
  createOutline,
  flagOutline,
  folderOpenOutline,
  imageOutline,
  listOutline,
  locationOutline,
  refreshOutline,
  settingsOutline,
  trashOutline
});

bootstrapApplication(AppComponent, {
  providers: [provideIonicAngular(), provideAnimationsAsync()]
}).catch((error) => console.error(error));
