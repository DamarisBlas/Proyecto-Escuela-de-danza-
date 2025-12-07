from werkzeug.security import check_password_hash, generate_password_hash
from src.models import Persona, Alumno, Profesor, Director, Elenco, AlumnoFemme
from src.app import db

class AuthService:
    @staticmethod
    def login(email, password):
        """
        Autentica un usuario y determina su rol
        """
        # Buscar la persona por email
        persona = Persona.query.filter_by(email=email).first()
        
        if not persona:
            return {"error": "Credenciales inválidas"}, 401
        
        # Verificar la contraseña
        if not check_password_hash(persona.password, password):
            return {"error": "Credenciales inválidas"}, 401
        
        # Determinar el rol del usuario
        user_role = AuthService._get_user_role(persona.id_persona)
        
        if not user_role:
            return {"error": "Usuario sin rol asignado"}, 401
        
        return {
            "message": "Login exitoso",
            "user": {
                "id": persona.id_persona,
                "nombre": persona.nombre,
                "apellido_paterno": persona.apellido_paterno,
                "apellido_materno": persona.apellido_materno,
                "email": persona.email,
                "celular": persona.celular,
                "solicitud_user_especial": persona.solicitud_user_especial,
                "role": user_role["role"],
                "role_data": user_role["data"]
            }
        }, 200
    
    @staticmethod
    def _get_user_role(persona_id):
        """
        Determina el rol del usuario verificando en qué tabla de roles existe
        """
        # Verificar si es Alumno
        alumno = Alumno.query.filter_by(Persona_id_persona=persona_id).first()
        if alumno:
            return {
                "role": "alumno",
                "data": {
                    "Persona_id_persona": alumno.Persona_id_persona,
                    "departamento": alumno.departamento,                      
                    "estado": alumno.estado
                }
            }
        
        # Verificar si es AlumnoFemme
        alumno_femme = AlumnoFemme.query.filter_by(Persona_id_persona=persona_id).first()
        if alumno_femme:
            return {
                "role": "alumno_femme",
                "data": {
                    "Persona_id_persona": alumno_femme.Persona_id_persona,
                    "departamento": alumno_femme.departamento,
                    "cumpleanos": alumno_femme.cumpleanos.isoformat() if alumno_femme.cumpleanos else None,
                    "signo": alumno_femme.signo,
                    "estado": alumno_femme.estado
                }
            }
        
        # Verificar si es Profesor
        profesor = Profesor.query.filter_by(Persona_id_persona=persona_id).first()
        if profesor:
            return {
                "role": "profesor",
                "data": {
                    "Persona_id_persona": profesor.Persona_id_persona,
                    "frase": profesor.frase,
                    "descripcion": profesor.descripcion,
                    "redes_sociales": profesor.redes_sociales,
                    "pais_origen": profesor.pais_origen,
                    "cuando_comenzo_danza": profesor.cuando_comenzo_danza.isoformat() if profesor.cuando_comenzo_danza else None,
                    "signo": profesor.signo,
                    "musica": profesor.musica,
                    "estado": profesor.estado
                }
            }
        
        # Verificar si es Director
        director = Director.query.filter_by(Persona_id_persona=persona_id).first()
        if director:
            return {
                "role": "director",
                "data": {
                    "Persona_id_persona": director.Persona_id_persona,
                    "departamento": director.departamento,
                    "estado": director.estado
                }
            }
        
        # Verificar si es Elenco
        elenco = Elenco.query.filter_by(Persona_id_persona=persona_id).first()
        if elenco:
            return {
                "role": "elenco",
                "data": {
                    "Persona_id_persona": elenco.Persona_id_persona,
                    "departamento": elenco.departamento,
                    "cumpleanos": elenco.cumpleanos.isoformat() if elenco.cumpleanos else None,
                    "signo": elenco.signo,
                    "instagram": elenco.instagram,
                    "estado": elenco.estado
                }
            }
        
        # Si no se encuentra en ninguna tabla de roles
        return None
    
    @staticmethod
    def change_password(persona_id, old_password, new_password):
        """
        Cambia la contraseña de un usuario
        
        Args:
            persona_id: ID de la persona
            old_password: Contraseña actual (sin cifrar)
            new_password: Nueva contraseña (sin cifrar)
        
        Returns:
            tuple: (dict con mensaje, status_code)
        """
        # Buscar la persona
        persona = Persona.query.get(persona_id)
        
        if not persona:
            return {"error": "Usuario no encontrado"}, 404
        
        # Verificar que la contraseña actual sea correcta
        if not check_password_hash(persona.password, old_password):
            return {"error": "La contraseña actual es incorrecta"}, 401
        
        # Validar que la nueva contraseña no esté vacía
        if not new_password or len(new_password.strip()) == 0:
            return {"error": "La nueva contraseña no puede estar vacía"}, 400
        
        # Cifrar la nueva contraseña
        hashed_new_password = generate_password_hash(new_password)
        
        # Actualizar la contraseña
        persona.password = hashed_new_password
        db.session.commit()
        
        return {
            "message": "Contraseña actualizada exitosamente",
            "user": {
                "id": persona.id_persona,
                "email": persona.email,
                "nombre": persona.nombre
            }
        }, 200