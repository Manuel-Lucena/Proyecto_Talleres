package com.mlg.taller.model.dtos;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

/**
 * DTO para la creación o actualización de materiales didácticos.
 * Define el contenido base que el profesor desea compartir en un taller.
 */
@Data
public class MaterialRequestDTO {

    /**
     * * Título descriptivo del recurso.
     * No puede estar vacío y limitamos su tamaño para evitar abusos en la DB.
     */
    @NotBlank(message = "El título del material es obligatorio")
    @Size(max = 100, message = "El título no puede superar los 100 caracteres")
    private String titulo;

    /**
     * * Cuerpo del material, descripción o enlaces externos.
     * 
     */
    @NotBlank(message = "El contenido del material no puede estar vacío")
    private String contenido;

    /**
     * * Identificador del taller al que se adjunta este material.
     */
    @NotNull(message = "El ID del taller es obligatorio")
    private Long idTaller;

    /**
     * * Define si el material se publica como visible u oculto inicialmente.
     * 
     */
    private boolean visible = true;
}