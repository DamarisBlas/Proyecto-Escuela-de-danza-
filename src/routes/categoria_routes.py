from flask import Blueprint, request, jsonify
from src.services.categoria_service import CategoriaService

categoria_bp = Blueprint('categoria', __name__)

@categoria_bp.route('/', methods=['GET'])
def get_categorias():
    """
    Obtiene todas las categorías
    """
    try:
        result, status_code = CategoriaService.get_all_categorias()
        return jsonify(result), status_code
    except Exception as e:
        return jsonify({"error": f"Error interno del servidor: {str(e)}"}), 500

@categoria_bp.route('/active', methods=['GET'])
def get_active_categorias():
    """
    Obtiene todas las categorías activas
    """
    try:
        result, status_code = CategoriaService.get_active_categorias()
        return jsonify(result), status_code
    except Exception as e:
        return jsonify({"error": f"Error interno del servidor: {str(e)}"}), 500

@categoria_bp.route('/programa/<int:programa_id>', methods=['GET'])
def get_categorias_by_programa(programa_id):
    """
    Obtiene todas las categorías de un programa específico
    """
    try:
        result, status_code = CategoriaService.get_categorias_by_programa(programa_id)
        return jsonify(result), status_code
    except Exception as e:
        return jsonify({"error": f"Error interno del servidor: {str(e)}"}), 500

@categoria_bp.route('/programa/<int:programa_id>/active', methods=['GET'])
def get_active_categorias_by_programa(programa_id):
    """
    Obtiene todas las categorías activas de un programa específico
    """
    try:
        result, status_code = CategoriaService.get_active_categorias_by_programa(programa_id)
        return jsonify(result), status_code
    except Exception as e:
        return jsonify({"error": f"Error interno del servidor: {str(e)}"}), 500

@categoria_bp.route('/<int:categoria_id>', methods=['GET'])
def get_categoria(categoria_id):
    """
    Obtiene una categoría por ID
    """
    try:
        result, status_code = CategoriaService.get_categoria_by_id(categoria_id)
        return jsonify(result), status_code
    except Exception as e:
        return jsonify({"error": f"Error interno del servidor: {str(e)}"}), 500

@categoria_bp.route('/', methods=['POST'])
def create_categoria():
    """
    Crea una nueva categoría
    """
    try:
        data = request.get_json()

        # Validar datos requeridos
        required_fields = ['Programa_id_programa', 'nombre_categoria']
        if not data or not all(field in data for field in required_fields):
            return jsonify({"error": "ID del programa y nombre de la categoría son requeridos"}), 400

        result, status_code = CategoriaService.create_categoria(data)
        return jsonify(result), status_code

    except Exception as e:
        return jsonify({"error": f"Error interno del servidor: {str(e)}"}), 500

@categoria_bp.route('/<int:categoria_id>', methods=['PUT'])
def update_categoria(categoria_id):
    """
    Actualiza una categoría existente
    """
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "Datos requeridos"}), 400

        result, status_code = CategoriaService.update_categoria(categoria_id, data)
        return jsonify(result), status_code

    except Exception as e:
        return jsonify({"error": f"Error interno del servidor: {str(e)}"}), 500

@categoria_bp.route('/<int:categoria_id>', methods=['DELETE'])
def delete_categoria(categoria_id):
    """
    Elimina una categoría (borrado lógico)
    """
    try:
        result, status_code = CategoriaService.delete_categoria(categoria_id)
        return jsonify(result), status_code

    except Exception as e:
        return jsonify({"error": f"Error interno del servidor: {str(e)}"}), 500