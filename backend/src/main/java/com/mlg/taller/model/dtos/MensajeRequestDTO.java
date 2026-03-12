package com.mlg.taller.model.dtos;

import lombok.Data;

@Data
public class MensajeRequestDTO {
    private String contenido;
    private Long idTaller;
    private Long idUsuario; 
}