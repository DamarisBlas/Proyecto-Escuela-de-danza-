from flask import Blueprint, request, jsonify
from src.services.programa_service import ProgramaService

programa_bp = Blueprint('programa', __name__)

@programa_bp.route('/', methods=['GET'])
def get_programas():
    """
    Obtiene todos los programas
    """
    try:
        result, status_code = ProgramaService.get_all_programas()
        return jsonify(result), status_code
    except Exception as e:
        return jsonify({"error": f"Error interno del servidor: {str(e)}"}), 500

@programa_bp.route('/active', methods=['GET'])
def get_active_programas():
    """
    Obtiene todos los programas activos
    """
    try:
        result, status_code = ProgramaService.get_active_programas()
        return jsonify(result), status_code
    except Exception as e:
        return jsonify({"error": f"Error interno del servidor: {str(e)}"}), 500

@programa_bp.route('/<int:programa_id>', methods=['GET'])
def get_programa(programa_id):
    """
    Obtiene un programa por ID
    """
    try:
        result, status_code = ProgramaService.get_programa_by_id(programa_id)
        return jsonify(result), status_code
    except Exception as e:
        return jsonify({"error": f"Error interno del servidor: {str(e)}"}), 500

@programa_bp.route('/', methods=['POST'])
def create_programa():
    """
    Crea un nuevo programa
    """
    try:
        data = request.get_json()

        # Validar datos requeridos
        required_fields = ['nombre_programa', 'descricpcion_programa']
        if not data or not all(field in data for field in required_fields):
            return jsonify({"error": "Nombre y descripción del programa son requeridos"}), 400

        result, status_code = ProgramaService.create_programa(data)
        return jsonify(result), status_code

    except Exception as e:
        return jsonify({"error": f"Error interno del servidor: {str(e)}"}), 500

@programa_bp.route('/<int:programa_id>', methods=['PUT'])
def update_programa(programa_id):
    """
    Actualiza un programa existente
    """
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "Datos requeridos"}), 400

        result, status_code = ProgramaService.update_programa(programa_id, data)
        return jsonify(result), status_code

    except Exception as e:
        return jsonify({"error": f"Error interno del servidor: {str(e)}"}), 500

@programa_bp.route('/<int:programa_id>', methods=['DELETE'])
def delete_programa(programa_id):
    """
    Elimina un programa (borrado lógico)
    """
    try:
        result, status_code = ProgramaService.delete_programa(programa_id)
        return jsonify(result), status_code

    except Exception as e:
        return jsonify({"error": f"Error interno del servidor: {str(e)}"}), 500
    
    
    #Borrado fisico

@programa_bp.route('/<int:programa_id>/hard', methods=['DELETE'])
def delete_programa_hard(programa_id):
    """
    Elimina un programa (borrado físico)
    """
    try:
        result, status_code = ProgramaService.delete_programa_hard(programa_id)
        return jsonify(result), status_code

    except Exception as e:
        return jsonify({"error": f"Error interno del servidor: {str(e)}"}), 500
