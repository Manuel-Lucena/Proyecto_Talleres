package com.mlg.taller.model.mappers;

import com.mlg.taller.model.dtos.UsuarioRequestDTO;
import com.mlg.taller.model.dtos.UsuarioResponseDTO;
import com.mlg.taller.model.entities.Usuario;
import org.mapstruct.*;

// Añadimos NullValuePropertyMappingStrategy.IGNORE para mayor seguridad
@Mapper(componentModel = "spring", builder = @Builder(disableBuilder = true), nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
public interface UsuarioMapper {

    // 1. De Entidad a Response (Salida)
    @Mapping(target = "idUsuario", source = "id")
    @Mapping(target = "nombreRol", source = "rol.nombre")
    UsuarioResponseDTO toResponse(Usuario usuario);

    // 2. De Request a Entidad Nueva (Registro)
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "rol", ignore = true)
    @Mapping(target = "activo", ignore = true)
    @Mapping(target = "authorities", ignore = true)
    @Mapping(target = "fotoPerfilRuta", ignore = true)
    Usuario toEntity(UsuarioRequestDTO dto);

    // 3. Actualizar Entidad Existente
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "rol", ignore = true)
    @Mapping(target = "password", ignore = true)
    @Mapping(target = "activo", ignore = true)
    @Mapping(target = "authorities", ignore = true)
    @Mapping(target = "fotoPerfilRuta", ignore = true)
    void updateEntityFromDto(UsuarioRequestDTO dto, @MappingTarget Usuario usuario);
}