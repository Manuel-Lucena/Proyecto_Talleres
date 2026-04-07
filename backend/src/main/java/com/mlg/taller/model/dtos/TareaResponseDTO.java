package com.mlg.taller.model.dtos;

import java.time.LocalDateTime;
import java.util.List;
import lombok.Data;

/**
 * DTO para la visualización de tareas.
 * Muestra el estado actual y el contexto del taller para el panel del alumno.
 */
@Data
public class TareaResponseDTO {

    /** ID de la tarea. */
    private Long idTarea;

    /** Título de la práctica. */
    private String titulo;

    /** Descripción o enunciado. */
    private String descripcion;

    /** Fecha automática de creación/publicación. */
    private LocalDateTime fechaPublicacion;

    /** Fecha límite de entrega. */
    private LocalDateTime fechaEntrega;

    /** Tipos de archivos aceptados. */
    private String extensionesPermitidas;

    /**
     * * Estado de la tarea para el usuario actual.
     * 
     * @example 'PENDIENTE', 'ENTREGADA', 'CALIFICADA'.
     */
    private String estado;

    /** Estado de visibilidad de la tarea para el alumnado asignado. */
    private boolean visible;

    /** ID del taller. */
    private Long idTaller;

    /** Nombre del taller asociado. */
    private String nombreTaller;

    /** Lista de IDs de los alumnos que deben realizar la tarea. */
    private List<Long> alumnosAsignadosIds;
}