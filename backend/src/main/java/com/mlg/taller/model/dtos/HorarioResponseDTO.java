package com.mlg.taller.model.dtos;

import lombok.Data;
import java.time.LocalTime;

@Data
public class HorarioResponseDTO {
    private Long idHorario;
    private Long idTaller;
    private String nombreTaller;
    private String diaSemana;
    private LocalTime horaInicio;
    private LocalTime horaFin;
}