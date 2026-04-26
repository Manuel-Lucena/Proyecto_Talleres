package com.mlg.taller.model.mappers;

import com.mlg.taller.model.dtos.UsuarioRequestDTO;
import com.mlg.taller.model.dtos.UsuarioResponseDTO;
import com.mlg.taller.model.entities.Usuario;
import org.mapstruct.*;

/**
 * Mapper avanzado para la gestión de perfiles de usuario.
 * Configurado para proteger datos sensibles y permitir actualizaciones parciales seguras.
 */
@Mapper(
    componentModel = "spring", 
    builder = @Builder(disableBuilder = true), 
    nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE
)
public interface UsuarioMapper {

    /**
     * Genera la respuesta de perfil.
     * @mapping token Se ignora para no exponerlo en listados generales; se gestiona en LoginService.
     */
    @Mapping(target = "idUsuario", source = "id")
    @Mapping(target = "nombreRol", source = "rol.nombre")
    @Mapping(target = "token", ignore = true)
    UsuarioResponseDTO toResponse(Usuario usuario);

    /**
     * Mapeo para registro de nuevos usuarios.
     * Ignora campos internos de seguridad para que el Service los establezca (ej: password hashing).
     */
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "rol", ignore = true)
    @Mapping(target = "activo", ignore = true)
    @Mapping(target = "authorities", ignore = true)
    @Mapping(target = "fotoPerfilRuta", ignore = true)
    Usuario toEntity(UsuarioRequestDTO dto);

    /**
     * Sincroniza cambios sobre un usuario existente.
     * @note La estrategia IGNORE evita borrar datos existentes si el DTO trae nulos.
     * @mapping password Se ignora para evitar que cambios de perfil sobrescriban el hash accidentalmente.
     */
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "rol", ignore = true)
    @Mapping(target = "password", ignore = true)
    @Mapping(target = "authorities", ignore = true)
    @Mapping(target = "fotoPerfilRuta", ignore = true)
    void updateEntityFromDto(UsuarioRequestDTO dto, @MappingTarget Usuario usuario);
}