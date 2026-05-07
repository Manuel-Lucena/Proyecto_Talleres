package com.mlg.taller.model.entities;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

/**
 * Entidad que registra las comunicaciones dentro del foro o chat de un taller
 * específico.
 */
@Entity
@Table(name = "MENSAJE")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Mensaje {

    /** Identificador único del mensaje. */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_mensaje")
    private Long id;

    /** Cuerpo del mensaje en formato de texto largo. */
    @Column(nullable = false, columnDefinition = "TEXT")
    private String contenido;

    /** Momento exacto de publicación del mensaje. */
    @Column(name = "fecha_envio")
    private LocalDateTime fechaEnvio;

    /** Taller (sala) donde se publicó el mensaje. */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_taller", nullable = false)
    private Taller taller;

    /** Usuario (Alumno o Profesor) que redactó el mensaje. */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_usuario", nullable = false)
    private Usuario autor;
}