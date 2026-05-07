package com.mlg.taller.model.entities;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.List;

/**
 * Representa los recursos didácticos o informativos publicados en un taller.
 */
@Entity
@Table(name = "MATERIAL")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Material {

    /** Identificador único del material. */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_material")
    private Long id;

    /** Título identificativo del recurso. */
    @Column(nullable = false, length = 150)
    private String titulo;

    /** Contenido descriptivo o texto del material en formato enriquecido. */
    @Column(columnDefinition = "TEXT")
    private String contenido;

    /** Fecha y hora en la que el material fue puesto a disposición. */
    @Column(name = "fecha_subida")
    private LocalDateTime fechaSubida;

    /** Indica si el material es visible para los alumnos */
    @Column(nullable = false)
    @Builder.Default
    private boolean visible = true;

    /** Taller bajo el cual se clasifica este material. */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_taller", nullable = false)
    private Taller taller;

    /** Listado de archivos físicos descargables asociados a este material. */
    @OneToMany(mappedBy = "material", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ArchivoMaterial> archivos;
}