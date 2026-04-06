/**
 * Información detallada de un taller para su visualización.
 */
export interface TallerResponse {
  idTaller: number;
  nombre: string;
  descripcion: string;
  plazasMaximas: number;
  plazasDisponibles: number;
  precio: number;
  fechaInicio: string; 
  fechaFin: string;
  nombreCompletoProfesor: string;
  fotoRuta?: string; 
}

/**
 * Datos necesarios para crear o actualizar un taller en el sistema.
 */
export interface TallerRequest {
  nombre: string;
  descripcion: string;
  plazasMaximas: number;
  precio: number;
  fechaInicio: string;
  fechaFin: string;
  idProfesor: number;
}