package com.mlg.taller.repositories;

import com.mlg.taller.model.entities.Inscripcion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface InscripcionRepository extends JpaRepository<Inscripcion, Long> {
    
    boolean existsByUsuarioIdAndTallerId(Long idUsuario, Long idTaller);
    
    List<Inscripcion> findByUsuarioId(Long idUsuario);
    
    List<Inscripcion> findByTallerId(Long idTaller);
    
    long countByTallerIdAndActivaTrue(Long idTaller);
}