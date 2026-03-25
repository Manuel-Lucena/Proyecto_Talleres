package com.mlg.taller.model.dtos;

import lombok.Data;

@Data
public class ArchivoEntregaRequestDTO {
    private String nombre;
    private String rutaArchivo;
    private Long idEntrega;
}