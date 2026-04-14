package com.mlg.taller.repositories;

import com.mlg.taller.model.entities.PasswordResetToken;
import com.mlg.taller.model.entities.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

/**
 * Repositorio para la gestión de tokens de seguridad de contraseñas.
 */
@Repository
public interface PasswordResetTokenRepository extends JpaRepository<PasswordResetToken, Long> {

    /**
     * Localiza un registro mediante el código de recuperación.
     * @param token Cadena de texto única.
     * @return Token encontrado o vacío.
     */
    Optional<PasswordResetToken> findByToken(String token);

    /**
     * Elimina todos los tokens asociados a un usuario específico.
     * Útil para limpiar solicitudes previas antes de generar una nueva.
     * @param usuario Usuario propietario de los tokens.
     */
    void deleteByUsuario(Usuario usuario);
}