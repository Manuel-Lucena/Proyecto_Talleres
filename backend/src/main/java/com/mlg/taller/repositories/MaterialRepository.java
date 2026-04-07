package com.mlg.taller.repositories;

import com.mlg.taller.model.entities.Material;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

/**
 * Repositorio para la gestión de materiales y lecciones publicadas.
 */
@Repository
public interface MaterialRepository extends JpaRepository<Material, Long> {

    /**
     * Recupera todos los materiales didácticos publicados en un taller.
     * * @param tallerId Identificador del taller.
     * 
     * @return Lista de materiales (lecciones, PDFs, etc.) asociados al taller.
     */
    List<Material> findByTallerId(Long tallerId);

    /**
     * Recupera solo los materiales marcados como visibles para un taller
     * específico.
     * * @param idTaller Identificador del taller.
     * 
     * @return Lista de materiales activos.
     */
    List<Material> findByTallerIdAndVisibleTrue(Long idTaller);
}