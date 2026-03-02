import { Routes } from '@angular/router';

export const CLIENTES_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./clientes-list/clientes-list.component').then(m => m.ClientesListComponent),
    title: 'Clientes'
  },
  {
    path: 'nuevo',
    loadComponent: () => import('./cliente-form/cliente-form.component').then(m => m.ClienteFormComponent),
    title: 'Nuevo Cliente'
  },
  {
    path: ':id',
    loadComponent: () => import('./cliente-detail/cliente-detail.component').then(m => m.ClienteDetailComponent),
    title: 'Detalle Cliente'
  },
  {
    path: ':id/editar',
    loadComponent: () => import('./cliente-form/cliente-form.component').then(m => m.ClienteFormComponent),
    title: 'Editar Cliente'
  }
];
