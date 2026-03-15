package com.mlg.taller.model.mappers;

import com.mlg.taller.model.dtos.UsuarioRequestDTO;
import com.mlg.taller.model.dtos.UsuarioResponseDTO;
import com.mlg.taller.model.entities.Usuario;
import org.mapstruct.*;

/**
 * Mapper para la entidad Usuario.
 * Permite actualizaciones parciales ignorando valores nulos en el DTO.
 */
@Mapper(
    componentModel = "spring", 
    builder = @Builder(disableBuilder = true), 
    nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE
)
public interface UsuarioMapper {

    /**
     * Mapea entidad a DTO de respuesta.
     * @param usuario Entidad persistida.
     * @return DTO con el nombre del rol y sin datos sensibles.
     */
    @Mapping(target = "idUsuario", source = "id")
    @Mapping(target = "nombreRol", source = "rol.nombre")
    @Mapping(target = "token", ignore = true)
    UsuarioResponseDTO toResponse(Usuario usuario);

    /**
     * Convierte DTO de registro en nueva entidad.
     * @param dto Datos de entrada.
     * @return Entidad lista para procesar en el servicio.
     */
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "rol", ignore = true)
    @Mapping(target = "activo", ignore = true)
    @Mapping(target = "authorities", ignore = true)
    @Mapping(target = "fotoPerfilRuta", ignore = true)
    Usuario toEntity(UsuarioRequestDTO dto);

    /**
     * Actualiza una entidad existente con los datos del DTO.
     * Ignora campos de seguridad y sistema para proteger la integridad del usuario.
     * @param dto Datos nuevos.
     * @param usuario Entidad a modificar.
     */
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "rol", ignore = true)
    @Mapping(target = "password", ignore = true)
    @Mapping(target = "activo", ignore = true)
    @Mapping(target = "authorities", ignore = true)
    @Mapping(target = "fotoPerfilRuta", ignore = true)
    void updateEntityFromDto(UsuarioRequestDTO dto, @MappingTarget Usuario usuario);
}