package com.mlg.taller.repositories;

import com.mlg.taller.model.entities.Noticia;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

/**
 * Repositorio para la gestión de novedades y avisos generales.
 */
@Repository
public interface NoticiaRepository extends JpaRepository<Noticia, Long> {

    /**
     * Recupera todas las noticias publicadas, priorizando las más recientes.
     * @return Lista de noticias en orden descendente por fecha de publicación.
     */
    List<Noticia> findAllByOrderByFechaPublicacionDesc();
}