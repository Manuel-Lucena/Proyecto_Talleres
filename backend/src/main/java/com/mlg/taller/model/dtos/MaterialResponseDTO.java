package com.mlg.taller.model.dtos;

import lombok.Data;
import java.time.LocalDateTime;

/**
 * DTO para la respuesta detallada de un material.
 * Proporciona metadatos como la fecha de subida para organizar el tablón de
 * recursos.
 */
@Data
public class MaterialResponseDTO {

    /** Identificador único del material. */
    private Long id;

    /** Título del recurso. */
    private String titulo;

    /** Contenido detallado del material. */
    private String contenido;

    /** Estado de visibilidad del recurso para el alumnado. */
    private boolean visible;

    /** Marca de tiempo de la creación del recurso. */
    private LocalDateTime fechaSubida;

    /** ID del taller vinculado. */
    private Long idTaller;
}