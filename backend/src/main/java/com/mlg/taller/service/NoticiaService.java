package com.mlg.taller.service;

import com.mlg.taller.model.dtos.NoticiaRequestDTO;
import com.mlg.taller.model.dtos.NoticiaResponseDTO;
import com.mlg.taller.model.entities.Noticia;
import com.mlg.taller.model.mappers.NoticiaMapper;
import com.mlg.taller.repositories.NoticiaRepository;
import com.mlg.taller.util.FileUtil;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class NoticiaService {

    private final NoticiaRepository noticiaRepository;
    private final NoticiaMapper noticiaMapper;
    private final FileUtil fileUtil;

    @Transactional(readOnly = true)
    public List<NoticiaResponseDTO> listarTodas() {
        return noticiaRepository.findAllByOrderByFechaPublicacionDesc().stream()
                .map(noticiaMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public NoticiaResponseDTO buscarPorId(Long id) {
        return noticiaRepository.findById(id)
                .map(noticiaMapper::toResponse)
                .orElseThrow(() -> new RuntimeException("Noticia no encontrada con ID: " + id));
    }

    @Transactional
    public NoticiaResponseDTO crear(NoticiaRequestDTO dto, MultipartFile archivo) {
        Noticia noticia = noticiaMapper.toEntity(dto);

        if (noticia.getFechaPublicacion() == null) {
            noticia.setFechaPublicacion(LocalDate.now());
        }

        // 1. Guardamos primero para generar el ID
        noticia = noticiaRepository.save(noticia);

        // 2. Si hay archivo, lo guardamos usando FileUtil
        if (archivo != null && !archivo.isEmpty()) {
            String nombreImagen = "noticia_" + noticia.getId() + ".jpg";

            // PASO 2: Llamar a la utilidad de guardado físico
            fileUtil.guardar(archivo, "noticias", "noticia_" + noticia.getId() + ".jpg");

            noticia.setImagenUrl(nombreImagen);
            // Actualizamos la entidad con el nombre de la imagen
            noticia = noticiaRepository.save(noticia);
        }

        return noticiaMapper.toResponse(noticia);
    }

    @Transactional
    public NoticiaResponseDTO actualizar(Long id, NoticiaRequestDTO dto, MultipartFile archivo) {
        Noticia noticiaExistente = noticiaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("No se puede actualizar: Noticia no encontrada"));

        noticiaMapper.updateEntityFromDto(dto, noticiaExistente);

        // Si viene un archivo nuevo, sobrescribimos el anterior
        if (archivo != null && !archivo.isEmpty()) {
            String nombreImagen = "noticia_" + id + ".jpg";
            // CORRECCIÓN: Pasar la carpeta "noticias" y el nombre correcto
            fileUtil.guardar(archivo, "noticias", nombreImagen);
            noticiaExistente.setImagenUrl(nombreImagen);
        }

        return noticiaMapper.toResponse(noticiaRepository.save(noticiaExistente));
    }

    @Transactional
    public void eliminar(Long id) {
        Noticia noticia = noticiaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("No existe la noticia con ID: " + id));

        if (noticia.getImagenUrl() != null) {
            // CORRECCIÓN: El método eliminar ahora pide (carpeta, nombreArchivo)
            fileUtil.eliminar("noticias", noticia.getImagenUrl());
        }

        noticiaRepository.delete(noticia);
    }
}