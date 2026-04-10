import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';

// Aquarius RRHH v3.0 - 2026
bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error(err));
