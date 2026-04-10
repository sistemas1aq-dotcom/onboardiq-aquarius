-- =====================================================
-- AQUARIUS CONSULTING SAC - Sistema de Gestion RRHH
-- Script de inicializacion de Base de Datos
-- PostgreSQL (compatible con Neon)
-- =====================================================

-- =====================================================
-- TABLA: usuarios
-- =====================================================
CREATE TABLE IF NOT EXISTS usuarios (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    nombre VARCHAR(200) NOT NULL,
    dni VARCHAR(20) UNIQUE,
    rol VARCHAR(20) NOT NULL CHECK (rol IN ('admin', 'evaluador', 'postulante', 'trabajador')),
    telefono VARCHAR(20),
    activo BOOLEAN DEFAULT TRUE,
    fecha_creacion TIMESTAMPTZ DEFAULT NOW(),
    ultimo_acceso TIMESTAMPTZ
);

-- =====================================================
-- TABLA: postulantes
-- =====================================================
CREATE TABLE IF NOT EXISTS postulantes (
    id SERIAL PRIMARY KEY,
    usuario_id INT NOT NULL REFERENCES usuarios(id),
    puesto VARCHAR(200) NOT NULL,
    estado VARCHAR(30) DEFAULT 'En Evaluacion' CHECK (estado IN ('En Evaluacion', 'Aprobado', 'Rechazado', 'Trabajador')),
    avance INT DEFAULT 0,
    riesgo VARCHAR(10) DEFAULT 'bajo' CHECK (riesgo IN ('bajo', 'medio', 'alto')),
    fecha_registro TIMESTAMPTZ DEFAULT NOW(),
    comentarios TEXT
);

-- =====================================================
-- TABLA: ficha_personal (datos del postulante - 8 secciones)
-- =====================================================
CREATE TABLE IF NOT EXISTS ficha_personal (
    id SERIAL PRIMARY KEY,
    postulante_id INT NOT NULL REFERENCES postulantes(id),
    -- Datos personales
    nombres VARCHAR(100),
    apellido_paterno VARCHAR(100),
    apellido_materno VARCHAR(100),
    fecha_nacimiento DATE,
    lugar_nacimiento VARCHAR(200),
    estado_civil VARCHAR(30),
    genero VARCHAR(20),
    direccion VARCHAR(300),
    distrito VARCHAR(100),
    provincia VARCHAR(100),
    departamento VARCHAR(100),
    telefono VARCHAR(20),
    telefono_emergencia VARCHAR(20),
    contacto_emergencia VARCHAR(100),
    -- Formacion
    grado_instruccion VARCHAR(50),
    carrera VARCHAR(200),
    universidad VARCHAR(200),
    anio_egreso INT,
    colegiatura VARCHAR(50),
    -- Experiencia (JSON array)
    experiencia_laboral TEXT,
    -- Idiomas (JSON array)
    idiomas TEXT,
    -- Habilidades (JSON array)
    habilidades TEXT,
    -- Referencias (JSON array)
    referencias TEXT,
    -- Expectativas
    pretension_salarial NUMERIC(10,2),
    disponibilidad VARCHAR(50),
    modalidad_preferida VARCHAR(50),
    -- Salud
    tipo_sangre VARCHAR(10),
    alergias VARCHAR(300),
    condiciones_medicas VARCHAR(300),
    discapacidad BOOLEAN DEFAULT FALSE,
    detalle_discapacidad VARCHAR(300),
    fecha_actualizacion TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- TABLA: evaluaciones
-- =====================================================
CREATE TABLE IF NOT EXISTS evaluaciones (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(200) NOT NULL,
    tipo VARCHAR(30) NOT NULL CHECK (tipo IN ('tecnica', 'psicologica', 'entrevista')),
    descripcion TEXT,
    duracion_minutos INT DEFAULT 60,
    puntaje_minimo INT DEFAULT 60,
    activa BOOLEAN DEFAULT TRUE,
    fecha_creacion TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- TABLA: preguntas
-- =====================================================
CREATE TABLE IF NOT EXISTS preguntas (
    id SERIAL PRIMARY KEY,
    evaluacion_id INT NOT NULL REFERENCES evaluaciones(id),
    pregunta TEXT NOT NULL,
    opciones TEXT NOT NULL, -- JSON array
    respuesta_correcta INT NOT NULL,
    puntaje INT DEFAULT 20,
    orden INT DEFAULT 0
);

-- =====================================================
-- TABLA: evaluacion_postulante (asignacion)
-- =====================================================
CREATE TABLE IF NOT EXISTS evaluacion_postulante (
    id SERIAL PRIMARY KEY,
    evaluacion_id INT NOT NULL REFERENCES evaluaciones(id),
    postulante_id INT NOT NULL REFERENCES postulantes(id),
    evaluador_id INT REFERENCES usuarios(id),
    puntaje_obtenido INT,
    estado VARCHAR(20) DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'en_progreso', 'completada', 'calificada')),
    fecha_asignacion TIMESTAMPTZ DEFAULT NOW(),
    fecha_completado TIMESTAMPTZ,
    comentario_evaluador TEXT
);

-- =====================================================
-- TABLA: respuestas
-- =====================================================
CREATE TABLE IF NOT EXISTS respuestas (
    id SERIAL PRIMARY KEY,
    evaluacion_postulante_id INT NOT NULL REFERENCES evaluacion_postulante(id),
    pregunta_id INT NOT NULL REFERENCES preguntas(id),
    respuesta_seleccionada INT NOT NULL,
    es_correcta BOOLEAN,
    fecha_respuesta TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- TABLA: documentos
-- =====================================================
CREATE TABLE IF NOT EXISTS documentos (
    id SERIAL PRIMARY KEY,
    postulante_id INT NOT NULL REFERENCES postulantes(id),
    tipo VARCHAR(100) NOT NULL,
    nombre_archivo VARCHAR(300),
    url VARCHAR(500),
    estado VARCHAR(20) DEFAULT 'pending' CHECK (estado IN ('ok', 'pending', 'na', 'rechazado')),
    requerido BOOLEAN DEFAULT TRUE,
    observacion VARCHAR(300),
    fecha_subida TIMESTAMPTZ,
    fecha_revision TIMESTAMPTZ
);

-- =====================================================
-- TABLA: entrevistas
-- =====================================================
CREATE TABLE IF NOT EXISTS entrevistas (
    id SERIAL PRIMARY KEY,
    postulante_id INT NOT NULL REFERENCES postulantes(id),
    tipo VARCHAR(30) NOT NULL CHECK (tipo IN ('tecnica', 'psicologica', 'entrevista')),
    fecha DATE NOT NULL,
    hora VARCHAR(20) NOT NULL,
    lugar VARCHAR(200),
    evaluador_nombre VARCHAR(200),
    duracion VARCHAR(20),
    estado VARCHAR(20) DEFAULT 'programada' CHECK (estado IN ('programada', 'completada', 'cancelada', 'reprogramada')),
    notas TEXT
);

-- =====================================================
-- TABLA: firmas_digitales
-- =====================================================
CREATE TABLE IF NOT EXISTS firmas_digitales (
    id SERIAL PRIMARY KEY,
    usuario_id INT NOT NULL REFERENCES usuarios(id),
    tipo_documento VARCHAR(100) NOT NULL,
    firma_data TEXT NOT NULL, -- base64
    ip_address VARCHAR(50),
    hash_documento VARCHAR(128),
    fecha_firma TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- TABLA: derechohabientes
-- =====================================================
CREATE TABLE IF NOT EXISTS derechohabientes (
    id SERIAL PRIMARY KEY,
    trabajador_id INT NOT NULL REFERENCES postulantes(id),
    nombre_completo VARCHAR(200) NOT NULL,
    parentesco VARCHAR(50) NOT NULL,
    dni VARCHAR(20),
    fecha_nacimiento DATE,
    genero VARCHAR(20),
    telefono VARCHAR(20)
);

-- =====================================================
-- TABLA: datos_bancarios
-- =====================================================
CREATE TABLE IF NOT EXISTS datos_bancarios (
    id SERIAL PRIMARY KEY,
    trabajador_id INT NOT NULL REFERENCES postulantes(id),
    tiene_cuenta BOOLEAN DEFAULT FALSE,
    entidad VARCHAR(200),
    tipo_cuenta VARCHAR(30),
    numero_cuenta VARCHAR(30),
    cci VARCHAR(30),
    fecha_actualizacion TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- TABLA: regimen_pensionario
-- =====================================================
CREATE TABLE IF NOT EXISTS regimen_pensionario (
    id SERIAL PRIMARY KEY,
    trabajador_id INT NOT NULL REFERENCES postulantes(id),
    tipo VARCHAR(10) NOT NULL CHECK (tipo IN ('afp', 'onp')),
    entidad VARCHAR(100),
    cuspp VARCHAR(30),
    primer_trabajo BOOLEAN DEFAULT FALSE,
    fecha_actualizacion TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- TABLA: capacitaciones
-- =====================================================
CREATE TABLE IF NOT EXISTS capacitaciones (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(200) NOT NULL,
    descripcion TEXT,
    fecha_limite DATE,
    obligatoria BOOLEAN DEFAULT TRUE,
    fecha_creacion TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- TABLA: capacitacion_trabajador
-- =====================================================
CREATE TABLE IF NOT EXISTS capacitacion_trabajador (
    id SERIAL PRIMARY KEY,
    capacitacion_id INT NOT NULL REFERENCES capacitaciones(id),
    trabajador_id INT NOT NULL REFERENCES postulantes(id),
    cumplimiento INT DEFAULT 0,
    fecha_completado TIMESTAMPTZ,
    certificado_url VARCHAR(500)
);

-- =====================================================
-- TABLA: auditoria
-- =====================================================
CREATE TABLE IF NOT EXISTS auditoria (
    id SERIAL PRIMARY KEY,
    usuario_id INT REFERENCES usuarios(id),
    accion VARCHAR(100) NOT NULL,
    detalle TEXT,
    ip_address VARCHAR(50),
    fecha TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- TABLA: configuracion
-- =====================================================
CREATE TABLE IF NOT EXISTS configuracion (
    id SERIAL PRIMARY KEY,
    clave VARCHAR(100) NOT NULL UNIQUE,
    valor TEXT,
    descripcion VARCHAR(300),
    fecha_actualizacion TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- TABLA: ia_analisis
-- =====================================================
CREATE TABLE IF NOT EXISTS ia_analisis (
    id SERIAL PRIMARY KEY,
    postulante_id INT NOT NULL REFERENCES postulantes(id),
    tipo VARCHAR(50) NOT NULL, -- cv_analysis, scoring, insights
    resultado TEXT, -- JSON
    score INT,
    fecha TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- INDICES
-- =====================================================
CREATE INDEX IF NOT EXISTS IX_postulantes_estado ON postulantes(estado);
CREATE INDEX IF NOT EXISTS IX_postulantes_usuario ON postulantes(usuario_id);
CREATE INDEX IF NOT EXISTS IX_evaluacion_postulante_estado ON evaluacion_postulante(estado);
CREATE INDEX IF NOT EXISTS IX_documentos_postulante ON documentos(postulante_id);
CREATE INDEX IF NOT EXISTS IX_auditoria_fecha ON auditoria(fecha);
CREATE INDEX IF NOT EXISTS IX_usuarios_rol ON usuarios(rol);
CREATE INDEX IF NOT EXISTS IX_usuarios_dni ON usuarios(dni);
