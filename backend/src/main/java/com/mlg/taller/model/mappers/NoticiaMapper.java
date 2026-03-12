package com.mlg.taller.model.mappers;

import com.mlg.taller.model.dtos.NoticiaRequestDTO;
import com.mlg.taller.model.dtos.NoticiaResponseDTO;
import com.mlg.taller.model.entities.Noticia;
import org.mapstruct.*;

@Mapper(componentModel = "spring", builder = @Builder(disableBuilder = true))
public interface NoticiaMapper {

    @Mapping(target = "idNoticia", source = "id")
    NoticiaResponseDTO toResponse(Noticia noticia);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "fechaPublicacion", ignore = true)
    Noticia toEntity(NoticiaRequestDTO dto);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "fechaPublicacion", ignore = true)
    void updateEntityFromDto(NoticiaRequestDTO dto, @MappingTarget Noticia noticia);
}