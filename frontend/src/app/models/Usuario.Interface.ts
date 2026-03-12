export interface UsuarioResponse {
  id: number;
  dni: string;     
  nombre: string;
  apellidos: string;
  email: string;
  idRol: number;  
  fotoUrl?: string; 
  activo: boolean;
}

export interface UsuarioRequest {
  dni: string;
  nombre: string;
  apellidos: string;
  email: string;
  password?: string;
  idRol: number;
}