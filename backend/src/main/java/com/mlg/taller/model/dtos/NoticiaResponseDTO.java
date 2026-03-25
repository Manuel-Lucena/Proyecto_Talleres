package com.mlg.taller.model.dtos;

import lombok.Data;
import java.time.LocalDate;

@Data
public class NoticiaResponseDTO {
    private Long idNoticia;
    private String titulo;
    private String contenido;
    private LocalDate fechaPublicacion;
    private String imagenUrl;
}