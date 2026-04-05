export interface EntregaRequest {
    idTarea: number;
    idUsuario: number;
    textoEntrega?: string;
    calificacion?: number;
    comentarioProfesor?: string;
}

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