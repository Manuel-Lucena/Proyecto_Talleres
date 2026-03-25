package com.mlg.taller.model.dtos;

import lombok.Data;

@Data
public class MaterialRequestDTO {
    private String titulo;
    private String contenido; 
    private Long idTaller;
}