package com.mlg.taller.model.dtos;

import lombok.Data;

@Data
public class ArchivoMaterialRequestDTO {
    private String nombre;
    private String rutaArchivo;
    private Long idMaterial;
}