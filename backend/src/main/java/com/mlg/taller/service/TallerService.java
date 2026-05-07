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
import com.mlg.taller.service.validators.TallerValidator;
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
 * Utiliza TallerValidator para centralizar las reglas de negocio y seguridad.
 */
@Service
@RequiredArgsConstructor
public class TallerService {

    private final TallerRepository tallerRepository;
    private final UsuarioRepository usuarioRepository;
    private final TallerValidator tallerValidator;
    private final TallerMapper tallerMapper;
    private final FileUtil fileUtil;

    private static final String FOLDER = "talleres";

    // --- MÉTODOS POST ---

    /**
     * Crea un nuevo taller asociándolo a un profesor y procesando su imagen.
     * * @param dto Datos del taller a crear.
     * 
     * @param archivo Imagen opcional para el taller.
     * @return TallerResponseDTO persistido.
     * @throws ResourceNotFoundException Si el profesor indicado no existe.
     */
    @Transactional
    public TallerResponseDTO crear(TallerRequestDTO dto, MultipartFile archivo) {
        tallerValidator.validarEsAdmin(SecurityUtils.getUsuarioAutenticado());
        tallerValidator.validarFechas(dto.getFechaInicio(), dto.getFechaFin());

        Taller taller = tallerMapper.toEntity(dto);
        if (dto.getIdProfesor() != null) {
            taller.setProfesor(buscarProfesorInterno(dto.getIdProfesor()));
        }

        taller = tallerRepository.save(taller);
        gestionarImagenTallerInterno(taller, archivo);

        return tallerMapper.toResponse(tallerRepository.save(taller));
    }

    // --- MÉTODOS GET ---

    /**
     * Lista todos los talleres registrados en el sistema.
     * * @return Lista de todos los talleres mapeados a DTO.
     */
    @Transactional(readOnly = true)
    public List<TallerResponseDTO> listarTodos() {
        return tallerRepository.findAll().stream()
                .map(tallerMapper::toResponse)
                .collect(Collectors.toList());
    }

    /**
     * Busca un taller por su identificador único.
     * * @param id Identificador del taller.
     * 
     * @return TallerResponseDTO encontrado.
     * @throws ResourceNotFoundException Si el taller no existe.
     */
    @Transactional(readOnly = true)
    public TallerResponseDTO buscarPorId(Long id) {
        return tallerMapper.toResponse(buscarTallerInterno(id));
    }

    /**
     * Lista los talleres en los que participa un usuario específico
     * (inscripciones).
     * * @param idUsuario ID del usuario.
     * 
     * @return Lista de talleres asociados.
     * @throws BadRequestException Acceso denegado: Si un usuario que no es ADMIN
     *                             intenta consultar los talleres de otro usuario.
     */
    @Transactional(readOnly = true)
    public List<TallerResponseDTO> listarTalleresPorUsuarioId(Long idUsuario) {
        tallerValidator.validarAccesoPrivado(SecurityUtils.getUsuarioAutenticado(), idUsuario);

        return tallerRepository.findTalleresByUsuarioId(idUsuario).stream()
                .map(tallerMapper::toResponse)
                .collect(Collectors.toList());
    }

    /**
     * Lista los talleres que un profesor tiene asignados como titular.
     * * @param idProfesor ID del profesor a consultar.
     * 
     * @return Lista de talleres que imparte el usuario.
     * @throws BadRequestException Acceso denegado: Si un profesor intenta consultar
     *                             la carga docente de otro sin ser ADMIN.
     */
    @Transactional(readOnly = true)
    public List<TallerResponseDTO> listarTalleresPorProfesorId(Long idProfesor) {
        tallerValidator.validarAccesoPrivado(SecurityUtils.getUsuarioAutenticado(), idProfesor);

        return tallerRepository.findByProfesorId(idProfesor).stream()
                .map(tallerMapper::toResponse)
                .collect(Collectors.toList());
    }

    // --- MÉTODOS PUT ---

    /**
     * Actualiza la información de un taller existente.
     * * @param id ID del taller a modificar.
     * 
     * @param dto     Nuevos datos del taller.
     * @param archivo Nueva imagen opcional.
     * @return TallerResponseDTO actualizado.
     * @throws ResourceNotFoundException Si el taller o el nuevo profesor no
     *                                   existen.
     * @throws BadRequestException       Operación denegada: Si el usuario no es
     *                                   ADMINISTRADOR.
     */
    @Transactional
    public TallerResponseDTO actualizar(Long id, TallerRequestDTO dto, MultipartFile archivo) {
        tallerValidator.validarEsAdmin(SecurityUtils.getUsuarioAutenticado());
        tallerValidator.validarFechas(dto.getFechaInicio(), dto.getFechaFin());

        Taller taller = buscarTallerInterno(id);
        tallerMapper.updateEntityFromDto(dto, taller);

        if (dto.getIdProfesor() != null) {
            taller.setProfesor(buscarProfesorInterno(dto.getIdProfesor()));
        } else {
            taller.setProfesor(null);
        }

        gestionarImagenTallerInterno(taller, archivo);
        return tallerMapper.toResponse(tallerRepository.save(taller));
    }

    // --- MÉTODOS DELETE ---

    /**
     * Elimina un taller del sistema y su imagen asociada del almacenamiento.
     * * @param id ID del taller a borrar.
     * 
     * @throws ResourceNotFoundException Si el taller no existe.
     * @throws BadRequestException       Si el usuario no es ADMINISTRADOR.
     */
    @Transactional
    public void eliminar(Long id) {
        tallerValidator.validarEsAdmin(SecurityUtils.getUsuarioAutenticado());

        Taller taller = buscarTallerInterno(id);
        if (taller.getFotoRuta() != null) {
            fileUtil.eliminar(FOLDER, taller.getFotoRuta(), true);
        }
        tallerRepository.delete(taller);
    }

    // --- MÉTODOS PRIVADOS DE APOYO ---

    /**
     * Busca un taller en el repositorio a partir de su identificador único.
     * * Centraliza la recuperación de entidades de taller para garantizar que
     * cualquier
     * operación sobre un recurso inexistente sea gestionada mediante una excepción
     * de recurso no encontrado.
     *
     * @param id Identificador único del taller.
     * @return Entidad Taller encontrada.
     * @throws ResourceNotFoundException si el taller no existe en la base de datos.
     */
    private Taller buscarTallerInterno(Long id) {
        return tallerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Taller no encontrado con ID: " + id));
    }

    /**
     * Recupera un usuario con rol de profesor a partir de su identificador.
     * 
     * @param idProfesor Identificador del usuario profesor.
     * @return Entidad Usuario correspondiente al profesor.
     * @throws ResourceNotFoundException si el profesor no existe.
     */
    private Usuario buscarProfesorInterno(Long idProfesor) {
        return usuarioRepository.findById(idProfesor)
                .orElseThrow(
                        () -> new ResourceNotFoundException("El profesor asignado (ID: " + idProfesor + ") no existe"));
    }

    /**
     * Procesa y persiste físicamente la imagen representativa del taller.
     * 
     * @param taller  Entidad taller que recibirá la ruta del archivo.
     * @param archivo Archivo de imagen (binario) recibido por el controlador.
     */
    private void gestionarImagenTallerInterno(Taller taller, MultipartFile archivo) {
        if (archivo != null && !archivo.isEmpty()) {
            String nombreImagen = "taller_" + taller.getId() + ".jpg";
            fileUtil.guardar(archivo, FOLDER, nombreImagen, true);
            taller.setFotoRuta(nombreImagen);
        }
    }
}