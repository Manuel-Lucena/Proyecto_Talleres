package com.mlg.taller.model.dtos;

import lombok.Data;
import java.time.LocalDateTime;

/**
 * DTO para la visualización de mensajes en el historial.
 * Aplana la información del autor para facilitar el renderizado de la interfaz
 * de chat.
 */
@Data
public class MensajeResponseDTO {

    /** Identificador único del mensaje. */
    private Long idMensaje;

    /** Contenido del mensaje enviado. */
    private String contenido;

    /** Fecha y hora exacta del envío. */
    private LocalDateTime fechaEnvio;

    /** ID del taller de origen. */
    private Long idTaller;

    /** Nombre del taller (opcional para contextos multicanal). */
    private String nombreTaller;

    /** ID del emisor del mensaje. */
    private Long idUsuario;

    /** Foto de perfil del autor del mensaje */
    private String fotoPerfilAutor;

    /** Nombre completo del autor (para mostrar junto al mensaje). */
    private String nombreAutor;
}