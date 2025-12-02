from src.models.metodo_pago import MetodoPago
from src.app import db

class MetodoPagoRepository:
    """
    Repositorio para operaciones CRUD de MetodoPago
    """

    @staticmethod
    def get_all():
        """
        Obtiene todos los métodos de pago
        """
        return MetodoPago.query.all()

    @staticmethod
    def get_by_id(metodo_pago_id):
        """
        Obtiene un método de pago por ID
        """
        return MetodoPago.query.get(metodo_pago_id)

    @staticmethod
    def get_active():
        """
        Obtiene todos los métodos de pago activos
        """
        return MetodoPago.query.filter_by(estado=True).all()

    @staticmethod
    def create(metodo_pago_data):
        """
        Crea un nuevo método de pago
        """
        metodo_pago = MetodoPago(**metodo_pago_data)
        db.session.add(metodo_pago)
        db.session.flush()  # Para obtener el ID
        return metodo_pago

    @staticmethod
    def update(metodo_pago_id, metodo_pago_data):
        """
        Actualiza un método de pago existente
        """
        metodo_pago = MetodoPago.query.get(metodo_pago_id)
        if not metodo_pago:
            return None

        for key, value in metodo_pago_data.items():
            if hasattr(metodo_pago, key):
                setattr(metodo_pago, key, value)

        db.session.flush()
        return metodo_pago

    @staticmethod
    def delete(metodo_pago_id):
        """
        Elimina un método de pago (borrado lógico)
        """
        metodo_pago = MetodoPago.query.get(metodo_pago_id)
        if not metodo_pago:
            return None

        metodo_pago.estado = False
        db.session.flush()
        return metodo_pago