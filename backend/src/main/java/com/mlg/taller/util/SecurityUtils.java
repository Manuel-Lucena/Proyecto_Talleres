package com.mlg.taller.util;

import com.mlg.taller.exception.BadRequestException;
import com.mlg.taller.model.entities.Usuario;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

/**
 * Utilidad centralizada para recuperar información del usuario autenticado
 * a través del contexto de seguridad de Spring (JWT).
 */
public class SecurityUtils {

    /**
     * Recupera el objeto Usuario completo del contexto de seguridad.
     * @return Usuario autenticado.
     * @throws BadRequestException si no hay una sesión válida.
     */
    public static Usuario getUsuarioAutenticado() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        
        if (auth == null || !auth.isAuthenticated() || "anonymousUser".equals(auth.getPrincipal())) {
            throw new BadRequestException("No se encontró una sesión de usuario válida.");
        }

        return (Usuario) auth.getPrincipal();
    }

    /**
     * Recupera solo el ID del usuario autenticado.
     */
    public static Long getIdUsuarioAutenticado() {
        return getUsuarioAutenticado().getId();
    }
}