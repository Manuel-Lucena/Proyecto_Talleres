package com.mlg.taller.model.mappers;

import com.mlg.taller.model.dtos.TareaAsignadaResponseDTO;
import com.mlg.taller.model.entities.TareaAsignada;
import org.mapstruct.*;

/**
 * Mapper para la transformación de asignaciones de tareas entre la base de datos y la capa de presentación.
 */
@Mapper(componentModel = "spring", builder = @Builder(disableBuilder = true))
public interface TareaAsignadaMapper {

    /**
     * Convierte una entidad TareaAsignada en un DTO de respuesta detallado.
     * * Realiza el mapeo de campos anidados extrayendo la información de la tarea
     * y los datos personales del alumno.
     * * @param entity La entidad gestionada por JPA proveniente de la base de datos.
     * @return TareaAsignadaResponseDTO con la información aplanada y lista para la API.
     */
    @Mapping(target = "idAsignacion", source = "id")
    @Mapping(target = "idTarea", source = "tarea.id")
    @Mapping(target = "idAlumno", source = "alumno.id")
    @Mapping(target = "nombreAlumno", source = "alumno.nombre")
    @Mapping(target = "apellidosAlumno", source = "alumno.apellidos")
    TareaAsignadaResponseDTO toResponse(TareaAsignada entity);

}