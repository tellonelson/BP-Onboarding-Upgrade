import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { ClientesService } from './clientes.service';
import { Cliente, CreateClienteDTO, UpdateClienteDTO, GeneroEnum } from '../../core/models/cliente.model';
import { PaginatedResponse } from '../../core/models/common.model';
import { getApiUrl } from '../../core/config/api.config';

describe('ClientesService', () => {
  let service: ClientesService;
  let httpMock: HttpTestingController;
  const API_URL = getApiUrl('clientes');

  const mockCliente: Cliente = {
    id: 1,
    nombre: 'Juan Perez',
    identificacion: '1234567890',
    edad: 30,
    genero: GeneroEnum.MASCULINO,
    telefono: '0999999999',
    direccion: 'Quito, Ecuador',
    contrasena: '1234',
    estado: true,
  };

  const mockClientes: Cliente[] = [
    mockCliente,
    {
      id: 2,
      nombre: 'Maria Lopez',
      identificacion: '0987654321',
      edad: 25,
      genero: GeneroEnum.FEMENINO,
      telefono: '0988888888',
      direccion: 'Guayaquil, Ecuador',
      contrasena: '5678',
      estado: true,
    },
    {
      id: 3,
      nombre: 'Carlos Ruiz',
      identificacion: '1122334455',
      edad: 40,
      genero: GeneroEnum.MASCULINO,
      telefono: '0977777777',
      direccion: 'Cuenca, Ecuador',
      contrasena: '9012',
      estado: false,
    },
  ];

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(ClientesService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('initial state', () => {
    it('should have empty clientes signal', () => {
      expect(service.clientes()).toEqual([]);
    });

    it('should have loading as false', () => {
      expect(service.loading()).toBe(false);
    });

    it('should have error as null', () => {
      expect(service.error()).toBeNull();
    });
  });

  describe('getAll', () => {
    it('should return paginated response from array', (done) => {
      service.getAll({ page: 0, size: 5 }).subscribe((response) => {
        expect(response.content.length).toBe(3);
        expect(response.totalElements).toBe(3);
        expect(response.totalPages).toBe(1);
        expect(response.first).toBe(true);
        expect(service.loading()).toBe(false);
        done();
      });

      const req = httpMock.expectOne(API_URL);
      expect(req.request.method).toBe('GET');
      req.flush(mockClientes);
    });

    it('should return paginated response from PaginatedResponse object', (done) => {
      const paginatedResponse: PaginatedResponse<Cliente> = {
        content: mockClientes,
        totalElements: 3,
        totalPages: 1,
        size: 5,
        number: 0,
        first: true,
        last: true,
        empty: false,
      };

      service.getAll({ page: 0, size: 5 }).subscribe((response) => {
        expect(response.content.length).toBe(3);
        expect(response.totalElements).toBe(3);
        done();
      });

      const req = httpMock.expectOne(API_URL);
      req.flush(paginatedResponse);
    });

    it('should paginate results correctly', (done) => {
      service.getAll({ page: 0, size: 2 }).subscribe((response) => {
        expect(response.content.length).toBe(2);
        expect(response.totalElements).toBe(3);
        expect(response.totalPages).toBe(2);
        expect(response.first).toBe(true);
        expect(response.last).toBe(false);
        done();
      });

      const req = httpMock.expectOne(API_URL);
      req.flush(mockClientes);
    });

    it('should filter by search term (nombre)', (done) => {
      service.getAll({ page: 0, size: 5 }, 'Juan').subscribe((response) => {
        expect(response.content.length).toBe(1);
        expect(response.content[0].nombre).toBe('Juan Perez');
        expect(response.totalElements).toBe(1);
        done();
      });

      const req = httpMock.expectOne(API_URL);
      req.flush(mockClientes);
    });

    it('should filter by identificacion', (done) => {
      service.getAll({ page: 0, size: 5 }, '0987654321').subscribe((response) => {
        expect(response.content.length).toBe(1);
        expect(response.content[0].nombre).toBe('Maria Lopez');
        done();
      });

      const req = httpMock.expectOne(API_URL);
      req.flush(mockClientes);
    });

    it('should filter by estado (inactivo)', (done) => {
      service.getAll({ page: 0, size: 5 }, 'inactivo').subscribe((response) => {
        expect(response.content.length).toBe(1);
        expect(response.content[0].nombre).toBe('Carlos Ruiz');
        done();
      });

      const req = httpMock.expectOne(API_URL);
      req.flush(mockClientes);
    });

    it('should sort data ascending', (done) => {
      service
        .getAll({ page: 0, size: 5, sort: { field: 'nombre', direction: 'asc' } })
        .subscribe((response) => {
          expect(response.content[0].nombre).toBe('Carlos Ruiz');
          expect(response.content[1].nombre).toBe('Juan Perez');
          expect(response.content[2].nombre).toBe('Maria Lopez');
          done();
        });

      const req = httpMock.expectOne(API_URL);
      req.flush(mockClientes);
    });

    it('should sort data descending', (done) => {
      service
        .getAll({ page: 0, size: 5, sort: { field: 'nombre', direction: 'desc' } })
        .subscribe((response) => {
          expect(response.content[0].nombre).toBe('Maria Lopez');
          expect(response.content[2].nombre).toBe('Carlos Ruiz');
          done();
        });

      const req = httpMock.expectOne(API_URL);
      req.flush(mockClientes);
    });

    it('should use default pagination when no params provided', (done) => {
      service.getAll().subscribe((response) => {
        expect(response.size).toBe(5);
        expect(response.number).toBe(0);
        done();
      });

      const req = httpMock.expectOne(API_URL);
      req.flush(mockClientes);
    });

    it('should set loading to true before request and false after', () => {
      service.getAll().subscribe();
      expect(service.loading()).toBe(true);

      const req = httpMock.expectOne(API_URL);
      req.flush(mockClientes);
      expect(service.loading()).toBe(false);
    });

    it('should set error on failure', () => {
      service.getAll().subscribe({
        error: () => {
          expect(service.error()).toBe('Error al cargar clientes');
          expect(service.loading()).toBe(false);
        },
      });

      const req = httpMock.expectOne(API_URL);
      req.flush('Error', { status: 500, statusText: 'Server Error' });
    });

    it('should clear previous error on new request', () => {
      service.getAll().subscribe();
      const req = httpMock.expectOne(API_URL);
      req.flush(mockClientes);
      expect(service.error()).toBeNull();
    });
  });

  describe('getById', () => {
    it('should return a single cliente', (done) => {
      service.getById(1).subscribe((cliente) => {
        expect(cliente).toEqual(mockCliente);
        expect(service.loading()).toBe(false);
        done();
      });

      const req = httpMock.expectOne(`${API_URL}/1`);
      expect(req.request.method).toBe('GET');
      req.flush(mockCliente);
    });

    it('should set error on failure', () => {
      service.getById(999).subscribe({
        error: () => {
          expect(service.error()).toBe('Error al cargar el cliente');
          expect(service.loading()).toBe(false);
        },
      });

      const req = httpMock.expectOne(`${API_URL}/999`);
      req.flush('Not Found', { status: 404, statusText: 'Not Found' });
    });
  });

  describe('create', () => {
    it('should create a new cliente', (done) => {
      const newCliente: CreateClienteDTO = {
        nombre: 'Nuevo Cliente',
        identificacion: '5555555555',
        edad: 28,
        genero: GeneroEnum.MASCULINO,
        telefono: '0966666666',
        direccion: 'Ambato, Ecuador',
        contrasena: '3456',
        estado: true,
      };

      service.create(newCliente).subscribe((result) => {
        expect(result.nombre).toBe('Nuevo Cliente');
        expect(service.loading()).toBe(false);
        done();
      });

      const req = httpMock.expectOne(API_URL);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(newCliente);
      req.flush({ ...newCliente, id: 4 });
    });

    it('should set error on create failure', () => {
      const newCliente: CreateClienteDTO = {
        nombre: 'Test',
        identificacion: '111',
        edad: 20,
        genero: GeneroEnum.OTRO,
        telefono: '000',
        direccion: 'Test',
        contrasena: '123',
        estado: true,
      };

      service.create(newCliente).subscribe({
        error: () => {
          expect(service.error()).toBe('Error al crear el cliente');
          expect(service.loading()).toBe(false);
        },
      });

      const req = httpMock.expectOne(API_URL);
      req.flush('Error', { status: 400, statusText: 'Bad Request' });
    });
  });

  describe('update', () => {
    it('should update an existing cliente', (done) => {
      const updateData: UpdateClienteDTO = { nombre: 'Juan Actualizado' };

      service.update(1, updateData).subscribe((result) => {
        expect(result.nombre).toBe('Juan Actualizado');
        expect(service.loading()).toBe(false);
        done();
      });

      const req = httpMock.expectOne(`${API_URL}/1`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(updateData);
      req.flush({ ...mockCliente, nombre: 'Juan Actualizado' });
    });

    it('should set error on update failure', () => {
      service.update(1, { nombre: 'Test' }).subscribe({
        error: () => {
          expect(service.error()).toBe('Error al actualizar el cliente');
          expect(service.loading()).toBe(false);
        },
      });

      const req = httpMock.expectOne(`${API_URL}/1`);
      req.flush('Error', { status: 500, statusText: 'Server Error' });
    });
  });

  describe('delete', () => {
    it('should delete a cliente and update signal', (done) => {
      service.getAll().subscribe();
      const getAllReq = httpMock.expectOne(API_URL);
      getAllReq.flush(mockClientes);

      expect(service.clientes().length).toBe(3);

      service.delete(1).subscribe(() => {
        expect(service.clientes().length).toBe(2);
        expect(service.clientes().find((c) => c.id === 1)).toBeUndefined();
        expect(service.loading()).toBe(false);
        done();
      });

      const req = httpMock.expectOne(`${API_URL}/1`);
      expect(req.request.method).toBe('DELETE');
      req.flush(null);
    });

    it('should set error on delete failure', () => {
      service.delete(1).subscribe({
        error: () => {
          expect(service.error()).toBe('Error al eliminar el cliente');
          expect(service.loading()).toBe(false);
        },
      });

      const req = httpMock.expectOne(`${API_URL}/1`);
      req.flush('Error', { status: 500, statusText: 'Server Error' });
    });
  });

  describe('search', () => {
    it('should search clientes with term', (done) => {
      service.search('Juan').subscribe((response) => {
        expect(response.content.length).toBe(1);
        done();
      });

      const req = httpMock.expectOne((r) => r.url === `${API_URL}/search`);
      expect(req.request.method).toBe('GET');
      expect(req.request.params.get('search')).toBe('Juan');
      req.flush([mockCliente]);
    });

    it('should search with pagination params', (done) => {
      service
        .search('Juan', { page: 0, size: 10, sort: { field: 'nombre', direction: 'asc' } })
        .subscribe((response) => {
          expect(response.content).toBeDefined();
          done();
        });

      const req = httpMock.expectOne(
        (r) => r.url === `${API_URL}/search` && r.params.get('page') === '0'
      );
      expect(req.request.params.get('size')).toBe('10');
      expect(req.request.params.get('sort')).toBe('nombre,asc');
      req.flush([mockCliente]);
    });

    it('should handle paginated response from search', (done) => {
      const paginatedResponse: PaginatedResponse<Cliente> = {
        content: [mockCliente],
        totalElements: 1,
        totalPages: 1,
        size: 5,
        number: 0,
        first: true,
        last: true,
        empty: false,
      };

      service.search('Juan').subscribe((response) => {
        expect(response.totalElements).toBe(1);
        expect(response.content[0].nombre).toBe('Juan Perez');
        done();
      });

      const req = httpMock.expectOne((r) => r.url === `${API_URL}/search`);
      req.flush(paginatedResponse);
    });

    it('should set error on search failure', () => {
      service.search('test').subscribe({
        error: () => {
          expect(service.error()).toBe('Error al buscar clientes');
          expect(service.loading()).toBe(false);
        },
      });

      const req = httpMock.expectOne((r) => r.url === `${API_URL}/search`);
      req.flush('Error', { status: 500, statusText: 'Server Error' });
    });
  });
});
