package com.mlg.taller.model.dtos;

import lombok.Data;

@Data
public class ArchivoEntregaResponseDTO {
    private Long id;
    private String nombre;
    private String rutaArchivo;
    private String extension; 
    private Long idEntrega;
}