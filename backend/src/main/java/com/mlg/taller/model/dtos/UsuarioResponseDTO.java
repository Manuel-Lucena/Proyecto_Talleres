package com.mlg.taller.model.dtos;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UsuarioResponseDTO {
    private Long idUsuario;
    private String dni;
    private String nombre;
    private String apellidos;
    private String email;
    private String direccion;
    private String telefono;
    private String nombreRol;
    private String fotoPerfilRuta;
    private String token;
}