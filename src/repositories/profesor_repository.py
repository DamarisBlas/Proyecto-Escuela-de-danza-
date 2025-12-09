from src.models.profesor import Profesor
from src.models.persona import Persona
from ..app import db

class ProfesorRepository:
    
    @staticmethod
    def get_all():
        """Obtiene todos los profesores con información de persona"""
        return db.session.query(Profesor, Persona).join(
            Persona, Profesor.Persona_id_persona == Persona.id_persona
        ).all()
    
    @staticmethod
    def get_by_id(profesor_id):
        """Obtiene un profesor por ID (Persona_id_persona)"""
        return Profesor.query.filter_by(Persona_id_persona=profesor_id).first()
    
    @staticmethod
    def get_profesor_with_persona(profesor_id):
        """Obtiene un profesor con su información de persona"""
        return db.session.query(Profesor, Persona).join(
            Persona, Profesor.Persona_id_persona == Persona.id_persona
        ).filter(Profesor.Persona_id_persona == profesor_id).first()
    
    @staticmethod
    def get_active():
        """Obtiene todos los profesores activos"""
        return db.session.query(Profesor, Persona).join(
            Persona, Profesor.Persona_id_persona == Persona.id_persona
        ).filter(Profesor.estado == True).all()
    
    @staticmethod
    def get_temporales():
        """Obtiene todos los profesores temporales"""
        return db.session.query(Profesor, Persona).join(
            Persona, Profesor.Persona_id_persona == Persona.id_persona
        ).filter(Persona.temporal == True).all()
    
    @staticmethod
    def get_permanentes():
        """Obtiene todos los profesores permanentes (con cuenta)"""
        return db.session.query(Profesor, Persona).join(
            Persona, Profesor.Persona_id_persona == Persona.id_persona
        ).filter(Persona.temporal == False).all()
    
    @staticmethod
    def create_persona(persona_data):
        """Crea una nueva persona"""
        persona = Persona(**persona_data)
        db.session.add(persona)
        db.session.flush()  # Para obtener el id sin hacer commit
        return persona
    
    @staticmethod
    def create_profesor(profesor_data):
        """Crea un nuevo profesor"""
        profesor = Profesor(**profesor_data)
        db.session.add(profesor)
        db.session.commit()
        return profesor
    
    @staticmethod
    def update_persona(persona, data):
        """Actualiza una persona"""
        for key, value in data.items():
            if hasattr(persona, key):
                setattr(persona, key, value)
        db.session.commit()
        return persona
    
    @staticmethod
    def update_profesor(profesor, data):
        """Actualiza un profesor"""
        for key, value in data.items():
            if hasattr(profesor, key):
                setattr(profesor, key, value)
        db.session.commit()
        return profesor
    
    @staticmethod
    def delete(profesor_id):
        """Eliminación lógica de un profesor"""
        profesor = Profesor.query.filter_by(Persona_id_persona=profesor_id).first()
        if profesor:
            profesor.estado = False
            db.session.commit()
        return profesor
    
    @staticmethod
    def get_persona_by_id(persona_id):
        """Obtiene una persona por ID"""
        return Persona.query.filter_by(id_persona=persona_id).first()
    
    @staticmethod
    def get_by_persona_id(persona_id):
        """Obtiene un profesor por ID de persona"""
        return Profesor.query.filter_by(Persona_id_persona=persona_id).first()
