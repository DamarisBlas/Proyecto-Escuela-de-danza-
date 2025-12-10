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
            apellido_paterno=user_data.get('apellido_paterno'),
            apellido_materno=user_data.get('apellido_materno'),
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

    @staticmethod
    def add_user_from_admin(user_data: dict):
        """
        Crea un usuario desde el panel de administración con tipo_cuenta específico.
        Crea la fila correspondiente en la tabla del rol con estado=TRUE.
        """
        from src.models.profesor import Profesor
        from src.models.alumno import Alumno
        from src.models.alumno_femme import AlumnoFemme
        from src.models.director import Director

        # Prevent duplicate emails
        existing = UserRepository.get_by_email(user_data.get('email'))
        if existing:
            raise ValueError('Email already registered')

        tipo_cuenta = user_data.get('tipo_cuenta')

        # Crear la persona
        nuevo_usuario = Persona(
            nombre=user_data.get('nombre'),
            apellido_paterno=user_data.get('apellido_paterno'),
            apellido_materno=user_data.get('apellido_materno'),
            email=user_data.get('email'),
            celular=user_data.get('celular'),
            password=user_data.get('password'),
            fecha_creacion=user_data.get('fecha_creacion'),
            solicitud_user_especial=user_data.get('solicitud_user_especial', False),
            estado=user_data.get('estado', True),
            tipo_cuenta=tipo_cuenta,
            temporal=user_data.get('temporal', False)
        )

        db.session.add(nuevo_usuario)
        db.session.flush()  # Obtener el ID sin hacer commit aún

        # Crear la fila correspondiente según tipo_cuenta con estado=TRUE
        if tipo_cuenta == 'profesor':
            nuevo_rol = Profesor(
                Persona_id_persona=nuevo_usuario.id_persona,
                estado=True  # Siempre TRUE para usuarios creados desde admin
            )
            db.session.add(nuevo_rol)
            nuevo_usuario.profesor = nuevo_rol

        elif tipo_cuenta == 'director':
            nuevo_rol = Director(
                Persona_id_persona=nuevo_usuario.id_persona,
                estado=True  # Siempre TRUE para usuarios creados desde admin
            )
            db.session.add(nuevo_rol)
            nuevo_usuario.director = nuevo_rol

        elif tipo_cuenta == 'alumno':
            nuevo_rol = Alumno(
                Persona_id_persona=nuevo_usuario.id_persona,
                estado=True  # Siempre TRUE para usuarios creados desde admin
            )
            db.session.add(nuevo_rol)
            nuevo_usuario.alumno = nuevo_rol

        elif tipo_cuenta == 'alumno_femme':
            # Para alumno_femme necesitamos datos adicionales, pero como no los tenemos,
            # pondremos valores por defecto
            from datetime import date
            nuevo_rol = AlumnoFemme(
                Persona_id_persona=nuevo_usuario.id_persona,
                cumpleanos=date.today(),  # Valor por defecto
                signo="No especificado",  # Valor por defecto
                departamento="La Paz",    # Valor por defecto
                estado=True  # Siempre TRUE para usuarios creados desde admin
            )
            db.session.add(nuevo_rol)
            nuevo_usuario.alumno_femme = nuevo_rol

        # Commit de todas las operaciones
        db.session.commit()

        return {
            'persona': nuevo_usuario,
            'tipo_cuenta': tipo_cuenta,
            'estado_rol': True,
            'message': f'Usuario {tipo_cuenta} creado exitosamente'
        }


