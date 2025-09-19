import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';
import 'bootstrap/dist/js/bootstrap.bundle.min.js'; // <-- adiciona isso


bootstrapApplication(App, appConfig)
  .catch((err) => console.error(err));
