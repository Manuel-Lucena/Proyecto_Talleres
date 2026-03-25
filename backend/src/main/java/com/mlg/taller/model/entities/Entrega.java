package com.mlg.taller.model.entities;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "ENTREGA")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Entrega {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_entrega")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_tarea", nullable = false)
    private Tarea tarea;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_usuario", nullable = false)
    private Usuario alumno;

    @Column(name = "texto_entrega", columnDefinition = "TEXT")
    private String textoEntrega;

    @Column(name = "fecha_entrega")
    private LocalDateTime fechaEntrega;

    private Double calificacion;

    @Column(name = "comentario_profesor", columnDefinition = "TEXT")
    private String comentarioProfesor;

    @OneToMany(mappedBy = "entrega", cascade = CascadeType.ALL, orphanRemoval = true)
    private java.util.List<ArchivoEntrega> archivos;
}