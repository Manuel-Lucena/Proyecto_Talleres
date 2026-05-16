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

                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .csrf(AbstractHttpConfigurer::disable)
                .authorizeHttpRequests(auth -> auth
                        // Permite todas las peticiones de tipo OPTIONS (Preflight)
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()

                        // =========================================================
                        // 0. RECURSOS ESTÁTICOS (IMÁGENES)
                        // =========================================================
                        .requestMatchers("/usuarios/**").permitAll()
                        .requestMatchers("/noticias/**").permitAll()
                        .requestMatchers("/talleres/**").permitAll()

                        // =========================================================
                        // 1. ENTIDAD: USUARIOS & AUTH
                        // =========================================================

                        // 1. Excepciones públicas (Auth)
                        .requestMatchers(HttpMethod.POST, "/api/usuarios/register", "/api/usuarios/login").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/usuarios/password-reset-request",
                                "/api/usuarios/password-reset-confirm")
                        .permitAll()

                        // 2. Acciones exclusivas de ADMIN
                        .requestMatchers(HttpMethod.GET, "/api/usuarios").hasRole("ADMIN") // Solo admin ve a todos
                        .requestMatchers(HttpMethod.POST, "/api/usuarios/batch").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/usuarios/**").hasRole("ADMIN")

                        // 3. Acciones de Usuario (Perfil propio)
                        .requestMatchers(HttpMethod.PUT, "/api/usuarios/perfil").authenticated()

                        // 4. Todo lo demás (buscar por ID, etc.)
                        .requestMatchers("/api/usuarios/**").authenticated()
                        // =========================================================
                        // 2. ENTIDAD: TALLERES
                        // =========================================================

                        // Lectura: Cualquier usuario logueado puede ver el catálogo y sus talleres
                        .requestMatchers(HttpMethod.GET, "/api/talleres/**").permitAll()

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

                        // Solo Admin y Profesores pueden borrar
                        .requestMatchers(HttpMethod.DELETE, "/api/mensajes/**").hasAnyRole("ADMIN", "PROFESOR")

                        // El listado global (GET /api/mensajes) solo para Admin
                        .requestMatchers(HttpMethod.GET, "/api/mensajes").hasRole("ADMIN")

                        // El resto (enviar y ver chat del taller) para todos los que pasen el filtro
                        // del Service
                        .requestMatchers("/api/mensajes/**").authenticated()

                        // =========================================================
                        // 5. ENTIDAD: TAREAS (Gestión de Actividades)
                        // =========================================================

                        .requestMatchers(HttpMethod.GET, "/api/tareas").hasRole("ADMIN")
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
                        .requestMatchers(HttpMethod.GET, "/api/tareas-asignadas/**").hasAnyRole("ADMIN", "PROFESOR")
                        .requestMatchers(HttpMethod.POST, "/api/tareas-asignadas/**").hasAnyRole("ADMIN", "PROFESOR")
                        .requestMatchers(HttpMethod.DELETE, "/api/tareas-asignadas/**").hasAnyRole("ADMIN", "PROFESOR")

                        // =========================================================
                        // 7. ENTIDAD: MATERIALES
                        // =========================================================

                        .requestMatchers(HttpMethod.GET, "/api/materiales").hasRole("ADMIN")
                        // Alumnos y Profesores pueden ver materiales específicos o por taller
                        .requestMatchers(HttpMethod.GET, "/api/materiales/**").authenticated()

                        // Gestión: El Profesor y el Admin pueden Crear, Editar y Eliminar materiales
                        .requestMatchers(HttpMethod.POST, "/api/materiales/**").hasAnyRole("ADMIN", "PROFESOR")
                        .requestMatchers(HttpMethod.PUT, "/api/materiales/**").hasAnyRole("ADMIN", "PROFESOR")
                        .requestMatchers(HttpMethod.DELETE, "/api/materiales/**").hasAnyRole("ADMIN", "PROFESOR")

                        // =========================================================
                        // 8. ENTIDAD: INSCRIPCIONES
                        // =========================================================

                        // 1. CARGA MASIVA: Siempre arriba del todo porque es la más restrictiva.
                        .requestMatchers(HttpMethod.POST, "/api/inscripciones/masivo").hasRole("ADMIN")

                        // 2. CAMBIO DE ESTADO: Específica para gestión de alumnos (Admin y Prof)
                        .requestMatchers(HttpMethod.PUT, "/api/inscripciones/*/estado").hasAnyRole("ADMIN", "PROFESOR")

                        // 3. CONSULTAS DE GESTIÓN: Listar alumnos de un taller o todas la inscripciones
                        .requestMatchers(HttpMethod.GET, "/api/inscripciones/taller/**").hasAnyRole("ADMIN", "PROFESOR")
                        .requestMatchers(HttpMethod.GET, "/api/inscripciones").hasAnyRole("ADMIN", "PROFESOR")

                        // 4. RUTAS DE ALUMNO: Acciones personales (Inscribirse o ver sus propios
                        // talleres)

                        .requestMatchers(HttpMethod.POST, "/api/inscripciones").authenticated()
                        .requestMatchers(HttpMethod.GET, "/api/inscripciones/usuario/**").authenticated()
                        .requestMatchers(HttpMethod.GET, "/api/inscripciones/{id}").authenticated()

                        // 5. MANTENIMIENTO: Actualizar o borrar inscripciones

                        .requestMatchers(HttpMethod.PUT, "/api/inscripciones/**").hasAnyRole("ADMIN", "PROFESOR")
                        .requestMatchers(HttpMethod.DELETE, "/api/inscripciones/**").hasAnyRole("ADMIN", "PROFESOR")

                        // =========================================================
                        // 9. ENTIDAD: HORARIOS
                        // =========================================================

                        // Lectura: Profesores y Alumnos pueden ver horarios y agendas (cada uno la
                        // suya)
                        .requestMatchers(HttpMethod.GET, "/api/horarios/**").permitAll()

                        // Escritura: ÚNICAMENTE el ADMIN puede tocar los turnos
                        .requestMatchers(HttpMethod.POST, "/api/horarios/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/api/horarios/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/horarios/**").hasRole("ADMIN")

                        // =========================================================
                        // 10. ENTIDAD: ENTREGAS (Calificaciones y Trabajos)
                        // =========================================================
                        // Acción de entregar y CONSULTAR (ahora incluimos GET para alumnos)
                        .requestMatchers(HttpMethod.POST, "/api/entregas").authenticated()
                        .requestMatchers(HttpMethod.GET, "/api/entregas/tarea/**").authenticated()

                        // Calificar y Feedback: Sigue siendo SOLO para Profe/Admin
                        .requestMatchers(HttpMethod.PUT, "/api/entregas/*/calificar").hasAnyRole("ADMIN", "PROFESOR")

                        // Listados globales (sin filtros) y gestión: Sigue siendo SOLO para Profe/Admin
                        .requestMatchers(HttpMethod.GET, "/api/entregas").hasAnyRole("ADMIN", "PROFESOR")
                        .requestMatchers(HttpMethod.DELETE, "/api/entregas/**").hasAnyRole("ADMIN", "PROFESOR")

                        // =========================================================
                        // 11. ENTIDAD: ARCHIVOS DE TAREA (Adjuntos/Enunciados)
                        // =========================================================

                        // Lectura: Cualquier alumno o profesor puede ver/descargar los adjuntos
                        .requestMatchers(HttpMethod.GET, "/api/archivos-tarea/**").authenticated()

                        // Gestión de recursos: Solo Admin y Profesor suben, editan o borran enunciados
                        .requestMatchers(HttpMethod.POST, "/api/archivos-tarea/**").hasAnyRole("ADMIN", "PROFESOR")
                        .requestMatchers(HttpMethod.DELETE, "/api/archivos-tarea/**").hasAnyRole("ADMIN", "PROFESOR")

                        // =========================================================
                        // 12. ENTIDAD: ARCHIVOS DE MATERIAL (Recursos de apoyo)
                        // =========================================================

                        // Lectura: Alumnos y Profesores acceden a los archivos del material didáctico
                        .requestMatchers(HttpMethod.GET, "/api/archivos-material/**").authenticated()

                        // Gestión: Solo Admin y Profesor pueden subir, editar o borrar estos archivos
                        .requestMatchers(HttpMethod.POST, "/api/archivos-material/**").hasAnyRole("ADMIN", "PROFESOR")
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

        configuration.setAllowedOrigins(Arrays.asList("http://localhost:4200"));

        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));

        configuration.setAllowedHeaders(Arrays.asList("Authorization", "Content-Type", "Accept"));
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}