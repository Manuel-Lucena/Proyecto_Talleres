package com.mlg.taller.model.mappers;

import com.mlg.taller.model.dtos.TallerRequestDTO;
import com.mlg.taller.model.dtos.TallerResponseDTO;
import com.mlg.taller.model.entities.Taller;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

/**
 * Mapper para la entidad principal Taller.
 * Gestiona la transformación de datos para el catálogo público y la administración de cursos.
 */
@Mapper(componentModel = "spring")
public interface TallerMapper {

    /**
     * Transforma la entidad Taller en un DTO de respuesta para el catálogo.
     * * @mapping idTaller Mapea el ID interno de la entidad al ID de respuesta.
     * @mapping nombreCompletoProfesor Lógica de seguridad para evitar NullPointerException 
     * y formatear el nombre del docente.
     * @mapping plazasDisponibles Cálculo derivado entre el máximo de plazas y las inscripciones actuales.
     */
    @Mapping(target = "idTaller", source = "id")
    @Mapping(target = "nombreCompletoProfesor", expression = "java(taller.getProfesor() != null ? taller.getProfesor().getNombre() + \" \" + taller.getProfesor().getApellidos() : \"Sin profesor\")")
    @Mapping(target = "plazasDisponibles", expression = "java(taller.getPlazasMaximas() - (taller.getInscripciones() != null ? taller.getInscripciones().size() : 0))")
    TallerResponseDTO toResponse(Taller taller);

    /**
     * Convierte el DTO de entrada en una nueva entidad Taller.
     * * @note Se ignoran campos de control (activo) y relaciones complejas (inscripciones, horarios) 
     * para ser gestionados manualmente en la capa de Servicio.
     * @note El campo 'fotoRuta' se ignora para procesarse mediante el servicio de almacenamiento de archivos.
     */
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "profesor", ignore = true)
    @Mapping(target = "activo", ignore = true)
    @Mapping(target = "fotoRuta", ignore = true)
    @Mapping(target = "inscripciones", ignore = true)
    @Mapping(target = "horarios", ignore = true)
    Taller toEntity(TallerRequestDTO dto);

    /**
     * Sincroniza y actualiza una entidad Taller persistida con los datos de un DTO.
     * * @param dto Fuente de datos con las modificaciones.
     * @param taller Destino: Entidad gestionada por JPA que recibirá los cambios.
     * @mapping id Se ignora para asegurar la inmutabilidad de la clave primaria.
     * @mapping activo Se ignora para evitar cambios accidentales en el estado de publicación.
     */
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "profesor", ignore = true)
    @Mapping(target = "activo", ignore = true)
    @Mapping(target = "fotoRuta", ignore = true)
    @Mapping(target = "inscripciones", ignore = true)
    @Mapping(target = "horarios", ignore = true)
    void updateEntityFromDto(TallerRequestDTO dto, @MappingTarget Taller taller);
}