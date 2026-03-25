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

export interface TallerRequest {
  nombre: string;
  descripcion: string;
  plazasMaximas: number;
  precio: number;
  fechaInicio: string;
  fechaFin: string;
  idProfesor: number;

}