package com.mlg.taller.model.mappers;

import com.mlg.taller.model.dtos.ArchivoMaterialRequestDTO;
import com.mlg.taller.model.dtos.ArchivoMaterialResponseDTO;
import com.mlg.taller.model.entities.ArchivoMaterial;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

/**
 * Mapper para la gestión de recursos descargables asociados a materiales didácticos.
 * Transforma los metadatos de los archivos del taller para su exposición en la API.
 */
@Mapper(componentModel = "spring")
public interface ArchivoMaterialMapper {

    /**
     * Convierte la entidad ArchivoMaterial a un DTO de respuesta.
     * @mapping idMaterial Obtiene el ID del material padre para facilitar la navegación en el frontend.
     */
    @Mapping(target = "idMaterial", source = "material.id")
    ArchivoMaterialResponseDTO toResponse(ArchivoMaterial entity);

    /**
     * Mapea el DTO de solicitud a la entidad de persistencia.
     * @mapping id Ignorado (autogenerado por la base de datos).
     * @mapping material Ignorado (se vincula mediante lógica de negocio en el Service).
     * @mapping extension Ignorado (se extrae del archivo Multipart en el servidor por seguridad).
     */
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "material", ignore = true)
    @Mapping(target = "extension", ignore = true)
    ArchivoMaterial toEntity(ArchivoMaterialRequestDTO dto);
}