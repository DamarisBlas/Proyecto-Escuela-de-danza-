import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from src.app import create_app, db
from src.models.persona import Persona
from src.models.director import Director
from src.models.profesor import Profesor
from werkzeug.security import generate_password_hash

def create_director_and_profesor():
    app = create_app()
    
    with app.app_context():
        try:
            # ============= CREAR DIRECTOR =============
            # Verificar si ya existe el director
            director_persona = Persona.query.filter_by(email='director@academia.com').first()
            
            if not director_persona:
                # Crear persona para director
                director_persona = Persona(
                    nombre='Carlos',
                    apellido='Mendoza',
                    email='director@academia.com',
                    celular='123456789',
                    password=generate_password_hash('director123'),
                    solicitud_user_especial=False,
                    estado=True,
                    tipo_cuenta='director',
                    temporal=False
                )
                db.session.add(director_persona)
                db.session.flush()  # Para obtener el id_persona
                
                # Crear registro de Director
                director = Director(
                    Persona_id_persona=director_persona.id_persona,
                    departamento='Administración',
                    estado=True
                )
                db.session.add(director)
                db.session.commit()
                
                print("✅ DIRECTOR CREADO:")
                print(f"   Email: director@academia.com")
                print(f"   Password: director123")
                print(f"   ID Persona: {director_persona.id_persona}")
                print(f"   ID Director: {director.id_director}")
            else:
                print("⚠️  Director ya existe:")
                print(f"   Email: director@academia.com")
                print(f"   Password: director123")
                print(f"   ID Persona: {director_persona.id_persona}")
            
            print()
            
            # ============= CREAR PROFESOR =============
            # Verificar si ya existe el profesor
            profesor_persona = Persona.query.filter_by(email='profesor@academia.com').first()
            
            if not profesor_persona:
                # Crear persona para profesor
                profesor_persona = Persona(
                    nombre='María',
                    apellido='González',
                    email='profesor@academia.com',
                    celular='987654321',
                    password=generate_password_hash('profesor123'),
                    solicitud_user_especial=False,
                    estado=True,
                    tipo_cuenta='profesor',
                    temporal=False
                )
                db.session.add(profesor_persona)
                db.session.flush()  # Para obtener el id_persona
                
                # Crear registro de Profesor
                profesor = Profesor(
                    Persona_id_persona=profesor_persona.id_persona,
                    frase='La danza es el lenguaje del alma',
                    descripcion='Profesora de salsa y bachata con 10 años de experiencia',
                    redes_sociales='@maria_dance',
                    cuidad='Lima',
                    experiencia=10,  # INTEGER: años de experiencia
                    signo='Leo',
                    musica='Salsa, Bachata',
                    estilos='Salsa, Bachata, Merengue',
                    estado=True
                )
                db.session.add(profesor)
                db.session.commit()
                
                print("✅ PROFESOR CREADO:")
                print(f"   Email: profesor@academia.com")
                print(f"   Password: profesor123")
                print(f"   ID Persona: {profesor_persona.id_persona}")
                print(f"   ID Profesor: {profesor.id_profesor}")
            else:
                print("⚠️  Profesor ya existe:")
                print(f"   Email: profesor@academia.com")
                print(f"   Password: profesor123")
                print(f"   ID Persona: {profesor_persona.id_persona}")
            
            print()
            print("=" * 60)
            print("CREDENCIALES DE PRUEBA:")
            print("=" * 60)
            print("DIRECTOR:")
            print("  Email: director@academia.com")
            print("  Password: director123")
            print()
            print("PROFESOR:")
            print("  Email: profesor@academia.com")
            print("  Password: profesor123")
            print("=" * 60)
            
        except Exception as e:
            db.session.rollback()
            print(f"❌ Error: {str(e)}")
            import traceback
            traceback.print_exc()

if __name__ == '__main__':
    create_director_and_profesor()
