package com.mlg.taller.service;

import com.mlg.taller.exception.ResourceNotFoundException;
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

/**
 * Servicio para la gestión de noticias y comunicados del centro.
 * Maneja la persistencia de datos y el ciclo de vida de las imágenes asociadas.
 */
@Service
@RequiredArgsConstructor
public class NoticiaService {

    private final NoticiaRepository noticiaRepository;
    private final NoticiaMapper noticiaMapper;
    private final FileUtil fileUtil;

    private static final String FOLDER = "noticias";

    /**
     * Recupera todas las noticias ordenadas por fecha de publicación descendente.
     * * @return Lista de DTOs con la información de todas las noticias.
     */
    @Transactional(readOnly = true)
    public List<NoticiaResponseDTO> listarTodas() {
        return noticiaRepository.findAllByOrderByFechaPublicacionDesc().stream()
                .map(noticiaMapper::toResponse)
                .collect(Collectors.toList());
    }

    /**
     * Busca una noticia específica por su identificador único.
     * * @param id Identificador de la noticia.
     * 
     * @return DTO de la noticia encontrada.
     * @throws ResourceNotFoundException si la noticia no existe.
     */
    @Transactional(readOnly = true)
    public NoticiaResponseDTO buscarPorId(Long id) {
        return noticiaRepository.findById(id)
                .map(noticiaMapper::toResponse)
                .orElseThrow(() -> new ResourceNotFoundException("Noticia no encontrada con ID: " + id));
    }

    /**
     * Crea una noticia y procesa su imagen asociada.
     * * @param dto Datos de la noticia a crear.
     * 
     * @param archivo Archivo de imagen (opcional).
     * @return DTO de la noticia recién creada con su ID e imagen asignada.
     */
    @Transactional
    public NoticiaResponseDTO crear(NoticiaRequestDTO dto, MultipartFile archivo) {
        Noticia noticia = noticiaMapper.toEntity(dto);

        if (noticia.getFechaPublicacion() == null) {
            noticia.setFechaPublicacion(LocalDate.now());
        }

        noticia = noticiaRepository.save(noticia);
        gestionarImagenNoticia(noticia, archivo);

        return noticiaMapper.toResponse(noticiaRepository.save(noticia));
    }

    /**
     * Actualiza el contenido y/o la imagen de una noticia existente.
     * * @param id Identificador de la noticia a modificar.
     * 
     * @param dto     Nuevos datos de la noticia.
     * @param archivo Nuevo archivo de imagen (opcional).
     * @return DTO de la noticia actualizada.
     * @throws ResourceNotFoundException si la noticia no existe.
     */
    @Transactional
    public NoticiaResponseDTO actualizar(Long id, NoticiaRequestDTO dto, MultipartFile archivo) {
        Noticia noticia = noticiaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("No se puede actualizar: Noticia no encontrada"));

        noticiaMapper.updateEntityFromDto(dto, noticia);
        gestionarImagenNoticia(noticia, archivo);

        return noticiaMapper.toResponse(noticiaRepository.save(noticia));
    }

    /**
     * Elimina una noticia del sistema y borra su imagen del almacenamiento físico.
     * * @param id Identificador de la noticia a eliminar.
     * 
     * @throws ResourceNotFoundException si la noticia no existe.
     */
    @Transactional
    public void eliminar(Long id) {
        Noticia noticia = noticiaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("No existe la noticia con ID: " + id));

        if (noticia.getImagenUrl() != null) {
            // 'true' para borrar de la carpeta pública
            fileUtil.eliminar(FOLDER, noticia.getImagenUrl(), true);
        }

        noticiaRepository.delete(noticia);
    }

    /**
     * Método privado de apoyo para procesar y guardar la imagen de la noticia.
     * * @param noticia Entidad noticia a la que se le asignará el nombre del
     * archivo.
     * 
     * @param archivo Archivo MultipartFile recibido desde el controlador.
     */
    private void gestionarImagenNoticia(Noticia noticia, MultipartFile archivo) {
        if (archivo != null && !archivo.isEmpty()) {
            // Si ya tenía una imagen antes, la borramos primero
            if (noticia.getImagenUrl() != null) {
                fileUtil.eliminar(FOLDER, noticia.getImagenUrl(), true);
            }

            String nombreImagen = "noticia_" + noticia.getId() + "_" + System.currentTimeMillis() + ".jpg";
            fileUtil.guardar(archivo, FOLDER, nombreImagen, true);
            noticia.setImagenUrl(nombreImagen);
        }
    }
}