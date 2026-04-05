package com.mlg.taller.repositories;

import com.mlg.taller.model.entities.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UsuarioRepository extends JpaRepository<Usuario, Long> {

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

    Optional<Usuario> findByEmail(String email);

    boolean existsByEmail(String email);

    boolean existsByDni(String dni);
}