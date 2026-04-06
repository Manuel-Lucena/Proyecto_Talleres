package com.mlg.taller.model.entities;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

/**
 * Entidad que representa un enunciado o plantilla adjunta a una tarea.
 */
@Entity
@Table(name = "ARCHIVO_TAREA")
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class ArchivoTarea extends Archivo {

    /** Relación con la tarea definida por el profesor. */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_tarea", nullable = false)
    private Tarea tarea;
}