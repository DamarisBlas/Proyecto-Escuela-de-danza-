from src.models.promocion import Promocion
from src.app import db

class PromocionRepository:
    """
    Repositorio para operaciones CRUD de Promocion
    """

    @staticmethod
    def get_all():
        """
        Obtiene todas las promociones
        """
        return Promocion.query.all()

    @staticmethod
    def get_by_id(promocion_id):
        """
        Obtiene una promoción por ID
        """
        return Promocion.query.get(promocion_id)

    @staticmethod
    def get_active():
        """
        Obtiene todas las promociones activas
        """
        return Promocion.query.filter_by(estado=True).all()

    @staticmethod
    def get_by_oferta(oferta_id):
        """
        Obtiene todas las promociones de una oferta
        """
        return Promocion.query.filter_by(Oferta_id_oferta=oferta_id).all()

    @staticmethod
    def get_vigentes():
        """
        Obtiene promociones vigentes (fecha actual entre fecha_inicio y fecha_fin)
        """
        from datetime import date
        today = date.today()
        return Promocion.query.filter(
            Promocion.estado == True,
            Promocion.fecha_inicio <= today,
            Promocion.fecha_fin >= today
        ).all()

    @staticmethod
    def get_by_publico_objetivo(publico_objetivo):
        """
        Obtiene promociones por público objetivo
        """
        return Promocion.query.filter_by(
            publico_objetivo=publico_objetivo,
            estado=True
        ).all()

    @staticmethod
    def create(promocion_data):
        """
        Crea una nueva promoción
        """
        promocion = Promocion(**promocion_data)
        db.session.add(promocion)
        db.session.flush()  # Para obtener el ID
        return promocion

    @staticmethod
    def update(promocion_id, promocion_data):
        """
        Actualiza una promoción existente
        """
        promocion = Promocion.query.get(promocion_id)
        if not promocion:
            return None

        for key, value in promocion_data.items():
            if hasattr(promocion, key):
                setattr(promocion, key, value)

        db.session.flush()
        return promocion

    @staticmethod
    def delete(promocion_id):
        """
        Elimina una promoción (borrado lógico)
        """
        promocion = Promocion.query.get(promocion_id)
        if not promocion:
            return None

        promocion.estado = False
        db.session.flush()
        return promocion