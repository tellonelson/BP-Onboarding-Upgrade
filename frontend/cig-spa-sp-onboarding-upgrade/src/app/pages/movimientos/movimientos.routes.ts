import { Routes } from '@angular/router';

export const MOVIMIENTOS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./movimientos-list/movimientos-list.component').then(m => m.MovimientosListComponent),
    title: 'Movimientos'
  },
  {
    path: 'nuevo',
    loadComponent: () => import('./movimiento-form/movimiento-form.component').then(m => m.MovimientoFormComponent),
    title: 'Nuevo Movimiento'
  },
  {
    path: ':id',
    loadComponent: () => import('./movimiento-detail/movimiento-detail.component').then(m => m.MovimientoDetailComponent),
    title: 'Detalle Movimiento'
  },
  {
    path: ':id/editar',
    loadComponent: () => import('./movimiento-form/movimiento-form.component').then(m => m.MovimientoFormComponent),
    title: 'Editar Movimiento'
  }
];
