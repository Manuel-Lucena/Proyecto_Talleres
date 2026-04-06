/**
 * Interfaz genérica que unifica todas las respuestas del Backend (Spring Boot).
 * @template T Representa el tipo de dato (DTO) que viaja en el cuerpo de la respuesta.
 */
export interface ApiResponse<T> {
  /** * Mensaje descriptivo del resultado de la operación.
   * Útil para mostrar notificaciones de éxito o error al usuario.
   */
  mensaje: string;

  /** * Carga útil de la respuesta. Puede ser un objeto único, 
   * un array de objetos o null según el endpoint.
   */
  data: T;

  /** * Fecha y hora en la que el servidor generó la respuesta.
   * Formato estándar ISO para trazabilidad.
   */
  timestamp: string;
}
