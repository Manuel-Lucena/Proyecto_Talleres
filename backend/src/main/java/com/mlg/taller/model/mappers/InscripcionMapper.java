package com.mlg.taller.model.mappers;

import com.mlg.taller.model.dtos.InscripcionRequestDTO;
import com.mlg.taller.model.dtos.InscripcionResponseDTO;
import com.mlg.taller.model.entities.Inscripcion;
import com.mlg.taller.model.entities.Taller;
import com.mlg.taller.model.entities.Usuario;
import com.mlg.taller.model.enums.EstadoPago;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import java.time.LocalDateTime;

    /**
    * Mapper para el proceso de matriculación de alumnos.
    * Centraliza la lógica de inicialización de pagos y fechas de inscripción.
    */
    @Mapper(componentModel = "spring", imports = { LocalDateTime.class, EstadoPago.class })
    public interface InscripcionMapper {

    @Mapping(target = "idInscripcion", source = "id")
    @Mapping(target = "nombreUsuario", expression = "java(ins.getUsuario().getNombre() + \" \" + ins.getUsuario().getApellidos())")
    @Mapping(target = "emailUsuario", source = "usuario.email")
    @Mapping(target = "nombreTaller", source = "taller.nombre")
    InscripcionResponseDTO toResponse(Inscripcion ins);

    /**
     * Crea una entidad Inscripcion combinando datos de tres fuentes.
     * 
     * @mapping activa Inicializa por defecto a true (Soft Delete).
     * @mapping estadoPago Asigna automáticamente el estado PAGADO tras la
     *          confirmación.
     * @mapping fechaInscripcion/fechaPago Genera la marca de tiempo actual.
     */
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "activa", constant = "true")
    @Mapping(target = "estadoPago", expression = "java(EstadoPago.PAGADO)")
    @Mapping(target = "fechaInscripcion", expression = "java(LocalDateTime.now())")
    @Mapping(target = "fechaPago", expression = "java(LocalDateTime.now())")
    @Mapping(target = "usuario", source = "usuario")
    @Mapping(target = "taller", source = "taller")
    Inscripcion toEntity(InscripcionRequestDTO dto, Usuario usuario, Taller taller);
}