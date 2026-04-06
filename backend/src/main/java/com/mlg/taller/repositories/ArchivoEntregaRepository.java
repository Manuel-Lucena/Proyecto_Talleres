package com.mlg.taller.repositories;

import com.mlg.taller.model.entities.ArchivoEntrega;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

/**
 * Repositorio para la gestión de persistencia de metadatos de archivos de entregas.
 * Permite localizar los ficheros físicos asociados a la respuesta de un alumno a una tarea.
 */
@Repository
public interface ArchivoEntregaRepository extends JpaRepository<ArchivoEntrega, Long> {

    /**
     * Recupera todos los archivos asociados a una entrega específica.
     * @param idEntrega Identificador único de la entrega.
     * @return Lista de metadatos de archivos (rutas, nombres y extensiones).
     * @note Útil para mostrar al profesor todos los ficheros que componen un trabajo entregado.
     */
    List<ArchivoEntrega> findByEntregaId(Long idEntrega);
}