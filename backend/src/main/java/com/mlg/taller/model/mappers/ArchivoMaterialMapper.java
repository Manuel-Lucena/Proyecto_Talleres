package com.mlg.taller.model.mappers;

import com.mlg.taller.model.dtos.ArchivoMaterialRequestDTO;
import com.mlg.taller.model.dtos.ArchivoMaterialResponseDTO;
import com.mlg.taller.model.entities.ArchivoMaterial;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface ArchivoMaterialMapper {

    @Mapping(target = "idMaterial", source = "material.id")
    ArchivoMaterialResponseDTO toResponse(ArchivoMaterial entity);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "material", ignore = true)
    ArchivoMaterial toEntity(ArchivoMaterialRequestDTO dto);
}