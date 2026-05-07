package com.mlg.taller.model.entities;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

/**
 * Entidad que gestiona los tokens temporales para la recuperación de
 * contraseñas.
 * Permite desvincular la seguridad temporal de la información básica del
 * usuario.
 */
@Entity
@Table(name = "PASSWORD_RESET_TOKEN")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PasswordResetToken {

    /** Identificador único del token. */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_token")
    private Long id;

    /** Código único aleatorio enviado por email al usuario. */
    @Column(nullable = false, unique = true, length = 100)
    private String token;

    /** Usuario vinculado a la solicitud de recuperación. */
    @OneToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "id_usuario", nullable = false)
    private Usuario usuario;

    /** Fecha y hora exacta en la que el token dejará de ser válido. */
    @Column(name = "fecha_expiracion", nullable = false)
    private LocalDateTime fechaExpiracion;

    /**
     * * Comprueba si el token ha superado la fecha límite de uso.
     * 
     * @return true si el token ya no es válido.
     */
    public boolean isExpirado() {
        return LocalDateTime.now().isAfter(this.fechaExpiracion);
    }
}