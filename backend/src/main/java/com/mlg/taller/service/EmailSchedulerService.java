package com.mlg.taller.service;

import com.mlg.taller.model.entities.Inscripcion;
import com.mlg.taller.repositories.InscripcionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class EmailSchedulerService {

    private final InscripcionRepository inscripcionRepository;
    private final EmailService emailService;

    /**
     * Se ejecuta todos los días a las 09:00 AM.
     * Revisa inscripciones de talleres que empiezan en exactamente 7 días.
     */
    @Scheduled(cron = "0 0 9 * * *") 
    public void enviarRecordatoriosDeInicio() {
        LocalDate proximaSemana = LocalDate.now().plusDays(7);
        
     
        List<Inscripcion> recordatoriosPendientes = inscripcionRepository
                .findAllByTaller_FechaInicioAndActivaTrue(proximaSemana);

        log.info("Iniciando envío de recordatorios para la fecha: {}. Total: {}", 
                 proximaSemana, recordatoriosPendientes.size());

        for (Inscripcion inscripcion : recordatoriosPendientes) {
        
            emailService.enviarCorreo(
                inscripcion.getUsuario().getEmail(),
                "¡Falta una semana! Recordatorio de inicio: " + inscripcion.getTaller().getNombre(),
                "recordatorio-inicio",
                Map.of(
                    "usuario", inscripcion.getUsuario(),
                    "taller", inscripcion.getTaller()
                )
            );
        }
    }
}