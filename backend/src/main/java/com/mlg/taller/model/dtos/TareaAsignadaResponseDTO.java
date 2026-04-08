package com.mlg.taller.model.dtos;

import lombok.Data;

@Data
public class TareaAsignadaResponseDTO {
    private Long idAsignacion;
    private Long idTarea;
    private Long idAlumno;
    private String nombreAlumno;
    private String apellidosAlumno;
}