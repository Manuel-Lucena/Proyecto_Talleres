package com.mlg.taller.service;

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

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ArchivoEntregaService {

    private final ArchivoEntregaRepository archivoEntregaRepository;
    private final EntregaRepository entregaRepository;
    private final ArchivoEntregaMapper archivoEntregaMapper;
    private final FileUtil fileUtil;

    @Transactional
    public ArchivoEntregaResponseDTO guardar(ArchivoEntregaRequestDTO dto, org.springframework.web.multipart.MultipartFile file) {
        Entrega entrega = entregaRepository.findById(dto.getIdEntrega())
                .orElseThrow(() -> new RuntimeException("Entrega no encontrada"));

        String nombreOriginal = file.getOriginalFilename();
        String extension = nombreOriginal.substring(nombreOriginal.lastIndexOf(".") + 1).toLowerCase();

        // Validación de extensiones de la tarea
        String permitidas = entrega.getTarea().getExtensionesPermitidas();
        if (permitidas != null && !permitidas.isEmpty()) {
            if (!permitidas.toLowerCase().contains("." + extension)) {
                throw new RuntimeException("Extensión ." + extension + " no permitida.");
            }
        }

        String nombreFisico = System.currentTimeMillis() + "_" + nombreOriginal;
        fileUtil.guardar(file, "entregas", nombreFisico, false);

        ArchivoEntrega archivo = archivoEntregaMapper.toEntity(dto);
        archivo.setEntrega(entrega);
        archivo.setNombre(nombreOriginal);
        archivo.setRutaArchivo("entregas/" + nombreFisico);
        archivo.setExtension(extension);

        return archivoEntregaMapper.toResponse(archivoEntregaRepository.save(archivo));
    }

    @Transactional
    public void eliminar(Long id) {
        ArchivoEntrega archivo = archivoEntregaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Archivo de entrega no encontrado"));

        String[] partes = archivo.getRutaArchivo().split("/");
        if (partes.length == 2) {
            fileUtil.eliminar(partes[0], partes[1], false);
        }

        archivoEntregaRepository.delete(archivo);
    }

    /**
     * Recupera la información de un archivo de entrega específico.
     * Es fundamental para que el controlador de descargas pueda obtener la ruta física.
     */
    @Transactional(readOnly = true)
    public ArchivoEntregaResponseDTO buscarPorId(Long id) {
        return archivoEntregaRepository.findById(id)
                .map(archivoEntregaMapper::toResponse)
                .orElseThrow(() -> new RuntimeException("Archivo de entrega no encontrado con ID: " + id));
    }

    @Transactional(readOnly = true)
    public List<ArchivoEntregaResponseDTO> listarPorEntrega(Long idEntrega) {
        return archivoEntregaRepository.findByEntregaId(idEntrega).stream()
                .map(archivoEntregaMapper::toResponse)
                .collect(Collectors.toList());
    }
}