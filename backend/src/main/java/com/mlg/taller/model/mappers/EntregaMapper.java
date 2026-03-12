package com.mlg.taller.model.mappers;

import com.mlg.taller.model.dtos.EntregaRequestDTO;
import com.mlg.taller.model.dtos.EntregaResponseDTO;
import com.mlg.taller.model.entities.Entrega;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface EntregaMapper {

    @Mapping(target = "idEntrega", source = "id")
    @Mapping(target = "idTarea", source = "tarea.id")
    @Mapping(target = "tituloTarea", source = "tarea.titulo")
    @Mapping(target = "idUsuario", source = "alumno.id")
    @Mapping(target = "nombreAlumno", expression = "java(e.getAlumno().getNombre() + \" \" + e.getAlumno().getApellidos())")
    EntregaResponseDTO toResponse(Entrega e);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "tarea", ignore = true)
    @Mapping(target = "alumno", ignore = true)
    @Mapping(target = "fechaEntrega", ignore = true)
    @Mapping(target = "archivos", ignore = true)
    Entrega toEntity(EntregaRequestDTO dto);
}