package com.mlg.taller.model.dtos;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO para la respuesta de autenticación exitosa.
 * Contiene el token de acceso y la información básica de identidad para 
 * la gestión de sesiones en el cliente.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuthResponseDTO {

    /** Token JWT (JSON Web Token) para autorizar peticiones posteriores. */
    private String token;

    /** Nombre para mostrar del usuario en la interfaz. */
    private String nombre;

    /** Rol del usuario */
    private String rol;
}