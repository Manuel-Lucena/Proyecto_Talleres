package com.mlg.taller.model.entities;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;

/**
 * Entidad para la publicación de novedades y comunicados oficiales.
 * Permite mantener informada a la comunidad de usuarios sobre eventos o
 * cambios.
 */
@Entity
@Table(name = "NOTICIA")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Noticia {

    /** Identificador único de la noticia. */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_noticia")
    private Long id;

    /** Título de la noticia (ej: "Apertura de nuevas plazas"). */
    @Column(nullable = false, length = 150)
    private String titulo;

    /** Cuerpo extenso de la noticia. */
    @Column(name = "contenido", nullable = false, columnDefinition = "TEXT")
    private String contenido;

    /** Fecha de publicación para ordenamiento cronológico. */
    @Column(name = "fecha_publicacion", nullable = false)
    private LocalDate fechaPublicacion;

    /** Enlace o ruta a la imagen destacada del anuncio. */
    @Column(name = "imagen_url", length = 255)
    private String imagenUrl;
}