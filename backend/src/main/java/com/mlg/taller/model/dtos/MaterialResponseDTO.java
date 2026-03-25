package com.mlg.taller.model.dtos;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class MaterialResponseDTO {
    private Long id;
    private String titulo;
    private String contenido;
    private LocalDateTime fechaSubida;
    private Long idTaller;
}