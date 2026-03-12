import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { TokenService } from '../services/Token.Service';

export const authGuard: CanActivateFn = (route, state) => {
  const tokenService = inject(TokenService);
  const router = inject(Router);

  const rolEsperado = route.data['rol']; 
  const rolUsuario = tokenService.getRol(); 

  // Comprobamos si está logueado y si su rol es el que pide la ruta
  if (tokenService.isLogged() && rolUsuario === rolEsperado) {
    return true; 
  }

  console.warn('Acceso denegado: redirigiendo al login');
  tokenService.logOut(); // Limpiamos token si no es válido
  router.navigate(['/login']);
  return false;
};