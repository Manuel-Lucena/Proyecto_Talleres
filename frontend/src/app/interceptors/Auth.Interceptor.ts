import { HttpInterceptorFn } from '@angular/common/http';

/**
 * INTERCEPTOR DE AUTENTICACIÓN (Functional Pattern)
 * * Este middleware actúa como un puente en la capa de red de Angular.
 * Su responsabilidad única es garantizar que cada petición saliente hacia el servidor
 * incluya las credenciales de identidad del usuario actual.
 * * @param req  - El objeto de la petición saliente. Representa los datos, la URL y los encabezados originales.
 * @param next - La función de despacho que pasa la petición al siguiente interceptor en la cadena o al backend.
 * * @returns Un Observable del flujo de eventos HTTP.
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  
  const token = localStorage.getItem('token');

  if (token) {
    const cloned = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });

    return next(cloned);
  }

  return next(req);
};