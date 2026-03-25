export interface HorarioRequest {
    idTaller: number;
    diaSemana: string;
    horaInicio: string; 
    horaFin: string;
}

export interface HorarioResponse {
    idHorario: number;
    idTaller: number;
    nombreTaller: string;
    diaSemana: string;
    horaInicio: string;
    horaFin: string;
}