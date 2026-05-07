import { inject } from '@angular/core';
import { CanActivateFn, Router, ActivatedRouteSnapshot } from '@angular/router';
import { TokenService } from '../services/Token.Service';

/**
 * Guardián de ruta dinámico que protege el acceso basándose en roles.
 */
export const authGuard: CanActivateFn = (route: ActivatedRouteSnapshot, state) => {
  const tokenService = inject(TokenService);
  const router = inject(Router);

  if (!tokenService.isLogged()) {
    console.warn('Acceso denegado: Usuario no autenticado.');
    tokenService.logOut();
    router.navigate(['/login']);
    return false;
  }

  const rolesPermitidos: string[] = route.data['roles'];
  const rolUsuario = (tokenService.getRol() ?? '').toLowerCase();

  /**
   * Modificamos la lógica de comprobación:
   * 1. Limpiamos el rol del usuario quitándole el prefijo 'role_' si lo tiene.
   * 2. Comparamos.
   */
  const tienePermiso = !rolesPermitidos || 
                       rolesPermitidos.length === 0 || 
                       rolesPermitidos.some(rol => {
                         const rolLimpio = rol.toLowerCase().replace('role_', '');
                         const usuarioLimpio = rolUsuario.replace('role_', '');
                         return rolLimpio === usuarioLimpio;
                       });

  if (tienePermiso) {
    return true;
  }

  console.error(`Acceso denegado: El rol [${rolUsuario}] no tiene permiso para ${state.url}`);
  router.navigate(['/no-autorizado']);
  return false;
};