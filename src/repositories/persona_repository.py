from src.models.persona import Persona
from src.app import db

class PersonaRepository:
    """
    Repositorio para operaciones CRUD de Persona
    """

    @staticmethod
    def get_all():
        """
        Obtiene todas las personas
        """
        return Persona.query.all()

    @staticmethod
    def get_by_id(persona_id):
        """
        Obtiene una persona por ID
        """
        return Persona.query.get(persona_id)

    @staticmethod
    def get_active():
        """
        Obtiene todas las personas activas (estado = True)
        """
        return Persona.query.filter_by(estado=True).all()

    @staticmethod
    def get_by_email(email):
        """
        Obtiene una persona por email
        """
        return Persona.query.filter_by(email=email).first()

    @staticmethod
    def create(persona_data):
        """
        Crea una nueva persona
        """
        persona = Persona(**persona_data)
        db.session.add(persona)
        db.session.flush()  # Para obtener el ID sin hacer commit
        return persona

    @staticmethod
    def update(persona_id, persona_data):
        """
        Actualiza una persona existente
        """
        persona = PersonaRepository.get_by_id(persona_id)
        if persona:
            for key, value in persona_data.items():
                if hasattr(persona, key):
                    setattr(persona, key, value)
            db.session.flush()
            # Persistir cambios inmediatamente
            db.session.commit()
        return persona

    @staticmethod
    def delete(persona_id):
        """
        Elimina una persona (borrado lógico)
        """
        persona = PersonaRepository.get_by_id(persona_id)
        if persona:
            persona.estado = False
            db.session.flush()
            # Persistir borrado lógico
            db.session.commit()
        return persona

    @staticmethod
    def search_by_name(nombre=None, apellido=None):
        """
        Busca personas por nombre y/o apellido (busca en apellido_paterno o apellido_materno)
        """
        query = Persona.query.filter_by(estado=True)
        
        if nombre:
            query = query.filter(Persona.nombre.ilike(f'%{nombre}%'))
        
        if apellido:
            # Buscar en apellido_paterno o apellido_materno
            query = query.filter(
                db.or_(
                    Persona.apellido_paterno.ilike(f'%{apellido}%'),
                    Persona.apellido_materno.ilike(f'%{apellido}%')
                )
            )
        
        return query.all()

    @staticmethod
    def get_by_tipo_cuenta(tipo_cuenta):
        """
        Obtiene personas por tipo de cuenta
        """
        return Persona.query.filter_by(tipo_cuenta=tipo_cuenta, estado=True).all()

    @staticmethod
    def get_temporales():
        """
        Obtiene todas las personas temporales
        """
        return Persona.query.filter_by(temporal=True, estado=True).all()