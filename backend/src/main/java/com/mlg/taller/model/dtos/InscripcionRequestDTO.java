package com.mlg.taller.model.dtos;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

/**
 * DTO para la solicitud de inscripción de un alumno a un taller.
 * Captura los datos de la transacción y el vínculo entre usuario y actividad.
 */
@Data
public class InscripcionRequestDTO {

    /** Identificador del alumno que se inscribe. */
    private Long idUsuario;

    /** Identificador del taller seleccionado. */
    @NotNull(message = "El ID de taller es obligatorio")
    private Long idTaller;

    /** Email del Usuario */
    @Email(message = "El formato del email no es válido")
    private String emailUsuario;

    /** Cantidad económica abonada por el usuario. */
    @NotNull(message = "El monto es obligatorio")
    private Double montoPagado;

    /** * Identificador de la orden de la pasarela de pagos. 
     * @example ID de transacción de PayPal para conciliación.
     */
    private String orderId;
}