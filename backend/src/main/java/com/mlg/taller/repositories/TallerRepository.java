package com.mlg.taller.repositories;

import com.mlg.taller.model.entities.Taller;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface TallerRepository extends JpaRepository<Taller, Long> {
    List<Taller> findByProfesorId(Long profesorId);
}