import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-movimientos-placeholder',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="text-center py-12">
      <svg class="mx-auto h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
      </svg>
      <h3 class="mt-4 text-lg font-medium text-gray-900">Módulo Movimientos</h3>
      <p class="mt-2 text-sm text-gray-500">Este módulo está en desarrollo.</p>
      <p class="mt-1 text-xs text-gray-400">Funcionalidad CRUD próximamente disponible.</p>
    </div>
  `
})
export class MovimientosPlaceholderComponent {}
