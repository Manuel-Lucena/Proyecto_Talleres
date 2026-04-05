package com.mlg.taller.service;

import com.mlg.taller.model.dtos.EntregaRequestDTO;
import com.mlg.taller.model.dtos.EntregaResponseDTO;
import com.mlg.taller.model.entities.Entrega;
import com.mlg.taller.model.entities.Tarea;
import com.mlg.taller.model.entities.Usuario;
import com.mlg.taller.model.mappers.EntregaMapper;
import com.mlg.taller.repositories.EntregaRepository;
import com.mlg.taller.repositories.TareaRepository;
import com.mlg.taller.repositories.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class EntregaService {

    private final EntregaRepository entregaRepository;
    private final TareaRepository tareaRepository;
    private final UsuarioRepository usuarioRepository;
    private final EntregaMapper entregaMapper;

    @Transactional(readOnly = true)
    public List<EntregaResponseDTO> listarTodas() {
        return entregaRepository.findAll().stream()
                .map(entregaMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public EntregaResponseDTO buscarPorId(Long id) {
        return entregaRepository.findById(id)
                .map(entregaMapper::toResponse)
                .orElseThrow(() -> new RuntimeException("Entrega no encontrada"));
    }

    @Transactional
    public EntregaResponseDTO actualizar(Long id, EntregaRequestDTO dto) {
        Entrega entrega = entregaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Entrega no encontrada"));

        // Solo actualizamos el texto de la entrega
        entrega.setTextoEntrega(dto.getTextoEntrega());
        // Opcional: actualizar la fecha a la fecha de modificación
        // entrega.setFechaEntrega(LocalDateTime.now());

        return entregaMapper.toResponse(entregaRepository.save(entrega));
    }

    @Transactional
    public EntregaResponseDTO enviar(EntregaRequestDTO dto) {
        // Verificar si ya existe una entrega del alumno para esta tarea
        entregaRepository.findByTareaIdAndAlumnoId(dto.getIdTarea(), dto.getIdUsuario())
                .ifPresent(e -> {
                    throw new RuntimeException("Ya has realizado una entrega para esta tarea");
                });

        Tarea tarea = tareaRepository.findById(dto.getIdTarea())
                .orElseThrow(() -> new RuntimeException("Tarea no encontrada"));
        Usuario alumno = usuarioRepository.findById(dto.getIdUsuario())
                .orElseThrow(() -> new RuntimeException("Alumno no encontrado"));

        Entrega entrega = entregaMapper.toEntity(dto);
        entrega.setTarea(tarea);
        entrega.setAlumno(alumno);
        entrega.setFechaEntrega(LocalDateTime.now());

        return entregaMapper.toResponse(entregaRepository.save(entrega));
    }

    @Transactional
    public EntregaResponseDTO calificar(Long id, EntregaRequestDTO dto) {
        Entrega entrega = entregaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Entrega no encontrada"));

        entrega.setCalificacion(dto.getCalificacion());
        entrega.setComentarioProfesor(dto.getComentarioProfesor());

        return entregaMapper.toResponse(entregaRepository.save(entrega));
    }

    @Transactional
    public void eliminar(Long id) {
        if (!entregaRepository.existsById(id)) {
            throw new RuntimeException("La entrega no existe");
        }
        entregaRepository.deleteById(id);
    }

    @Transactional(readOnly = true)
    public List<EntregaResponseDTO> listarPorTarea(Long idTarea) {
        return entregaRepository.findByTareaId(idTarea).stream()
                .map(entregaMapper::toResponse)
                .collect(Collectors.toList());
    }
}