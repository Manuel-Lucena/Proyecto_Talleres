package com.mlg.taller.service;

import com.mlg.taller.exception.ResourceNotFoundException;
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
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Servicio para la gestión de archivos adjuntos a los materiales educativos.
 */
@Service
@RequiredArgsConstructor
public class ArchivoMaterialService {

    private final ArchivoMaterialRepository archivoMaterialRepository;
    private final MaterialRepository materialRepository;
    private final ArchivoMaterialMapper archivoMaterialMapper;
    private final FileUtil fileUtil;

    private static final String FOLDER = "materiales";

    // --- MÉTODOS POST ---

    /**
     * Guarda un archivo físico y registra su vinculación con un material educativo.
     * @param dto Datos del registro del archivo.
     * @param file Archivo físico recibido desde el cliente.
     * @return Archivo registrado y persistido.
     * @throws ResourceNotFoundException Si el material asociado no existe.
     */
    @Transactional
    public ArchivoMaterialResponseDTO guardar(ArchivoMaterialRequestDTO dto, MultipartFile file) {
        Material material = materialRepository.findById(dto.getIdMaterial())
                .orElseThrow(() -> new ResourceNotFoundException("No se puede guardar el archivo: Material no encontrado con ID: " + dto.getIdMaterial()));

        String nombreOriginal = file.getOriginalFilename();
        String extension = nombreOriginal != null && nombreOriginal.contains(".") 
                ? nombreOriginal.substring(nombreOriginal.lastIndexOf(".") + 1).toLowerCase() 
                : "";
        String nombreFisico = System.currentTimeMillis() + "_" + nombreOriginal;

        // Guardado físico protegido (false)
        fileUtil.guardar(file, FOLDER, nombreFisico, false);

        ArchivoMaterial archivo = archivoMaterialMapper.toEntity(dto);
        archivo.setMaterial(material);
        archivo.setNombre(nombreOriginal);
        archivo.setRutaArchivo(FOLDER + "/" + nombreFisico);
        archivo.setExtension(extension);

        return archivoMaterialMapper.toResponse(archivoMaterialRepository.save(archivo));
    }

    // --- MÉTODOS GET ---

    /**
     * Recupera un archivo específico mediante su identificador.
     * @param id ID del archivo a buscar.
     * @return Archivo encontrado.
     * @throws ResourceNotFoundException Si el archivo no existe.
     */
    @Transactional(readOnly = true)
    public ArchivoMaterialResponseDTO buscarPorId(Long id) {
        return archivoMaterialRepository.findById(id)
                .map(archivoMaterialMapper::toResponse)
                .orElseThrow(() -> new ResourceNotFoundException("Archivo no encontrado con ID: " + id));
    }

    /**
     * Lista todos los archivos vinculados a un material concreto.
     * @param idMaterial ID del material padre.
     * @return Lista de archivos asociados al material.
     */
    @Transactional(readOnly = true)
    public List<ArchivoMaterialResponseDTO> listarPorMaterial(Long idMaterial) {
        return archivoMaterialRepository.findByMaterialId(idMaterial).stream()
                .map(archivoMaterialMapper::toResponse)
                .collect(Collectors.toList());
    }

    // --- MÉTODOS PUT ---

    /**
     * Actualiza la información descriptiva o la vinculación de un archivo.
     * @param id ID del archivo a modificar.
     * @param dto Nuevos datos (nombre visual o ID de material).
     * @return Archivo actualizado.
     * @throws ResourceNotFoundException Si el archivo o el nuevo material no existen.
     */
    @Transactional
    public ArchivoMaterialResponseDTO actualizar(Long id, ArchivoMaterialRequestDTO dto) {
        ArchivoMaterial archivo = archivoMaterialRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("No se puede actualizar: Archivo no encontrado con ID: " + id));
        
        archivo.setNombre(dto.getNombre());
        
        if (!archivo.getMaterial().getId().equals(dto.getIdMaterial())) {
            Material nuevoMaterial = materialRepository.findById(dto.getIdMaterial())
                    .orElseThrow(() -> new ResourceNotFoundException("No se puede actualizar: Material no encontrado con ID: " + dto.getIdMaterial()));
            archivo.setMaterial(nuevoMaterial);
        }

        return archivoMaterialMapper.toResponse(archivoMaterialRepository.save(archivo));
    }

    // --- MÉTODOS DELETE ---

    /**
     * Elimina el registro del archivo y borra el contenido físico del servidor.
     * @param id ID del archivo a eliminar.
     * @throws ResourceNotFoundException Si el archivo no existe en la base de datos.
     */
    @Transactional
    public void eliminar(Long id) {
        ArchivoMaterial archivo = archivoMaterialRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("No se puede eliminar: Archivo no encontrado con ID: " + id));

        String[] partes = archivo.getRutaArchivo().split("/");
        if (partes.length == 2) {
            fileUtil.eliminar(partes[0], partes[1], false);
        }

        archivoMaterialRepository.delete(archivo);
    }
}