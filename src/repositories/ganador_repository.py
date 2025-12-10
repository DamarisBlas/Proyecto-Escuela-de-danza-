from src.models.ganador import Ganador
from src.models.persona import Persona
from src.models.sorteo import Sorteo
from src.models.premios import Premio
from src.app import db

class GanadorRepository:
    """
    Repositorio para operaciones CRUD de Ganador
    """

    @staticmethod
    def get_all():
        """
        Obtiene todos los ganadores
        """
        return Ganador.query.all()

    @staticmethod
    def get_by_id(ganador_id):
        """
        Obtiene un ganador por ID
        """
        return Ganador.query.get(ganador_id)

    @staticmethod
    def get_active():
        """
        Obtiene todos los ganadores activos
        """
        return Ganador.query.filter_by(estado=True).all()

    @staticmethod
    def get_by_sorteo(sorteo_id):
        """
        Obtiene todos los ganadores de un sorteo
        """
        return Ganador.query.filter_by(Sorteo_id_sorteo=sorteo_id).all()

    @staticmethod
    def get_by_persona(persona_id):
        """
        Obtiene todos los ganadores de una persona
        """
        return Ganador.query.filter_by(Persona_id_persona=persona_id).all()

    @staticmethod
    def get_ganadores_detallados_by_sorteo(sorteo_id):
        """
        Obtiene todos los ganadores de un sorteo con información detallada de persona y premio
        """
        return db.session.query(
            Ganador,
            Persona,
            Premio
        ).join(
            Persona, Ganador.Persona_id_persona == Persona.id_persona
        ).join(
            Premio, Ganador.Premios_id_premio == Premio.id_premio
        ).filter(
            Ganador.Sorteo_id_sorteo == sorteo_id
        ).all()

    @staticmethod
    def create(ganador_data):
        """
        Crea un nuevo ganador
        """
        ganador = Ganador(**ganador_data)
        db.session.add(ganador)
        db.session.flush()  # Para obtener el ID
        return ganador

    @staticmethod
    def update(ganador_id, ganador_data):
        """
        Actualiza un ganador existente
        """
        ganador = Ganador.query.get(ganador_id)
        if not ganador:
            return None

        for key, value in ganador_data.items():
            if hasattr(ganador, key):
                setattr(ganador, key, value)

        db.session.flush()
        return ganador

    @staticmethod
    def delete(ganador_id):
        """
        Elimina un ganador (borrado lógico)
        """
        ganador = Ganador.query.get(ganador_id)
        if not ganador:
            return None

        ganador.estado = False
        db.session.flush()
        return ganador