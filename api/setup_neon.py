"""
Setup script para inicializar la base de datos PostgreSQL en Neon.
Uso: python setup_neon.py

Requiere DATABASE_URL en el archivo .env o como variable de entorno.
Ejemplo: DATABASE_URL=postgresql://user:pass@ep-xxx.us-east-2.aws.neon.tech/AquariusRRHH?sslmode=require
"""

import os
import sys
import psycopg2

def get_database_url():
    """Obtener DATABASE_URL desde .env o variable de entorno."""
    # Intentar leer de .env
    env_path = os.path.join(os.path.dirname(__file__), ".env")
    if os.path.exists(env_path):
        with open(env_path, "r", encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if line.startswith("DATABASE_URL="):
                    return line.split("=", 1)[1].strip().strip('"').strip("'")
    # Fallback a variable de entorno
    return os.environ.get("DATABASE_URL", "")


def read_sql_file(filename):
    """Leer archivo SQL relativo al directorio database/."""
    base_dir = os.path.dirname(os.path.dirname(__file__))
    filepath = os.path.join(base_dir, "database", filename)
    with open(filepath, "r", encoding="utf-8") as f:
        return f.read()


def main():
    database_url = get_database_url()
    if not database_url:
        print("ERROR: DATABASE_URL no encontrada.")
        print("Configura DATABASE_URL en api/.env o como variable de entorno.")
        sys.exit(1)

    print(f"Conectando a PostgreSQL...")
    print(f"Host: {database_url.split('@')[1].split('/')[0] if '@' in database_url else 'local'}")

    try:
        conn = psycopg2.connect(database_url)
        conn.autocommit = True
        cursor = conn.cursor()

        # Paso 1: Crear tablas
        print("\n[1/2] Creando tablas...")
        init_sql = read_sql_file("init_postgres.sql")
        cursor.execute(init_sql)
        print("      Tablas creadas exitosamente.")

        # Paso 2: Insertar datos iniciales
        print("[2/2] Insertando datos iniciales...")
        seed_sql = read_sql_file("seed_postgres.sql")
        cursor.execute(seed_sql)
        print("      Datos insertados exitosamente.")

        # Verificar
        cursor.execute("SELECT COUNT(*) FROM usuarios")
        user_count = cursor.fetchone()[0]
        cursor.execute("SELECT COUNT(*) FROM postulantes")
        post_count = cursor.fetchone()[0]
        cursor.execute("SELECT COUNT(*) FROM evaluaciones")
        eval_count = cursor.fetchone()[0]

        print(f"\nVerificacion:")
        print(f"  - Usuarios:     {user_count}")
        print(f"  - Postulantes:  {post_count}")
        print(f"  - Evaluaciones: {eval_count}")
        print("\nBase de datos configurada exitosamente!")

        cursor.close()
        conn.close()

    except psycopg2.Error as e:
        print(f"\nERROR de PostgreSQL: {e}")
        sys.exit(1)
    except FileNotFoundError as e:
        print(f"\nERROR: Archivo SQL no encontrado: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()
