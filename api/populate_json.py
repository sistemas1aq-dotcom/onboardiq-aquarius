"""Poblar campos JSON (experiencia, idiomas, habilidades, referencias) en Neon"""
import psycopg2, json

DB_URL = "postgresql://neondb_owner:npg_RO3Cgpq9nSai@ep-calm-cloud-amtkjcpm-pooler.c-5.us-east-1.aws.neon.tech/neondb?sslmode=require"

def run():
    conn = psycopg2.connect(DB_URL)
    conn.autocommit = True
    cursor = conn.cursor()

    data = {
        1: {
            "exp": [
                {"empresa":"BCP","cargo":"Practicante Finanzas","desde":"2014","hasta":"2016","funciones":"Analisis de estados financieros"},
                {"empresa":"KPMG Peru","cargo":"Analista Financiero Jr","desde":"2016","hasta":"2020","funciones":"Auditoria financiera, due diligence"},
                {"empresa":"Deloitte Peru","cargo":"Analista Financiero Sr","desde":"2020","hasta":"2025","funciones":"Modelamiento financiero, M&A advisory"},
            ],
            "idi": [{"idioma":"Ingles","nivel":"Avanzado"},{"idioma":"Portugues","nivel":"Intermedio"}],
            "hab": [{"nombre":"Excel Avanzado","nivel":95},{"nombre":"SAP FI","nivel":85},{"nombre":"Power BI","nivel":90},{"nombre":"Bloomberg","nivel":80},{"nombre":"Python","nivel":70}],
            "ref": [{"nombre":"Dr. Ricardo Flores","empresa":"KPMG","cargo":"Socio","telefono":"999444001","relacion":"Jefe directo"}],
        },
        2: {
            "exp": [
                {"empresa":"BCP","cargo":"Analista RRHH","desde":"2014","hasta":"2018","funciones":"Reclutamiento y seleccion"},
                {"empresa":"Interbank","cargo":"Coordinadora RRHH","desde":"2018","hasta":"2025","funciones":"Gestion de talento, evaluaciones"},
            ],
            "idi": [{"idioma":"Ingles","nivel":"Avanzado"},{"idioma":"Portugues","nivel":"Basico"}],
            "hab": [{"nombre":"Excel","nivel":90},{"nombre":"SAP HR","nivel":85},{"nombre":"Power BI","nivel":75},{"nombre":"Entrevistas","nivel":95},{"nombre":"Assessment Center","nivel":88}],
            "ref": [{"nombre":"Carlos Ramos","empresa":"BCP","cargo":"Gerente RRHH","telefono":"999333001","relacion":"Jefe directo"}],
        },
        3: {
            "exp": [
                {"empresa":"Belatrix Software","cargo":"Dev Junior","desde":"2013","hasta":"2016","funciones":"Java, Spring Boot, APIs REST"},
                {"empresa":"Globant","cargo":"Dev Semi-Senior","desde":"2016","hasta":"2020","funciones":"Microservicios, AWS, Docker"},
                {"empresa":"MercadoLibre","cargo":"Senior Developer","desde":"2020","hasta":"2025","funciones":"Lider de equipo, arquitectura"},
            ],
            "idi": [{"idioma":"Ingles","nivel":"Avanzado"},{"idioma":"Aleman","nivel":"Basico"}],
            "hab": [{"nombre":"Java/Spring","nivel":95},{"nombre":"Python/Django","nivel":85},{"nombre":"React/Angular","nivel":80},{"nombre":"AWS","nivel":90},{"nombre":"Docker/K8s","nivel":88}],
            "ref": [{"nombre":"Ing. Luis Paredes","empresa":"Globant","cargo":"Tech Lead","telefono":"999444003","relacion":"Lider tecnico"}],
        },
        4: {
            "exp": [
                {"empresa":"Ernst & Young","cargo":"Practicante Auditoria","desde":"2016","hasta":"2018","funciones":"Auditoria de EEFF, conciliaciones"},
                {"empresa":"Grupo Gloria","cargo":"Analista Contable","desde":"2018","hasta":"2025","funciones":"Cierre contable, impuestos, NIIF"},
            ],
            "idi": [{"idioma":"Ingles","nivel":"Intermedio"}],
            "hab": [{"nombre":"Contpaqi","nivel":90},{"nombre":"Excel Avanzado","nivel":92},{"nombre":"SAP FI","nivel":78},{"nombre":"NIIF/NIC","nivel":85},{"nombre":"PDT SUNAT","nivel":95}],
            "ref": [{"nombre":"CPC Martha Diaz","empresa":"Ernst & Young","cargo":"Senior Auditor","telefono":"999444005","relacion":"Supervisora"}],
        },
        5: {
            "exp": [
                {"empresa":"IBM Peru","cargo":"Consultor","desde":"2010","hasta":"2015","funciones":"Implementacion ERP, stakeholders"},
                {"empresa":"Accenture","cargo":"Project Manager","desde":"2015","hasta":"2020","funciones":"Transformacion digital, PMO"},
                {"empresa":"Telefonica","cargo":"Sr PM","desde":"2020","hasta":"2025","funciones":"Portafolio +5M USD, 20+ personas"},
            ],
            "idi": [{"idioma":"Ingles","nivel":"Avanzado"},{"idioma":"Frances","nivel":"Intermedio"},{"idioma":"Italiano","nivel":"Basico"}],
            "hab": [{"nombre":"MS Project","nivel":95},{"nombre":"Jira","nivel":92},{"nombre":"Scrum/Agile","nivel":90},{"nombre":"Power BI","nivel":85},{"nombre":"PMP","nivel":100}],
            "ref": [{"nombre":"Ing. Fernando Castro","empresa":"IBM","cargo":"Director","telefono":"999444006","relacion":"Jefe directo"}],
        },
        6: {
            "exp": [
                {"empresa":"Estudio Rodrigo","cargo":"Practicante Legal","desde":"2015","hasta":"2017","funciones":"Procesos laborales"},
                {"empresa":"Cerro Verde","cargo":"Asistente Legal","desde":"2017","hasta":"2025","funciones":"Contratos, asesoria legal"},
            ],
            "idi": [{"idioma":"Ingles","nivel":"Intermedio"}],
            "hab": [{"nombre":"Word Avanzado","nivel":95},{"nombre":"Excel","nivel":80},{"nombre":"LegalTech","nivel":70},{"nombre":"Oratoria","nivel":85},{"nombre":"Derecho Laboral","nivel":92}],
            "ref": [{"nombre":"Dr. Julio Rodrigo","empresa":"Estudio Rodrigo","cargo":"Socio","telefono":"999333006","relacion":"Mentor"}],
        },
        7: {
            "exp": [
                {"empresa":"Cosapi","cargo":"Ing. Residente Jr","desde":"2018","hasta":"2021","funciones":"Supervision de obra, metrados"},
                {"empresa":"Grana y Montero","cargo":"Ing. Proyectos","desde":"2021","hasta":"2025","funciones":"Planificacion, presupuestos"},
            ],
            "idi": [{"idioma":"Ingles","nivel":"Basico"}],
            "hab": [{"nombre":"AutoCAD","nivel":95},{"nombre":"S10 Costos","nivel":90},{"nombre":"MS Project","nivel":85},{"nombre":"Revit BIM","nivel":75},{"nombre":"Excel","nivel":80}],
            "ref": [{"nombre":"Ing. Marco Huaman","empresa":"Cosapi","cargo":"Gerente Obra","telefono":"999444008","relacion":"Jefe directo"}],
        },
        8: {
            "exp": [
                {"empresa":"Startup XYZ","cargo":"Disenadora UI","desde":"2017","hasta":"2020","funciones":"Interfaces moviles y web"},
                {"empresa":"Globant","cargo":"UX Designer Sr","desde":"2020","hasta":"2025","funciones":"User research, prototipado, design systems"},
            ],
            "idi": [{"idioma":"Ingles","nivel":"Avanzado"},{"idioma":"Frances","nivel":"Basico"}],
            "hab": [{"nombre":"Figma","nivel":98},{"nombre":"Adobe XD","nivel":90},{"nombre":"Sketch","nivel":85},{"nombre":"HTML/CSS","nivel":80},{"nombre":"User Research","nivel":92}],
            "ref": [{"nombre":"Andres Mora","empresa":"Globant","cargo":"Design Lead","telefono":"999333008","relacion":"Lider de diseno"}],
        },
    }

    print("=== ACTUALIZANDO CAMPOS JSON ===")
    for pid, d in data.items():
        cursor.execute(
            """UPDATE ficha_personal SET
                experiencia_laboral = %s, idiomas = %s, habilidades = %s, referencias = %s
                WHERE postulante_id = %s""",
            (json.dumps(d["exp"]), json.dumps(d["idi"]), json.dumps(d["hab"]), json.dumps(d["ref"]), pid)
        )
        cursor.execute("SELECT u.nombre FROM postulantes p JOIN usuarios u ON p.usuario_id=u.id WHERE p.id=%s", (pid,))
        nombre = cursor.fetchone()[0]
        print(f"  {nombre} (pid={pid}): {len(d['exp'])} exp, {len(d['idi'])} idiomas, {len(d['hab'])} hab, {len(d['ref'])} ref")

    conn.close()
    print("\n=== COMPLETADO ===")

if __name__ == "__main__":
    run()
