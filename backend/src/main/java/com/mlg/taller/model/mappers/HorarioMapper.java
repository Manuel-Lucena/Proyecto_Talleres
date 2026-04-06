package com.mlg.taller.model.mappers;

import com.mlg.taller.model.dtos.HorarioRequestDTO;
import com.mlg.taller.model.dtos.HorarioResponseDTO;
import com.mlg.taller.model.entities.Horario;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

/**
 * Mapper para la gestión de horarios de talleres.
 * Facilita la visualización de calendarios vinculando el ID y nombre del taller.
 */
@Mapper(componentModel = "spring")
public interface HorarioMapper {

    /**
     * Convierte la entidad Horario a su DTO de respuesta.
     * @mapping nombreTaller Obtiene el nombre directamente de la relación Lazy con Taller.
     */
    @Mapping(target = "idHorario", source = "id")
    @Mapping(target = "idTaller", source = "taller.id")
    @Mapping(target = "nombreTaller", source = "taller.nombre")
    HorarioResponseDTO toResponse(Horario h);

    /**
     * Convierte el DTO de solicitud a la entidad Horario.
     * Ignora el objeto Taller para que sea asignado manualmente en la capa de servicio.
     */
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "taller", ignore = true)
    Horario toEntity(HorarioRequestDTO dto);
}