package com.mlg.taller.service;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

import java.util.Optional;
import java.util.List;
import java.util.Arrays;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockedStatic;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;

import com.mlg.taller.model.entities.Taller;
import com.mlg.taller.model.entities.Usuario;
import com.mlg.taller.model.entities.Rol;
import com.mlg.taller.model.dtos.TallerRequestDTO;
import com.mlg.taller.model.dtos.TallerResponseDTO;
import com.mlg.taller.repositories.TallerRepository;
import com.mlg.taller.repositories.UsuarioRepository;
import com.mlg.taller.model.mappers.TallerMapper;
import com.mlg.taller.service.validators.TallerValidator;
import com.mlg.taller.util.FileUtil;
import com.mlg.taller.util.SecurityUtils;
import com.mlg.taller.exception.ResourceNotFoundException;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
public class TallerServiceTest {

    @Mock private TallerRepository tallerRepository;
    @Mock private UsuarioRepository usuarioRepository;
    @Mock private TallerValidator tallerValidator;
    @Mock private TallerMapper tallerMapper;
    @Mock private FileUtil fileUtil;

    @InjectMocks
    private TallerService tallerService;

    private Usuario crearAdminMock() {
        Rol rol = new Rol();
        rol.setNombre("ADMIN");
        Usuario admin = new Usuario();
        admin.setRol(rol);
        return admin;
    }

    @Test
    @DisplayName("PR-TAL-01: Crear taller con éxito (Solo ADMIN)")
    void testCrearTallerExito() {
        Usuario admin = crearAdminMock();
        try (MockedStatic<SecurityUtils> mockedSecurity = mockStatic(SecurityUtils.class)) {
            mockedSecurity.when(SecurityUtils::getUsuarioAutenticado).thenReturn(admin);

            TallerRequestDTO dto = new TallerRequestDTO();
            dto.setNombre("Nuevo Taller");
            Taller taller = new Taller();
            taller.setId(10L);

            when(tallerMapper.toEntity(any())).thenReturn(taller);
            when(tallerRepository.save(any())).thenReturn(taller);
            when(tallerMapper.toResponse(any())).thenReturn(new TallerResponseDTO());

            TallerResponseDTO result = tallerService.crear(dto, null);

            assertNotNull(result);
            verify(tallerRepository, atLeastOnce()).save(any());
        }
    }

    @Test
    @DisplayName("PR-TAL-02: Listar toda la oferta formativa")
    void testListarTodos() {
        when(tallerRepository.findAll()).thenReturn(Arrays.asList(new Taller(), new Taller()));
        when(tallerMapper.toResponse(any())).thenReturn(new TallerResponseDTO());

        List<TallerResponseDTO> result = tallerService.listarTodos();

        assertEquals(2, result.size());
    }

    @Test
    @DisplayName("PR-TAL-03: Buscar taller por ID inexistente (Error)")
    void testBuscarPorIdFalla() {
        when(tallerRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> tallerService.buscarPorId(99L));
    }

    @Test
    @DisplayName("PR-TAL-04: Eliminar taller y su imagen")
    void testEliminarTaller() {
        Usuario admin = crearAdminMock();
        try (MockedStatic<SecurityUtils> mockedSecurity = mockStatic(SecurityUtils.class)) {
            mockedSecurity.when(SecurityUtils::getUsuarioAutenticado).thenReturn(admin);

            Taller taller = new Taller();
            taller.setId(1L);
            taller.setFotoRuta("imagen.jpg");

            when(tallerRepository.findById(1L)).thenReturn(Optional.of(taller));

            tallerService.eliminar(1L);

            verify(fileUtil).eliminar(eq("talleres"), eq("imagen.jpg"), anyBoolean());
            verify(tallerRepository).delete(taller);
        }
    }

    @Test
    @DisplayName("PR-TAL-05: Listar talleres asignados a un profesor")
    void testListarPorProfesor() {
        Usuario admin = crearAdminMock();
        try (MockedStatic<SecurityUtils> mockedSecurity = mockStatic(SecurityUtils.class)) {
            mockedSecurity.when(SecurityUtils::getUsuarioAutenticado).thenReturn(admin);

            when(tallerRepository.findByProfesorId(1L)).thenReturn(List.of(new Taller()));
            when(tallerMapper.toResponse(any())).thenReturn(new TallerResponseDTO());

            List<TallerResponseDTO> result = tallerService.listarTalleresPorProfesorId(1L);

            assertEquals(1, result.size());
        }
    }
}