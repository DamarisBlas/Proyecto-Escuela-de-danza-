from src.repositories.ciclo_repository import CicloRepository
from datetime import datetime

class CicloService:
    """
    Servicio para lógica de negocio de Ciclo
    """

    @staticmethod
    def get_all_ciclos():
        """
        Obtiene todos los ciclos
        """
        try:
            ciclos = CicloRepository.get_all()
            return [ciclo.to_dict() for ciclo in ciclos], 200
        except Exception as e:
            return {"error": f"Error al obtener ciclos: {str(e)}"}, 500

    @staticmethod
    def get_ciclo_by_id(ciclo_id):
        """
        Obtiene un ciclo por ID
        """
        try:
            ciclo = CicloRepository.get_by_id(ciclo_id)
            if not ciclo:
                return {"error": "Ciclo no encontrado"}, 404
            return ciclo.to_dict(), 200
        except Exception as e:
            return {"error": f"Error al obtener ciclo: {str(e)}"}, 500

    @staticmethod
    def get_active_ciclos():
        """
        Obtiene todos los ciclos activos
        """
        try:
            ciclos = CicloRepository.get_active()
            return [ciclo.to_dict() for ciclo in ciclos], 200
        except Exception as e:
            return {"error": f"Error al obtener ciclos activos: {str(e)}"}, 500

    @staticmethod
    def create_ciclo(ciclo_data):
        """
        Crea un nuevo ciclo
        """
        try:
            # Validaciones
            required_fields = ['nombre', 'inicio', 'fin']
            if not all(field in ciclo_data for field in required_fields):
                return {"error": "Nombre, inicio y fin son requeridos"}, 400

            # Validar que la fecha de fin sea posterior a la de inicio
            if ciclo_data['inicio'] >= ciclo_data['fin']:
                return {"error": "La fecha de fin debe ser posterior a la fecha de inicio"}, 400

            # Validar que el nombre sea único entre ciclos activos
            existing_ciclo = CicloRepository.get_by_name_active(ciclo_data['nombre'])
            if existing_ciclo:
                return {"error": f"Ya existe un ciclo activo con el nombre '{ciclo_data['nombre']}'"}, 409

            ciclo = CicloRepository.create(ciclo_data)
            return {
                "message": "Ciclo creado exitosamente",
                "ciclo": ciclo.to_dict()
            }, 201

        except Exception as e:
            return {"error": f"Error al crear ciclo: {str(e)}"}, 500

    @staticmethod
    def update_ciclo(ciclo_id, ciclo_data):
        """
        Actualiza un ciclo existente
        """
        try:
            # Verificar que el ciclo existe
            existing_ciclo = CicloRepository.get_by_id(ciclo_id)
            if not existing_ciclo:
                return {"error": "Ciclo no encontrado"}, 404

            # Validar fechas si se proporcionan
            if 'inicio' in ciclo_data and 'fin' in ciclo_data:
                if ciclo_data['inicio'] >= ciclo_data['fin']:
                    return {"error": "La fecha de fin debe ser posterior a la fecha de inicio"}, 400

            # Validar nombre único si se está cambiando el nombre
            if 'nombre' in ciclo_data and ciclo_data['nombre'] != existing_ciclo.nombre:
                existing_name = CicloRepository.get_by_name_active_exclude_id(ciclo_data['nombre'], ciclo_id)
                if existing_name:
                    return {"error": f"Ya existe un ciclo activo con el nombre '{ciclo_data['nombre']}'"}, 409

            ciclo = CicloRepository.update(ciclo_id, ciclo_data)
            return {
                "message": "Ciclo actualizado exitosamente",
                "ciclo": ciclo.to_dict()
            }, 200

        except Exception as e:
            return {"error": f"Error al actualizar ciclo: {str(e)}"}, 500

    @staticmethod
    def delete_ciclo(ciclo_id):
        """
        Elimina un ciclo (borrado lógico)
        """
        try:
            ciclo = CicloRepository.delete(ciclo_id)
            if not ciclo:
                return {"error": "Ciclo no encontrado"}, 404

            return {"message": "Ciclo eliminado exitosamente"}, 200

        except Exception as e:
            return {"error": f"Error al eliminar ciclo: {str(e)}"}, 500