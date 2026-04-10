-- =====================================================
-- AQUARIUS CONSULTING SAC - Datos Iniciales (Seed)
-- =====================================================

USE AquariusRRHH;
GO

-- =====================================================
-- USUARIOS (password: aquarius2026 -> hash bcrypt)
-- =====================================================
INSERT INTO usuarios (email, password_hash, nombre, dni, rol, telefono) VALUES
('admin@aquarius.pe', '$2b$12$LJ3m4ys4Gz5iGPQI1SXROO0YdK6/B.4K6r3aQEXJNfS0T1qDC6IWa', 'Administrador Sistema', '00000001', 'admin', '999000001'),
('cmendoza@aquarius.pe', '$2b$12$LJ3m4ys4Gz5iGPQI1SXROO0YdK6/B.4K6r3aQEXJNfS0T1qDC6IWa', 'Carlos Medina', '00000002', 'evaluador', '999000002'),
('msegovia@aquarius.pe', '$2b$12$LJ3m4ys4Gz5iGPQI1SXROO0YdK6/B.4K6r3aQEXJNfS0T1qDC6IWa', 'Maria Segovia', '00000003', 'evaluador', '999000003'),
('carlos.mendoza@email.com', '$2b$12$LJ3m4ys4Gz5iGPQI1SXROO0YdK6/B.4K6r3aQEXJNfS0T1qDC6IWa', 'Carlos Mendoza', '45678912', 'postulante', '999100001'),
('maria.lopez@email.com', '$2b$12$LJ3m4ys4Gz5iGPQI1SXROO0YdK6/B.4K6r3aQEXJNfS0T1qDC6IWa', 'Maria Lopez', '78912345', 'trabajador', '999100002'),
('roberto.garcia@email.com', '$2b$12$LJ3m4ys4Gz5iGPQI1SXROO0YdK6/B.4K6r3aQEXJNfS0T1qDC6IWa', 'Roberto Garcia', '12345678', 'postulante', '999100003'),
('ana.torres@email.com', '$2b$12$LJ3m4ys4Gz5iGPQI1SXROO0YdK6/B.4K6r3aQEXJNfS0T1qDC6IWa', 'Ana Torres', '65432198', 'postulante', '999100004'),
('luis.vargas@email.com', '$2b$12$LJ3m4ys4Gz5iGPQI1SXROO0YdK6/B.4K6r3aQEXJNfS0T1qDC6IWa', 'Luis Vargas', '98765432', 'postulante', '999100005'),
('patricia.ruiz@email.com', '$2b$12$LJ3m4ys4Gz5iGPQI1SXROO0YdK6/B.4K6r3aQEXJNfS0T1qDC6IWa', 'Patricia Ruiz', '34567891', 'trabajador', '999100006'),
('jorge.castillo@email.com', '$2b$12$LJ3m4ys4Gz5iGPQI1SXROO0YdK6/B.4K6r3aQEXJNfS0T1qDC6IWa', 'Jorge Castillo', '56789012', 'postulante', '999100007'),
('diana.flores@email.com', '$2b$12$LJ3m4ys4Gz5iGPQI1SXROO0YdK6/B.4K6r3aQEXJNfS0T1qDC6IWa', 'Diana Flores', '89012345', 'trabajador', '999100008');

-- =====================================================
-- POSTULANTES
-- =====================================================
INSERT INTO postulantes (usuario_id, puesto, estado, avance, riesgo) VALUES
(4, 'Analista Financiero', 'En Evaluacion', 72, 'bajo'),
(5, 'Coordinadora RRHH', 'Trabajador', 100, 'bajo'),
(6, 'Desarrollador Senior', 'En Evaluacion', 45, 'medio'),
(7, 'Analista Contable', 'Rechazado', 88, 'alto'),
(8, 'Gerente de Proyectos', 'En Evaluacion', 60, 'bajo'),
(9, 'Asistente Legal', 'Trabajador', 95, 'bajo'),
(10, 'Ingeniero Civil', 'En Evaluacion', 30, 'alto'),
(11, 'Disenadora UX', 'Trabajador', 100, 'bajo');

-- =====================================================
-- EVALUACIONES
-- =====================================================
INSERT INTO evaluaciones (nombre, tipo, descripcion, duracion_minutos, puntaje_minimo) VALUES
('Evaluacion Tecnica - Finanzas', 'tecnica', 'Evaluacion de conocimientos financieros y contables', 45, 60),
('Evaluacion Psicologica', 'psicologica', 'Evaluacion de competencias blandas y perfil psicologico', 60, 50),
('Entrevista Final', 'entrevista', 'Entrevista con Gerente de RRHH', 30, 70);

-- =====================================================
-- PREGUNTAS
-- =====================================================
INSERT INTO preguntas (evaluacion_id, pregunta, opciones, respuesta_correcta, puntaje, orden) VALUES
(1, 'Cual es la formula del WACC?', '["Costo deuda + Costo equity","Wd*Kd*(1-T) + We*Ke","EBITDA / Ventas","Activo / Pasivo"]', 1, 20, 1),
(1, 'El VAN positivo indica que:', '["Destruye valor","Es indiferente","Genera valor sobre tasa requerida","Ninguna"]', 2, 20, 2),
(1, 'Que estado financiero muestra la liquidez?', '["Estado de Resultados","Balance General","Flujo de Efectivo","Cambios en Patrimonio"]', 2, 20, 3),
(1, 'La TIR es la tasa que hace el VAN igual a:', '["1","-1","0","Infinito"]', 2, 20, 4),
(1, 'Cual NO es un ratio de liquidez?', '["Razon corriente","Prueba acida","ROE","Capital de trabajo"]', 2, 20, 5);

-- =====================================================
-- EVALUACION_POSTULANTE (asignaciones)
-- =====================================================
INSERT INTO evaluacion_postulante (evaluacion_id, postulante_id, evaluador_id, puntaje_obtenido, estado) VALUES
(1, 1, 2, 85, 'calificada'),
(2, 1, 3, 78, 'calificada'),
(1, 2, 2, 92, 'calificada'),
(2, 2, 3, 88, 'calificada'),
(3, 2, 2, 90, 'calificada'),
(1, 3, 2, 70, 'calificada'),
(2, 3, 3, 65, 'calificada'),
(1, 4, 2, 45, 'calificada'),
(2, 4, 3, 52, 'calificada'),
(3, 4, 2, 40, 'calificada'),
(1, 5, 2, 88, 'calificada'),
(2, 5, 3, 82, 'calificada');

-- =====================================================
-- DOCUMENTOS
-- =====================================================
INSERT INTO documentos (postulante_id, tipo, nombre_archivo, estado, requerido) VALUES
(1, 'DNI', 'dni_carlos_mendoza.pdf', 'ok', 1),
(1, 'CV', 'cv_carlos_mendoza.pdf', 'ok', 1),
(1, 'Foto Pasaporte', NULL, 'pending', 1),
(1, 'Certificados Estudio', 'cert_estudios_mendoza.pdf', 'ok', 1),
(1, 'Constancias Laborales', 'constancias_mendoza.pdf', 'ok', 1),
(1, 'Licencia Conducir', NULL, 'na', 0),
(1, 'Antecedentes Policiales', NULL, 'pending', 0),
(1, 'Antecedentes Penales', NULL, 'pending', 0),
(1, 'Certificado Medico', NULL, 'pending', 0),
(1, 'Cert. Capacitacion', 'capacitacion_mendoza.pdf', 'ok', 0);

-- =====================================================
-- ENTREVISTAS
-- =====================================================
INSERT INTO entrevistas (postulante_id, tipo, fecha, hora, lugar, evaluador_nombre, duracion) VALUES
(1, 'tecnica', '2026-04-05', '10:00 AM', 'Virtual - Google Meet', 'Ing. Carlos Medina', '45 min'),
(1, 'psicologica', '2026-04-08', '2:00 PM', 'Oficina Central - Sala 3B', 'Lic. Maria Segovia', '60 min'),
(1, 'entrevista', '2026-04-15', '11:00 AM', 'Virtual - Zoom', 'Gerente RRHH', '30 min');

-- =====================================================
-- CAPACITACIONES
-- =====================================================
INSERT INTO capacitaciones (nombre, descripcion, fecha_limite, obligatoria) VALUES
('Seguridad y Salud en el Trabajo', 'Curso obligatorio de SST segun ley peruana', '2026-04-10', 1),
('Codigo de Etica Corporativa', 'Conocimiento del codigo de etica de la empresa', '2026-04-05', 1),
('Manejo de Residuos', 'Capacitacion en gestion ambiental', '2026-04-15', 0);

-- =====================================================
-- CAPACITACION_TRABAJADOR
-- =====================================================
INSERT INTO capacitacion_trabajador (capacitacion_id, trabajador_id, cumplimiento) VALUES
(1, 2, 100),
(2, 2, 100),
(3, 2, 80),
(1, 6, 100),
(2, 6, 100),
(1, 8, 100),
(2, 8, 100),
(3, 8, 100);

-- =====================================================
-- CONFIGURACION
-- =====================================================
INSERT INTO configuracion (clave, valor, descripcion) VALUES
('empresa_nombre', 'Aquarius Consulting SAC', 'Nombre de la empresa'),
('empresa_ruc', '20123456789', 'RUC de la empresa'),
('empresa_direccion', 'Av. Javier Prado Este 1234, San Isidro, Lima', 'Direccion fiscal'),
('puntaje_aprobacion', '70', 'Puntaje minimo para aprobar evaluaciones'),
('dias_vigencia_evaluacion', '30', 'Dias de vigencia de una evaluacion'),
('max_intentos_evaluacion', '2', 'Maximo de intentos por evaluacion'),
('notificaciones_email', 'true', 'Activar notificaciones por email'),
('ia_provider', 'anthropic', 'Proveedor de IA (anthropic/openai)'),
('ia_model_chat', 'claude-haiku-4-5-20251001', 'Modelo para chatbot'),
('ia_model_analysis', 'claude-sonnet-4-6-20250514', 'Modelo para analisis de CVs');

PRINT 'Datos iniciales insertados exitosamente.';
GO
