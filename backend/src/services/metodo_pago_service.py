from src.repositories.metodo_pago_repository import MetodoPagoRepository
from src.app import db

class MetodoPagoService:
    """
    Servicio para lógica de negocio de MetodoPago
    """

    @staticmethod
    def get_all_metodos_pago():
        """
        Obtiene todos los métodos de pago
        """
        try:
            metodos_pago = MetodoPagoRepository.get_all()
            return [metodo.to_dict() for metodo in metodos_pago], 200
        except Exception as e:
            return {"error": f"Error al obtener métodos de pago: {str(e)}"}, 500

    @staticmethod
    def get_metodo_pago_by_id(metodo_pago_id):
        """
        Obtiene un método de pago por ID
        """
        try:
            metodo_pago = MetodoPagoRepository.get_by_id(metodo_pago_id)
            if not metodo_pago:
                return {"error": "Método de pago no encontrado"}, 404
            return metodo_pago.to_dict(), 200
        except Exception as e:
            return {"error": f"Error al obtener método de pago: {str(e)}"}, 500

    @staticmethod
    def get_active_metodos_pago():
        """
        Obtiene todos los métodos de pago activos
        """
        try:
            metodos_pago = MetodoPagoRepository.get_active()
            return [metodo.to_dict() for metodo in metodos_pago], 200
        except Exception as e:
            return {"error": f"Error al obtener métodos de pago activos: {str(e)}"}, 500

    @staticmethod
    def create_metodo_pago(metodo_pago_data):
        """
        Crea un nuevo método de pago con validaciones
        """
        try:
            # Validaciones requeridas
            required_fields = ['nombre_metodo']
            if not all(field in metodo_pago_data for field in required_fields):
                return {"error": "Faltan campos requeridos"}, 400

            # Validar que el nombre no esté vacío
            if not metodo_pago_data['nombre_metodo'].strip():
                return {"error": "El nombre del método de pago no puede estar vacío"}, 400

            # Valores por defecto
            metodo_pago_data.setdefault('estado', True)

            # Crear el método de pago
            metodo_pago = MetodoPagoRepository.create(metodo_pago_data)
            db.session.commit()

            return {
                "message": "Método de pago creado exitosamente",
                "metodo_pago": metodo_pago.to_dict()
            }, 201

        except Exception as e:
            db.session.rollback()
            return {"error": f"Error al crear método de pago: {str(e)}"}, 500

    @staticmethod
    def update_metodo_pago(metodo_pago_id, metodo_pago_data):
        """
        Actualiza un método de pago existente
        """
        try:
            # Verificar que el método de pago existe
            existing_metodo_pago = MetodoPagoRepository.get_by_id(metodo_pago_id)
            if not existing_metodo_pago:
                return {"error": "Método de pago no encontrado"}, 404

            # Validar nombre si se actualiza
            if 'nombre_metodo' in metodo_pago_data:
                if not metodo_pago_data['nombre_metodo'].strip():
                    return {"error": "El nombre del método de pago no puede estar vacío"}, 400

            metodo_pago = MetodoPagoRepository.update(metodo_pago_id, metodo_pago_data)
            db.session.commit()

            return {
                "message": "Método de pago actualizado exitosamente",
                "metodo_pago": metodo_pago.to_dict()
            }, 200

        except Exception as e:
            db.session.rollback()
            return {"error": f"Error al actualizar método de pago: {str(e)}"}, 500

    @staticmethod
    def delete_metodo_pago(metodo_pago_id):
        """
        Elimina un método de pago (borrado lógico)
        """
        try:
            metodo_pago = MetodoPagoRepository.delete(metodo_pago_id)
            if not metodo_pago:
                return {"error": "Método de pago no encontrado"}, 404

            db.session.commit()
            return {"message": "Método de pago eliminado exitosamente"}, 200

        except Exception as e:
            db.session.rollback()
            return {"error": f"Error al eliminar método de pago: {str(e)}"}, 500