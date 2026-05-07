package com.mlg.taller.model.entities;

import com.mlg.taller.model.enums.EstadoPago;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.SQLDelete;
import org.hibernate.annotations.SQLRestriction;
import java.time.LocalDateTime;

/**
 * Entidad que vincula a un alumno con un taller mediante un proceso de
 * matrícula.
 * Implementa 'Soft Delete' para mantener registros históricos de transacciones.
 */

@Entity
@Table(name = "INSCRIPCION")
@SQLDelete(sql = "UPDATE inscripcion SET activa = false WHERE id_inscripcion = ?")
@SQLRestriction("activa = true")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Inscripcion {

    /** Identificador único de la Inscripcion. */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_inscripcion")
    private Long id;

    /** Usuario que realiza la inscripción (Alumno). */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_usuario", nullable = false)
    private Usuario usuario;

    /** Taller en el que se matricula el usuario. */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_taller", nullable = false)
    private Taller taller;

    /** Fecha de solicitud de la matrícula. */
    @Column(name = "fecha_inscripcion")
    private LocalDateTime fechaInscripcion;

    /** Importe total abonado por la matrícula. */
    @Column(name = "monto_pagado", nullable = false)
    private Double montoPagado;

    /** Estado actual de la transacción (PENDIENTE, COMPLETADO, CANCELADO). */
    @Enumerated(EnumType.STRING)
    @Column(name = "estado_pago")
    private EstadoPago estadoPago;

    /**
     * Identificador único de transacción proporcionado por la pasarela de pagos
     * externa.
     */
    @Column(name = "order_id", unique = true)
    private String orderId;

    /** Marca de tiempo de cuando se confirmó el pago efectivamente. */
    @Column(name = "fecha_pago")
    private LocalDateTime fechaPago;

    /**
     * * Indicador de borrado lógico.
     * Permite invalidar inscripciones sin eliminarlas físicamente de la base de
     * datos.
     */
    @Builder.Default
    @Column(nullable = false)
    private boolean activa = true;
}