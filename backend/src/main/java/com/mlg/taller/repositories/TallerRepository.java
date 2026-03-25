package com.mlg.taller.repositories;

import com.mlg.taller.model.entities.Taller;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface TallerRepository extends JpaRepository<Taller, Long> {
    List<Taller> findByProfesorId(Long profesorId);

    @Query("SELECT i.taller FROM Inscripcion i WHERE i.usuario.id = :idUsuario AND i.activa = true")
    List<Taller> findTalleresByUsuarioId(@Param("idUsuario") Long idUsuario);
}