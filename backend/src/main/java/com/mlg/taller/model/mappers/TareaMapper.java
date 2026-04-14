package com.mlg.taller.model.mappers;

import com.mlg.taller.model.dtos.TareaRequestDTO;
import com.mlg.taller.model.dtos.TareaResponseDTO;
import com.mlg.taller.model.entities.Tarea;
import java.util.List;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

/**
 * Mapper para la gestión de actividades académicas.
 * Incluye lógica personalizada para extraer los IDs de alumnos asignados.
 */
@Mapper(componentModel = "spring")
public interface TareaMapper {

    /**
     * Mapea Tarea a ResponseDTO.
     * @mapping alumnosAsignadosIds Utiliza el método default para 'aplanar' la lista de objetos TareaAsignada.
     */
    @Mapping(target = "idTarea", source = "id")
    @Mapping(target = "idTaller", source = "taller.id")
    @Mapping(target = "nombreTaller", source = "taller.nombre")
    @Mapping(target = "alumnosAsignadosIds", expression = "java(mapAsignaciones(tarea))")
    TareaResponseDTO toResponse(Tarea tarea);

    /**
     * Mapeo de entrada para creación de tareas.
     * Ignora campos de estado y archivos que se procesan mediante lógica de negocio en el Service.
     */
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "taller", ignore = true)
    @Mapping(target = "fechaPublicacion", ignore = true)
    @Mapping(target = "estado", ignore = true)
    @Mapping(target = "archivos", ignore = true)
    @Mapping(target = "asignaciones", ignore = true)
    @Mapping(target = "entregas", ignore = true)
    Tarea toEntity(TareaRequestDTO dto);

    /**
     * Método de apoyo para extraer los IDs de los alumnos de las asignaciones.
     * @param tarea Entidad que contiene la lista de asignaciones.
     * @return Lista de IDs de usuarios (alumnos).
     */
    default List<Long> mapAsignaciones(Tarea tarea) {
        if (tarea.getAsignaciones() == null) return null;
        return tarea.getAsignaciones().stream()
                .map(asignacion -> asignacion.getAlumno().getId())
                .toList();
    }
}