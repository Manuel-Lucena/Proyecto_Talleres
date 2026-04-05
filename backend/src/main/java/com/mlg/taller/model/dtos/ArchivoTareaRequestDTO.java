package com.mlg.taller.model.dtos;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class ArchivoTareaRequestDTO {
    @NotNull(message = "La tarea asociada es obligatoria")
    private Long idTarea;
    private String nombre;
    private String rutaArchivo;
}