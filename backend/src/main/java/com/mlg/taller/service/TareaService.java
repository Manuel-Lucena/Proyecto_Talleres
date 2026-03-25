package com.mlg.taller.service;

import com.mlg.taller.model.dtos.TareaRequestDTO;
import com.mlg.taller.model.dtos.TareaResponseDTO;
import com.mlg.taller.model.entities.*;
import com.mlg.taller.model.enums.EstadoTarea;
import com.mlg.taller.model.mappers.TareaMapper;
import com.mlg.taller.repositories.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TareaService {

    private final TareaRepository tareaRepository;
    private final TallerRepository tallerRepository;
    private final TareaMapper tareaMapper;
    private final TareaAsignadaRepository tareaAsignadaRepository;
    private final UsuarioRepository usuarioRepository;
    private final InscripcionRepository inscripcionRepository;

    @Transactional(readOnly = true)
    public List<TareaResponseDTO> listarTodas() {
        return tareaRepository.findAll().stream()
                .map(tareaMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<TareaResponseDTO> listarPorTaller(Long idTaller) {
        return tareaRepository.findByTallerId(idTaller).stream()
                .map(tareaMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public TareaResponseDTO crear(TareaRequestDTO dto) {
        // 1. Validar que el taller existe
        Taller taller = tallerRepository.findById(dto.getIdTaller())
                .orElseThrow(() -> new RuntimeException("Taller no encontrado"));

        // 2. Mapear DTO a Entidad y configurar valores por defecto
        Tarea tarea = tareaMapper.toEntity(dto);
        tarea.setTaller(taller);
        tarea.setFechaPublicacion(LocalDateTime.now());
        tarea.setEstado(EstadoTarea.ABIERTA);

        // 3. Guardar la tarea (necesitamos el ID generado para las asignaciones)
        Tarea tareaGuardada = tareaRepository.save(tarea);

        // 4. Lógica de Asignación (Opción A)
        if (dto.getAlumnosIds() != null && !dto.getAlumnosIds().isEmpty()) {
            // ASIGNACIÓN SELECCIONADA: Solo a los alumnos indicados en el JSON
            for (Long alumnoId : dto.getAlumnosIds()) {
                asignarTareaAAlumno(tareaGuardada, alumnoId);
            }
        } else {
            // ASIGNACIÓN GLOBAL: A todos los alumnos con inscripción activa en este taller
            // El repo ya filtra por 'activa = true' gracias al @SQLRestriction de tu entidad
            List<Inscripcion> inscripcionesActivas = inscripcionRepository.findByTallerId(taller.getId());
            
            for (Inscripcion inscripcion : inscripcionesActivas) {
                asignarTareaAAlumno(tareaGuardada, inscripcion.getUsuario().getId());
            }
        }

        return tareaMapper.toResponse(tareaGuardada);
    }

    /**
     * Método privado auxiliar para crear el vínculo en la tabla intermedia
     */
    private void asignarTareaAAlumno(Tarea tarea, Long alumnoId) {
        Usuario alumno = usuarioRepository.findById(alumnoId)
                .orElseThrow(() -> new RuntimeException("Alumno no encontrado con ID: " + alumnoId));

        TareaAsignada asignacion = TareaAsignada.builder()
                .tarea(tarea)
                .alumno(alumno)
                .build();

        tareaAsignadaRepository.save(asignacion);
    }

    @Transactional
    public void eliminar(Long id) {
        if (!tareaRepository.existsById(id)) {
            throw new RuntimeException("La tarea no existe");
        }
        // Gracias al CascadeType.ALL en la entidad Tarea, 
        // al borrar la tarea se borran sus registros en 'tareas_asignadas'
        tareaRepository.deleteById(id);
    }
}