#import db
from src.app import db
from src.models.persona import Persona
from src.models.alumno import Alumno
from src.models.profesor import Profesor

class UserRepository:
    @staticmethod
    def get_by_email(email: str):
        if not email:
            return None
        return Persona.query.filter_by(email=email).first()

    @staticmethod
    def add_user(user_data: dict):
        # Prevent duplicate emails
        existing = UserRepository.get_by_email(user_data.get('email'))
        if existing:
            raise ValueError('Email already registered')

        nuevo_usuario = Persona(
            nombre=user_data.get('nombre'),
            apellido=user_data.get('apellido'),
            email=user_data.get('email'),
            celular=user_data.get('celular'),
            password=user_data.get('password'),
            fecha_creacion=user_data.get('fecha_creacion'),
            solicitud_user_especial=user_data.get('solicitud_user_especial', False),
            estado=user_data.get('estado', True),
            tipo_cuenta=user_data.get('tipo_cuenta'),
            temporal=user_data.get('temporal', False)
        )

        db.session.add(nuevo_usuario)
        db.session.commit()

        # If the user did not request a special user (profesor), create an Alumno automatically
        if not nuevo_usuario.solicitud_user_especial:
            nuevo_alumno = Alumno(
                Persona_id_persona=nuevo_usuario.id_persona,
                estado=True
            )
            db.session.add(nuevo_alumno)
            db.session.commit()
            # attach for convenience
            nuevo_usuario.alumno = nuevo_alumno

            return nuevo_usuario
      
        # If the user requested a special user (profesor), do not create Alumno
        if nuevo_usuario.solicitud_user_especial:
            nuevo_profesor = Profesor(
                Persona_id_persona=nuevo_usuario.id_persona,
                estado=False  # Profesores start as inactive, pending approval
            )
            db.session.add(nuevo_profesor)
            db.session.commit()
            # attach for convenience
            nuevo_usuario.profesor = nuevo_profesor
            return nuevo_usuario


