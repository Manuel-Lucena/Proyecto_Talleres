/**
 * Perfil completo de usuario devuelto por el servidor tras login o consulta.
 */
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

/**
 * Datos necesarios para el registro o edición de un usuario.
 */
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