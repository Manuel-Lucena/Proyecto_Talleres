package com.mlg.taller.model.dtos;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

/**
 * DTO para solicitar el restablecimiento de contraseña.
 * El usuario solo proporciona su email para recibir el enlace.
 */
@Data
public class PasswordResetRequestDTO {
    /** Email del usuario . */
    @NotBlank(message = "El email es obligatorio")
    @Email(message = "Debe ser un formato de email válido")
    private String email;
}