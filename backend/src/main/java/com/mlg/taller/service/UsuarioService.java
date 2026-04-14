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

        Usuario usuario = usuarioRepository.findByEmail(dto.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado con email: " + dto.getEmail()));

        return mapearAuthResponse(usuario);
    }

    /**
     * Registra un nuevo usuario en el sistema con cifrado de contraseña y gestión
     * de imagen.
     * 
     * @param dto     Datos del nuevo usuario.
     * @param archivo Imagen opcional de perfil.
     * @return Respuesta con token de acceso tras registro exitoso.
     * @throws DuplicateResourceException Si el email ya está en uso.
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
     * Procesa una lista de usuarios para su inserción masiva.
     * * @param dtos Lista de datos de usuarios a registrar.
     * 
     * @return Lista de usuarios creados mapeados a ResponseDTO.
     */
    @Transactional
    public List<UsuarioResponseDTO> registrarMasivo(List<UsuarioRequestDTO> dtos) {
        return dtos.stream().map(dto -> {
            validarEmailUnico(dto.getEmail());
            if (usuarioRepository.existsByDni(dto.getDni())) {
                throw new DuplicateResourceException("El DNI " + dto.getDni() + " ya está registrado");
            }

            Usuario usuario = usuarioMapper.toEntity(dto);
            usuario.setId(null);

            usuario.setRol(obtenerRol(dto.getIdRol()));
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
     * @throws ResourceNotFoundException Si el ID no existe.
     */
    @Transactional(readOnly = true)
    public UsuarioResponseDTO buscarPorId(Long id) {
        return usuarioRepository.findById(id)
                .map(usuarioMapper::toResponse)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado con ID: " + id));
    }

    /**
     * Busca un usuario por su dirección de correo electrónico.
     * 
     * @param email Correo a buscar.
     * @return Usuario encontrado.
     * @throws ResourceNotFoundException Si el email no existe.
     */
    @Transactional(readOnly = true)
    public UsuarioResponseDTO buscarPorEmail(String email) {
        return usuarioRepository.findByEmail(email)
                .map(usuarioMapper::toResponse)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado con email: " + email));
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
     * @param idRol ID del rol (Ej: 2 para Profesores).
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
     * Actualiza el perfil de un usuario, validando cambios en datos únicos y
     * regenerando el token.
     * 
     * @param id      ID del usuario a modificar.
     * @param dto     Nuevos datos.
     * @param archivo Nueva imagen opcional.
     * @return Usuario actualizado con nuevo token JWT.
     * @throws ResourceNotFoundException Si el usuario no existe.
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

    // --- MÉTODOS DELETE ---

    /**
     * Elimina un usuario y su imagen de perfil del almacenamiento.
     * 
     * @param id ID del usuario a borrar.
     * @throws ResourceNotFoundException Si el usuario no existe.
     */
    @Transactional
    public void eliminar(Long id) {
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "No se puede eliminar: Usuario no encontrado con ID: " + id));

        if (usuario.getFotoPerfilRuta() != null) {
            fileUtil.eliminar(FOLDER, usuario.getFotoPerfilRuta(), true);
        }

        usuarioRepository.delete(usuario);
    }

    // --- MÉTODOS PRIVADOS ---

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

    // --- MÉTODOS DE RECUPERACIÓN DE CONTRASEÑA ---

    /**
     * Procesa la solicitud de recuperación generando un token y enviando el email.
     * * @param dto Contiene el email del usuario que solicita el cambio.
     * 
     * @throws ResourceNotFoundException Si el email no está registrado.
     */
    @Transactional
    public void solicitarRecuperacion(PasswordResetRequestDTO dto) {
        Usuario usuario = usuarioRepository.findByEmail(dto.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "No se encontró un usuario con el email: " + dto.getEmail()));

        tokenRepository.deleteByUsuario(usuario);

      
        String token = java.util.UUID.randomUUID().toString();

     
        PasswordResetToken tokenEntity = PasswordResetToken.builder()
                .token(token)
                .usuario(usuario)
                .fechaExpiracion(java.time.LocalDateTime.now().plusMinutes(15)) // 15 minutos de validez
                .build();

        tokenRepository.save(tokenEntity);

        String urlFront = "http://localhost:4200/reset-password?token=" + token;

 
        emailService.enviarCorreo(usuario.getEmail(), "Restablecer contraseña - MLG Taller", "recuperar-password",
                java.util.Map.of("usuario", usuario, "url", urlFront));
    }

    /**
     * Valida el token y actualiza la contraseña del usuario en el sistema.
     * * @param dto Contiene el token de validación y la nueva password.
     * 
     * @throws BadRequestException Si el token es inválido o ha expirado.
     */
    @Transactional
    public void cambiarPassword(PasswordChangeRequestDTO dto) {
        PasswordResetToken tokenReal = tokenRepository.findByToken(dto.getToken())
                .orElseThrow(() -> new BadRequestException("El token de recuperación no es válido o ha expirado"));

        if (tokenReal.isExpirado()) {
            tokenRepository.delete(tokenReal);
            throw new BadRequestException("El enlace de recuperación ha caducado. Solicite uno nuevo.");
        }

        Usuario usuario = tokenReal.getUsuario();
        usuario.setPassword(passwordEncoder.encode(dto.getNuevaPassword()));

        usuarioRepository.save(usuario);

        tokenRepository.delete(tokenReal);
    }
}