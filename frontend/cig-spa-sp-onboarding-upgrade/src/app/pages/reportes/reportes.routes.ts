import { Routes } from '@angular/router';

export const REPORTES_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./reportes-placeholder.component').then(m => m.ReportesPlaceholderComponent),
    title: 'Estado de Cuenta'
  }
];
