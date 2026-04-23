package com.mlg.taller.service;

import com.mlg.taller.exception.ResourceNotFoundException;
import com.mlg.taller.model.dtos.ArchivoMaterialRequestDTO;
import com.mlg.taller.model.dtos.ArchivoMaterialResponseDTO;
import com.mlg.taller.model.entities.ArchivoMaterial;
import com.mlg.taller.model.entities.Material;
import com.mlg.taller.model.mappers.ArchivoMaterialMapper;
import com.mlg.taller.repositories.ArchivoMaterialRepository;
import com.mlg.taller.repositories.MaterialRepository;
import com.mlg.taller.service.validators.ArchivoMaterialValidator;
import com.mlg.taller.util.FileUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Servicio para la gestión de archivos adjuntos a los materiales educativos.
 *
 * Gestiona el ciclo de vida de los recursos físicos delegando las validaciones
 * de seguridad en el validador y la persistencia en disco en FileUtil.
 */
@Service
@RequiredArgsConstructor
public class ArchivoMaterialService {

    private final ArchivoMaterialRepository archivoMaterialRepository;
    private final MaterialRepository materialRepository;
    private final ArchivoMaterialMapper archivoMaterialMapper;
    private final ArchivoMaterialValidator archivoMaterialValidator;
    private final FileUtil fileUtil;

    private static final String FOLDER = "materiales";

    // --- MÉTODOS POST ---

    /**
     * Guarda un archivo físico y registra su vinculación con un material.
     *
     * @param dto  Datos del registro.
     * @param file Archivo binario recibido.
     * @return DTO del archivo registrado.
     */
    @Transactional
    public ArchivoMaterialResponseDTO guardar(ArchivoMaterialRequestDTO dto, MultipartFile file) {
        Material material = buscarMaterialInterno(dto.getIdMaterial());
        archivoMaterialValidator.validarPropiedadMaterial(material);

        String nombreOriginal = file.getOriginalFilename();
        String extension = obtenerExtension(nombreOriginal);
        String nombreFisico = System.currentTimeMillis() + "_" + nombreOriginal;

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
     * Recupera un archivo específico validando permisos de acceso.
     *
     * @param id Identificador único del archivo.
     * @return DTO del archivo encontrado.
     */
    @Transactional(readOnly = true)
    public ArchivoMaterialResponseDTO buscarPorId(Long id) {
        ArchivoMaterial archivo = buscarArchivoInterno(id);
        archivoMaterialValidator.validarAccesoLectura(archivo.getMaterial());
        return archivoMaterialMapper.toResponse(archivo);
    }

    /**
     * Lista todos los archivos de un material para usuarios autorizados.
     *
     * @param idMaterial Identificador del material.
     * @return Lista de archivos adjuntos.
     */
    @Transactional(readOnly = true)
    public List<ArchivoMaterialResponseDTO> listarPorMaterial(Long idMaterial) {
        Material material = buscarMaterialInterno(idMaterial);
        archivoMaterialValidator.validarAccesoLectura(material);

        return archivoMaterialRepository.findByMaterialId(idMaterial).stream()
                .map(archivoMaterialMapper::toResponse)
                .collect(Collectors.toList());
    }

    // --- MÉTODOS DELETE ---

    /**
     * Elimina el registro del archivo y su contenido físico del servidor.
     *
     * @param id Identificador del archivo a suprimir.
     */
    @Transactional
    public void eliminar(Long id) {
        ArchivoMaterial archivo = buscarArchivoInterno(id);
        archivoMaterialValidator.validarPropiedadMaterial(archivo.getMaterial());

        String rutaCompleta = archivo.getRutaArchivo();
        String nombreFisico = rutaCompleta.substring(rutaCompleta.lastIndexOf("/") + 1);

        fileUtil.eliminar(FOLDER, nombreFisico, false);
        archivoMaterialRepository.delete(archivo);
    }

    // --- MÉTODOS PRIVADOS ---

    /**
     * Realiza una búsqueda interna de un material educativo por su identificador
     * único.
     * 
     * @param id Identificador único del material.
     * @return Entidad Material recuperada del repositorio.
     * @throws ResourceNotFoundException si el material no existe en la base de
     *                                   datos.
     */
    private Material buscarMaterialInterno(Long id) {
        return materialRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Material no encontrado con ID: " + id));
    }

    /**
     * Realiza una búsqueda interna de un archivo de material por su identificador.
     * 
     * @param id Identificador único del archivo de material.
     * @return Entidad ArchivoMaterial encontrada.
     * @throws ResourceNotFoundException si el archivo no existe.
     */
    private ArchivoMaterial buscarArchivoInterno(Long id) {
        return archivoMaterialRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Archivo no encontrado con ID: " + id));
    }

    /**
     * Extrae de forma segura la extensión de un nombre de archivo.
     * 
     * @param nombre Nombre original del archivo (ej. "guia_estudio.PDF").
     * @return Extensión del archivo en minúsculas (ej. "pdf") o cadena vacía si no
     *         posee.
     */
    private String obtenerExtension(String nombre) {
        return (nombre != null && nombre.contains(".")) ? nombre.substring(nombre.lastIndexOf(".") + 1).toLowerCase()
                : "";
    }
}