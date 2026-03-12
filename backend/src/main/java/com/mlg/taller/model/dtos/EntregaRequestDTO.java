package com.mlg.taller.model.dtos;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EntregaRequestDTO {
    @NotNull(message = "La tarea es obligatoria")
    private Long idTarea;
    
    @NotNull(message = "El ID de alumno es obligatorio")
    private Long idUsuario;
    
    private String textoEntrega; // Antes era contenidoTexto
    private Double calificacion;
    private String comentarioProfesor;
}