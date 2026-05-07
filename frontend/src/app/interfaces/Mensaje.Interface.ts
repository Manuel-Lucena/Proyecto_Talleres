/**
 * Datos requeridos para publicar un nuevo mensaje en el muro.
 */
export interface MensajeRequest {
  contenido: string;
  idTaller: number;
  idUsuario: number;
}

/**
 * Información detallada del mensaje con datos del autor y el taller.
 */
export interface MensajeResponse {
  idMensaje: number;
  contenido: string;
  fechaEnvio: string; 
  idTaller: number;
  nombreTaller: string;
  fotoPerfilAutor?: string;
  idUsuario: number;
  nombreAutor: string;
}