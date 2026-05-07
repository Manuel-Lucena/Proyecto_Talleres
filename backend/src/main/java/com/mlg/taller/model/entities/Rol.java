package com.mlg.taller.model.entities;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Entidad que define los niveles de permisos en el sistema.
 * 
 * @example 'ADMIN', 'PROFESOR', 'ALUMNO'.
 */
@Entity
@Table(name = "ROL")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Rol {

    /** Identificador único del rol. */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_rol")
    private Long id;

    /** Nombre único del rol para la lógica de seguridad. */
    @Column(nullable = false, unique = true, length = 50)
    private String nombre;
}