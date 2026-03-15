package com.mlg.taller.model.mappers;

import com.mlg.taller.model.dtos.TallerRequestDTO;
import com.mlg.taller.model.dtos.TallerResponseDTO;
import com.mlg.taller.model.entities.Taller;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface TallerMapper {

    // METODO: ENTIDAD -> RESPONSE
    @Mapping(target = "idTaller", source = "id")
    @Mapping(target = "nombreCompletoProfesor", expression = "java(taller.getProfesor() != null ? taller.getProfesor().getNombre() + \" \" + taller.getProfesor().getApellidos() : \"Sin profesor\")")
    @Mapping(target = "plazasDisponibles", source = "plazasMaximas")
    TallerResponseDTO toResponse(Taller taller);

    // METODO: REQUEST -> ENTIDAD (CREAR)
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "profesor", ignore = true)
    @Mapping(target = "activo", ignore = true)
    @Mapping(target = "fotoRuta", ignore = true)
    Taller toEntity(TallerRequestDTO dto);

    // METODO: ACTUALIZAR ENTIDAD DESDE DTO
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "profesor", ignore = true)
    @Mapping(target = "activo", ignore = true)
    @Mapping(target = "fotoRuta", ignore = true)
    void updateEntityFromDto(TallerRequestDTO dto, @MappingTarget Taller taller);
}