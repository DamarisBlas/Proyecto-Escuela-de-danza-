from src.models.sorteo import Sorteo
from src.app import db

class SorteoRepository:
    """
    Repositorio para operaciones CRUD de Sorteo
    """

    @staticmethod
    def get_all():
        """
        Obtiene todos los sorteos
        """
        return Sorteo.query.all()

    @staticmethod
    def get_by_id(sorteo_id):
        """
        Obtiene un sorteo por ID
        """
        return Sorteo.query.get(sorteo_id)

    @staticmethod
    def get_active():
        """
        Obtiene todos los sorteos activos
        """
        return Sorteo.query.filter_by(estado=True).all()

    @staticmethod
    def get_by_promocion(promocion_id):
        """
        Obtiene todos los sorteos de una promoción
        """
        return Sorteo.query.filter_by(Promocion_id_promocion=promocion_id).all()

    @staticmethod
    def get_vigentes():
        """
        Obtiene sorteos vigentes (fecha actual <= fecha_sorteo)
        """
        from datetime import date
        today = date.today()
        return Sorteo.query.filter(
            Sorteo.estado == True,
            Sorteo.fecha_sorteo >= today
        ).all()

    @staticmethod
    def create(sorteo_data):
        """
        Crea un nuevo sorteo
        """
        sorteo = Sorteo(**sorteo_data)
        db.session.add(sorteo)
        db.session.flush()  # Para obtener el ID
        return sorteo

    @staticmethod
    def update(sorteo_id, sorteo_data):
        """
        Actualiza un sorteo existente
        """
        sorteo = Sorteo.query.get(sorteo_id)
        if not sorteo:
            return None

        for key, value in sorteo_data.items():
            if hasattr(sorteo, key):
                setattr(sorteo, key, value)

        db.session.flush()
        return sorteo

    @staticmethod
    def delete(sorteo_id):
        """
        Elimina un sorteo (borrado lógico)
        """
        sorteo = Sorteo.query.get(sorteo_id)
        if not sorteo:
            return None

        sorteo.estado = False
        db.session.flush()
        return sorteo