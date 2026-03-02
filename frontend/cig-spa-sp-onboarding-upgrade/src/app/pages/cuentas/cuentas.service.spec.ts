import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { CuentasService } from './cuentas.service';
import {
  Cuenta,
  CreateCuentaDTO,
  UpdateCuentaDTO,
  TipoCuentaEnum,
  ClienteResponseDTO,
} from '../../core/models/cuenta.model';
import { PaginatedResponse } from '../../core/models/common.model';
import { getApiUrl } from '../../core/config/api.config';

describe('CuentasService', () => {
  let service: CuentasService;
  let httpMock: HttpTestingController;
  const API_URL = getApiUrl('cuentas');

  const mockClienteResponse: ClienteResponseDTO = {
    id: 1,
    nombre: 'Juan Perez',
    identificacion: '1234567890',
    edad: 30,
    genero: 'MASCULINO',
    telefono: '0999999999',
    direccion: 'Quito, Ecuador',
    contrasena: '1234',
    estado: true,
  };

  const mockCuenta: Cuenta = {
    cuentaId: 1,
    numeroCuenta: '100001',
    tipoCuenta: TipoCuentaEnum.AHORROS,
    saldoInicial: 1000,
    cliente: mockClienteResponse,
  };

  const mockCuentas: Cuenta[] = [
    mockCuenta,
    {
      cuentaId: 2,
      numeroCuenta: '100002',
      tipoCuenta: TipoCuentaEnum.CORRIENTE,
      saldoInicial: 2500,
      cliente: {
        ...mockClienteResponse,
        id: 2,
        nombre: 'Maria Lopez',
        identificacion: '0987654321',
      },
    },
    {
      cuentaId: 3,
      numeroCuenta: '100003',
      tipoCuenta: TipoCuentaEnum.AHORROS,
      saldoInicial: 500,
      cliente: {
        ...mockClienteResponse,
        id: 3,
        nombre: 'Carlos Ruiz',
        identificacion: '1122334455',
        estado: false,
      },
    },
  ];

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(CuentasService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('initial state', () => {
    it('should have empty cuentas signal', () => {
      expect(service.cuentas()).toEqual([]);
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
      req.flush(mockCuentas);
    });

    it('should return paginated response from PaginatedResponse object', (done) => {
      const paginatedResponse: PaginatedResponse<Cuenta> = {
        content: mockCuentas,
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
      req.flush(mockCuentas);
    });

    it('should filter by numeroCuenta', (done) => {
      service.getAll({ page: 0, size: 5 }, '100002').subscribe((response) => {
        expect(response.content.length).toBe(1);
        expect(response.content[0].numeroCuenta).toBe('100002');
        done();
      });

      const req = httpMock.expectOne(API_URL);
      req.flush(mockCuentas);
    });

    it('should filter by tipoCuenta', (done) => {
      service.getAll({ page: 0, size: 5 }, 'corriente').subscribe((response) => {
        expect(response.content.length).toBe(1);
        expect(response.content[0].tipoCuenta).toBe(TipoCuentaEnum.CORRIENTE);
        done();
      });

      const req = httpMock.expectOne(API_URL);
      req.flush(mockCuentas);
    });

    it('should filter by cliente nombre', (done) => {
      service.getAll({ page: 0, size: 5 }, 'Maria').subscribe((response) => {
        expect(response.content.length).toBe(1);
        expect(response.content[0].cliente.nombre).toBe('Maria Lopez');
        done();
      });

      const req = httpMock.expectOne(API_URL);
      req.flush(mockCuentas);
    });

    it('should filter by cliente identificacion', (done) => {
      service.getAll({ page: 0, size: 5 }, '0987654321').subscribe((response) => {
        expect(response.content.length).toBe(1);
        expect(response.content[0].cliente.identificacion).toBe('0987654321');
        done();
      });

      const req = httpMock.expectOne(API_URL);
      req.flush(mockCuentas);
    });

    it('should filter by saldoInicial', (done) => {
      service.getAll({ page: 0, size: 5 }, '2500').subscribe((response) => {
        expect(response.content.length).toBe(1);
        expect(response.content[0].saldoInicial).toBe(2500);
        done();
      });

      const req = httpMock.expectOne(API_URL);
      req.flush(mockCuentas);
    });

    it('should filter by cliente estado (inactivo)', (done) => {
      service.getAll({ page: 0, size: 5 }, 'inactivo').subscribe((response) => {
        expect(response.content.length).toBe(1);
        expect(response.content[0].cliente.estado).toBe(false);
        done();
      });

      const req = httpMock.expectOne(API_URL);
      req.flush(mockCuentas);
    });

    it('should sort data ascending by numeroCuenta', (done) => {
      service
        .getAll({ page: 0, size: 5, sort: { field: 'numeroCuenta', direction: 'asc' } })
        .subscribe((response) => {
          expect(response.content[0].numeroCuenta).toBe('100001');
          expect(response.content[2].numeroCuenta).toBe('100003');
          done();
        });

      const req = httpMock.expectOne(API_URL);
      req.flush(mockCuentas);
    });

    it('should sort data descending by saldoInicial', (done) => {
      service
        .getAll({ page: 0, size: 5, sort: { field: 'saldoInicial', direction: 'desc' } })
        .subscribe((response) => {
          expect(response.content[0].saldoInicial).toBe(2500);
          expect(response.content[2].saldoInicial).toBe(500);
          done();
        });

      const req = httpMock.expectOne(API_URL);
      req.flush(mockCuentas);
    });

    it('should use default pagination when no params provided', (done) => {
      service.getAll().subscribe((response) => {
        expect(response.size).toBe(5);
        expect(response.number).toBe(0);
        done();
      });

      const req = httpMock.expectOne(API_URL);
      req.flush(mockCuentas);
    });

    it('should set loading to true before request and false after', () => {
      service.getAll().subscribe();
      expect(service.loading()).toBe(true);

      const req = httpMock.expectOne(API_URL);
      req.flush(mockCuentas);
      expect(service.loading()).toBe(false);
    });

    it('should set error on failure', () => {
      service.getAll().subscribe({
        error: () => {
          expect(service.error()).toBe('Error al cargar cuentas');
          expect(service.loading()).toBe(false);
        },
      });

      const req = httpMock.expectOne(API_URL);
      req.flush('Error', { status: 500, statusText: 'Server Error' });
    });

    it('should clear previous error on new request', () => {
      service.getAll().subscribe();
      const req = httpMock.expectOne(API_URL);
      req.flush(mockCuentas);
      expect(service.error()).toBeNull();
    });
  });

  describe('getById', () => {
    it('should return a single cuenta', (done) => {
      service.getById(1).subscribe((cuenta) => {
        expect(cuenta).toEqual(mockCuenta);
        expect(service.loading()).toBe(false);
        done();
      });

      const req = httpMock.expectOne(`${API_URL}/1`);
      expect(req.request.method).toBe('GET');
      req.flush(mockCuenta);
    });

    it('should set error on failure', () => {
      service.getById(999).subscribe({
        error: () => {
          expect(service.error()).toBe('Error al cargar la cuenta');
          expect(service.loading()).toBe(false);
        },
      });

      const req = httpMock.expectOne(`${API_URL}/999`);
      req.flush('Not Found', { status: 404, statusText: 'Not Found' });
    });
  });

  describe('create', () => {
    it('should create a new cuenta', (done) => {
      const newCuenta: CreateCuentaDTO = {
        numeroCuenta: '100004',
        tipoCuenta: TipoCuentaEnum.AHORROS,
        saldoInicial: 3000,
        clienteId: 1,
      };

      service.create(newCuenta).subscribe((result) => {
        expect(result.numeroCuenta).toBe('100004');
        expect(service.loading()).toBe(false);
        done();
      });

      const req = httpMock.expectOne(API_URL);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(newCuenta);
      req.flush({ ...mockCuenta, cuentaId: 4, numeroCuenta: '100004', saldoInicial: 3000 });
    });

    it('should set error on create failure', () => {
      const newCuenta: CreateCuentaDTO = {
        numeroCuenta: '100004',
        tipoCuenta: TipoCuentaEnum.AHORROS,
        saldoInicial: 3000,
        clienteId: 1,
      };

      service.create(newCuenta).subscribe({
        error: () => {
          expect(service.error()).toBe('Error al crear la cuenta');
          expect(service.loading()).toBe(false);
        },
      });

      const req = httpMock.expectOne(API_URL);
      req.flush('Error', { status: 400, statusText: 'Bad Request' });
    });
  });

  describe('update', () => {
    it('should update an existing cuenta', (done) => {
      const updateData: UpdateCuentaDTO = { saldoInicial: 5000 };

      service.update(1, updateData).subscribe((result) => {
        expect(result.saldoInicial).toBe(5000);
        expect(service.loading()).toBe(false);
        done();
      });

      const req = httpMock.expectOne(`${API_URL}/1`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(updateData);
      req.flush({ ...mockCuenta, saldoInicial: 5000 });
    });

    it('should set error on update failure', () => {
      service.update(1, { saldoInicial: 5000 }).subscribe({
        error: () => {
          expect(service.error()).toBe('Error al actualizar la cuenta');
          expect(service.loading()).toBe(false);
        },
      });

      const req = httpMock.expectOne(`${API_URL}/1`);
      req.flush('Error', { status: 500, statusText: 'Server Error' });
    });
  });

  describe('delete', () => {
    it('should delete a cuenta and update signal', (done) => {
      service.getAll().subscribe();
      const getAllReq = httpMock.expectOne(API_URL);
      getAllReq.flush(mockCuentas);

      expect(service.cuentas().length).toBe(3);

      service.delete(1).subscribe(() => {
        expect(service.cuentas().length).toBe(2);
        expect(service.cuentas().find((c) => c.cuentaId === 1)).toBeUndefined();
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
          expect(service.error()).toBe('Error al eliminar la cuenta');
          expect(service.loading()).toBe(false);
        },
      });

      const req = httpMock.expectOne(`${API_URL}/1`);
      req.flush('Error', { status: 500, statusText: 'Server Error' });
    });
  });

  describe('search', () => {
    it('should search cuentas with term', (done) => {
      const paginatedResponse: PaginatedResponse<Cuenta> = {
        content: [mockCuenta],
        totalElements: 1,
        totalPages: 1,
        size: 5,
        number: 0,
        first: true,
        last: true,
        empty: false,
      };

      service.search('100001').subscribe((response) => {
        expect(response.content.length).toBe(1);
        done();
      });

      const req = httpMock.expectOne((r) => r.url === `${API_URL}/search`);
      expect(req.request.method).toBe('GET');
      expect(req.request.params.get('search')).toBe('100001');
      req.flush(paginatedResponse);
    });

    it('should search with pagination params', (done) => {
      const paginatedResponse: PaginatedResponse<Cuenta> = {
        content: [mockCuenta],
        totalElements: 1,
        totalPages: 1,
        size: 10,
        number: 0,
        first: true,
        last: true,
        empty: false,
      };

      service
        .search('100001', { page: 0, size: 10, sort: { field: 'numeroCuenta', direction: 'asc' } })
        .subscribe((response) => {
          expect(response.content).toBeDefined();
          done();
        });

      const req = httpMock.expectOne(
        (r) => r.url === `${API_URL}/search` && r.params.get('page') === '0'
      );
      expect(req.request.params.get('size')).toBe('10');
      expect(req.request.params.get('sort')).toBe('numeroCuenta,asc');
      req.flush(paginatedResponse);
    });

    it('should set error on search failure', () => {
      service.search('test').subscribe({
        error: () => {
          expect(service.error()).toBe('Error al buscar cuentas');
          expect(service.loading()).toBe(false);
        },
      });

      const req = httpMock.expectOne((r) => r.url === `${API_URL}/search`);
      req.flush('Error', { status: 500, statusText: 'Server Error' });
    });
  });
});
