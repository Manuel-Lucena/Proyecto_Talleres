package com.mlg.taller.service;

import com.mlg.taller.exception.ResourceNotFoundException;
import com.mlg.taller.model.dtos.TareaAsignadaResponseDTO;
import com.mlg.taller.model.entities.Tarea;
import com.mlg.taller.model.entities.TareaAsignada;
import com.mlg.taller.model.entities.Usuario;
import com.mlg.taller.model.mappers.TareaAsignadaMapper;
import com.mlg.taller.repositories.TareaAsignadaRepository;
import com.mlg.taller.repositories.TareaRepository;
import com.mlg.taller.repositories.UsuarioRepository;
import com.mlg.taller.service.validators.TareaAsignadaValidator;
import com.mlg.taller.util.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Servicio para la gestión de asignaciones individuales de alumnos a tareas.
 * Implementa un blindaje de seguridad para que solo el profesor titular del
 * taller
 * o el administrador puedan gestionar quién tiene acceso a cada actividad.
 */
@Service
@RequiredArgsConstructor
public class TareaAsignadaService {

    private final TareaAsignadaRepository tareaAsignadaRepository;
    private final TareaRepository tareaRepository;
    private final UsuarioRepository usuarioRepository;
    private final TareaAsignadaValidator tareaAsignadaValidator;
    private final TareaAsignadaMapper tareaAsignadaMapper;

    // --- MÉTODOS GET ---

    /**
     * Recupera la lista de alumnos asignados a una tarea.
     * Solo accesible si el solicitante es el profesor del taller o administrador.
     *
     * @param idTarea Identificador único de la tarea.
     * @return Lista de alumnos asignados mapeada a DTO.
     */
    @Transactional(readOnly = true)
    public List<TareaAsignadaResponseDTO> listarPorTarea(Long idTarea) {
        Tarea tarea = buscarTareaInterna(idTarea);
        tareaAsignadaValidator.validarAccesoProfesor(SecurityUtils.getUsuarioAutenticado(), tarea);

        return tareaAsignadaRepository.findByTareaId(idTarea).stream()
                .map(tareaAsignadaMapper::toResponse)
                .collect(Collectors.toList());
    }

    /**
     * Obtiene todas las asignaciones de tareas desde la perspectiva de un alumno.
     * * @param idAlumno Identificador del alumno a consultar.
     * 
     * @return Lista de DTOs con la información de las tareas vinculadas.
     */
    @Transactional(readOnly = true)
    public List<TareaAsignadaResponseDTO> listarPorAlumno(Long idAlumno) {
        return tareaAsignadaRepository.findByAlumnoId(idAlumno).stream()
                .map(tareaAsignadaMapper::toResponse)
                .collect(Collectors.toList());
    }

    // --- MÉTODOS POST / PUT ---

    /**
     * Sincroniza la visibilidad selectiva de una tarea de forma atómica.
     * Borra las asignaciones previas y crea las nuevas verificando la inscripción
     * de los alumnos.
     *
     * @param idTarea   ID de la tarea a gestionar.
     * @param alumnoIds Lista de IDs de alumnos que recibirán acceso.
     */
    @Transactional
    public void actualizarAsignaciones(Long idTarea, List<Long> alumnoIds) {
        Tarea tarea = buscarTareaInterna(idTarea);
        tareaAsignadaValidator.validarAccesoProfesor(SecurityUtils.getUsuarioAutenticado(), tarea);

        tareaAsignadaRepository.deleteByTareaId(idTarea);

        if (alumnoIds == null || alumnoIds.isEmpty()) {
            return;
        }

        List<TareaAsignada> nuevasAsignaciones = alumnoIds.stream().map(alumnoId -> {
            Usuario alumno = usuarioRepository.findById(alumnoId)
                    .orElseThrow(() -> new ResourceNotFoundException("Alumno no encontrado con ID: " + alumnoId));

            tareaAsignadaValidator.validarAlumnoInscrito(alumnoId, tarea.getTaller().getId());

            return TareaAsignada.builder()
                    .tarea(tarea)
                    .alumno(alumno)
                    .build();
        }).collect(Collectors.toList());

        tareaAsignadaRepository.saveAll(nuevasAsignaciones);
    }

    // --- MÉTODOS DELETE ---

    /**
     * Revoca el acceso de todos los alumnos a una tarea específica de forma masiva.
     *
     * @param idTarea Identificador de la tarea.
     */
    @Transactional
    public void eliminarAsignacionesDeTarea(Long idTarea) {
        Tarea tarea = buscarTareaInterna(idTarea);
        tareaAsignadaValidator.validarAccesoProfesor(SecurityUtils.getUsuarioAutenticado(), tarea);

        tareaAsignadaRepository.deleteByTareaId(idTarea);
    }

    // --- MÉTODOS PRIVADOS DE APOYO ---

    /**
     * Busca una tarea en el repositorio a partir de su identificador único.
     * 
     * @param idTarea Identificador único de la tarea a localizar.
     * @return Entidad Tarea recuperada de la base de datos.
     * @throws ResourceNotFoundException si no se encuentra ninguna tarea con el ID
     *                                   proporcionado.
     */
    private Tarea buscarTareaInterna(Long idTarea) {
        return tareaRepository.findById(idTarea)
                .orElseThrow(() -> new ResourceNotFoundException("Tarea no encontrada con ID: " + idTarea));
    }
}