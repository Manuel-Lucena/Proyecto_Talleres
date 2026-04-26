package com.mlg.taller.repositories;

import com.mlg.taller.model.entities.Taller;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

/**
 * Repositorio principal para la gestión de la oferta formativa.
 */
@Repository
public interface TallerRepository extends JpaRepository<Taller, Long> {

    /**
     * Obtiene los talleres impartidos por un profesor específico.
     * 
     * @param profesorId ID del usuario con rol profesor.
     * @return Lista de talleres bajo la tutela del profesor.
     */
    List<Taller> findByProfesorId(Long profesorId);

    /**
     * Obtiene los talleres donde un alumno está matriculado activamente.
     * 
     * @param idUsuario ID del alumno.
     * @return Lista de talleres asociados a las inscripciones activas del usuario.
     */
    @Query("SELECT i.taller FROM Inscripcion i WHERE i.usuario.id = :idUsuario AND i.activa = true")
    List<Taller> findTalleresByUsuarioId(@Param("idUsuario") Long idUsuario);

    /**
     * Comprueba si existe algún taller vinculado a este profesor.
     * 
     * @param idUsuario ID del profesor.
     * @return true si tiene talleres asignados.
     */
    boolean existsByProfesorId(Long idUsuario);
}