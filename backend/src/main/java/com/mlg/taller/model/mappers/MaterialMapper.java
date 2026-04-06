package com.mlg.taller.model.mappers;

import com.mlg.taller.model.dtos.MaterialRequestDTO;
import com.mlg.taller.model.dtos.MaterialResponseDTO;
import com.mlg.taller.model.entities.Material;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

/**
 * Mapper para los materiales didácticos del taller.
 */
@Mapper(componentModel = "spring")
public interface MaterialMapper {

    @Mapping(target = "idTaller", source = "taller.id")
    MaterialResponseDTO toResponse(Material m);

    /**
     * Mapeo de entrada para nuevos materiales.
     * @note La 'fechaSubida' se gestiona en el Service para asegurar la hora del servidor.
     */
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "taller", ignore = true)
    @Mapping(target = "fechaSubida", ignore = true)
    @Mapping(target = "archivos", ignore = true)
    Material toEntity(MaterialRequestDTO dto);
}