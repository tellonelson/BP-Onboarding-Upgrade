export enum GeneroEnum {
  MASCULINO = 'MASCULINO',
  FEMENINO = 'FEMENINO',
  OTRO = 'OTRO'
}

export interface Cliente {
  id: number;
  nombre: string;
  identificacion: string;
  edad: number;
  genero: GeneroEnum;
  telefono: string;
  direccion: string;
  contrasena: string;
  estado: boolean;
}

export interface CreateClienteDTO {
  nombre: string;
  identificacion: string;
  edad: number;
  genero: GeneroEnum;
  telefono: string;
  direccion: string;
  contrasena: string;
  estado: boolean;
}

export interface UpdateClienteDTO {
  nombre?: string;
  identificacion?: string;
  edad?: number;
  genero?: GeneroEnum;
  telefono?: string;
  direccion?: string;
  contrasena?: string;
  estado?: boolean;
}
