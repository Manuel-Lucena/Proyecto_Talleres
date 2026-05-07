package com.mlg.taller.model.entities;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalTime;

/**
 * Entidad que define las sesiones cronológicas de un taller.
 * Permite establecer qué días y en qué franjas horarias se imparten las clases.
 */
@Entity
@Table(name = "HORARIO")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Horario {

    /** Identificador único del horario. */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_horario")
    private Long id;

    /** Taller al que pertenece este horario. */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_taller", nullable = false)
    private Taller taller;

    /** Día de la semana (Lunes, Martes, etc.). */
    @Column(name = "dia_semana", nullable = false, length = 50)
    private String diaSemana;

    /** Hora exacta de inicio de la sesión. */
    @Column(name = "hora_inicio", nullable = false)
    private LocalTime horaInicio;

    /** Hora de finalización de la sesión. */
    @Column(name = "hora_fin", nullable = false)
    private LocalTime horaFin;
}