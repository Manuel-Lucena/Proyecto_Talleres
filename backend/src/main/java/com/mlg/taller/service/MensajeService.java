package com.mlg.taller.service;

import com.mlg.taller.model.dtos.MensajeRequestDTO;
import com.mlg.taller.model.dtos.MensajeResponseDTO;
import com.mlg.taller.model.entities.Mensaje;
import com.mlg.taller.model.entities.Taller;
import com.mlg.taller.model.entities.Usuario;
import com.mlg.taller.model.mappers.MensajeMapper;
import com.mlg.taller.repositories.MensajeRepository;
import com.mlg.taller.repositories.TallerRepository;
import com.mlg.taller.repositories.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MensajeService {

    private final MensajeRepository mensajeRepository;
    private final TallerRepository tallerRepository;
    private final UsuarioRepository usuarioRepository;
    private final MensajeMapper mensajeMapper;

    @Transactional
    public MensajeResponseDTO enviar(MensajeRequestDTO dto) {
        Taller taller = tallerRepository.findById(dto.getIdTaller())
                .orElseThrow(() -> new RuntimeException("Taller no encontrado"));
        Usuario autor = usuarioRepository.findById(dto.getIdUsuario())
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        Mensaje mensaje = mensajeMapper.toEntity(dto);
        mensaje.setTaller(taller);
        mensaje.setAutor(autor);
        mensaje.setFechaEnvio(LocalDateTime.now());

        return mensajeMapper.toResponse(mensajeRepository.save(mensaje));
    }

    @Transactional(readOnly = true)
    public List<MensajeResponseDTO> listarPorTaller(Long idTaller) {
        return mensajeRepository.findByTallerIdOrderByFechaEnvioAsc(idTaller).stream()
                .map(mensajeMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<MensajeResponseDTO> listarTodos() {
        return mensajeRepository.findAll().stream()
                .map(mensajeMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public void eliminar(Long id) {
        mensajeRepository.deleteById(id);
    }
}