/**
 * Estructura para el envío de credenciales de acceso.
 */
export interface LoginRequest {
  email: string;
  password: string;
}

/**
 * Respuesta tras una autenticación exitosa.
 */
export interface AuthResponse {
  token: string;
  nombre: string;
  rol: string;
}