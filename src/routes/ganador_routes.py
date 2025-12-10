from flask import Blueprint, request, jsonify
from src.services.ganador_service import GanadorService

ganador_bp = Blueprint('ganador', __name__, url_prefix='/ganadores')

@ganador_bp.route('/', methods=['GET'])
def get_ganadores():
    """
    Obtiene todos los ganadores
    """
    try:
        result, status_code = GanadorService.get_all_ganadores()
        return jsonify(result), status_code
    except Exception as e:
        return jsonify({"error": f"Error interno del servidor: {str(e)}"}), 500

@ganador_bp.route('/active', methods=['GET'])
def get_active_ganadores():
    """
    Obtiene todos los ganadores activos
    """
    try:
        result, status_code = GanadorService.get_active_ganadores()
        return jsonify(result), status_code
    except Exception as e:
        return jsonify({"error": f"Error interno del servidor: {str(e)}"}), 500

@ganador_bp.route('/sorteo/<int:sorteo_id>', methods=['GET'])
def get_ganadores_by_sorteo(sorteo_id):
    """
    Obtiene todos los ganadores de un sorteo
    """
    try:
        result, status_code = GanadorService.get_ganadores_by_sorteo(sorteo_id)
        return jsonify(result), status_code
    except Exception as e:
        return jsonify({"error": f"Error interno del servidor: {str(e)}"}), 500

@ganador_bp.route('/persona/<int:persona_id>', methods=['GET'])
def get_ganadores_by_persona(persona_id):
    """
    Obtiene todos los ganadores de una persona
    """
    try:
        result, status_code = GanadorService.get_ganadores_by_persona(persona_id)
        return jsonify(result), status_code
    except Exception as e:
        return jsonify({"error": f"Error interno del servidor: {str(e)}"}), 500

@ganador_bp.route('/<int:ganador_id>', methods=['GET'])
def get_ganador(ganador_id):
    """
    Obtiene un ganador por ID
    """
    try:
        result, status_code = GanadorService.get_ganador_by_id(ganador_id)
        return jsonify(result), status_code
    except Exception as e:
        return jsonify({"error": f"Error interno del servidor: {str(e)}"}), 500

@ganador_bp.route('/', methods=['POST'])
def create_ganador():
    """
    Crea un nuevo ganador
    La fecha se toma automáticamente del sorteo
    El estado siempre es True
    """
    try:
        data = request.get_json()

        # Validar datos requeridos
        required_fields = ['Persona_id_persona', 'Sorteo_id_sorteo', 'Premios_id_premio']
        if not data or not all(field in data for field in required_fields):
            return jsonify({"error": "Persona_id_persona, Sorteo_id_sorteo y Premios_id_premio son requeridos"}), 400

        result, status_code = GanadorService.create_ganador(data)
        return jsonify(result), status_code

    except Exception as e:
        return jsonify({"error": f"Error interno del servidor: {str(e)}"}), 500

@ganador_bp.route('/<int:ganador_id>', methods=['PUT'])
def update_ganador(ganador_id):
    """
    Actualiza un ganador existente
    """
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "Datos requeridos"}), 400

        result, status_code = GanadorService.update_ganador(ganador_id, data)
        return jsonify(result), status_code

    except Exception as e:
        return jsonify({"error": f"Error interno del servidor: {str(e)}"}), 500

@ganador_bp.route('/<int:ganador_id>', methods=['DELETE'])
def delete_ganador(ganador_id):
    """
    Elimina un ganador (borrado lógico)
    """
    try:
        result, status_code = GanadorService.delete_ganador(ganador_id)
        return jsonify(result), status_code

    except Exception as e:
        return jsonify({"error": f"Error interno del servidor: {str(e)}"}), 500