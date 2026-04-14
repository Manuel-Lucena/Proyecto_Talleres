package com.mlg.taller.security.config;

import com.mlg.taller.security.jwt.JwtAuthenticationFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import java.util.Arrays;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfiguration {

    private final JwtAuthenticationFilter jwtAuthFilter;
    private final AuthenticationProvider authenticationProvider;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                // 1. AÑADE ESTO: Activa CORS con la configuración que definimos abajo
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .csrf(AbstractHttpConfigurer::disable)
                .authorizeHttpRequests(auth -> auth
                        // 2. AÑADE ESTO: Permite todas las peticiones de tipo OPTIONS (Preflight)
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()

                        // =========================================================
                        // 1. ENTIDAD: USUARIOS & AUTH
                        // =========================================================

                        // Acceso Público (Registro y Login)
                        .requestMatchers(HttpMethod.POST, "/api/usuarios/register", "/api/usuarios/login").permitAll()

                        // Acceso exclusivo ADMIN (Gestión masiva y eliminación)
                        .requestMatchers(HttpMethod.POST, "/api/usuarios/batch").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/usuarios/**").hasRole("ADMIN")

                        // Acceso Autenticado (Listar, ver perfil, actualizar)
                        .requestMatchers("/api/usuarios/**").authenticated()

                        .requestMatchers("/api/usuarios/password-reset-request", "/api/usuarios/password-reset-confirm")
                        .permitAll()
                        // =========================================================
                        // 2. ENTIDAD: TALLERES
                        // =========================================================

                        // Lectura: Cualquier usuario logueado puede ver el catálogo y sus talleres
                        .requestMatchers(HttpMethod.GET, "/api/talleres/**").authenticated()

                        // Escritura: Solo el ADMIN puede crear, modificar o eliminar talleres
                        .requestMatchers(HttpMethod.POST, "/api/talleres/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/api/talleres/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/talleres/**").hasRole("ADMIN")

                        // =========================================================
                        // 3. ENTIDAD: NOTICIAS
                        // =========================================================

                        // Lectura: Público (Cualquiera puede leer las noticias)
                        .requestMatchers(HttpMethod.GET, "/api/noticias/**").permitAll()

                        // Gestión: Solo ADMIN puede publicar, editar o borrar
                        .requestMatchers(HttpMethod.POST, "/api/noticias/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/api/noticias/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/noticias/**").hasRole("ADMIN")

                        // =========================================================
                        // 4. ENTIDAD: MENSAJES
                        // =========================================================

                        // Moderación y Auditoría: Solo ADMIN ve todo el historial global o elimina
                        .requestMatchers(HttpMethod.GET, "/api/mensajes").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/mensajes/**").hasRole("ADMIN")

                        // Comunicación: Alumnos/Profesores pueden enviar y ver chats de sus talleres
                        .requestMatchers("/api/mensajes/**").authenticated()

                        // =========================================================
                        // 5. ENTIDAD: TAREAS (Gestión de Actividades)
                        // =========================================================

                        // Lectura: Cualquier usuario logueado puede ver tareas (sujeto a la lógica de
                        // visibilidad del Service)
                        .requestMatchers(HttpMethod.GET, "/api/tareas/**").authenticated()

                        // Gestión: El Profesor y el Admin pueden Crear, Editar (incluida visibilidad) y
                        // Eliminar
                        .requestMatchers(HttpMethod.POST, "/api/tareas/**").hasAnyRole("ADMIN", "PROFESOR")
                        .requestMatchers(HttpMethod.PUT, "/api/tareas/**").hasAnyRole("ADMIN", "PROFESOR")
                        .requestMatchers(HttpMethod.DELETE, "/api/tareas/**").hasAnyRole("ADMIN", "PROFESOR")

                        // =========================================================
                        // 6. ENTIDAD: TAREAS ASIGNADAS (Visibilidad selectiva)
                        // =========================================================

                        // El Profe crea y elimina las asignaciones de sus tareas
                        .requestMatchers(HttpMethod.GET, "/api/tareas-asignadas/**").authenticated()
                        .requestMatchers(HttpMethod.POST, "/api/tareas-asignadas/actualizar/**")
                        .hasAnyRole("ADMIN", "PROFESOR")
                        .requestMatchers(HttpMethod.DELETE, "/api/tareas-asignadas/**").hasAnyRole("ADMIN", "PROFESOR")

                        // =========================================================
                        // 7. ENTIDAD: MATERIALES
                        // =========================================================

                        // Lectura: Alumnos y Profesores pueden ver materiales (el Service filtra la
                        // visibilidad)
                        .requestMatchers(HttpMethod.GET, "/api/materiales/**").authenticated()

                        // Gestión: El Profesor y el Admin pueden Crear, Editar y Eliminar materiales
                        .requestMatchers(HttpMethod.POST, "/api/materiales/**").hasAnyRole("ADMIN", "PROFESOR")
                        .requestMatchers(HttpMethod.PUT, "/api/materiales/**").hasAnyRole("ADMIN", "PROFESOR")
                        .requestMatchers(HttpMethod.DELETE, "/api/materiales/**").hasAnyRole("ADMIN", "PROFESOR")

                        // =========================================================
                        // 8. ENTIDAD: INSCRIPCIONES
                        // =========================================================

                        // Alta y consulta personal: Cualquier usuario logueado
                        .requestMatchers(HttpMethod.POST, "/api/inscripciones").authenticated()
                        .requestMatchers(HttpMethod.GET, "/api/inscripciones/usuario/**").authenticated()

                        // Gestión y Listados grupales: Solo Admin y Profesor
                        .requestMatchers(HttpMethod.GET, "/api/inscripciones", "/api/inscripciones/taller/**")
                        .hasAnyRole("ADMIN", "PROFESOR")
                        .requestMatchers(HttpMethod.PUT, "/api/inscripciones/**").hasAnyRole("ADMIN", "PROFESOR")
                        .requestMatchers(HttpMethod.DELETE, "/api/inscripciones/**").hasAnyRole("ADMIN", "PROFESOR")

                        // Consulta de ID específico (Suele ser para detalles de gestión)
                        .requestMatchers(HttpMethod.GET, "/api/inscripciones/{id}").authenticated()

                        // =========================================================
                        // 9. ENTIDAD: HORARIOS
                        // =========================================================

                        // Lectura: Los alumnos ven su agenda y los horarios de los talleres
                        .requestMatchers(HttpMethod.GET, "/api/horarios/**").authenticated()

                        // Gestión: Solo Admin y Profesor crean, editan o borran turnos
                        .requestMatchers(HttpMethod.POST, "/api/horarios/**").hasAnyRole("ADMIN", "PROFESOR")
                        .requestMatchers(HttpMethod.PUT, "/api/horarios/**").hasAnyRole("ADMIN", "PROFESOR")
                        .requestMatchers(HttpMethod.DELETE, "/api/horarios/**").hasAnyRole("ADMIN", "PROFESOR")

                        // =========================================================
                        // 10. ENTIDAD: ENTREGAS (Calificaciones y Trabajos)
                        // =========================================================

                        // Acción de entregar: Alumno autenticado
                        .requestMatchers(HttpMethod.POST, "/api/entregas").authenticated()

                        // Calificar y Feedback: Solo Admin y Profesor
                        .requestMatchers(HttpMethod.PUT, "/api/entregas/*/calificar").hasAnyRole("ADMIN", "PROFESOR")

                        // Listados grupales y gestión: Solo Admin y Profesor
                        .requestMatchers(HttpMethod.GET, "/api/entregas", "/api/entregas/tarea/**")
                        .hasAnyRole("ADMIN", "PROFESOR")
                        .requestMatchers(HttpMethod.DELETE, "/api/entregas/**").hasAnyRole("ADMIN", "PROFESOR")

                        // Consulta de entrega individual y actualización: Alumno (dueño) o Profesor
                        .requestMatchers("/api/entregas/**").authenticated()

                        // =========================================================
                        // 11. ENTIDAD: ARCHIVOS DE TAREA (Adjuntos/Enunciados)
                        // =========================================================

                        // Lectura: Cualquier alumno o profesor puede ver/descargar los adjuntos
                        .requestMatchers(HttpMethod.GET, "/api/archivos-tarea/**").authenticated()

                        // Gestión de recursos: Solo Admin y Profesor suben, editan o borran enunciados
                        .requestMatchers(HttpMethod.POST, "/api/archivos-tarea/**").hasAnyRole("ADMIN", "PROFESOR")
                        .requestMatchers(HttpMethod.PUT, "/api/archivos-tarea/**").hasAnyRole("ADMIN", "PROFESOR")
                        .requestMatchers(HttpMethod.DELETE, "/api/archivos-tarea/**").hasAnyRole("ADMIN", "PROFESOR")

                        // =========================================================
                        // 12. ENTIDAD: ARCHIVOS DE MATERIAL (Recursos de apoyo)
                        // =========================================================

                        // Lectura: Alumnos y Profesores acceden a los archivos del material didáctico
                        .requestMatchers(HttpMethod.GET, "/api/archivos-material/**").authenticated()

                        // Gestión: Solo Admin y Profesor pueden subir, editar o borrar estos archivos
                        .requestMatchers(HttpMethod.POST, "/api/archivos-material/**").hasAnyRole("ADMIN", "PROFESOR")
                        .requestMatchers(HttpMethod.PUT, "/api/archivos-material/**").hasAnyRole("ADMIN", "PROFESOR")
                        .requestMatchers(HttpMethod.DELETE, "/api/archivos-material/**").hasAnyRole("ADMIN", "PROFESOR")

                        // =========================================================
                        // 13. ENTIDAD: ARCHIVOS DE ENTREGA (Trabajos de Alumnos)
                        // =========================================================

                        // El Alumno sube sus propios archivos de trabajo
                        .requestMatchers(HttpMethod.POST, "/api/archivos-entrega").authenticated()

                        // Lectura: El alumno ve sus archivos y el Profesor/Admin los descarga para
                        // evaluar
                        .requestMatchers(HttpMethod.GET, "/api/archivos-entrega/**").authenticated()

                        // Eliminación: El alumno puede borrar su archivo (si el Service lo permite)
                        // y el Admin/Profe por gestión.
                        .requestMatchers(HttpMethod.DELETE, "/api/archivos-entrega/**").authenticated()

                        // =========================================================
                        // 14. CONTROLADOR DE DESCARGAS (Acceso a Binarios)
                        // =========================================================

                        // Todas las descargas requieren estar logueado.
                        // La lógica interna del controlador ya se apoya en los Services
                        // para asegurar que el archivo existe y es válido.
                        .requestMatchers("/api/descargas/**").authenticated()

                        .requestMatchers("/api/email/**").permitAll()
                        // ... resto de tus rutas ...
                        .requestMatchers("/error").permitAll()
                        .anyRequest().authenticated())
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authenticationProvider(authenticationProvider)
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    // 3. AÑADE ESTE BEAN: Configuración detallada de CORS
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        // Permite el origen de tu Angular
        configuration.setAllowedOrigins(Arrays.asList("http://localhost:4200"));
        // Permite los métodos que usas
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        // Importante: permite la cabecera Authorization (el Bearer token)
        configuration.setAllowedHeaders(Arrays.asList("Authorization", "Content-Type", "Accept"));
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}