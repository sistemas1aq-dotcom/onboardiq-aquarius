"""
Script para poblar los legajos completos de TODOS los trabajadores
"""
import pyodbc
import json

CONN_STR = (
    "DRIVER={ODBC Driver 17 for SQL Server};"
    "SERVER=localhost\\SQLEXPRESS;"
    "DATABASE=AquariusRRHH;"
    "Trusted_Connection=yes;"
    "Encrypt=yes;"
    "TrustServerCertificate=yes;"
)

def run():
    conn = pyodbc.connect(CONN_STR, autocommit=True)
    cursor = conn.cursor()

    # Obtener trabajadores
    cursor.execute("""
        SELECT p.id, u.id as uid, u.nombre, u.dni, u.email, u.telefono, p.puesto
        FROM postulantes p JOIN usuarios u ON p.usuario_id = u.id
        WHERE p.estado = 'Trabajador'
    """)
    trabajadores = cursor.fetchall()
    print(f"=== {len(trabajadores)} TRABAJADORES ENCONTRADOS ===\n")

    # Datos ficticios por trabajador
    fichas = {
        "Maria Lopez": {
            "nombres": "Maria Elena", "apellido_paterno": "Lopez", "apellido_materno": "Gutierrez",
            "fecha_nacimiento": "1990-05-15", "lugar_nacimiento": "Lima", "estado_civil": "Casada",
            "genero": "Femenino", "direccion": "Av. Arequipa 1520, Lince", "distrito": "Lince",
            "provincia": "Lima", "departamento": "Lima", "telefono": "999100002",
            "telefono_emergencia": "999200001", "contacto_emergencia": "Pedro Lopez (esposo)",
            "grado_instruccion": "Universitario", "carrera": "Administracion de Empresas",
            "universidad": "Universidad de Lima", "anio_egreso": 2013, "colegiatura": "No aplica",
            "experiencia_laboral": json.dumps([
                {"empresa": "BCP", "cargo": "Analista RRHH", "desde": "2014", "hasta": "2018", "funciones": "Reclutamiento y seleccion de personal"},
                {"empresa": "Interbank", "cargo": "Coordinadora RRHH", "desde": "2018", "hasta": "2025", "funciones": "Gestion de talento humano, evaluaciones de desempeno"}
            ]),
            "idiomas": json.dumps([{"idioma": "Ingles", "nivel": "Avanzado"}, {"idioma": "Portugues", "nivel": "Basico"}]),
            "habilidades": json.dumps([{"nombre": "Excel", "nivel": 90}, {"nombre": "SAP HR", "nivel": 85}, {"nombre": "Power BI", "nivel": 75}]),
            "referencias": json.dumps([{"nombre": "Carlos Ramos", "empresa": "BCP", "cargo": "Gerente RRHH", "telefono": "999333001"}]),
            "pretension_salarial": 8500.00, "disponibilidad": "Inmediata", "modalidad_preferida": "Hibrido",
            "tipo_sangre": "O+", "alergias": "Ninguna", "condiciones_medicas": "Ninguna",
            "discapacidad": False, "detalle_discapacidad": None
        },
        "Patricia Ruiz": {
            "nombres": "Patricia Isabel", "apellido_paterno": "Ruiz", "apellido_materno": "Paredes",
            "fecha_nacimiento": "1992-11-22", "lugar_nacimiento": "Arequipa", "estado_civil": "Soltera",
            "genero": "Femenino", "direccion": "Calle Los Olivos 234, Miraflores", "distrito": "Miraflores",
            "provincia": "Lima", "departamento": "Lima", "telefono": "999100006",
            "telefono_emergencia": "999200006", "contacto_emergencia": "Rosa Paredes (madre)",
            "grado_instruccion": "Universitario", "carrera": "Derecho",
            "universidad": "Universidad Catolica de Santa Maria", "anio_egreso": 2015, "colegiatura": "CAL 54321",
            "experiencia_laboral": json.dumps([
                {"empresa": "Estudio Rodrigo", "cargo": "Practicante Legal", "desde": "2015", "hasta": "2017", "funciones": "Apoyo en procesos laborales"},
                {"empresa": "Minera Cerro Verde", "cargo": "Asistente Legal", "desde": "2017", "hasta": "2025", "funciones": "Contratos laborales, asesoria legal interna"}
            ]),
            "idiomas": json.dumps([{"idioma": "Ingles", "nivel": "Intermedio"}]),
            "habilidades": json.dumps([{"nombre": "Word", "nivel": 95}, {"nombre": "Excel", "nivel": 80}, {"nombre": "LegalTech", "nivel": 70}]),
            "referencias": json.dumps([{"nombre": "Dr. Julio Rodrigo", "empresa": "Estudio Rodrigo", "cargo": "Socio", "telefono": "999333006"}]),
            "pretension_salarial": 6000.00, "disponibilidad": "Inmediata", "modalidad_preferida": "Presencial",
            "tipo_sangre": "A+", "alergias": "Penicilina", "condiciones_medicas": "Ninguna",
            "discapacidad": False, "detalle_discapacidad": None
        },
        "Diana Flores": {
            "nombres": "Diana Carolina", "apellido_paterno": "Flores", "apellido_materno": "Mendez",
            "fecha_nacimiento": "1995-03-08", "lugar_nacimiento": "Trujillo", "estado_civil": "Soltera",
            "genero": "Femenino", "direccion": "Jr. Ucayali 890, San Miguel", "distrito": "San Miguel",
            "provincia": "Lima", "departamento": "Lima", "telefono": "999100008",
            "telefono_emergencia": "999200008", "contacto_emergencia": "Luis Flores (padre)",
            "grado_instruccion": "Universitario", "carrera": "Diseno Grafico",
            "universidad": "Pontificia Universidad Catolica del Peru", "anio_egreso": 2017, "colegiatura": "No aplica",
            "experiencia_laboral": json.dumps([
                {"empresa": "Startup XYZ", "cargo": "Disenadora UI", "desde": "2017", "hasta": "2020", "funciones": "Diseno de interfaces moviles y web"},
                {"empresa": "Globant", "cargo": "UX Designer Senior", "desde": "2020", "hasta": "2025", "funciones": "Investigacion de usuarios, prototipado, design systems"}
            ]),
            "idiomas": json.dumps([{"idioma": "Ingles", "nivel": "Avanzado"}, {"idioma": "Frances", "nivel": "Basico"}]),
            "habilidades": json.dumps([{"nombre": "Figma", "nivel": 98}, {"nombre": "Adobe XD", "nivel": 90}, {"nombre": "Sketch", "nivel": 85}, {"nombre": "HTML/CSS", "nivel": 80}]),
            "referencias": json.dumps([{"nombre": "Andres Mora", "empresa": "Globant", "cargo": "Design Lead", "telefono": "999333008"}]),
            "pretension_salarial": 9000.00, "disponibilidad": "Inmediata", "modalidad_preferida": "Remoto",
            "tipo_sangre": "B+", "alergias": "Ninguna", "condiciones_medicas": "Ninguna",
            "discapacidad": False, "detalle_discapacidad": None
        },
    }

    for row in trabajadores:
        pid, uid, nombre, dni, email, telefono, puesto = row
        print(f"\n--- {nombre} (postulante_id={pid}) ---")

        # 1. FICHA PERSONAL
        cursor.execute("SELECT COUNT(*) FROM ficha_personal WHERE postulante_id = ?", pid)
        if cursor.fetchone()[0] == 0:
            ficha = fichas.get(nombre, {})
            if ficha:
                cols = ", ".join(["postulante_id"] + list(ficha.keys()))
                placeholders = ", ".join(["?"] * (len(ficha) + 1))
                vals = [pid] + list(ficha.values())
                cursor.execute(f"INSERT INTO ficha_personal ({cols}) VALUES ({placeholders})", vals)
                print(f"  Ficha personal: CREADA")
            else:
                # Ficha generica
                cursor.execute("""INSERT INTO ficha_personal (postulante_id, nombres, apellido_paterno, grado_instruccion, carrera)
                    VALUES (?, ?, ?, 'Universitario', ?)""", pid, nombre.split()[0], nombre.split()[-1], puesto)
                print(f"  Ficha personal: CREADA (generica)")
        else:
            print(f"  Ficha personal: ya existe")

        # 2. EVALUACIONES (si no tiene)
        cursor.execute("SELECT COUNT(*) FROM evaluacion_postulante WHERE postulante_id = ?", pid)
        if cursor.fetchone()[0] == 0:
            cursor.execute("INSERT INTO evaluacion_postulante (evaluacion_id, postulante_id, evaluador_id, puntaje_obtenido, estado) VALUES (1, ?, 2, ?, 'calificada')", pid, 85 + (pid % 10))
            cursor.execute("INSERT INTO evaluacion_postulante (evaluacion_id, postulante_id, evaluador_id, puntaje_obtenido, estado) VALUES (2, ?, 3, ?, 'calificada')", pid, 80 + (pid % 10))
            cursor.execute("INSERT INTO evaluacion_postulante (evaluacion_id, postulante_id, evaluador_id, puntaje_obtenido, estado) VALUES (3, ?, 2, ?, 'calificada')", pid, 88 + (pid % 5))
            print(f"  Evaluaciones: 3 CREADAS")
        else:
            print(f"  Evaluaciones: ya existen")

        # 3. DOCUMENTOS (si no tiene)
        cursor.execute("SELECT COUNT(*) FROM documentos WHERE postulante_id = ?", pid)
        if cursor.fetchone()[0] == 0:
            docs = [
                ("DNI", f"dni_{nombre.lower().replace(' ','_')}.pdf", "ok", True),
                ("CV", f"cv_{nombre.lower().replace(' ','_')}.pdf", "ok", True),
                ("Foto Pasaporte", f"foto_{nombre.lower().replace(' ','_')}.jpg", "ok", True),
                ("Certificados Estudio", f"cert_{nombre.lower().replace(' ','_')}.pdf", "ok", True),
                ("Constancias Laborales", f"const_{nombre.lower().replace(' ','_')}.pdf", "ok", True),
                ("Antecedentes Policiales", f"antec_pol_{nombre.lower().replace(' ','_')}.pdf", "ok", False),
                ("Antecedentes Penales", f"antec_pen_{nombre.lower().replace(' ','_')}.pdf", "ok", False),
                ("Certificado Medico", f"cert_med_{nombre.lower().replace(' ','_')}.pdf", "ok", False),
            ]
            for tipo, archivo, estado, req in docs:
                cursor.execute("INSERT INTO documentos (postulante_id, tipo, nombre_archivo, estado, requerido) VALUES (?,?,?,?,?)",
                    pid, tipo, archivo, estado, req)
            print(f"  Documentos: {len(docs)} CREADOS")
        else:
            print(f"  Documentos: ya existen")

        # 4. ENTREVISTAS (si no tiene)
        cursor.execute("SELECT COUNT(*) FROM entrevistas WHERE postulante_id = ?", pid)
        if cursor.fetchone()[0] == 0:
            cursor.execute("INSERT INTO entrevistas (postulante_id, tipo, fecha, hora, lugar, evaluador_nombre, duracion, estado) VALUES (?,?,?,?,?,?,?,?)",
                pid, "tecnica", "2026-03-10", "10:00 AM", "Virtual - Google Meet", "Ing. Carlos Medina", "45 min", "completada")
            cursor.execute("INSERT INTO entrevistas (postulante_id, tipo, fecha, hora, lugar, evaluador_nombre, duracion, estado) VALUES (?,?,?,?,?,?,?,?)",
                pid, "psicologica", "2026-03-12", "3:00 PM", "Oficina Central - Sala 2A", "Lic. Maria Segovia", "60 min", "completada")
            cursor.execute("INSERT INTO entrevistas (postulante_id, tipo, fecha, hora, lugar, evaluador_nombre, duracion, estado) VALUES (?,?,?,?,?,?,?,?)",
                pid, "entrevista", "2026-03-18", "11:00 AM", "Virtual - Zoom", "Gerente RRHH", "30 min", "completada")
            print(f"  Entrevistas: 3 CREADAS")
        else:
            print(f"  Entrevistas: ya existen")

        # 5. FIRMAS DIGITALES (si no tiene)
        cursor.execute("SELECT COUNT(*) FROM firmas_digitales WHERE usuario_id = ?", uid)
        if cursor.fetchone()[0] == 0:
            firmas_docs = ["Contrato de Trabajo", "Reglamento Interno", "Politica de Privacidad", "SCTR", "Convenio de Confidencialidad"]
            for doc in firmas_docs:
                cursor.execute("INSERT INTO firmas_digitales (usuario_id, tipo_documento, firma_data, ip_address, hash_documento) VALUES (?,?,?,?,?)",
                    uid, doc, "data:image/png;base64,iVBORw0KGgoAAAANSUhEUg==", "192.168.1.100", f"SHA256:{hash(doc + nombre) % 10**16:016x}")
            print(f"  Firmas: {len(firmas_docs)} CREADAS")
        else:
            print(f"  Firmas: ya existen")

        # 6. DERECHOHABIENTES (si no tiene)
        cursor.execute("SELECT COUNT(*) FROM derechohabientes WHERE trabajador_id = ?", pid)
        if cursor.fetchone()[0] == 0:
            derechos = {
                "Maria Lopez": [
                    ("Pedro Lopez Gutierrez", "Conyuge", "45678900", "1988-08-20", "Masculino", "999200010"),
                    ("Sofia Lopez Lopez", "Hijo/a", "75678901", "2018-02-14", "Femenino", None),
                ],
                "Patricia Ruiz": [
                    ("Rosa Paredes Vda. de Ruiz", "Madre", "15678902", "1960-06-10", "Femenino", "999200020"),
                ],
                "Diana Flores": [
                    ("Luis Flores Castillo", "Padre", "25678903", "1965-12-01", "Masculino", "999200030"),
                    ("Carmen Mendez de Flores", "Madre", "25678904", "1968-04-15", "Femenino", "999200031"),
                ],
            }
            for d in derechos.get(nombre, []):
                cursor.execute("INSERT INTO derechohabientes (trabajador_id, nombre_completo, parentesco, dni, fecha_nacimiento, genero, telefono) VALUES (?,?,?,?,?,?,?)",
                    pid, d[0], d[1], d[2], d[3], d[4], d[5])
            count = len(derechos.get(nombre, []))
            print(f"  Derechohabientes: {count} CREADOS")
        else:
            print(f"  Derechohabientes: ya existen")

        # 7. DATOS BANCARIOS (si no tiene)
        cursor.execute("SELECT COUNT(*) FROM datos_bancarios WHERE trabajador_id = ?", pid)
        if cursor.fetchone()[0] == 0:
            bancos = {
                "Maria Lopez": ("BCP", "Ahorros", "19110012345678", "00219110012345678901"),
                "Patricia Ruiz": ("Interbank", "Corriente", "20010098765432", "00320010098765432101"),
                "Diana Flores": ("BBVA Peru", "Ahorros", "01120055667788", "00101120055667788901"),
            }
            b = bancos.get(nombre, ("BCP", "Ahorros", "19100000000000", "00219100000000000001"))
            cursor.execute("INSERT INTO datos_bancarios (trabajador_id, tiene_cuenta, entidad, tipo_cuenta, numero_cuenta, cci) VALUES (?,?,?,?,?,?)",
                pid, True, b[0], b[1], b[2], b[3])
            print(f"  Datos Bancarios: CREADOS ({b[0]})")
        else:
            print(f"  Datos Bancarios: ya existen")

        # 8. REGIMEN PENSIONARIO (si no tiene)
        cursor.execute("SELECT COUNT(*) FROM regimen_pensionario WHERE trabajador_id = ?", pid)
        if cursor.fetchone()[0] == 0:
            pensiones = {
                "Maria Lopez": ("afp", "AFP Integra", "123456MLGPE0"),
                "Patricia Ruiz": ("afp", "AFP Prima", "234567PRPAE0"),
                "Diana Flores": ("afp", "AFP Habitat", "345678DFMEE0"),
            }
            p = pensiones.get(nombre, ("afp", "AFP Integra", "000000XXXXX0"))
            cursor.execute("INSERT INTO regimen_pensionario (trabajador_id, tipo, entidad, cuspp, primer_trabajo) VALUES (?,?,?,?,?)",
                pid, p[0], p[1], p[2], False)
            print(f"  Regimen Pensionario: CREADO ({p[1]})")
        else:
            print(f"  Regimen Pensionario: ya existe")

    # Verificacion
    print("\n\n=== VERIFICACION FINAL ===")
    for row in trabajadores:
        pid, uid, nombre = row[0], row[1], row[2]
        print(f"\n{nombre} (pid={pid}):")
        for table, col in [("ficha_personal","postulante_id"), ("evaluacion_postulante","postulante_id"),
                           ("documentos","postulante_id"), ("entrevistas","postulante_id"),
                           ("firmas_digitales","usuario_id"), ("derechohabientes","trabajador_id"),
                           ("datos_bancarios","trabajador_id"), ("regimen_pensionario","trabajador_id"),
                           ("capacitacion_trabajador","trabajador_id")]:
            id_val = uid if col == "usuario_id" else pid
            cursor.execute(f"SELECT COUNT(*) FROM {table} WHERE {col} = ?", id_val)
            count = cursor.fetchone()[0]
            status = "OK" if count > 0 else "VACIO"
            print(f"  {table}: {count} registros [{status}]")

    conn.close()
    print("\n=== LEGAJOS ACTUALIZADOS EXITOSAMENTE ===")

if __name__ == "__main__":
    run()
