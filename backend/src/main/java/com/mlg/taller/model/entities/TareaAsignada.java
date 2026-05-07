package com.mlg.taller.model.entities;

import jakarta.persistence.*;
import lombok.*;

/**
 * Entidad intermedia para la asignación individual de tareas a alumnos.
 * Permite gestionar qué alumnos específicos deben realizar cada actividad.
 */
@Entity
@Table(name = "tareas_asignadas")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TareaAsignada {

    /** Identificador único de la tarea asignada. */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** Tarea vinculada. */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_tarea", nullable = false)
    private Tarea tarea;

    /** Alumno asignado a la tarea. */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_usuario", nullable = false)
    private Usuario alumno;
}