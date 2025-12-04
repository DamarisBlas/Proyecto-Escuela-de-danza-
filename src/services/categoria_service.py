from src.repositories.categoria_repository import CategoriaRepository
from src.repositories.programa_repository import ProgramaRepository

class CategoriaService:
    """
    Servicio para lógica de negocio de Categoria
    """

    @staticmethod
    def get_all_categorias():
        """
        Obtiene todas las categorías
        """
        try:
            categorias = CategoriaRepository.get_all()
            return [categoria.to_dict() for categoria in categorias], 200
        except Exception as e:
            return {"error": f"Error al obtener categorías: {str(e)}"}, 500

    @staticmethod
    def get_categoria_by_id(categoria_id):
        """
        Obtiene una categoría por ID
        """
        try:
            categoria = CategoriaRepository.get_by_id(categoria_id)
            if not categoria:
                return {"error": "Categoría no encontrada"}, 404
            return categoria.to_dict(), 200
        except Exception as e:
            return {"error": f"Error al obtener categoría: {str(e)}"}, 500

    @staticmethod
    def get_categorias_by_programa(programa_id):
        """
        Obtiene todas las categorías de un programa específico
        """
        try:
            # Verificar que el programa existe
            programa = ProgramaRepository.get_by_id(programa_id)
            if not programa:
                return {"error": "Programa no encontrado"}, 404

            categorias = CategoriaRepository.get_by_programa(programa_id)
            return [categoria.to_dict() for categoria in categorias], 200
        except Exception as e:
            return {"error": f"Error al obtener categorías del programa: {str(e)}"}, 500

    @staticmethod
    def get_active_categorias():
        """
        Obtiene todas las categorías activas
        """
        try:
            categorias = CategoriaRepository.get_active()
            return [categoria.to_dict() for categoria in categorias], 200
        except Exception as e:
            return {"error": f"Error al obtener categorías activas: {str(e)}"}, 500

    @staticmethod
    def get_active_categorias_by_programa(programa_id):
        """
        Obtiene todas las categorías activas de un programa específico
        """
        try:
            # Verificar que el programa existe
            programa = ProgramaRepository.get_by_id(programa_id)
            if not programa:
                return {"error": "Programa no encontrado"}, 404

            categorias = CategoriaRepository.get_active_by_programa(programa_id)
            return [categoria.to_dict() for categoria in categorias], 200
        except Exception as e:
            return {"error": f"Error al obtener categorías activas del programa: {str(e)}"}, 500

    @staticmethod
    def create_categoria(categoria_data):
        """
        Crea una nueva categoría
        """
        try:
            # Validaciones
            required_fields = ['Programa_id_programa', 'nombre_categoria']
            if not all(field in categoria_data for field in required_fields):
                return {"error": "ID del programa y nombre de la categoría son requeridos"}, 400

            # Verificar que el programa existe
            programa = ProgramaRepository.get_by_id(categoria_data['Programa_id_programa'])
            if not programa:
                return {"error": "Programa no encontrado"}, 404

            # Validar que el nombre sea único dentro del programa para categorías activas
            existing_categoria = CategoriaRepository.get_by_name_active_in_programa(
                categoria_data['nombre_categoria'], 
                categoria_data['Programa_id_programa']
            )
            if existing_categoria:
                return {"error": f"Ya existe una categoría activa con el nombre '{categoria_data['nombre_categoria']}' en este programa"}, 409

            categoria = CategoriaRepository.create(categoria_data)
            return {
                "message": "Categoría creada exitosamente",
                "categoria": categoria.to_dict()
            }, 201

        except Exception as e:
            return {"error": f"Error al crear categoría: {str(e)}"}, 500

    @staticmethod
    def update_categoria(categoria_id, categoria_data):
        """
        Actualiza una categoría existente
        """
        try:
            # Verificar que la categoría existe
            existing_categoria = CategoriaRepository.get_by_id(categoria_id)
            if not existing_categoria:
                return {"error": "Categoría no encontrada"}, 404

            # Verificar programa si se proporciona
            if 'Programa_id_programa' in categoria_data:
                programa = ProgramaRepository.get_by_id(categoria_data['Programa_id_programa'])
                if not programa:
                    return {"error": "Programa no encontrado"}, 404

            # Validar nombre único si se está cambiando el nombre o el programa
            programa_id = categoria_data.get('Programa_id_programa', existing_categoria.Programa_id_programa)
            if 'nombre_categoria' in categoria_data and (
                categoria_data['nombre_categoria'] != existing_categoria.nombre_categoria or
                programa_id != existing_categoria.Programa_id_programa
            ):
                existing_name = CategoriaRepository.get_by_name_active_in_programa_exclude_id(
                    categoria_data['nombre_categoria'], 
                    programa_id, 
                    categoria_id
                )
                if existing_name:
                    return {"error": f"Ya existe una categoría activa con el nombre '{categoria_data['nombre_categoria']}' en este programa"}, 409

            categoria = CategoriaRepository.update(categoria_id, categoria_data)
            return {
                "message": "Categoría actualizada exitosamente",
                "categoria": categoria.to_dict()
            }, 200

        except Exception as e:
            return {"error": f"Error al actualizar categoría: {str(e)}"}, 500

    @staticmethod
    def delete_categoria(categoria_id):
        """
        Elimina una categoría (borrado lógico)
        """
        try:
            categoria = CategoriaRepository.delete(categoria_id)
            if not categoria:
                return {"error": "Categoría no encontrada"}, 404

            return {"message": "Categoría eliminada exitosamente"}, 200

        except Exception as e:
            return {"error": f"Error al eliminar categoría: {str(e)}"}, 500