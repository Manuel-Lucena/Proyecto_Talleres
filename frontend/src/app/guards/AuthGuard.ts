import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { TokenService } from '../services/Token.Service';

/**
 * Guardián de ruta para proteger el acceso según la autenticación y el rol del usuario.
 * Verifica la existencia de un token válido y la coincidencia con el rol requerido en la data de la ruta.
 * * @param route Instantánea de la ruta activa que contiene los parámetros y data (como el rol esperado).
 * @param state Estado actual de la sesión de navegación.
 */
export const authGuard: CanActivateFn = (route, state) => {
  const tokenService = inject(TokenService); // Servicio para la gestión de tokens y sesión
  const router = inject(Router); // Servicio de navegación para redirecciones

  const rolEsperado = route.data['rol']; // Rol definido en la configuración de la ruta
  const rolUsuario = tokenService.getRol(); // Rol extraído del token del usuario

  // Validación de sesión activa y coincidencia de privilegios
  if (tokenService.isLogged() && rolUsuario === rolEsperado) {
    return true; 
  }

  console.warn('Acceso denegado: redirigiendo al login');
  
  tokenService.logOut(); // Limpieza de credenciales por seguridad
  router.navigate(['/login']); // Redirección forzada al portal de acceso
  
  return false;
};