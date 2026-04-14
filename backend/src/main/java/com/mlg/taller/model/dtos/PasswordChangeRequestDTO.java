package com.mlg.taller.model.dtos;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

/**
 * DTO para procesar el cambio definitivo de contraseña.
 * Recibe el token de validación y la nueva clave a establecer.
 */
@Data
public class PasswordChangeRequestDTO {

    @NotBlank(message = "El token de validación es obligatorio")
    private String token;

    @NotBlank(message = "La nueva contraseña es obligatoria")
    @Size(min = 8, message = "La contraseña debe tener al menos 8 caracteres")
    private String nuevaPassword;
}