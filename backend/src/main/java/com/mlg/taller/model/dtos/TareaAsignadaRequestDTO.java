package com.mlg.taller.model.dtos;

import java.util.List;

import lombok.Data;

@Data
public class TareaAsignadaRequestDTO {
    private Long idTarea;
    private List<Long> alumnoIds;
}
