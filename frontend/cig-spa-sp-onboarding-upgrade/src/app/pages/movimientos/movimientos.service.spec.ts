import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { MovimientosService } from './movimientos.service';
import {
  Movimiento,
  CreateMovimientoDTO,
  UpdateMovimientoDTO,
  TipoMovimientoEnum,
} from '../../core/models/movimiento.model';
import { TipoCuentaEnum, ClienteResponseDTO } from '../../core/models/cuenta.model';
import { PaginatedResponse } from '../../core/models/common.model';
import { getApiUrl } from '../../core/config/api.config';

describe('MovimientosService', () => {
  let service: MovimientosService;
  let httpMock: HttpTestingController;
  const API_URL = getApiUrl('movimientos');

  const mockCliente: ClienteResponseDTO = {
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

  const mockMovimiento: Movimiento = {
    movimientoId: 1,
    fecha: '2025-01-15',
    tipoMovimiento: TipoMovimientoEnum.CREDITO,
    valor: 500,
    saldo: 1500,
    cuenta: {
      cuentaId: 1,
      numeroCuenta: '100001',
      tipoCuenta: TipoCuentaEnum.AHORROS,
      saldoInicial: 1000,
      cliente: mockCliente,
    },
  };

  const mockMovimientos: Movimiento[] = [
    mockMovimiento,
    {
      movimientoId: 2,
      fecha: '2025-01-16',
      tipoMovimiento: TipoMovimientoEnum.DEBITO,
      valor: 200,
      saldo: 1300,
      cuenta: {
        cuentaId: 1,
        numeroCuenta: '100001',
        tipoCuenta: TipoCuentaEnum.AHORROS,
        saldoInicial: 1000,
        cliente: mockCliente,
      },
    },
    {
      movimientoId: 3,
      fecha: '2025-01-17',
      tipoMovimiento: TipoMovimientoEnum.CREDITO,
      valor: 1000,
      saldo: 2300,
      cuenta: {
        cuentaId: 2,
        numeroCuenta: '100002',
        tipoCuenta: TipoCuentaEnum.CORRIENTE,
        saldoInicial: 2500,
        cliente: { ...mockCliente, id: 2, nombre: 'Maria Lopez' },
      },
    },
  ];

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(MovimientosService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('initial state', () => {
    it('should have empty movimientos signal', () => {
      expect(service.movimientos()).toEqual([]);
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
      req.flush(mockMovimientos);
    });

    it('should return paginated response from PaginatedResponse object', (done) => {
      const paginatedResponse: PaginatedResponse<Movimiento> = {
        content: mockMovimientos,
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
      req.flush(mockMovimientos);
    });

    it('should get second page', (done) => {
      service.getAll({ page: 1, size: 2 }).subscribe((response) => {
        expect(response.content.length).toBe(1);
        expect(response.number).toBe(1);
        expect(response.last).toBe(true);
        done();
      });

      const req = httpMock.expectOne(API_URL);
      req.flush(mockMovimientos);
    });

    it('should filter by fecha', (done) => {
      service.getAll({ page: 0, size: 5 }, '2025-01-15').subscribe((response) => {
        expect(response.content.length).toBe(1);
        expect(response.content[0].fecha).toBe('2025-01-15');
        done();
      });

      const req = httpMock.expectOne(API_URL);
      req.flush(mockMovimientos);
    });

    it('should filter by tipoMovimiento', (done) => {
      service.getAll({ page: 0, size: 5 }, 'debito').subscribe((response) => {
        expect(response.content.length).toBe(1);
        expect(response.content[0].tipoMovimiento).toBe(TipoMovimientoEnum.DEBITO);
        done();
      });

      const req = httpMock.expectOne(API_URL);
      req.flush(mockMovimientos);
    });

    it('should filter by valor', (done) => {
      service.getAll({ page: 0, size: 5 }, '500').subscribe((response) => {
        expect(response.content.length).toBe(1);
        expect(response.content[0].valor).toBe(500);
        done();
      });

      const req = httpMock.expectOne(API_URL);
      req.flush(mockMovimientos);
    });

    it('should filter by numeroCuenta', (done) => {
      service.getAll({ page: 0, size: 5 }, '100002').subscribe((response) => {
        expect(response.content.length).toBe(1);
        expect(response.content[0].cuenta?.numeroCuenta).toBe('100002');
        done();
      });

      const req = httpMock.expectOne(API_URL);
      req.flush(mockMovimientos);
    });

    it('should filter by cliente nombre', (done) => {
      service.getAll({ page: 0, size: 5 }, 'Maria').subscribe((response) => {
        expect(response.content.length).toBe(1);
        expect(response.content[0].cuenta?.cliente?.nombre).toBe('Maria Lopez');
        done();
      });

      const req = httpMock.expectOne(API_URL);
      req.flush(mockMovimientos);
    });

    it('should sort data ascending by valor', (done) => {
      service
        .getAll({ page: 0, size: 5, sort: { field: 'valor', direction: 'asc' } })
        .subscribe((response) => {
          expect(response.content[0].valor).toBe(200);
          expect(response.content[1].valor).toBe(500);
          expect(response.content[2].valor).toBe(1000);
          done();
        });

      const req = httpMock.expectOne(API_URL);
      req.flush(mockMovimientos);
    });

    it('should sort data descending by fecha', (done) => {
      service
        .getAll({ page: 0, size: 5, sort: { field: 'fecha', direction: 'desc' } })
        .subscribe((response) => {
          expect(response.content[0].fecha).toBe('2025-01-17');
          expect(response.content[2].fecha).toBe('2025-01-15');
          done();
        });

      const req = httpMock.expectOne(API_URL);
      req.flush(mockMovimientos);
    });

    it('should use default pagination when no params provided', (done) => {
      service.getAll().subscribe((response) => {
        expect(response.size).toBe(5);
        expect(response.number).toBe(0);
        done();
      });

      const req = httpMock.expectOne(API_URL);
      req.flush(mockMovimientos);
    });

    it('should set loading to true before request and false after', () => {
      service.getAll().subscribe();
      expect(service.loading()).toBe(true);

      const req = httpMock.expectOne(API_URL);
      req.flush(mockMovimientos);
      expect(service.loading()).toBe(false);
    });

    it('should update movimientos signal after successful request', (done) => {
      service.getAll({ page: 0, size: 5 }).subscribe(() => {
        expect(service.movimientos().length).toBe(3);
        done();
      });

      const req = httpMock.expectOne(API_URL);
      req.flush(mockMovimientos);
    });

    it('should set error on failure', () => {
      service.getAll().subscribe({
        error: () => {
          expect(service.error()).toBe('Error al cargar movimientos');
          expect(service.loading()).toBe(false);
        },
      });

      const req = httpMock.expectOne(API_URL);
      req.flush('Error', { status: 500, statusText: 'Server Error' });
    });

    it('should clear previous error on new request', () => {
      service.getAll().subscribe();
      const req = httpMock.expectOne(API_URL);
      req.flush(mockMovimientos);
      expect(service.error()).toBeNull();
    });

    it('should return empty response for no matching filter', (done) => {
      service.getAll({ page: 0, size: 5 }, 'nonexistent').subscribe((response) => {
        expect(response.content.length).toBe(0);
        expect(response.totalElements).toBe(0);
        expect(response.empty).toBe(true);
        done();
      });

      const req = httpMock.expectOne(API_URL);
      req.flush(mockMovimientos);
    });
  });

  describe('getById', () => {
    it('should return a single movimiento', (done) => {
      service.getById(1).subscribe((movimiento) => {
        expect(movimiento).toEqual(mockMovimiento);
        done();
      });

      const req = httpMock.expectOne(`${API_URL}/1`);
      expect(req.request.method).toBe('GET');
      req.flush(mockMovimiento);
    });

    it('should propagate error on failure', (done) => {
      service.getById(999).subscribe({
        error: (err) => {
          expect(err.status).toBe(404);
          done();
        },
      });

      const req = httpMock.expectOne(`${API_URL}/999`);
      req.flush('Not Found', { status: 404, statusText: 'Not Found' });
    });
  });

  describe('create', () => {
    it('should create a new movimiento', (done) => {
      const newMovimiento: CreateMovimientoDTO = {
        cuentaId: 1,
        fecha: '2025-01-20',
        valor: 300,
        tipoMovimiento: TipoMovimientoEnum.CREDITO,
      };

      service.create(newMovimiento).subscribe((result) => {
        expect(result.valor).toBe(300);
        expect(result.tipoMovimiento).toBe(TipoMovimientoEnum.CREDITO);
        done();
      });

      const req = httpMock.expectOne(API_URL);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(newMovimiento);
      req.flush({
        movimientoId: 4,
        fecha: '2025-01-20',
        tipoMovimiento: TipoMovimientoEnum.CREDITO,
        valor: 300,
        saldo: 1600,
        cuenta: mockMovimiento.cuenta,
      });
    });

    it('should clear error on successful create', (done) => {
      const newMovimiento: CreateMovimientoDTO = {
        cuentaId: 1,
        fecha: '2025-01-20',
        valor: 300,
        tipoMovimiento: TipoMovimientoEnum.CREDITO,
      };

      service.create(newMovimiento).subscribe(() => {
        expect(service.error()).toBeNull();
        done();
      });

      const req = httpMock.expectOne(API_URL);
      req.flush({ ...mockMovimiento, movimientoId: 4 });
    });

    it('should propagate error on create failure', (done) => {
      const newMovimiento: CreateMovimientoDTO = {
        cuentaId: 999,
        fecha: '2025-01-20',
        valor: 300,
        tipoMovimiento: TipoMovimientoEnum.DEBITO,
      };

      service.create(newMovimiento).subscribe({
        error: (err) => {
          expect(err.status).toBe(400);
          done();
        },
      });

      const req = httpMock.expectOne(API_URL);
      req.flush('Error', { status: 400, statusText: 'Bad Request' });
    });
  });

  describe('update', () => {
    it('should update an existing movimiento', (done) => {
      const updateData: UpdateMovimientoDTO = { valor: 800 };

      service.update(1, updateData).subscribe((result) => {
        expect(result.valor).toBe(800);
        done();
      });

      const req = httpMock.expectOne(`${API_URL}/1`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(updateData);
      req.flush({ ...mockMovimiento, valor: 800 });
    });

    it('should clear error on successful update', (done) => {
      const updateData: UpdateMovimientoDTO = { valor: 800 };

      service.update(1, updateData).subscribe(() => {
        expect(service.error()).toBeNull();
        done();
      });

      const req = httpMock.expectOne(`${API_URL}/1`);
      req.flush({ ...mockMovimiento, valor: 800 });
    });

    it('should propagate error on update failure', (done) => {
      service.update(1, { valor: 800 }).subscribe({
        error: (err) => {
          expect(err.status).toBe(500);
          done();
        },
      });

      const req = httpMock.expectOne(`${API_URL}/1`);
      req.flush('Error', { status: 500, statusText: 'Server Error' });
    });
  });

  describe('delete', () => {
    it('should delete a movimiento', (done) => {
      service.delete(1).subscribe(() => {
        expect(service.error()).toBeNull();
        done();
      });

      const req = httpMock.expectOne(`${API_URL}/1`);
      expect(req.request.method).toBe('DELETE');
      req.flush(null);
    });

    it('should propagate error on delete failure', (done) => {
      service.delete(1).subscribe({
        error: (err) => {
          expect(err.status).toBe(500);
          done();
        },
      });

      const req = httpMock.expectOne(`${API_URL}/1`);
      req.flush('Error', { status: 500, statusText: 'Server Error' });
    });
  });
});
