package com.mlg.taller.model.dtos;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;

/**
 * DTO para la visualización del catálogo de talleres.
 * Incluye cálculos dinámicos como plazas disponibles y el nombre del profesor.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TallerResponseDTO {
    
    /** Identificador único del taller. */
    private Long idTaller;
    
    /** Nombre del taller. */
    private String nombre;
    
    /** Descripción detallada. */
    private String descripcion;
    
    /** Aforo total configurado. */
    private Integer plazasMaximas;
    
    /** * Número de vacantes actuales. 
     * @note Calculado restando las inscripciones confirmadas a las plazas máximas.
     */
    private Integer plazasDisponibles; 
    
    /** Precio de la actividad. */
    private Double precio;
    
    /** Fecha de inicio. */
    private LocalDate fechaInicio;
    
    /** Fecha de fin. */
    private LocalDate fechaFin;
    
    /** Imagen representativa. */
    private String fotoRuta;
    
    /** Nombre completo del profesor asignado para facilitar la vista al alumno. */
    private String nombreCompletoProfesor; 
}