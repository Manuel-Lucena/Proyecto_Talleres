package com.mlg.taller.service;

import com.mlg.taller.exception.*;
import com.mlg.taller.model.dtos.*;
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

/**
 * Servicio encargado de la gestión de usuarios, autenticación y seguridad.
 * Centraliza las operaciones de registro, login y mantenimiento de perfiles.
 */
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
     * Autentica un usuario y genera un token de acceso.
     * @param dto Credenciales de acceso (email y password).
     * @return AuthResponseDTO con el token JWT e información básica del perfil.
     */
    public AuthResponseDTO login(LoginRequestDTO dto) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(dto.getEmail(), dto.getPassword()));

        Usuario usuario = usuarioRepository.findByEmail(dto.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado con email: " + dto.getEmail()));

        return mapearAuthResponse(usuario);
    }

    /**
     * Registra un nuevo usuario, asigna su rol, cifra la contraseña y gestiona su imagen de perfil.
     * @param dto Datos del nuevo usuario.
     * @param archivo Imagen opcional de perfil.
     * @return AuthResponseDTO con token de acceso tras el registro exitoso.
     */
    @Transactional
    public AuthResponseDTO registrar(UsuarioRequestDTO dto, MultipartFile archivo) {
        validarEmailUnico(dto.getEmail());

        Usuario usuario = usuarioMapper.toEntity(dto);
        usuario.setRol(obtenerRol(dto.getIdRol()));
        usuario.setPassword(passwordEncoder.encode(dto.getPassword()));
        usuario.setActivo(true);

        usuario = usuarioRepository.save(usuario);
        gestionarImagenPerfil(usuario, archivo);

        return mapearAuthResponse(usuario);
    }


    /**
     * Busca un usuario por su ID.
     * @param id Identificador único.
     * @return DTO del usuario encontrado.
     * @throws ResourceNotFoundException si no existe.
     */
    @Transactional(readOnly = true)
    public UsuarioResponseDTO buscarPorId(Long id) {
        return usuarioRepository.findById(id)
                .map(usuarioMapper::toResponse)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado con ID: " + id));
    }

    /**
     * Busca un usuario por su correo electrónico.
     * @param email Correo a buscar.
     * @return DTO del usuario encontrado.
     * @throws ResourceNotFoundException si no existe.
     */
    @Transactional(readOnly = true)
    public UsuarioResponseDTO buscarPorEmail(String email) {
        return usuarioRepository.findByEmail(email)
                .map(usuarioMapper::toResponse)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado con email: " + email));
    }

    /**
     * Actualiza los datos de un usuario existente, incluyendo validaciones de seguridad y gestión de archivos.
     * @param id Identificador del usuario a modificar.
     * @param dto Nuevos datos.
     * @param archivo Nueva imagen opcional.
     * @return UsuarioResponseDTO actualizado con un nuevo token JWT.
     */
    @Transactional
    public UsuarioResponseDTO actualizar(Long id, UsuarioRequestDTO dto, MultipartFile archivo) {
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado con ID: " + id));

        validarCambioDatosUnicos(dto, usuario);
        usuarioMapper.updateEntityFromDto(dto, usuario);

        if (dto.getPassword() != null && !dto.getPassword().isBlank()) {
            usuario.setPassword(passwordEncoder.encode(dto.getPassword()));
        }

        if (dto.getIdRol() != null) {
            usuario.setRol(obtenerRol(dto.getIdRol()));
        }

        gestionarImagenPerfil(usuario, archivo);
        Usuario usuarioGuardado = usuarioRepository.save(usuario);

        UsuarioResponseDTO response = usuarioMapper.toResponse(usuarioGuardado);
        response.setToken(jwtService.generateToken(usuarioGuardado));
        return response;
    }

    // --- MÉTODOS PRIVADOS DE APOYO (REFACTORIZACIÓN) ---

    private Rol obtenerRol(Long idRol) {
        return rolRepository.findById(idRol)
                .orElseThrow(() -> new ResourceNotFoundException("Rol no encontrado con ID: " + idRol));
    }

    private void validarEmailUnico(String email) {
        if (usuarioRepository.existsByEmail(email)) {
            throw new DuplicateResourceException("El email " + email + " ya está registrado");
        }
    }

    private void validarCambioDatosUnicos(UsuarioRequestDTO dto, Usuario existente) {
        if (dto.getEmail() != null && !existente.getEmail().equalsIgnoreCase(dto.getEmail())) {
            validarEmailUnico(dto.getEmail());
        }
        if (dto.getDni() != null && !existente.getDni().equalsIgnoreCase(dto.getDni())) {
            if (usuarioRepository.existsByDni(dto.getDni())) {
                throw new DuplicateResourceException("El DNI ya pertenece a otro usuario");
            }
        }
    }

    private void gestionarImagenPerfil(Usuario usuario, MultipartFile archivo) {
        if (archivo != null && !archivo.isEmpty()) {
            String nombreImagen = "user_" + usuario.getId() + ".jpg";
            fileUtil.guardar(archivo, "Usuarios", nombreImagen);
            usuario.setFotoPerfilRuta(nombreImagen);
        }
    }

    private AuthResponseDTO mapearAuthResponse(Usuario usuario) {
        AuthResponseDTO response = new AuthResponseDTO();
        response.setToken(jwtService.generateToken(usuario));
        response.setNombre(usuario.getNombre());
        if (usuario.getRol() != null) response.setRol(usuario.getRol().getNombre());
        return response;
    }

    // Métodos estándar (Listar, Eliminar...)
    @Transactional(readOnly = true)
    public List<UsuarioResponseDTO> listarTodos() {
        return usuarioRepository.findAll().stream()
                .map(usuarioMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public void eliminar(Long id) {
        if (!usuarioRepository.existsById(id)) {
            throw new ResourceNotFoundException("No existe el usuario con ID: " + id);
        }
        usuarioRepository.deleteById(id);
    }
}