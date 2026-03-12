package com.mlg.taller.model.mappers;

import com.mlg.taller.model.dtos.TareaRequestDTO;
import com.mlg.taller.model.dtos.TareaResponseDTO;
import com.mlg.taller.model.entities.Tarea;

import java.util.List;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
@Mapper(componentModel = "spring")
public interface TareaMapper {

    @Mapping(target = "idTarea", source = "id")
    @Mapping(target = "idTaller", source = "taller.id")
    @Mapping(target = "nombreTaller", source = "taller.nombre")
    @Mapping(target = "alumnosAsignadosIds", expression = "java(mapAsignaciones(tarea))")
    TareaResponseDTO toResponse(Tarea tarea);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "taller", ignore = true)
    @Mapping(target = "fechaPublicacion", ignore = true)
    @Mapping(target = "estado", ignore = true)
    @Mapping(target = "archivos", ignore = true)
    @Mapping(target = "asignaciones", ignore = true)
    Tarea toEntity(TareaRequestDTO dto);

    // Método de apoyo para extraer los IDs de los alumnos de las asignaciones
    default List<Long> mapAsignaciones(Tarea tarea) {
        if (tarea.getAsignaciones() == null) return null;
        return tarea.getAsignaciones().stream()
                .map(asignacion -> asignacion.getAlumno().getId())
                .toList();
    }
}