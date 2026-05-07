package com.mlg.taller.model.dtos;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

/**
 * DTO para la captura de datos de usuario en procesos de registro o edición.
 * Implementa validaciones rigurosas para DNI/NIE, teléfonos y correos
 * electrónicos.
 */
@Data
public class UsuarioRequestDTO {

    /** Documento de identidad (DNI o NIE). */
    @NotBlank(message = "El DNI es obligatorio")
    @Pattern(regexp = "^[0-9]{8}[TRWAGMYFPDXBNJZSQVHLCKE]$|^[XYZ][0-9]{7}[TRWAGMYFPDXBNJZSQVHLCKE]$", message = "El formato del DNI o NIE no es válido")
    private String dni;

    /** Nombre del usuario. */
    @NotBlank(message = "El nombre es obligatorio")
    private String nombre;

    /** Apellidos completos del usuario. */
    @NotBlank(message = "Los apellidos son obligatorios")
    private String apellidos;

    /** Dirección de correo electrónico. */
    @Email(message = "El formato del email no es válido")
    @NotBlank(message = "El email es obligatorio")
    private String email;

    /** Domicilio físico del usuario (opcional). */
    private String direccion;

    /** Teléfono de contacto. */
    @Pattern(regexp = "^(\\d{9}|\\d{3}-\\d{2}-\\d{2}-\\d{2})$", message = "El teléfono debe tener 9 dígitos o el formato XXX-XX-XX-XX")
    private String telefono;

    /** Estado de la cuenta */
    private Boolean activo;

    /** Contraseña de acceso. */
    @Size(min = 6, message = "La contraseña debe tener al menos 6 caracteres")
    private String password;

    /** Identificador del rol . */
    @NotNull(message = "Debes asignar un ID de rol")
    private Long idRol;
}