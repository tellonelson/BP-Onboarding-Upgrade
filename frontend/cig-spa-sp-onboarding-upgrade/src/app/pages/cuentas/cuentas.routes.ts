import { Routes } from '@angular/router';

export const CUENTAS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./cuentas-list/cuentas-list.component').then(m => m.CuentasListComponent),
    title: 'Cuentas'
  },
  {
    path: 'nuevo',
    loadComponent: () => import('./cuenta-form/cuenta-form.component').then(m => m.CuentaFormComponent),
    title: 'Nueva Cuenta'
  },
  {
    path: ':id',
    loadComponent: () => import('./cuenta-detail/cuenta-detail.component').then(m => m.CuentaDetailComponent),
    title: 'Detalle de Cuenta'
  },
  {
    path: ':id/editar',
    loadComponent: () => import('./cuenta-form/cuenta-form.component').then(m => m.CuentaFormComponent),
    title: 'Editar Cuenta'
  }
];
