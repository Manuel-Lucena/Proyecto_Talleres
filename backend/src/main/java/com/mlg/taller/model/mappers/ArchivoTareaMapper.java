package com.mlg.taller.model.mappers;

import com.mlg.taller.model.dtos.ArchivoTareaRequestDTO;
import com.mlg.taller.model.dtos.ArchivoTareaResponseDTO;
import com.mlg.taller.model.entities.ArchivoTarea;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface ArchivoTareaMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "tarea", ignore = true)
    ArchivoTarea toEntity(ArchivoTareaRequestDTO dto);

    ArchivoTareaResponseDTO toResponse(ArchivoTarea entidad);
}