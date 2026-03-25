package com.mlg.taller.model.entities;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "ARCHIVO_MATERIAL")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ArchivoMaterial {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_archivo")
    private Long id;

    @Column(nullable = false, length = 150)
    private String nombre;

    @Column(name = "ruta_archivo", nullable = false)
    private String rutaArchivo;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_material", nullable = false)
    private Material material;
}