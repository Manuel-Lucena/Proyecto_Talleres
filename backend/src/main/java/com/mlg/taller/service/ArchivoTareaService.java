package com.mlg.taller.service;

import com.mlg.taller.model.dtos.ArchivoTareaRequestDTO;
import com.mlg.taller.model.dtos.ArchivoTareaResponseDTO;
import com.mlg.taller.model.entities.ArchivoTarea;
import com.mlg.taller.model.entities.Tarea;
import com.mlg.taller.model.mappers.ArchivoTareaMapper;
import com.mlg.taller.repositories.ArchivoTareaRepository;
import com.mlg.taller.repositories.TareaRepository;
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

    // 1. GET - Listar todos (para administración)
    @Transactional(readOnly = true)
    public List<ArchivoTareaResponseDTO> listarTodos() {
        return archivoTareaRepository.findAll().stream()
                .map(archivoTareaMapper::toResponse)
                .collect(Collectors.toList());
    }

    // 2. GET - Buscar por ID
    @Transactional(readOnly = true)
    public ArchivoTareaResponseDTO buscarPorId(Long id) {
        return archivoTareaRepository.findById(id)
                .map(archivoTareaMapper::toResponse)
                .orElseThrow(() -> new RuntimeException("Archivo no encontrado con ID: " + id));
    }

    // 3. GET - Listar por Tarea (Lo que ya teníamos)
    @Transactional(readOnly = true)
    public List<ArchivoTareaResponseDTO> listarPorTarea(Long idTarea) {
        return archivoTareaRepository.findByTareaId(idTarea).stream()
                .map(archivoTareaMapper::toResponse)
                .collect(Collectors.toList());
    }

    // 4. POST - Crear / Guardar
    @Transactional
    public ArchivoTareaResponseDTO guardar(ArchivoTareaRequestDTO dto) {
        Tarea tarea = tareaRepository.findById(dto.getIdTarea())
                .orElseThrow(() -> new RuntimeException("Tarea no encontrada"));

        ArchivoTarea archivo = archivoTareaMapper.toEntity(dto);
        archivo.setTarea(tarea);

        return archivoTareaMapper.toResponse(archivoTareaRepository.save(archivo));
    }

    // 5. PUT - Actualizar (Por si cambia el nombre o la ruta)
    @Transactional
    public ArchivoTareaResponseDTO actualizar(Long id, ArchivoTareaRequestDTO dto) {
        ArchivoTarea existente = archivoTareaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("No se puede actualizar: Archivo no encontrado"));
        
        existente.setNombre(dto.getNombre());
        existente.setRutaArchivo(dto.getRutaArchivo());
        
        // Si cambia de tarea, la buscamos
        if (!existente.getTarea().getId().equals(dto.getIdTarea())) {
            Tarea nuevaTarea = tareaRepository.findById(dto.getIdTarea())
                    .orElseThrow(() -> new RuntimeException("Nueva tarea no encontrada"));
            existente.setTarea(nuevaTarea);
        }

        return archivoTareaMapper.toResponse(archivoTareaRepository.save(existente));
    }

    // 6. DELETE - Eliminar
    @Transactional
    public void eliminar(Long id) {
        if (!archivoTareaRepository.existsById(id)) {
            throw new RuntimeException("No se puede eliminar: El archivo no existe");
        }
        archivoTareaRepository.deleteById(id);
    }
}