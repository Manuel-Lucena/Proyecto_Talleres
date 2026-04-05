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

    @Transactional(readOnly = true)
    public TareaResponseDTO obtenerPorId(Long id) {
        return tareaRepository.findById(id)
                .map(tareaMapper::toResponse)
                .orElseThrow(() -> new RuntimeException("Tarea no encontrada con ID: " + id));
    }

    @Transactional
    public TareaResponseDTO crear(TareaRequestDTO dto) {
        Taller taller = tallerRepository.findById(dto.getIdTaller())
                .orElseThrow(() -> new RuntimeException("Taller no encontrado"));

        Tarea tarea = tareaMapper.toEntity(dto);
        tarea.setTaller(taller);
        tarea.setFechaPublicacion(LocalDateTime.now());
        tarea.setEstado(EstadoTarea.ABIERTA);
        // El mapper ya debería encargarse, pero nos aseguramos:
        tarea.setExtensionesPermitidas(dto.getExtensionesPermitidas());

        Tarea tareaGuardada = tareaRepository.save(tarea);

        if (dto.getAlumnosIds() != null && !dto.getAlumnosIds().isEmpty()) {
            for (Long alumnoId : dto.getAlumnosIds()) {
                asignarTareaAAlumno(tareaGuardada, alumnoId);
            }
        } else {
            List<Inscripcion> inscripcionesActivas = inscripcionRepository.findByTallerId(taller.getId());
            for (Inscripcion inscripcion : inscripcionesActivas) {
                asignarTareaAAlumno(tareaGuardada, inscripcion.getUsuario().getId());
            }
        }

        return tareaMapper.toResponse(tareaGuardada);
    }

    @Transactional
    public TareaResponseDTO actualizar(Long id, TareaRequestDTO dto) {
        Tarea existente = tareaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Tarea no encontrada"));

        existente.setTitulo(dto.getTitulo());
        existente.setDescripcion(dto.getDescripcion());
        existente.setFechaEntrega(dto.getFechaEntrega());
        existente.setExtensionesPermitidas(dto.getExtensionesPermitidas());

        if (!existente.getTaller().getId().equals(dto.getIdTaller())) {
            Taller nuevoTaller = tallerRepository.findById(dto.getIdTaller())
                    .orElseThrow(() -> new RuntimeException("Taller no encontrado"));
            existente.setTaller(nuevoTaller);
        }

        return tareaMapper.toResponse(tareaRepository.save(existente));
    }

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
        tareaRepository.deleteById(id);
    }
}