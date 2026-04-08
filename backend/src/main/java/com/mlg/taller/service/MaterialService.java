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
import com.mlg.taller.util.FileUtil;

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

    // --- MÉTODOS POST ---

    /**
     * Crea un nuevo material y lo asocia a un taller.
     * 
     * @param dto Datos del material a crear.
     * @return Material creado y persistido.
     * @throws ResourceNotFoundException Si el taller asociado no existe.
     */
    @Transactional
    public MaterialResponseDTO crear(MaterialRequestDTO dto) {
        Taller taller = tallerRepository.findById(dto.getIdTaller())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "No se puede crear el material: Taller no encontrado con ID: " + dto.getIdTaller()));

        Material material = materialMapper.toEntity(dto);
        material.setTaller(taller);
        material.setFechaSubida(LocalDateTime.now());

        return materialMapper.toResponse(materialRepository.save(material));
    }

    // --- MÉTODOS GET ---

    /**
     * Obtiene el listado completo de todos los materiales.
     * 
     * @return Lista de materiales registrados.
     */
    @Transactional(readOnly = true)
    public List<MaterialResponseDTO> listarTodos() {
        return materialRepository.findAll().stream()
                .map(materialMapper::toResponse)
                .collect(Collectors.toList());
    }

    /**
     * Lista solo los materiales de un taller que tienen visible = true.
     * * @param idTaller ID del taller.
     * 
     * @return Lista de materiales visibles.
     */
    @Transactional(readOnly = true)
    public List<MaterialResponseDTO> listarVisibles(Long idTaller) {
        return materialRepository.findByTallerIdAndVisibleTrue(idTaller).stream()
                .map(materialMapper::toResponse)
                .collect(Collectors.toList());
    }

    /**
     * Recupera un material específico por su identificador.
     * 
     * @param id ID del material a buscar.
     * @return Material encontrado.
     * @throws ResourceNotFoundException Si el material no existe.
     */
    @Transactional(readOnly = true)
    public MaterialResponseDTO buscarPorId(Long id) {
        return materialRepository.findById(id)
                .map(materialMapper::toResponse)
                .orElseThrow(() -> new ResourceNotFoundException("Material no encontrado con ID: " + id));
    }

    /**
     * Lista todos los materiales pertenecientes a un taller concreto.
     * 
     * @param idTaller ID del taller a consultar.
     * @return Lista de materiales del taller.
     */
    @Transactional(readOnly = true)
    public List<MaterialResponseDTO> listarPorTaller(Long idTaller) {
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
     * @throws ResourceNotFoundException Si el material o el nuevo taller no
     *                                   existen.
     */
    @Transactional
    public MaterialResponseDTO actualizar(Long id, MaterialRequestDTO dto) {
        Material existente = materialRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "No se puede actualizar: Material no encontrado con ID: " + id));

        existente.setTitulo(dto.getTitulo());
        existente.setContenido(dto.getContenido());

        if (!existente.getTaller().getId().equals(dto.getIdTaller())) {
            Taller nuevoTaller = tallerRepository.findById(dto.getIdTaller())
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "No se puede actualizar: Nuevo taller no encontrado con ID: " + dto.getIdTaller()));
            existente.setTaller(nuevoTaller);
        }

        return materialMapper.toResponse(materialRepository.save(existente));
    }

    /**
     * Alterna el estado de visibilidad de un material.
     * Permite a los profesores ocultar o mostrar recursos de forma dinámica
     * * @param id ID del material a modificar.
     * 
     * @return Material con el nuevo estado de visibilidad persistido.
     * @throws ResourceNotFoundException Si el material no existe.
     */
    @Transactional
    public MaterialResponseDTO cambiarVisibilidad(Long id) {
        Material material = materialRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "No se puede cambiar visibilidad: Material no encontrado con ID: " + id));

        material.setVisible(!material.isVisible());
        return materialMapper.toResponse(materialRepository.save(material));
    }

    // --- MÉTODOS DELETE ---

    /**
     * Elimina un material del sistema.
     * 
     * @param id ID del material a borrar.
     * @throws ResourceNotFoundException Si el material no existe.
     */

    @Transactional
    public void eliminar(Long id) {
        Material material = materialRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Material no encontrado"));

        List<String> nombresArchivos = material.getArchivos().stream()
                .map(ArchivoMaterial::getNombre)
                .toList();

        
        materialRepository.delete(material);

        nombresArchivos.forEach(nombre -> fileUtil.eliminar("materiales", nombre, false));
    }
}