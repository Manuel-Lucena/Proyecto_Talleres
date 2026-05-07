package com.mlg.taller.controller;

import com.mlg.taller.exception.BadRequestException;
import com.mlg.taller.exception.ResourceNotFoundException;
import com.mlg.taller.service.ArchivoMaterialService;
import com.mlg.taller.service.ArchivoTareaService;
import com.mlg.taller.service.ArchivoEntregaService;
import com.mlg.taller.util.FileUtil;
import lombok.RequiredArgsConstructor;
import lombok.SneakyThrows;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.nio.file.Path;

/**
 * Controlador encargado de la gestión de descargas de archivos del sistema.
 * Proporciona endpoints para obtener recursos de materiales, tareas y entregas
 * de forma segura desde el almacenamiento del servidor.
 */
@RestController
@RequestMapping("/api/descargas")
@RequiredArgsConstructor
public class ArchivoDescargaController {

    private final FileUtil fileUtil;
    private final ArchivoMaterialService archivoMaterialService;
    private final ArchivoTareaService archivoTareaService;
    private final ArchivoEntregaService archivoEntregaService;

    // --- MÉTODOS GET ---

    /**
     * Gestiona la descarga de un archivo de material didáctico.
     * @param id Identificador único del registro de archivo de material.
     * @return   ResponseEntity con el recurso binario del archivo.
     */
    @GetMapping("/material/{id}")
    public ResponseEntity<Resource> descargarMaterial(@PathVariable Long id) {
        var dto = archivoMaterialService.buscarPorId(id);
        return servirArchivo(dto.getRutaArchivo(), dto.getNombre());
    }

    /**
     * Gestiona la descarga de un archivo adjunto a una tarea.
     * @param id Identificador único del registro de archivo de tarea.
     * @return   ResponseEntity con el recurso binario del archivo.
     */
    @GetMapping("/tarea/{id}")
    public ResponseEntity<Resource> descargarTarea(@PathVariable Long id) {
        var dto = archivoTareaService.buscarPorId(id);
        return servirArchivo(dto.getRutaArchivo(), dto.getNombre());
    }

    /**
     * Gestiona la descarga de un archivo entregado por un alumno.
     * @param id Identificador único del registro de archivo de entrega.
     * @return   ResponseEntity con el recurso binario del archivo.
     */
    @GetMapping("/entrega/{id}")
    public ResponseEntity<Resource> descargarEntrega(@PathVariable Long id) {
        var dto = archivoEntregaService.buscarPorId(id); 
        return servirArchivo(dto.getRutaArchivo(), dto.getNombre());
    }

    // --- MÉTODOS PRIVADOS DE SOPORTE ---

    /**
     * Método interno para transformar una ruta de base de datos en un recurso descargable.
     * @param rutaBd         Ruta almacenada en BD (formato "carpeta/nombre_sistema").
     * @param nombreOriginal Nombre con el que el usuario verá el archivo al descargar.
     * @return               ResponseEntity configurado para descarga de archivos (OCTET_STREAM).
     * @throws BadRequestException       Si el formato de la ruta en BD es inválido.
     * @throws ResourceNotFoundException Si el archivo no existe físicamente o no se puede leer.
     */
    @SneakyThrows
    private ResponseEntity<Resource> servirArchivo(String rutaBd, String nombreOriginal) {
        
        String[] partes = rutaBd.split("/");
        if (partes.length < 2) {
            throw new BadRequestException("Ruta de archivo corrupta en base de datos");
        }

        Path path = fileUtil.getRutaProtegida(partes[0], partes[1]);
        Resource recurso = new UrlResource(path.toUri());

        if (!recurso.exists() || !recurso.isReadable()) {
            throw new ResourceNotFoundException("El archivo '" + nombreOriginal + "' no existe en el servidor");
        }

        return ResponseEntity.ok()
            .contentType(MediaType.APPLICATION_OCTET_STREAM)
            .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + nombreOriginal + "\"")
            .body(recurso);
    }
}