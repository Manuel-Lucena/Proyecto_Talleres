package com.mlg.taller.model.entities;

import org.hibernate.annotations.SQLDelete;
import org.hibernate.annotations.SQLRestriction;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import jakarta.persistence.*;
import lombok.*;
import java.util.Collection;
import java.util.List;

/**
 * Entidad de Usuario con soporte nativo para Spring Security.
 * Implementa {@link UserDetails} para gestionar la autenticación y autorización
 * directamente sobre la tabla de la base de datos.
 */
@Entity
@Table(name = "USUARIO")
@SQLDelete(sql = "UPDATE usuario SET activo = false WHERE id_usuario = ?")
@SQLRestriction("activo = true")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Usuario implements UserDetails {

    /** Identificador único del usuario. */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_usuario")
    private Long id;

    /** Documento Nacional de Identidad o NIE. Único. */
    @Column(nullable = false, unique = true, length = 20)
    private String dni;

    @Column(nullable = false, length = 100)
    private String nombre;

    @Column(nullable = false, length = 150)
    private String apellidos;

    /** Correo electrónico que actúa como 'username' en el sistema de login. */
    @Column(nullable = false, unique = true, length = 150)
    private String email;

    /** Hash de la contraseña (normalmente procesado con BCrypt). */
    @Column(nullable = false)
    private String password;

    @Column(length = 255)
    private String direccion;

    @Column(length = 20)
    private String telefono;

    /**
     * * Rol del usuario. Se carga de forma ANSIOSA (EAGER)
     * porque es necesario para casi todas las validaciones de seguridad.
     */
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "id_rol", nullable = false)
    private Rol rol;

    /** Ruta del avatar o imagen de perfil. */
    @Column(name = "foto_perfil_ruta")
    private String fotoPerfilRuta;

    /** Estado de cuenta (Soft Delete). Si es false, el login fallará. */
    @Builder.Default
    @Column(nullable = false)
    private boolean activo = true;

    @OneToMany(mappedBy = "usuario", cascade = CascadeType.REMOVE, orphanRemoval = true)
    private List<Inscripcion> inscripciones;

    // ==============================================================
    // IMPLEMENTACIÓN DE USERDETAILS
    // ==============================================================

    /**
     * Convierte el Rol de la entidad en una autoridad reconocible por Spring
     * Security.
     */
    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {

        return List.of(new SimpleGrantedAuthority("ROLE_" + rol.getNombre()));
    }

    @Override
    public String getUsername() {
        return this.email;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    /** El acceso depende del estado 'activo' (Soft Delete). */
    @Override
    public boolean isEnabled() {
        return this.activo;
    }
}