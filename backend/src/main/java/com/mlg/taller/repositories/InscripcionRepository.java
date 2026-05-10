package com.mlg.taller.repositories;

import com.mlg.taller.model.entities.Inscripcion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

/**
 * Repositorio para la gestión de matrículas, estados de pago y control de
 * aforo.
 * * Implementa un sistema híbrido de eliminación:
 * - ADMIN: Borrado físico (Hard Delete) total mediante Native Query.
 * - PROFE: Borrado lógico (Soft Delete) mediante actualización del campo
 * 'activa'.
 */
@Repository
public interface InscripcionRepository extends JpaRepository<Inscripcion, Long> {

        /**
         * Comprueba si un usuario ya posee una inscripción (activa o no) en un taller.
         *
         * @param idUsuario Identificador del alumno.
         * @param idTaller  Identificador del taller.
         * @return true si existe cualquier registro previo en la tabla, false si no.
         */
        boolean existsByUsuarioIdAndTallerId(Long idUsuario, Long idTaller);

        /**
         * Busca una inscripción específica por usuario y taller saltándose los filtros
         * de Hibernate.
         *
         * @param idUsuario Identificador del alumno.
         * @param idTaller  Identificador del taller.
         * @return Optional con la inscripción encontrada (incluyendo las inactivas).
         */
        @Query(value = "SELECT * FROM inscripcion WHERE id_usuario = :idUsuario AND id_taller = :idTaller", nativeQuery = true)
        Optional<Inscripcion> findByUsuarioIdAndTallerId(@Param("idUsuario") Long idUsuario,
                        @Param("idTaller") Long idTaller);

        /**
         * Obtiene el listado de todas las inscripciones activas de un alumno.
         *
         * @param idUsuario Identificador del alumno.
         * @return Lista de inscripciones activas vinculadas al usuario.
         */
        List<Inscripcion> findByUsuarioId(Long idUsuario);

        /**
         * Obtiene todos los alumnos con inscripción activa en un taller específico.
         *
         * @param idTaller Identificador del taller.
         * @return Lista de inscripciones activas para el taller solicitado.
         */
        List<Inscripcion> findByTallerId(Long idTaller);

        /**
         * Cuenta el número de plazas ocupadas actualmente (ignorando bajas lógicas).
         *
         * @param idTaller Identificador del taller.
         * @return Cantidad total de alumnos con inscripción activa (activa = true).
         */
        long countByTallerIdAndActivaTrue(Long idTaller);

        /**
         * Verifica si el alumno tiene una inscripción vigente y activa en el taller.
         *
         * @param idUsuario Identificador del alumno.
         * @param idTaller  Identificador del taller.
         * @return true si tiene plaza activa, false en caso contrario.
         */
        boolean existsByUsuarioIdAndTallerIdAndActivaTrue(Long idUsuario, Long idTaller);

        /**
         * Busca una inscripción por ID incluyendo aquellas que están desactivadas.
         *
         * @param id Identificador único de la inscripción.
         * @return Optional con la entidad encontrada saltando el @SQLRestriction.
         */
        @Query(value = "SELECT * FROM inscripcion WHERE id_inscripcion = :id", nativeQuery = true)
        Optional<Inscripcion> findByIdIncludingInactive(@Param("id") Long id);

        /**
         * Busca inscripciones activas por la fecha de inicio del taller asociado.
         *
         * @param fecha Fecha de inicio a buscar.
         * @return Lista de inscripciones que comienzan en dicha fecha.
         */
        List<Inscripcion> findAllByTaller_FechaInicioAndActivaTrue(LocalDate fecha);

        /**
         * Obtiene todas las inscripciones de un taller (activas e inactivas) para
         * gestión administrativa.
         *
         * @param idTaller Identificador del taller.
         * @return Lista completa de registros históricos del taller.
         */
        @Query(value = "SELECT * FROM inscripcion WHERE id_taller = :idTaller", nativeQuery = true)
        List<Inscripcion> findByTallerIdForAdmin(@Param("idTaller") Long idTaller);

        /**
         * Obtiene el historial completo de un usuario (activas e inactivas) para
         * gestión administrativa.
         *
         * @param idUsuario Identificador del alumno.
         * @return Lista con el historial total del usuario en la plataforma.
         */
        @Query(value = "SELECT * FROM inscripcion WHERE id_usuario = :idUsuario", nativeQuery = true)
        List<Inscripcion> findByUsuarioIdForAdmin(@Param("idUsuario") Long idUsuario);

        // --- MÉTODOS DE ELIMINACIÓN SEGÚN ROL ---

        /**
         * Realiza una baja lógica (Soft Delete) de la inscripción.
         * El registro permanece en la base de datos pero con el estado 'activa' a
         * false.
         *
         * @param id Identificador de la inscripción a desactivar.
         */
        @Modifying(clearAutomatically = true, flushAutomatically = true)
        @Query(value = "UPDATE inscripcion SET activa = false WHERE id_inscripcion = :id", nativeQuery = true)
        void desactivarInscripcion(@Param("id") Long id);

        /**
         * Realiza una eliminación física (Hard Delete) del registro en la base de
         * datos.
         * Se utiliza para limpiezas totales de tabla por parte del administrador.
         *
         * @param id Identificador de la inscripción a borrar permanentemente.
         */
        @Modifying(clearAutomatically = true, flushAutomatically = true)
        @Query(value = "DELETE FROM inscripcion WHERE id_inscripcion = :id", nativeQuery = true)
        void eliminarAdmin(@Param("id") Long id);

        /**
         * Obtiene las estadísticas académicas de los alumnos.
         * * @param idTaller Identificador del taller para filtrar los resultados.
         * 
         * @return Lista de arreglos de objetos (Object[]) donde cada posición
         *         corresponde
         *         a una de las 4 columnas calculadas.
         */
        /**
         * Obtiene las estadísticas académicas personalizadas por alumno.
         * Calcula el total de tareas asignadas individualmente (Globales +
         * Específicas).
         */
        @Query("SELECT u.id, " +
                        "CONCAT(u.nombre, ' ', u.apellidos), " +
                        "COUNT(DISTINCT e.id), " + // Cuenta entregas únicas
                        "(SELECT COUNT(t) FROM Tarea t WHERE t.taller.id = :idTaller AND t.visible = true AND (" +
                        "  NOT EXISTS (SELECT ta FROM TareaAsignada ta WHERE ta.tarea.id = t.id) OR " +
                        "  EXISTS (SELECT ta FROM TareaAsignada ta WHERE ta.tarea.id = t.id AND ta.alumno.id = u.id)" +
                        ")), " + 
                        "AVG(e.calificacion) " +
                        "FROM Inscripcion i " +
                        "JOIN i.usuario u " +
                        "LEFT JOIN Entrega e ON e.alumno.id = u.id AND e.tarea.taller.id = i.taller.id " +
                        "WHERE i.taller.id = :idTaller AND i.activa = true " +
                        "GROUP BY u.id, u.nombre, u.apellidos")
        List<Object[]> obtenerDatosNotasRaw(@Param("idTaller") Long idTaller);
}