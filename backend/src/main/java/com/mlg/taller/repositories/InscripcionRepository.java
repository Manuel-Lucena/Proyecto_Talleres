package com.mlg.taller.repositories;

import com.mlg.taller.model.entities.Inscripcion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;

/**
 * Repositorio para la gestión de matrículas, estados de pago y control de
 * aforo.
 */
@Repository
public interface InscripcionRepository extends JpaRepository<Inscripcion, Long> {

    /**
     * Comprueba si un usuario ya posee una inscripción (activa o no) en un taller.
     * * @param idUsuario Identificador del alumno.
     * 
     * @param idTaller Identificador del taller.
     * @return true si existe un registro de inscripción previo, false en caso
     *         contrario.
     */
    boolean existsByUsuarioIdAndTallerId(Long idUsuario, Long idTaller);

    /**
     * Obtiene el listado de todas las inscripciones realizadas por un alumno.
     * * @param idUsuario Identificador del alumno.
     * 
     * @return Lista de inscripciones vinculadas al usuario.
     */
    List<Inscripcion> findByUsuarioId(Long idUsuario);

    /**
     * Obtiene todos los alumnos inscritos en un taller específico.
     * * @param idTaller Identificador del taller.
     * 
     * @return Lista de inscripciones para el taller solicitado.
     */
    List<Inscripcion> findByTallerId(Long idTaller);

    /**
     * Cuenta el número de plazas ocupadas actualmente (ignorando bajas lógicas).
     * * @param idTaller Identificador del taller.
     * 
     * @return Cantidad total de alumnos con inscripción activa.
     */
    long countByTallerIdAndActivaTrue(Long idTaller);

    /**
     * Verifica si el alumno tiene una inscripción VIGENTE en el taller.
     */
    boolean existsByUsuarioIdAndTallerIdAndActivaTrue(Long idUsuario, Long idTaller);

    /**
     * Busca una inscripción por ID incluyendo aquellas que están desactivadas
     * (activa = false).
     * Se usa Native Query para saltar el @SQLRestriction de Hibernate.
     */
    @Query(value = "SELECT * FROM inscripcion WHERE id_inscripcion = :id", nativeQuery = true)
    java.util.Optional<Inscripcion> findByIdIncludingInactive(
            @org.springframework.data.repository.query.Param("id") Long id);

    /**
     * Busca inscripciones activas donde la fecha de inicio del taller asociado
     * coincida con la fecha proporcionada.
     */
    List<Inscripcion> findAllByTaller_FechaInicioAndActivaTrue(java.time.LocalDate fecha);
}