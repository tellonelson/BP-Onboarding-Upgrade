import { Component, inject, signal, OnInit, viewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Movimiento } from '../../../core/models/movimiento.model';
import { MovimientosService } from '../movimientos.service';
import { NotificationService } from '../../../core/services/notification.service';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { ConfirmationDialogComponent } from '../../../shared/components/confirmation-dialog/confirmation-dialog.component';

@Component({
  selector: 'app-movimiento-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, ButtonComponent, ConfirmationDialogComponent],
  template: `
    <div class="max-w-4xl">
      <!-- Header -->
      <div class="mb-6">
        <h1 class="text-3xl font-bold text-gray-900">Detalle del Movimiento</h1>
        <p class="mt-1 text-sm text-gray-500">
          Información completa del movimiento bancario
        </p>
      </div>

      <!-- Loading State -->
      @if (loading()) {
        <div class="flex justify-center items-center py-12">
          <svg class="animate-spin h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
      }

      <!-- Content -->
      @if (!loading() && movimiento()) {
        <div class="space-y-6">
          <!-- Main Info Card -->
          <div class="bg-white rounded-lg shadow overflow-hidden">
            <div class="px-6 py-4 bg-gray-50 border-b border-gray-200">
              <h2 class="text-xl font-semibold text-gray-900">Información del Movimiento</h2>
            </div>
            <div class="px-6 py-4">
              <dl class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <dt class="text-sm font-medium text-gray-500">ID</dt>
                  <dd class="mt-1 text-sm text-gray-900">#{{ movimiento()!.movimientoId }}</dd>
                </div>

                <div>
                  <dt class="text-sm font-medium text-gray-500">Fecha</dt>
                  <dd class="mt-1 text-sm text-gray-900">{{ movimiento()!.fecha }}</dd>
                </div>

                <div>
                  <dt class="text-sm font-medium text-gray-500">Tipo</dt>
                  <dd class="mt-1">
                    <span [class]="getTipoBadgeClass()">
                      {{ movimiento()!.tipoMovimiento === 'CREDITO' ? '📥 Crédito' : '📤 Débito' }}
                    </span>
                  </dd>
                </div>

                <div>
                  <dt class="text-sm font-medium text-gray-500">Valor</dt>
                  <dd class="mt-1 text-lg font-semibold text-gray-900">
                    {{ formatCurrency(movimiento()!.valor) }}
                  </dd>
                </div>

                <div>
                  <dt class="text-sm font-medium text-gray-500">Saldo</dt>
                  <dd class="mt-1 text-lg font-semibold text-blue-600">
                    {{ formatCurrency(movimiento()!.saldo) }}
                  </dd>
                </div>
              </dl>
            </div>
          </div>

          <!-- Account Info Card -->
          @if (movimiento()!.cuenta) {
            <div class="bg-white rounded-lg shadow overflow-hidden">
              <div class="px-6 py-4 bg-gray-50 border-b border-gray-200">
                <h2 class="text-xl font-semibold text-gray-900">Información de la Cuenta</h2>
              </div>
              <div class="px-6 py-4">
                <dl class="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <dt class="text-sm font-medium text-gray-500">Número de Cuenta</dt>
                    <dd class="mt-1 text-sm text-gray-900">{{ movimiento()!.cuenta!.numeroCuenta }}</dd>
                  </div>

                  <div>
                    <dt class="text-sm font-medium text-gray-500">Tipo de Cuenta</dt>
                    <dd class="mt-1 text-sm text-gray-900">
                      {{ movimiento()!.cuenta!.tipoCuenta === 'AHORROS' ? 'Ahorros' : 'Corriente' }}
                    </dd>
                  </div>

                  @if (movimiento()!.cuenta!.cliente) {
                    <div>
                      <dt class="text-sm font-medium text-gray-500">Cliente</dt>
                      <dd class="mt-1 text-sm text-gray-900">{{ movimiento()!.cuenta!.cliente!.nombre }}</dd>
                    </div>

                    <div>
                      <dt class="text-sm font-medium text-gray-500">Identificación</dt>
                      <dd class="mt-1 text-sm text-gray-900">{{ movimiento()!.cuenta!.cliente!.identificacion }}</dd>
                    </div>
                  }
                </dl>
              </div>
            </div>
          }

          <!-- Actions -->
          <div class="flex gap-3">
            <app-button
              [variant]="'secondary'"
              [routerLink]="['/movimientos', movimiento()!.movimientoId, 'editar']"
            >
              Editar
            </app-button>
            <app-button
              [variant]="'danger'"
              (clicked)="openDeleteDialog()"
            >
              Eliminar
            </app-button>
            <app-button
              [variant]="'secondary'"
              [routerLink]="['/movimientos']"
            >
              Volver a la lista
            </app-button>
          </div>
        </div>
      }
    </div>

    <!-- Confirmation Dialog -->
    <app-confirmation-dialog
      #confirmDialog
      [title]="'Eliminar Movimiento'"
      [message]="'¿Está seguro que desea eliminar este movimiento? Esta acción no se puede deshacer.'"
      [confirmText]="'Eliminar'"
      [cancelText]="'Cancelar'"
      [confirmVariant]="'danger'"
      (confirmed)="handleDeleteConfirm($event)"
    />
  `
})
export class MovimientoDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private movimientosService = inject(MovimientosService);
  private notificationService = inject(NotificationService);

  confirmDialog = viewChild.required<ConfirmationDialogComponent>('confirmDialog');

  movimiento = signal<Movimiento | null>(null);
  loading = signal(false);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadMovimiento(parseInt(id, 10));
    }
  }

  private loadMovimiento(id: number): void {
    this.loading.set(true);
    this.movimientosService.getById(id).subscribe({
      next: (movimiento) => {
        this.movimiento.set(movimiento);
        this.loading.set(false);
      },
      error: (error) => {
        this.notificationService.error('Movimiento no encontrado');
        this.loading.set(false);
        this.router.navigate(['/movimientos']);
        console.error('Error loading movimiento:', error);
      }
    });
  }

  getTipoBadgeClass(): string {
    const tipo = this.movimiento()?.tipoMovimiento;
    if (tipo === 'CREDITO') {
      return 'inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800';
    }
    return 'inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800';
  }

  formatCurrency(value: number): string {
    return `$${value.toLocaleString('es-CO', { minimumFractionDigits: 2 })}`;
  }

  openDeleteDialog(): void {
    this.confirmDialog().open();
  }

  handleDeleteConfirm(confirmed: boolean): void {
    if (confirmed && this.movimiento()) {
      this.movimientosService.delete(this.movimiento()!.movimientoId).subscribe({
        next: () => {
          this.notificationService.success('Movimiento eliminado correctamente');
          this.router.navigate(['/movimientos']);
        },
        error: (error) => {
          this.notificationService.error('Error al eliminar el movimiento');
          console.error('Error deleting movimiento:', error);
        }
      });
    }
  }
}
