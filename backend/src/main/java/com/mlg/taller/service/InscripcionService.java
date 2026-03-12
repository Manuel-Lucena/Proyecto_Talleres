package com.mlg.taller.service;

import com.mlg.taller.model.dtos.InscripcionRequestDTO;
import com.mlg.taller.model.dtos.InscripcionResponseDTO;
import com.mlg.taller.model.entities.Inscripcion;
import com.mlg.taller.model.entities.Taller;
import com.mlg.taller.model.entities.Usuario;
import com.mlg.taller.model.mappers.InscripcionMapper;
import com.mlg.taller.repositories.InscripcionRepository;
import com.mlg.taller.repositories.TallerRepository;
import com.mlg.taller.repositories.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class InscripcionService {

    private final InscripcionRepository inscripcionRepository;
    private final TallerRepository tallerRepository;
    private final UsuarioRepository usuarioRepository;
    private final InscripcionMapper inscripcionMapper;

    // 1. GET (Leer todos o uno)
    @Transactional(readOnly = true)
    public List<InscripcionResponseDTO> listarTodas() {
        return inscripcionRepository.findAll().stream()
                .map(inscripcionMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public InscripcionResponseDTO buscarPorId(Long id) {
        return inscripcionRepository.findById(id)
                .map(inscripcionMapper::toResponse)
                .orElseThrow(() -> new RuntimeException("Inscripción no encontrada"));
    }

    @Transactional(readOnly = true)
    public List<InscripcionResponseDTO> listarPorUsuario(Long idUsuario) {
        // Buscamos en el repo y mapeamos a DTO
        return inscripcionRepository.findByUsuarioId(idUsuario).stream()
                .map(inscripcionMapper::toResponse)
                .collect(Collectors.toList());
    }

    // 2. POST (Crear)
    @Transactional
    public InscripcionResponseDTO inscribir(InscripcionRequestDTO dto) {
        // ... (Aquí va la lógica de validar duplicados y plazas que ya tenemos)
        Usuario usuario = usuarioRepository.findById(dto.getIdUsuario()).get();
        Taller taller = tallerRepository.findById(dto.getIdTaller()).get();

        Inscripcion inscripcion = inscripcionMapper.toEntity(dto, usuario, taller);
        return inscripcionMapper.toResponse(inscripcionRepository.save(inscripcion));
    }

    // 3. PUT (Actualizar)
    @Transactional
    public InscripcionResponseDTO actualizar(Long id, InscripcionRequestDTO dto) {
        Inscripcion existente = inscripcionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("No existe la inscripción para actualizar"));

        // Por si quieres cambiar el monto o el order_id
        existente.setMontoPagado(dto.getMontoPagado());
        existente.setOrderId(dto.getOrderId());

        return inscripcionMapper.toResponse(inscripcionRepository.save(existente));
    }

    // 4. DELETE (Eliminar - Borrado lógico)
    @Transactional
    public void eliminar(Long id) {
        if (!inscripcionRepository.existsById(id)) {
            throw new RuntimeException("ID no encontrado");
        }
        inscripcionRepository.deleteById(id);
    }
}