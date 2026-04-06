/**
 * Datos enviados para registrar o calificar una entrega.
 */
export interface EntregaRequest {
    idTarea: number;
    idUsuario: number;
    textoEntrega?: string;
    calificacion?: number;
    comentarioProfesor?: string;
}

/**
 * Información completa de una entrega devuelta por el servidor.
 */
export interface EntregaResponse {
    idEntrega: number;
    fechaEntrega: string;
    textoEntrega: string;
    calificacion: number;
    comentarioProfesor: string;
    idTarea: number;
    tituloTarea: string;
    idUsuario: number;
    nombreAlumno: string;
}