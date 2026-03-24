package com.mlg.taller.service;

import com.mlg.taller.exception.ResourceNotFoundException;
import com.mlg.taller.model.dtos.TallerRequestDTO;
import com.mlg.taller.model.dtos.TallerResponseDTO;
import com.mlg.taller.model.entities.Taller;
import com.mlg.taller.model.entities.Usuario;
import com.mlg.taller.model.mappers.TallerMapper;
import com.mlg.taller.repositories.TallerRepository;
import com.mlg.taller.repositories.UsuarioRepository;
import com.mlg.taller.util.FileUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Servicio para la gestión de talleres y cursos.
 * Controla la asignación de profesores y el almacenamiento de imágenes
 * descriptivas.
 */
@Service
@RequiredArgsConstructor
public class TallerService {

    private final TallerRepository tallerRepository;
    private final UsuarioRepository usuarioRepository;
    private final TallerMapper tallerMapper;
    private final FileUtil fileUtil;

    private static final String FOLDER = "talleres";

    /**
     * Crea un nuevo taller asociándolo a un profesor y procesando su imagen.
     * * @param dto Datos del taller a crear (incluye ID del profesor).
     * 
     * @param archivo Imagen opcional para el taller.
     * @return DTO con la información del taller persistido.
     * @throws ResourceNotFoundException si el profesor indicado no existe.
     */
    @Transactional
    public TallerResponseDTO crear(TallerRequestDTO dto, MultipartFile archivo) {
        Taller taller = tallerMapper.toEntity(dto);
        taller.setProfesor(obtenerProfesor(dto.getIdProfesor()));

        taller = tallerRepository.save(taller);
        gestionarImagenTaller(taller, archivo);

        return tallerMapper.toResponse(tallerRepository.save(taller));
    }

    /**
     * Busca un taller por su identificador.
     * * @param id Identificador único del taller.
     * 
     * @return DTO del taller encontrado.
     * @throws ResourceNotFoundException si no existe el taller.
     */
    @Transactional(readOnly = true)
    public TallerResponseDTO buscarPorId(Long id) {
        return tallerRepository.findById(id)
                .map(tallerMapper::toResponse)
                .orElseThrow(() -> new ResourceNotFoundException("Taller no encontrado con ID: " + id));
    }

    /**
     * Lista todos los talleres registrados en el sistema.
     * * @return Lista de talleres en formato DTO.
     */
    @Transactional(readOnly = true)
    public List<TallerResponseDTO> listarTodos() {
        return tallerRepository.findAll().stream()
                .map(tallerMapper::toResponse)
                .collect(Collectors.toList());
    }

    /**
     * Actualiza la información de un taller existente.
     * * @param id ID del taller a modificar.
     * 
     * @param dto     Nuevos datos.
     * @param archivo Nueva imagen opcional.
     * @return DTO del taller actualizado.
     * @throws ResourceNotFoundException si el taller o el nuevo profesor no
     *                                   existen.
     */
    @Transactional
    public TallerResponseDTO actualizar(Long id, TallerRequestDTO dto, MultipartFile archivo) {
        Taller taller = tallerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Taller no encontrado con ID: " + id));

        tallerMapper.updateEntityFromDto(dto, taller);

        if (dto.getIdProfesor() != null) {
            taller.setProfesor(obtenerProfesor(dto.getIdProfesor()));
        } else {
            taller.setProfesor(null);
        }

        gestionarImagenTaller(taller, archivo);

        return tallerMapper.toResponse(tallerRepository.save(taller));
    }

    @Transactional(readOnly = true)
    public List<TallerResponseDTO> listarTalleresPorUsuarioId(Long idUsuario) {
        List<Taller> entidades = tallerRepository.findTalleresByUsuarioId(idUsuario);
        return entidades.stream()
                .map(tallerMapper::toResponse) // Usamos tu mapper de siempre
                .collect(Collectors.toList());
    }

    /**
     * Elimina un taller del sistema.
     * * @param id ID del taller a borrar.
     * 
     * @throws ResourceNotFoundException si el taller no existe.
     */
    @Transactional
    public void eliminar(Long id) {
        if (!tallerRepository.existsById(id)) {
            throw new ResourceNotFoundException("No se puede eliminar: Taller no encontrado con ID: " + id);
        }
        tallerRepository.deleteById(id);
    }

    // --- MÉTODOS PRIVADOS DE APOYO ---

    /**
     * Busca un usuario con rol de profesor en la base de datos.
     * * @param idProfesor Identificador del usuario.
     * 
     * @return Entidad Usuario encontrada.
     * @throws ResourceNotFoundException si el profesor no existe.
     */
    private Usuario obtenerProfesor(Long idProfesor) {
        return usuarioRepository.findById(idProfesor)
                .orElseThrow(
                        () -> new ResourceNotFoundException("El profesor asignado (ID: " + idProfesor + ") no existe"));
    }

    /**
     * Procesa y guarda físicamente la imagen del taller si se proporciona.
     * * @param taller Entidad taller que recibirá la ruta de la foto.
     * 
     * @param archivo Archivo MultipartFile recibido.
     */
    private void gestionarImagenTaller(Taller taller, MultipartFile archivo) {
        if (archivo != null && !archivo.isEmpty()) {
            String nombreImagen = "taller_" + taller.getId() + ".jpg";
            fileUtil.guardar(archivo, FOLDER, nombreImagen);
            taller.setFotoRuta(nombreImagen);
        }
    }
}