export interface MensajeRequest {
  contenido: string;
  idTaller: number;
  idUsuario: number;
}

export interface MensajeResponse {
  idMensaje: number;
  contenido: string;
  fechaEnvio: string; 
  idTaller: number;
  nombreTaller: string;
  idUsuario: number;
  nombreAutor: string;
}