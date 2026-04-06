-- 1. ROLES (Padres de todo)
INSERT INTO rol (id_rol, nombre) VALUES (1, 'ADMIN');
INSERT INTO rol (id_rol, nombre) VALUES (2, 'ALUMNO');

-- 2. USUARIOS (Basado en tu log: apellidos, dni, activo e id_rol son NOT NULL)
INSERT INTO usuario (id_usuario, nombre, apellidos, dni, email, password, activo, id_rol) 
VALUES (1, 'Admin', 'Talleres', '12345678A', 'admin@talleres.com', '$2a$12$WwG.LPs2At4WHnX8pAmf6e5EPUxyYn5WAhfwojuV1ULk.B6zoF1Hu', true, 1);

INSERT INTO usuario (id_usuario, nombre, apellidos, dni, email, password, activo, id_rol) 
VALUES (2, 'Alumno', 'Prueba', '87654321B', 'alumno@talleres.com', '$2a$12$WwG.LPs2At4WHnX8pAmf6e5EPUxyYn5WAhfwojuV1ULk.B6zoF1Hu', true, 2);

-- 3. TALLERES (id_profesor es FK a usuario 1)
INSERT INTO taller (id_taller, nombre, descripcion, plazas_maximas, precio, activo, fecha_inicio, id_profesor) 
VALUES (1, 'Cerámica', 'Taller de barro', 20, 50.0, true, '2026-04-01', 1);

-- 4. HORARIOS (Relacionado con taller 1)
INSERT INTO horario (id_horario, id_taller, dia_semana, hora_inicio, hora_fin) 
VALUES (1, 1, 'Lunes', '16:00:00', '18:00:00');

-- 5. NOTICIAS (imagen_url en lugar de foto_ruta, según tu log de Hibernate)
INSERT INTO noticia (id_noticia, titulo, contenido, fecha_publicacion, imagen_url) 
VALUES (1, 'Bienvenidos', 'Contenido de prueba', CURRENT_DATE, 'noticia1.jpg');