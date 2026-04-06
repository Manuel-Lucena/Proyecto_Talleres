package com.mlg.taller.service;

import com.mlg.taller.exception.ResourceNotFoundException;
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
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Servicio para la gestión de archivos adjuntos a las tareas.
 */
@Service
@RequiredArgsConstructor
public class ArchivoTareaService {

    private final ArchivoTareaRepository archivoTareaRepository;
    private final TareaRepository tareaRepository;
    private final ArchivoTareaMapper archivoTareaMapper;
    private final FileUtil fileUtil;

    private static final String FOLDER = "tareas";

    // --- MÉTODOS POST ---

    /**
     * Guarda un archivo físicamente y registra su información vinculada a una tarea.
     * @param dto Datos del archivo a registrar.
     * @param file Archivo físico recibido.
     * @return ArchivoTarea persistido.
     * @throws ResourceNotFoundException Si la tarea asociada no existe.
     */
    @Transactional
    public ArchivoTareaResponseDTO guardar(ArchivoTareaRequestDTO dto, MultipartFile file) {
        Tarea tarea = tareaRepository.findById(dto.getIdTarea())
                .orElseThrow(() -> new ResourceNotFoundException("No se puede guardar el archivo: Tarea no encontrada con ID: " + dto.getIdTarea()));

        String nombreOriginal = file.getOriginalFilename();
        String extension = nombreOriginal.substring(nombreOriginal.lastIndexOf(".") + 1).toLowerCase();
        String nombreFisico = System.currentTimeMillis() + "_" + nombreOriginal;

        // Se guarda como recurso no público (false)
        fileUtil.guardar(file, FOLDER, nombreFisico, false);

        ArchivoTarea archivo = archivoTareaMapper.toEntity(dto);
        archivo.setTarea(tarea);
        archivo.setNombre(nombreOriginal);
        archivo.setRutaArchivo(FOLDER + "/" + nombreFisico);
        archivo.setExtension(extension);

        return archivoTareaMapper.toResponse(archivoTareaRepository.save(archivo));
    }

    // --- MÉTODOS GET ---

    /**
     * Obtiene el listado completo de archivos de tareas del sistema.
     * @return Lista de archivos registrados.
     */
    @Transactional(readOnly = true)
    public List<ArchivoTareaResponseDTO> listarTodos() {
        return archivoTareaRepository.findAll().stream()
                .map(archivoTareaMapper::toResponse)
                .collect(Collectors.toList());
    }

    /**
     * Busca un archivo específico por su identificador único.
     * @param id ID del archivo.
     * @return Archivo encontrado.
     * @throws ResourceNotFoundException Si el archivo no existe.
     */
    @Transactional(readOnly = true)
    public ArchivoTareaResponseDTO buscarPorId(Long id) {
        return archivoTareaRepository.findById(id)
                .map(archivoTareaMapper::toResponse)
                .orElseThrow(() -> new ResourceNotFoundException("Archivo no encontrado con ID: " + id));
    }

    /**
     * Lista todos los archivos adjuntos a una tarea específica.
     * @param idTarea ID de la tarea.
     * @return Lista de archivos de la tarea.
     */
    @Transactional(readOnly = true)
    public List<ArchivoTareaResponseDTO> listarPorTarea(Long idTarea) {
        return archivoTareaRepository.findByTareaId(idTarea).stream()
                .map(archivoTareaMapper::toResponse)
                .collect(Collectors.toList());
    }

    // --- MÉTODOS PUT ---

    /**
     * Actualiza los metadatos de un archivo existente.
     * @param id ID del archivo a modificar.
     * @param dto Nuevos datos (nombre o tarea vinculada).
     * @return Archivo actualizado.
     * @throws ResourceNotFoundException Si el archivo o la nueva tarea no existen.
     */
    @Transactional
    public ArchivoTareaResponseDTO actualizar(Long id, ArchivoTareaRequestDTO dto) {
        ArchivoTarea existente = archivoTareaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("No se puede actualizar: Archivo no encontrado con ID: " + id));

        existente.setNombre(dto.getNombre());
        
        if (!existente.getTarea().getId().equals(dto.getIdTarea())) {
            Tarea nuevaTarea = tareaRepository.findById(dto.getIdTarea())
                    .orElseThrow(() -> new ResourceNotFoundException("No se puede actualizar: Tarea no encontrada con ID: " + dto.getIdTarea()));
            existente.setTarea(nuevaTarea);
        }

        return archivoTareaMapper.toResponse(archivoTareaRepository.save(existente));
    }

    // --- MÉTODOS DELETE ---

    /**
     * Elimina el registro del archivo y su contenido físico en el servidor.
     * @param id ID del archivo a borrar.
     * @throws ResourceNotFoundException Si el archivo no existe.
     */
    @Transactional
    public void eliminar(Long id) {
        ArchivoTarea archivo = archivoTareaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("No se puede eliminar: Archivo no encontrado con ID: " + id));

        String[] partes = archivo.getRutaArchivo().split("/");
        if (partes.length == 2) {
            // Se elimina indicando que no es recurso público (false)
            fileUtil.eliminar(partes[0], partes[1], false);
        }

        archivoTareaRepository.delete(archivo);
    }
}