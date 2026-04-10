"""
Actualizar legajos de trabajadores en Neon PostgreSQL
"""
import psycopg2
import json
from passlib.context import CryptContext

DB_URL = "postgresql://neondb_owner:npg_RO3Cgpq9nSai@ep-calm-cloud-amtkjcpm-pooler.c-5.us-east-1.aws.neon.tech/neondb?sslmode=require"

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def run():
    conn = psycopg2.connect(DB_URL)
    conn.autocommit = True
    cursor = conn.cursor()

    # Actualizar password hashes (el seed usa texto plano, necesitamos bcrypt)
    pwd_hash = pwd_context.hash("aquarius2026")
    cursor.execute("UPDATE usuarios SET password_hash = %s", (pwd_hash,))
    print(f"Passwords actualizados con bcrypt hash")

    # Obtener trabajadores
    cursor.execute("""
        SELECT p.id, u.id, u.nombre, u.dni, u.email, u.telefono, p.puesto
        FROM postulantes p JOIN usuarios u ON p.usuario_id = u.id
        WHERE p.estado = 'Trabajador'
    """)
    trabajadores = cursor.fetchall()
    print(f"\n=== {len(trabajadores)} TRABAJADORES ===\n")

    fichas = {
        "Maria Lopez": {
            "nombres": "Maria Elena", "apellido_paterno": "Lopez", "apellido_materno": "Gutierrez",
            "fecha_nacimiento": "1990-05-15", "lugar_nacimiento": "Lima", "estado_civil": "Casada",
            "genero": "Femenino", "direccion": "Av. Arequipa 1520, Lince", "distrito": "Lince",
            "provincia": "Lima", "departamento": "Lima", "telefono": "999100002",
            "telefono_emergencia": "999200001", "contacto_emergencia": "Pedro Lopez (esposo)",
            "grado_instruccion": "Universitario", "carrera": "Administracion de Empresas",
            "universidad": "Universidad de Lima", "anio_egreso": 2013,
            "pretension_salarial": 8500.00, "disponibilidad": "Inmediata", "modalidad_preferida": "Hibrido",
            "tipo_sangre": "O+", "alergias": "Ninguna", "condiciones_medicas": "Ninguna",
        },
        "Patricia Ruiz": {
            "nombres": "Patricia Isabel", "apellido_paterno": "Ruiz", "apellido_materno": "Paredes",
            "fecha_nacimiento": "1992-11-22", "lugar_nacimiento": "Arequipa", "estado_civil": "Soltera",
            "genero": "Femenino", "direccion": "Calle Los Olivos 234, Miraflores", "distrito": "Miraflores",
            "provincia": "Lima", "departamento": "Lima", "telefono": "999100006",
            "telefono_emergencia": "999200006", "contacto_emergencia": "Rosa Paredes (madre)",
            "grado_instruccion": "Universitario", "carrera": "Derecho",
            "universidad": "UCSM", "anio_egreso": 2015,
            "pretension_salarial": 6000.00, "disponibilidad": "Inmediata", "modalidad_preferida": "Presencial",
            "tipo_sangre": "A+", "alergias": "Penicilina", "condiciones_medicas": "Ninguna",
        },
        "Diana Flores": {
            "nombres": "Diana Carolina", "apellido_paterno": "Flores", "apellido_materno": "Mendez",
            "fecha_nacimiento": "1995-03-08", "lugar_nacimiento": "Trujillo", "estado_civil": "Soltera",
            "genero": "Femenino", "direccion": "Jr. Ucayali 890, San Miguel", "distrito": "San Miguel",
            "provincia": "Lima", "departamento": "Lima", "telefono": "999100008",
            "telefono_emergencia": "999200008", "contacto_emergencia": "Luis Flores (padre)",
            "grado_instruccion": "Universitario", "carrera": "Diseno Grafico",
            "universidad": "PUCP", "anio_egreso": 2017,
            "pretension_salarial": 9000.00, "disponibilidad": "Inmediata", "modalidad_preferida": "Remoto",
            "tipo_sangre": "B+", "alergias": "Ninguna", "condiciones_medicas": "Ninguna",
        },
    }

    for row in trabajadores:
        pid, uid, nombre, dni, email, telefono, puesto = row
        print(f"--- {nombre} (pid={pid}) ---")

        # Ficha personal
        cursor.execute("SELECT COUNT(*) FROM ficha_personal WHERE postulante_id = %s", (pid,))
        if cursor.fetchone()[0] == 0 and nombre in fichas:
            f = fichas[nombre]
            cursor.execute("""INSERT INTO ficha_personal (postulante_id, nombres, apellido_paterno, apellido_materno,
                fecha_nacimiento, lugar_nacimiento, estado_civil, genero, direccion, distrito, provincia, departamento,
                telefono, telefono_emergencia, contacto_emergencia, grado_instruccion, carrera, universidad, anio_egreso,
                pretension_salarial, disponibilidad, modalidad_preferida, tipo_sangre, alergias, condiciones_medicas)
                VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)""",
                (pid, f["nombres"], f["apellido_paterno"], f["apellido_materno"], f["fecha_nacimiento"],
                 f["lugar_nacimiento"], f["estado_civil"], f["genero"], f["direccion"], f["distrito"],
                 f["provincia"], f["departamento"], f["telefono"], f["telefono_emergencia"], f["contacto_emergencia"],
                 f["grado_instruccion"], f["carrera"], f["universidad"], f["anio_egreso"],
                 f["pretension_salarial"], f["disponibilidad"], f["modalidad_preferida"],
                 f["tipo_sangre"], f["alergias"], f["condiciones_medicas"]))
            print(f"  Ficha: OK")

        # Evaluaciones
        cursor.execute("SELECT COUNT(*) FROM evaluacion_postulante WHERE postulante_id = %s", (pid,))
        if cursor.fetchone()[0] == 0:
            for eid, evid, score in [(1, 2, 85+pid%10), (2, 3, 80+pid%10), (3, 2, 88+pid%5)]:
                cursor.execute("INSERT INTO evaluacion_postulante (evaluacion_id, postulante_id, evaluador_id, puntaje_obtenido, estado) VALUES (%s,%s,%s,%s,'calificada')", (eid, pid, evid, score))
            print(f"  Evaluaciones: 3 OK")

        # Documentos
        cursor.execute("SELECT COUNT(*) FROM documentos WHERE postulante_id = %s", (pid,))
        if cursor.fetchone()[0] == 0:
            for tipo, req in [("DNI",True),("CV",True),("Foto Pasaporte",True),("Certificados Estudio",True),("Constancias Laborales",True),("Antecedentes Policiales",False),("Antecedentes Penales",False),("Certificado Medico",False)]:
                cursor.execute("INSERT INTO documentos (postulante_id, tipo, nombre_archivo, estado, requerido) VALUES (%s,%s,%s,'ok',%s)",
                    (pid, tipo, f"{tipo.lower().replace(' ','_')}_{nombre.lower().replace(' ','_')}.pdf", req))
            print(f"  Documentos: 8 OK")

        # Entrevistas
        cursor.execute("SELECT COUNT(*) FROM entrevistas WHERE postulante_id = %s", (pid,))
        if cursor.fetchone()[0] == 0:
            for tipo, fecha, hora, lugar, evnom in [("tecnica","2026-03-10","10:00 AM","Virtual - Meet","Ing. Carlos Medina"),("psicologica","2026-03-12","3:00 PM","Oficina - Sala 2A","Lic. Maria Segovia"),("entrevista","2026-03-18","11:00 AM","Virtual - Zoom","Gerente RRHH")]:
                cursor.execute("INSERT INTO entrevistas (postulante_id, tipo, fecha, hora, lugar, evaluador_nombre, duracion, estado) VALUES (%s,%s,%s,%s,%s,%s,'45 min','completada')", (pid, tipo, fecha, hora, lugar, evnom))
            print(f"  Entrevistas: 3 OK")

        # Firmas
        cursor.execute("SELECT COUNT(*) FROM firmas_digitales WHERE usuario_id = %s", (uid,))
        if cursor.fetchone()[0] == 0:
            for doc in ["Contrato de Trabajo","Reglamento Interno","Politica de Privacidad","SCTR","Convenio de Confidencialidad"]:
                cursor.execute("INSERT INTO firmas_digitales (usuario_id, tipo_documento, firma_data, ip_address, hash_documento) VALUES (%s,%s,%s,%s,%s)",
                    (uid, doc, "data:image/png;base64,iVBORw0KGgoAAAANSUhEUg==", "192.168.1.100", f"SHA256:{hash(doc+nombre)%10**16:016x}"))
            print(f"  Firmas: 5 OK")

        # Derechohabientes
        cursor.execute("SELECT COUNT(*) FROM derechohabientes WHERE trabajador_id = %s", (pid,))
        if cursor.fetchone()[0] == 0:
            derechos = {"Maria Lopez": [("Pedro Lopez","Conyuge","45678900","1988-08-20","Masculino")], "Patricia Ruiz": [("Rosa Paredes","Madre","15678902","1960-06-10","Femenino")], "Diana Flores": [("Luis Flores","Padre","25678903","1965-12-01","Masculino"),("Carmen Mendez","Madre","25678904","1968-04-15","Femenino")]}
            for d in derechos.get(nombre, []):
                cursor.execute("INSERT INTO derechohabientes (trabajador_id, nombre_completo, parentesco, dni, fecha_nacimiento, genero) VALUES (%s,%s,%s,%s,%s,%s)", (pid, d[0], d[1], d[2], d[3], d[4]))
            print(f"  Derechohabientes: {len(derechos.get(nombre,[]))} OK")

        # Datos bancarios
        cursor.execute("SELECT COUNT(*) FROM datos_bancarios WHERE trabajador_id = %s", (pid,))
        if cursor.fetchone()[0] == 0:
            bancos = {"Maria Lopez": ("BCP","Ahorros","19110012345678","00219110012345678901"), "Patricia Ruiz": ("Interbank","Corriente","20010098765432","00320010098765432101"), "Diana Flores": ("BBVA Peru","Ahorros","01120055667788","00101120055667788901")}
            b = bancos.get(nombre, ("BCP","Ahorros","00000000000000","00200000000000000001"))
            cursor.execute("INSERT INTO datos_bancarios (trabajador_id, tiene_cuenta, entidad, tipo_cuenta, numero_cuenta, cci) VALUES (%s,TRUE,%s,%s,%s,%s)", (pid, b[0], b[1], b[2], b[3]))
            print(f"  Bancario: {b[0]} OK")

        # Pensionario
        cursor.execute("SELECT COUNT(*) FROM regimen_pensionario WHERE trabajador_id = %s", (pid,))
        if cursor.fetchone()[0] == 0:
            pens = {"Maria Lopez": ("afp","AFP Integra","123456MLGPE0"), "Patricia Ruiz": ("afp","AFP Prima","234567PRPAE0"), "Diana Flores": ("afp","AFP Habitat","345678DFMEE0")}
            p = pens.get(nombre, ("afp","AFP Integra","000000XXXXX0"))
            cursor.execute("INSERT INTO regimen_pensionario (trabajador_id, tipo, entidad, cuspp, primer_trabajo) VALUES (%s,%s,%s,%s,FALSE)", (pid, p[0], p[1], p[2]))
            print(f"  Pensionario: {p[1]} OK")

    print("\n=== LEGAJOS ACTUALIZADOS EN NEON ===")
    conn.close()

if __name__ == "__main__":
    run()
