package com.mlg.taller.model.mappers;

import com.mlg.taller.model.dtos.ArchivoTareaRequestDTO;
import com.mlg.taller.model.dtos.ArchivoTareaResponseDTO;
import com.mlg.taller.model.entities.ArchivoTarea;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

/**
 * Mapper para la gestión de archivos adjuntos a los enunciados de las tareas.
 * Permite transformar la persistencia de recursos didácticos específicos de una actividad.
 */
@Mapper(componentModel = "spring")
public interface ArchivoTareaMapper {

    /**
     * Convierte la entidad ArchivoTarea en su DTO de respuesta.
     * @mapping idTarea Vincula el identificador de la tarea padre para el contexto del frontend.
     */
    @Mapping(target = "idTarea", source = "tarea.id") 
    ArchivoTareaResponseDTO toResponse(ArchivoTarea entidad);

    /**
     * Mapea el DTO de entrada a la entidad de base de datos.
     * @mapping id Ignorado por ser una clave primaria autoincremental.
     * @mapping tarea Ignorado para permitir una asignación manual controlada en el Service.
     * @mapping extension Ignorado para asegurar que la extensión se valide y extraiga en el servidor.
     */
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "tarea", ignore = true)
    @Mapping(target = "extension", ignore = true) 
    ArchivoTarea toEntity(ArchivoTareaRequestDTO dto);
}