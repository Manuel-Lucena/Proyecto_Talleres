import { inject } from '@angular/core';
import { CanActivateFn, Router, ActivatedRouteSnapshot } from '@angular/router';
import { TokenService } from '../services/Token.Service';

/**
 * Guardián de ruta dinámico que protege el acceso basándose en roles.
 */
export const authGuard: CanActivateFn = (route: ActivatedRouteSnapshot, state) => {
  const tokenService = inject(TokenService);
  const router = inject(Router);

  // 1. Verificación de Autenticación: ¿Está logueado?
  if (!tokenService.isLogged()) {
    console.warn('Acceso denegado: Usuario no autenticado.');
    tokenService.logOut();
    router.navigate(['/login']);
    return false;
  }

  // 2. Verificación de Autorización: ¿Tiene el rol necesario?
  const rolesPermitidos: string[] = route.data['roles'];

  // Solución al error de tipos: Si getRol() devuelve null, asignamos un string vacío ''
  const rolUsuario: string = tokenService.getRol() ?? '';

  /**
   * Caso A: La ruta no requiere roles específicos (rolesPermitidos es undefined o vacío).
   * Caso B: El rol del usuario existe y está incluido en la lista permitida.
   */
  if (!rolesPermitidos || rolesPermitidos.length === 0 || rolesPermitidos.includes(rolUsuario)) {
    return true;
  }

  // 3. Acceso Prohibido: Logueado pero sin permisos suficientes
  console.error(`Acceso denegado: El rol [${rolUsuario}] no tiene permiso para ${state.url}`);

  // Redirigimos a home para no cerrar la sesión del usuario
  router.navigate(['/no-autorizado']);
  return false;
};