export enum TipoCuentaEnum {
  AHORROS = 'AHORROS',
  CORRIENTE = 'CORRIENTE'
}

export interface ClienteResponseDTO {
  id: number;
  nombre: string;
  identificacion: string;
  edad: number;
  genero: string;
  telefono: string;
  direccion: string;
  contrasena: string;
  estado: boolean;
}

export interface Cuenta {
  cuentaId: number;
  numeroCuenta: string;
  tipoCuenta: TipoCuentaEnum;
  saldoInicial: number;
  cliente: ClienteResponseDTO;
}

export interface CreateCuentaDTO {
  numeroCuenta: string;
  tipoCuenta: TipoCuentaEnum;
  saldoInicial: number;
  clienteId: number;
}

export interface UpdateCuentaDTO {
  numeroCuenta?: string;
  tipoCuenta?: TipoCuentaEnum;
  saldoInicial?: number;
  clienteId?: number;
}
