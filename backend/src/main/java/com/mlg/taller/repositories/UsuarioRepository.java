package com.mlg.taller.repositories;

import com.mlg.taller.model.entities.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

/**
 * Repositorio principal para la gestión de usuarios, seguridad y participación.
 */
@Repository
public interface UsuarioRepository extends JpaRepository<Usuario, Long> {

    /**
     * Obtiene todos los usuarios involucrados en un taller (Profesor + Alumnos
     * matriculados).
     * 
     * @param idTaller Identificador del taller.
     * @return Lista unificada de participantes sin duplicados.
     */
    @Query(value = """
                SELECT u.* FROM usuario u
                INNER JOIN taller t ON u.id_usuario = t.id_profesor
                WHERE t.id_taller = :idTaller
                UNION
                SELECT u.* FROM usuario u
                INNER JOIN inscripcion i ON u.id_usuario = i.id_usuario
                WHERE i.id_taller = :idTaller AND i.activa = true
            """, nativeQuery = true)
    List<Usuario> findAllParticipantesByTallerId(@Param("idTaller") Long idTaller);

    /**
     * Busca un usuario por su dirección de correo electrónico (clave para
     * seguridad).
     * 
     * @param email Correo del usuario.
     * @return Un {@link Optional} con el usuario o vacío si no se encuentra.
     */
    Optional<Usuario> findByEmail(String email);

    /**
     * Verifica la existencia de un email en el sistema.
     * 
     * @param email Correo a comprobar.
     * @return true si ya está registrado.
     */
    boolean existsByEmail(String email);

    /**
     * Verifica la existencia de un DNI/NIE en el sistema.
     * 
     * @param dni Documento de identidad a comprobar.
     * @return true si ya existe en la base de datos.
     */
    boolean existsByDni(String dni);

    /**
     * Obtiene una lista de usuarios filtrados por su rol.
     * 
     * @param idRol Identificador del rol (1: Admin, 2: Profesor, 3: Alumno).
     * @return Lista de usuarios que pertenecen al rol especificado.
     */
    List<Usuario> findByRolId(Long idRol);

    /**
     * Obtiene el listado total de usuarios de la base de datos, ignorando
     * el filtro @SQLRestriction de Hibernate.
     * 
     * * @return Lista completa de usuarios (activos e inactivos).
     */
    @Query(value = "SELECT * FROM usuario", nativeQuery = true)
    List<Usuario> findAllAdmin();

    /**
     * Busca un usuario por su ID saltándose las restricciones de estado de
     * Hibernate.
     * * @param id Identificador único del usuario.
     * 
     * @return Un Optional con el usuario encontrado, sin importar si está activo o
     *         no.
     */
    @Query(value = "SELECT * FROM usuario WHERE id_usuario = :id", nativeQuery = true)
    Optional<Usuario> findByIdAdmin(@Param("id") Long id);

    /**
     * Realiza una eliminación física (Hard Delete) del usuario en la base de datos.
     * Al ser una Native Query, ignora cualquier @SQLRestriction de Hibernate.
     *
     * @param id Identificador del usuario a eliminar permanentemente.
     */
    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query(value = "DELETE FROM usuario WHERE id_usuario = :id", nativeQuery = true)
    void eliminarAdmin(@Param("id") Long id);

    /**
     * Recupera un usuario a partir de su dirección de correo electrónico,
     * * @param email Correo electrónico del usuario a buscar.
     * 
     * @return Un Optional que contiene el usuario encontrado o vacío si no
     *         existe.
     */
    @Query(value = "SELECT * FROM usuario WHERE email = :email", nativeQuery = true)
    Optional<Usuario> findByEmailAdmin(@Param("email") String email);

    /**
     * Verifica si un usuario específico está marcado como activo en la base de
     * datos.
     * * @param id Identificador único del usuario.
     * 
     * @return true si el usuario está activo, false en caso contrario.
     */
    @Query(value = "SELECT activo FROM usuario WHERE id_usuario = :id", nativeQuery = true)
    boolean isUsuarioActivo(@Param("id") Long id);

    /**
     * Cuenta la cantidad de inscripciones vigentes que posee un alumno.
     * Este método se utiliza como validación de seguridad para impedir la
     * desactivación de cuentas que aún tienen compromisos académicos activos.
     * * @param idUsuario Identificador del alumno a consultar.
     * 
     * @return El número total de inscripciones con estado 'activa = true'.
     */
    @Query(value = "SELECT COUNT(*) FROM inscripcion WHERE id_usuario = :idUsuario AND activa = true", nativeQuery = true)
    Integer tieneInscripcionesActivas(@Param("idUsuario") Long idUsuario);
}