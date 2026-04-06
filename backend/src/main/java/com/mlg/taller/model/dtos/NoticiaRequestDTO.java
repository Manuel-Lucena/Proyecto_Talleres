package com.mlg.taller.model.dtos;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

/**
 * DTO para la creación y edición de noticias en el tablón general.
 * Requiere obligatoriamente un título y un cuerpo de contenido.
 */
@Data
public class NoticiaRequestDTO {

    /** Título de la noticia o anuncio. */
    @NotBlank(message = "El título es obligatorio")
    private String titulo;

    /** Cuerpo detallado de la noticia (soporta texto enriquecido o plano). */
    @NotBlank(message = "El contenido es obligatorio")
    private String contenido;

    /** * URL o ruta de la imagen de cabecera. 
     * @note Se gestiona habitualmente a través del servicio de archivos.
     */
    private String imagenUrl;
}