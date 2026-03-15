package com.mlg.taller.util;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;

/**
 * Utilidad para la gestión física de archivos en el servidor.
 * Centraliza las operaciones de guardado y borrado en el directorio del frontend.
 */
@Slf4j
@Component
public class FileUtil {

    private static final String BASE_PATH = "frontend/public";

    /**
     * Guarda un archivo multimedia en una subcarpeta específica del frontend.
     * * @param archivo    Objeto MultipartFile recibido desde el controlador.
     * @param subCarpeta Nombre de la carpeta destino (ej: "usuarios", "talleres").
     * @param nombre     Nombre final que tendrá el archivo en el disco.
     * @throws RuntimeException si ocurre un error de E/S durante el guardado.
     */
    public void guardar(MultipartFile archivo, String subCarpeta, String nombre) {
        try {
            Path destinoPath = obtenerRuta(subCarpeta).resolve(nombre);

            if (!Files.exists(destinoPath.getParent())) {
                Files.createDirectories(destinoPath.getParent());
            }

            Files.copy(archivo.getInputStream(), destinoPath, StandardCopyOption.REPLACE_EXISTING);
            log.info("Archivo guardado con éxito en: {}", destinoPath);

        } catch (IOException e) {
            log.error("Error al intentar guardar el archivo {}: {}", nombre, e.getMessage());
            throw new RuntimeException("No se pudo almacenar el archivo físico", e);
        }
    }

    /**
     * Elimina un archivo del almacenamiento si este existe.
     * * @param subCarpeta Carpeta donde se aloja el archivo.
     * @param nombre     Nombre del archivo a eliminar.
     */
    public void eliminar(String subCarpeta, String nombre) {
        try {
            Path ruta = obtenerRuta(subCarpeta).resolve(nombre);
            if (Files.deleteIfExists(ruta)) {
                log.info("Archivo eliminado: {}", ruta);
            }
        } catch (IOException e) {
            log.error("No se pudo eliminar el archivo {}: {}", nombre, e.getMessage());
        }
    }

    /**
     * Genera y normaliza la ruta absoluta basada en la estructura del proyecto.
     * * @param subCarpeta Carpeta específica.
     * @return Path normalizado y absoluto.
     */
    private Path obtenerRuta(String subCarpeta) {
        return Paths.get(".", BASE_PATH, subCarpeta)
                .toAbsolutePath()
                .normalize();
    }
}