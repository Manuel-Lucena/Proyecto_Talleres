package com.mlg.taller.service;

import com.mlg.taller.exception.BadRequestException;
import com.mlg.taller.exception.ResourceNotFoundException;
import com.mlg.taller.model.dtos.ArchivoEntregaRequestDTO;
import com.mlg.taller.model.dtos.ArchivoEntregaResponseDTO;
import com.mlg.taller.model.entities.ArchivoEntrega;
import com.mlg.taller.model.entities.Entrega;
import com.mlg.taller.model.entities.Usuario;
import com.mlg.taller.model.mappers.ArchivoEntregaMapper;
import com.mlg.taller.repositories.ArchivoEntregaRepository;
import com.mlg.taller.repositories.EntregaRepository;
import com.mlg.taller.util.FileUtil;
import com.mlg.taller.util.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Servicio para la gestión de archivos físicos entregados por los alumnos.
 * * Implementa un control de acceso estricto basado en la identidad del autor
 * y la jerarquía docente para garantizar la integridad de las entregas.
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
     * Registra y guarda físicamente un archivo asociado a una entrega.
     * * @param dto Datos del registro del archivo.
     * 
     * @param file Binario enviado (documento, imagen, etc.).
     * @return DTO con la información del archivo persistido.
     * @throws ResourceNotFoundException Si la entrega vinculada no existe.
     * @throws BadRequestException       Si el usuario no es el dueño de la entrega
     *                                   o el formato de archivo no es válido.
     */
    @Transactional
    public ArchivoEntregaResponseDTO guardar(ArchivoEntregaRequestDTO dto, MultipartFile file) {
        Entrega entrega = entregaRepository.findById(dto.getIdEntrega())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "No se puede guardar: Entrega no encontrada con ID: " + dto.getIdEntrega()));

        // 1. Blindaje de Identidad
        validarPropiedadEntrega(entrega);

        // 2. Validación de Formato
        String nombreOriginal = file.getOriginalFilename();
        String extension = obtenerExtension(nombreOriginal);
        validarExtensionPermitida(entrega, extension);

        // 3. Persistencia Física
        String nombreFisico = System.currentTimeMillis() + "_" + nombreOriginal;
        fileUtil.guardar(file, FOLDER, nombreFisico, false);

        // 4. Persistencia en Base de Datos
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
     * * @param idEntrega Identificador de la entrega.
     * 
     * @return Lista de archivos adjuntos.
     * @throws ResourceNotFoundException Si la entrega no existe.
     * @throws BadRequestException       Si el usuario no tiene permisos de lectura.
     */
    @Transactional(readOnly = true)
    public List<ArchivoEntregaResponseDTO> listarPorEntrega(Long idEntrega) {
        Entrega entrega = entregaRepository.findById(idEntrega)
                .orElseThrow(() -> new ResourceNotFoundException("Entrega no encontrada con ID: " + idEntrega));

        validarAccesoLectura(entrega);

        return archivoEntregaRepository.findByEntregaId(idEntrega).stream()
                .map(archivoEntregaMapper::toResponse)
                .collect(Collectors.toList());
    }

    /**
     * Recupera la información de un archivo por su ID y valida permisos de acceso.
     * * @param id Identificador del archivo.
     * 
     * @return ArchivoEntregaResponseDTO con los datos del archivo.
     * @throws ResourceNotFoundException Si el archivo no existe.
     */
    @Transactional(readOnly = true)
    public ArchivoEntregaResponseDTO buscarPorId(Long id) {
        ArchivoEntrega archivo = archivoEntregaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Archivo de entrega no encontrado con ID: " + id));

        validarAccesoLectura(archivo.getEntrega());

        return archivoEntregaMapper.toResponse(archivo);
    }

    // --- MÉTODOS DELETE ---

    /**
     * Elimina el archivo físico y su registro en la base de datos.
     * * @param id Identificador del archivo a eliminar.
     * 
     * @throws ResourceNotFoundException Si el archivo no existe.
     * @throws BadRequestException       Si el usuario no es el dueño o
     *                                   administrador.
     */
    @Transactional
    public void eliminar(Long id) {
        ArchivoEntrega archivo = archivoEntregaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Archivo no encontrado con ID: " + id));

        validarPermisoEliminacion(archivo);

        String[] partes = archivo.getRutaArchivo().split("/");
        if (partes.length == 2) {
            fileUtil.eliminar(partes[0], partes[1], false);
        }

        archivoEntregaRepository.delete(archivo);
    }

    // --- MÉTODOS PRIVADOS DE APOYO (BLINDAJE) ---

    /**
     * Verifica que el alumno en sesión sea el propietario de la entrega.
     * * @param entrega La entrega a validar.
     * 
     * @throws BadRequestException Si el usuario no es el autor.
     */
    private void validarPropiedadEntrega(Entrega entrega) {
        Usuario solicitante = SecurityUtils.getUsuarioAutenticado();
        if (!entrega.getAlumno().getId().equals(solicitante.getId())) {
            throw new BadRequestException("Acceso denegado: Solo el autor de la entrega puede adjuntar archivos.");
        }
    }

    /**
     * Comprueba si el usuario tiene permiso para ver los archivos (Dueño, Profe o
     * Admin).
     * * @param entrega La entrega a consultar.
     * 
     * @throws BadRequestException Si el usuario es ajeno a la entrega o al taller.
     */
    private void validarAccesoLectura(Entrega entrega) {
        Usuario solicitante = SecurityUtils.getUsuarioAutenticado();
        boolean esAutor = entrega.getAlumno().getId().equals(solicitante.getId());
        boolean esSuProfesor = entrega.getTarea().getTaller().getProfesor() != null &&
                entrega.getTarea().getTaller().getProfesor().getId().equals(solicitante.getId());
        boolean esAdmin = solicitante.getRol().getNombre().equalsIgnoreCase("ADMIN");

        if (!esAutor && !esSuProfesor && !esAdmin) {
            throw new BadRequestException("No tienes permiso para visualizar los archivos de esta entrega.");
        }
    }

    /**
     * Verifica si el usuario puede borrar el archivo (Solo autor o Admin).
     * * @param archivo Registro del archivo a borrar.
     * 
     * @throws BadRequestException Si el usuario no tiene autoridad de borrado.
     */
    private void validarPermisoEliminacion(ArchivoEntrega archivo) {
        Usuario solicitante = SecurityUtils.getUsuarioAutenticado();
        boolean esAutor = archivo.getEntrega().getAlumno().getId().equals(solicitante.getId());
        boolean esAdmin = solicitante.getRol().getNombre().equalsIgnoreCase("ADMIN");

        if (!esAutor && !esAdmin) {
            throw new BadRequestException("Solo el alumno propietario o el administrador pueden eliminar archivos.");
        }
    }

    /**
     * Valida la extensión del archivo contra las permitidas en la tarea.
     * * @param entrega Entrega con la configuración de la tarea.
     * 
     * @param extension Extensión detectada.
     * @throws BadRequestException Si la extensión no está en la lista blanca.
     */
    private void validarExtensionPermitida(Entrega entrega, String extension) {
        String permitidas = entrega.getTarea().getExtensionesPermitidas();
        if (permitidas != null && !permitidas.isBlank()) {
            if (!permitidas.toLowerCase().contains("." + extension)) {
                throw new BadRequestException("Formato no permitido. La tarea solo acepta: " + permitidas);
            }
        }
    }

    /**
     * Extrae la extensión de un nombre de archivo.
     * * @param nombre Nombre original.
     * 
     * @return Extensión en minúsculas.
     */
    private String obtenerExtension(String nombre) {
        return (nombre != null && nombre.contains("."))
                ? nombre.substring(nombre.lastIndexOf(".") + 1).toLowerCase()
                : "";
    }
}