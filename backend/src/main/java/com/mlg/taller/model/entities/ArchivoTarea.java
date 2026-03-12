package com.mlg.taller.model.entities;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "ARCHIVO_TAREA")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ArchivoTarea {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_archivo")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_tarea", nullable = false)
    private Tarea tarea;

    @Column(name = "ruta_archivo", nullable = false)
    private String rutaArchivo;

    @Column(nullable = false, length = 150)
    private String nombre;
}