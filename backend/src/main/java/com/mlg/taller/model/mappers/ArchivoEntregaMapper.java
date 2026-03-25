package com.mlg.taller.model.mappers;

import com.mlg.taller.model.dtos.ArchivoEntregaRequestDTO;
import com.mlg.taller.model.dtos.ArchivoEntregaResponseDTO;
import com.mlg.taller.model.entities.ArchivoEntrega;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface ArchivoEntregaMapper {

    @Mapping(target = "idEntrega", source = "entrega.id")
    ArchivoEntregaResponseDTO toResponse(ArchivoEntrega entity);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "entrega", ignore = true)
    ArchivoEntrega toEntity(ArchivoEntregaRequestDTO dto);
}