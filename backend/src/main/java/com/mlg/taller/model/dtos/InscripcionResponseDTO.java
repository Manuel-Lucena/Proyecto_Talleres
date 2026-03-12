package com.mlg.taller.model.dtos;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class InscripcionResponseDTO {
    private Long idInscripcion;
    private String nombreUsuario;
    private String nombreTaller;
    private LocalDateTime fechaInscripcion;
    private Double montoPagado;
    private String estadoPago;
    private String orderId;
}