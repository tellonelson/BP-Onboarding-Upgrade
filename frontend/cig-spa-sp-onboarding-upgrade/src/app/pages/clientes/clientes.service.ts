import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap, map } from 'rxjs/operators';
import { Cliente, CreateClienteDTO, UpdateClienteDTO } from '../../core/models/cliente.model';
import { PaginatedResponse, PageParams } from '../../core/models/common.model';
import { getApiUrl } from '../../core/config/api.config';

@Injectable({
  providedIn: 'root'
})
export class ClientesService {
  private readonly API_URL = getApiUrl('clientes');
  private http = inject(HttpClient);

  // Estado reactivo con Signals
  private clientesSignal = signal<Cliente[]>([]);
  private loadingSignal = signal<boolean>(false);
  private errorSignal = signal<string | null>(null);

  // Computed signals (readonly)
  clientes = this.clientesSignal.asReadonly();
  loading = this.loadingSignal.asReadonly();
  error = this.errorSignal.asReadonly();

  /**
   * Obtiene todos los clientes con paginación y ordenamiento (paginación en frontend)
   */
  getAll(params?: PageParams, searchTerm?: string): Observable<PaginatedResponse<Cliente>> {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    // No enviamos parámetros de paginación al backend, lo manejamos en el frontend
    return this.http.get<Cliente[] | PaginatedResponse<Cliente>>(this.API_URL).pipe(
      map((response) => {
        let allClientes: Cliente[];

        // Si la respuesta es un array, usarlo directamente
        if (Array.isArray(response)) {
          console.log('📦 Backend devolvió array simple, paginando en frontend');
          allClientes = response;
        } else {
          // Si es un objeto paginado, extraer el contenido
          allClientes = response.content;
        }

        // Aplicar filtro de búsqueda si se especifica
        if (searchTerm && searchTerm.trim() !== '') {
          allClientes = this.filterData(allClientes, searchTerm);
          console.log(`🔍 Filtrado por "${searchTerm}": ${allClientes.length} resultados`);
        }

        // Aplicar ordenamiento si se especifica
        if (params?.sort) {
          allClientes = this.sortData(allClientes, params.sort.field, params.sort.direction);
        }

        // Aplicar paginación
        const page = params?.page || 0;
        const size = params?.size || 5;
        const totalElements = allClientes.length;
        const totalPages = Math.ceil(totalElements / size);
        const start = page * size;
        const end = start + size;
        const paginatedClientes = allClientes.slice(start, end);

        return {
          content: paginatedClientes,
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
          this.clientesSignal.set(response.content);
          this.loadingSignal.set(false);
        },
        error: (error) => {
          this.errorSignal.set('Error al cargar clientes');
          this.loadingSignal.set(false);
          console.error('Error fetching clientes:', error);
        }
      })
    );
  }

  /**
   * Ordena un array de clientes
   */
  private sortData(data: Cliente[], field: string, direction: 'asc' | 'desc'): Cliente[] {
    return [...data].sort((a, b) => {
      const aValue = (a as any)[field];
      const bValue = (b as any)[field];

      if (aValue < bValue) return direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return direction === 'asc' ? 1 : -1;
      return 0;
    });
  }

  /**
   * Filtra un array de clientes buscando en todas las columnas
   */
  private filterData(data: Cliente[], searchTerm: string): Cliente[] {
    const term = searchTerm.toLowerCase().trim();

    return data.filter(cliente => {
      // Buscar en nombre
      if (cliente.nombre?.toLowerCase().includes(term)) return true;

      // Buscar en identificación
      if (cliente.identificacion?.toLowerCase().includes(term)) return true;

      // Buscar en edad (convertir a string)
      if (cliente.edad?.toString().includes(term)) return true;

      // Buscar en teléfono
      if (cliente.telefono?.toLowerCase().includes(term)) return true;

      // Buscar en dirección
      if (cliente.direccion?.toLowerCase().includes(term)) return true;

      // Buscar en género
      if (cliente.genero?.toLowerCase().includes(term)) return true;

      // Buscar en estado (activo/inactivo)
      const estadoText = cliente.estado ? 'activo' : 'inactivo';
      if (estadoText.includes(term)) return true;

      return false;
    });
  }

  /**
   * Obtiene un cliente por ID
   */
  getById(id: number): Observable<Cliente> {
    this.loadingSignal.set(true);
    return this.http.get<Cliente>(`${this.API_URL}/${id}`).pipe(
      tap({
        next: () => this.loadingSignal.set(false),
        error: (error) => {
          this.errorSignal.set('Error al cargar el cliente');
          this.loadingSignal.set(false);
          console.error('Error fetching cliente:', error);
        }
      })
    );
  }

  /**
   * Crea un nuevo cliente
   */
  create(cliente: CreateClienteDTO): Observable<Cliente> {
    this.loadingSignal.set(true);
    return this.http.post<Cliente>(this.API_URL, cliente).pipe(
      tap({
        next: () => this.loadingSignal.set(false),
        error: (error) => {
          this.errorSignal.set('Error al crear el cliente');
          this.loadingSignal.set(false);
          console.error('Error creating cliente:', error);
        }
      })
    );
  }

  /**
   * Actualiza un cliente existente
   */
  update(id: number, cliente: UpdateClienteDTO): Observable<Cliente> {
    this.loadingSignal.set(true);
    return this.http.put<Cliente>(`${this.API_URL}/${id}`, cliente).pipe(
      tap({
        next: () => this.loadingSignal.set(false),
        error: (error) => {
          this.errorSignal.set('Error al actualizar el cliente');
          this.loadingSignal.set(false);
          console.error('Error updating cliente:', error);
        }
      })
    );
  }

  /**
   * Elimina un cliente
   */
  delete(id: number): Observable<void> {
    this.loadingSignal.set(true);
    return this.http.delete<void>(`${this.API_URL}/${id}`).pipe(
      tap({
        next: () => {
          // Actualizar la lista de clientes eliminando el cliente borrado
          this.clientesSignal.update(clientes =>
            clientes.filter(c => c.id !== id)
          );
          this.loadingSignal.set(false);
        },
        error: (error) => {
          this.errorSignal.set('Error al eliminar el cliente');
          this.loadingSignal.set(false);
          console.error('Error deleting cliente:', error);
        }
      })
    );
  }

  /**
   * Busca clientes por nombre o identificación
   */
  search(term: string, params?: PageParams): Observable<PaginatedResponse<Cliente>> {
    this.loadingSignal.set(true);

    let httpParams = new HttpParams().set('search', term);

    if (params) {
      httpParams = httpParams.set('page', params.page.toString());
      httpParams = httpParams.set('size', params.size.toString());

      if (params.sort) {
        httpParams = httpParams.set('sort', `${params.sort.field},${params.sort.direction}`);
      }
    }

    return this.http.get<Cliente[] | PaginatedResponse<Cliente>>(`${this.API_URL}/search`, { params: httpParams }).pipe(
      map((response) => {
        // Si la respuesta es un array, convertirlo a formato paginado
        if (Array.isArray(response)) {
          return {
            content: response,
            totalElements: response.length,
            totalPages: 1,
            size: response.length,
            number: 0,
            first: true,
            last: true,
            empty: response.length === 0
          };
        }
        return response;
      }),
      tap({
        next: (response) => {
          this.clientesSignal.set(response.content);
          this.loadingSignal.set(false);
        },
        error: (error) => {
          this.errorSignal.set('Error al buscar clientes');
          this.loadingSignal.set(false);
          console.error('Error searching clientes:', error);
        }
      })
    );
  }
}
