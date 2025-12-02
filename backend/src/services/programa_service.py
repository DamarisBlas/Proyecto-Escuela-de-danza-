from src.repositories.programa_repository import ProgramaRepository

class ProgramaService:
    """
    Servicio para lógica de negocio de Programa
    """

    @staticmethod
    def get_all_programas():
        """
        Obtiene todos los programas
        """
        try:
            programas = ProgramaRepository.get_all()
            return [programa.to_dict() for programa in programas], 200
        except Exception as e:
            return {"error": f"Error al obtener programas: {str(e)}"}, 500

    @staticmethod
    def get_programa_by_id(programa_id):
        """
        Obtiene un programa por ID
        """
        try:
            programa = ProgramaRepository.get_by_id(programa_id)
            if not programa:
                return {"error": "Programa no encontrado"}, 404
            return programa.to_dict(), 200
        except Exception as e:
            return {"error": f"Error al obtener programa: {str(e)}"}, 500

    @staticmethod
    def get_active_programas():
        """
        Obtiene todos los programas activos
        """
        try:
            programas = ProgramaRepository.get_active()
            return [programa.to_dict() for programa in programas], 200
        except Exception as e:
            return {"error": f"Error al obtener programas activos: {str(e)}"}, 500

    @staticmethod
    def create_programa(programa_data):
        """
        Crea un nuevo programa
        """
        try:
            # Validaciones
            required_fields = ['nombre_programa', 'descricpcion_programa']
            if not all(field in programa_data for field in required_fields):
                return {"error": "Nombre y descripción del programa son requeridos"}, 400

            # Validar que el nombre sea único entre programas activos
            existing_programa = ProgramaRepository.get_by_name_active(programa_data['nombre_programa'])
            if existing_programa:
                return {"error": f"Ya existe un programa activo con el nombre '{programa_data['nombre_programa']}'"}, 409

            programa = ProgramaRepository.create(programa_data)
            return {
                "message": "Programa creado exitosamente",
                "programa": programa.to_dict()
            }, 201

        except Exception as e:
            return {"error": f"Error al crear programa: {str(e)}"}, 500

    @staticmethod
    def update_programa(programa_id, programa_data):
        """
        Actualiza un programa existente
        """
        try:
            # Verificar que el programa existe
            existing_programa = ProgramaRepository.get_by_id(programa_id)
            if not existing_programa:
                return {"error": "Programa no encontrado"}, 404

            # Validar nombre único si se está cambiando el nombre
            if 'nombre_programa' in programa_data and programa_data['nombre_programa'] != existing_programa.nombre_programa:
                existing_name = ProgramaRepository.get_by_name_active_exclude_id(programa_data['nombre_programa'], programa_id)
                if existing_name:
                    return {"error": f"Ya existe un programa activo con el nombre '{programa_data['nombre_programa']}'"}, 409

            programa = ProgramaRepository.update(programa_id, programa_data)
            return {
                "message": "Programa actualizado exitosamente",
                "programa": programa.to_dict()
            }, 200

        except Exception as e:
            return {"error": f"Error al actualizar programa: {str(e)}"}, 500

    @staticmethod
    def delete_programa(programa_id):
        """
        Elimina un programa (borrado lógico)
        """
        try:
            programa = ProgramaRepository.delete(programa_id)
            if not programa:
                return {"error": "Programa no encontrado"}, 404

            return {"message": "Programa eliminado exitosamente"}, 200

        except Exception as e:
            return {"error": f"Error al eliminar programa: {str(e)}"}, 500
        
    @staticmethod
    def delete_programa_hard(programa_id):
        """
        Elimina un programa (borrado físico)
        """
        try:
            programa = ProgramaRepository.hard_delete(programa_id)
            if not programa:
                return {"error": "Programa no encontrado"}, 404

            return {"message": "Programa eliminado exitosamente"}, 200

        except Exception as e:
            return {"error": f"Error al eliminar programa: {str(e)}"}, 500