package com.mlg.taller.service;

import com.mlg.taller.model.dtos.HorarioRequestDTO;
import com.mlg.taller.model.dtos.HorarioResponseDTO;
import com.mlg.taller.model.entities.Horario;
import com.mlg.taller.model.entities.Taller;
import com.mlg.taller.model.mappers.HorarioMapper;
import com.mlg.taller.repositories.HorarioRepository;
import com.mlg.taller.repositories.TallerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class HorarioService {

    private final HorarioRepository horarioRepository;
    private final TallerRepository tallerRepository;
    private final HorarioMapper horarioMapper;

    @Transactional
    public HorarioResponseDTO crear(HorarioRequestDTO dto) {
        Taller taller = tallerRepository.findById(dto.getIdTaller())
                .orElseThrow(() -> new RuntimeException("Taller no encontrado"));

        Horario horario = horarioMapper.toEntity(dto);
        horario.setTaller(taller);

        return horarioMapper.toResponse(horarioRepository.save(horario));
    }

    @Transactional(readOnly = true)
    public List<HorarioResponseDTO> listarPorTaller(Long idTaller) {
        return horarioRepository.findByTallerId(idTaller).stream()
                .map(horarioMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<HorarioResponseDTO> listarTodos() {
        return horarioRepository.findAll().stream()
                .map(horarioMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public HorarioResponseDTO actualizar(Long id, HorarioRequestDTO dto) {
        Horario h = horarioRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Horario no encontrado"));
        
        h.setDiaSemana(dto.getDiaSemana());
        h.setHoraInicio(dto.getHoraInicio());
        h.setHoraFin(dto.getHoraFin());
        
        return horarioMapper.toResponse(horarioRepository.save(h));
    }

    @Transactional
    public void eliminar(Long id) {
        horarioRepository.deleteById(id);
    }
}