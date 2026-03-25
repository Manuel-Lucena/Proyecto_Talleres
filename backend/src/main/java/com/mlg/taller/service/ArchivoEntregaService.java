package com.mlg.taller.service;

import com.mlg.taller.model.dtos.ArchivoEntregaRequestDTO;
import com.mlg.taller.model.dtos.ArchivoEntregaResponseDTO;
import com.mlg.taller.model.entities.ArchivoEntrega;
import com.mlg.taller.model.entities.Entrega;
import com.mlg.taller.model.mappers.ArchivoEntregaMapper;
import com.mlg.taller.repositories.ArchivoEntregaRepository;
import com.mlg.taller.repositories.EntregaRepository;
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

    @Transactional
    public ArchivoEntregaResponseDTO guardar(ArchivoEntregaRequestDTO dto) {
        Entrega entrega = entregaRepository.findById(dto.getIdEntrega())
                .orElseThrow(() -> new RuntimeException("Entrega no encontrada"));

        ArchivoEntrega archivo = archivoEntregaMapper.toEntity(dto);
        archivo.setEntrega(entrega);

        return archivoEntregaMapper.toResponse(archivoEntregaRepository.save(archivo));
    }

    @Transactional(readOnly = true)
    public List<ArchivoEntregaResponseDTO> listarPorEntrega(Long idEntrega) {
        return archivoEntregaRepository.findByEntregaId(idEntrega).stream()
                .map(archivoEntregaMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ArchivoEntregaResponseDTO buscarPorId(Long id) {
        return archivoEntregaRepository.findById(id)
                .map(archivoEntregaMapper::toResponse)
                .orElseThrow(() -> new RuntimeException("Archivo de entrega no encontrado"));
    }

    @Transactional
    public void eliminar(Long id) {
        archivoEntregaRepository.deleteById(id);
    }
}