package com.mlg.taller.repositories;

import com.mlg.taller.model.entities.Rol;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

/**
 * Repositorio para la gestión de roles de usuario (ADMIN, PROFESOR, ALUMNO).
 */
@Repository
public interface RolRepository extends JpaRepository<Rol, Long> {

    /**
     * Busca un rol por su nombre único.
     * @param nombre Nombre del rol (ej: "ROLE_ALUMNO").
     * @return Un {@link Optional} con el rol encontrado o vacío si no existe.
     */
    Optional<Rol> findByNombre(String nombre);
}