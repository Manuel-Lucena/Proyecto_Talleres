package com.mlg.taller.model.entities;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "tareas_asignadas")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TareaAsignada {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_tarea", nullable = false)
    private Tarea tarea;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_usuario", nullable = false)
    private Usuario alumno;


}