package com.mlg.taller.model.dtos;

import lombok.Data;

/**
 * DTO para la recepción de datos al registrar un nuevo archivo de entrega.
 * Se utiliza para vincular el recurso físico con su respectiva entrega en la base de datos.
 */
@Data
public class ArchivoEntregaRequestDTO {

    /** Nombre original del archivo subido por el alumno. */
    private String nombre;

    /** Ruta generada o asignada para el almacenamiento en el servidor. */
    private String rutaArchivo;

    /** Identificador único de la entrega a la que pertenece este archivo. */
    private Long idEntrega;
}