package com.mlg.taller.service;

import com.mlg.taller.model.dtos.TallerRequestDTO;
import com.mlg.taller.model.dtos.TallerResponseDTO;
import com.mlg.taller.model.entities.Taller;
import com.mlg.taller.model.entities.Usuario;
import com.mlg.taller.model.mappers.TallerMapper;
import com.mlg.taller.repositories.TallerRepository;
import com.mlg.taller.repositories.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor // Genera el constructor para la inyección de dependencias
public class TallerService {

    private final TallerRepository tallerRepository;
    private final UsuarioRepository usuarioRepository;
    private final TallerMapper tallerMapper;

    @Transactional(readOnly = true)
    public List<TallerResponseDTO> listarTodos() {
        return tallerRepository.findAll()
                .stream()
                .map(tallerMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public TallerResponseDTO buscarPorId(Long id) {
        Taller taller = tallerRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Taller no encontrado con ID: " + id));
        return tallerMapper.toResponse(taller);
    }

    @Transactional
    public TallerResponseDTO crear(TallerRequestDTO dto) {
        // 1. Buscamos al profesor en la DB usando el ID que viene en el DTO
        Usuario profesor = usuarioRepository.findById(dto.getIdProfesor())
                .orElseThrow(() -> new RuntimeException("El profesor asignado no existe"));

        // 2. Convertimos el DTO a Entidad (el Mapper ignora el campo 'profesor')
        Taller taller = tallerMapper.toEntity(dto);

        // 3. Asignamos manualmente el profesor que encontramos
        taller.setProfesor(profesor);

        // 4. Guardamos y devolvemos el Response mapeado
        Taller tallerGuardado = tallerRepository.save(taller);
        return tallerMapper.toResponse(tallerGuardado);
    }

    @Transactional
    public TallerResponseDTO actualizar(Long id, TallerRequestDTO dto) {
        // 1. Buscamos el taller existente
        Taller tallerExistente = tallerRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Taller no encontrado"));

        // 2. Buscamos al profesor
        Usuario profesor = usuarioRepository.findById(dto.getIdProfesor())
                .orElseThrow(() -> new RuntimeException("Profesor no encontrado"));

        // 3. ¡LA MAGIA! MapStruct hace todos los setters por ti
        tallerMapper.updateEntityFromDto(dto, tallerExistente);

        // 4. El profesor lo seguimos seteando a mano porque requiere lógica de búsqueda
        tallerExistente.setProfesor(profesor);

        return tallerMapper.toResponse(tallerRepository.save(tallerExistente));
    }

    @Transactional
    public void eliminar(Long id) {
        // Gracias al @SQLDelete en la entidad, esto hará un borrado lógico (activo =
        // false)
        if (!tallerRepository.existsById(id)) {
            throw new RuntimeException("No se puede eliminar: Taller no encontrado");
        }
        tallerRepository.deleteById(id);
    }
}