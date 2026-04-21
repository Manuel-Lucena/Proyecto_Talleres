package com.mlg.taller.service;

import com.mlg.taller.exception.BadRequestException;
import com.mlg.taller.exception.ResourceNotFoundException;
import com.mlg.taller.model.dtos.MaterialRequestDTO;
import com.mlg.taller.model.dtos.MaterialResponseDTO;
import com.mlg.taller.model.entities.ArchivoMaterial;
import com.mlg.taller.model.entities.Material;
import com.mlg.taller.model.entities.Taller;
import com.mlg.taller.model.entities.Usuario;
import com.mlg.taller.model.mappers.MaterialMapper;
import com.mlg.taller.repositories.InscripcionRepository;
import com.mlg.taller.repositories.MaterialRepository;
import com.mlg.taller.repositories.TallerRepository;
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
 */
@Service
@RequiredArgsConstructor
public class MaterialService {

    private final MaterialRepository materialRepository;
    private final TallerRepository tallerRepository;
    private final MaterialMapper materialMapper;
    private final FileUtil fileUtil;
    private final InscripcionRepository inscripcionRepository;

    // --- MÉTODOS POST ---

    /**
     * Crea un nuevo material y lo asocia a un taller.
     *
     * @param dto Datos del material a crear.
     * @return Material creado y persistido.
     * @throws ResourceNotFoundException Si el taller asociado no existe.
     * @throws BadRequestException       Si el usuario no tiene permiso para subir
     *                                   material a este taller.
     */
    @Transactional
    public MaterialResponseDTO crear(MaterialRequestDTO dto) {
        Taller taller = tallerRepository.findById(dto.getIdTaller())
                .orElseThrow(() -> new ResourceNotFoundException("Taller no encontrado"));

        Usuario solicitante = SecurityUtils.getUsuarioAutenticado();
        boolean esAdmin = solicitante.getRol().getNombre().equalsIgnoreCase("ADMIN");
        boolean esSuTaller = taller.getProfesor() != null && taller.getProfesor().getId().equals(solicitante.getId());

        if (!esAdmin && !esSuTaller) {
            throw new BadRequestException("No puedes subir material a un taller que no impartes.");
        }

        Material material = materialMapper.toEntity(dto);
        material.setTaller(taller);
        material.setFechaSubida(LocalDateTime.now());
        return materialMapper.toResponse(materialRepository.save(material));
    }

    // --- MÉTODOS GET ---
    /**
     * Obtiene el listado global de todos los materiales registrados en el sistema.
     * Uso restringido generalmente a perfiles administrativos.
     *
     * @return Lista de todos los materiales mapeados a DTO.
     */
    @Transactional(readOnly = true)
    public List<MaterialResponseDTO> listarTodos() {
        return materialRepository.findAll().stream()
                .map(materialMapper::toResponse)
                .collect(Collectors.toList());
    }

    /**
     * Lista solo los materiales de un taller que tienen visible = true.
     *
     * @param idTaller Identificador del taller.
     * @return Lista de materiales visibles para los alumnos inscritos.
     * @throws BadRequestException Si el usuario no tiene una matrícula activa en el
     *                             taller.
     */
    @Transactional(readOnly = true)
    public List<MaterialResponseDTO> listarVisibles(Long idTaller) {
        Usuario solicitante = SecurityUtils.getUsuarioAutenticado();
        boolean esAdmin = solicitante.getRol().getNombre().equalsIgnoreCase("ADMIN");

        if (!esAdmin) {
            boolean estaInscrito = inscripcionRepository.existsByUsuarioIdAndTallerIdAndActivaTrue(solicitante.getId(),
                    idTaller);
            if (!estaInscrito) {
                throw new BadRequestException("Debes estar inscrito para ver los materiales.");
            }
        }
        return materialRepository.findByTallerIdAndVisibleTrue(idTaller).stream()
                .map(materialMapper::toResponse)
                .collect(Collectors.toList());
    }

    /**
     * Recupera un material específico por su identificador único.
     *
     * @param id Identificador del material a buscar.
     * @return Material encontrado y mapeado a DTO.
     * @throws ResourceNotFoundException Si el material no existe.
     * @throws BadRequestException       Si el usuario no tiene permiso de acceso
     *                                   por falta de inscripción o propiedad.
     */
    @Transactional(readOnly = true)
    public MaterialResponseDTO buscarPorId(Long id) {
        Material material = materialRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Material no encontrado"));

        Usuario solicitante = SecurityUtils.getUsuarioAutenticado();
        boolean esAdmin = solicitante.getRol().getNombre().equalsIgnoreCase("ADMIN");

        if (solicitante.getRol().getNombre().equalsIgnoreCase("ALUMNO")) {
            boolean estaInscrito = inscripcionRepository.existsByUsuarioIdAndTallerIdAndActivaTrue(
                    solicitante.getId(), material.getTaller().getId());
            if (!estaInscrito || !material.isVisible()) {
                throw new BadRequestException("No tienes permiso para ver este recurso.");
            }
        } else if (solicitante.getRol().getNombre().equalsIgnoreCase("PROFESOR") && !esAdmin) {
            if (!material.getTaller().getProfesor().getId().equals(solicitante.getId())) {
                throw new BadRequestException("No puedes ver materiales de talleres ajenos.");
            }
        }
        return materialMapper.toResponse(material);
    }

    /**
     * Recupera todos los materiales (visibles y ocultos) vinculados a un taller.
     * Ideal para la vista de gestión del profesor.
     *
     * @param idTaller Identificador único del taller a consultar.
     * @return Lista de MaterialResponseDTO con todos los recursos del taller.
     * @throws ResourceNotFoundException Si el taller con el ID proporcionado no
     *                                   existe.
     * @throws BadRequestException       Si un profesor intenta acceder a los
     *                                   materiales de un taller que no imparte.
     */
    @Transactional(readOnly = true)
    public List<MaterialResponseDTO> listarPorTaller(Long idTaller) {
        Usuario solicitante = SecurityUtils.getUsuarioAutenticado();
        boolean esAdmin = solicitante.getRol().getNombre().equalsIgnoreCase("ADMIN");

        if (!esAdmin) {
            Taller taller = tallerRepository.findById(idTaller)
                    .orElseThrow(() -> new ResourceNotFoundException("Taller no encontrado"));

            boolean esSuTaller = taller.getProfesor() != null &&
                    taller.getProfesor().getId().equals(solicitante.getId());

            if (!esSuTaller) {
                throw new BadRequestException("No puedes ver la gestión de materiales de un taller ajeno.");
            }
        }

        return materialRepository.findByTallerId(idTaller).stream()
                .map(materialMapper::toResponse)
                .collect(Collectors.toList());
    }

    // --- MÉTODOS PUT ---

    /**
     * Actualiza el contenido de un material existente.
     *
     * @param id  ID del material a modificar.
     * @param dto Nuevos datos para el material.
     * @return Material actualizado.
     * @throws ResourceNotFoundException Si el material o el taller no existen.
     * @throws BadRequestException       Si el usuario no tiene permiso para editar
     *                                   este material.
     */
    @Transactional
    public MaterialResponseDTO actualizar(Long id, MaterialRequestDTO dto) {
        Material existente = materialRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Material no encontrado"));

        Usuario solicitante = SecurityUtils.getUsuarioAutenticado();
        boolean esAdmin = solicitante.getRol().getNombre().equalsIgnoreCase("ADMIN");
        boolean esSuTaller = existente.getTaller().getProfesor() != null
                && existente.getTaller().getProfesor().getId().equals(solicitante.getId());

        if (!esAdmin && !esSuTaller) {
            throw new BadRequestException("No tienes permiso para editar este material.");
        }

        existente.setTitulo(dto.getTitulo());
        existente.setContenido(dto.getContenido());

        if (!existente.getTaller().getId().equals(dto.getIdTaller())) {
            Taller nuevoTaller = tallerRepository.findById(dto.getIdTaller())
                    .orElseThrow(() -> new ResourceNotFoundException("Nuevo taller no encontrado"));
            existente.setTaller(nuevoTaller);
        }
        return materialMapper.toResponse(materialRepository.save(existente));
    }

    /**
     * Alterna el estado de visibilidad de un material.
     *
     * @param id ID del material a modificar.
     * @return Material actualizado con el nuevo estado.
     * @throws ResourceNotFoundException Si el material no existe.
     * @throws BadRequestException       Si el usuario no tiene permiso para cambiar
     *                                   la visibilidad.
     */
    @Transactional
    public MaterialResponseDTO cambiarVisibilidad(Long id) {
        Material material = materialRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Material no encontrado"));

        Usuario solicitante = SecurityUtils.getUsuarioAutenticado();
        boolean esAdmin = solicitante.getRol().getNombre().equalsIgnoreCase("ADMIN");
        boolean esSuTaller = material.getTaller().getProfesor() != null
                && material.getTaller().getProfesor().getId().equals(solicitante.getId());

        if (!esAdmin && !esSuTaller) {
            throw new BadRequestException("No tienes permiso para cambiar la visibilidad de este material.");
        }

        material.setVisible(!material.isVisible());
        return materialMapper.toResponse(materialRepository.save(material));
    }

    // --- MÉTODOS DELETE ---

    /**
     * Elimina un material del sistema y sus archivos asociados.
     *
     * @param id ID del material a borrar.
     * @throws ResourceNotFoundException Si el material no existe.
     * @throws BadRequestException       Si el usuario no tiene permiso para
     *                                   eliminar el material.
     */
    @Transactional
    public void eliminar(Long id) {
        Material material = materialRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Material no encontrado"));

        Usuario solicitante = SecurityUtils.getUsuarioAutenticado();
        boolean esAdmin = solicitante.getRol().getNombre().equalsIgnoreCase("ADMIN");
        boolean esSuTaller = material.getTaller().getProfesor() != null
                && material.getTaller().getProfesor().getId().equals(solicitante.getId());

        if (!esAdmin && !esSuTaller) {
            throw new BadRequestException("No puedes eliminar este material.");
        }

        List<String> nombresArchivos = material.getArchivos().stream()
                .map(ArchivoMaterial::getNombre)
                .toList();

        materialRepository.delete(material);
        nombresArchivos.forEach(nombre -> fileUtil.eliminar("materiales", nombre, false));
    }
}