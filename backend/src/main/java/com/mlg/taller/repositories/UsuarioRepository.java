package com.mlg.taller.repositories;

import com.mlg.taller.model.entities.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
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
     * Obtiene todos los usuarios involucrados en un taller (Profesor + Alumnos matriculados).
     * @param idTaller Identificador del taller.
     * @return Lista unificada de participantes sin duplicados.
     */
    @Query(value = """
                SELECT u.* FROM USUARIO u
                INNER JOIN TALLER t ON u.id_usuario = t.id_profesor
                WHERE t.id_taller = :idTaller
                UNION
                SELECT u.* FROM USUARIO u
                INNER JOIN INSCRIPCION i ON u.id_usuario = i.id_usuario
                WHERE i.id_taller = :idTaller AND i.activa = true
            """, nativeQuery = true)
    List<Usuario> findAllParticipantesByTallerId(@Param("idTaller") Long idTaller);

    /**
     * Busca un usuario por su dirección de correo electrónico (clave para seguridad).
     * @param email Correo del usuario.
     * @return Un {@link Optional} con el usuario o vacío si no se encuentra.
     */
    Optional<Usuario> findByEmail(String email);

    /**
     * Verifica la existencia de un email en el sistema.
     * @param email Correo a comprobar.
     * @return true si ya está registrado.
     */
    boolean existsByEmail(String email);

    /**
     * Verifica la existencia de un DNI/NIE en el sistema.
     * @param dni Documento de identidad a comprobar.
     * @return true si ya existe en la base de datos.
     */
    boolean existsByDni(String dni);
}