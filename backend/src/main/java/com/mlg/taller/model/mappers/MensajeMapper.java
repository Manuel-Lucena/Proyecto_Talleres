package com.mlg.taller.model.mappers;

import com.mlg.taller.model.dtos.MensajeRequestDTO;
import com.mlg.taller.model.dtos.MensajeResponseDTO;
import com.mlg.taller.model.entities.Mensaje;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface MensajeMapper {

    @Mapping(target = "idMensaje", source = "id")
    @Mapping(target = "idTaller", source = "taller.id")
    @Mapping(target = "nombreTaller", source = "taller.nombre")
    @Mapping(target = "idUsuario", source = "autor.id")
    @Mapping(target = "nombreAutor", expression = "java(m.getAutor().getNombre() + \" \" + m.getAutor().getApellidos())")
    MensajeResponseDTO toResponse(Mensaje m);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "taller", ignore = true)
    @Mapping(target = "autor", ignore = true)
    @Mapping(target = "fechaEnvio", ignore = true)
    Mensaje toEntity(MensajeRequestDTO dto);
}