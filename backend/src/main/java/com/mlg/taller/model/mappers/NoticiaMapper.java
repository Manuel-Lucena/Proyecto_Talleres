package com.mlg.taller.model.mappers;

import com.mlg.taller.model.dtos.NoticiaRequestDTO;
import com.mlg.taller.model.dtos.NoticiaResponseDTO;
import com.mlg.taller.model.entities.Noticia;
import org.mapstruct.*;

/**
 * Mapper para la gestión de noticias y novedades del tablón general.
 * Facilita la conversión entre el modelo de persistencia y los objetos de transferencia (DTO).
 */
@Mapper(componentModel = "spring", builder = @Builder(disableBuilder = true))
public interface NoticiaMapper {

    /**
     * Transforma la entidad Noticia a un DTO de respuesta.
     * @mapping idNoticia Vincula el identificador de la base de datos con el campo del DTO.
     */
    @Mapping(target = "idNoticia", source = "id")
    NoticiaResponseDTO toResponse(Noticia noticia);

    /**
     * Convierte los datos de entrada en una nueva entidad Noticia.
     * @note El campo 'id' se ignora para permitir la generación automática.
     * @note La 'fechaPublicacion' se ignora para ser establecida por el sistema en la capa de servicio.
     */
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "fechaPublicacion", ignore = true)
    Noticia toEntity(NoticiaRequestDTO dto);

    /**
     * Actualiza una instancia de Noticia ya existente con los nuevos datos del DTO.
     * * @param dto Fuente con los nuevos datos recibidos del cliente.
     * @param noticia Destino: Entidad gestionada por JPA que será modificada.
     * @mapping id Se ignora para evitar la modificación de la clave primaria.
     * @mapping fechaPublicacion Se mantiene la fecha original de creación.
     */
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "fechaPublicacion", ignore = true)
    void updateEntityFromDto(NoticiaRequestDTO dto, @MappingTarget Noticia noticia);
}