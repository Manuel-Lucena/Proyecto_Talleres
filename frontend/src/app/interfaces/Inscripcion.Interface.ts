/**
 * DTO para enviar datos al servidor (Creación/Edición)
 * Coincide con lo que espera tu @RequestBody en Spring Boot
 */
export interface InscripcionRequest {
    idUsuario: number;
    idTaller: number;
    montoPagado: number;
    orderId: string;
}

/**
 * DTO que recibimos del servidor
 * Coincide con los campos de tu Entidad y el Mapper
 */
export interface InscripcionResponse {
    idInscripcion: number;
    idUsuario: number;
    idTaller: number;

    fechaInscripcion: string; 
    fechaPago?: string;
    montoPagado: number;
    estadoPago: string; 
    orderId: string;
    activa: boolean;
    nombreTaller?: string;
    emailUsuario?: string;
}