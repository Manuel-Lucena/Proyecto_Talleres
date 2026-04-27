-- Limpieza
DELETE FROM entrega;
DELETE FROM mensaje;
DELETE FROM tarea;
DELETE FROM inscripcion;
DELETE FROM taller;
DELETE FROM usuario;
DELETE FROM rol;

-- 1. ROLES
INSERT INTO rol (id_rol, nombre) VALUES (1, 'ADMIN');
INSERT INTO rol (id_rol, nombre) VALUES (2, 'PROFESOR');
INSERT INTO rol (id_rol, nombre) VALUES (3, 'ALUMNO');

-- 2. USUARIOS
INSERT INTO usuario (id_usuario, nombre, apellidos, dni, email, password, activo, id_rol) VALUES 
(1, 'Admin', 'Sistema', '00000000A', 'admin@talleres.com', '$2a$12$WwG.LPs2At4WHnX8pAmf6e5EPUxyYn5WAhfwojuV1ULk.B6zoF1Hu', true, 1),
(2, 'Pepe', 'García', '11111111B', 'profe1@talleres.com', '$2a$12$WwG.LPs2At4WHnX8pAmf6e5EPUxyYn5WAhfwojuV1ULk.B6zoF1Hu', true, 2),
(3, 'Ana', 'López', '22222222C', 'profe2@talleres.com', '$2a$12$WwG.LPs2At4WHnX8pAmf6e5EPUxyYn5WAhfwojuV1ULk.B6zoF1Hu', true, 2),
(4, 'Luis', 'AlumnoUno', '33333333D', 'alumno1@talleres.com', '$2a$12$WwG.LPs2At4WHnX8pAmf6e5EPUxyYn5WAhfwojuV1ULk.B6zoF1Hu', true, 3),
(5, 'Maria', 'AlumnoDos', '44444444E', 'alumno2@talleres.com', '$2a$12$WwG.LPs2At4WHnX8pAmf6e5EPUxyYn5WAhfwojuV1ULk.B6zoF1Hu', true, 3);

-- 3. TALLERES
INSERT INTO taller (id_taller, nombre, descripcion, plazas_maximas, precio, activo, fecha_inicio, id_profesor) VALUES 
(1, 'Cerámica', 'Taller de barro', 10, 45.0, true, '2026-05-01', 2),
(2, 'Madera', 'Carpintería', 8, 60.0, true, '2026-05-15', 3);

-- 4. INSCRIPCIONES (Añadido estado_pago para evitar el NPE)
-- Inscribimos a AMBOS alumnos (4 y 5) en el taller 1 (Cerámica)
INSERT INTO inscripcion (id_inscripcion, id_usuario, id_taller, fecha_inscripcion, activa, monto_pagado, estado_pago) VALUES 
(1, 4, 1, CURRENT_TIMESTAMP, true, 45.0, 'PAGADO'),
(2, 5, 1, CURRENT_TIMESTAMP, true, 45.0, 'PAGADO');

-- 5. TAREAS
INSERT INTO tarea (id_tarea, id_taller, titulo, descripcion, fecha_publicacion, fecha_entrega, visible) VALUES 
(1, 1, 'Primer Jarrón', 'Modelar barro', CURRENT_TIMESTAMP, '2026-06-01', true),
(2, 1, 'Examen Sorpresa Oculto', 'Oculto', CURRENT_TIMESTAMP, '2026-06-15', false);

-- 6. MENSAJES
INSERT INTO mensaje (id_mensaje, id_taller, id_usuario, contenido, fecha_envio) VALUES 
(1, 1, 2, 'Bienvenidos!', CURRENT_TIMESTAMP);

-- 7. ENTREGAS
INSERT INTO entrega (id_entrega, id_tarea, id_usuario, texto_entrega, fecha_entrega) VALUES 
(1, 1, 4, 'Aquí está mi trabajo de cerámica - Luis', CURRENT_TIMESTAMP),
(2, 1, 5, 'Aquí está mi trabajo de cerámica - Maria', CURRENT_TIMESTAMP);

-- 8. REINICIAR SECUENCIAS (Ajustadas al valor SIGUIENTE para evitar colisiones)
ALTER TABLE rol ALTER COLUMN id_rol RESTART WITH 4;
ALTER TABLE usuario ALTER COLUMN id_usuario RESTART WITH 6;
ALTER TABLE taller ALTER COLUMN id_taller RESTART WITH 3;
ALTER TABLE inscripcion ALTER COLUMN id_inscripcion RESTART WITH 3;
ALTER TABLE tarea ALTER COLUMN id_tarea RESTART WITH 3;
ALTER TABLE mensaje ALTER COLUMN id_mensaje RESTART WITH 2;
ALTER TABLE entrega ALTER COLUMN id_entrega RESTART WITH 3;