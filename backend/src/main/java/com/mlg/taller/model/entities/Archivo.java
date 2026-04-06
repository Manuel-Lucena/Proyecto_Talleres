package com.mlg.taller.model.entities;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

/**
 * Superclase abstracta para la gestión común de archivos en el sistema.
 * Define los atributos base (nombre, ruta, extensión) que comparten los 
 * archivos de entregas, materiales y tareas.
 */
@MappedSuperclass
@Data
@NoArgsConstructor 
@AllArgsConstructor
@SuperBuilder
public abstract class Archivo {

    /** Identificador único del registro de archivo. */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_archivo") 
    private Long id;

    /** Nombre original del fichero (máximo 150 caracteres). */
    @Column(nullable = false, length = 150)
    private String nombre;

    /** Ruta física o identificador de almacenamiento en el servidor. */
    @Column(name = "ruta_archivo", nullable = false)
    private String rutaArchivo;

    /** Extensión del archivo para metadatos */
    @Column(length = 10)
    private String extension; 
}