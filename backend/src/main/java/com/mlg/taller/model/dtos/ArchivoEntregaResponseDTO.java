package com.mlg.taller.model.dtos;

import lombok.Data;

/**
 * DTO para el envío de información detallada de un archivo de entrega.
 * Proporciona los metadatos necesarios para listar o descargar archivos desde la interfaz.
 */
@Data
public class ArchivoEntregaResponseDTO {

    /** Identificador único del registro en la base de datos. */
    private Long id;

    /** Nombre descriptivo u original del archivo. */
    private String nombre;

    /** Ubicación lógica del archivo para gestionar su descarga. */
    private String rutaArchivo;

    /** Tipo de archivo (pdf, jpg, docx, etc.) para iconos en el frontend. */
    private String extension; 

    /** ID de la entrega vinculada. */
    private Long idEntrega;
}