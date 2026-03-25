package com.mlg.taller.model.dtos;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class MensajeResponseDTO {
    private Long idMensaje;
    private String contenido;
    private LocalDateTime fechaEnvio;
    private Long idTaller;
    private String nombreTaller;
    private Long idUsuario;
    private String nombreAutor;
}