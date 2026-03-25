package com.mlg.taller.model.dtos;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TallerResponseDTO {
    
    private Long idTaller;
    private String nombre;
    private String descripcion;
    private Integer plazasMaximas;
    private Integer plazasDisponibles; 
    private Double precio;
    private LocalDate fechaInicio;
    private LocalDate fechaFin;
    private String fotoRuta;
    private String nombreCompletoProfesor; 
}