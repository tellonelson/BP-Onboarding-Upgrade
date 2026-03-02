import { Component, inject, signal, viewChild, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { Cliente } from '../../../core/models/cliente.model';
import { ClientesService } from '../clientes.service';
import { NotificationService } from '../../../core/services/notification.service';
import { DataTableComponent, TableColumn, TableAction } from '../../../shared/components/data-table/data-table.component';
import { SearchBarComponent } from '../../../shared/components/search-bar/search-bar.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { ConfirmationDialogComponent } from '../../../shared/components/confirmation-dialog/confirmation-dialog.component';
import { PaginatedResponse, PageParams, SortParams } from '../../../core/models/common.model';

@Component({
  selector: 'app-clientes-list',
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
          <h1 class="text-3xl font-bold text-gray-900">Clientes</h1>
          <p class="mt-1 text-sm text-gray-500">
            Gestiona los clientes de tu banco
          </p>
        </div>
        <app-button [variant]="'primary'" [routerLink]="['/clientes/nuevo']">
          Nuevo Cliente
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
              <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z"/>
            </svg>
            <span class="text-sm font-medium text-gray-700">
              Total de clientes: <span class="text-blue-600">{{ paginationData()!.totalElements }}</span>
            </span>
          </div>
        </div>
      }

      <!-- Loading State -->
      @if (clientesService.loading()) {
        <div class="flex justify-center items-center py-12">
          <svg class="animate-spin h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
      }

      <!-- Data Table -->
      @if (!clientesService.loading()) {
        <app-data-table
          [data]="clientes()"
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
      [title]="'Eliminar Cliente'"
      [message]="'¿Está seguro que desea eliminar este cliente? Esta acción no se puede deshacer.'"
      [confirmText]="'Eliminar'"
      [cancelText]="'Cancelar'"
      [confirmVariant]="'danger'"
      (confirmed)="handleDeleteConfirm($event)"
    />
  `
})
export class ClientesListComponent implements OnInit {
  private router = inject(Router);
  clientesService = inject(ClientesService);
  notificationService = inject(NotificationService);
  confirmDialog = viewChild.required<ConfirmationDialogComponent>('confirmDialog');

  // State
  clientes = signal<Cliente[]>([]);
  paginationData = signal<PaginatedResponse<Cliente> | null>(null);
  clienteToDelete = signal<number | null>(null);
  searchTerm = signal<string>('');

  // Pagination params
  currentPage = signal<number>(0);
  pageSize = signal<number>(5);
  currentSort = signal<SortParams | null>(null);

  columns: TableColumn<Cliente>[] = [
    { key: 'nombre', label: 'Nombre', sortable: true },
    { key: 'identificacion', label: 'Identificación', sortable: true },
    { key: 'edad', label: 'Edad', sortable: true },
    { key: 'telefono', label: 'Teléfono' },
    {
      key: 'estado',
      label: 'Estado',
      sortable: true,
      customRender: (cliente: Cliente) => cliente.estado ? '✓ Activo' : '✗ Inactivo'
    }
  ];

  actions: TableAction<Cliente>[] = [
    {
      label: 'Ver',
      variant: 'primary',
      handler: (cliente: Cliente) => this.viewCliente(cliente)
    },
    {
      label: 'Editar',
      variant: 'secondary',
      handler: (cliente: Cliente) => this.editCliente(cliente)
    },
    {
      label: 'Eliminar',
      variant: 'danger',
      handler: (cliente: Cliente) => this.deleteCliente(cliente)
    }
  ];

  ngOnInit(): void {
    this.loadClientes();
  }

  private loadClientes(): void {
    console.log('🔄 Cargando clientes...');
    const params: PageParams = {
      page: this.currentPage(),
      size: this.pageSize(),
      sort: this.currentSort() || undefined
    };
    console.log('📋 Parámetros:', params);

    const searchTerm = this.searchTerm();
    // Siempre usar getAll, pasando el searchTerm para filtrar localmente
    this.clientesService.getAll(params, searchTerm).subscribe({
      next: (response) => {
        console.log('✅ Clientes cargados:', response);
        this.clientes.set(response.content);
        this.paginationData.set(response);
      },
      error: (error) => {
        console.error('❌ Error al cargar clientes:', error);
        console.error('📊 Status:', error.status);
        console.error('📝 Message:', error.message);
        console.error('🔗 URL:', error.url);
        this.notificationService.error('Error al cargar los clientes');
      }
    });
  }

  handleSearch(term: string): void {
    this.searchTerm.set(term);
    this.currentPage.set(0); // Reset to first page on search
    this.loadClientes();
  }

  handleSortChange(sort: SortParams): void {
    this.currentSort.set(sort);
    this.loadClientes();
  }

  handlePageChange(page: number): void {
    this.currentPage.set(page);
    this.loadClientes();
  }

  handlePageSizeChange(newSize: number): void {
    this.pageSize.set(newSize);
    this.currentPage.set(0); // Reset to first page
    this.loadClientes();
  }

  viewCliente(cliente: Cliente): void {
    this.router.navigate(['/clientes', cliente.id]);
  }

  editCliente(cliente: Cliente): void {
    this.router.navigate(['/clientes', cliente.id, 'editar']);
  }

  deleteCliente(cliente: Cliente): void {
    this.clienteToDelete.set(cliente.id);
    this.confirmDialog().open();
  }

  handleDeleteConfirm(confirmed: boolean): void {
    if (confirmed && this.clienteToDelete()) {
      this.clientesService.delete(this.clienteToDelete()!).subscribe({
        next: () => {
          this.notificationService.success('Cliente eliminado correctamente');
          this.loadClientes(); // Reload the list
        },
        error: (error) => {
          this.notificationService.error('Error al eliminar el cliente');
          console.error('Error deleting cliente:', error);
        }
      });
    }
    this.clienteToDelete.set(null);
  }
}
