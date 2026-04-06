package com.mlg.taller.repositories;

import com.mlg.taller.model.entities.ArchivoMaterial;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

/**
 * Repositorio para la gestión de persistencia de archivos de material didáctico.
 * Proporciona el acceso a los metadatos de los documentos de apoyo cargados por los profesores.
 */
@Repository
public interface ArchivoMaterialRepository extends JpaRepository<ArchivoMaterial, Long> {

    /**
     * Recupera la colección de archivos vinculados a un material educativo específico.
     * @param idMaterial Identificador del material (lección o recurso).
     * @return Lista de entidades ArchivoMaterial con sus rutas de almacenamiento.
     * @note Crucial para generar la lista de descargas en la vista de materiales del alumno.
     */
    List<ArchivoMaterial> findByMaterialId(Long idMaterial);
}