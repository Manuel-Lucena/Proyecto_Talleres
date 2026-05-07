package com.mlg.taller.model.entities;

import org.hibernate.annotations.SQLDelete;
import org.hibernate.annotations.SQLRestriction;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.util.List;

/**
 * Entidad principal que representa un taller formativo.
 * Gestiona la capacidad, el profesor asignado y los periodos de impartición.
 * Implementa 'Soft Delete' para preservar la integridad de inscripciones
 * históricas.
 */
@Entity
@Table(name = "TALLER")
@SQLDelete(sql = "UPDATE taller SET activo = false WHERE id_taller = ?")
@SQLRestriction("activo = true")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Taller {

    /** Identificador único del taller. */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_taller")
    private Long id;

    /** Nombre descriptivo del taller. */
    @Column(nullable = false, length = 150)
    private String nombre;

    /** Información detallada sobre el temario o metodología. */
    @Column(columnDefinition = "TEXT")
    private String descripcion;

    /**
     * * Usuario con rol de profesor encargado del taller.
     * La carga es diferida (LAZY) para optimizar consultas de listado.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_profesor")
    private Usuario profesor;

    /** Aforo total de alumnos permitidos. */
    @Column(name = "plazas_maximas", nullable = false)
    private Integer plazasMaximas;

    /** Tarifa de inscripción al taller. */
    @Column(nullable = false)
    private Double precio;

    /** Fecha programada para la primera sesión. */
    @Column(name = "fecha_inicio")
    private LocalDate fechaInicio;

    /** Fecha programada para la finalización del curso. */
    @Column(name = "fecha_fin")
    private LocalDate fechaFin;

    /** Ruta de la fotografía o banner promocional del taller. */
    @Column(name = "foto_ruta")
    private String fotoRuta;

    /** Estado de visibilidad del taller (Gestionado por el borrado lógico). */
    @Builder.Default
    private boolean activo = true;

    @OneToMany(mappedBy = "taller", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Horario> horarios;

    @OneToMany(mappedBy = "taller")
    private List<Inscripcion> inscripciones;
}