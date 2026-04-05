package com.mlg.taller.service;

import com.mlg.taller.model.dtos.ArchivoTareaRequestDTO;
import com.mlg.taller.model.dtos.ArchivoTareaResponseDTO;
import com.mlg.taller.model.entities.ArchivoTarea;
import com.mlg.taller.model.entities.Tarea;
import com.mlg.taller.model.mappers.ArchivoTareaMapper;
import com.mlg.taller.repositories.ArchivoTareaRepository;
import com.mlg.taller.repositories.TareaRepository;
import com.mlg.taller.util.FileUtil;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ArchivoTareaService {

    private final ArchivoTareaRepository archivoTareaRepository;
    private final TareaRepository tareaRepository;
    private final ArchivoTareaMapper archivoTareaMapper;
    private final FileUtil fileUtil;

    @Transactional(readOnly = true)
    public List<ArchivoTareaResponseDTO> listarTodos() {
        return archivoTareaRepository.findAll().stream()
                .map(archivoTareaMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public ArchivoTareaResponseDTO guardar(ArchivoTareaRequestDTO dto,
            org.springframework.web.multipart.MultipartFile file) {
        Tarea tarea = tareaRepository.findById(dto.getIdTarea())
                .orElseThrow(() -> new RuntimeException("Tarea no encontrada"));

        String nombreOriginal = file.getOriginalFilename();
        String extension = nombreOriginal.substring(nombreOriginal.lastIndexOf(".") + 1).toLowerCase();
        String nombreFisico = System.currentTimeMillis() + "_" + nombreOriginal;

        fileUtil.guardar(file, "tareas", nombreFisico, false);

        ArchivoTarea archivo = archivoTareaMapper.toEntity(dto);
        archivo.setTarea(tarea);
        archivo.setNombre(nombreOriginal);
        archivo.setRutaArchivo("tareas/" + nombreFisico);
        archivo.setExtension(extension);

        return archivoTareaMapper.toResponse(archivoTareaRepository.save(archivo));
    }

    @Transactional
    public ArchivoTareaResponseDTO actualizar(Long id, ArchivoTareaRequestDTO dto) {
        ArchivoTarea existente = archivoTareaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Archivo no encontrado con ID: " + id));

        existente.setNombre(dto.getNombre());
        
        if (!existente.getTarea().getId().equals(dto.getIdTarea())) {
            Tarea nuevaTarea = tareaRepository.findById(dto.getIdTarea())
                    .orElseThrow(() -> new RuntimeException("Tarea no encontrada"));
            existente.setTarea(nuevaTarea);
        }

        return archivoTareaMapper.toResponse(archivoTareaRepository.save(existente));
    }

    @Transactional
    public void eliminar(Long id) {
        ArchivoTarea archivo = archivoTareaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Archivo no encontrado"));

        String[] partes = archivo.getRutaArchivo().split("/");
        if (partes.length == 2) {
            fileUtil.eliminar(partes[0], partes[1], false);
        }

        archivoTareaRepository.delete(archivo);
    }

    @Transactional(readOnly = true)
    public List<ArchivoTareaResponseDTO> listarPorTarea(Long idTarea) {
        return archivoTareaRepository.findByTareaId(idTarea).stream()
                .map(archivoTareaMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ArchivoTareaResponseDTO buscarPorId(Long id) {
        return archivoTareaRepository.findById(id)
                .map(archivoTareaMapper::toResponse)
                .orElseThrow(() -> new RuntimeException("Archivo no encontrado"));
    }
}