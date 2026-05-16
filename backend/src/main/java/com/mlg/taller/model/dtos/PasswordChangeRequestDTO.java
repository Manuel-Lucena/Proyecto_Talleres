package com.mlg.taller.model.dtos;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

/**
 * DTO para procesar el cambio definitivo de contraseña.
 * Recibe el token de validación temporal y la nueva clave de acceso que el
 * usuario desea establecer.
 */
@Data
public class PasswordChangeRequestDTO {

    /**
     * * Token único de seguridad enviado previamente al correo del usuario.
     */
    @NotBlank(message = "El token de validación es obligatorio")
    private String token;

    /**
     * * Nueva clave de acceso que sustituirá a la anterior tras la validación del token.
     */
    @NotBlank(message = "La nueva contraseña es obligatoria")
    @Size(min = 8, message = "La contraseña debe tener al menos 8 caracteres")
    private String nuevaPassword;
}