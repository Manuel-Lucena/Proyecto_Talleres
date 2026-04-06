package com.mlg.taller.service;

import com.mlg.taller.exception.ResourceNotFoundException;
import com.mlg.taller.model.dtos.ArchivoEntregaRequestDTO;
import com.mlg.taller.model.dtos.ArchivoEntregaResponseDTO;
import com.mlg.taller.model.entities.ArchivoEntrega;
import com.mlg.taller.model.entities.Entrega;
import com.mlg.taller.model.mappers.ArchivoEntregaMapper;
import com.mlg.taller.repositories.ArchivoEntregaRepository;
import com.mlg.taller.repositories.EntregaRepository;
import com.mlg.taller.util.FileUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Servicio para la gestión de archivos físicos entregados por los alumnos.
 */
@Service
@RequiredArgsConstructor
public class ArchivoEntregaService {

    private final ArchivoEntregaRepository archivoEntregaRepository;
    private final EntregaRepository entregaRepository;
    private final ArchivoEntregaMapper archivoEntregaMapper;
    private final FileUtil fileUtil;

    private static final String FOLDER = "entregas";

    // --- MÉTODOS POST ---

    /**
     * Guarda un archivo de entrega, validando que su extensión esté permitida por la tarea.
     * @param dto Datos del registro de la entrega.
     * @param file Archivo físico enviado por el alumno.
     * @return ArchivoEntrega persistido.
     * @throws ResourceNotFoundException Si la entrega no existe.
     * @throws RuntimeException Si la extensión del archivo no está permitida.
     */
    @Transactional
    public ArchivoEntregaResponseDTO guardar(ArchivoEntregaRequestDTO dto, MultipartFile file) {
        Entrega entrega = entregaRepository.findById(dto.getIdEntrega())
                .orElseThrow(() -> new ResourceNotFoundException("No se puede guardar el archivo: Entrega no encontrada con ID: " + dto.getIdEntrega()));

        String nombreOriginal = file.getOriginalFilename();
        String extension = (nombreOriginal != null && nombreOriginal.contains(".")) 
                ? nombreOriginal.substring(nombreOriginal.lastIndexOf(".") + 1).toLowerCase() 
                : "";

        // Validación de extensiones permitidas en la tarea
        String permitidas = entrega.getTarea().getExtensionesPermitidas();
        if (permitidas != null && !permitidas.isBlank()) {
            if (!permitidas.toLowerCase().contains("." + extension)) {
                throw new RuntimeException("Error: La extensión ." + extension + " no está permitida para esta tarea.");
            }
        }

        String nombreFisico = System.currentTimeMillis() + "_" + nombreOriginal;
        
        // Guardado físico privado (false)
        fileUtil.guardar(file, FOLDER, nombreFisico, false);

        ArchivoEntrega archivo = archivoEntregaMapper.toEntity(dto);
        archivo.setEntrega(entrega);
        archivo.setNombre(nombreOriginal);
        archivo.setRutaArchivo(FOLDER + "/" + nombreFisico);
        archivo.setExtension(extension);

        return archivoEntregaMapper.toResponse(archivoEntregaRepository.save(archivo));
    }

    // --- MÉTODOS GET ---

    /**
     * Recupera la información de un archivo de entrega por su ID.
     * @param id ID del archivo.
     * @return Archivo encontrado.
     * @throws ResourceNotFoundException Si el archivo no existe.
     */
    @Transactional(readOnly = true)
    public ArchivoEntregaResponseDTO buscarPorId(Long id) {
        return archivoEntregaRepository.findById(id)
                .map(archivoEntregaMapper::toResponse)
                .orElseThrow(() -> new ResourceNotFoundException("Archivo de entrega no encontrado con ID: " + id));
    }

    /**
     * Lista todos los archivos asociados a una entrega específica.
     * @param idEntrega ID de la entrega.
     * @return Lista de archivos vinculados.
     */
    @Transactional(readOnly = true)
    public List<ArchivoEntregaResponseDTO> listarPorEntrega(Long idEntrega) {
        return archivoEntregaRepository.findByEntregaId(idEntrega).stream()
                .map(archivoEntregaMapper::toResponse)
                .collect(Collectors.toList());
    }

    // --- MÉTODOS DELETE ---

    /**
     * Elimina el registro del archivo y borra el fichero físico del servidor.
     * @param id ID del archivo a eliminar.
     * @throws ResourceNotFoundException Si el archivo no existe.
     */
    @Transactional
    public void eliminar(Long id) {
        ArchivoEntrega archivo = archivoEntregaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("No se puede eliminar: Archivo de entrega no encontrado con ID: " + id));

        String[] partes = archivo.getRutaArchivo().split("/");
        if (partes.length == 2) {
            fileUtil.eliminar(partes[0], partes[1], false);
        }

        archivoEntregaRepository.delete(archivo);
    }
}