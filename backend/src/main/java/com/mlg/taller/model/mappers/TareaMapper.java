package com.mlg.taller.model.mappers;

import com.mlg.taller.model.dtos.TareaRequestDTO;
import com.mlg.taller.model.dtos.TareaResponseDTO;
import com.mlg.taller.model.entities.Tarea;
import java.util.List;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

/**
 * Mapper para la gestión de actividades académicas dentro de los talleres.
 * Transforma las tareas integrando el contexto del taller y la lista de alumnos vinculados.
 */
@Mapper(componentModel = "spring")
public interface TareaMapper {

    /**
     * Transforma la entidad Tarea en un DTO de respuesta detallado.
     * * @mapping idTarea Vincula el identificador de la entidad al DTO.
     * @mapping idTaller Extrae el ID del taller asociado.
     * @mapping nombreTaller Recupera el nombre del taller para contexto en la UI.
     * @mapping alumnosAsignadosIds Utiliza el método de apoyo 'mapAsignaciones' para aplanar 
     * los objetos TareaAsignada en una lista de IDs de usuario.
     */
    @Mapping(target = "idTarea", source = "id")
    @Mapping(target = "idTaller", source = "taller.id")
    @Mapping(target = "nombreTaller", source = "taller.nombre")
    @Mapping(target = "alumnosAsignadosIds", expression = "java(mapAsignaciones(tarea))")
    TareaResponseDTO toResponse(Tarea tarea);

    /**
     * Convierte el DTO de entrada en una nueva entidad Tarea para su persistencia.
     * @note El taller se asigna manualmente en el Service tras validar la existencia del ID.
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
     * Extrae los identificadores de los alumnos a partir de las asignaciones de la tarea.
     * * @param tarea Entidad de origen que contiene la lista de TareaAsignada.
     * @return Lista de Long con los IDs de los alumnos o null si no hay asignaciones.
     */
    default List<Long> mapAsignaciones(Tarea tarea) {
        if (tarea.getAsignaciones() == null) return null;
        return tarea.getAsignaciones().stream()
                .map(asignacion -> asignacion.getAlumno().getId())
                .toList();
    }
}