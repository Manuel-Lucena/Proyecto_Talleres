package com.mlg.taller.repositories;

import com.mlg.taller.model.entities.Entrega;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface EntregaRepository extends JpaRepository<Entrega, Long> {
    

    List<Entrega> findByTareaId(Long idTarea);
    List<Entrega> findByAlumnoId(Long idUsuario);
    Optional<Entrega> findByTareaIdAndAlumnoId(Long idTarea, Long idUsuario);
}