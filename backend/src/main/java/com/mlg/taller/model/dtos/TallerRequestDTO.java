package com.mlg.taller.model.dtos;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.time.LocalDate;
import com.fasterxml.jackson.annotation.JsonFormat;

/**
 * DTO para la creación y edición de talleres.
 * Define las restricciones de capacidad, precio y temporalidad de la actividad.
 */
@Data
public class TallerRequestDTO {

    /** Nombre identificativo del taller. */
    @NotBlank(message = "El nombre del taller es obligatorio")
    private String nombre;

    /** Breve resumen de los objetivos o temática del taller. */
    private String descripcion;

    /** * Aforo total del taller. 
     * @constraints Mínimo 1 plaza.
     */
    @NotNull(message = "Las plazas máximas son obligatorias")
    @Min(value = 1, message = "Debe haber al menos 1 plaza")
    private Integer plazasMaximas;

    /** Coste de inscripción para el alumno. */
    @NotNull(message = "El precio es obligatorio")
    private Double precio;

    /** Fecha de comienzo de las clases. */
    @NotNull(message = "La fecha de inicio es obligatoria")
    @JsonFormat(pattern = "yyyy-MM-dd") 
    private LocalDate fechaInicio;

    /** Fecha de finalización del taller. */
    @NotNull(message = "La fecha de fin es obligatoria")
    @JsonFormat(pattern = "yyyy-MM-dd") 
    private LocalDate fechaFin;

    /** Ruta de la imagen promocional. */
    private String fotoRuta;

    /** ID del usuario con rol PROFESOR asignado. */
    private Long idProfesor;
}