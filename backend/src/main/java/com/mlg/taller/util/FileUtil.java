package com.mlg.taller.util;

import lombok.extern.slf4j.Slf4j;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;

/**
 * Utilidad evolucionada para la gestión física de archivos en el servidor.
 * Ahora permite separar archivos públicos (imágenes UI) de archivos protegidos
 * (materiales de pago).
 */
@Slf4j
@Component
public class FileUtil {

    // Ruta para archivos accesibles directamente por URL (Fotos perfil, Noticias,
    // etc.)
    @Value("${app.storage.public-path:frontend/public}")
    private String publicPath;

    // Ruta para archivos protegidos (Materiales, Tareas, Entregas) fuera del
    // alcance del navegador
    @Value("${app.storage.protected-path:storage}")
    private String protectedPath;

    /**
     * Guarda un archivo multimedia permitiendo elegir si es público o protegido.
     * * @param archivo Objeto MultipartFile recibido desde el controlador.
     * 
     * @param subCarpeta Nombre de la carpeta destino (ej: "usuarios",
     *                   "materiales").
     * @param nombre     Nombre final que tendrá el archivo en el disco.
     * @param esPublico  Si es true, va a 'frontend/public'. Si es false, va a
     *                   'storage/protegido'.
     * @throws RuntimeException si ocurre un error de E/S durante el guardado.
     */
    public void guardar(MultipartFile archivo, String subCarpeta, String nombre, boolean esPublico) {

        System.out.println("DEBUG FILEUTIL: Intentando guardar archivo...");
        System.out.println("DEBUG FILEUTIL: Nombre -> " + nombre);
        System.out.println("DEBUG FILEUTIL: Subcarpeta -> " + subCarpeta);
        System.out.println("DEBUG FILEUTIL: ¿Es nulo el archivo? -> " + (archivo == null));
        try {
            Path destinoPath = obtenerRuta(subCarpeta, esPublico).resolve(nombre);

            if (!Files.exists(destinoPath.getParent())) {
                Files.createDirectories(destinoPath.getParent());
            }

            Files.copy(archivo.getInputStream(), destinoPath, StandardCopyOption.REPLACE_EXISTING);
            log.info("Archivo guardado con éxito en [{}]: {}", esPublico ? "PUBLIC" : "PROTECTED", destinoPath);

        } catch (IOException e) {
            log.error("Error al intentar guardar el archivo {}: {}", nombre, e.getMessage());
            throw new RuntimeException("No se pudo almacenar el archivo físico", e);
        }
    }

    /**
     * Sobrecarga del método guardar para mantener compatibilidad con usos antiguos.
     * Por defecto, guarda en la carpeta pública.
     */
    public void guardar(MultipartFile archivo, String subCarpeta, String nombre) {
        guardar(archivo, subCarpeta, nombre, true);
    }

    /**
     * Elimina un archivo del almacenamiento.
     * * @param subCarpeta Carpeta donde se aloja el archivo.
     * 
     * @param nombre    Nombre del archivo a eliminar.
     * @param esPublico Indica si debe buscarlo en la zona pública o protegida.
     */
    public void eliminar(String subCarpeta, String nombre, boolean esPublico) {
        try {
            Path ruta = obtenerRuta(subCarpeta, esPublico).resolve(nombre);
            if (Files.deleteIfExists(ruta)) {
                log.info("Archivo eliminado de [{}]: {}", esPublico ? "PUBLIC" : "PROTECTED", ruta);
            }
        } catch (IOException e) {
            log.error("No se pudo eliminar el archivo {}: {}", nombre, e.getMessage());
        }
    }

    /**
     * Obtiene la ruta física absoluta de un archivo protegido para su
     * lectura/descarga.
     * * @param subCarpeta Carpeta específica (ej: "materiales").
     * 
     * @param nombre Nombre del archivo en disco.
     * @return Path absoluto para que el controlador pueda leer los bytes.
     */
    public Path getRutaProtegida(String subCarpeta, String nombre) {
        return obtenerRuta(subCarpeta, false).resolve(nombre);
    }

    /**
     * Genera y normaliza la ruta absoluta basada en si el recurso es público o
     * privado.
     * * @param subCarpeta Carpeta específica.
     * 
     * @param esPublico Selector de carpeta base.
     * @return Path normalizado y absoluto.
     */
    private Path obtenerRuta(String subCarpeta, boolean esPublico) {
        // Usamos las variables inyectadas en lugar de las constantes estáticas
        String base = esPublico ? publicPath : protectedPath;

        return Paths.get(base, subCarpeta) // Ya no forzamos el "." al inicio
                .toAbsolutePath()
                .normalize();
    }
}