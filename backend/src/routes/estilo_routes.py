from flask import Blueprint, request, jsonify
from src.services.estilo_service import EstiloService

estilo_bp = Blueprint('estilo', __name__)

@estilo_bp.route('/', methods=['GET'])
def get_estilos():
    """
    Obtiene todos los estilos
    """
    try:
        result, status_code = EstiloService.get_all_estilos()
        return jsonify(result), status_code
    except Exception as e:
        return jsonify({"error": f"Error interno del servidor: {str(e)}"}), 500

@estilo_bp.route('/active', methods=['GET'])
def get_active_estilos():
    """
    Obtiene todos los estilos activos
    """
    try:
        result, status_code = EstiloService.get_active_estilos()
        return jsonify(result), status_code
    except Exception as e:
        return jsonify({"error": f"Error interno del servidor: {str(e)}"}), 500

@estilo_bp.route('/<int:estilo_id>', methods=['GET'])
def get_estilo(estilo_id):
    """
    Obtiene un estilo por ID
    """
    try:
        result, status_code = EstiloService.get_estilo_by_id(estilo_id)
        return jsonify(result), status_code
    except Exception as e:
        return jsonify({"error": f"Error interno del servidor: {str(e)}"}), 500

@estilo_bp.route('/', methods=['POST'])
def create_estilo():
    """
    Crea un nuevo estilo
    """
    try:
        data = request.get_json()

        # Validar datos requeridos
        if not data or not data.get('nombre_estilo'):
            return jsonify({"error": "Nombre del estilo es requerido"}), 400

        result, status_code = EstiloService.create_estilo(data)
        return jsonify(result), status_code

    except Exception as e:
        return jsonify({"error": f"Error interno del servidor: {str(e)}"}), 500

@estilo_bp.route('/<int:estilo_id>', methods=['PUT'])
def update_estilo(estilo_id):
    """
    Actualiza un estilo existente
    """
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "Datos requeridos"}), 400

        result, status_code = EstiloService.update_estilo(estilo_id, data)
        return jsonify(result), status_code

    except Exception as e:
        return jsonify({"error": f"Error interno del servidor: {str(e)}"}), 500

@estilo_bp.route('/<int:estilo_id>', methods=['DELETE'])
def delete_estilo(estilo_id):
    """
    Elimina un estilo (borrado lógico)
    """
    try:
        result, status_code = EstiloService.delete_estilo(estilo_id)
        return jsonify(result), status_code

    except Exception as e:
        return jsonify({"error": f"Error interno del servidor: {str(e)}"}), 500