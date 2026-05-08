package com.mlg.taller.model.dtos;

import lombok.Data;

/**
 * DTO para la gestión de transacciones en la pasarela de pago simulada.
 * Encapsula los datos bancarios y la información de la matrícula para su procesamiento.
 */
@Data
public class PagoSimuladoRequestDTO {

    /** Nombre del titular tal como aparece en la tarjeta de crédito/débito. */
    private String titular;

    /** Número de la tarjeta (16 dígitos) utilizado para la transacción. */
    private String numeroTarjeta;

    /** Fecha de caducidad de la tarjeta en formato MM/YY. */
    private String fechaExpiracion;

    /** Código de verificación de 3 dígitos (Card Verification Value). */
    private String cvv;

    /** Cuantía económica total que se cargará en la cuenta del cliente. */
    private Double importe;

    /** Información detallada de la inscripción que se vinculará al pago tras su aprobación. */
    private InscripcionRequestDTO inscripcionInfo;
}