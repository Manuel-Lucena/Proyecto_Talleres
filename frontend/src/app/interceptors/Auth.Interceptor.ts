import { HttpInterceptorFn } from '@angular/common/http';

/**
 * Interceptor funcional para adjuntar automáticamente el token JWT a las peticiones salientes.
 * Si existe un token en el almacenamiento local, clona la petición original y añade
 * el encabezado de Authorization siguiendo el esquema Bearer.
 * * @param req Representación de la petición HTTP saliente.
 * @param next Siguiente paso en la cadena de interceptores o el manejador final.
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = localStorage.getItem('token'); // Recuperación de la credencial almacenada

  if (token) {
    // Las peticiones son inmutables; es necesario clonarlas para modificar los headers
    const cloned = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
    return next(cloned); // Continúa el flujo con la petición autenticada
  }

  return next(req); // Continúa el flujo con la petición original si no hay token
};