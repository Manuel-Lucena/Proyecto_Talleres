package com.mlg.taller.model.dtos;

import lombok.Data;
import java.time.LocalDateTime;

/**
 * DTO para la confirmación y visualización de una inscripción.
 * Proporciona el estado de la matrícula y detalles del pago realizado.
 */
@Data
public class InscripcionResponseDTO {

    /** Identificador único de la matrícula. */
    private Long idInscripcion;

    /** Nombre completo del alumno inscrito. */
    private String nombreUsuario;

    /** Email del alumno inscrito */
    private String emailUsuario;

    /** Nombre del taller matriculado. */
    private String nombreTaller;

    /** Momento exacto en el que se confirmó la inscripción. */
    private LocalDateTime fechaInscripcion;

    /** Importe total de la transacción. */
    private Double montoPagado;

    /** Estado actual (ej: 'COMPLETADO', 'PENDIENTE', 'CANCELADO'). */
    private String estadoPago;

    /** Referencia externa de la pasarela de pagos. */
    private String orderId;

    /** Estado para indicar si el alumno ha sido dado de baja */
    private boolean activa;
}