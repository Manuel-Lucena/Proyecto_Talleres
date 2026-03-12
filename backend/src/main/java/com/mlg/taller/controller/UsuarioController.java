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

@RestController
@RequestMapping("/api/usuarios")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:4200")
public class UsuarioController {

    private final UsuarioService usuarioService;

    // 1. GET - Listar todos los usuarios
    @GetMapping
    public ApiResponse<List<UsuarioResponseDTO>> listar() {
        List<UsuarioResponseDTO> usuarios = usuarioService.listarTodos();
        return ApiResponse.success(usuarios, "Listado de usuarios obtenido correctamente");
    }

    @GetMapping("/email/{email}")
    public ApiResponse<UsuarioResponseDTO> obtenerPorEmail(@PathVariable String email) {
        return ApiResponse.success(usuarioService.buscarPorEmail(email), "Usuario encontrado");
    }

    // 2. GET - Obtener un usuario por ID
    @GetMapping("/{id}")
    public ApiResponse<UsuarioResponseDTO> obtenerPorId(@PathVariable Long id) {
        return ApiResponse.success(usuarioService.buscarPorId(id), "Usuario encontrado");
    }

    // 3. POST - Registrar un nuevo usuario
    @PostMapping(value = "/register", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ApiResponse<AuthResponseDTO> registrar(
            @RequestPart("usuario") @Valid UsuarioRequestDTO dto,
            @RequestPart(value = "archivo", required = false) MultipartFile archivo) {

        return ApiResponse.success(usuarioService.registrar(dto, archivo), "Usuario registrado con éxito");
    }

    @PostMapping("/login")
    public ApiResponse<AuthResponseDTO> login(@RequestBody LoginRequestDTO dto) {
        AuthResponseDTO response = usuarioService.login(dto);
        return ApiResponse.success(response, "Login correcto");
    }

    // 4. PUT - Actualizar datos del usuario
    @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ApiResponse<UsuarioResponseDTO> actualizar(
            @PathVariable Long id,
            @RequestPart("usuario") @Valid UsuarioRequestDTO dto,
            @RequestPart(value = "archivo", required = false) MultipartFile archivo) {
        return ApiResponse.success(usuarioService.actualizar(id, dto, archivo), "Usuario actualizado");
    }

    // 5. DELETE - Borrado lógico (activo = false)
    @DeleteMapping("/{id}")
    public ApiResponse<Void> eliminar(@PathVariable Long id) {
        usuarioService.eliminar(id);
        return ApiResponse.success(null, "Usuario desactivado correctamente");
    }
}