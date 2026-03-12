package com.mlg.taller.service;

import com.mlg.taller.model.dtos.ArchivoMaterialRequestDTO;
import com.mlg.taller.model.dtos.ArchivoMaterialResponseDTO;
import com.mlg.taller.model.entities.ArchivoMaterial;
import com.mlg.taller.model.entities.Material;
import com.mlg.taller.model.mappers.ArchivoMaterialMapper;
import com.mlg.taller.repositories.ArchivoMaterialRepository;
import com.mlg.taller.repositories.MaterialRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ArchivoMaterialService {

    private final ArchivoMaterialRepository archivoMaterialRepository;
    private final MaterialRepository materialRepository;
    private final ArchivoMaterialMapper archivoMaterialMapper;

    @Transactional
    public ArchivoMaterialResponseDTO guardar(ArchivoMaterialRequestDTO dto) {
        Material material = materialRepository.findById(dto.getIdMaterial())
                .orElseThrow(() -> new RuntimeException("Material no encontrado"));

        ArchivoMaterial archivo = archivoMaterialMapper.toEntity(dto);
        archivo.setMaterial(material);

        return archivoMaterialMapper.toResponse(archivoMaterialRepository.save(archivo));
    }

    @Transactional(readOnly = true)
    public List<ArchivoMaterialResponseDTO> listarPorMaterial(Long idMaterial) {
        return archivoMaterialRepository.findByMaterialId(idMaterial).stream()
                .map(archivoMaterialMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ArchivoMaterialResponseDTO buscarPorId(Long id) {
        return archivoMaterialRepository.findById(id)
                .map(archivoMaterialMapper::toResponse)
                .orElseThrow(() -> new RuntimeException("Archivo no encontrado"));
    }

    @Transactional
    public ArchivoMaterialResponseDTO actualizar(Long id, ArchivoMaterialRequestDTO dto) {
        ArchivoMaterial archivo = archivoMaterialRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Archivo no encontrado con ID: " + id));

        // Actualizamos los campos básicos
        archivo.setNombre(dto.getNombre());
        archivo.setRutaArchivo(dto.getRutaArchivo());

        // Si el archivo cambia de material padre, lo validamos
        if (!archivo.getMaterial().getId().equals(dto.getIdMaterial())) {
            Material nuevoMaterial = materialRepository.findById(dto.getIdMaterial())
                    .orElseThrow(() -> new RuntimeException("El nuevo material especificado no existe"));
            archivo.setMaterial(nuevoMaterial);
        }

        return archivoMaterialMapper.toResponse(archivoMaterialRepository.save(archivo));
    }

    @Transactional
    public void eliminar(Long id) {
        archivoMaterialRepository.deleteById(id);
    }
}