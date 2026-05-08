package com.mlg.taller.service;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

import java.util.Optional;
import java.util.List;
import java.util.Collections;
import java.util.Map;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockedStatic;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;

import com.mlg.taller.model.entities.Inscripcion;
import com.mlg.taller.model.entities.Taller;
import com.mlg.taller.model.entities.Usuario;
import com.mlg.taller.model.entities.Rol;
import com.mlg.taller.model.dtos.InscripcionRequestDTO;
import com.mlg.taller.model.dtos.InscripcionResponseDTO;
import com.mlg.taller.repositories.InscripcionRepository;
import com.mlg.taller.repositories.TallerRepository;
import com.mlg.taller.repositories.UsuarioRepository;
import com.mlg.taller.model.mappers.InscripcionMapper;
import com.mlg.taller.service.validators.InscripcionValidator;
import com.mlg.taller.exception.BadRequestException;
import com.mlg.taller.util.SecurityUtils;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
public class InscripcionServiceTest {

    @Mock private InscripcionRepository inscripcionRepository;
    @Mock private TallerRepository tallerRepository;
    @Mock private UsuarioRepository usuarioRepository;
    @Mock private InscripcionValidator inscripcionValidator;
    @Mock private InscripcionMapper inscripcionMapper;
    @Mock private EmailService emailService;
    @Mock private PdfService pdfService;

    @InjectMocks
    private InscripcionService inscripcionService;

    private Usuario crearUsuarioMock(Long id, String email, String nombreRol) {
        Rol rol = new Rol();
        rol.setId(1L);
        rol.setNombre(nombreRol);
        
        Usuario user = new Usuario();
        user.setId(id);
        user.setEmail(email);
        user.setRol(rol);
        return user;
    }

    @Test
    @DisplayName("PR-INS-01: Inscribir nuevo alumno (Flujo Completo)")
    void testInscribirExito() {
        Usuario admin = crearUsuarioMock(99L, "admin@test.com", "ADMIN");

        try (MockedStatic<SecurityUtils> mockedSecurity = mockStatic(SecurityUtils.class)) {
            mockedSecurity.when(SecurityUtils::getUsuarioAutenticado).thenReturn(admin);

            // GIVEN
            InscripcionRequestDTO dto = new InscripcionRequestDTO();
            dto.setIdUsuario(1L);
            dto.setIdTaller(1L);

            Usuario user = crearUsuarioMock(1L, "alumno@test.com", "ALUMNO");
            Taller taller = new Taller();
            taller.setId(1L);
            taller.setNombre("Java");
            
            Inscripcion inscripcion = new Inscripcion();
            
            when(usuarioRepository.findById(1L)).thenReturn(Optional.of(user));
            when(tallerRepository.findById(1L)).thenReturn(Optional.of(taller));
            when(inscripcionRepository.findByUsuarioIdAndTallerId(1L, 1L)).thenReturn(Optional.empty());
            when(inscripcionMapper.toEntity(any(), any(), any())).thenReturn(inscripcion);
            when(inscripcionRepository.save(any())).thenReturn(inscripcion);
            when(inscripcionMapper.toResponse(any())).thenReturn(new InscripcionResponseDTO());
            when(pdfService.generarBytesPdf(anyString(), anyMap())).thenReturn(new byte[0]);

            InscripcionResponseDTO result = inscripcionService.inscribir(dto);

            assertNotNull(result);
            verify(emailService).enviarCorreoConAdjunto(any(), any(), any(), any(), any(), any());
        }
    }

    @Test
    @DisplayName("PR-INS-02: Error al inscribir en taller ya activo")
    void testInscribirDuplicado() {
        Usuario admin = crearUsuarioMock(99L, "admin@test.com", "ADMIN");

        try (MockedStatic<SecurityUtils> mockedSecurity = mockStatic(SecurityUtils.class)) {
            mockedSecurity.when(SecurityUtils::getUsuarioAutenticado).thenReturn(admin);

            InscripcionRequestDTO dto = new InscripcionRequestDTO();
            dto.setIdUsuario(1L); dto.setIdTaller(1L);
            
            Usuario user = crearUsuarioMock(1L, "test@test.com", "ALUMNO");
            Taller taller = new Taller(); taller.setId(1L);
            Inscripcion existente = new Inscripcion(); existente.setActiva(true);

            when(usuarioRepository.findById(1L)).thenReturn(Optional.of(user));
            when(tallerRepository.findById(1L)).thenReturn(Optional.of(taller));
            when(inscripcionRepository.findByUsuarioIdAndTallerId(1L, 1L)).thenReturn(Optional.of(existente));

            assertThrows(BadRequestException.class, () -> inscripcionService.inscribir(dto));
        }
    }

    @Test
    @DisplayName("PR-INS-03: Validar solapamiento de horarios (Sin conflicto)")
    void testSolapamientoNoHayConflicto() {
        Usuario admin = crearUsuarioMock(99L, "admin@test.com", "ADMIN");

        try (MockedStatic<SecurityUtils> mockedSecurity = mockStatic(SecurityUtils.class)) {
            mockedSecurity.when(SecurityUtils::getUsuarioAutenticado).thenReturn(admin);

            when(tallerRepository.findById(1L)).thenReturn(Optional.of(new Taller()));
            when(inscripcionRepository.findByUsuarioId(1L)).thenReturn(Collections.emptyList());

            Map<String, Object> result = inscripcionService.validarSolapamientoHorarios(1L, 1L);

            assertEquals(false, result.get("hayConflicto"));
        }
    }

    @Test
    @DisplayName("PR-INS-04: Cambio de estado (Desactivar/Activar)")
    void testCambiarEstado() {
        Usuario user = crearUsuarioMock(1L, "a@a.com", "ALUMNO");
        Taller taller = new Taller();
        taller.setNombre("Test");
        Inscripcion i = new Inscripcion(); 
        i.setActiva(true); 
        i.setUsuario(user); 
        i.setTaller(taller);

        when(inscripcionRepository.findByIdIncludingInactive(1L)).thenReturn(Optional.of(i));
        when(inscripcionRepository.save(any())).thenReturn(i);

        inscripcionService.cambiarEstado(1L);

        assertFalse(i.isActiva());
        verify(emailService).enviarCorreo(any(), any(), any(), any());
    }

    @Test
    @DisplayName("PR-INS-05: Inscribir Masivo")
    void testInscribirMasivo() {
        InscripcionRequestDTO dto = new InscripcionRequestDTO();
        dto.setEmailUsuario("test@test.com"); dto.setIdTaller(1L);
        
        Usuario user = crearUsuarioMock(1L, "test@test.com", "ALUMNO");
        Taller taller = new Taller();

        when(usuarioRepository.findByEmail(anyString())).thenReturn(Optional.of(user));
        when(tallerRepository.findById(anyLong())).thenReturn(Optional.of(taller));
        when(inscripcionMapper.toEntity(any(), any(), any())).thenReturn(new Inscripcion());
        when(inscripcionRepository.save(any())).thenReturn(new Inscripcion());

        List<InscripcionResponseDTO> list = inscripcionService.inscribirMasivo(List.of(dto));

        assertEquals(1, list.size());
    }
}