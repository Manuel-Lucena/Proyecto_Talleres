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
 */
@Service
@RequiredArgsConstructor
public class NoticiaService {

    private final NoticiaRepository noticiaRepository;
    private final NoticiaMapper noticiaMapper;
    private final FileUtil fileUtil;

    private static final String FOLDER = "noticias";

    // --- MÉTODOS POST ---

    /**
     * Crea una nueva noticia y procesa su imagen asociada si existe.
     * 
     * @param dto     Datos de la noticia a crear.
     * @param archivo Archivo de imagen opcional.
     * @return Noticia creada con su imagen asignada.
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

    // --- MÉTODOS GET ---

    /**
     * Recupera todas las noticias ordenadas por fecha de publicación descendente.
     * 
     * @return Lista de todas las noticias registradas.
     */
    @Transactional(readOnly = true)
    public List<NoticiaResponseDTO> listarTodas() {
        return noticiaRepository.findAllByOrderByFechaPublicacionDesc().stream()
                .map(noticiaMapper::toResponse)
                .collect(Collectors.toList());
    }

    /**
     * Busca una noticia específica por su identificador único.
     * 
     * @param id Identificador de la noticia.
     * @return Noticia encontrada.
     * @throws ResourceNotFoundException Si la noticia no existe.
     */
    @Transactional(readOnly = true)
    public NoticiaResponseDTO buscarPorId(Long id) {
        return noticiaRepository.findById(id)
                .map(noticiaMapper::toResponse)
                .orElseThrow(() -> new ResourceNotFoundException("Noticia no encontrada con ID: " + id));
    }

    // --- MÉTODOS PUT ---

    /**
     * Actualiza el contenido y/o la imagen de una noticia existente.
     * 
     * @param id      ID de la noticia a modificar.
     * @param dto     Nuevos datos de la noticia.
     * @param archivo Nuevo archivo de imagen opcional.
     * @return Noticia actualizada.
     * @throws ResourceNotFoundException Si la noticia no existe.
     */
    @Transactional
    public NoticiaResponseDTO actualizar(Long id, NoticiaRequestDTO dto, MultipartFile archivo) {
        Noticia noticia = noticiaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Noticia no encontrada"));

        LocalDate fechaOriginal = noticia.getFechaPublicacion();

        noticiaMapper.updateEntityFromDto(dto, noticia);

        noticia.setFechaPublicacion(fechaOriginal);

        gestionarImagenNoticia(noticia, archivo);
        return noticiaMapper.toResponse(noticiaRepository.save(noticia));
    }

    // --- MÉTODOS DELETE ---

    /**
     * Elimina una noticia y su archivo de imagen físico del servidor.
     * 
     * @param id ID de la noticia a eliminar.
     * @throws ResourceNotFoundException Si la noticia no existe.
     */
    @Transactional
    public void eliminar(Long id) {
        Noticia noticia = noticiaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "No se puede eliminar: Noticia no encontrada con ID: " + id));

        if (noticia.getImagenUrl() != null) {
            fileUtil.eliminar(FOLDER, noticia.getImagenUrl(), true);
        }

        noticiaRepository.delete(noticia);
    }

    // --- MÉTODOS PRIVADOS ---

    /**
     * Procesa, guarda y vincula la imagen física con la entidad noticia.
     * 
     * @param noticia Entidad a la que se asignará la imagen.
     * @param archivo Archivo recibido desde el controlador.
     */
    private void gestionarImagenNoticia(Noticia noticia, MultipartFile archivo) {
        if (archivo != null && !archivo.isEmpty()) {
            if (noticia.getImagenUrl() != null) {
                fileUtil.eliminar(FOLDER, noticia.getImagenUrl(), true);
            }

            String nombreImagen = "noticia_" + noticia.getId() + ".jpg";
            fileUtil.guardar(archivo, FOLDER, nombreImagen, true);
            noticia.setImagenUrl(nombreImagen);
        }
    }
}