package com.mlg.taller.model.dtos;

import java.time.LocalDateTime;
import java.util.List;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class TareaRequestDTO {
    @NotBlank(message = "El título es obligatorio")
    private String titulo;
    private String descripcion;
    private Long idTaller;
    private LocalDateTime fechaEntrega;
    private List<Long> alumnosIds;
}
