package com.mlg.taller.model.dtos;

import lombok.Data;

/**
 * DTO para la creación o actualización de materiales didácticos.
 * Define el contenido base que el profesor desea compartir en un taller.
 */
@Data
public class MaterialRequestDTO {

    /** Título descriptivo del recurso. */
    private String titulo;

    /** Cuerpo del material, descripción o enlaces externos. */
    private String contenido;

    /** Identificador del taller al que se adjunta este material. */
    private Long idTaller;

    /** Define si el material se publica como visible u oculto inicialmente. */
    private boolean visible = true;
}