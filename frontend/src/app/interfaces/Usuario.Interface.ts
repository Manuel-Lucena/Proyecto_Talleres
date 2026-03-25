// Usuario.Interface.ts

export interface UsuarioResponse {
  idUsuario: number;
  dni: string;
  nombre: string;
  apellidos: string;
  email: string;
  telefono?: string;    
  direccion?: string;  
  nombreRol: string;
  fotoPerfilRuta?: string | null;
  activo?: boolean;
  token?: string;
}

export interface UsuarioRequest {
  dni: string;
  nombre: string;
  apellidos: string;
  email: string;
  telefono?: string;    
  direccion?: string;   
  password?: string;
  idRol: number;
}