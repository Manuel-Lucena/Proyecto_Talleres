package com.mlg.taller.model.mappers;

import com.mlg.taller.model.dtos.TallerRequestDTO;
import com.mlg.taller.model.dtos.TallerResponseDTO;
import com.mlg.taller.model.entities.Taller;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface TallerMapper {

    // Entidad -> Response
    // Mapeamos 'id' de la entidad a 'idTaller' del DTO
    @Mapping(target = "idTaller", source = "id")
    @Mapping(target = "nombreCompletoProfesor", 
             expression = "java(taller.getProfesor().getNombre() + \" \" + taller.getProfesor().getApellidos())")
    @Mapping(target = "plazasDisponibles", ignore = true) 
    TallerResponseDTO toResponse(Taller taller);

    // Request -> Entidad
    @Mapping(target = "id", ignore = true) // El id de la entidad se ignora (es auto-incremental)
    @Mapping(target = "profesor", ignore = true) // Se asigna manualmente en el Service
    @Mapping(target = "activo", ignore = true)
    Taller toEntity(TallerRequestDTO dto);


    // NUEVO MÉTODO PARA ACTUALIZAR
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "profesor", ignore = true)
    @Mapping(target = "activo", ignore = true)
    void updateEntityFromDto(TallerRequestDTO dto, @MappingTarget Taller taller);
}