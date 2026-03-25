package com.mlg.taller.model.mappers;

import com.mlg.taller.model.dtos.HorarioRequestDTO;
import com.mlg.taller.model.dtos.HorarioResponseDTO;
import com.mlg.taller.model.entities.Horario;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface HorarioMapper {

    @Mapping(target = "idHorario", source = "id")
    @Mapping(target = "idTaller", source = "taller.id")
    @Mapping(target = "nombreTaller", source = "taller.nombre")
    HorarioResponseDTO toResponse(Horario h);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "taller", ignore = true)
    Horario toEntity(HorarioRequestDTO dto);
}