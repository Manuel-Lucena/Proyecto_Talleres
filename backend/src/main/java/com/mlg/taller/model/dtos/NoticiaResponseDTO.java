 package com.mlg.taller.model.dtos;

import lombok.Data;
import java.time.LocalDate;

/**
 * DTO para la visualización de noticias en el frontend.
 * Proporciona la información estructurada para el listado de novedades.
 */
@Data
public class NoticiaResponseDTO {

    /** Identificador único de la noticia. */
    private Long idNoticia;

    /** Título del anuncio. */
    private String titulo;

    /** Contenido íntegro de la noticia. */
    private String contenido;

    /** Fecha en la que se hizo pública la noticia. */
    private LocalDate fechaPublicacion;

    /** Ruta de la imagen adjunta para su visualización. */
    private String imagenUrl;
}