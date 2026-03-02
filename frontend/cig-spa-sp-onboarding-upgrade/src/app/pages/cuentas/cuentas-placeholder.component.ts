import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-cuentas-placeholder',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="text-center py-12">
      <svg class="mx-auto h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
      </svg>
      <h3 class="mt-4 text-lg font-medium text-gray-900">Módulo Cuentas</h3>
      <p class="mt-2 text-sm text-gray-500">Este módulo está en desarrollo.</p>
      <p class="mt-1 text-xs text-gray-400">Funcionalidad CRUD próximamente disponible.</p>
    </div>
  `
})
export class CuentasPlaceholderComponent {}
