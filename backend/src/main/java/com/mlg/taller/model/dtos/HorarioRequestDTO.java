package com.mlg.taller.model.dtos;

import lombok.Data;
import java.time.LocalTime;

@Data
public class HorarioRequestDTO {
    private Long idTaller;
    private String diaSemana;
    private LocalTime horaInicio;
    private LocalTime horaFin;
}