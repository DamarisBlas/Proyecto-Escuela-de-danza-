from flask import Blueprint, request, jsonify
from src.services.sala_service import SalaService

sala_bp = Blueprint('sala', __name__)

@sala_bp.route('/', methods=['GET'])
def get_salas():
    """
    Obtiene todas las salas
    """
    try:
        result, status_code = SalaService.get_all_salas()
        return jsonify(result), status_code
    except Exception as e:
        return jsonify({"error": f"Error interno del servidor: {str(e)}"}), 500

@sala_bp.route('/active', methods=['GET'])
def get_active_salas():
    """
    Obtiene todas las salas activas
    """
    try:
        result, status_code = SalaService.get_active_salas()
        return jsonify(result), status_code
    except Exception as e:
        return jsonify({"error": f"Error interno del servidor: {str(e)}"}), 500

@sala_bp.route('/departamento/<departamento>', methods=['GET'])
def get_salas_by_departamento(departamento):
    """
    Obtiene todas las salas de un departamento específico
    """
    try:
        result, status_code = SalaService.get_salas_by_departamento(departamento)
        return jsonify(result), status_code
    except Exception as e:
        return jsonify({"error": f"Error interno del servidor: {str(e)}"}), 500

@sala_bp.route('/departamento/<departamento>/active', methods=['GET'])
def get_active_salas_by_departamento(departamento):
    """
    Obtiene todas las salas activas de un departamento específico
    """
    try:
        result, status_code = SalaService.get_active_salas_by_departamento(departamento)
        return jsonify(result), status_code
    except Exception as e:
        return jsonify({"error": f"Error interno del servidor: {str(e)}"}), 500

@sala_bp.route('/zona/<zona>', methods=['GET'])
def get_salas_by_zona(zona):
    """
    Obtiene todas las salas de una zona específica
    """
    try:
        result, status_code = SalaService.get_salas_by_zona(zona)
        return jsonify(result), status_code
    except Exception as e:
        return jsonify({"error": f"Error interno del servidor: {str(e)}"}), 500

@sala_bp.route('/zona/<zona>/active', methods=['GET'])
def get_active_salas_by_zona(zona):
    """
    Obtiene todas las salas activas de una zona específica
    """
    try:
        result, status_code = SalaService.get_active_salas_by_zona(zona)
        return jsonify(result), status_code
    except Exception as e:
        return jsonify({"error": f"Error interno del servidor: {str(e)}"}), 500

@sala_bp.route('/<int:sala_id>', methods=['GET'])
def get_sala(sala_id):
    """
    Obtiene una sala por ID
    """
    try:
        result, status_code = SalaService.get_sala_by_id(sala_id)
        return jsonify(result), status_code
    except Exception as e:
        return jsonify({"error": f"Error interno del servidor: {str(e)}"}), 500

@sala_bp.route('/', methods=['POST'])
def create_sala():
    """
    Crea una nueva sala
    """
    try:
        data = request.get_json()

        # Validar datos requeridos
        required_fields = ['nombre_sala', 'ubicacion', 'departamento', 'zona']
        if not data or not all(field in data for field in required_fields):
            return jsonify({"error": "Nombre, ubicación, departamento y zona de la sala son requeridos"}), 400

        result, status_code = SalaService.create_sala(data)
        return jsonify(result), status_code

    except Exception as e:
        return jsonify({"error": f"Error interno del servidor: {str(e)}"}), 500

@sala_bp.route('/<int:sala_id>', methods=['PUT'])
def update_sala(sala_id):
    """
    Actualiza una sala existente
    """
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "Datos requeridos"}), 400

        result, status_code = SalaService.update_sala(sala_id, data)
        return jsonify(result), status_code

    except Exception as e:
        return jsonify({"error": f"Error interno del servidor: {str(e)}"}), 500

@sala_bp.route('/<int:sala_id>', methods=['DELETE'])
def delete_sala(sala_id):
    """
    Elimina una sala (borrado lógico)
    """
    try:
        result, status_code = SalaService.delete_sala(sala_id)
        return jsonify(result), status_code

    except Exception as e:
        return jsonify({"error": f"Error interno del servidor: {str(e)}"}), 500