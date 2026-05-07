package com.mlg.taller.model.mappers;

import com.mlg.taller.model.dtos.MensajeRequestDTO;
import com.mlg.taller.model.dtos.MensajeResponseDTO;
import com.mlg.taller.model.entities.Mensaje;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

/**
 * Mapper para la comunicación en tiempo real de los talleres.
 * Transforma los mensajes del foro/chat integrando datos del autor y el taller.
 */
@Mapper(componentModel = "spring")
public interface MensajeMapper {

    /**
     * Mapea la entidad Mensaje a un ResponseDTO.
     * @mapping nombreAutor Concatena nombre y apellidos del autor (Usuario).
     * @mapping nombreTaller Extrae el nombre del contexto del taller.
     */
    @Mapping(target = "idMensaje", source = "id")
    @Mapping(target = "idTaller", source = "taller.id")
    @Mapping(target = "nombreTaller", source = "taller.nombre")
    @Mapping(target = "idUsuario", source = "autor.id")
    @Mapping(target = "nombreAutor", expression = "java(m.getAutor().getNombre() + \" \" + m.getAutor().getApellidos())")
    @Mapping(target = "fotoPerfilAutor", source = "autor.fotoPerfilRuta")
    MensajeResponseDTO toResponse(Mensaje m);

    /**
     * Convierte el DTO de entrada en Entidad.
     * @note La 'fechaEnvio' se ignora para ser asignada por el servidor en el Service.
     */
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "taller", ignore = true)
    @Mapping(target = "autor", ignore = true)
    @Mapping(target = "fechaEnvio", ignore = true)
    Mensaje toEntity(MensajeRequestDTO dto);
}