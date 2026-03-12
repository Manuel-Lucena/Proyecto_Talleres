package com.mlg.taller.repositories;

import com.mlg.taller.model.entities.ArchivoMaterial;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ArchivoMaterialRepository extends JpaRepository<ArchivoMaterial, Long> {
    List<ArchivoMaterial> findByMaterialId(Long idMaterial);
}