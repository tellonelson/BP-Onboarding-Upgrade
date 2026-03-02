import { Cuenta } from './cuenta.model';

export enum TipoMovimientoEnum {
  CREDITO = 'CREDITO',
  DEBITO = 'DEBITO'
}

export interface Movimiento {
  movimientoId: number;
  fecha: string;
  tipoMovimiento: TipoMovimientoEnum;
  valor: number;
  saldo: number;
  cuenta: Cuenta | null;
}

export interface CreateMovimientoDTO {
  cuentaId: number;
  fecha: string;
  valor: number;
  tipoMovimiento: TipoMovimientoEnum;
}

export interface UpdateMovimientoDTO {
  cuentaId?: number;
  fecha?: string;
  valor?: number;
  tipoMovimiento?: TipoMovimientoEnum;
}
