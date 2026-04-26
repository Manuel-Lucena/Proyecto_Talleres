package com.mlg.taller.model.dtos;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO para la visualización del perfil de usuario y gestión de identidad.
 * Proporciona información descriptiva y el token de sesión si es necesario.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UsuarioResponseDTO {

    /** Identificador único del usuario. */
    private Long idUsuario;

    /** Documento de identidad. */
    private String dni;

    /** Nombre del usuario. */
    private String nombre;

    /** Apellidos del usuario. */
    private String apellidos;

    /** Email de contacto. */
    private String email;

    /** Dirección registrada. */
    private String direccion;

    /** Teléfono de contacto. */
    private String telefono;

    /** Nombre descriptivo del rol asignado */
    private String nombreRol;

    /** Ruta o URL de la imagen de perfil almacenada en el servidor. */
    private String fotoPerfilRuta;

    
     /** Estado de la cuenta */
    private boolean activo;

    /** * Token de acceso JWT. 
     * @note Se incluye opcionalmente tras el registro o login inicial.
     */
    private String token;
}