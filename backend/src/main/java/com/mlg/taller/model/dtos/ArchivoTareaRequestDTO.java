package com.mlg.taller.model.dtos;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

/**
 * DTO para la solicitud de creación de un archivo asociado a una tarea.
 * Se utiliza para registrar los recursos didácticos o enunciados que 
 * el profesor adjunta a una actividad evaluable.
 */
@Data
public class ArchivoTareaRequestDTO {

    /** * Identificador único de la tarea a la que se vincula el archivo. 
     * @constraints Campo obligatorio para asegurar la integridad de la relación.
     */
    @NotNull(message = "La tarea asociada es obligatoria")
    private Long idTarea;

    /** Nombre descriptivo u original del archivo (ej: "Enunciado_Practica_1.pdf"). */
    private String nombre;

    /** Ruta o identificador del sistema de archivos donde se almacena el recurso. */
    private String rutaArchivo;
}