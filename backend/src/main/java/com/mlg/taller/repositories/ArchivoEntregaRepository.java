package com.mlg.taller.repositories;

import com.mlg.taller.model.entities.ArchivoEntrega;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ArchivoEntregaRepository extends JpaRepository<ArchivoEntrega, Long> {
    List<ArchivoEntrega> findByEntregaId(Long idEntrega);
}