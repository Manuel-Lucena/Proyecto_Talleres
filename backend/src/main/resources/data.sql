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

-- 2. USUARIOS (Password: admin123)
INSERT INTO usuario (id_usuario, nombre, apellidos, dni, email, password, activo, id_rol) 
VALUES (1, 'Admin', 'Sistema', '00000000A', 'admin@talleres.com', '$2a$12$WwG.LPs2At4WHnX8pAmf6e5EPUxyYn5WAhfwojuV1ULk.B6zoF1Hu', true, 1);

INSERT INTO usuario (id_usuario, nombre, apellidos, dni, email, password, activo, id_rol) 
VALUES (2, 'Pepe', 'García', '11111111B', 'profe1@talleres.com', '$2a$12$WwG.LPs2At4WHnX8pAmf6e5EPUxyYn5WAhfwojuV1ULk.B6zoF1Hu', true, 2);

INSERT INTO usuario (id_usuario, nombre, apellidos, dni, email, password, activo, id_rol) 
VALUES (3, 'Ana', 'López', '22222222C', 'profe2@talleres.com', '$2a$12$WwG.LPs2At4WHnX8pAmf6e5EPUxyYn5WAhfwojuV1ULk.B6zoF1Hu', true, 2);

INSERT INTO usuario (id_usuario, nombre, apellidos, dni, email, password, activo, id_rol) 
VALUES (4, 'Luis', 'AlumnoUno', '33333333D', 'alumno1@talleres.com', '$2a$12$WwG.LPs2At4WHnX8pAmf6e5EPUxyYn5WAhfwojuV1ULk.B6zoF1Hu', true, 3);

INSERT INTO usuario (id_usuario, nombre, apellidos, dni, email, password, activo, id_rol) 
VALUES (5, 'Maria', 'AlumnoDos', '44444444E', 'alumno2@talleres.com', '$2a$12$WwG.LPs2At4WHnX8pAmf6e5EPUxyYn5WAhfwojuV1ULk.B6zoF1Hu', true, 3);


-- 3. TALLERES
INSERT INTO taller (id_taller, nombre, descripcion, plazas_maximas, precio, activo, fecha_inicio, id_profesor) 
VALUES (1, 'Cerámica', 'Taller de barro', 10, 45.0, true, '2026-05-01', 2);

INSERT INTO taller (id_taller, nombre, descripcion, plazas_maximas, precio, activo, fecha_inicio, id_profesor) 
VALUES (2, 'Madera', 'Carpintería', 8, 60.0, true, '2026-05-15', 3);

-- 4. INSCRIPCIONES (Usando id_usuario e id_taller según tus FKs)
INSERT INTO inscripcion (id_inscripcion, id_usuario, id_taller, fecha_inscripcion, activa, monto_pagado) 
VALUES (1, 4, 1, CURRENT_TIMESTAMP, true, 45.0);

-- 5. TAREAS (Ahora con la ID 2 para pruebas de visibilidad)
INSERT INTO tarea (id_tarea, id_taller, titulo, descripcion, fecha_publicacion, fecha_entrega, visible) 
VALUES (1, 1, 'Primer Jarrón', 'Modelar barro', CURRENT_TIMESTAMP, '2026-06-01', true);

INSERT INTO tarea (id_tarea, id_taller, titulo, descripcion, fecha_publicacion, fecha_entrega, visible) 
VALUES (2, 1, 'Examen Sorpresa Oculto', 'Esta tarea no debería ser entregable', CURRENT_TIMESTAMP, '2026-06-15', false);
-- 6. MENSAJES (Aquí estaba el error: la columna es id_usuario, no autor_id_usuario)
INSERT INTO mensaje (id_mensaje, id_taller, id_usuario, contenido, fecha_envio) 
VALUES (1, 1, 2, 'Bienvenidos!', CURRENT_TIMESTAMP);

-- 7. ENTREGAS (Usando id_usuario e id_tarea)
INSERT INTO entrega (id_entrega, id_tarea, id_usuario, texto_entrega, fecha_entrega) 
VALUES (1, 1, 4, 'Aquí está mi trabajo de cerámica', CURRENT_TIMESTAMP);
INSERT INTO entrega (id_entrega, id_tarea, id_usuario, texto_entrega, fecha_entrega) 
VALUES (2, 1, 5, 'Aquí está mi trabajo de cerámica', CURRENT_TIMESTAMP);

-- 8. REINICIAR SECUENCIAS
ALTER TABLE rol ALTER COLUMN id_rol RESTART WITH 4;
ALTER TABLE usuario ALTER COLUMN id_usuario RESTART WITH 5;
ALTER TABLE taller ALTER COLUMN id_taller RESTART WITH 3;
ALTER TABLE inscripcion ALTER COLUMN id_inscripcion RESTART WITH 2;
ALTER TABLE tarea ALTER COLUMN id_tarea RESTART WITH 3;
ALTER TABLE mensaje ALTER COLUMN id_mensaje RESTART WITH 2;
ALTER TABLE entrega ALTER COLUMN id_entrega RESTART WITH 2;