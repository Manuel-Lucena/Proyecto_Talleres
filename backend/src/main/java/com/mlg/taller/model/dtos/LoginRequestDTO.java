package com.mlg.taller.model.dtos;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

/**
 * DTO para la captura de credenciales durante el inicio de sesión.
 * Incluye validaciones estrictas de formato para el correo electrónico.
 */
@Data
public class LoginRequestDTO {

    /** * Correo electrónico de la cuenta de usuario. 
     * @constraints Debe tener un formato válido de email y no estar vacío.
     */
    @NotBlank(message = "El email es obligatorio")
    @Email(message = "Formato de email inválido")
    private String email;

    /** Contraseña asociada a la cuenta (en texto plano para ser procesada por BCrypt). */
    @NotBlank(message = "La contraseña es obligatoria")
    private String password;
}