package com.mlg.taller.model.entities;

import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

/**
 * Entidad que representa un archivo adjunto a la entrega de un alumno.
 */
@Entity
@Table(name = "ARCHIVO_ENTREGA")
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class ArchivoEntrega extends Archivo {

    /** Relación con la entrega específica del alumno. */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_entrega", nullable = false)
    @OnDelete(action = OnDeleteAction.CASCADE)
    private Entrega entrega;
}