import { Component, inject, signal, viewChild, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { Cuenta } from '../../../core/models/cuenta.model';
import { CuentasService } from '../cuentas.service';
import { NotificationService } from '../../../core/services/notification.service';
import { DataTableComponent, TableColumn, TableAction } from '../../../shared/components/data-table/data-table.component';
import { SearchBarComponent } from '../../../shared/components/search-bar/search-bar.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { ConfirmationDialogComponent } from '../../../shared/components/confirmation-dialog/confirmation-dialog.component';
import { PaginatedResponse, PageParams, SortParams } from '../../../core/models/common.model';

@Component({
  selector: 'app-cuentas-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    DataTableComponent,
    SearchBarComponent,
    ButtonComponent,
    ConfirmationDialogComponent
  ],
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex justify-between items-center">
        <div>
          <h1 class="text-3xl font-bold text-gray-900">Cuentas</h1>
          <p class="mt-1 text-sm text-gray-500">
            Gestiona las cuentas bancarias
          </p>
        </div>
        <app-button [variant]="'primary'" [routerLink]="['/cuentas/nuevo']">
          Nueva Cuenta
        </app-button>
      </div>

      <!-- Search Bar -->
      <div class="max-w-md">
        <app-search-bar (searchChange)="handleSearch($event)" />
      </div>

      <!-- Stats -->
      @if (paginationData()) {
        <div class="bg-white rounded-lg shadow p-4">
          <div class="flex items-center gap-2">
            <svg class="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
              <path d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/>
            </svg>
            <span class="text-sm font-medium text-gray-700">
              Total de cuentas: <span class="text-blue-600">{{ paginationData()!.totalElements }}</span>
            </span>
          </div>
        </div>
      }

      <!-- Loading State -->
      @if (cuentasService.loading()) {
        <div class="flex justify-center items-center py-12">
          <svg class="animate-spin h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
      }

      <!-- Data Table -->
      @if (!cuentasService.loading()) {
        <app-data-table
          [data]="cuentas()"
          [columns]="columns"
          [actions]="actions"
          [pagination]="paginationData()"
          (sortChange)="handleSortChange($event)"
          (pageChange)="handlePageChange($event)"
          (pageSizeChange)="handlePageSizeChange($event)"
        />
      }
    </div>

    <!-- Confirmation Dialog -->
    <app-confirmation-dialog
      #confirmDialog
      [title]="'Eliminar Cuenta'"
      [message]="'¿Está seguro que desea eliminar esta cuenta? Esta acción no se puede deshacer.'"
      [confirmText]="'Eliminar'"
      [cancelText]="'Cancelar'"
      [confirmVariant]="'danger'"
      (confirmed)="handleDeleteConfirm($event)"
    />
  `
})
export class CuentasListComponent implements OnInit {
  private router = inject(Router);
  cuentasService = inject(CuentasService);
  notificationService = inject(NotificationService);
  confirmDialog = viewChild.required<ConfirmationDialogComponent>('confirmDialog');

  // State
  cuentas = signal<Cuenta[]>([]);
  paginationData = signal<PaginatedResponse<Cuenta> | null>(null);
  cuentaToDelete = signal<number | null>(null);
  searchTerm = signal<string>('');

  // Pagination params
  currentPage = signal<number>(0);
  pageSize = signal<number>(5);
  currentSort = signal<SortParams | null>(null);

  columns: TableColumn<Cuenta>[] = [
    { key: 'numeroCuenta', label: 'Número de Cuenta', sortable: true },
    {
      key: 'tipoCuenta',
      label: 'Tipo',
      sortable: true,
      customRender: (cuenta: Cuenta) => cuenta.tipoCuenta === 'AHORROS' ? 'Ahorros' : 'Corriente'
    },
    {
      key: 'saldoInicial',
      label: 'Saldo Inicial',
      sortable: true,
      customRender: (cuenta: Cuenta) => `$${cuenta.saldoInicial.toLocaleString('es-CO', { minimumFractionDigits: 2 })}`
    },
    {
      key: 'cliente',
      label: 'Cliente',
      customRender: (cuenta: Cuenta) => cuenta.cliente?.nombre || 'Sin cliente'
    },
    {
      key: 'identificacion',
      label: 'Identificación',
      customRender: (cuenta: Cuenta) => cuenta.cliente?.identificacion || '-'
    },
    {
      key: 'estado',
      label: 'Estado',
      sortable: true,
      customRender: (cuenta: Cuenta) => cuenta.cliente?.estado ? '✓ Activo' : '✗ Inactivo'
    }
  ];

  actions: TableAction<Cuenta>[] = [
    {
      label: 'Ver',
      variant: 'primary',
      handler: (cuenta: Cuenta) => this.viewCuenta(cuenta)
    },
    {
      label: 'Editar',
      variant: 'secondary',
      handler: (cuenta: Cuenta) => this.editCuenta(cuenta)
    },
    {
      label: 'Eliminar',
      variant: 'danger',
      handler: (cuenta: Cuenta) => this.deleteCuenta(cuenta)
    }
  ];

  ngOnInit(): void {
    this.loadCuentas();
  }

  private loadCuentas(): void {
    const params: PageParams = {
      page: this.currentPage(),
      size: this.pageSize(),
      sort: this.currentSort() || undefined
    };

    const searchTerm = this.searchTerm();
    // Siempre usar getAll, pasando el searchTerm para filtrar localmente
    this.cuentasService.getAll(params, searchTerm).subscribe({
      next: (response) => {
        this.cuentas.set(response.content);
        this.paginationData.set(response);
      },
      error: (error) => {
        this.notificationService.error('Error al cargar las cuentas');
        console.error('Error loading cuentas:', error);
      }
    });
  }

  handleSearch(term: string): void {
    this.searchTerm.set(term);
    this.currentPage.set(0);
    this.loadCuentas();
  }

  handleSortChange(sort: SortParams): void {
    this.currentSort.set(sort);
    this.loadCuentas();
  }

  handlePageChange(page: number): void {
    this.currentPage.set(page);
    this.loadCuentas();
  }

  handlePageSizeChange(newSize: number): void {
    this.pageSize.set(newSize);
    this.currentPage.set(0); // Reset to first page
    this.loadCuentas();
  }

  viewCuenta(cuenta: Cuenta): void {
    this.router.navigate(['/cuentas', cuenta.cuentaId]);
  }

  editCuenta(cuenta: Cuenta): void {
    this.router.navigate(['/cuentas', cuenta.cuentaId, 'editar']);
  }

  deleteCuenta(cuenta: Cuenta): void {
    this.cuentaToDelete.set(cuenta.cuentaId);
    this.confirmDialog().open();
  }

  handleDeleteConfirm(confirmed: boolean): void {
    if (confirmed && this.cuentaToDelete()) {
      this.cuentasService.delete(this.cuentaToDelete()!).subscribe({
        next: () => {
          this.notificationService.success('Cuenta eliminada correctamente');
          this.loadCuentas();
        },
        error: (error) => {
          this.notificationService.error('Error al eliminar la cuenta');
          console.error('Error deleting cuenta:', error);
        }
      });
    }
    this.cuentaToDelete.set(null);
  }
}
