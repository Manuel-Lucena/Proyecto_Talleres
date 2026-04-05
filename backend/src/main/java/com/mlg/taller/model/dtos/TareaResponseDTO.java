package com.mlg.taller.model.dtos;

import java.time.LocalDateTime;
import java.util.List;
import lombok.Data;

@Data
public class TareaResponseDTO {
    private Long idTarea;
    private String titulo;
    private String descripcion;
    private LocalDateTime fechaPublicacion;
    private LocalDateTime fechaEntrega;
    private String extensionesPermitidas;
    private String estado;
    private Long idTaller;
    private String nombreTaller;
    private List<Long> alumnosAsignadosIds;
}