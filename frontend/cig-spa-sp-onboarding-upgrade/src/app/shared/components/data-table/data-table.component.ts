import { Component, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SortParams, PaginatedResponse } from '../../../core/models/common.model';

export interface TableColumn<T> {
  key: keyof T | string;
  label: string;
  sortable?: boolean;
  customRender?: (row: T) => string;
}

export interface TableAction<T> {
  label: string;
  icon?: string;
  handler: (row: T) => void;
  variant?: 'primary' | 'secondary' | 'danger';
  visible?: (row: T) => boolean;
}

@Component({
  selector: 'app-data-table',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="space-y-4">
      <!-- Table -->
      <div class="overflow-x-auto rounded-lg border border-gray-200 shadow">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              @for (col of columns(); track col.key) {
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  @if (col.sortable) {
                    <button
                      (click)="handleSort(col.key)"
                      class="flex items-center gap-2 hover:text-gray-700 transition-colors"
                    >
                      <span>{{ col.label }}</span>
                      @if (currentSort()?.field === col.key) {
                        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          @if (currentSort()?.direction === 'asc') {
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7" />
                          } @else {
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                          }
                        </svg>
                      }
                    </button>
                  } @else {
                    {{ col.label }}
                  }
                </th>
              }
              @if (actions() && actions().length > 0) {
                <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              }
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            @for (row of data(); track $index) {
              <tr class="hover:bg-gray-50 transition-colors">
                @for (col of columns(); track col.key) {
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {{ getCellValue(row, col) }}
                  </td>
                }
                @if (actions() && actions().length > 0) {
                  <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div class="flex justify-end gap-2">
                      @for (action of actions(); track action.label) {
                        @if (!action.visible || action.visible(row)) {
                          <button
                            (click)="action.handler(row)"
                            [class]="getActionClass(action.variant)"
                          >
                            {{ action.label }}
                          </button>
                        }
                      }
                    </div>
                  </td>
                }
              </tr>
            } @empty {
              <tr>
                <td [colSpan]="columns().length + (actions().length > 0 ? 1 : 0)" class="px-6 py-12 text-center">
                  <div class="flex flex-col items-center justify-center text-gray-500">
                    <svg class="w-12 h-12 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                    </svg>
                    <p class="text-sm font-medium">No hay datos disponibles</p>
                    <p class="text-xs mt-1">Los registros que agregues aparecerán aquí</p>
                  </div>
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      @if (pagination() && pagination()!.totalElements > 0) {
        <div class="flex items-center justify-between px-4 py-3 bg-white border border-gray-200 rounded-lg">
          <div class="flex items-center gap-4">
            <span class="text-sm text-gray-700">
              Mostrando <span class="font-medium">{{ getStartItem() }}</span> a
              <span class="font-medium">{{ getEndItem() }}</span> de
              <span class="font-medium">{{ pagination()!.totalElements }}</span> resultados
            </span>

            <!-- Page Size Selector -->
            <div class="flex items-center gap-2">
              <label for="pageSize" class="text-sm text-gray-700">Por página:</label>
              <select
                id="pageSize"
                (change)="handlePageSizeChange($event)"
                class="px-2 py-1 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                @for (size of pageSizeOptions; track size) {
                  <option [value]="size" [selected]="pagination()!.size === size">{{ size }}</option>
                }
              </select>
            </div>
          </div>

          <div class="flex items-center gap-2">
            <!-- Previous button -->
            <button
              (click)="goToPage(pagination()!.number - 1)"
              [disabled]="pagination()!.first"
              class="px-3 py-1 text-sm border rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Anterior
            </button>

            <!-- Page numbers -->
            @for (page of getVisiblePages(); track page) {
              <button
                (click)="goToPage(page)"
                [class.bg-blue-600]="page === pagination()!.number"
                [class.text-white]="page === pagination()!.number"
                [class.hover:bg-gray-100]="page !== pagination()!.number"
                class="px-3 py-1 text-sm border rounded transition-colors"
              >
                {{ page + 1 }}
              </button>
            }

            <!-- Next button -->
            <button
              (click)="goToPage(pagination()!.number + 1)"
              [disabled]="pagination()!.last"
              class="px-3 py-1 text-sm border rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Siguiente
            </button>
          </div>
        </div>
      }
    </div>
  `
})
export class DataTableComponent<T> {
  data = input.required<T[]>();
  columns = input.required<TableColumn<T>[]>();
  actions = input<TableAction<T>[]>([]);
  pagination = input<PaginatedResponse<T> | null>(null);

  // Outputs
  sortChange = output<SortParams>();
  pageChange = output<number>();
  pageSizeChange = output<number>();

  // State
  currentSort = signal<SortParams | null>(null);
  pageSizeOptions = [5, 10, 15, 20, 25, 50];

  getCellValue(row: T, column: TableColumn<T>): any {
    if (column.customRender) {
      return column.customRender(row);
    }
    return row[column.key as keyof T];
  }

  getActionClass(variant?: string): string {
    const variants = {
      primary: 'text-blue-600 hover:text-blue-900',
      secondary: 'text-gray-600 hover:text-gray-900',
      danger: 'text-red-600 hover:text-red-900'
    };
    return variants[(variant as keyof typeof variants)] || variants.primary;
  }

  handleSort(field: string | number | symbol): void {
    const fieldStr = String(field);
    const currentField = this.currentSort()?.field;
    const currentDirection = this.currentSort()?.direction;

    let newDirection: 'asc' | 'desc' = 'asc';

    if (currentField === fieldStr) {
      newDirection = currentDirection === 'asc' ? 'desc' : 'asc';
    }

    const newSort: SortParams = { field: fieldStr, direction: newDirection };
    this.currentSort.set(newSort);
    this.sortChange.emit(newSort);
  }

  goToPage(page: number): void {
    if (this.pagination()) {
      const totalPages = this.pagination()!.totalPages;
      if (page >= 0 && page < totalPages) {
        this.pageChange.emit(page);
      }
    }
  }

  getStartItem(): number {
    if (!this.pagination()) return 0;
    return this.pagination()!.number * this.pagination()!.size + 1;
  }

  getEndItem(): number {
    if (!this.pagination()) return 0;
    const end = (this.pagination()!.number + 1) * this.pagination()!.size;
    return Math.min(end, this.pagination()!.totalElements);
  }

  getVisiblePages(): number[] {
    if (!this.pagination()) return [];

    const current = this.pagination()!.number;
    const total = this.pagination()!.totalPages;
    const delta = 2;

    const pages: number[] = [];
    for (let i = Math.max(0, current - delta); i <= Math.min(total - 1, current + delta); i++) {
      pages.push(i);
    }
    return pages;
  }

  handlePageSizeChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    const newSize = parseInt(select.value, 10);
    this.pageSizeChange.emit(newSize);
  }
}
