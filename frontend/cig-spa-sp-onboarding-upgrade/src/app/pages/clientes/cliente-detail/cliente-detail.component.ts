import { Component, inject, OnInit, signal, viewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Cliente } from '../../../core/models/cliente.model';
import { ClientesService } from '../clientes.service';
import { NotificationService } from '../../../core/services/notification.service';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { ConfirmationDialogComponent } from '../../../shared/components/confirmation-dialog/confirmation-dialog.component';

@Component({
  selector: 'app-cliente-detail',
  standalone: true,
  imports: [CommonModule, ButtonComponent, ConfirmationDialogComponent],
  template: `
    @if (cliente()) {
      <div class="max-w-4xl">
        <!-- Header -->
        <div class="mb-6 flex justify-between items-start">
          <div>
            <h1 class="text-3xl font-bold text-gray-900">
              {{ cliente()!.nombre }}
            </h1>
            <p class="mt-1 text-sm text-gray-500">Información detallada del cliente</p>
          </div>
          <div class="flex gap-3">
            <app-button
              [variant]="'primary'"
              (clicked)="editCliente()"
            >
              Editar
            </app-button>
            <app-button
              [variant]="'danger'"
              (clicked)="confirmDelete()"
            >
              Eliminar
            </app-button>
          </div>
        </div>

        <!-- Cliente Info Card -->
        <div class="bg-white rounded-lg shadow overflow-hidden">
          <div class="px-6 py-4 bg-gray-50 border-b border-gray-200">
            <h2 class="text-lg font-semibold text-gray-900">Información Personal</h2>
          </div>
          <div class="px-6 py-4">
            <dl class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <dt class="text-sm font-medium text-gray-500">Nombre Completo</dt>
                <dd class="mt-1 text-sm text-gray-900">{{ cliente()!.nombre }}</dd>
              </div>
              <div>
                <dt class="text-sm font-medium text-gray-500">Identificación</dt>
                <dd class="mt-1 text-sm text-gray-900">{{ cliente()!.identificacion }}</dd>
              </div>
              <div>
                <dt class="text-sm font-medium text-gray-500">Edad</dt>
                <dd class="mt-1 text-sm text-gray-900">{{ cliente()!.edad }} años</dd>
              </div>
              <div>
                <dt class="text-sm font-medium text-gray-500">Género</dt>
                <dd class="mt-1 text-sm text-gray-900">{{ getGeneroLabel(cliente()!.genero) }}</dd>
              </div>
              <div>
                <dt class="text-sm font-medium text-gray-500">Teléfono</dt>
                <dd class="mt-1 text-sm text-gray-900">
                  <a [href]="'tel:' + cliente()!.telefono" class="text-blue-600 hover:text-blue-800">
                    {{ cliente()!.telefono }}
                  </a>
                </dd>
              </div>
              <div>
                <dt class="text-sm font-medium text-gray-500">Estado</dt>
                <dd class="mt-1">
                  <span [class]="getEstadoBadgeClass(cliente()!.estado)">
                    {{ cliente()!.estado ? 'Activo' : 'Inactivo' }}
                  </span>
                </dd>
              </div>
              <div class="md:col-span-2">
                <dt class="text-sm font-medium text-gray-500">Dirección</dt>
                <dd class="mt-1 text-sm text-gray-900">{{ cliente()!.direccion }}</dd>
              </div>
              <div>
                <dt class="text-sm font-medium text-gray-500">ID</dt>
                <dd class="mt-1 text-sm text-gray-900 font-mono">{{ cliente()!.id }}</dd>
              </div>
            </dl>
          </div>
        </div>

        <!-- Actions -->
        <div class="mt-6 flex gap-3">
          <app-button
            [variant]="'secondary'"
            (clicked)="goBack()"
          >
            Volver a la Lista
          </app-button>
        </div>
      </div>
    } @else {
      <div class="text-center py-12">
        @if (clientesService.loading()) {
          <svg class="animate-spin mx-auto h-12 w-12 text-blue-600" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p class="mt-2 text-sm text-gray-500">Cargando...</p>
        } @else {
          <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <h3 class="mt-2 text-sm font-medium text-gray-900">Cliente no encontrado</h3>
          <p class="mt-1 text-sm text-gray-500">El cliente que buscas no existe o fue eliminado.</p>
          <div class="mt-6">
            <app-button
              [variant]="'primary'"
              (clicked)="goBack()"
            >
              Volver a la Lista
            </app-button>
          </div>
        }
      </div>
    }

    <!-- Confirmation Dialog -->
    <app-confirmation-dialog
      #confirmDialog
      [title]="'Eliminar Cliente'"
      [message]="'¿Está seguro que desea eliminar este cliente? Esta acción no se puede deshacer.'"
      [confirmText]="'Eliminar'"
      [cancelText]="'Cancelar'"
      [confirmVariant]="'danger'"
      (confirmed)="handleDeleteConfirm($event)"
    />
  `
})
export class ClienteDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  clientesService = inject(ClientesService);
  private notificationService = inject(NotificationService);
  confirmDialog = viewChild.required<ConfirmationDialogComponent>('confirmDialog');

  cliente = signal<Cliente | null>(null);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadCliente(parseInt(id, 10));
    }
  }

  private loadCliente(id: number): void {
    this.clientesService.getById(id).subscribe({
      next: (cliente) => {
        this.cliente.set(cliente);
      },
      error: (error) => {
        this.notificationService.error('Cliente no encontrado');
        console.error('Error loading cliente:', error);
      }
    });
  }

  editCliente(): void {
    if (this.cliente()) {
      this.router.navigate(['/clientes', this.cliente()!.id, 'editar']);
    }
  }

  confirmDelete(): void {
    this.confirmDialog().open();
  }

  handleDeleteConfirm(confirmed: boolean): void {
    if (confirmed && this.cliente()) {
      this.clientesService.delete(this.cliente()!.id).subscribe({
        next: () => {
          this.notificationService.success('Cliente eliminado correctamente');
          this.router.navigate(['/clientes']);
        },
        error: (error) => {
          this.notificationService.error('Error al eliminar el cliente');
          console.error('Error deleting cliente:', error);
        }
      });
    }
  }

  goBack(): void {
    this.router.navigate(['/clientes']);
  }

  getGeneroLabel(genero: string): string {
    const labels: Record<string, string> = {
      MASCULINO: 'Masculino',
      FEMENINO: 'Femenino',
      OTRO: 'Otro'
    };
    return labels[genero] || genero;
  }

  getEstadoBadgeClass(estado: boolean): string {
    const baseClasses = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium';
    return estado
      ? `${baseClasses} bg-green-100 text-green-800`
      : `${baseClasses} bg-gray-100 text-gray-800`;
  }
}
