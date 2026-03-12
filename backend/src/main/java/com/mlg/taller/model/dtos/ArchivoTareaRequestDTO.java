package com.mlg.taller.model.dtos;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class ArchivoTareaRequestDTO {

    @NotBlank(message = "El nombre del archivo es obligatorio")
    private String nombre;

    @NotBlank(message = "La ruta del archivo es obligatoria")
    private String rutaArchivo;

    @NotNull(message = "La tarea asociada es obligatoria")
    private Long idTarea;
}