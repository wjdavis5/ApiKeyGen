import { Routes } from '@angular/router';
import { AdminComponent } from './components/admin/admin.component';
import { NewApiKeyComponent } from './components/new-api-key/new-api-key.component';

export const routes: Routes = [
  { path: '', redirectTo: '/admin', pathMatch: 'full' },
  { path: 'admin', component: AdminComponent },
  { path: 'new-api-key', component: NewApiKeyComponent },
  { path: 'generate-key', component: NewApiKeyComponent }
];
