package com.mlg.taller.model.mappers;

import com.mlg.taller.model.dtos.ArchivoEntregaRequestDTO;
import com.mlg.taller.model.dtos.ArchivoEntregaResponseDTO;
import com.mlg.taller.model.entities.ArchivoEntrega;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

/**
 * Mapper para la transformación de archivos vinculados a las entregas de alumnos.
 * Facilita la conversión entre la persistencia (Entity) y la transferencia de datos (DTO).
 */
@Mapper(componentModel = "spring")
public interface ArchivoEntregaMapper {

    /**
     * Convierte la entidad ArchivoEntrega en un DTO de respuesta.
     * @mapping idEntrega Extrae el ID de la relación ManyToOne con Entrega.
     */
    @Mapping(target = "idEntrega", source = "entrega.id")
    ArchivoEntregaResponseDTO toResponse(ArchivoEntrega entity);

    /**
     * Mapea el DTO de solicitud a la entidad de persistencia.
     * * @mapping id Ignorado porque es autogenerado por JPA.
     * @mapping entrega Ignorado porque la relación se establece en la lógica de negocio.
     * @mapping extension Ignorado para evitar manipulaciones externas; se calcula en el servidor.
     */
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "entrega", ignore = true)
    @Mapping(target = "extension", ignore = true)
    ArchivoEntrega toEntity(ArchivoEntregaRequestDTO dto); 
}