import { Injectable } from '@angular/core';
import { jwtDecode } from 'jwt-decode';

/**
 * Servicio encargado de la gestión y decodificación del token JWT.
 * Proporciona información sobre la sesión actual del usuario extrayendo
 * los datos del almacenamiento local (localStorage).
 */
@Injectable({ providedIn: 'root' })
export class TokenService {

  /**
   * Obtiene el token crudo almacenado en el navegador.
   * @private
   * @returns El string del token o null si no existe.
   */
  private get getTokenFromStorage(): string | null {
    return localStorage.getItem('token');
  }

  /**
   * Decodifica el token JWT para extraer el payload.
   * @returns Un objeto con los claims del token o null si el token es inválido o no existe.
   */
  decode(): any {
    const token = this.getTokenFromStorage;
    if (!token) return null;
    try {
      return jwtDecode<any>(token);
    } catch (error) {
      console.error('Error decodificando el token:', error);
      return null;
    }
  }

  /**
   * Extrae el identificador único del usuario del token decodificado.
   * @returns ID del usuario o null.
   */
  getId(): number | null {
    const decoded = this.decode();
    return decoded?.id || null;
  }

  /**
   * Extrae el correo electrónico (subject) del token decodificado.
   * @returns Email del usuario o null.
   */
  getEmail(): string | null {
    const decoded = this.decode();
    return decoded?.sub || null;
  }

  /**
 * Verifica si el usuario es específicamente Administrador.
 * @returns true si el rol es ADMIN.
 */
  get esAdmin(): boolean {
    return this.getRol() === 'ADMIN';
  }
  

  /**
   * Obtiene el rol asignado al usuario desde el token.
   * Soporta las claves 'role' o 'rol' para mayor compatibilidad con el backend.
   * @returns Nombre del rol (ej: 'ADMIN', 'PROFESOR', 'ALUMNO') o null.
   */
  getRol(): string | null {
    const decoded = this.decode();
    const rawRole: string | null = decoded?.role || decoded?.rol || null;


    if (rawRole) {
      return rawRole.replace(/^ROLE_/i, '').trim();
    }

    return null;
  }

  /**
   * Centraliza la validación de privilegios de personal docente/admin.
   * @returns true si el usuario actual tiene permisos de gestión.
   */
  get esPersonalGestion(): boolean {
    const rol = this.getRol();
    return rol === 'PROFESOR' || rol === 'ADMIN';
  }

  /**
   * Verifica si el usuario está autenticado y si su sesión sigue siendo válida.
   * Compara la fecha de expiración del token (exp) con la hora actual del sistema.
   * @returns true si el token existe y no ha expirado, false en caso contrario.
   */
  isLogged(): boolean {
    const dec = this.decode();
    if (!dec) return false;
    return (dec.exp * 1000) > Date.now();
  }
  

  /**
   * Elimina el token del almacenamiento local, cerrando efectivamente la sesión.
   */
  logOut(): void {
    localStorage.removeItem('token');
  }
}