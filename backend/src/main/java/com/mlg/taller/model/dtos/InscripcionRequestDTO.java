package com.mlg.taller.model.dtos;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class InscripcionRequestDTO {
    @NotNull(message = "El ID de usuario es obligatorio")
    private Long idUsuario;

    @NotNull(message = "El ID de taller es obligatorio")
    private Long idTaller;

    @NotNull(message = "El monto es obligatorio")
    private Double montoPagado;

    private String orderId;
}