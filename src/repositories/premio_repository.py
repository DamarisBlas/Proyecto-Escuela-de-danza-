from src.models.premios import Premio
from src.app import db

class PremioRepository:
    """
    Repositorio para operaciones CRUD de Premio
    """

    @staticmethod
    def get_all():
        """
        Obtiene todos los premios
        """
        return Premio.query.all()

    @staticmethod
    def get_by_id(premio_id):
        """
        Obtiene un premio por ID
        """
        return Premio.query.get(premio_id)

    @staticmethod
    def get_by_promocion(promocion_id):
        """
        Obtiene todos los premios de una promoción
        """
        return Premio.query.filter_by(Promocion_id_promocion=promocion_id).all()

    @staticmethod
    def get_active():
        """
        Obtiene todos los premios activos
        """
        return Premio.query.filter_by(estado=True).all()

    @staticmethod
    def create(premio_data):
        """
        Crea un nuevo premio
        """
        premio = Premio(**premio_data)
        db.session.add(premio)
        db.session.flush()  # Para obtener el ID
        return premio

    @staticmethod
    def create_multiple(premios_data):
        """
        Crea múltiples premios de una vez
        """
        premios = []
        for premio_data in premios_data:
            premio = Premio(**premio_data)
            db.session.add(premio)
            premios.append(premio)
        
        db.session.flush()  # Para obtener los IDs
        return premios

    @staticmethod
    def update(premio_id, premio_data):
        """
        Actualiza un premio existente
        """
        premio = Premio.query.get(premio_id)
        if not premio:
            return None

        for key, value in premio_data.items():
            if hasattr(premio, key):
                setattr(premio, key, value)

        db.session.flush()
        return premio

    @staticmethod
    def delete(premio_id):
        """
        Elimina un premio (borrado lógico)
        """
        premio = Premio.query.get(premio_id)
        if not premio:
            return None

        premio.estado = False
        db.session.flush()
        return premio

    @staticmethod
    def delete_by_promocion(promocion_id):
        """
        Elimina todos los premios de una promoción (borrado lógico)
        """
        premios = Premio.query.filter_by(Promocion_id_promocion=promocion_id).all()
        for premio in premios:
            premio.estado = False
        
        db.session.flush()
        return premios