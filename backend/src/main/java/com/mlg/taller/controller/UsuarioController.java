package com.mlg.taller.controller;

import com.mlg.taller.model.dtos.AuthResponseDTO;
import com.mlg.taller.model.dtos.LoginRequestDTO;
import com.mlg.taller.model.dtos.UsuarioRequestDTO;
import com.mlg.taller.model.dtos.UsuarioResponseDTO;
import com.mlg.taller.service.UsuarioService;
import com.mlg.taller.util.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

/**
 * Controlador REST para la gestión de usuarios y autenticación.
 * Proporciona endpoints para el registro, login y operaciones CRUD de usuarios.
 */
@RestController
@RequestMapping("/api/usuarios")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:4200")
public class UsuarioController {

    private final UsuarioService usuarioService;

    /**
     * Obtiene el listado completo de usuarios registrados.
     * @return ApiResponse con la lista de UsuarioResponseDTO.
     */
    @GetMapping
    public ApiResponse<List<UsuarioResponseDTO>> listar() {
        List<UsuarioResponseDTO> usuarios = usuarioService.listarTodos();
        return ApiResponse.success(usuarios, "Listado de usuarios obtenido correctamente");
    }

    /**
     * Busca un usuario específico mediante su dirección de correo electrónico.
     * @param email Correo electrónico del usuario.
     * @return ApiResponse con los datos del usuario encontrado.
     */
    @GetMapping("/email/{email}")
    public ApiResponse<UsuarioResponseDTO> obtenerPorEmail(@PathVariable String email) {
        return ApiResponse.success(usuarioService.buscarPorEmail(email), "Usuario encontrado");
    }

    /**
     * Recupera la información detallada de un usuario por su identificador único.
     * @param id ID primario del usuario.
     * @return ApiResponse con el DTO del usuario.
     */
    @GetMapping("/{id}")
    public ApiResponse<UsuarioResponseDTO> obtenerPorId(@PathVariable Long id) {
        return ApiResponse.success(usuarioService.buscarPorId(id), "Usuario encontrado");
    }

    /**
     * Registra un nuevo usuario en el sistema gestionando datos y foto de perfil.
     * @param dto Objeto con los datos de registro (Validado).
     * @param archivo Imagen de perfil opcional enviada como parte del formulario.
     * @return ApiResponse con el token JWT y datos básicos tras el registro exitoso.
     */
    @PostMapping(value = "/register", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ApiResponse<AuthResponseDTO> registrar(
            @RequestPart("usuario") @Valid UsuarioRequestDTO dto,
            @RequestPart(value = "archivo", required = false) MultipartFile archivo) {

        return ApiResponse.success(usuarioService.registrar(dto, archivo), "Usuario registrado con éxito");
    }

    /**
     * Autentica a un usuario mediante sus credenciales.
     * @param dto Objeto que contiene email y password.
     * @return ApiResponse con el token JWT generado para la sesión.
     */
    @PostMapping("/login")
    public ApiResponse<AuthResponseDTO> login(@RequestBody LoginRequestDTO dto) {
        AuthResponseDTO response = usuarioService.login(dto);
        return ApiResponse.success(response, "Login correcto");
    }

    /**
     * Actualiza la información de un usuario existente.
     * Permite la actualización parcial de datos y el cambio de imagen de perfil.
     * @param id ID del usuario a modificar.
     * @param dto Datos actualizados del usuario.
     * @param archivo Nueva imagen de perfil (opcional).
     * @return ApiResponse con los datos del usuario tras la actualización.
     */
    @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ApiResponse<UsuarioResponseDTO> actualizar(
            @PathVariable Long id,
            @RequestPart("usuario") @Valid UsuarioRequestDTO dto,
            @RequestPart(value = "archivo", required = false) MultipartFile archivo) {
        return ApiResponse.success(usuarioService.actualizar(id, dto, archivo), "Usuario actualizado");
    }

    /**
     * Realiza el borrado lógico de un usuario en el sistema.
     * @param id ID del usuario a desactivar.
     * @return ApiResponse indicando el éxito de la operación.
     */
    @DeleteMapping("/{id}")
    public ApiResponse<Void> eliminar(@PathVariable Long id) {
        usuarioService.eliminar(id);
        return ApiResponse.success(null, "Usuario desactivado correctamente");
    }
}