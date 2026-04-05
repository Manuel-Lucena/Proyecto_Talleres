package com.mlg.taller.service;

import com.mlg.taller.model.dtos.ArchivoMaterialRequestDTO;
import com.mlg.taller.model.dtos.ArchivoMaterialResponseDTO;
import com.mlg.taller.model.entities.ArchivoMaterial;
import com.mlg.taller.model.entities.Material;
import com.mlg.taller.model.mappers.ArchivoMaterialMapper;
import com.mlg.taller.repositories.ArchivoMaterialRepository;
import com.mlg.taller.repositories.MaterialRepository;
import com.mlg.taller.util.FileUtil;

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
    private final FileUtil fileUtil;

    @Transactional
    public ArchivoMaterialResponseDTO guardar(ArchivoMaterialRequestDTO dto, org.springframework.web.multipart.MultipartFile file) {
        Material material = materialRepository.findById(dto.getIdMaterial())
                .orElseThrow(() -> new RuntimeException("Material no encontrado"));

        String nombreOriginal = file.getOriginalFilename();
        String extension = nombreOriginal.substring(nombreOriginal.lastIndexOf(".") + 1).toLowerCase();
        String nombreFisico = System.currentTimeMillis() + "_" + nombreOriginal;

        // Guardado físico protegido (false)
        fileUtil.guardar(file, "materiales", nombreFisico, false);

        ArchivoMaterial archivo = archivoMaterialMapper.toEntity(dto);
        archivo.setMaterial(material);
        archivo.setNombre(nombreOriginal);
        archivo.setRutaArchivo("materiales/" + nombreFisico);
        archivo.setExtension(extension);

        return archivoMaterialMapper.toResponse(archivoMaterialRepository.save(archivo));
    }

    /**
     * Este es el método que faltaba y causaba el error en el Controller
     */
    @Transactional
    public ArchivoMaterialResponseDTO actualizar(Long id, ArchivoMaterialRequestDTO dto) {
        ArchivoMaterial archivo = archivoMaterialRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Archivo no encontrado con ID: " + id));
        
        // Actualizamos el nombre visual (el que el usuario ve)
        archivo.setNombre(dto.getNombre());
        
        // Si el material padre cambió, lo actualizamos también
        if (!archivo.getMaterial().getId().equals(dto.getIdMaterial())) {
            Material nuevoMaterial = materialRepository.findById(dto.getIdMaterial())
                    .orElseThrow(() -> new RuntimeException("Material no encontrado"));
            archivo.setMaterial(nuevoMaterial);
        }

        return archivoMaterialMapper.toResponse(archivoMaterialRepository.save(archivo));
    }

    @Transactional
    public void eliminar(Long id) {
        ArchivoMaterial archivo = archivoMaterialRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Archivo no encontrado"));

        String[] partes = archivo.getRutaArchivo().split("/");
        if (partes.length == 2) {
            fileUtil.eliminar(partes[0], partes[1], false);
        }

        archivoMaterialRepository.delete(archivo);
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
}