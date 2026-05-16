USE gestion_talleres;
SET FOREIGN_KEY_CHECKS = 0;

-- 1. LIMPIEZA TOTAL
TRUNCATE TABLE mensaje;
TRUNCATE TABLE entrega;
TRUNCATE TABLE inscripcion;
TRUNCATE TABLE material;
TRUNCATE TABLE tarea;
TRUNCATE TABLE taller;
TRUNCATE TABLE usuario;
TRUNCATE TABLE rol;

-- 2. ROLES
INSERT INTO rol (id_rol, nombre) VALUES (1, 'ADMIN'), (2, 'PROFESOR'), (3, 'ALUMNO');

-- 3. USUARIOS (ADMIN Y PROFESORES)
INSERT INTO usuario (id_usuario, dni, nombre, apellidos, email, password, id_rol, activo, foto_perfil_ruta) VALUES
(1, '00000000A', 'Admin', 'Sistema', 'admin@example.com', '$2a$12$UPVM9AjK6Bnly7t5RqDNyuQDwMMw3m9yTZVTAy5xH5YYihrXy3Ueq', 1, 1, NULL),
(3, '11111111B', 'Profesor', 'Musica', 'profe1@example.com', '$2a$12$UPVM9AjK6Bnly7t5RqDNyuQDwMMw3m9yTZVTAy5xH5YYihrXy3Ueq', 2, 1, NULL),
(4, '22222222C', 'Profesor', 'Arte', 'profe2@example.com', '$2a$12$UPVM9AjK6Bnly7t5RqDNyuQDwMMw3m9yTZVTAy5xH5YYihrXy3Ueq', 2, 1, NULL),
(5, '33333333D', 'Profesor', 'Costura', 'profe3@example.com', '$2a$12$UPVM9AjK6Bnly7t5RqDNyuQDwMMw3m9yTZVTAy5xH5YYihrXy3Ueq', 2, 1, NULL);

-- 4. TALLERES
INSERT INTO taller (id_taller, nombre, descripcion, id_profesor, activo, plazas_maximas, precio) VALUES
(1, 'Guitarra Espanola', 'Aprende desde cero acordes y ritmos.', 3, 1, 20, 45.00),
(2, 'Piano Moderno', 'Jazz, Blues y composicion contemporanea.', 3, 1, 15, 60.00),
(3, 'Danza Contemporanea', 'Expresion corporal y tecnica libre.', 3, 1, 25, 35.00),
(4, 'Ceramica Artistica', 'Modelado en barro y tecnicas de esmaltado.', 4, 1, 10, 50.00),
(5, 'Corte y Confeccion', 'Diseno de patrones y costura a maquina.', 5, 1, 12, 40.00);

-- 5. USUARIOS (ALUMNOS)
INSERT INTO usuario (id_usuario, dni, nombre, apellidos, email, password, id_rol, activo, foto_perfil_ruta) VALUES
(6, '2041X', 'Hugo', 'Sanchez', 'hugo@example.com', '$2a$12$UPVM9AjK6Bnly7t5RqDNyuQDwMMw3m9yTZVTAy5xH5YYihrXy3Ueq', 3, 1, NULL),
(20, '2042Y', 'Carmen', 'Lara', 'carmen@example.com', '$2a$12$UPVM9AjK6Bnly7t5RqDNyuQDwMMw3m9yTZVTAy5xH5YYihrXy3Ueq', 3, 1, NULL),
(21, '2043Z', 'Mario', 'Casas', 'mario@example.com', '$2a$12$UPVM9AjK6Bnly7t5RqDNyuQDwMMw3m9yTZVTAy5xH5YYihrXy3Ueq', 3, 1, NULL),
(22, '2044W', 'Lola', 'Indigo', 'lola@example.com', '$2a$12$UPVM9AjK6Bnly7t5RqDNyuQDwMMw3m9yTZVTAy5xH5YYihrXy3Ueq', 3, 1, NULL);

-- 6. TAREAS E INSCRIPCIONES
INSERT INTO tarea (id_tarea, id_taller, titulo, descripcion, fecha_publicacion, fecha_entrega, estado, extensiones_permitidas, visible) VALUES
(1, 1, 'Composicion 4 compases', 'Escribe una melodia simple en 4/4.', NOW(), '2026-06-01', 'ABIERTA', '.pdf, .jpg', 1);

INSERT INTO inscripcion (id_usuario, id_taller, fecha_inscripcion, monto_pagado, estado_pago, activa) VALUES
(6, 1, NOW(), 45, 'PAGADO', 1),
(20, 1, NOW(), 45, 'PAGADO', 1),
(21, 1, NOW(), 45, 'PAGADO', 1),
(22, 1, NOW(), 45, 'PAGADO', 1);

-- 7. ENTREGAS
INSERT INTO entrega (id_tarea, id_usuario, fecha_entrega, texto_entrega, calificacion, comentario_profesor) VALUES
(1, 6, NOW(), 'Aqui tienes mi escala de Do.', 8.5, 'Muy bien.'),
(1, 20, NOW(), 'Se me olvido un compas.', 5.0, 'Vuelve a intentarlo.'),
(1, 21, NOW(), 'Adjunto mi diseno.', NULL, NULL),
(1, 22, NOW(), 'Diseno minimalista.', 9.0, 'Excelente.');

SET FOREIGN_KEY_CHECKS = 1;