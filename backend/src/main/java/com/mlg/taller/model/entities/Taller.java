package com.mlg.taller.model.entities;

import org.hibernate.annotations.SQLDelete;
import org.hibernate.annotations.SQLRestriction;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;

@Entity
@Table(name = "TALLER")
@SQLDelete(sql = "UPDATE taller SET activo = false WHERE id_taller = ?")
@SQLRestriction("activo = true")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Taller {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_taller")
    private Long id;

    @Column(nullable = false, length = 150)
    private String nombre;

    @Column(columnDefinition = "TEXT")
    private String descripcion;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_profesor")
    private Usuario profesor;

    @Column(name = "plazas_maximas", nullable = false)
    private Integer plazasMaximas;

    @Column(nullable = false)
    private Double precio;

    @Column(name = "fecha_inicio")
    private LocalDate fechaInicio;

    @Column(name = "fecha_fin")
    private LocalDate fechaFin;

    @Column(name = "foto_ruta")
    private String fotoRuta;

    @Builder.Default
    private boolean activo = true;
}