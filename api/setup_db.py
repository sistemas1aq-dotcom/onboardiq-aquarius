"""
Script para crear la BD AquariusRRHH y todas las tablas en SQL Server Express
Ejecutar: python setup_db.py
"""
import pyodbc

CONN_STR = (
    "DRIVER={ODBC Driver 17 for SQL Server};"
    "SERVER=localhost\\SQLEXPRESS;"
    "Trusted_Connection=yes;"
    "Encrypt=yes;"
    "TrustServerCertificate=yes;"
)

def run():
    conn = pyodbc.connect(CONN_STR, autocommit=True, timeout=10)
    cursor = conn.cursor()

    # 1. Crear BD
    print("Creando base de datos AquariusRRHH...")
    cursor.execute("""
        IF NOT EXISTS (SELECT * FROM sys.databases WHERE name = 'AquariusRRHH')
        BEGIN CREATE DATABASE AquariusRRHH END
    """)
    print("  BD OK")

    cursor.execute("USE AquariusRRHH")

    # 2. Crear tablas
    tables = [
        ("usuarios", """
            CREATE TABLE usuarios (
                id INT IDENTITY(1,1) PRIMARY KEY,
                email NVARCHAR(255) NOT NULL UNIQUE,
                password_hash NVARCHAR(255) NOT NULL,
                nombre NVARCHAR(200) NOT NULL,
                dni NVARCHAR(20) UNIQUE,
                rol NVARCHAR(20) NOT NULL CHECK (rol IN ('admin','evaluador','postulante','trabajador')),
                telefono NVARCHAR(20),
                activo BIT DEFAULT 1,
                fecha_creacion DATETIME2 DEFAULT GETDATE(),
                ultimo_acceso DATETIME2
            )
        """),
        ("postulantes", """
            CREATE TABLE postulantes (
                id INT IDENTITY(1,1) PRIMARY KEY,
                usuario_id INT NOT NULL FOREIGN KEY REFERENCES usuarios(id),
                puesto NVARCHAR(200) NOT NULL,
                estado NVARCHAR(30) DEFAULT 'En Evaluacion' CHECK (estado IN ('En Evaluacion','Aprobado','Rechazado','Trabajador')),
                avance INT DEFAULT 0,
                riesgo NVARCHAR(10) DEFAULT 'bajo' CHECK (riesgo IN ('bajo','medio','alto')),
                fecha_registro DATETIME2 DEFAULT GETDATE(),
                comentarios NVARCHAR(MAX)
            )
        """),
        ("ficha_personal", """
            CREATE TABLE ficha_personal (
                id INT IDENTITY(1,1) PRIMARY KEY,
                postulante_id INT NOT NULL FOREIGN KEY REFERENCES postulantes(id),
                nombres NVARCHAR(100), apellido_paterno NVARCHAR(100), apellido_materno NVARCHAR(100),
                fecha_nacimiento DATE, lugar_nacimiento NVARCHAR(200), estado_civil NVARCHAR(30),
                genero NVARCHAR(20), direccion NVARCHAR(300), distrito NVARCHAR(100),
                provincia NVARCHAR(100), departamento NVARCHAR(100), telefono NVARCHAR(20),
                telefono_emergencia NVARCHAR(20), contacto_emergencia NVARCHAR(100),
                grado_instruccion NVARCHAR(50), carrera NVARCHAR(200), universidad NVARCHAR(200),
                anio_egreso INT, colegiatura NVARCHAR(50),
                experiencia_laboral NVARCHAR(MAX), idiomas NVARCHAR(MAX),
                habilidades NVARCHAR(MAX), referencias NVARCHAR(MAX),
                pretension_salarial DECIMAL(10,2), disponibilidad NVARCHAR(50),
                modalidad_preferida NVARCHAR(50), tipo_sangre NVARCHAR(10),
                alergias NVARCHAR(300), condiciones_medicas NVARCHAR(300),
                discapacidad BIT DEFAULT 0, detalle_discapacidad NVARCHAR(300),
                fecha_actualizacion DATETIME2 DEFAULT GETDATE()
            )
        """),
        ("evaluaciones", """
            CREATE TABLE evaluaciones (
                id INT IDENTITY(1,1) PRIMARY KEY,
                nombre NVARCHAR(200) NOT NULL,
                tipo NVARCHAR(30) NOT NULL CHECK (tipo IN ('tecnica','psicologica','entrevista')),
                descripcion NVARCHAR(MAX), duracion_minutos INT DEFAULT 60,
                puntaje_minimo INT DEFAULT 60, activa BIT DEFAULT 1,
                fecha_creacion DATETIME2 DEFAULT GETDATE()
            )
        """),
        ("preguntas", """
            CREATE TABLE preguntas (
                id INT IDENTITY(1,1) PRIMARY KEY,
                evaluacion_id INT NOT NULL FOREIGN KEY REFERENCES evaluaciones(id),
                pregunta NVARCHAR(MAX) NOT NULL, opciones NVARCHAR(MAX) NOT NULL,
                respuesta_correcta INT NOT NULL, puntaje INT DEFAULT 20, orden INT DEFAULT 0
            )
        """),
        ("evaluacion_postulante", """
            CREATE TABLE evaluacion_postulante (
                id INT IDENTITY(1,1) PRIMARY KEY,
                evaluacion_id INT NOT NULL FOREIGN KEY REFERENCES evaluaciones(id),
                postulante_id INT NOT NULL FOREIGN KEY REFERENCES postulantes(id),
                evaluador_id INT FOREIGN KEY REFERENCES usuarios(id),
                puntaje_obtenido INT,
                estado NVARCHAR(20) DEFAULT 'pendiente' CHECK (estado IN ('pendiente','en_progreso','completada','calificada')),
                fecha_asignacion DATETIME2 DEFAULT GETDATE(),
                fecha_completado DATETIME2, comentario_evaluador NVARCHAR(MAX)
            )
        """),
        ("respuestas", """
            CREATE TABLE respuestas (
                id INT IDENTITY(1,1) PRIMARY KEY,
                evaluacion_postulante_id INT NOT NULL FOREIGN KEY REFERENCES evaluacion_postulante(id),
                pregunta_id INT NOT NULL FOREIGN KEY REFERENCES preguntas(id),
                respuesta_seleccionada INT NOT NULL, es_correcta BIT,
                fecha_respuesta DATETIME2 DEFAULT GETDATE()
            )
        """),
        ("documentos", """
            CREATE TABLE documentos (
                id INT IDENTITY(1,1) PRIMARY KEY,
                postulante_id INT NOT NULL FOREIGN KEY REFERENCES postulantes(id),
                tipo NVARCHAR(100) NOT NULL, nombre_archivo NVARCHAR(300), url NVARCHAR(500),
                estado NVARCHAR(20) DEFAULT 'pending' CHECK (estado IN ('ok','pending','na','rechazado')),
                requerido BIT DEFAULT 1, observacion NVARCHAR(300),
                fecha_subida DATETIME2, fecha_revision DATETIME2
            )
        """),
        ("entrevistas", """
            CREATE TABLE entrevistas (
                id INT IDENTITY(1,1) PRIMARY KEY,
                postulante_id INT NOT NULL FOREIGN KEY REFERENCES postulantes(id),
                tipo NVARCHAR(30) NOT NULL CHECK (tipo IN ('tecnica','psicologica','entrevista')),
                fecha DATE NOT NULL, hora NVARCHAR(20) NOT NULL, lugar NVARCHAR(200),
                evaluador_nombre NVARCHAR(200), duracion NVARCHAR(20),
                estado NVARCHAR(20) DEFAULT 'programada' CHECK (estado IN ('programada','completada','cancelada','reprogramada')),
                notas NVARCHAR(MAX)
            )
        """),
        ("firmas_digitales", """
            CREATE TABLE firmas_digitales (
                id INT IDENTITY(1,1) PRIMARY KEY,
                usuario_id INT NOT NULL FOREIGN KEY REFERENCES usuarios(id),
                tipo_documento NVARCHAR(100) NOT NULL, firma_data NVARCHAR(MAX) NOT NULL,
                ip_address NVARCHAR(50), hash_documento NVARCHAR(128),
                fecha_firma DATETIME2 DEFAULT GETDATE()
            )
        """),
        ("derechohabientes", """
            CREATE TABLE derechohabientes (
                id INT IDENTITY(1,1) PRIMARY KEY,
                trabajador_id INT NOT NULL FOREIGN KEY REFERENCES postulantes(id),
                nombre_completo NVARCHAR(200) NOT NULL, parentesco NVARCHAR(50) NOT NULL,
                dni NVARCHAR(20), fecha_nacimiento DATE, genero NVARCHAR(20), telefono NVARCHAR(20)
            )
        """),
        ("datos_bancarios", """
            CREATE TABLE datos_bancarios (
                id INT IDENTITY(1,1) PRIMARY KEY,
                trabajador_id INT NOT NULL FOREIGN KEY REFERENCES postulantes(id),
                tiene_cuenta BIT DEFAULT 0, entidad NVARCHAR(200), tipo_cuenta NVARCHAR(30),
                numero_cuenta NVARCHAR(30), cci NVARCHAR(30),
                fecha_actualizacion DATETIME2 DEFAULT GETDATE()
            )
        """),
        ("regimen_pensionario", """
            CREATE TABLE regimen_pensionario (
                id INT IDENTITY(1,1) PRIMARY KEY,
                trabajador_id INT NOT NULL FOREIGN KEY REFERENCES postulantes(id),
                tipo NVARCHAR(10) NOT NULL CHECK (tipo IN ('afp','onp')),
                entidad NVARCHAR(100), cuspp NVARCHAR(30), primer_trabajo BIT DEFAULT 0,
                fecha_actualizacion DATETIME2 DEFAULT GETDATE()
            )
        """),
        ("capacitaciones", """
            CREATE TABLE capacitaciones (
                id INT IDENTITY(1,1) PRIMARY KEY,
                nombre NVARCHAR(200) NOT NULL, descripcion NVARCHAR(MAX),
                fecha_limite DATE, obligatoria BIT DEFAULT 1,
                fecha_creacion DATETIME2 DEFAULT GETDATE()
            )
        """),
        ("capacitacion_trabajador", """
            CREATE TABLE capacitacion_trabajador (
                id INT IDENTITY(1,1) PRIMARY KEY,
                capacitacion_id INT NOT NULL FOREIGN KEY REFERENCES capacitaciones(id),
                trabajador_id INT NOT NULL FOREIGN KEY REFERENCES postulantes(id),
                cumplimiento INT DEFAULT 0, fecha_completado DATETIME2, certificado_url NVARCHAR(500)
            )
        """),
        ("auditoria", """
            CREATE TABLE auditoria (
                id INT IDENTITY(1,1) PRIMARY KEY,
                usuario_id INT FOREIGN KEY REFERENCES usuarios(id),
                accion NVARCHAR(100) NOT NULL, detalle NVARCHAR(MAX),
                ip_address NVARCHAR(50), fecha DATETIME2 DEFAULT GETDATE()
            )
        """),
        ("configuracion", """
            CREATE TABLE configuracion (
                id INT IDENTITY(1,1) PRIMARY KEY,
                clave NVARCHAR(100) NOT NULL UNIQUE, valor NVARCHAR(MAX),
                descripcion NVARCHAR(300), fecha_actualizacion DATETIME2 DEFAULT GETDATE()
            )
        """),
        ("ia_analisis", """
            CREATE TABLE ia_analisis (
                id INT IDENTITY(1,1) PRIMARY KEY,
                postulante_id INT NOT NULL FOREIGN KEY REFERENCES postulantes(id),
                tipo NVARCHAR(50) NOT NULL, resultado NVARCHAR(MAX), score INT,
                fecha DATETIME2 DEFAULT GETDATE()
            )
        """),
    ]

    for name, ddl in tables:
        cursor.execute(f"IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = '{name}') {ddl}")
        print(f"  {name} OK")

    # 3. Indices
    print("\nCreando indices...")
    indices = [
        "IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name='IX_postulantes_estado') CREATE INDEX IX_postulantes_estado ON postulantes(estado)",
        "IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name='IX_postulantes_usuario') CREATE INDEX IX_postulantes_usuario ON postulantes(usuario_id)",
        "IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name='IX_evaluacion_postulante_estado') CREATE INDEX IX_evaluacion_postulante_estado ON evaluacion_postulante(estado)",
        "IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name='IX_documentos_postulante') CREATE INDEX IX_documentos_postulante ON documentos(postulante_id)",
        "IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name='IX_auditoria_fecha') CREATE INDEX IX_auditoria_fecha ON auditoria(fecha)",
        "IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name='IX_usuarios_rol') CREATE INDEX IX_usuarios_rol ON usuarios(rol)",
        "IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name='IX_usuarios_dni') CREATE INDEX IX_usuarios_dni ON usuarios(dni)",
    ]
    for idx in indices:
        cursor.execute(idx)
    print("  Indices OK")

    print("\n=== 18 TABLAS + INDICES CREADOS EXITOSAMENTE ===")
    conn.close()


if __name__ == "__main__":
    run()
