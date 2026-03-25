package com.mlg.taller.service;

import com.mlg.taller.model.dtos.MaterialRequestDTO;
import com.mlg.taller.model.dtos.MaterialResponseDTO;
import com.mlg.taller.model.entities.Material;
import com.mlg.taller.model.entities.Taller;
import com.mlg.taller.model.mappers.MaterialMapper;
import com.mlg.taller.repositories.MaterialRepository;
import com.mlg.taller.repositories.TallerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MaterialService {

    private final MaterialRepository materialRepository;
    private final TallerRepository tallerRepository;
    private final MaterialMapper materialMapper;

    // 1. CREATE
    @Transactional
    public MaterialResponseDTO crear(MaterialRequestDTO dto) {
        Taller taller = tallerRepository.findById(dto.getIdTaller())
                .orElseThrow(() -> new RuntimeException("Taller no encontrado"));

        Material material = materialMapper.toEntity(dto);
        material.setTaller(taller);
        material.setFechaSubida(LocalDateTime.now());

        return materialMapper.toResponse(materialRepository.save(material));
    }

    // 2. READ (Todos)
    @Transactional(readOnly = true)
    public List<MaterialResponseDTO> listarTodos() {
        return materialRepository.findAll().stream()
                .map(materialMapper::toResponse)
                .collect(Collectors.toList());
    }

    // 3. READ (Por ID)
    @Transactional(readOnly = true)
    public MaterialResponseDTO buscarPorId(Long id) {
        return materialRepository.findById(id)
                .map(materialMapper::toResponse)
                .orElseThrow(() -> new RuntimeException("Material no encontrado con ID: " + id));
    }

    // 4. READ (Específico por Taller)
    @Transactional(readOnly = true)
    public List<MaterialResponseDTO> listarPorTaller(Long idTaller) {
        return materialRepository.findByTallerId(idTaller).stream()
                .map(materialMapper::toResponse)
                .collect(Collectors.toList());
    }

    // 5. UPDATE
    @Transactional
    public MaterialResponseDTO actualizar(Long id, MaterialRequestDTO dto) {
        Material existente = materialRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("No se puede actualizar: Material no encontrado"));
        
        existente.setTitulo(dto.getTitulo());
        existente.setContenido(dto.getContenido());
        
        // Si cambia el taller, lo validamos
        if (!existente.getTaller().getId().equals(dto.getIdTaller())) {
            Taller nuevoTaller = tallerRepository.findById(dto.getIdTaller())
                    .orElseThrow(() -> new RuntimeException("Nuevo taller no encontrado"));
            existente.setTaller(nuevoTaller);
        }

        return materialMapper.toResponse(materialRepository.save(existente));
    }

    // 6. DELETE
    @Transactional
    public void eliminar(Long id) {
        if (!materialRepository.existsById(id)) {
            throw new RuntimeException("No existe el material con ID: " + id);
        }
        materialRepository.deleteById(id);
    }
}