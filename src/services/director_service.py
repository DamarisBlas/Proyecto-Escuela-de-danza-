from werkzeug.security import generate_password_hash
from src.models import Persona, Director
from src.app import db
from datetime import datetime

class DirectorService:
    @staticmethod
    def create_director(director_data):
        """
        Crea un nuevo director
        """
        try:
            # Verificar si ya existe un usuario con ese email
            existing_user = Persona.query.filter_by(email=director_data['email']).first()
            if existing_user:
                return {"error": "Ya existe un usuario con ese email"}, 400
            
            # Crear nueva persona
            nueva_persona = Persona(
                nombre=director_data['nombre'],
                apellido_paterno=director_data.get('apellido_paterno'),
                apellido_materno=director_data.get('apellido_materno'),
                email=director_data['email'],
                celular=director_data.get('celular'),
                password=generate_password_hash(director_data['password']),
                fecha_creacion=datetime.now(),
                solicitud_user_especial=True  # Los directores son usuarios especiales
            )
            
            db.session.add(nueva_persona)
            db.session.flush()  # Para obtener el id_persona
            
            # Crear director
            nuevo_director = Director(
                Persona_id_persona=nueva_persona.id_persona,
                departamento=director_data.get('departamento'),
                estado= True
            )
            
            db.session.add(nuevo_director)
            db.session.commit()
            
            return {
                "message": "Director creado exitosamente",
                "director": {
                    "id_persona": nueva_persona.id_persona,
                    "Persona_id_persona": nuevo_director.Persona_id_persona,
                    "nombre": nueva_persona.nombre,
                    "apellido_paterno": nueva_persona.apellido_paterno,
                    "apellido_materno": nueva_persona.apellido_materno,
                    "email": nueva_persona.email,
                    "celular": nueva_persona.celular,
                    "departamento": nuevo_director.departamento,
                    "fecha_creacion": nueva_persona.fecha_creacion.isoformat(),
                    "estado": nuevo_director.estado
                }
            }, 201
            
        except Exception as e:
            db.session.rollback()
            return {"error": f"Error al crear director: {str(e)}"}, 500