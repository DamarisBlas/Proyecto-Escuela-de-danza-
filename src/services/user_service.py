from src.app import db
from src.models.persona import Persona
from src.repositories.user_repository import UserRepository
from werkzeug.security import generate_password_hash
import datetime


class UserService:
    @staticmethod
    def _validate_payload(data: dict):
        required = ['nombre', 'email', 'password', 'celular']
        missing = [f for f in required if not data.get(f)]
        if missing:
            raise ValueError(f"Missing required fields: {', '.join(missing)}")

    @staticmethod
    def create_user(data: dict) -> Persona:
        # Basic validation
        UserService._validate_payload(data)

        # Hash password
        hashed_password = generate_password_hash(data['password'])
        
        # Determinar tipo_cuenta basado en solicitud_user_especial
        solicitud_especial = data.get('solicitud_user_especial', False)
        tipo_cuenta = data.get('tipo_cuenta')  # Permitir override explícito
        
        # Si no se especifica tipo_cuenta, asignar automáticamente
        if not tipo_cuenta:
            if solicitud_especial:
                tipo_cuenta = 'profesor'  # Usuario solicitó ser profesor
            else:
                tipo_cuenta = 'alumno'    # Usuario normal = alumno

        user_data = {
            'nombre': data['nombre'],
            'apellido_paterno': data.get('apellido_paterno'),
            'apellido_materno': data.get('apellido_materno'),
            'email': data['email'],
            'celular': data['celular'],
            'password': hashed_password,
            'fecha_creacion': datetime.datetime.utcnow(),
            'solicitud_user_especial': solicitud_especial,
            'estado': True,
            'tipo_cuenta': tipo_cuenta,
            'temporal': data.get('temporal', False)
        }

        # Delegate persistence to repository (which checks duplicates)
        persona = UserRepository.add_user(user_data)

        result = {
            'persona': persona,
            'alumno_id': getattr(persona, 'alumno', None).id_alumno if getattr(persona, 'alumno', None) else None
        }
        return result