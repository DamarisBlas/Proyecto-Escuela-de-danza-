from flask import Blueprint, request, jsonify
from src.services.subcategoria_service import SubcategoriaService

subcategoria_bp = Blueprint('subcategoria', __name__)

@subcategoria_bp.route('/', methods=['GET'])
def get_subcategorias():
    """
    Obtiene todas las subcategorías
    """
    try:
        result, status_code = SubcategoriaService.get_all_subcategorias()
        return jsonify(result), status_code
    except Exception as e:
        return jsonify({"error": f"Error interno del servidor: {str(e)}"}), 500

@subcategoria_bp.route('/active', methods=['GET'])
def get_active_subcategorias():
    """
    Obtiene todas las subcategorías activas
    """
    try:
        result, status_code = SubcategoriaService.get_active_subcategorias()
        return jsonify(result), status_code
    except Exception as e:
        return jsonify({"error": f"Error interno del servidor: {str(e)}"}), 500

@subcategoria_bp.route('/categoria/<int:categoria_id>', methods=['GET'])
def get_subcategorias_by_categoria(categoria_id):
    """
    Obtiene todas las subcategorías de una categoría específica
    """
    try:
        result, status_code = SubcategoriaService.get_subcategorias_by_categoria(categoria_id)
        return jsonify(result), status_code
    except Exception as e:
        return jsonify({"error": f"Error interno del servidor: {str(e)}"}), 500

@subcategoria_bp.route('/categoria/<int:categoria_id>/active', methods=['GET'])
def get_active_subcategorias_by_categoria(categoria_id):
    """
    Obtiene todas las subcategorías activas de una categoría específica
    """
    try:
        result, status_code = SubcategoriaService.get_active_subcategorias_by_categoria(categoria_id)
        return jsonify(result), status_code
    except Exception as e:
        return jsonify({"error": f"Error interno del servidor: {str(e)}"}), 500

@subcategoria_bp.route('/<int:subcategoria_id>', methods=['GET'])
def get_subcategoria(subcategoria_id):
    """
    Obtiene una subcategoría por ID
    """
    try:
        result, status_code = SubcategoriaService.get_subcategoria_by_id(subcategoria_id)
        return jsonify(result), status_code
    except Exception as e:
        return jsonify({"error": f"Error interno del servidor: {str(e)}"}), 500

@subcategoria_bp.route('/', methods=['POST'])
def create_subcategoria():
    """
    Crea una nueva subcategoría
    """
    try:
        data = request.get_json()

        # Validar datos requeridos
        required_fields = ['Categoria_id_categoria', 'nombre_subcategoria', 'descripcion_subcategoria']
        if not data or not all(field in data for field in required_fields):
            return jsonify({"error": "ID de la categoría, nombre y descripción de la subcategoría son requeridos"}), 400

        result, status_code = SubcategoriaService.create_subcategoria(data)
        return jsonify(result), status_code

    except Exception as e:
        return jsonify({"error": f"Error interno del servidor: {str(e)}"}), 500

@subcategoria_bp.route('/<int:subcategoria_id>', methods=['PUT'])
def update_subcategoria(subcategoria_id):
    """
    Actualiza una subcategoría existente
    """
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "Datos requeridos"}), 400

        result, status_code = SubcategoriaService.update_subcategoria(subcategoria_id, data)
        return jsonify(result), status_code

    except Exception as e:
        return jsonify({"error": f"Error interno del servidor: {str(e)}"}), 500

@subcategoria_bp.route('/<int:subcategoria_id>', methods=['DELETE'])
def delete_subcategoria(subcategoria_id):
    """
    Elimina una subcategoría (borrado lógico)
    """
    try:
        result, status_code = SubcategoriaService.delete_subcategoria(subcategoria_id)
        return jsonify(result), status_code

    except Exception as e:
        return jsonify({"error": f"Error interno del servidor: {str(e)}"}), 500