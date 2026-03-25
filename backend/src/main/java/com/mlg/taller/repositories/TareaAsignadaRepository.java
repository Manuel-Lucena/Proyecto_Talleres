package com.mlg.taller.repositories;

import com.mlg.taller.model.entities.TareaAsignada;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface TareaAsignadaRepository extends JpaRepository<TareaAsignada, Long> {

    List<TareaAsignada> findByAlumnoId(Long alumnoId);
    void deleteByTareaId(Long tareaId);
}
