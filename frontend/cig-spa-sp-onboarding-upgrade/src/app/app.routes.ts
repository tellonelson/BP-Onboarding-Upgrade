import { Routes } from '@angular/router';
import { MainLayoutComponent } from './layouts/main-layout/main-layout.component';

export const routes: Routes = [
  {
    path: '',
    component: MainLayoutComponent,
    children: [
      {
        path: '',
        redirectTo: 'clientes',
        pathMatch: 'full'
      },
      {
        path: 'clientes',
        loadChildren: () => import('./pages/clientes/clientes.routes').then(m => m.CLIENTES_ROUTES)
      },
      {
        path: 'cuentas',
        loadChildren: () => import('./pages/cuentas/cuentas.routes').then(m => m.CUENTAS_ROUTES)
      },
      {
        path: 'movimientos',
        loadChildren: () => import('./pages/movimientos/movimientos.routes').then(m => m.MOVIMIENTOS_ROUTES)
      },
      {
        path: 'reportes',
        loadChildren: () => import('./pages/reportes/reportes.routes').then(m => m.REPORTES_ROUTES)
      }
    ]
  },
  {
    path: '**',
    redirectTo: 'clientes'
  }
];
