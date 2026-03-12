package com.mlg.taller.service;

import com.mlg.taller.exception.*;
import com.mlg.taller.model.dtos.AuthResponseDTO;
import com.mlg.taller.model.dtos.LoginRequestDTO;
import com.mlg.taller.model.dtos.UsuarioRequestDTO;
import com.mlg.taller.model.dtos.UsuarioResponseDTO;
import com.mlg.taller.model.entities.Rol;
import com.mlg.taller.model.entities.Usuario;
import com.mlg.taller.model.mappers.UsuarioMapper;
import com.mlg.taller.repositories.RolRepository;
import com.mlg.taller.repositories.UsuarioRepository;
import com.mlg.taller.security.jwt.JwtService;
import com.mlg.taller.util.FileUtil;
import lombok.RequiredArgsConstructor;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UsuarioService {

    private final UsuarioRepository usuarioRepository;
    private final RolRepository rolRepository;
    private final UsuarioMapper usuarioMapper;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final FileUtil fileUtil;

    /**
     * Login de usuario
     */
    public AuthResponseDTO login(LoginRequestDTO dto) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(dto.getEmail(), dto.getPassword()));

        // Cambiado a ResourceNotFoundException
        Usuario usuario = usuarioRepository.findByEmail(dto.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "No existe ningún usuario con el email: " + dto.getEmail()));

        String token = jwtService.generateToken(usuario);

        AuthResponseDTO response = new AuthResponseDTO();
        response.setToken(token);
        response.setNombre(usuario.getNombre());

        if (usuario.getRol() != null) {
            response.setRol(usuario.getRol().getNombre());
        }

        return response;
    }

    /**
     * Registrar usuario con autologin
     */
    @Transactional
    public AuthResponseDTO registrar(UsuarioRequestDTO dto, MultipartFile archivo) {
        // Cambiado a DuplicateResourceException
        if (usuarioRepository.existsByEmail(dto.getEmail())) {
            throw new DuplicateResourceException("El email " + dto.getEmail() + " ya está registrado en el sistema");
        }

        Usuario usuario = usuarioMapper.toEntity(dto);

        // Cambiado a ResourceNotFoundException
        Rol rol = rolRepository.findById(dto.getIdRol())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "El rol seleccionado (ID: " + dto.getIdRol() + ") no existe"));

        usuario.setRol(rol);
        usuario.setPassword(passwordEncoder.encode(dto.getPassword()));
        usuario.setActivo(true);

        usuario = usuarioRepository.save(usuario);

        if (archivo != null && !archivo.isEmpty()) {
            String nombreImagen = "user_" + usuario.getId() + ".jpg";
            fileUtil.guardar(archivo, "usuarios", nombreImagen);
            usuario.setFotoPerfilRuta(nombreImagen);
            usuario = usuarioRepository.save(usuario);
        }

        String token = jwtService.generateToken(usuario);

        AuthResponseDTO response = new AuthResponseDTO();
        response.setToken(token);
        response.setNombre(usuario.getNombre());

        if (usuario.getRol() != null) {
            response.setRol(usuario.getRol().getNombre());
        }

        return response;
    }

    /**
     * Buscar usuario por ID
     */
    @Transactional(readOnly = true)
    public UsuarioResponseDTO buscarPorId(Long id) {
        // Cambiado a ResourceNotFoundException
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario con ID " + id + " no encontrado"));
        return usuarioMapper.toResponse(usuario);
    }

    @Transactional(readOnly = true)
    public UsuarioResponseDTO buscarPorEmail(String email) {
        Usuario usuario = usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario con email " + email + " no encontrado"));
        return usuarioMapper.toResponse(usuario);
    }

    /**
     * Actualizar usuario
     */
    @Transactional
    public UsuarioResponseDTO actualizar(Long id, UsuarioRequestDTO dto, MultipartFile archivo) {
        // Cambiado a ResourceNotFoundException
        Usuario usuarioExistente = usuarioRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "No se puede actualizar: Usuario con ID " + id + " no encontrado"));

        usuarioMapper.updateEntityFromDto(dto, usuarioExistente);

        if (dto.getPassword() != null && !dto.getPassword().isBlank()) {
            usuarioExistente.setPassword(passwordEncoder.encode(dto.getPassword()));
        }

        if (dto.getIdRol() != null) {
            Rol nuevoRol = rolRepository.findById(dto.getIdRol())
                    .orElseThrow(() -> new ResourceNotFoundException("El nuevo rol seleccionado no existe"));
            usuarioExistente.setRol(nuevoRol);
        }

        if (archivo != null && !archivo.isEmpty()) {
            String nombreImagen = "user_" + id + ".jpg";
            fileUtil.guardar(archivo, "usuarios", nombreImagen);
            usuarioExistente.setFotoPerfilRuta(nombreImagen);
        }

        return usuarioMapper.toResponse(usuarioRepository.save(usuarioExistente));
    }

    /**
     * Borrado lógico
     */
    @Transactional
    public void eliminar(Long id) {
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "No se pudo eliminar: El usuario con ID " + id + " no existe"));

        usuarioRepository.delete(usuario);
    }

    @Transactional(readOnly = true)
    public List<UsuarioResponseDTO> listarTodos() {
        return usuarioRepository.findAll().stream()
                .map(usuarioMapper::toResponse)
                .collect(Collectors.toList());
    }
}