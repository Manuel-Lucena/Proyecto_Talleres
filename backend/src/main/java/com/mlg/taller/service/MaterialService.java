package com.mlg.taller.service;

import com.mlg.taller.exception.ResourceNotFoundException;
import com.mlg.taller.model.dtos.MaterialRequestDTO;
import com.mlg.taller.model.dtos.MaterialResponseDTO;
import com.mlg.taller.model.entities.ArchivoMaterial;
import com.mlg.taller.model.entities.Material;
import com.mlg.taller.model.entities.Taller;
import com.mlg.taller.model.mappers.MaterialMapper;
import com.mlg.taller.repositories.MaterialRepository;
import com.mlg.taller.repositories.TallerRepository;
import com.mlg.taller.service.validators.MaterialValidator;
import com.mlg.taller.util.FileUtil;
import com.mlg.taller.util.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Servicio para la gestión de los materiales educativos asociados a los
 * talleres.
 *
 * Centraliza la lógica de persistencia y delega las reglas de seguridad
 * en el componente de validación de materiales. Gestiona tanto la información
 * en base de datos como la limpieza de archivos físicos en disco.
 */
@Service
@RequiredArgsConstructor
public class MaterialService {

    private final MaterialRepository materialRepository;
    private final TallerRepository tallerRepository;
    private final MaterialValidator materialValidator;
    private final MaterialMapper materialMapper;
    private final FileUtil fileUtil;

    // --- MÉTODOS POST ---

    /**
     * Crea un nuevo material y lo asocia a un taller específico.
     *
     * Se valida que el usuario autenticado tenga permisos de gestión (ADMIN o
     * profesor titular).
     *
     * @param dto Objeto de transferencia con los datos del material a crear.
     * @return DTO con los datos del material persistido.
     * @throws ResourceNotFoundException si el ID del taller proporcionado no
     *                                   existe.
     */
    @Transactional
    public MaterialResponseDTO crear(MaterialRequestDTO dto) {
        Taller taller = buscarTallerInterno(dto.getIdTaller());
        materialValidator.validarPermisosGestion(SecurityUtils.getUsuarioAutenticado(), taller);

        Material material = materialMapper.toEntity(dto);
        material.setTaller(taller);
        material.setFechaSubida(LocalDateTime.now());

        return materialMapper.toResponse(materialRepository.save(material));
    }

    // --- MÉTODOS GET ---

    /**
     * Obtiene el listado global de todos los materiales registrados en el sistema.
     *
     * Este método está generalmente restringido a perfiles con rol ADMINISTRADOR.
     *
     * @return Lista de DTOs de respuesta de material.
     */
    @Transactional(readOnly = true)
    public List<MaterialResponseDTO> listarTodos() {
        return materialRepository.findAll().stream()
                .map(materialMapper::toResponse)
                .collect(Collectors.toList());
    }

    /**
     * Lista los materiales marcados como visibles para un alumno en un taller
     * específico.
     *
     * Verifica que el alumno tenga una inscripción activa antes de devolver el
     * listado.
     *
     * @param idTaller Identificador único del taller.
     * @return Lista de materiales que tienen el flag de visibilidad activo.
     */
    @Transactional(readOnly = true)
    public List<MaterialResponseDTO> listarVisibles(Long idTaller) {
        materialValidator.validarInscripcion(SecurityUtils.getUsuarioAutenticado(), idTaller);
        return materialRepository.findByTallerIdAndVisibleTrue(idTaller).stream()
                .map(materialMapper::toResponse)
                .collect(Collectors.toList());
    }

    /**
     * Recupera un material específico mediante su identificador.
     *
     * Valida los permisos de lectura según el rol (ADMIN, Profesor titular o Alumno
     * inscrito).
     *
     * @param id Identificador único del material.
     * @return DTO con la información del recurso.
     * @throws ResourceNotFoundException si el material no existe.
     */
    @Transactional(readOnly = true)
    public MaterialResponseDTO buscarPorId(Long id) {
        Material material = buscarMaterialInterno(id);
        materialValidator.validarAccesoLectura(SecurityUtils.getUsuarioAutenticado(), material);
        return materialMapper.toResponse(material);
    }

    /**
     * Lista la totalidad de materiales de un taller, incluyendo los no visibles.
     *
     * Diseñado para la vista de gestión del Profesor o del Administrador.
     *
     * @param idTaller Identificador único del taller.
     * @return Lista de todos los materiales vinculados al taller.
     * @throws ResourceNotFoundException si el taller no existe.
     */
    @Transactional(readOnly = true)
    public List<MaterialResponseDTO> listarPorTaller(Long idTaller) {
        Taller taller = buscarTallerInterno(idTaller);
        materialValidator.validarPermisosGestion(SecurityUtils.getUsuarioAutenticado(), taller);
        return materialRepository.findByTallerId(idTaller).stream()
                .map(materialMapper::toResponse)
                .collect(Collectors.toList());
    }

    // --- MÉTODOS PUT ---

    /**
     * Actualiza los datos de un material existente.
     *
     * Si el material se intenta mover de taller, se valida que el usuario
     * tenga permisos también en el taller de destino.
     *
     * @param id  Identificador del material a modificar.
     * @param dto Datos actualizados.
     * @return DTO del material actualizado.
     * @throws ResourceNotFoundException si el material o el nuevo taller no
     *                                   existen.
     */
    @Transactional
    public MaterialResponseDTO actualizar(Long id, MaterialRequestDTO dto) {
        Material existente = buscarMaterialInterno(id);
        var solicitante = SecurityUtils.getUsuarioAutenticado();

        materialValidator.validarPermisosGestion(solicitante, existente.getTaller());

        existente.setTitulo(dto.getTitulo());
        existente.setContenido(dto.getContenido());

        if (!existente.getTaller().getId().equals(dto.getIdTaller())) {
            Taller nuevoTaller = buscarTallerInterno(dto.getIdTaller());
            materialValidator.validarPermisosGestion(solicitante, nuevoTaller);
            existente.setTaller(nuevoTaller);
        }

        return materialMapper.toResponse(materialRepository.save(existente));
    }

    /**
     * Alterna el estado de visibilidad de un material (publicado/oculto).
     *
     * @param id Identificador único del material.
     * @return DTO con el nuevo estado de visibilidad.
     * @throws ResourceNotFoundException si el material no existe.
     */
    @Transactional
    public MaterialResponseDTO cambiarVisibilidad(Long id) {
        Material material = buscarMaterialInterno(id);
        materialValidator.validarPermisosGestion(SecurityUtils.getUsuarioAutenticado(), material.getTaller());

        material.setVisible(!material.isVisible());
        return materialMapper.toResponse(materialRepository.save(material));
    }

    // --- MÉTODOS DELETE ---

    /**
     * Elimina un material del sistema y limpia sus archivos físicos asociados.
     *
     * Se recuperan los nombres de los archivos vinculados antes de eliminar la
     * entidad
     * para asegurar que el almacenamiento físico no quede huérfano.
     *
     * @param id Identificador único del material a eliminar.
     * @throws ResourceNotFoundException si el material no existe.
     */
    @Transactional
    public void eliminar(Long id) {
        Material material = buscarMaterialInterno(id);
        materialValidator.validarPermisosGestion(SecurityUtils.getUsuarioAutenticado(), material.getTaller());

        List<String> nombresArchivos = material.getArchivos().stream()
                .map(ArchivoMaterial::getNombre)
                .toList();

        materialRepository.delete(material);
        nombresArchivos.forEach(nombre -> fileUtil.eliminar("materiales", nombre, false));
    }

    // --- MÉTODOS PRIVADOS DE APOYO ---

    /**
     * Busca un taller en la base de datos a partir de su identificador único.
     *
     * @param id Identificador único del taller.
     * @return Entidad Taller recuperada.
     * @throws ResourceNotFoundException si el taller no existe.
     */
    private Taller buscarTallerInterno(Long id) {
        return tallerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Taller no encontrado"));
    }

    /**
     * Busca un material en la base de datos a partir de su identificador único.
     *
     * @param id Identificador único del material.
     * @return Entidad Material recuperada.
     * @throws ResourceNotFoundException si el material no existe.
     */
    private Material buscarMaterialInterno(Long id) {
        return materialRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Material no encontrado"));
    }
}