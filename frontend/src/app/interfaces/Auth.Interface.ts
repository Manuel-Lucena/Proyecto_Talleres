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

/**
 * Estructura para solicitar el enlace de recuperación de contraseña.
 */
export interface PasswordResetRequest {
  email: string;
}

/**
 * Estructura para confirmar el cambio de contraseña con el token recibido.
 */
export interface PasswordChangeRequest {
  token: string;
  nuevaPassword: string;
}