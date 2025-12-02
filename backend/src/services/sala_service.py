from src.repositories.sala_repository import SalaRepository

class SalaService:
    """
    Servicio para lógica de negocio de Sala
    """

    # Mapeo de nombres de zona a códigos
    ZONA_MAPPING = {
        "la paz": "LP",
        "cochabamba": "CB",
        "santa cruz": "SC",
        "oruro": "OR",
        "potosi": "PT",
        "chuquisaca": "CH",
        "tarija": "TJ",
        "beni": "BE",
        "pando": "PD"
    }

    @staticmethod
    def normalize_zona(zona):
        """
        Convierte un nombre de zona a su código abreviado
        """
        if not zona:
            return "LP"  # Valor por defecto

        zona_lower = zona.lower().strip()

        # Buscar coincidencia exacta
        if zona_lower in SalaService.ZONA_MAPPING:
            return SalaService.ZONA_MAPPING[zona_lower]

        # Buscar por código ya abreviado (LP, CB, etc.)
        zona_upper = zona.upper().strip()
        if zona_upper in SalaService.ZONA_MAPPING.values():
            return zona_upper

        # Si no encuentra coincidencia, devolver LP por defecto
        return "LP"

    @staticmethod
    def get_all_salas():
        """
        Obtiene todas las salas
        """
        try:
            salas = SalaRepository.get_all()
            return [sala.to_dict() for sala in salas], 200
        except Exception as e:
            return {"error": f"Error al obtener salas: {str(e)}"}, 500

    @staticmethod
    def get_sala_by_id(sala_id):
        """
        Obtiene una sala por ID
        """
        try:
            sala = SalaRepository.get_by_id(sala_id)
            if not sala:
                return {"error": "Sala no encontrada"}, 404
            return sala.to_dict(), 200
        except Exception as e:
            return {"error": f"Error al obtener sala: {str(e)}"}, 500

    @staticmethod
    def get_salas_by_departamento(departamento):
        """
        Obtiene todas las salas de un departamento específico
        """
        try:
            salas = SalaRepository.get_by_departamento(departamento)
            return [sala.to_dict() for sala in salas], 200
        except Exception as e:
            return {"error": f"Error al obtener salas del departamento: {str(e)}"}, 500

    @staticmethod
    def get_salas_by_zona(zona):
        """
        Obtiene todas las salas de una zona específica
        """
        try:
            salas = SalaRepository.get_by_zona(zona)
            return [sala.to_dict() for sala in salas], 200
        except Exception as e:
            return {"error": f"Error al obtener salas de la zona: {str(e)}"}, 500

    @staticmethod
    def get_active_salas():
        """
        Obtiene todas las salas activas
        """
        try:
            salas = SalaRepository.get_active()
            return [sala.to_dict() for sala in salas], 200
        except Exception as e:
            return {"error": f"Error al obtener salas activas: {str(e)}"}, 500

    @staticmethod
    def get_active_salas_by_departamento(departamento):
        """
        Obtiene todas las salas activas de un departamento específico
        """
        try:
            salas = SalaRepository.get_active_by_departamento(departamento)
            return [sala.to_dict() for sala in salas], 200
        except Exception as e:
            return {"error": f"Error al obtener salas activas del departamento: {str(e)}"}, 500

    @staticmethod
    def get_active_salas_by_zona(zona):
        """
        Obtiene todas las salas activas de una zona específica
        """
        try:
            salas = SalaRepository.get_active_by_zona(zona)
            return [sala.to_dict() for sala in salas], 200
        except Exception as e:
            return {"error": f"Error al obtener salas activas de la zona: {str(e)}"}, 500

    @staticmethod
    def create_sala(sala_data):
        """
        Crea una nueva sala
        """
        try:
            # Validaciones
            required_fields = ['nombre_sala', 'ubicacion', 'departamento', 'zona']
            if not all(field in sala_data for field in required_fields):
                return {"error": "Nombre, ubicación, departamento y zona de la sala son requeridos"}, 400

            # Normalizar la zona a código abreviado
            sala_data['zona'] = SalaService.normalize_zona(sala_data['zona'])

            # Validar que el nombre sea único entre salas activas
            existing_sala = SalaRepository.get_by_name_active(sala_data['nombre_sala'])
            if existing_sala:
                return {"error": "Ya existe una sala activa con este nombre"}, 409

            sala = SalaRepository.create(sala_data)
            return {
                "message": "Sala creada exitosamente",
                "sala": sala.to_dict()
            }, 201

        except Exception as e:
            return {"error": f"Error al crear sala: {str(e)}"}, 500

    @staticmethod
    def update_sala(sala_id, sala_data):
        """
        Actualiza una sala existente
        """
        try:
            # Verificar que la sala existe
            existing_sala = SalaRepository.get_by_id(sala_id)
            if not existing_sala:
                return {"error": "Sala no encontrada"}, 404

            # Normalizar la zona si se proporciona
            if 'zona' in sala_data:
                sala_data['zona'] = SalaService.normalize_zona(sala_data['zona'])

            # Validar que el nombre sea único entre salas activas (solo si se cambia el nombre)
            if 'nombre_sala' in sala_data:
                existing_sala_with_name = SalaRepository.get_by_name_active_exclude_id(
                    sala_data['nombre_sala'], sala_id
                )
                if existing_sala_with_name:
                    return {"error": "Ya existe una sala activa con este nombre"}, 409

            sala = SalaRepository.update(sala_id, sala_data)
            return {
                "message": "Sala actualizada exitosamente",
                "sala": sala.to_dict()
            }, 200

        except Exception as e:
            return {"error": f"Error al actualizar sala: {str(e)}"}, 500

    @staticmethod
    def delete_sala(sala_id):
        """
        Elimina una sala (borrado lógico)
        """
        try:
            sala = SalaRepository.delete(sala_id)
            if not sala:
                return {"error": "Sala no encontrada"}, 404

            return {"message": "Sala eliminada exitosamente"}, 200

        except Exception as e:
            return {"error": f"Error al eliminar sala: {str(e)}"}, 500