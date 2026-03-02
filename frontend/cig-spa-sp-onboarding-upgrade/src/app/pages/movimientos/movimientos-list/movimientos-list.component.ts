import { Component, inject, signal, viewChild, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { Movimiento } from '../../../core/models/movimiento.model';
import { MovimientosService } from '../movimientos.service';
import { NotificationService } from '../../../core/services/notification.service';
import { DataTableComponent, TableColumn, TableAction } from '../../../shared/components/data-table/data-table.component';
import { SearchBarComponent } from '../../../shared/components/search-bar/search-bar.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { ConfirmationDialogComponent } from '../../../shared/components/confirmation-dialog/confirmation-dialog.component';
import { PaginatedResponse, PageParams, SortParams } from '../../../core/models/common.model';

@Component({
  selector: 'app-movimientos-list',
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
          <h1 class="text-3xl font-bold text-gray-900">Movimientos</h1>
          <p class="mt-1 text-sm text-gray-500">
            Gestiona los movimientos bancarios
          </p>
        </div>
        <app-button [variant]="'primary'" [routerLink]="['/movimientos/nuevo']">
          Nuevo Movimiento
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
              <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z"/>
              <path fill-rule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clip-rule="evenodd"/>
            </svg>
            <span class="text-sm font-medium text-gray-700">
              Total de movimientos: <span class="text-blue-600">{{ paginationData()!.totalElements }}</span>
            </span>
          </div>
        </div>
      }

      <!-- Loading State -->
      @if (movimientosService.loading()) {
        <div class="flex justify-center items-center py-12">
          <svg class="animate-spin h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
      }

      <!-- Data Table -->
      @if (!movimientosService.loading()) {
        <app-data-table
          [data]="movimientos()"
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
      [title]="'Eliminar Movimiento'"
      [message]="'¿Está seguro que desea eliminar este movimiento? Esta acción no se puede deshacer.'"
      [confirmText]="'Eliminar'"
      [cancelText]="'Cancelar'"
      [confirmVariant]="'danger'"
      (confirmed)="handleDeleteConfirm($event)"
    />
  `
})
export class MovimientosListComponent implements OnInit {
  private router = inject(Router);
  movimientosService = inject(MovimientosService);
  notificationService = inject(NotificationService);
  confirmDialog = viewChild.required<ConfirmationDialogComponent>('confirmDialog');

  // State
  movimientos = signal<Movimiento[]>([]);
  paginationData = signal<PaginatedResponse<Movimiento> | null>(null);
  movimientoToDelete = signal<number | null>(null);
  searchTerm = signal<string>('');

  // Pagination params
  currentPage = signal<number>(0);
  pageSize = signal<number>(5);
  currentSort = signal<SortParams | null>(null);

  columns: TableColumn<Movimiento>[] = [
    { key: 'fecha', label: 'Fecha', sortable: true },
    {
      key: 'tipoMovimiento',
      label: 'Tipo',
      sortable: true,
      customRender: (movimiento: Movimiento) =>
        movimiento.tipoMovimiento === 'CREDITO' ? '📥 Crédito' : '📤 Débito'
    },
    {
      key: 'valor',
      label: 'Valor',
      sortable: true,
      customRender: (movimiento: Movimiento) =>
        `$${movimiento.valor.toLocaleString('es-CO', { minimumFractionDigits: 2 })}`
    },
    {
      key: 'saldo',
      label: 'Saldo',
      sortable: true,
      customRender: (movimiento: Movimiento) =>
        `$${movimiento.saldo.toLocaleString('es-CO', { minimumFractionDigits: 2 })}`
    },
    {
      key: 'cuenta',
      label: 'Número de Cuenta',
      customRender: (movimiento: Movimiento) => movimiento.cuenta?.numeroCuenta || '-'
    },
    {
      key: 'cliente',
      label: 'Cliente',
      customRender: (movimiento: Movimiento) => movimiento.cuenta?.cliente?.nombre || '-'
    }
  ];

  actions: TableAction<Movimiento>[] = [
    {
      label: 'Ver',
      variant: 'primary',
      handler: (movimiento: Movimiento) => this.viewMovimiento(movimiento)
    },
    {
      label: 'Editar',
      variant: 'secondary',
      handler: (movimiento: Movimiento) => this.editMovimiento(movimiento)
    },
    {
      label: 'Eliminar',
      variant: 'danger',
      handler: (movimiento: Movimiento) => this.deleteMovimiento(movimiento)
    }
  ];

  ngOnInit(): void {
    this.loadMovimientos();
  }

  private loadMovimientos(): void {
    const params: PageParams = {
      page: this.currentPage(),
      size: this.pageSize(),
      sort: this.currentSort() || undefined
    };

    const searchTerm = this.searchTerm();
    // Siempre usar getAll, pasando el searchTerm para filtrar localmente
    this.movimientosService.getAll(params, searchTerm).subscribe({
      next: (response) => {
        this.movimientos.set(response.content);
        this.paginationData.set(response);
      },
      error: (error) => {
        this.notificationService.error('Error al cargar los movimientos');
        console.error('Error loading movimientos:', error);
      }
    });
  }

  handleSearch(term: string): void {
    this.searchTerm.set(term);
    this.currentPage.set(0);
    this.loadMovimientos();
  }

  handleSortChange(sort: SortParams): void {
    this.currentSort.set(sort);
    this.loadMovimientos();
  }

  handlePageChange(page: number): void {
    this.currentPage.set(page);
    this.loadMovimientos();
  }

  handlePageSizeChange(newSize: number): void {
    this.pageSize.set(newSize);
    this.currentPage.set(0);
    this.loadMovimientos();
  }

  viewMovimiento(movimiento: Movimiento): void {
    this.router.navigate(['/movimientos', movimiento.movimientoId]);
  }

  editMovimiento(movimiento: Movimiento): void {
    this.router.navigate(['/movimientos', movimiento.movimientoId, 'editar']);
  }

  deleteMovimiento(movimiento: Movimiento): void {
    this.movimientoToDelete.set(movimiento.movimientoId);
    this.confirmDialog().open();
  }

  handleDeleteConfirm(confirmed: boolean): void {
    if (confirmed && this.movimientoToDelete()) {
      this.movimientosService.delete(this.movimientoToDelete()!).subscribe({
        next: () => {
          this.notificationService.success('Movimiento eliminado correctamente');
          this.loadMovimientos();
        },
        error: (error) => {
          this.notificationService.error('Error al eliminar el movimiento');
          console.error('Error deleting movimiento:', error);
        }
      });
    }
    this.movimientoToDelete.set(null);
  }
}
