import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { appConfig } from './app/app.config';

bootstrapApplication(AppComponent, {
  providers: appConfig.providers, // Usa los proveedores configurados
}).catch(err => console.error(err));
