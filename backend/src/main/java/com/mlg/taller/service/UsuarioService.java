package com.mlg.taller.service;

import com.mlg.taller.exception.*;
import com.mlg.taller.model.dtos.*;
import com.mlg.taller.model.entities.PasswordResetToken;
import com.mlg.taller.model.entities.Rol;
import com.mlg.taller.model.entities.Usuario;
import com.mlg.taller.model.mappers.UsuarioMapper;
import com.mlg.taller.repositories.PasswordResetTokenRepository;
import com.mlg.taller.repositories.RolRepository;
import com.mlg.taller.repositories.UsuarioRepository;
import com.mlg.taller.security.jwt.JwtService;
import com.mlg.taller.service.validators.UsuarioValidator;
import com.mlg.taller.util.FileUtil;
import com.mlg.taller.util.SecurityUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Servicio encargado de la gestión de usuarios, autenticación y seguridad.
 * Utiliza UsuarioValidator para el blindaje de reglas de negocio.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class UsuarioService {

    private final UsuarioRepository usuarioRepository;
    private final RolRepository rolRepository;
    private final UsuarioValidator usuarioValidator;
    private final UsuarioMapper usuarioMapper;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final FileUtil fileUtil;
    private final PasswordResetTokenRepository tokenRepository;
    private final EmailService emailService;

    private static final String FOLDER = "Usuarios";

    // --- MÉTODOS POST ---

    /**
     * Autentica un usuario y genera un token de acceso JWT.
     *
     * @param dto Credenciales de acceso (email y password).
     * @return Respuesta con el token e información de perfil.
     * @throws ResourceNotFoundException Si el email no existe.
     */
    public AuthResponseDTO login(LoginRequestDTO dto) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(dto.getEmail(), dto.getPassword()));
        Usuario usuario = buscarPorEmailInterno(dto.getEmail());
        return mapearAuthResponse(usuario);
    }

    /**
     * Registra un nuevo usuario en el sistema con cifrado de contraseña y gestión de imagen.
     *
     * @param dto Datos del nuevo usuario.
     * @param archivo Imagen opcional de perfil.
     * @return Respuesta con token de acceso tras registro exitoso.
     * @throws DuplicateResourceException Si el email ya está en uso.
     */
    @Transactional
    public AuthResponseDTO registrar(UsuarioRequestDTO dto, MultipartFile archivo) {
        usuarioValidator.validarEmailUnico(dto.getEmail());
        usuarioValidator.validarDniUnico(dto.getDni());

        Usuario usuario = usuarioMapper.toEntity(dto);
        usuario.setRol(obtenerRolInterno(dto.getIdRol()));
        usuario.setPassword(passwordEncoder.encode(dto.getPassword()));
        usuario.setActivo(true);
        
        usuario = usuarioRepository.save(usuario);
        gestionarImagenPerfilInterno(usuario, archivo);
        
        return mapearAuthResponse(usuario);
    }

    /**
     * Procesa una lista de usuarios para su inserción masiva.
     *
     * @param dtos Lista de datos de usuarios a registrar.
     * @return Lista de usuarios creados mapeados a ResponseDTO.
     * @throws DuplicateResourceException Si algún email o DNI ya existe.
     */
    @Transactional
    public List<UsuarioResponseDTO> registrarMasivo(List<UsuarioRequestDTO> dtos) {
        return dtos.stream().map(dto -> {
            usuarioValidator.validarEmailUnico(dto.getEmail());
            usuarioValidator.validarDniUnico(dto.getDni());

            Usuario usuario = usuarioMapper.toEntity(dto);
            usuario.setRol(obtenerRolInterno(dto.getIdRol()));
            usuario.setPassword(passwordEncoder.encode(dto.getPassword()));
            usuario.setActivo(true);
            return usuarioMapper.toResponse(usuarioRepository.save(usuario));
        }).collect(Collectors.toList());
    }

    // --- MÉTODOS GET ---

    /**
     * Obtiene el listado de todos los usuarios registrados.
     *
     * @return Lista de usuarios.
     */
    @Transactional(readOnly = true)
    public List<UsuarioResponseDTO> listarTodos() {
        return usuarioRepository.findAll().stream()
                .map(usuarioMapper::toResponse)
                .collect(Collectors.toList());
    }

    /**
     * Busca un usuario específico por su identificador.
     *
     * @param id Identificador único.
     * @return Usuario encontrado.
     */
    @Transactional(readOnly = true)
    public UsuarioResponseDTO buscarPorId(Long id) {
        return usuarioMapper.toResponse(buscarPorIdInterno(id));
    }

    /**
     * Busca un usuario por su dirección de correo electrónico.
     *
     * @param email Correo a buscar.
     * @return Usuario encontrado.
     */
    @Transactional(readOnly = true)
    public UsuarioResponseDTO buscarPorEmail(String email) {
        return usuarioMapper.toResponse(buscarPorEmailInterno(email));
    }

    /**
     * Lista todos los participantes inscritos en un taller concreto.
     *
     * @param idTaller ID del taller.
     * @return Lista de alumnos participantes.
     */
    @Transactional(readOnly = true)
    public List<UsuarioResponseDTO> listarPorTaller(Long idTaller) {
        return usuarioRepository.findAllParticipantesByTallerId(idTaller).stream()
                .map(usuarioMapper::toResponse)
                .collect(Collectors.toList());
    }

    /**
     * Obtiene el listado de usuarios que pertenecen a un rol específico.
     *
     * @param idRol ID del rol.
     * @return Lista de usuarios mapeados a DTO.
     */
    @Transactional(readOnly = true)
    public List<UsuarioResponseDTO> listarPorRol(Long idRol) {
        return usuarioRepository.findByRolId(idRol).stream()
                .map(usuarioMapper::toResponse)
                .collect(Collectors.toList());
    }

    // --- MÉTODOS PUT ---

    /**
     * Actualiza el perfil de un usuario con blindaje de seguridad interna.
     *
     * @param id ID del usuario a modificar.
     * @param dto Nuevos datos.
     * @param archivo Nueva imagen opcional.
     * @return Usuario actualizado con nuevo token JWT.
     */
    @Transactional
    public UsuarioResponseDTO actualizar(Long id, UsuarioRequestDTO dto, MultipartFile archivo) {
        Usuario solicitante = SecurityUtils.getUsuarioAutenticado();
        Usuario objetivo = buscarPorIdInterno(id);

        // 🛡️ Delegamos validación de permisos y unicidad al validador
        usuarioValidator.validarPermisosActualizacion(solicitante, objetivo, dto);
        usuarioValidator.validarCambioDatosUnicos(dto, objetivo);

        usuarioMapper.updateEntityFromDto(dto, objetivo);

        // Lógica de negocio: Solo ADMIN cambia roles
        if (dto.getIdRol() != null && solicitante.getRol().getNombre().equalsIgnoreCase("ADMIN")) {
            objetivo.setRol(obtenerRolInterno(dto.getIdRol()));
        }

        if (dto.getPassword() != null && !dto.getPassword().isBlank()) {
            objetivo.setPassword(passwordEncoder.encode(dto.getPassword()));
        }

        gestionarImagenPerfilInterno(objetivo, archivo);
        Usuario guardado = usuarioRepository.save(objetivo);

        UsuarioResponseDTO response = usuarioMapper.toResponse(guardado);
        response.setToken(jwtService.generateToken(guardado));
        return response;
    }

    // --- MÉTODOS DELETE ---

    /**
     * Elimina un usuario y su imagen de perfil del almacenamiento.
     *
     * @param id ID del usuario a borrar.
     */
    @Transactional
    public void eliminar(Long id) {
        Usuario usuario = buscarPorIdInterno(id);
        if (usuario.getFotoPerfilRuta() != null) {
            fileUtil.eliminar(FOLDER, usuario.getFotoPerfilRuta(), true);
        }
        usuarioRepository.delete(usuario);
    }

    // --- MÉTODOS DE RECUPERACIÓN DE CONTRASEÑA ---

    /**
     * Procesa la solicitud de recuperación generando un token y enviando el email.
     *
     * @param dto Contiene el email del usuario.
     */
    @Transactional
    public void solicitarRecuperacion(PasswordResetRequestDTO dto) {
        Usuario usuario = buscarPorEmailInterno(dto.getEmail());
        tokenRepository.deleteByUsuario(usuario);

        String token = UUID.randomUUID().toString();
        PasswordResetToken tokenEntity = PasswordResetToken.builder()
                .token(token)
                .usuario(usuario)
                .fechaExpiracion(LocalDateTime.now().plusMinutes(15))
                .build();

        tokenRepository.save(tokenEntity);
        String urlFront = "http://localhost:4200/reset-password?token=" + token;
        
        emailService.enviarCorreo(usuario.getEmail(), "Restablecer contraseña", "recuperar-password", 
                Map.of("usuario", usuario, "url", urlFront));
    }

    /**
     * Valida el token y actualiza la contraseña del usuario.
     *
     * @param dto Contiene el token y la nueva password.
     */
    @Transactional
    public void cambiarPassword(PasswordChangeRequestDTO dto) {
        PasswordResetToken tokenReal = tokenRepository.findByToken(dto.getToken())
                .orElseThrow(() -> new BadRequestException("Token de recuperación no válido o expirado"));

        if (tokenReal.isExpirado()) {
            tokenRepository.delete(tokenReal);
            throw new BadRequestException("El enlace de recuperación ha caducado.");
        }

        Usuario usuario = tokenReal.getUsuario();
        usuario.setPassword(passwordEncoder.encode(dto.getNuevaPassword()));
        usuarioRepository.save(usuario);
        tokenRepository.delete(tokenReal);
    }

    // --- MÉTODOS PRIVADOS DE APOYO ---

    private Usuario buscarPorIdInterno(Long id) {
        return usuarioRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado con ID: " + id));
    }

    private Usuario buscarPorEmailInterno(String email) {
        return usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado con email: " + email));
    }

    private Rol obtenerRolInterno(Long idRol) {
        return rolRepository.findById(idRol)
                .orElseThrow(() -> new ResourceNotFoundException("Rol no encontrado con ID: " + idRol));
    }

    private void gestionarImagenPerfilInterno(Usuario usuario, MultipartFile archivo) {
        if (archivo != null && !archivo.isEmpty()) {
            String nombreImagen = "user_" + usuario.getId() + ".jpg";
            fileUtil.guardar(archivo, FOLDER, nombreImagen, true);
            usuario.setFotoPerfilRuta(nombreImagen);
        }
    }

    private AuthResponseDTO mapearAuthResponse(Usuario usuario) {
        AuthResponseDTO response = new AuthResponseDTO();
        response.setToken(jwtService.generateToken(usuario));
        response.setNombre(usuario.getNombre());
        if (usuario.getRol() != null) {
            response.setRol(usuario.getRol().getNombre());
        }
        return response;
    }
}