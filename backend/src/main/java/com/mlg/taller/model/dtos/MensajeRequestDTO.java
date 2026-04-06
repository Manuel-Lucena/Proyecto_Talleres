package com.mlg.taller.model.dtos;

import lombok.Data;

/**
 * DTO para la captura de un nuevo mensaje en el chat de un taller.
 * Vincula el contenido textual con el emisor y el canal (taller) correspondiente.
 */
@Data
public class MensajeRequestDTO {

    /** Cuerpo del mensaje o comentario. */
    private String contenido;

    /** Identificador del taller donde se publica el mensaje. */
    private Long idTaller;

    /** Identificador del usuario que envía el mensaje. */
    private Long idUsuario; 
}