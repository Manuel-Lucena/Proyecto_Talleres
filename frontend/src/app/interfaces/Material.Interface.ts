export interface MaterialRequest {
    titulo: string;
    contenido: string;
    idTaller: number;
}

export interface MaterialResponse {
    id: number;
    titulo: string;
    contenido: string;
    fechaSubida: string;
    idTaller: number;
}