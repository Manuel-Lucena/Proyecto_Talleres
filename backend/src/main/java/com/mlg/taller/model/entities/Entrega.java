package com.mlg.taller.model.entities;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.List;

import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;

/**
 * Entidad que gestiona el envío de actividades por parte de los alumnos.
 * Almacena el contenido, la fecha, la nota final y el feedback del profesor.
 */
@Entity
@Table(name = "ENTREGA")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Entrega {

    /** Identificador único de la entrega. */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_entrega")
    private Long id;

    /** Tarea a la que responde esta entrega. */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_tarea", nullable = false)
    private Tarea tarea;

    /** Alumno (Usuario) propietario de la entrega. */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_usuario", nullable = false)
    @OnDelete(action = OnDeleteAction.CASCADE)
    private Usuario alumno;

    /** Texto explicativo o cuerpo del trabajo en formato largo. */
    @Column(name = "texto_entrega", columnDefinition = "TEXT")
    private String textoEntrega;

    /** Marca de tiempo del momento del envío. */
    @Column(name = "fecha_entrega")
    private LocalDateTime fechaEntrega;

    /** Calificación otorgada (0.0 - 10.0). */
    private Double calificacion;

    /** Retroalimentación cualitativa del instructor. */
    @Column(name = "comentario_profesor", columnDefinition = "TEXT")
    private String comentarioProfesor;

    /**
     * * Listado de archivos adjuntos a esta entrega específica.
     * Incluye borrado en cascada para mantener la integridad de los ficheros.
     */
    @OneToMany(mappedBy = "entrega", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ArchivoEntrega> archivos;
}