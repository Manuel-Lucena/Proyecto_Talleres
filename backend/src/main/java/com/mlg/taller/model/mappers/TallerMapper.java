package com.mlg.taller.model.mappers;

import com.mlg.taller.model.dtos.TallerRequestDTO;
import com.mlg.taller.model.dtos.TallerResponseDTO;
import com.mlg.taller.model.entities.Taller;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

/**
 * Mapper para la entidad principal Taller.
 * Gestiona la visualización del catálogo y la actualización de cursos.
 */
@Mapper(componentModel = "spring")
public interface TallerMapper {

    /**
     * Transforma la entidad en la respuesta para el catálogo.
     * 
     * @mapping nombreCompletoProfesor Lógica condicional para evitar
     *          NullPointerException si no hay profesor.
     * @mapping plazasDisponibles Por defecto inicializa con el máximo (la lógica de
     *          resta reside en el Service).
     */
    @Mapping(target = "idTaller", source = "id")
    @Mapping(target = "nombreCompletoProfesor", expression = "java(taller.getProfesor() != null ? taller.getProfesor().getNombre() + \" \" + taller.getProfesor().getApellidos() : \"Sin profesor\")")
    @Mapping(target = "plazasDisponibles", expression = "java(taller.getPlazasMaximas() - (taller.getInscripciones() != null ? taller.getInscripciones().size() : 0))")
    TallerResponseDTO toResponse(Taller taller);

    /**
     * Crea una nueva entidad Taller.
     * Ignora campos sensibles como 'activo' o 'fotoRuta' que requieren lógica de
     * negocio.
     */
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "profesor", ignore = true)
    @Mapping(target = "activo", ignore = true)
    @Mapping(target = "fotoRuta", ignore = true)
    @Mapping(target = "inscripciones", ignore = true)
    Taller toEntity(TallerRequestDTO dto);

    /**
     * Sincroniza cambios de un DTO sobre una entidad Taller persistida.
     */
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "profesor", ignore = true)
    @Mapping(target = "activo", ignore = true)
    @Mapping(target = "fotoRuta", ignore = true)
    @Mapping(target = "inscripciones", ignore = true)
    void updateEntityFromDto(TallerRequestDTO dto, @MappingTarget Taller taller);
}