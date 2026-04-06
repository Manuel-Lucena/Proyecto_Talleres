package com.mlg.taller.model.dtos;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO para la respuesta detallada de un archivo asociado a una tarea.
 * Proporciona metadatos técnicos y de ubicación para la gestión de descargas
 * y visualización de recursos educativos en el frontend.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ArchivoTareaResponseDTO {

    /** Identificador único del registro de archivo en la base de datos. */
    private Long id;

    /** Nombre original del archivo. */
    private String nombre;

    /** Ruta lógica de almacenamiento dentro del servidor. */
    private String rutaArchivo;

    /** * Extensión del fichero. 
     * @example Útil para mostrar el icono correspondiente en la interfaz de usuario.
     */
    private String extension; 

    /** Identificador de la tarea a la que pertenece este recurso. */
    private Long idTarea;   
}