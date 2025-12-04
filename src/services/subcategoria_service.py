from src.repositories.subcategoria_repository import SubcategoriaRepository
from src.repositories.categoria_repository import CategoriaRepository

class SubcategoriaService:
    """
    Servicio para lógica de negocio de Subcategoria
    """

    @staticmethod
    def get_all_subcategorias():
        """
        Obtiene todas las subcategorías
        """
        try:
            subcategorias = SubcategoriaRepository.get_all()
            return [subcategoria.to_dict() for subcategoria in subcategorias], 200
        except Exception as e:
            return {"error": f"Error al obtener subcategorías: {str(e)}"}, 500

    @staticmethod
    def get_subcategoria_by_id(subcategoria_id):
        """
        Obtiene una subcategoría por ID
        """
        try:
            subcategoria = SubcategoriaRepository.get_by_id(subcategoria_id)
            if not subcategoria:
                return {"error": "Subcategoría no encontrada"}, 404
            return subcategoria.to_dict(), 200
        except Exception as e:
            return {"error": f"Error al obtener subcategoría: {str(e)}"}, 500

    @staticmethod
    def get_subcategorias_by_categoria(categoria_id):
        """
        Obtiene todas las subcategorías de una categoría específica
        """
        try:
            # Verificar que la categoría existe
            categoria = CategoriaRepository.get_by_id(categoria_id)
            if not categoria:
                return {"error": "Categoría no encontrada"}, 404

            subcategorias = SubcategoriaRepository.get_by_categoria(categoria_id)
            return [subcategoria.to_dict() for subcategoria in subcategorias], 200
        except Exception as e:
            return {"error": f"Error al obtener subcategorías de la categoría: {str(e)}"}, 500

    @staticmethod
    def get_active_subcategorias():
        """
        Obtiene todas las subcategorías activas
        """
        try:
            subcategorias = SubcategoriaRepository.get_active()
            return [subcategoria.to_dict() for subcategoria in subcategorias], 200
        except Exception as e:
            return {"error": f"Error al obtener subcategorías activas: {str(e)}"}, 500

    @staticmethod
    def get_active_subcategorias_by_categoria(categoria_id):
        """
        Obtiene todas las subcategorías activas de una categoría específica
        """
        try:
            # Verificar que la categoría existe
            categoria = CategoriaRepository.get_by_id(categoria_id)
            if not categoria:
                return {"error": "Categoría no encontrada"}, 404

            subcategorias = SubcategoriaRepository.get_active_by_categoria(categoria_id)
            return [subcategoria.to_dict() for subcategoria in subcategorias], 200
        except Exception as e:
            return {"error": f"Error al obtener subcategorías activas de la categoría: {str(e)}"}, 500

    @staticmethod
    def create_subcategoria(subcategoria_data):
        """
        Crea una nueva subcategoría
        """
        try:
            # Validaciones
            required_fields = ['Categoria_id_categoria', 'nombre_subcategoria', 'descripcion_subcategoria']
            if not all(field in subcategoria_data for field in required_fields):
                return {"error": "ID de la categoría, nombre y descripción de la subcategoría son requeridos"}, 400

            # Verificar que la categoría existe
            categoria = CategoriaRepository.get_by_id(subcategoria_data['Categoria_id_categoria'])
            if not categoria:
                return {"error": "Categoría no encontrada"}, 404

            # Validar que el nombre sea único dentro de la categoría para subcategorías activas
            existing_subcategoria = SubcategoriaRepository.get_by_name_active_in_categoria(
                subcategoria_data['nombre_subcategoria'], 
                subcategoria_data['Categoria_id_categoria']
            )
            if existing_subcategoria:
                return {"error": "Ya existe una subcategoría activa con este nombre en la categoría especificada"}, 409

            subcategoria = SubcategoriaRepository.create(subcategoria_data)
            return {
                "message": "Subcategoría creada exitosamente",
                "subcategoria": subcategoria.to_dict()
            }, 201

        except Exception as e:
            return {"error": f"Error al crear subcategoría: {str(e)}"}, 500

    @staticmethod
    def update_subcategoria(subcategoria_id, subcategoria_data):
        """
        Actualiza una subcategoría existente
        """
        try:
            # Verificar que la subcategoría existe
            existing_subcategoria = SubcategoriaRepository.get_by_id(subcategoria_id)
            if not existing_subcategoria:
                return {"error": "Subcategoría no encontrada"}, 404

            # Verificar categoría si se proporciona
            if 'Categoria_id_categoria' in subcategoria_data:
                categoria = CategoriaRepository.get_by_id(subcategoria_data['Categoria_id_categoria'])
                if not categoria:
                    return {"error": "Categoría no encontrada"}, 404

            # Validar que el nombre sea único dentro de la categoría para subcategorías activas (solo si se cambia el nombre o la categoría)
            if 'nombre_subcategoria' in subcategoria_data or 'Categoria_id_categoria' in subcategoria_data:
                nombre_a_validar = subcategoria_data.get('nombre_subcategoria', existing_subcategoria.nombre_subcategoria)
                categoria_a_validar = subcategoria_data.get('Categoria_id_categoria', existing_subcategoria.Categoria_id_categoria)
                
                existing_subcategoria_with_name = SubcategoriaRepository.get_by_name_active_in_categoria_exclude_id(
                    nombre_a_validar, categoria_a_validar, subcategoria_id
                )
                if existing_subcategoria_with_name:
                    return {"error": "Ya existe una subcategoría activa con este nombre en la categoría especificada"}, 409

            subcategoria = SubcategoriaRepository.update(subcategoria_id, subcategoria_data)
            return {
                "message": "Subcategoría actualizada exitosamente",
                "subcategoria": subcategoria.to_dict()
            }, 200

        except Exception as e:
            return {"error": f"Error al actualizar subcategoría: {str(e)}"}, 500

    @staticmethod
    def delete_subcategoria(subcategoria_id):
        """
        Elimina una subcategoría (borrado lógico)
        """
        try:
            subcategoria = SubcategoriaRepository.delete(subcategoria_id)
            if not subcategoria:
                return {"error": "Subcategoría no encontrada"}, 404

            return {"message": "Subcategoría eliminada exitosamente"}, 200

        except Exception as e:
            return {"error": f"Error al eliminar subcategoría: {str(e)}"}, 500