from src.repositories.estilo_repository import EstiloRepository

class EstiloService:
    """
    Servicio para lógica de negocio de Estilo
    """

    @staticmethod
    def get_all_estilos():
        """
        Obtiene todos los estilos
        """
        try:
            estilos = EstiloRepository.get_all()
            return [estilo.to_dict() for estilo in estilos], 200
        except Exception as e:
            return {"error": f"Error al obtener estilos: {str(e)}"}, 500

    @staticmethod
    def get_estilo_by_id(estilo_id):
        """
        Obtiene un estilo por ID
        """
        try:
            estilo = EstiloRepository.get_by_id(estilo_id)
            if not estilo:
                return {"error": "Estilo no encontrado"}, 404
            return estilo.to_dict(), 200
        except Exception as e:
            return {"error": f"Error al obtener estilo: {str(e)}"}, 500

    @staticmethod
    def get_active_estilos():
        """
        Obtiene todos los estilos activos
        """
        try:
            estilos = EstiloRepository.get_active()
            return [estilo.to_dict() for estilo in estilos], 200
        except Exception as e:
            return {"error": f"Error al obtener estilos activos: {str(e)}"}, 500

    @staticmethod
    def create_estilo(estilo_data):
        """
        Crea un nuevo estilo
        """
        try:
            # Validaciones
            if not estilo_data.get('nombre_estilo'):
                return {"error": "Nombre del estilo es requerido"}, 400

            # Validar que el nombre sea único entre estilos activos
            existing_estilo = EstiloRepository.get_by_name_active(estilo_data['nombre_estilo'])
            if existing_estilo:
                return {"error": "Ya existe un estilo activo con este nombre"}, 409

            estilo = EstiloRepository.create(estilo_data)
            return {
                "message": "Estilo creado exitosamente",
                "estilo": estilo.to_dict()
            }, 201

        except Exception as e:
            return {"error": f"Error al crear estilo: {str(e)}"}, 500

    @staticmethod
    def update_estilo(estilo_id, estilo_data):
        """
        Actualiza un estilo existente
        """
        try:
            # Verificar que el estilo existe
            existing_estilo = EstiloRepository.get_by_id(estilo_id)
            if not existing_estilo:
                return {"error": "Estilo no encontrado"}, 404

            # Validar que el nombre sea único entre estilos activos (solo si se cambia el nombre)
            if 'nombre_estilo' in estilo_data:
                existing_estilo_with_name = EstiloRepository.get_by_name_active_exclude_id(
                    estilo_data['nombre_estilo'], estilo_id
                )
                if existing_estilo_with_name:
                    return {"error": "Ya existe un estilo activo con este nombre"}, 409

            estilo = EstiloRepository.update(estilo_id, estilo_data)
            return {
                "message": "Estilo actualizado exitosamente",
                "estilo": estilo.to_dict()
            }, 200

        except Exception as e:
            return {"error": f"Error al actualizar estilo: {str(e)}"}, 500

    @staticmethod
    def delete_estilo(estilo_id):
        """
        Elimina un estilo (borrado lógico)
        """
        try:
            estilo = EstiloRepository.delete(estilo_id)
            if not estilo:
                return {"error": "Estilo no encontrado"}, 404

            return {"message": "Estilo eliminado exitosamente"}, 200

        except Exception as e:
            return {"error": f"Error al eliminar estilo: {str(e)}"}, 500