package com.mlg.taller.model.dtos;

import lombok.Data;

/**
 * DTO para la creación de un nuevo registro de archivo de material.
 * Se utiliza para vincular recursos descargables con su material didáctico padre.
 */
@Data
public class ArchivoMaterialRequestDTO {

    /** Nombre descriptivo del archivo (ej: "Guía de Instalación"). */
    private String nombre;

    /** Ruta o nombre del sistema asignado al archivo en el servidor. */
    private String rutaArchivo;

    /** Identificador del material didáctico al que pertenece este recurso. */
    private Long idMaterial;
}