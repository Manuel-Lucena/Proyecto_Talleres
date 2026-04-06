package com.mlg.taller.model.entities;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

/**
 * Entidad que representa un recurso de apoyo o material didáctico.
 */
@Entity
@Table(name = "ARCHIVO_MATERIAL")
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class ArchivoMaterial extends Archivo {

    /** Relación con el material didáctico padre. */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_material", nullable = false)
    private Material material;
}