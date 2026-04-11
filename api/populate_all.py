"""Poblar TODOS los datos de postulantes en Neon"""
import psycopg2

DB_URL = "postgresql://neondb_owner:npg_RO3Cgpq9nSai@ep-calm-cloud-amtkjcpm-pooler.c-5.us-east-1.aws.neon.tech/neondb?sslmode=require"

def run():
    conn = psycopg2.connect(DB_URL)
    conn.autocommit = True
    cursor = conn.cursor()

    fichas = {
        1: ("Carlos Alberto","Mendoza","Rivera","1991-07-20","Lima","Soltero","Masculino","Av. Brasil 2450, Jesus Maria","Jesus Maria","Lima","Lima","999100001","999200001","Rosa Rivera (madre)","Universitario","Ingenieria Financiera","Universidad del Pacifico",2014,7500.00,"Inmediata","Hibrido","A+","Ninguna","Ninguna"),
        3: ("Roberto Carlos","Garcia","Quispe","1988-12-05","Cusco","Casado","Masculino","Jr. Huascar 345, Brena","Brena","Lima","Lima","999100003","999200003","Lucia Quispe (esposa)","Universitario","Ingenieria de Sistemas","UNI",2012,12000.00,"2 semanas","Remoto","O-","Ninguna","Ninguna"),
        4: ("Ana Maria","Torres","Velasquez","1993-04-18","Arequipa","Soltera","Femenino","Calle Las Flores 678, Surco","Santiago de Surco","Lima","Lima","999100004","999200004","Jorge Torres (padre)","Universitario","Contabilidad","UNSA",2016,5500.00,"Inmediata","Presencial","B+","Sulfas","Ninguna"),
        5: ("Luis Fernando","Vargas","Castaneda","1985-09-30","Piura","Casado","Masculino","Av. La Marina 890, San Miguel","San Miguel","Lima","Lima","999100005","999200005","Carmen Castaneda (esposa)","Maestria","Administracion de Empresas","ESAN",2010,15000.00,"1 mes","Hibrido","AB+","Ninguna","Hipertension controlada"),
        7: ("Jorge Luis","Castillo","Huaman","1994-01-25","Huancayo","Soltero","Masculino","Av. Colonial 456, Callao","Callao","Callao","Callao","999100007","999200007","Maria Huaman (madre)","Universitario","Ingenieria Civil","UNI",2018,8000.00,"Inmediata","Presencial","O+","Ninguna","Ninguna"),
    }

    # 1. FICHAS
    print("=== FICHAS PERSONALES ===")
    for pid, f in fichas.items():
        cursor.execute("SELECT COUNT(*) FROM ficha_personal WHERE postulante_id = %s", (pid,))
        if cursor.fetchone()[0] == 0:
            cursor.execute("""INSERT INTO ficha_personal (postulante_id, nombres, apellido_paterno, apellido_materno,
                fecha_nacimiento, lugar_nacimiento, estado_civil, genero, direccion, distrito, provincia, departamento,
                telefono, telefono_emergencia, contacto_emergencia, grado_instruccion, carrera, universidad, anio_egreso,
                pretension_salarial, disponibilidad, modalidad_preferida, tipo_sangre, alergias, condiciones_medicas)
                VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)""",
                (pid,) + f)
            print(f"  pid={pid}: CREADA")
        else:
            print(f"  pid={pid}: ya existe")

    # 2. DOCUMENTOS
    print("\n=== DOCUMENTOS ===")
    doc_types = [("DNI",True),("CV",True),("Foto Pasaporte",True),("Certificados Estudio",True),
                 ("Constancias Laborales",True),("Antecedentes Policiales",False),
                 ("Antecedentes Penales",False),("Certificado Medico",False)]
    for pid in [3,4,5,7]:
        cursor.execute("SELECT COUNT(*) FROM documentos WHERE postulante_id = %s", (pid,))
        if cursor.fetchone()[0] == 0:
            cursor.execute("SELECT u.nombre FROM postulantes p JOIN usuarios u ON p.usuario_id=u.id WHERE p.id=%s", (pid,))
            nombre = cursor.fetchone()[0].lower().replace(" ","_")
            for tipo, req in doc_types:
                estado = "ok" if req else "pending"
                cursor.execute("INSERT INTO documentos (postulante_id,tipo,nombre_archivo,estado,requerido) VALUES (%s,%s,%s,%s,%s)",
                    (pid, tipo, f"{tipo.lower().replace(' ','_')}_{nombre}.pdf", estado, req))
            print(f"  pid={pid}: 8 docs OK")
        else:
            print(f"  pid={pid}: ya tiene")

    # 3. ENTREVISTAS
    print("\n=== ENTREVISTAS ===")
    for pid in [3,4,5,7]:
        cursor.execute("SELECT COUNT(*) FROM entrevistas WHERE postulante_id = %s", (pid,))
        if cursor.fetchone()[0] == 0:
            entrevistas = [
                ("tecnica","2026-04-20","10:00 AM","Virtual - Google Meet","Ing. Carlos Medina","45 min","programada"),
                ("psicologica","2026-04-22","3:00 PM","Oficina Central - Sala 2A","Lic. Maria Segovia","60 min","programada"),
                ("entrevista","2026-04-28","11:00 AM","Virtual - Zoom","Gerente RRHH","30 min","programada"),
            ]
            for tipo, fecha, hora, lugar, evnom, dur, estado in entrevistas:
                cursor.execute("INSERT INTO entrevistas (postulante_id,tipo,fecha,hora,lugar,evaluador_nombre,duracion,estado) VALUES (%s,%s,%s,%s,%s,%s,%s,%s)",
                    (pid, tipo, fecha, hora, lugar, evnom, dur, estado))
            print(f"  pid={pid}: 3 entrevistas OK")
        else:
            print(f"  pid={pid}: ya tiene")

    # 4. EVALUACIONES para Jorge Castillo (pid=7)
    print("\n=== EVALUACIONES ===")
    cursor.execute("SELECT COUNT(*) FROM evaluacion_postulante WHERE postulante_id = 7")
    if cursor.fetchone()[0] == 0:
        cursor.execute("INSERT INTO evaluacion_postulante (evaluacion_id,postulante_id,evaluador_id,estado) VALUES (1,7,2,'pendiente')")
        cursor.execute("INSERT INTO evaluacion_postulante (evaluacion_id,postulante_id,evaluador_id,estado) VALUES (2,7,3,'pendiente')")
        print("  pid=7: 2 evaluaciones pendientes")
    else:
        print("  pid=7: ya tiene")

    # VERIFICACION
    print("\n=== VERIFICACION FINAL ===")
    cursor.execute("""
        SELECT u.nombre, u.rol, p.id, p.estado,
            (SELECT COUNT(*) FROM ficha_personal WHERE postulante_id=p.id),
            (SELECT COUNT(*) FROM evaluacion_postulante WHERE postulante_id=p.id),
            (SELECT COUNT(*) FROM documentos WHERE postulante_id=p.id),
            (SELECT COUNT(*) FROM entrevistas WHERE postulante_id=p.id)
        FROM usuarios u JOIN postulantes p ON p.usuario_id = u.id ORDER BY u.id
    """)
    for r in cursor.fetchall():
        print(f"  {r[0]:20s} [{r[1]:10s}/{r[3]:15s}] pid={r[2]} | ficha:{r[4]} evals:{r[5]} docs:{r[6]} entrev:{r[7]}")

    conn.close()
    print("\n=== COMPLETADO ===")

if __name__ == "__main__":
    run()
