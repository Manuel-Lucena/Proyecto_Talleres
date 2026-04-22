package com.mlg.taller.service;

import com.mlg.taller.exception.BadRequestException;
import com.mlg.taller.exception.ResourceNotFoundException;
import com.mlg.taller.model.dtos.TareaAsignadaResponseDTO;
import com.mlg.taller.model.entities.Tarea;
import com.mlg.taller.model.entities.TareaAsignada;
import com.mlg.taller.model.entities.Usuario;
import com.mlg.taller.model.mappers.TareaAsignadaMapper;
import com.mlg.taller.repositories.InscripcionRepository;
import com.mlg.taller.repositories.TareaAsignadaRepository;
import com.mlg.taller.repositories.TareaRepository;
import com.mlg.taller.repositories.UsuarioRepository;
import com.mlg.taller.util.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Servicio para la gestión de asignaciones individuales de alumnos a tareas.
 * * Implementa un blindaje de seguridad para que solo el profesor titular del taller
 * o el administrador puedan gestionar quién ve cada actividad.
 */
@Service
@RequiredArgsConstructor
public class TareaAsignadaService {

    private final TareaAsignadaRepository tareaAsignadaRepository;
    private final TareaRepository tareaRepository;
    private final UsuarioRepository usuarioRepository;
    private final InscripcionRepository inscripcionRepository;
    private final TareaAsignadaMapper tareaAsignadaMapper;

    // --- MÉTODOS GET ---

    /**
     * Recupera la lista de alumnos asignados a una tarea.
     * Solo accesible si el solicitante es el profesor del taller o administrador.
     * * @param idTarea Identificador único de la tarea.
     * @return Lista de alumnos asignados.
     * @throws ResourceNotFoundException Si la tarea no existe.
     * @throws BadRequestException Si el usuario no tiene permisos de acceso.
     */
    @Transactional(readOnly = true)
    public List<TareaAsignadaResponseDTO> listarPorTarea(Long idTarea) {
        Tarea tarea = tareaRepository.findById(idTarea)
                .orElseThrow(() -> new ResourceNotFoundException("Tarea no encontrada con ID: " + idTarea));

        validarAccesoProfesor(tarea);

        return tareaAsignadaRepository.findByTareaId(idTarea).stream()
                .map(tareaAsignadaMapper::toResponse)
                .collect(Collectors.toList());
    }

    // --- MÉTODOS POST / PUT ---

    /**
     * Sincroniza la visibilidad selectiva de una tarea.
     * Borra las asignaciones previas y crea las nuevas verificando que los alumnos 
     * estén inscritos en el taller.
     * * @param idTarea ID de la tarea a gestionar.
     * @param alumnoIds Lista de IDs de alumnos con acceso.
     * @throws ResourceNotFoundException Si la tarea o algún alumno no existe.
     * @throws BadRequestException Si el profesor no es el titular o el alumno no está inscrito.
     */
    @Transactional
    public void actualizarAsignaciones(Long idTarea, List<Long> alumnoIds) {
        Tarea tarea = tareaRepository.findById(idTarea)
                .orElseThrow(() -> new ResourceNotFoundException("No se pudo actualizar: Tarea no encontrada con ID: " + idTarea));

        validarAccesoProfesor(tarea);
         
        tareaAsignadaRepository.deleteByTareaId(idTarea);

        if (alumnoIds == null || alumnoIds.isEmpty()) {
            return;
        }

        List<TareaAsignada> nuevasAsignaciones = alumnoIds.stream().map(alumnoId -> {
            Usuario alumno = usuarioRepository.findById(alumnoId)
                    .orElseThrow(() -> new ResourceNotFoundException("Alumno no encontrado con ID: " + alumnoId));

          
            boolean estaInscrito = inscripcionRepository.existsByUsuarioIdAndTallerIdAndActivaTrue(
                    alumnoId, tarea.getTaller().getId());
            
            if (!estaInscrito) {
                throw new BadRequestException("El alumno con ID " + alumnoId + " no está inscrito en este taller.");
            }

            return TareaAsignada.builder()
                    .tarea(tarea)
                    .alumno(alumno)
                    .build();
        }).collect(Collectors.toList());

        tareaAsignadaRepository.saveAll(nuevasAsignaciones);
    }

    // --- MÉTODOS DELETE ---

    /**
     * Revoca el acceso de todos los alumnos a una tarea específica.
     * * @param idTarea Identificador de la tarea.
     * @throws ResourceNotFoundException Si la tarea no existe.
     * @throws BadRequestException Si el usuario no tiene permisos.
     */
    @Transactional
    public void eliminarAsignacionesDeTarea(Long idTarea) {
        Tarea tarea = tareaRepository.findById(idTarea)
                .orElseThrow(() -> new ResourceNotFoundException("Tarea no encontrada"));
        
        validarAccesoProfesor(tarea);
        
        tareaAsignadaRepository.deleteByTareaId(idTarea);
    }

    // --- MÉTODOS PRIVADOS DE APOYO ---

    /**
     * Verifica si el usuario actual tiene autoridad sobre la tarea (Admin o Profesor titular).
     */
    private void validarAccesoProfesor(Tarea tarea) {
        Usuario solicitante = SecurityUtils.getUsuarioAutenticado();
        boolean esAdmin = solicitante.getRol().getNombre().equalsIgnoreCase("ADMIN");
        boolean esSuProfesor = tarea.getTaller().getProfesor() != null && 
                               tarea.getTaller().getProfesor().getId().equals(solicitante.getId());

        if (!esAdmin && !esSuProfesor) {
            throw new BadRequestException("Acceso denegado: No eres el profesor titular de este taller.");
        }
    }
}