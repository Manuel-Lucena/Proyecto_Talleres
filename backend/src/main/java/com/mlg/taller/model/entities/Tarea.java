package com.mlg.taller.model.entities;

import com.mlg.taller.model.enums.EstadoTarea;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Entidad que representa una actividad evaluable dentro de un taller.
 * Gestiona plazos, formatos permitidos y la relación con los alumnos asignados.
 */
@Entity
@Table(name = "TAREA")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Tarea {

    /** Identificador único de la tarea. */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_tarea")
    private Long id;

    /** Título de la práctica o ejercicio. */
    @Column(nullable = false, length = 150)
    private String titulo;

    /** Enunciado completo o instrucciones de la tarea. */
    @Column(name = "descripcion", columnDefinition = "TEXT")
    private String descripcion;

    /** Fecha en la que la tarea se hace visible para los alumnos. */
    @Column(name = "fecha_publicacion")
    private LocalDateTime fechaPublicacion;

    /** Fecha límite para realizar la entrega. */
    @Column(name = "fecha_entrega")
    private LocalDateTime fechaEntrega;

    /** Filtro de tipos de archivos (ej: ".pdf,.zip"). */
    @Column(name = "extensiones_permitidas", length = 100)
    private String extensionesPermitidas;

    /** Estado actual de la tarea (ej: ACTIVA, FINALIZADA). */
    @Enumerated(EnumType.STRING)
    private EstadoTarea estado;

    /** Indica si la tarea es visible para los alumnos asignados. */
    @Column(nullable = false)
    @Builder.Default
    private boolean visible = true;

    /** Taller al que pertenece la actividad. */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_taller", nullable = false)
    private Taller taller;

    /**
     * Documentos adjuntos (enunciados o plantillas) proporcionados por el profesor.
     */
    @OneToMany(mappedBy = "tarea", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<ArchivoTarea> archivos = new ArrayList<>();

    /**
     * Entregas de los alumnos relacionados a la tarea.
     */
    @OneToMany(mappedBy = "tarea", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<Entrega> entregas = new ArrayList<>();

    /** Relación de alumnos que tienen la obligación de entregar esta tarea. */
    @OneToMany(mappedBy = "tarea", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<TareaAsignada> asignaciones = new ArrayList<>();
}