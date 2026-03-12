package com.mlg.taller.model.entities;

import com.mlg.taller.model.enums.EstadoPago;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.SQLDelete;
import org.hibernate.annotations.SQLRestriction;
import java.time.LocalDateTime;

@Entity
@Table(name = "INSCRIPCION")
@SQLDelete(sql = "UPDATE inscripcion SET activa = false WHERE id_inscripcion = ?")
@SQLRestriction("activa = true")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Inscripcion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_inscripcion")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_usuario", nullable = false)
    private Usuario usuario;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_taller", nullable = false)
    private Taller taller;

    @Column(name = "fecha_inscripcion")
    private LocalDateTime fechaInscripcion;

    @Column(name = "monto_pagado", nullable = false)
    private Double montoPagado;

    @Enumerated(EnumType.STRING)
    @Column(name = "estado_pago")
    private EstadoPago estadoPago;

    @Column(name = "order_id", unique = true)
    private String orderId;

    @Column(name = "fecha_pago")
    private LocalDateTime fechaPago;

    @Builder.Default
    @Column(nullable = false)
    private boolean activa = true;
}