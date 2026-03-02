import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap, map } from 'rxjs/operators';
import { Cuenta, CreateCuentaDTO, UpdateCuentaDTO } from '../../core/models/cuenta.model';
import { PaginatedResponse, PageParams } from '../../core/models/common.model';
import { getApiUrl } from '../../core/config/api.config';

@Injectable({
  providedIn: 'root'
})
export class CuentasService {
  private readonly API_URL = getApiUrl('cuentas');
  private http = inject(HttpClient);

  // Estado reactivo con Signals
  private cuentasSignal = signal<Cuenta[]>([]);
  private loadingSignal = signal<boolean>(false);
  private errorSignal = signal<string | null>(null);

  // Computed signals (readonly)
  cuentas = this.cuentasSignal.asReadonly();
  loading = this.loadingSignal.asReadonly();
  error = this.errorSignal.asReadonly();

  /**
   * Obtiene todas las cuentas con paginación y ordenamiento (paginación en frontend)
   */
  getAll(params?: PageParams, searchTerm?: string): Observable<PaginatedResponse<Cuenta>> {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    // No enviamos parámetros de paginación al backend, lo manejamos en el frontend
    return this.http.get<Cuenta[] | PaginatedResponse<Cuenta>>(this.API_URL).pipe(
      map((response) => {
        let allCuentas: Cuenta[];

        // Si la respuesta es un array, usarlo directamente
        if (Array.isArray(response)) {
          allCuentas = response;
        } else {
          // Si es un objeto paginado, extraer el contenido
          allCuentas = response.content;
        }

        // Aplicar filtro de búsqueda si se especifica
        if (searchTerm && searchTerm.trim() !== '') {
          allCuentas = this.filterData(allCuentas, searchTerm);
          console.log(`🔍 Filtrado por "${searchTerm}": ${allCuentas.length} resultados`);
        }

        // Aplicar ordenamiento si se especifica
        if (params?.sort) {
          allCuentas = this.sortData(allCuentas, params.sort.field, params.sort.direction);
        }

        // Aplicar paginación
        const page = params?.page || 0;
        const size = params?.size || 5;
        const totalElements = allCuentas.length;
        const totalPages = Math.ceil(totalElements / size);
        const start = page * size;
        const end = start + size;
        const paginatedCuentas = allCuentas.slice(start, end);

        return {
          content: paginatedCuentas,
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
          this.cuentasSignal.set(response.content);
          this.loadingSignal.set(false);
        },
        error: (error) => {
          this.errorSignal.set('Error al cargar cuentas');
          this.loadingSignal.set(false);
          console.error('Error fetching cuentas:', error);
        }
      })
    );
  }

  /**
   * Ordena un array de cuentas
   */
  private sortData(data: Cuenta[], field: string, direction: 'asc' | 'desc'): Cuenta[] {
    return [...data].sort((a, b) => {
      const aValue = (a as any)[field];
      const bValue = (b as any)[field];

      if (aValue < bValue) return direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return direction === 'asc' ? 1 : -1;
      return 0;
    });
  }

  /**
   * Filtra un array de cuentas buscando en todas las columnas
   */
  private filterData(data: Cuenta[], searchTerm: string): Cuenta[] {
    const term = searchTerm.toLowerCase().trim();

    return data.filter(cuenta => {
      // Buscar en número de cuenta
      if (cuenta.numeroCuenta?.toLowerCase().includes(term)) return true;

      // Buscar en tipo de cuenta
      if (cuenta.tipoCuenta?.toLowerCase().includes(term)) return true;

      // Buscar en saldo inicial (convertir a string)
      if (cuenta.saldoInicial?.toString().includes(term)) return true;

      // Buscar en nombre del cliente (solo si existe)
      if (cuenta.cliente?.nombre?.toLowerCase().includes(term)) return true;

      // Buscar en identificación del cliente (solo si existe)
      if (cuenta.cliente?.identificacion?.toLowerCase().includes(term)) return true;

      // Buscar en estado del cliente (solo si el cliente existe)
      if (cuenta.cliente) {
        const estadoText = cuenta.cliente.estado ? 'activo' : 'inactivo';
        if (estadoText.includes(term)) return true;
      }

      return false;
    });
  }

  /**
   * Obtiene una cuenta por ID
   */
  getById(id: number): Observable<Cuenta> {
    this.loadingSignal.set(true);
    return this.http.get<Cuenta>(`${this.API_URL}/${id}`).pipe(
      tap({
        next: () => this.loadingSignal.set(false),
        error: (error) => {
          this.errorSignal.set('Error al cargar la cuenta');
          this.loadingSignal.set(false);
          console.error('Error fetching cuenta:', error);
        }
      })
    );
  }

  /**
   * Crea una nueva cuenta
   */
  create(cuenta: CreateCuentaDTO): Observable<Cuenta> {
    this.loadingSignal.set(true);
    return this.http.post<Cuenta>(this.API_URL, cuenta).pipe(
      tap({
        next: () => this.loadingSignal.set(false),
        error: (error) => {
          this.errorSignal.set('Error al crear la cuenta');
          this.loadingSignal.set(false);
          console.error('Error creating cuenta:', error);
        }
      })
    );
  }

  /**
   * Actualiza una cuenta existente
   */
  update(id: number, cuenta: UpdateCuentaDTO): Observable<Cuenta> {
    this.loadingSignal.set(true);
    return this.http.put<Cuenta>(`${this.API_URL}/${id}`, cuenta).pipe(
      tap({
        next: () => this.loadingSignal.set(false),
        error: (error) => {
          this.errorSignal.set('Error al actualizar la cuenta');
          this.loadingSignal.set(false);
          console.error('Error updating cuenta:', error);
        }
      })
    );
  }

  /**
   * Elimina una cuenta
   */
  delete(id: number): Observable<void> {
    this.loadingSignal.set(true);
    return this.http.delete<void>(`${this.API_URL}/${id}`).pipe(
      tap({
        next: () => {
          // Actualizar la lista de cuentas eliminando la cuenta borrada
          this.cuentasSignal.update(cuentas =>
            cuentas.filter(c => c.cuentaId !== id)
          );
          this.loadingSignal.set(false);
        },
        error: (error) => {
          this.errorSignal.set('Error al eliminar la cuenta');
          this.loadingSignal.set(false);
          console.error('Error deleting cuenta:', error);
        }
      })
    );
  }

  /**
   * Busca cuentas por número de cuenta o nombre de cliente
   */
  search(term: string, params?: PageParams): Observable<PaginatedResponse<Cuenta>> {
    this.loadingSignal.set(true);

    let httpParams = new HttpParams().set('search', term);

    if (params) {
      httpParams = httpParams.set('page', params.page.toString());
      httpParams = httpParams.set('size', params.size.toString());

      if (params.sort) {
        httpParams = httpParams.set('sort', `${params.sort.field},${params.sort.direction}`);
      }
    }

    return this.http.get<PaginatedResponse<Cuenta>>(`${this.API_URL}/search`, { params: httpParams }).pipe(
      tap({
        next: (response) => {
          this.cuentasSignal.set(response.content);
          this.loadingSignal.set(false);
        },
        error: (error) => {
          this.errorSignal.set('Error al buscar cuentas');
          this.loadingSignal.set(false);
          console.error('Error searching cuentas:', error);
        }
      })
    );
  }
}
