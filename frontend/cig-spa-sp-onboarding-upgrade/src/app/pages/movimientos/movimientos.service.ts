import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap, map } from 'rxjs/operators';
import { Movimiento, CreateMovimientoDTO, UpdateMovimientoDTO } from '../../core/models/movimiento.model';
import { PaginatedResponse, PageParams } from '../../core/models/common.model';
import { getApiUrl } from '../../core/config/api.config';

@Injectable({
  providedIn: 'root'
})
export class MovimientosService {
  private readonly API_URL = getApiUrl('movimientos');
  private http = inject(HttpClient);

  // Estado reactivo con Signals
  private movimientosSignal = signal<Movimiento[]>([]);
  private loadingSignal = signal<boolean>(false);
  private errorSignal = signal<string | null>(null);

  // Computed signals (readonly)
  movimientos = this.movimientosSignal.asReadonly();
  loading = this.loadingSignal.asReadonly();
  error = this.errorSignal.asReadonly();

  /**
   * Obtiene todos los movimientos con paginación y ordenamiento (paginación en frontend)
   */
  getAll(params?: PageParams, searchTerm?: string): Observable<PaginatedResponse<Movimiento>> {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    return this.http.get<Movimiento[] | PaginatedResponse<Movimiento>>(this.API_URL).pipe(
      map((response) => {
        let allMovimientos: Movimiento[];

        // Si la respuesta es un array, usarlo directamente
        if (Array.isArray(response)) {
          allMovimientos = response;
        } else {
          // Si es un objeto paginado, extraer el contenido
          allMovimientos = response.content;
        }

        // Aplicar filtro de búsqueda si se especifica
        if (searchTerm && searchTerm.trim() !== '') {
          allMovimientos = this.filterData(allMovimientos, searchTerm);
          console.log(`🔍 Filtrado por "${searchTerm}": ${allMovimientos.length} resultados`);
        }

        // Aplicar ordenamiento si se especifica
        if (params?.sort) {
          allMovimientos = this.sortData(allMovimientos, params.sort.field, params.sort.direction);
        }

        // Aplicar paginación
        const page = params?.page || 0;
        const size = params?.size || 5;
        const totalElements = allMovimientos.length;
        const totalPages = Math.ceil(totalElements / size);
        const start = page * size;
        const end = start + size;
        const paginatedMovimientos = allMovimientos.slice(start, end);

        return {
          content: paginatedMovimientos,
          totalElements,
          totalPages,
          size,
          number: page,
          first: page === 0,
          last: page === totalPages - 1,
          empty: totalElements === 0
        };
      }),
      tap({
        next: (response) => {
          this.movimientosSignal.set(response.content);
          this.loadingSignal.set(false);
        },
        error: (error) => {
          this.errorSignal.set('Error al cargar movimientos');
          this.loadingSignal.set(false);
          console.error('Error fetching movimientos:', error);
        }
      })
    );
  }

  /**
   * Ordena un array de movimientos
   */
  private sortData(data: Movimiento[], field: string, direction: 'asc' | 'desc'): Movimiento[] {
    return [...data].sort((a, b) => {
      const aValue = (a as any)[field];
      const bValue = (b as any)[field];

      if (aValue < bValue) return direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return direction === 'asc' ? 1 : -1;
      return 0;
    });
  }

  /**
   * Filtra un array de movimientos buscando en todas las columnas
   */
  private filterData(data: Movimiento[], searchTerm: string): Movimiento[] {
    const term = searchTerm.toLowerCase().trim();

    return data.filter(movimiento => {
      // Buscar en fecha
      if (movimiento.fecha?.toLowerCase().includes(term)) return true;

      // Buscar en tipo de movimiento
      if (movimiento.tipoMovimiento?.toLowerCase().includes(term)) return true;

      // Buscar en valor (convertir a string)
      if (movimiento.valor?.toString().includes(term)) return true;

      // Buscar en número de cuenta (solo si existe)
      if (movimiento.cuenta?.numeroCuenta?.toLowerCase().includes(term)) return true;

      // Buscar en nombre del cliente (solo si existe)
      if (movimiento.cuenta?.cliente?.nombre?.toLowerCase().includes(term)) return true;

      return false;
    });
  }

  /**
   * Obtiene un movimiento por ID
   */
  getById(id: number): Observable<Movimiento> {
    return this.http.get<Movimiento>(`${this.API_URL}/${id}`);
  }

  /**
   * Crea un nuevo movimiento
   */
  create(movimiento: CreateMovimientoDTO): Observable<Movimiento> {
    return this.http.post<Movimiento>(this.API_URL, movimiento).pipe(
      tap(() => {
        this.errorSignal.set(null);
      })
    );
  }

  /**
   * Actualiza un movimiento existente
   */
  update(id: number, movimiento: UpdateMovimientoDTO): Observable<Movimiento> {
    return this.http.put<Movimiento>(`${this.API_URL}/${id}`, movimiento).pipe(
      tap(() => {
        this.errorSignal.set(null);
      })
    );
  }

  /**
   * Elimina un movimiento
   */
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${id}`).pipe(
      tap(() => {
        this.errorSignal.set(null);
      })
    );
  }
}
