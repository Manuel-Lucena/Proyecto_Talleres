package com.mlg.taller.service;

import com.mlg.taller.exception.ResourceNotFoundException;
import com.mlg.taller.model.dtos.ArchivoEntregaRequestDTO;
import com.mlg.taller.model.dtos.ArchivoEntregaResponseDTO;
import com.mlg.taller.model.entities.ArchivoEntrega;
import com.mlg.taller.model.entities.Entrega;
import com.mlg.taller.model.mappers.ArchivoEntregaMapper;
import com.mlg.taller.repositories.ArchivoEntregaRepository;
import com.mlg.taller.repositories.EntregaRepository;
import com.mlg.taller.service.validators.ArchivoEntregaValidator;
import com.mlg.taller.util.FileUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Servicio para la gestión de archivos físicos entregados por los alumnos.
 *
 * Se encarga del ciclo de vida de los adjuntos de las entregas, delegando
 * las validaciones de identidad y formatos en el validador correspondiente.
 */
@Service
@RequiredArgsConstructor
public class ArchivoEntregaService {

    private final ArchivoEntregaRepository archivoEntregaRepository;
    private final EntregaRepository entregaRepository;
    private final ArchivoEntregaMapper archivoEntregaMapper;
    private final ArchivoEntregaValidator archivoEntregaValidator;
    private final FileUtil fileUtil;

    private static final String FOLDER = "entregas";

    // --- MÉTODOS POST ---

    /**
     * Registra y guarda físicamente un archivo asociado a una entrega.
     *
     * @param dto  Datos del registro del archivo.
     * @param file Binario enviado (documento, imagen, etc.).
     * @return DTO con la información del archivo persistido.
     */
    @Transactional
    public ArchivoEntregaResponseDTO guardar(ArchivoEntregaRequestDTO dto, MultipartFile file) {
        Entrega entrega = buscarEntregaInterna(dto.getIdEntrega());

        archivoEntregaValidator.validarPropiedadEntrega(entrega);

        String nombreOriginal = file.getOriginalFilename();
        String extension = obtenerExtension(nombreOriginal);
        archivoEntregaValidator.validarExtensionPermitida(entrega, extension);

        String nombreFisico = System.currentTimeMillis() + "_" + nombreOriginal;
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
     * Lista los archivos asociados a una entrega con validación de privacidad.
     *
     * @param idEntrega Identificador de la entrega.
     * @return Lista de archivos adjuntos.
     */
    @Transactional(readOnly = true)
    public List<ArchivoEntregaResponseDTO> listarPorEntrega(Long idEntrega) {
        Entrega entrega = buscarEntregaInterna(idEntrega);
        archivoEntregaValidator.validarAccesoLectura(entrega);

        return archivoEntregaRepository.findByEntregaId(idEntrega).stream()
                .map(archivoEntregaMapper::toResponse)
                .collect(Collectors.toList());
    }

    /**
     * Recupera la información de un archivo por su ID y valida permisos de acceso.
     *
     * @param id Identificador del archivo.
     * @return DTO con los datos del archivo.
     */
    @Transactional(readOnly = true)
    public ArchivoEntregaResponseDTO buscarPorId(Long id) {
        ArchivoEntrega archivo = buscarArchivoInterno(id);
        archivoEntregaValidator.validarAccesoLectura(archivo.getEntrega());
        return archivoEntregaMapper.toResponse(archivo);
    }

    // --- MÉTODOS DELETE ---

    /**
     * Elimina el archivo físico y su registro en la base de datos.
     *
     * @param id Identificador del archivo a eliminar.
     */
    @Transactional
    public void eliminar(Long id) {
        ArchivoEntrega archivo = buscarArchivoInterno(id);
        archivoEntregaValidator.validarPermisoEliminacion(archivo);

        String[] partes = archivo.getRutaArchivo().split("/");
        if (partes.length == 2) {
            fileUtil.eliminar(partes[0], partes[1], false);
        }

        archivoEntregaRepository.delete(archivo);
    }

    // --- MÉTODOS PRIVADOS ---

    /**
     * Realiza una búsqueda interna de una entrega por su identificador único.
     * 
     * @param id Identificador único de la entrega.
     * @return Entidad Entrega recuperada del repositorio.
     * @throws ResourceNotFoundException si la entrega no existe en la base de
     *                                   datos.
     */
    private Entrega buscarEntregaInterna(Long id) {
        return entregaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Entrega no encontrada con ID: " + id));
    }

    /**
     * Realiza una búsqueda interna de un archivo de entrega por su identificador.
     * 
     * @param id Identificador único del archivo de entrega.
     * @return Entidad ArchivoEntrega encontrada.
     * @throws ResourceNotFoundException si el archivo no existe.
     */
    private ArchivoEntrega buscarArchivoInterno(Long id) {
        return archivoEntregaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Archivo de entrega no encontrado con ID: " + id));
    }

    /**
     * Extrae de forma segura la extensión de un nombre de archivo.
     * 
     * @param nombre Nombre original del archivo (ej. "proyecto_final.DOCX").
     * @return Extensión del archivo en minúsculas (ej. "docx") o cadena vacía si no
     *         tiene.
     */
    private String obtenerExtension(String nombre) {
        return (nombre != null && nombre.contains(".")) ? nombre.substring(nombre.lastIndexOf(".") + 1).toLowerCase()
                : "";
    }
}