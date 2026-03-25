package com.mlg.taller.model.dtos;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EntregaResponseDTO {
    private Long idEntrega;
    private LocalDateTime fechaEntrega;
    private String textoEntrega; 
    private Double calificacion;
    private String comentarioProfesor;
    
    private Long idTarea;
    private String tituloTarea;
    private Long idUsuario;
    private String nombreAlumno; 
}