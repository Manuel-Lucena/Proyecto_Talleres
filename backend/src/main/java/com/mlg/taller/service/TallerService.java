package com.mlg.taller.service;

import com.mlg.taller.exception.BadRequestException;
import com.mlg.taller.exception.ResourceNotFoundException;
import com.mlg.taller.model.dtos.TallerRequestDTO;
import com.mlg.taller.model.dtos.TallerResponseDTO;
import com.mlg.taller.model.entities.Taller;
import com.mlg.taller.model.entities.Usuario;
import com.mlg.taller.model.mappers.TallerMapper;
import com.mlg.taller.repositories.TallerRepository;
import com.mlg.taller.repositories.UsuarioRepository;
import com.mlg.taller.util.FileUtil;
import com.mlg.taller.util.SecurityUtils;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Servicio para la gestión de talleres y cursos.
 */
@Service
@RequiredArgsConstructor
public class TallerService {

    private final TallerRepository tallerRepository;
    private final UsuarioRepository usuarioRepository;
    private final TallerMapper tallerMapper;
    private final FileUtil fileUtil;

    private static final String FOLDER = "talleres";

    // --- MÉTODOS POST ---

    /**
     * Crea un nuevo taller asociándolo a un profesor y procesando su imagen.
     * 
     * @param dto     Datos del taller a crear.
     * @param archivo Imagen opcional para el taller.
     * @return Taller persistido.
     * @throws ResourceNotFoundException Si el profesor indicado no existe.
     */
    @Transactional
    public TallerResponseDTO crear(TallerRequestDTO dto, MultipartFile archivo) {
        Taller taller = tallerMapper.toEntity(dto);
        if (dto.getIdProfesor() != null) {
            taller.setProfesor(obtenerProfesor(dto.getIdProfesor()));
        } else {
            taller.setProfesor(null);
        }

        taller = tallerRepository.save(taller);
        gestionarImagenTaller(taller, archivo);

        return tallerMapper.toResponse(tallerRepository.save(taller));
    }

    // --- MÉTODOS GET ---

    /**
     * Lista todos los talleres registrados en el sistema.
     * 
     * @return Lista de todos los talleres.
     */
    @Transactional(readOnly = true)
    public List<TallerResponseDTO> listarTodos() {
        return tallerRepository.findAll().stream()
                .map(tallerMapper::toResponse)
                .collect(Collectors.toList());
    }

    /**
     * Busca un taller por su identificador único.
     * 
     * @param id Identificador del taller.
     * @return Taller encontrado.
     * @throws ResourceNotFoundException Si el taller no existe.
     */
    @Transactional(readOnly = true)
    public TallerResponseDTO buscarPorId(Long id) {
        return tallerRepository.findById(id)
                .map(tallerMapper::toResponse)
                .orElseThrow(() -> new ResourceNotFoundException("Taller no encontrado con ID: " + id));
    }

    /**
     * Lista los talleres en los que participa un usuario específico.
     * 
     * @param idUsuario ID del usuario.
     * @return Lista de talleres asociados.
     *         * @throws BadRequestException Acceso denegado: Si un usuario que no
     *         es ADMIN intenta consultar los talleres de otro usuario.
     */
    @Transactional(readOnly = true)
    public List<TallerResponseDTO> listarTalleresPorUsuarioId(Long idUsuario) {
        Usuario solicitante = SecurityUtils.getUsuarioAutenticado();
        boolean esAdmin = solicitante.getRol().getNombre().equalsIgnoreCase("ADMIN");

        if (!esAdmin && !solicitante.getId().equals(idUsuario)) {
            throw new BadRequestException("Acceso denegado: No puedes consultar los datos de otro usuario.");
        }

        return tallerRepository.findTalleresByUsuarioId(idUsuario).stream()
                .map(tallerMapper::toResponse)
                .collect(Collectors.toList());
    }

    /**
     * Lista los talleres que un profesor tiene asignados como titular.
     * * @param idProfesor ID del profesor a consultar.
     * 
     * @return Lista de talleres que imparte el usuario.
     * @throws BadRequestException Acceso denegado: Si un profesor intenta
     *                             consultar la carga docente de otro profesor sin
     *                             ser ADMIN.
     */
    @Transactional(readOnly = true)
    public List<TallerResponseDTO> listarTalleresPorProfesorId(Long idProfesor) {
        Usuario solicitante = SecurityUtils.getUsuarioAutenticado();
        boolean esAdmin = solicitante.getRol().getNombre().equalsIgnoreCase("ADMIN");

        if (!esAdmin && !solicitante.getId().equals(idProfesor)) {
            throw new BadRequestException("Acceso denegado: No puedes consultar la docencia de otro profesor.");
        }

        return tallerRepository.findByProfesorId(idProfesor).stream()
                .map(tallerMapper::toResponse)
                .collect(Collectors.toList());
    }

    // --- MÉTODOS PUT ---

    /**
     * Actualiza la información de un taller existente.
     * 
     * @param id      ID del taller a modificar.
     * @param dto     Nuevos datos del taller.
     * @param archivo Nueva imagen opcional.
     * @return Taller actualizado.
     * @throws ResourceNotFoundException Si el taller o el nuevo profesor no
     *                                   existen.
     * @throws BadRequestException       Operación
     *                                   denegada: Si un usuario intenta editar un
     *                                   taller sin tener el rol de ADMINISTRADOR.
     */
    @Transactional
    public TallerResponseDTO actualizar(Long id, TallerRequestDTO dto, MultipartFile archivo) {

        if (!SecurityUtils.getUsuarioAutenticado().getRol().getNombre().equalsIgnoreCase("ADMIN")) {
            throw new BadRequestException("Operación denegada: Solo el administrador puede editar talleres.");
        }

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

    // --- MÉTODOS DELETE ---

    /**
     * Elimina un taller del sistema y su imagen asociada.
     * 
     * @param id ID del taller a borrar.
     * @throws ResourceNotFoundException Si el taller no existe.
     */
    @Transactional
    public void eliminar(Long id) {
        Taller taller = tallerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "No se puede eliminar: Taller no encontrado con ID: " + id));

        if (taller.getFotoRuta() != null) {
            fileUtil.eliminar(FOLDER, taller.getFotoRuta(), true);
        }

        tallerRepository.delete(taller);
    }

    // --- MÉTODOS PRIVADOS ---

    /**
     * Busca un usuario con rol de profesor.
     * 
     * @param idProfesor ID del usuario profesor.
     * @return Usuario encontrado.
     * @throws ResourceNotFoundException Si el profesor no existe.
     */
    private Usuario obtenerProfesor(Long idProfesor) {
        return usuarioRepository.findById(idProfesor)
                .orElseThrow(
                        () -> new ResourceNotFoundException("El profesor asignado (ID: " + idProfesor + ") no existe"));
    }

    /**
     * Procesa y guarda físicamente la imagen del taller.
     * 
     * @param taller  Entidad taller que recibirá la ruta.
     * @param archivo Archivo de imagen recibido.
     */
    private void gestionarImagenTaller(Taller taller, MultipartFile archivo) {
        if (archivo != null && !archivo.isEmpty()) {
            String nombreImagen = "taller_" + taller.getId() + ".jpg";
            fileUtil.guardar(archivo, FOLDER, nombreImagen, true);
            taller.setFotoRuta(nombreImagen);
        }
    }
}