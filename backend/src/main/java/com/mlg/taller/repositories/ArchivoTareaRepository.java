package com.mlg.taller.repositories;

import com.mlg.taller.model.entities.ArchivoTarea;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ArchivoTareaRepository extends JpaRepository<ArchivoTarea, Long> {
    List<ArchivoTarea> findByTareaId(Long idTarea);
}