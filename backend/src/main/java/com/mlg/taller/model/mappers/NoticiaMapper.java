package com.mlg.taller.model.mappers;

import com.mlg.taller.model.dtos.NoticiaRequestDTO;
import com.mlg.taller.model.dtos.NoticiaResponseDTO;
import com.mlg.taller.model.entities.Noticia;
import org.mapstruct.*;

/**
 * Mapper para la gestión de noticias y novedades.
 */
@Mapper(componentModel = "spring", builder = @Builder(disableBuilder = true))
public interface NoticiaMapper {

    /**
     * Convierte la entidad Noticia en un DTO de salida.
     */
    @Mapping(target = "idNoticia", source = "id")
    NoticiaResponseDTO toResponse(Noticia noticia);

    /**
     * Crea una nueva entidad Noticia. 
     * La fecha de publicación se asigna manualmente en el servicio.
     */
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "fechaPublicacion", ignore = true)
    Noticia toEntity(NoticiaRequestDTO dto);

    /**
     * Actualiza una noticia existente.
     * @param noticia Entidad recuperada de la BD que será modificada.
     */
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "fechaPublicacion", ignore = true)
    void updateEntityFromDto(NoticiaRequestDTO dto, @MappingTarget Noticia noticia);
}