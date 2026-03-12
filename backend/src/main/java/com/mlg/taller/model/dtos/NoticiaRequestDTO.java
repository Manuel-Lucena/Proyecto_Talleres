package com.mlg.taller.model.dtos;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class NoticiaRequestDTO {
    @NotBlank(message = "El título es obligatorio")
    private String titulo;

    @NotBlank(message = "El contenido es obligatorio")
    private String contenido;

    private String imagenUrl;
}