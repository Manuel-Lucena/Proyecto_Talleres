package com.mlg.taller.service;

import com.mlg.taller.exception.ResourceNotFoundException;
import com.mlg.taller.model.dtos.ArchivoTareaRequestDTO;
import com.mlg.taller.model.dtos.ArchivoTareaResponseDTO;
import com.mlg.taller.model.entities.ArchivoTarea;
import com.mlg.taller.model.entities.Tarea;
import com.mlg.taller.model.mappers.ArchivoTareaMapper;
import com.mlg.taller.repositories.ArchivoTareaRepository;
import com.mlg.taller.repositories.TareaRepository;
import com.mlg.taller.service.validators.ArchivoTareaValidator;
import com.mlg.taller.util.FileUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Servicio para la gestión de archivos adjuntos a las tareas.
 *
 * Gestiona el ciclo de vida de los archivos (enunciados y recursos) delegando
 * las reglas de acceso en el validador y la persistencia física en FileUtil.
 */
@Service
@RequiredArgsConstructor
public class ArchivoTareaService {

    private final ArchivoTareaRepository archivoTareaRepository;
    private final TareaRepository tareaRepository;
    private final ArchivoTareaMapper archivoTareaMapper;
    private final ArchivoTareaValidator archivoTareaValidator;
    private final FileUtil fileUtil;

    private static final String FOLDER = "tareas";

    // --- MÉTODOS POST ---

    /**
     * Guarda un archivo físico y registra su vinculación con una tarea.
     *
     * @param dto  Datos descriptivos del archivo.
     * @param file Archivo binario recibido.
     * @return DTO del archivo persistido.
     */
    @Transactional
    public ArchivoTareaResponseDTO guardar(ArchivoTareaRequestDTO dto, MultipartFile file) {
        Tarea tarea = buscarTareaInterna(dto.getIdTarea());
        archivoTareaValidator.validarPropiedadTarea(tarea);

        String nombreOriginal = file.getOriginalFilename();
        String extension = obtenerExtension(nombreOriginal);
        String nombreFisico = System.currentTimeMillis() + "_" + nombreOriginal;

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
     * Recupera un archivo específico validando los permisos de acceso.
     *
     * @param id Identificador único del archivo.
     * @return DTO del archivo encontrado.
     */
    @Transactional(readOnly = true)
    public ArchivoTareaResponseDTO buscarPorId(Long id) {
        ArchivoTarea archivo = buscarArchivoInterno(id);
        archivoTareaValidator.validarAccesoLectura(archivo.getTarea());
        return archivoTareaMapper.toResponse(archivo);
    }

    /**
     * Lista todos los archivos asociados a una tarea específica.
     *
     * @param idTarea Identificador de la tarea.
     * @return Lista de archivos vinculados.
     */
    @Transactional(readOnly = true)
    public List<ArchivoTareaResponseDTO> listarPorTarea(Long idTarea) {
        Tarea tarea = buscarTareaInterna(idTarea);
        archivoTareaValidator.validarAccesoLectura(tarea);

        return archivoTareaRepository.findByTareaId(idTarea).stream()
                .map(archivoTareaMapper::toResponse)
                .collect(Collectors.toList());
    }

    // --- MÉTODOS DELETE ---

    /**
     * Elimina el registro del archivo y su binario del servidor.
     *
     * @param id Identificador del archivo a suprimir.
     */
    @Transactional
    public void eliminar(Long id) {
        ArchivoTarea archivo = buscarArchivoInterno(id);
        archivoTareaValidator.validarPropiedadTarea(archivo.getTarea());

        String rutaCompleta = archivo.getRutaArchivo();
        String nombreFisico = rutaCompleta.substring(rutaCompleta.lastIndexOf("/") + 1);

        fileUtil.eliminar(FOLDER, nombreFisico, false);
        archivoTareaRepository.delete(archivo);
    }

    // --- MÉTODOS PRIVADOS ---

    /**
     * Realiza una búsqueda interna de una tarea por su identificador único.
     * 
     * @param id Identificador único de la tarea.
     * @return Entidad Tarea recuperada del repositorio.
     * @throws ResourceNotFoundException si la tarea no existe en la base de datos.
     */
    private Tarea buscarTareaInterna(Long id) {
        return tareaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Tarea no encontrada con ID: " + id));
    }

    /**
     * Realiza una búsqueda interna de un archivo de tarea por su identificador.
     * 
     * @param id Identificador único del archivo.
     * @return Entidad ArchivoTarea encontrada.
     * @throws ResourceNotFoundException si el archivo no existe.
     */
    private ArchivoTarea buscarArchivoInterno(Long id) {
        return archivoTareaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Archivo no encontrado con ID: " + id));
    }

    /**
     * Extrae de forma segura la extensión de un nombre de archivo.
     * 
     * @param nombre Nombre original del archivo (ej. "documento.PDF").
     * @return Extensión del archivo (ej. "pdf") o cadena vacía si no tiene.
     */
    private String obtenerExtension(String nombre) {
        return (nombre != null && nombre.contains(".")) ? nombre.substring(nombre.lastIndexOf(".") + 1).toLowerCase()
                : "";
    }
}