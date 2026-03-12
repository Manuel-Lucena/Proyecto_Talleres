package com.mlg.taller.model.dtos;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.time.LocalDate;

@Data
public class TallerRequestDTO {

    @NotBlank(message = "El nombre del taller es obligatorio")
    private String nombre;

    private String descripcion;

    @NotNull(message = "Las plazas máximas son obligatorias")
    @Min(value = 1, message = "Debe haber al menos 1 plaza")
    private Integer plazasMaximas;

    @NotNull(message = "El precio es obligatorio")
    private Double precio;

    @NotNull(message = "La fecha de inicio es obligatoria")
    private LocalDate fechaInicio;

    @NotNull(message = "La fecha de fin es obligatoria")
    private LocalDate fechaFin;

    private Long idProfesor;
}