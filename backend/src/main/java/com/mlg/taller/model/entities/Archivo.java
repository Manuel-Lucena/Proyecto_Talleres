package com.mlg.taller.model.entities;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

@MappedSuperclass
@Data
@NoArgsConstructor 
@AllArgsConstructor
@SuperBuilder
public abstract class Archivo {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_archivo") 
    private Long id;

    @Column(nullable = false, length = 150)
    private String nombre;

    @Column(name = "ruta_archivo", nullable = false)
    private String rutaArchivo;

    @Column(length = 10)
    private String extension; 
}