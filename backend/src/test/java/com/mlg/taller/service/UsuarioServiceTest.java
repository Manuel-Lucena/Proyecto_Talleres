package com.mlg.taller.service;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

import java.util.Optional;
import java.util.Arrays;
import java.util.List;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;

import com.mlg.taller.model.entities.Usuario;
import com.mlg.taller.model.entities.Rol;
import com.mlg.taller.model.dtos.UsuarioResponseDTO;
import com.mlg.taller.repositories.UsuarioRepository;
import com.mlg.taller.model.mappers.UsuarioMapper;
import com.mlg.taller.exception.ResourceNotFoundException;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
public class UsuarioServiceTest {

    @Mock private UsuarioRepository usuarioRepository;
    @Mock private UsuarioMapper usuarioMapper;

    @InjectMocks
    private UsuarioService usuarioService;

    @Test
    @DisplayName("PR-USU-01: Buscar usuario por email")
    void testBuscarPorEmail() {
        Usuario user = new Usuario();
        user.setEmail("admin@taller.com");
        
        // El service usa buscarPorEmailInterno -> findByEmailAdmin
        when(usuarioRepository.findByEmailAdmin(anyString())).thenReturn(Optional.of(user));
        when(usuarioMapper.toResponse(any())).thenReturn(new UsuarioResponseDTO());

        UsuarioResponseDTO resultado = usuarioService.buscarPorEmail("admin@taller.com");

        assertNotNull(resultado);
    }

    @Test
    @DisplayName("PR-USU-02: Error al buscar email inexistente")
    void testEmailNoEncontrado() {
        when(usuarioRepository.findByEmailAdmin(anyString())).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> {
            usuarioService.buscarPorEmail("noexiste@test.com");
        });
    }

    @Test
    @DisplayName("PR-USU-03: Buscar por ID")
    void testBuscarPorId() {
        Usuario user = new Usuario();
        user.setId(1L);
        

        when(usuarioRepository.findByIdAdmin(anyLong())).thenReturn(Optional.of(user));
        when(usuarioMapper.toResponse(any())).thenReturn(new UsuarioResponseDTO());

        UsuarioResponseDTO resultado = usuarioService.buscarPorId(1L);

        assertNotNull(resultado);
    }

    @Test
    @DisplayName("PR-USU-04: Listado global de usuarios")
    void testListarTodos() {

        Usuario u1 = new Usuario();
        Usuario u2 = new Usuario();
        List<Usuario> listaMock = Arrays.asList(u1, u2);
        

        when(usuarioRepository.findAll()).thenReturn(listaMock);

        when(usuarioMapper.toResponse(any())).thenReturn(new UsuarioResponseDTO());

        List<UsuarioResponseDTO> resultado = usuarioService.listarTodos();

        assertNotNull(resultado);
        assertEquals(2, resultado.size(), "La lista debería tener 2 elementos");
    }

    @Test
    @DisplayName("PR-USU-05: Integridad de Roles")
    void testValidacionRol() {
        Rol rolAdmin = new Rol();
        rolAdmin.setNombre("ADMIN");
        Usuario usuario = new Usuario();
        usuario.setRol(rolAdmin);

        assertEquals("ADMIN", usuario.getRol().getNombre());
    }
}