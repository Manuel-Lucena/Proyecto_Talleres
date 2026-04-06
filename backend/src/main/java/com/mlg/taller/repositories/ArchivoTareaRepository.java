package com.mlg.taller.repositories;

import com.mlg.taller.model.entities.ArchivoTarea;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

/**
 * Repositorio para la gestión de archivos adjuntos a los enunciados de las tareas.
 * Proporciona acceso a los recursos que el profesor define como base para una actividad.
 */
@Repository
public interface ArchivoTareaRepository extends JpaRepository<ArchivoTarea, Long> {

    /**
     * Recupera la lista de archivos vinculados a una tarea específica.
     * @param idTarea Identificador de la tarea (actividad evaluable).
     * @return Lista de entidades ArchivoTarea con sus metadatos y rutas.
     * @note Vital para que el alumno pueda descargar las instrucciones o plantillas de la tarea.
     */
    List<ArchivoTarea> findByTareaId(Long idTarea);
}