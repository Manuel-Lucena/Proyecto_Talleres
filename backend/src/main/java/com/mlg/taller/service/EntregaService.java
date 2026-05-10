package com.mlg.taller.service;

import com.mlg.taller.exception.BadRequestException;
import com.mlg.taller.exception.ResourceNotFoundException;
import com.mlg.taller.model.dtos.EntregaRequestDTO;
import com.mlg.taller.model.dtos.EntregaResponseDTO;
import com.mlg.taller.model.entities.Entrega;
import com.mlg.taller.model.entities.Tarea;
import com.mlg.taller.model.entities.Usuario;
import com.mlg.taller.model.mappers.EntregaMapper;
import com.mlg.taller.repositories.EntregaRepository;
import com.mlg.taller.repositories.TareaRepository;
import com.mlg.taller.service.validators.EntregaValidator;
import com.mlg.taller.util.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Servicio para la gestión de entregas de tareas.
 *
 * Implementa la lógica de envío, calificación y consulta de trabajos,
 * delegando la validación de reglas de acceso en el componente validator.
 */
@Service
@RequiredArgsConstructor
public class EntregaService {

    private final EntregaRepository entregaRepository;
    private final TareaRepository tareaRepository;
    private final EntregaMapper entregaMapper;
    private final EntregaValidator entregaValidator;

    // --- MÉTODOS POST ---

    /**
     * Registra una nueva entrega de tarea por parte de un alumno.
     *
     * @param dto Datos del envío.
     * @return DTO con la información de la entrega creada.
     */
    @Transactional
    public EntregaResponseDTO enviar(EntregaRequestDTO dto) {
        Usuario alumno = SecurityUtils.getUsuarioAutenticado();
        Tarea tarea = buscarTareaInterna(dto.getIdTarea());

        entregaValidator.validarRequisitosEnvio(alumno, tarea);

        Entrega entrega = entregaMapper.toEntity(dto);
        entrega.setTarea(tarea);
        entrega.setAlumno(alumno);
        entrega.setFechaEntrega(LocalDateTime.now());

        entrega.setCalificacion(null);
        entrega.setComentarioProfesor(null);

        return entregaMapper.toResponse(entregaRepository.save(entrega));
    }

    // --- MÉTODOS GET ---

    /**
     * Obtiene el listado global de todas las entregas del sistema.
     *
     * @return Lista de todas las entregas.
     * @throws BadRequestException si el usuario no es administrador.
     */
    @Transactional(readOnly = true)
    public List<EntregaResponseDTO> listarTodas() {
        if (!SecurityUtils.getUsuarioAutenticado().getRol().getNombre().equalsIgnoreCase("ADMIN")) {
            throw new BadRequestException("Acceso denegado: Solo el administrador puede ver el listado global.");
        }
        return entregaRepository.findAll().stream()
                .map(entregaMapper::toResponse)
                .collect(Collectors.toList());
    }

    /**
     * Recupera una entrega específica validando permisos de acceso.
     *
     * @param id Identificador de la entrega.
     * @return DTO de la entrega encontrada.
     */
    @Transactional(readOnly = true)
    public EntregaResponseDTO buscarPorId(Long id) {
        Entrega entrega = buscarEntregaInterna(id);
        entregaValidator.validarAccesoLectura(SecurityUtils.getUsuarioAutenticado(), entrega);
        return entregaMapper.toResponse(entrega);
    }

    /**
     * Lista las entregas asociadas a una tarea específica.
     *
     * @param idTarea Identificador de la tarea.
     * @return Lista de entregas de dicha tarea.
     */
    @Transactional(readOnly = true)
    public List<EntregaResponseDTO> listarPorTarea(Long idTarea) {
        Tarea tarea = buscarTareaInterna(idTarea);
        entregaValidator.validarPermisosGestion(SecurityUtils.getUsuarioAutenticado(), tarea);

        return entregaRepository.findByTareaId(idTarea).stream()
                .map(entregaMapper::toResponse)
                .collect(Collectors.toList());
    }

    /**
     * Recupera la entrega realizada por el usuario para una tarea concreta.
     * * @param idTarea ID de la tarea a consultar.
     * @return DTO con la entrega si existe, o null si el alumno aún no ha entregado
     *         nada.
     */
    @Transactional(readOnly = true)
    public EntregaResponseDTO obtenerEntregaUsuario(Long idTarea) {
        Usuario alumno = SecurityUtils.getUsuarioAutenticado();
        return entregaRepository.findByTareaIdAndAlumnoId(idTarea, alumno.getId())
                .map(entregaMapper::toResponse)
                .orElse(null);
    }

    /**
     * Obtiene el expediente de entregas de un alumno para todas las tareas de un
     * taller.
     * Se valida que el solicitante sea el administrador o el profesor titular del
     * taller.
     * * @param idAlumno ID del estudiante.
     * 
     * @param idTaller ID del taller.
     * @return Lista de DTOs con las entregas realizadas.
     */
    @Transactional(readOnly = true)
    public List<EntregaResponseDTO> listarPorAlumnoYTaller(Long idAlumno, Long idTaller) {
        Usuario solicitante = SecurityUtils.getUsuarioAutenticado();

        Tarea tareaEjemplo = tareaRepository.findAll().stream()
                .filter(t -> t.getTaller().getId().equals(idTaller))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException(
                        "No se pueden validar permisos: El taller no tiene tareas o no existe."));

        entregaValidator.validarPermisosGestion(solicitante, tareaEjemplo);

        return entregaRepository.findByAlumnoIdAndTarea_Taller_Id(idAlumno, idTaller).stream()
                .map(entregaMapper::toResponse)
                .collect(Collectors.toList());
    }

    // --- MÉTODOS PUT ---

    /**
     * Actualiza el texto de una entrega realizada por un alumno.
     *
     * @param id  Identificador de la entrega.
     * @param dto Datos actualizados.
     * @return DTO de la entrega modificada.
     */
    @Transactional
    public EntregaResponseDTO actualizar(Long id, EntregaRequestDTO dto) {
        Entrega entrega = buscarEntregaInterna(id);
        entregaValidator.validarEdicionEntrega(SecurityUtils.getUsuarioAutenticado(), entrega);

        entrega.setTextoEntrega(dto.getTextoEntrega());
        return entregaMapper.toResponse(entregaRepository.save(entrega));
    }

    /**
     * Asigna una calificación y un comentario a una entrega.
     *
     * @param id  Identificador de la entrega.
     * @param dto Datos de la calificación.
     * @return DTO de la entrega calificada.
     */
    @Transactional
    public EntregaResponseDTO calificar(Long id, EntregaRequestDTO dto) {
        Entrega entrega = buscarEntregaInterna(id);
        entregaValidator.validarPermisosGestion(SecurityUtils.getUsuarioAutenticado(), entrega.getTarea());

        entrega.setCalificacion(dto.getCalificacion());
        entrega.setComentarioProfesor(dto.getComentarioProfesor());

        return entregaMapper.toResponse(entregaRepository.save(entrega));
    }

    // --- MÉTODOS DELETE ---

    /**
     * Elimina una entrega del sistema.
     *
     * @param id Identificador de la entrega a borrar.
     */
    @Transactional
    public void eliminar(Long id) {
        Entrega entrega = buscarEntregaInterna(id);
        entregaValidator.validarPermisosGestion(SecurityUtils.getUsuarioAutenticado(), entrega.getTarea());

        entregaRepository.delete(entrega);
    }

    // --- MÉTODOS PRIVADOS ---

    /**
     * Realiza una búsqueda interna de una tarea por su identificador único.
     * 
     * @param id Identificador único de la tarea.
     * @return Entidad Tarea recuperada del repositorio.
     * @throws ResourceNotFoundException si la tarea no existe en la base de datos.
     */
    private Tarea buscarTareaInterna(Long id) {
        return tareaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Tarea no encontrada con ID: " + id));
    }

    /**
     * Realiza una búsqueda interna de una entrega por su identificador único.
     * 
     * @param id Identificador único de la entrega.
     * @return Entidad Entrega encontrada.
     * @throws ResourceNotFoundException si la entrega no existe.
     */
    private Entrega buscarEntregaInterna(Long id) {
        return entregaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Entrega no encontrada con ID: " + id));
    }
}