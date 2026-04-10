-- =====================================================
-- AQUARIUS CONSULTING SAC - Sistema de Gestion RRHH
-- Script de inicializacion de Base de Datos
-- SQL Server
-- =====================================================

IF NOT EXISTS (SELECT * FROM sys.databases WHERE name = 'AquariusRRHH')
BEGIN
    CREATE DATABASE AquariusRRHH;
END
GO

USE AquariusRRHH;
GO

-- =====================================================
-- TABLA: usuarios
-- =====================================================
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'usuarios')
CREATE TABLE usuarios (
    id INT IDENTITY(1,1) PRIMARY KEY,
    email NVARCHAR(255) NOT NULL UNIQUE,
    password_hash NVARCHAR(255) NOT NULL,
    nombre NVARCHAR(200) NOT NULL,
    dni NVARCHAR(20) UNIQUE,
    rol NVARCHAR(20) NOT NULL CHECK (rol IN ('admin', 'evaluador', 'postulante', 'trabajador')),
    telefono NVARCHAR(20),
    activo BIT DEFAULT 1,
    fecha_creacion DATETIME2 DEFAULT GETDATE(),
    ultimo_acceso DATETIME2
);

-- =====================================================
-- TABLA: postulantes
-- =====================================================
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'postulantes')
CREATE TABLE postulantes (
    id INT IDENTITY(1,1) PRIMARY KEY,
    usuario_id INT NOT NULL FOREIGN KEY REFERENCES usuarios(id),
    puesto NVARCHAR(200) NOT NULL,
    estado NVARCHAR(30) DEFAULT 'En Evaluacion' CHECK (estado IN ('En Evaluacion', 'Aprobado', 'Rechazado', 'Trabajador')),
    avance INT DEFAULT 0,
    riesgo NVARCHAR(10) DEFAULT 'bajo' CHECK (riesgo IN ('bajo', 'medio', 'alto')),
    fecha_registro DATETIME2 DEFAULT GETDATE(),
    comentarios NVARCHAR(MAX)
);

-- =====================================================
-- TABLA: ficha_personal (datos del postulante - 8 secciones)
-- =====================================================
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'ficha_personal')
CREATE TABLE ficha_personal (
    id INT IDENTITY(1,1) PRIMARY KEY,
    postulante_id INT NOT NULL FOREIGN KEY REFERENCES postulantes(id),
    -- Datos personales
    nombres NVARCHAR(100),
    apellido_paterno NVARCHAR(100),
    apellido_materno NVARCHAR(100),
    fecha_nacimiento DATE,
    lugar_nacimiento NVARCHAR(200),
    estado_civil NVARCHAR(30),
    genero NVARCHAR(20),
    direccion NVARCHAR(300),
    distrito NVARCHAR(100),
    provincia NVARCHAR(100),
    departamento NVARCHAR(100),
    telefono NVARCHAR(20),
    telefono_emergencia NVARCHAR(20),
    contacto_emergencia NVARCHAR(100),
    -- Formacion
    grado_instruccion NVARCHAR(50),
    carrera NVARCHAR(200),
    universidad NVARCHAR(200),
    anio_egreso INT,
    colegiatura NVARCHAR(50),
    -- Experiencia (JSON array)
    experiencia_laboral NVARCHAR(MAX),
    -- Idiomas (JSON array)
    idiomas NVARCHAR(MAX),
    -- Habilidades (JSON array)
    habilidades NVARCHAR(MAX),
    -- Referencias (JSON array)
    referencias NVARCHAR(MAX),
    -- Expectativas
    pretension_salarial DECIMAL(10,2),
    disponibilidad NVARCHAR(50),
    modalidad_preferida NVARCHAR(50),
    -- Salud
    tipo_sangre NVARCHAR(10),
    alergias NVARCHAR(300),
    condiciones_medicas NVARCHAR(300),
    discapacidad BIT DEFAULT 0,
    detalle_discapacidad NVARCHAR(300),
    fecha_actualizacion DATETIME2 DEFAULT GETDATE()
);

-- =====================================================
-- TABLA: evaluaciones
-- =====================================================
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'evaluaciones')
CREATE TABLE evaluaciones (
    id INT IDENTITY(1,1) PRIMARY KEY,
    nombre NVARCHAR(200) NOT NULL,
    tipo NVARCHAR(30) NOT NULL CHECK (tipo IN ('tecnica', 'psicologica', 'entrevista')),
    descripcion NVARCHAR(MAX),
    duracion_minutos INT DEFAULT 60,
    puntaje_minimo INT DEFAULT 60,
    activa BIT DEFAULT 1,
    fecha_creacion DATETIME2 DEFAULT GETDATE()
);

-- =====================================================
-- TABLA: preguntas
-- =====================================================
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'preguntas')
CREATE TABLE preguntas (
    id INT IDENTITY(1,1) PRIMARY KEY,
    evaluacion_id INT NOT NULL FOREIGN KEY REFERENCES evaluaciones(id),
    pregunta NVARCHAR(MAX) NOT NULL,
    opciones NVARCHAR(MAX) NOT NULL, -- JSON array
    respuesta_correcta INT NOT NULL,
    puntaje INT DEFAULT 20,
    orden INT DEFAULT 0
);

-- =====================================================
-- TABLA: evaluacion_postulante (asignacion)
-- =====================================================
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'evaluacion_postulante')
CREATE TABLE evaluacion_postulante (
    id INT IDENTITY(1,1) PRIMARY KEY,
    evaluacion_id INT NOT NULL FOREIGN KEY REFERENCES evaluaciones(id),
    postulante_id INT NOT NULL FOREIGN KEY REFERENCES postulantes(id),
    evaluador_id INT FOREIGN KEY REFERENCES usuarios(id),
    puntaje_obtenido INT,
    estado NVARCHAR(20) DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'en_progreso', 'completada', 'calificada')),
    fecha_asignacion DATETIME2 DEFAULT GETDATE(),
    fecha_completado DATETIME2,
    comentario_evaluador NVARCHAR(MAX)
);

-- =====================================================
-- TABLA: respuestas
-- =====================================================
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'respuestas')
CREATE TABLE respuestas (
    id INT IDENTITY(1,1) PRIMARY KEY,
    evaluacion_postulante_id INT NOT NULL FOREIGN KEY REFERENCES evaluacion_postulante(id),
    pregunta_id INT NOT NULL FOREIGN KEY REFERENCES preguntas(id),
    respuesta_seleccionada INT NOT NULL,
    es_correcta BIT,
    fecha_respuesta DATETIME2 DEFAULT GETDATE()
);

-- =====================================================
-- TABLA: documentos
-- =====================================================
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'documentos')
CREATE TABLE documentos (
    id INT IDENTITY(1,1) PRIMARY KEY,
    postulante_id INT NOT NULL FOREIGN KEY REFERENCES postulantes(id),
    tipo NVARCHAR(100) NOT NULL,
    nombre_archivo NVARCHAR(300),
    url NVARCHAR(500),
    estado NVARCHAR(20) DEFAULT 'pending' CHECK (estado IN ('ok', 'pending', 'na', 'rechazado')),
    requerido BIT DEFAULT 1,
    observacion NVARCHAR(300),
    fecha_subida DATETIME2,
    fecha_revision DATETIME2
);

-- =====================================================
-- TABLA: entrevistas
-- =====================================================
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'entrevistas')
CREATE TABLE entrevistas (
    id INT IDENTITY(1,1) PRIMARY KEY,
    postulante_id INT NOT NULL FOREIGN KEY REFERENCES postulantes(id),
    tipo NVARCHAR(30) NOT NULL CHECK (tipo IN ('tecnica', 'psicologica', 'entrevista')),
    fecha DATE NOT NULL,
    hora NVARCHAR(20) NOT NULL,
    lugar NVARCHAR(200),
    evaluador_nombre NVARCHAR(200),
    duracion NVARCHAR(20),
    estado NVARCHAR(20) DEFAULT 'programada' CHECK (estado IN ('programada', 'completada', 'cancelada', 'reprogramada')),
    notas NVARCHAR(MAX)
);

-- =====================================================
-- TABLA: firmas_digitales
-- =====================================================
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'firmas_digitales')
CREATE TABLE firmas_digitales (
    id INT IDENTITY(1,1) PRIMARY KEY,
    usuario_id INT NOT NULL FOREIGN KEY REFERENCES usuarios(id),
    tipo_documento NVARCHAR(100) NOT NULL,
    firma_data NVARCHAR(MAX) NOT NULL, -- base64
    ip_address NVARCHAR(50),
    hash_documento NVARCHAR(128),
    fecha_firma DATETIME2 DEFAULT GETDATE()
);

-- =====================================================
-- TABLA: derechohabientes
-- =====================================================
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'derechohabientes')
CREATE TABLE derechohabientes (
    id INT IDENTITY(1,1) PRIMARY KEY,
    trabajador_id INT NOT NULL FOREIGN KEY REFERENCES postulantes(id),
    nombre_completo NVARCHAR(200) NOT NULL,
    parentesco NVARCHAR(50) NOT NULL,
    dni NVARCHAR(20),
    fecha_nacimiento DATE,
    genero NVARCHAR(20),
    telefono NVARCHAR(20)
);

-- =====================================================
-- TABLA: datos_bancarios
-- =====================================================
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'datos_bancarios')
CREATE TABLE datos_bancarios (
    id INT IDENTITY(1,1) PRIMARY KEY,
    trabajador_id INT NOT NULL FOREIGN KEY REFERENCES postulantes(id),
    tiene_cuenta BIT DEFAULT 0,
    entidad NVARCHAR(200),
    tipo_cuenta NVARCHAR(30),
    numero_cuenta NVARCHAR(30),
    cci NVARCHAR(30),
    fecha_actualizacion DATETIME2 DEFAULT GETDATE()
);

-- =====================================================
-- TABLA: regimen_pensionario
-- =====================================================
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'regimen_pensionario')
CREATE TABLE regimen_pensionario (
    id INT IDENTITY(1,1) PRIMARY KEY,
    trabajador_id INT NOT NULL FOREIGN KEY REFERENCES postulantes(id),
    tipo NVARCHAR(10) NOT NULL CHECK (tipo IN ('afp', 'onp')),
    entidad NVARCHAR(100),
    cuspp NVARCHAR(30),
    primer_trabajo BIT DEFAULT 0,
    fecha_actualizacion DATETIME2 DEFAULT GETDATE()
);

-- =====================================================
-- TABLA: capacitaciones
-- =====================================================
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'capacitaciones')
CREATE TABLE capacitaciones (
    id INT IDENTITY(1,1) PRIMARY KEY,
    nombre NVARCHAR(200) NOT NULL,
    descripcion NVARCHAR(MAX),
    fecha_limite DATE,
    obligatoria BIT DEFAULT 1,
    fecha_creacion DATETIME2 DEFAULT GETDATE()
);

-- =====================================================
-- TABLA: capacitacion_trabajador
-- =====================================================
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'capacitacion_trabajador')
CREATE TABLE capacitacion_trabajador (
    id INT IDENTITY(1,1) PRIMARY KEY,
    capacitacion_id INT NOT NULL FOREIGN KEY REFERENCES capacitaciones(id),
    trabajador_id INT NOT NULL FOREIGN KEY REFERENCES postulantes(id),
    cumplimiento INT DEFAULT 0,
    fecha_completado DATETIME2,
    certificado_url NVARCHAR(500)
);

-- =====================================================
-- TABLA: auditoria
-- =====================================================
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'auditoria')
CREATE TABLE auditoria (
    id INT IDENTITY(1,1) PRIMARY KEY,
    usuario_id INT FOREIGN KEY REFERENCES usuarios(id),
    accion NVARCHAR(100) NOT NULL,
    detalle NVARCHAR(MAX),
    ip_address NVARCHAR(50),
    fecha DATETIME2 DEFAULT GETDATE()
);

-- =====================================================
-- TABLA: configuracion
-- =====================================================
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'configuracion')
CREATE TABLE configuracion (
    id INT IDENTITY(1,1) PRIMARY KEY,
    clave NVARCHAR(100) NOT NULL UNIQUE,
    valor NVARCHAR(MAX),
    descripcion NVARCHAR(300),
    fecha_actualizacion DATETIME2 DEFAULT GETDATE()
);

-- =====================================================
-- TABLA: ia_analisis
-- =====================================================
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'ia_analisis')
CREATE TABLE ia_analisis (
    id INT IDENTITY(1,1) PRIMARY KEY,
    postulante_id INT NOT NULL FOREIGN KEY REFERENCES postulantes(id),
    tipo NVARCHAR(50) NOT NULL, -- cv_analysis, scoring, insights
    resultado NVARCHAR(MAX), -- JSON
    score INT,
    fecha DATETIME2 DEFAULT GETDATE()
);

-- =====================================================
-- INDICES
-- =====================================================
CREATE INDEX IX_postulantes_estado ON postulantes(estado);
CREATE INDEX IX_postulantes_usuario ON postulantes(usuario_id);
CREATE INDEX IX_evaluacion_postulante_estado ON evaluacion_postulante(estado);
CREATE INDEX IX_documentos_postulante ON documentos(postulante_id);
CREATE INDEX IX_auditoria_fecha ON auditoria(fecha);
CREATE INDEX IX_usuarios_rol ON usuarios(rol);
CREATE INDEX IX_usuarios_dni ON usuarios(dni);

PRINT 'Base de datos AquariusRRHH creada exitosamente.';
GO
