package com.mlg.taller.model.dtos;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ArchivoTareaResponseDTO {
    private Long id;
    private String nombre;
    private String rutaArchivo;
    private String extension; 
    private Long idTarea;   
}