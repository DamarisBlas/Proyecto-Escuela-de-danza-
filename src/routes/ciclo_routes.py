from flask import Blueprint, request, jsonify
from src.services.ciclo_service import CicloService

ciclo_bp = Blueprint('ciclo', __name__)

@ciclo_bp.route('/', methods=['GET'])
def get_ciclos():
    """
    Obtiene todos los ciclos
    """
    try:
        result, status_code = CicloService.get_all_ciclos()
        return jsonify(result), status_code
    except Exception as e:
        return jsonify({"error": f"Error interno del servidor: {str(e)}"}), 500

@ciclo_bp.route('/active', methods=['GET'])
def get_active_ciclos():
    """
    Obtiene todos los ciclos activos
    """
    try:
        result, status_code = CicloService.get_active_ciclos()
        return jsonify(result), status_code
    except Exception as e:
        return jsonify({"error": f"Error interno del servidor: {str(e)}"}), 500

@ciclo_bp.route('/<int:ciclo_id>', methods=['GET'])
def get_ciclo(ciclo_id):
    """
    Obtiene un ciclo por ID
    """
    try:
        result, status_code = CicloService.get_ciclo_by_id(ciclo_id)
        return jsonify(result), status_code
    except Exception as e:
        return jsonify({"error": f"Error interno del servidor: {str(e)}"}), 500

@ciclo_bp.route('/', methods=['POST'])
def create_ciclo():
    """
    Crea un nuevo ciclo
    """
    try:
        data = request.get_json()

        # Validar datos requeridos
        required_fields = ['nombre', 'inicio', 'fin']
        if not data or not all(field in data for field in required_fields):
            return jsonify({"error": "Nombre, inicio y fin son requeridos"}), 400

        result, status_code = CicloService.create_ciclo(data)
        return jsonify(result), status_code

    except Exception as e:
        return jsonify({"error": f"Error interno del servidor: {str(e)}"}), 500

@ciclo_bp.route('/<int:ciclo_id>', methods=['PUT'])
def update_ciclo(ciclo_id):
    """
    Actualiza un ciclo existente
    """
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "Datos requeridos"}), 400

        result, status_code = CicloService.update_ciclo(ciclo_id, data)
        return jsonify(result), status_code

    except Exception as e:
        return jsonify({"error": f"Error interno del servidor: {str(e)}"}), 500

@ciclo_bp.route('/<int:ciclo_id>', methods=['DELETE'])
def delete_ciclo(ciclo_id):
    """
    Elimina un ciclo (borrado lógico)
    """
    try:
        result, status_code = CicloService.delete_ciclo(ciclo_id)
        return jsonify(result), status_code

    except Exception as e:
        return jsonify({"error": f"Error interno del servidor: {str(e)}"}), 500