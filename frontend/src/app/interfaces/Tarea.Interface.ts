export interface TareaRequest {
    titulo: string;
    descripcion: string;
    idTaller: number;
    fechaEntrega: Date | string;
    extensionesPermitidas?: string; 
    alumnosIds?: number[];
}

export interface TareaResponse {
    idTarea: number;
    titulo: string;
    descripcion: string;
    fechaPublicacion: Date | string;
    fechaEntrega: Date | string;
    estado: string;
    idTaller: number;
    nombreTaller: string;
    extensionesPermitidas: string; 
    alumnosAsignadosIds: number[];
}