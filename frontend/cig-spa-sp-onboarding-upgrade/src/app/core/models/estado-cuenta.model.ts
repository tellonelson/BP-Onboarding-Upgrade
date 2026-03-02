import { TipoCuentaEnum } from './cuenta.model';

export interface EstadoCuenta {
  numeroCuenta: string;
  tipoCuenta: TipoCuentaEnum;
  nombreCliente: string;
  saldoInicial: number;
  credito: number;
  debito: number;
  saldo: number;
  ultimoMovimiento: string;
}
