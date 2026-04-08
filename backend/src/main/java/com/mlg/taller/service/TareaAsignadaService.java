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
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Servicio para la gestión de asignaciones individuales de alumnos a tareas.
 * * Esta clase centraliza la lógica que permite al profesor segmentar la
 * visibilidad
 * de las actividades, permitiendo que una tarea sea visible solo para alumnos
 * específicos (ej. refuerzo o niveles avanzados) en lugar de para todo el
 * taller.
 */
@Service
@RequiredArgsConstructor
public class TareaAsignadaService {

    private final TareaAsignadaRepository tareaAsignadaRepository;
    private final TareaRepository tareaRepository;
    private final UsuarioRepository usuarioRepository;
    private final TareaAsignadaMapper tareaAsignadaMapper;

    // --- MÉTODOS GET ---

    /**
     * Recupera la lista de alumnos que tienen asignada una tarea específica.
     * * @param idTarea Identificador único de la tarea a consultar.
     * 
     * @return Lista de DTOs con la información de los alumnos asignados.
     */
    @Transactional(readOnly = true)
    public List<TareaAsignadaResponseDTO> listarPorTarea(Long idTarea) {
        return tareaAsignadaRepository.findByTareaId(idTarea).stream()
                .map(tareaAsignadaMapper::toResponse)
                .collect(Collectors.toList());
    }

    // --- MÉTODOS POST / PUT ---

    /**
     * Sincroniza la lista de alumnos asignados a una tarea.
     * * Implementa una lógica de reemplazo total: elimina todas las asignaciones
     * previas de la tarea y genera nuevas entradas basadas en la selección
     * actual del profesor.
     * * @param idTarea Identificador de la tarea cuyas asignaciones se van a
     * actualizar.
     * 
     * @param alumnoIds Lista de identificadores de los alumnos seleccionados.
     * @throws ResourceNotFoundException Si la tarea o alguno de los alumnos no
     *                                   existen.
     */
    @Transactional
    public void actualizarAsignaciones(Long idTarea, List<Long> alumnoIds) {
        Tarea tarea = tareaRepository.findById(idTarea)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "No se pueden actualizar las asignaciones: Tarea no encontrada con ID: " + idTarea));

        tareaAsignadaRepository.deleteByTareaId(idTarea);

        if (alumnoIds == null || alumnoIds.isEmpty()) {
            return;
        }

        List<TareaAsignada> nuevasAsignaciones = alumnoIds.stream().map(alumnoId -> {
            Usuario alumno = usuarioRepository.findById(alumnoId)
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "Error en el proceso de asignación: Alumno no encontrado con ID: " + alumnoId));

            return TareaAsignada.builder()
                    .tarea(tarea)
                    .alumno(alumno)
                    .build();
        }).collect(Collectors.toList());

        tareaAsignadaRepository.saveAll(nuevasAsignaciones);
    }

    // --- MÉTODOS DELETE ---

    /**
     * Elimina de forma permanente todas las asignaciones vinculadas a una tarea.
     * * Se utiliza principalmente como paso previo a la eliminación de una tarea
     * del sistema.
     * * @param idTarea Identificador de la tarea de la cual se borrarán los
     * registros.
     */
    @Transactional
    public void eliminarAsignacionesDeTarea(Long idTarea) {
        tareaAsignadaRepository.deleteByTareaId(idTarea);
    }
}