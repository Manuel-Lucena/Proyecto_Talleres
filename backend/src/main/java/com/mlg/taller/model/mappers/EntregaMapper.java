package com.mlg.taller.model.mappers;

import com.mlg.taller.model.dtos.EntregaRequestDTO;
import com.mlg.taller.model.dtos.EntregaResponseDTO;
import com.mlg.taller.model.entities.Entrega;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

/**
 * Mapper avanzado para la gestión de entregas.
 * Realiza el aplanamiento de datos (Flattening) del alumno y la tarea vinculada.
 */
@Mapper(componentModel = "spring")
public interface EntregaMapper {

    /**
     * Convierte la entidad Entrega a un ResponseDTO enriquecido.
     * @mapping nombreAlumno Concatena nombre y apellidos del objeto Usuario.
     * @mapping tituloTarea Extrae el título de la tarea relacionada.
     */
    @Mapping(target = "idEntrega", source = "id")
    @Mapping(target = "idTarea", source = "tarea.id")
    @Mapping(target = "tituloTarea", source = "tarea.titulo")
    @Mapping(target = "idUsuario", source = "alumno.id")
    @Mapping(target = "nombreAlumno", expression = "java(e.getAlumno().getNombre() + \" \" + e.getAlumno().getApellidos())")
    EntregaResponseDTO toResponse(Entrega e);

    /**
     * Mapeo de entrada. Ignoramos campos sensibles o automáticos.
     * La fecha de entrega y la relación con archivos se gestionan manualmente en el Service.
     */
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "tarea", ignore = true)
    @Mapping(target = "alumno", ignore = true)
    @Mapping(target = "fechaEntrega", ignore = true)
    @Mapping(target = "archivos", ignore = true)
    Entrega toEntity(EntregaRequestDTO dto);
}