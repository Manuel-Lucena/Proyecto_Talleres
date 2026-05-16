USE gestion_talleres; 

-- Forzamos a la base de datos a entender acentos y eñes vengan de donde vengan
SET NAMES 'utf8mb4';
SET CHARACTER SET utf8mb4;

-- ----------------------------------------------------- 
-- 1. LIMPIEZA TOTAL DE TABLAS 
-- ----------------------------------------------------- 
SET FOREIGN_KEY_CHECKS = 0; 
TRUNCATE TABLE `archivo_entrega`; 
TRUNCATE TABLE `archivo_material`; 
TRUNCATE TABLE `entrega`; 
TRUNCATE TABLE `tareas_asignadas`; 
TRUNCATE TABLE `inscripcion`; 
TRUNCATE TABLE `mensaje`; 
TRUNCATE TABLE `tarea`; 
TRUNCATE TABLE `material`; 
TRUNCATE TABLE `horario`; 
TRUNCATE TABLE `noticia`; 
TRUNCATE TABLE `taller`; 
TRUNCATE TABLE `usuario`; 
TRUNCATE TABLE `rol`; 
SET FOREIGN_KEY_CHECKS = 1; 

-- ----------------------------------------------------- 
-- 2. DEFINICIÓN DE ROLES 
-- ----------------------------------------------------- 
INSERT INTO `rol` (`id_rol`, `nombre`) VALUES 
(1, 'ADMIN'), 
(2, 'PROFESOR'), 
(3, 'ALUMNO'); 

-- ----------------------------------------------------- 
-- 3. USUARIOS: PERSONAL Y ALUMNOS (IDs 1 al 40) 
-- ----------------------------------------------------- 
INSERT INTO `usuario` (id_usuario, dni, nombre, apellidos, email, password, id_rol, activo) VALUES 
(1, '53942108X', 'Admin', 'Sistema', 'admin@gmail.com', '$2a$12$pkCio81CB4Le1J.Jlk1b9.igz4Hzn./PerhcyJEgOA/CDC64V4fqu', 1, 1), 
(3, '48201537F', 'Jesús', 'Música', 'profe1@gmail.com', '$2a$12$pkCio81CB4Le1J.Jlk1b9.igz4Hzn./PerhcyJEgOA/CDC64V4fqu', 2, 1), 
(4, '71493025K', 'Laura', 'Arte', 'profe2@gmail.com', '$2a$12$pkCio81CB4Le1J.Jlk1b9.igz4Hzn./PerhcyJEgOA/CDC64V4fqu', 2, 1), 
(5, '03847152G', 'Elena', 'Costura', 'profe3@gmail.com', '$2a$12$pkCio81CB4Le1J.Jlk1b9.igz4Hzn./PerhcyJEgOA/CDC64V4fqu', 2, 1); 

INSERT INTO `usuario` (id_usuario, dni, nombre, apellidos, email, password, id_rol, activo) VALUES 
(6, '12345678Z', 'Hugo', 'López', 'hugo@gmail.com', '$2a$12$pkCio81CB4Le1J.Jlk1b9.igz4Hzn./PerhcyJEgOA/CDC64V4fqu', 3, 1), 
(21, '87654321A', 'Sonia', 'Vargas', 'sonia@gmail.com', '$2a$12$pkCio81CB4Le1J.Jlk1b9.igz4Hzn./PerhcyJEgOA/CDC64V4fqu', 3, 1), 
(22, '11223344B', 'Ricardo', 'Maza', 'ricardo@gmail.com', '$2a$12$pkCio81CB4Le1J.Jlk1b9.igz4Hzn./PerhcyJEgOA/CDC64V4fqu', 3, 1), 
(23, '55667788C', 'Elena', 'Puerta', 'elena@gmail.com', '$2a$12$pkCio81CB4Le1J.Jlk1b9.igz4Hzn./PerhcyJEgOA/CDC64V4fqu', 3, 1), 
(24, '99001122D', 'Pablo', 'Soto', 'pablo@gmail.com', '$2a$12$pkCio81CB4Le1J.Jlk1b9.igz4Hzn./PerhcyJEgOA/CDC64V4fqu', 3, 1), 
(25, '33445566E', 'Clara', 'Díez', 'clara@gmail.com', '$2a$12$pkCio81CB4Le1J.Jlk1b9.igz4Hzn./PerhcyJEgOA/CDC64V4fqu', 3, 1), 
(26, '77889900F', 'Marcos', 'Ramos', 'mramos@gmail.com', '$2a$12$pkCio81CB4Le1J.Jlk1b9.igz4Hzn./PerhcyJEgOA/CDC64V4fqu', 3, 1), 
(27, '22334455G', 'Lucía', 'Blanco', 'lucia@gmail.com', '$2a$12$pkCio81CB4Le1J.Jlk1b9.igz4Hzn./PerhcyJEgOA/CDC64V4fqu', 3, 1), 
(28, '66778899H', 'Jorge', 'Cano', 'jorge@gmail.com', '$2a$12$pkCio81CB4Le1J.Jlk1b9.igz4Hzn./PerhcyJEgOA/CDC64V4fqu', 3, 1), 
(29, '00112233J', 'Ines', 'Mora', 'ines@gmail.com', '$2a$12$pkCio81CB4Le1J.Jlk1b9.igz4Hzn./PerhcyJEgOA/CDC64V4fqu', 3, 1), 
(30, '44556677K', 'Raúl', 'Garrido', 'raul@gmail.com', '$2a$12$pkCio81CB4Le1J.Jlk1b9.igz4Hzn./PerhcyJEgOA/CDC64V4fqu', 3, 1), 
(31, '88990011L', 'Nerea', 'Soler', 'nerea@gmail.com', '$2a$12$pkCio81CB4Le1J.Jlk1b9.igz4Hzn./PerhcyJEgOA/CDC64V4fqu', 3, 1), 
(32, '12123434M', 'David', 'Ibáñez', 'david@gmail.com', '$2a$12$pkCio81CB4Le1J.Jlk1b9.igz4Hzn./PerhcyJEgOA/CDC64V4fqu', 3, 1), 
(33, '56567878N', 'Marta', 'Leal', 'marta@gmail.com', '$2a$12$pkCio81CB4Le1J.Jlk1b9.igz4Hzn./PerhcyJEgOA/CDC64V4fqu', 3, 1), 
(34, '90901212P', 'Adrián', 'Marín', 'adrian@gmail.com', '$2a$12$pkCio81CB4Le1J.Jlk1b9.igz4Hzn./PerhcyJEgOA/CDC64V4fqu', 3, 1), 
(35, '34345656Q', 'Silvia', 'Luna', 'silvia@gmail.com', '$2a$12$pkCio81CB4Le1J.Jlk1b9.igz4Hzn./PerhcyJEgOA/CDC64V4fqu', 3, 1), 
(36, '78789090R', 'Víctor', 'Toro', 'victor@gmail.com', '$2a$12$pkCio81CB4Le1J.Jlk1b9.igz4Hzn./PerhcyJEgOA/CDC64V4fqu', 3, 1), 
(37, '13572468S', 'Sara', 'Pico', 'sara@gmail.com', '$2a$12$pkCio81CB4Le1J.Jlk1b9.igz4Hzn./PerhcyJEgOA/CDC64V4fqu', 3, 1), 
(38, '24681357T', 'Rubén', 'Sanz', 'ruben@gmail.com', '$2a$12$pkCio81CB4Le1J.Jlk1b9.igz4Hzn./PerhcyJEgOA/CDC64V4fqu', 3, 1), 
(39, '98761234V', 'Alba', 'Roca', 'alba@gmail.com', '$2a$12$pkCio81CB4Le1J.Jlk1b9.igz4Hzn./PerhcyJEgOA/CDC64V4fqu', 3, 1), 
(40, '43218765W', 'Jaime', 'Pinto', 'jaime@gmail.com', '$2a$12$pkCio81CB4Le1J.Jlk1b9.igz4Hzn./PerhcyJEgOA/CDC64V4fqu', 3, 1); 

-- ----------------------------------------------------- 
-- 4. NOTICIAS DEL CENTRO 
-- ----------------------------------------------------- 
INSERT INTO `noticia` (id_noticia, titulo, contenido, fecha_publicacion) VALUES 
(1, 'Inauguración Nuevo Ciclo', 'Bienvenidos a todos a los nuevos talleres de 2026.', '2026-01-10'), 
(2, 'Corte de Suministro Eléctrico', 'El centro permanecerá cerrado el próximo lunes por obras.', '2026-02-15'), 
(3, 'Exposición de Cerámica', 'No te pierdas las piezas creadas por los alumnos de nivel pro.', '2026-03-20'), 
(4, 'Gala Benéfica Danza', 'Todo lo recaudado irá destinado a proyectos sociales.', '2026-04-05'), 
(5, 'Mantenimiento del Aula Virtual', 'Actualización programada para este domingo a las 22:00.', NOW()), 
(6, 'Nuevas Plazas: Piano Verano', 'Abierto el plazo de inscripción para el intensivo de julio.', NOW()); 

-- ----------------------------------------------------- 
-- 5. TALLERES (IDs 1 al 5) 
-- ----------------------------------------------------- 
INSERT INTO `taller` (id_taller, nombre, descripcion, id_profesor, fecha_inicio, fecha_fin, plazas_maximas, precio, activo) VALUES 
(1, 'Guitarra Acústica', 'Aprende desde cero: acordes, ritmo y canciones.', 3, '2026-02-01', '2026-06-30', 15, 45.00, 1), 
(2, 'Piano Clásico', 'Técnica de manos, lectura y piezas clásicas.', 3, '2026-01-15', '2026-05-15', 10, 60.00, 1), 
(3, 'Danza Contemporánea', 'Expresión corporal y técnicas de movimiento.', 4, '2026-03-01', '2026-07-15', 20, 35.00, 1), 
(4, 'Alfarería y Torno', 'Creación de piezas de barro y técnicas de esmaltado.', 4, '2026-02-10', '2026-06-15', 12, 50.00, 1), 
(5, 'Corte y Confección', 'Diseño de patrones y uso de máquina de coser.', 5, '2026-01-10', '2026-05-30', 15, 40.00, 1); 

-- ----------------------------------------------------- 
-- 6. HORARIOS (3 sesiones por taller) 
-- ----------------------------------------------------- 
INSERT INTO `horario` (id_taller, dia_semana, hora_inicio, hora_fin) VALUES 
(1,'Lunes','17:00','18:30'),(1,'Miércoles','17:00','18:30'),(1,'Viernes','17:00','18:30'), 
(2,'Martes','16:00','18:00'),(2,'Jueves','16:00','18:00'),(2,'Sábado','10:00','12:00'), 
(3,'Lunes','18:00','20:00'),(3,'Miércoles','18:00','20:00'),(3,'Sábado','12:00','14:00'), 
(4,'Lunes','10:00','13:00'),(4,'Martes','10:00','13:00'),(4,'Viernes','10:00','13:00'), 
(5,'Lunes','17:00','20:00'),(5,'Martes','17:00','20:00'),(5,'Miércoles','17:00','20:00'); 

-- ----------------------------------------------------- 
-- 7. MATERIALES DIDÁCTICOS (4 por taller = 20 materiales) 
-- ----------------------------------------------------- 
INSERT INTO `material` (id_material, id_taller, titulo, contenido, fecha_subida, visible) VALUES 
(1,1,'Introducción Guitarra','Teoría básica de cuerdas.','2026-01-15',1), 
(2,1,'Acordes Mayores','PDF con posiciones.','2026-02-10',1), 
(3,1,'Escalas Pentatónicas','Ejercicios de velocidad.',NOW(),1), 
(4,1,'Manual de Mantenimiento','Cómo cambiar cuerdas.',NOW(),1), 
(5,2,'Posición de Manos','Vídeo inicial.','2026-01-15',1), 
(6,2,'Partitura de Do','Ejercicio 1.','2026-02-10',1), 
(7,2,'El Pedal Sostenido','Técnica avanzada.',NOW(),1), 
(8,2,'Lectura de Pentagrama','Guía rápida.',NOW(),1), 
(9,3,'Higiene Postural','Para evitar lesiones.','2026-01-15',1), 
(10,3,'Pasos Básicos','Vídeo explicativo.','2026-02-10',1), 
(11,3,'Coreografía Nivel 1','Secuencia grabada.',NOW(),1), 
(12,3,'Estiramientos Finales','Guía de PDF.',NOW(),1), 
(13,4,'Tipos de Arcilla','Manual de materiales.','2026-01-15',1), 
(14,4,'El Torno','Seguridad y uso.','2026-02-10',1), 
(15,4,'Esmaltes Base','Mezclas de color.',NOW(),1), 
(16,4,'Secado y Cocción','Tiempos de horno.',NOW(),1), 
(17,5,'Hilos y Agujas','Diferencias de gramaje.','2026-01-15',1), 
(18,5,'Corte de Patrón','Introducción al diseño.','2026-02-10',1), 
(19,5,'Costura Invisible','Técnica de acabado.',NOW(),1), 
(20,5,'Máquina Remalladora','Enhebrado paso a paso.',NOW(),1); 

-- ----------------------------------------------------- 
-- 8. TAREAS EVALUABLES (4 por taller = 20 tareas) 
-- ----------------------------------------------------- 
INSERT INTO `tarea` (id_tarea, id_taller, titulo, descripcion, fecha_publicacion, fecha_entrega, visible) VALUES 
(1,1,'Grabación Acordes','Grabar vídeo ejecutando la progresión I-IV-V','2026-01-20','2026-02-01',1), 
(2,1,'Práctica Escala','Tocar escala pentatónica a 80 BPM','2026-02-15','2026-03-01',1), 
(3,1,'Punteo Libre','Crear un solo de 8 compases sobre base de Blues',NOW(),'2026-06-10',1), 
(4,1,'Examen Teórico','Cuestionario sobre lectura de tablaturas',NOW(),'2026-06-20',1), 
(5,2,'Escala Do Mayor','Ejecución correcta con ambas manos','2026-01-20','2026-02-01',1), 
(6,2,'Ejercicio Hanon','Practicar los primeros 5 ejercicios de Hanon','2026-02-15','2026-03-01',1), 
(7,2,'Vídeo Blues','Grabación de pieza corta estilo Jazz-Blues',NOW(),'2026-06-15',1), 
(8,2,'Composición 2 compases','Escribir y tocar una melodía original',NOW(),'2026-06-30',1), 
(9,3,'Vídeo Calentamiento','Rutina de 5 minutos de estiramientos','2026-01-20','2026-02-01',1), 
(10,3,'Secuencia Suelo','Grabación de la coreografía de suelo nivel 1','2026-02-15','2026-03-01',1), 
(11,3,'Salto Clásico','Demostración técnica de salto de altura',NOW(),'2026-06-10',1), 
(12,3,'Estilo Libre','Interpretación de 30 segundos sin pautas',NOW(),'2026-07-01',1), 
(13,4,'Foto de tu Bol','Subir imagen del primer bol moldeado a mano','2026-01-20','2026-02-01',1), 
(14,4,'Pieza Texturizada','Uso de herramientas para crear texturas en barro','2026-02-15','2026-03-01',1), 
(15,4,'Asa de Taza','Modelado y unión de asa mediante barbotina',NOW(),'2026-06-05',1), 
(16,4,'Juego de Té','Proyecto final: tetera y dos tazas a juego',NOW(),'2026-06-25',1), 
(17,5,'Coser un botón','Demostración de costura cruzada resistente','2026-01-20','2026-02-01',1), 
(18,5,'Dobladillo Falda','Coser dobladillo invisible a máquina o mano','2026-02-15','2026-03-01',1), 
(19,5,'Bolsillo Plastrón','Confección y pegado de bolsillo exterior',NOW(),'2026-06-08',1), 
(20,5,'Vestido Final','Proyecto final: Prenda completa terminada',NOW(),'2026-07-15',1); 

-- ----------------------------------------------------- 
-- 9. FORO DE MENSAJES (Interacción de alumnos y profes) 
-- ----------------------------------------------------- 
INSERT INTO `mensaje` (id_taller, id_usuario, contenido, fecha_envio) VALUES 
(1,6,'¿Mejor púa de 0.7 o de 1.0?',NOW()), 
(1,3,'Depende del estilo, Hugo.',NOW()), 
(1,23,'He roto la cuerda Mi.',NOW()), 
(1,3,'Revisa el material de mantenimiento.',NOW()), 
(2,28,'¿El examen es presencial?',NOW()), 
(2,3,'No, sube el vídeo aquí.',NOW()), 
(2,29,'¿Vale un teclado eléctrico?',NOW()), 
(2,3,'Sí, si tiene sensibilidad.',NOW()), 
(3,33,'¿Qué ropa es mejor llevar?',NOW()), 
(3,4,'Mallas y calcetines.',NOW()), 
(3,34,'¿Habrá ensayo el sábado?',NOW()), 
(3,4,'Sí, revisa el horario.',NOW()), 
(4,38,'¿Puedo usar mi propia arcilla?',NOW()), 
(4,4,'No, solo la del centro.',NOW()), 
(4,39,'¿A qué temperatura se hornea?',NOW()), 
(4,4,'A 980 grados.',NOW()), 
(5,40,'¿La máquina 2 está rota?',NOW()), 
(5,5,'Mañana la arreglan.',NOW()), 
(5,21,'¿Alguien tiene hilo rojo?',NOW()), 
(5,5,'Hay en el armario B.',NOW()); 

-- ----------------------------------------------------- 
-- 10. INSCRIPCIONES (Relación Usuarios-Talleres) 
-- ----------------------------------------------------- 
INSERT INTO `inscripcion` (id_usuario, id_taller, monto_pagado, estado_pago, activa, fecha_inscripcion, fecha_pago, order_id) 
SELECT id_usuario, 1, 45, 'PAGADO', 1, '2026-01-10', '2026-01-15', CONCAT('ORD-T1-', id_usuario) FROM `usuario` WHERE id_usuario BETWEEN 21 AND 28; 

INSERT INTO `inscripcion` (id_usuario, id_taller, monto_pagado, estado_pago, activa, fecha_inscripcion, fecha_pago, order_id) 
SELECT id_usuario, 2, 60, 'PAGADO', 1, '2026-01-11', '2026-01-16', CONCAT('ORD-T2-', id_usuario) FROM `usuario` WHERE id_usuario BETWEEN 29 AND 32; 

INSERT INTO `inscripcion` (id_usuario, id_taller, monto_pagado, estado_pago, activa, fecha_inscripcion, fecha_pago, order_id) 
SELECT id_usuario, 3, 35, 'PAGADO', 1, '2026-01-12', '2026-01-17', CONCAT('ORD-T3-', id_usuario) FROM `usuario` WHERE id_usuario BETWEEN 33 AND 36; 

INSERT INTO `inscripcion` (id_usuario, id_taller, monto_pagado, estado_pago, activa, fecha_inscripcion, fecha_pago, order_id) 
SELECT id_usuario, 4, 50, 'PAGADO', 1, '2026-01-13', '2026-01-18', CONCAT('ORD-T4-', id_usuario) FROM `usuario` WHERE id_usuario BETWEEN 37 AND 40; 

INSERT INTO `inscripcion` (id_usuario, id_taller, monto_pagado, estado_pago, activa, fecha_inscripcion, fecha_pago, order_id) 
SELECT id_usuario, 5, 40, 'PAGADO', 1, '2026-01-14', '2026-01-19', CONCAT('ORD-T5-', id_usuario) FROM `usuario` WHERE id_usuario BETWEEN 21 AND 25; 

-- ----------------------------------------------------- 
-- 11. TAREAS ASIGNADAS Y ENTREGAS FINALES 
-- ----------------------------------------------------- 
INSERT INTO `tareas_asignadas` (id_usuario, id_tarea) VALUES 
(21, 3), (22, 3), (23, 7), (24, 7); 

INSERT INTO `entrega` (id_usuario, id_tarea, fecha_entrega, texto_entrega, calificacion, comentario_profesor) VALUES 
(21, 1, '2026-01-30', 'Adjunto mi grabación de acordes básicos.', 8.5, 'Muy buena ejecución, cuidado con el cambio al acorde de Sol.'), 
(37, 13, '2026-01-31', 'Foto de mi primer bol de barro.', 9.0, 'Excelente técnica de modelado, el acabado es muy uniforme.'), 
(33, 9, '2026-01-28', 'Vídeo del calentamiento completado.', NULL, NULL), 
(29, 5, '2026-01-25', 'Subida la escala de Do Mayor.', 7.0, 'Buen ritmo, pero falta un poco de fluidez en las notas agudas.'), 
(21, 3, NOW(), 'Aquí mi audio de punteo libre.', NULL, NULL); 

-- FINALIZACIÓN 
COMMIT; 
SET FOREIGN_KEY_CHECKS = 1;