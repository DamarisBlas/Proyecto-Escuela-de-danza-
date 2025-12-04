from src.repositories.oferta_repository import OfertaRepository
from datetime import datetime

class OfertaService:
    """
    Servicio para lógica de negocio de Oferta
    """

    @staticmethod
    def get_all_ofertas():
        """
        Obtiene todas las ofertas
        """
        try:
            ofertas = OfertaRepository.get_all()
            return [oferta.to_dict() for oferta in ofertas], 200
        except Exception as e:
            return {"error": f"Error al obtener ofertas: {str(e)}"}, 500

    @staticmethod
    def get_oferta_by_id(oferta_id):
        """
        Obtiene una oferta por ID
        """
        try:
            oferta = OfertaRepository.get_by_id(oferta_id)
            if not oferta:
                return {"error": "Oferta no encontrada"}, 404
            return oferta.to_dict(), 200
        except Exception as e:
            return {"error": f"Error al obtener oferta: {str(e)}"}, 500

    @staticmethod
    def get_oferta_completa(oferta_id):
        """
        Obtiene una oferta con toda su información relacionada
        """
        try:
            oferta_completa = OfertaRepository.get_oferta_completa(oferta_id)
            if not oferta_completa:
                return {"error": "Oferta no encontrada"}, 404
            return oferta_completa, 200
        except Exception as e:
            return {"error": f"Error al obtener oferta completa: {str(e)}"}, 500

    @staticmethod
    def get_active_ofertas():
        """
        Obtiene todas las ofertas activas
        """
        try:
            ofertas = OfertaRepository.get_active()
            return [oferta.to_dict() for oferta in ofertas], 200
        except Exception as e:
            return {"error": f"Error al obtener ofertas activas: {str(e)}"}, 500

    @staticmethod
    def get_ofertas_by_ciclo(ciclo_id):
        """
        Obtiene todas las ofertas de un ciclo
        """
        try:
            ofertas = OfertaRepository.get_by_ciclo(ciclo_id)
            return [oferta.to_dict() for oferta in ofertas], 200
        except Exception as e:
            return {"error": f"Error al obtener ofertas del ciclo: {str(e)}"}, 500

    @staticmethod
    def create_oferta(oferta_data):
        """
        Crea una nueva oferta
        """
        try:
            # Validaciones
            required_fields = ['ciclo_id_ciclo', 'Subcategoria_id_subcategoria', 'nombre_oferta', 
                             'fecha_inicio', 'fecha_fin', 'cantidad_cursos']
            if not all(field in oferta_data for field in required_fields):
                return {"error": "Faltan campos requeridos"}, 400

            # Validar que la fecha de fin sea posterior a la de inicio
            if oferta_data['fecha_inicio'] >= oferta_data['fecha_fin']:
                return {"error": "La fecha de fin debe ser posterior a la fecha de inicio"}, 400

            oferta = OfertaRepository.create(oferta_data)
            return {
                "message": "Oferta creada exitosamente",
                "oferta": oferta.to_dict()
            }, 201

        except Exception as e:
            return {"error": f"Error al crear oferta: {str(e)}"}, 500

    @staticmethod
    def update_oferta(oferta_id, oferta_data):
        """
        Actualiza una oferta existente
        """
        try:
            # Verificar que la oferta existe
            existing_oferta = OfertaRepository.get_by_id(oferta_id)
            if not existing_oferta:
                return {"error": "Oferta no encontrada"}, 404

            # Validar fechas si se proporcionan
            if 'fecha_inicio' in oferta_data and 'fecha_fin' in oferta_data:
                if oferta_data['fecha_inicio'] >= oferta_data['fecha_fin']:
                    return {"error": "La fecha de fin debe ser posterior a la fecha de inicio"}, 400

            oferta = OfertaRepository.update(oferta_id, oferta_data)
            return {
                "message": "Oferta actualizada exitosamente",
                "oferta": oferta.to_dict()
            }, 200

        except Exception as e:
            return {"error": f"Error al actualizar oferta: {str(e)}"}, 500

    @staticmethod
    def delete_oferta(oferta_id):
        """
        Elimina una oferta (borrado lógico)
        """
        try:
            oferta = OfertaRepository.delete(oferta_id)
            if not oferta:
                return {"error": "Oferta no encontrada"}, 404

            return {"message": "Oferta eliminada exitosamente"}, 200

        except Exception as e:
            return {"error": f"Error al eliminar oferta: {str(e)}"}, 500
