from flask import Blueprint, request, jsonify
from src.services.paquete_service import PaqueteService

paquete_bp = Blueprint('paquete', __name__)

@paquete_bp.route('/', methods=['GET'])
def get_paquetes():
    """
    Obtiene todos los paquetes
    """
    try:
        result, status_code = PaqueteService.get_all_paquetes()
        return jsonify(result), status_code
    except Exception as e:
        return jsonify({"error": f"Error interno del servidor: {str(e)}"}), 500

@paquete_bp.route('/active', methods=['GET'])
def get_active_paquetes():
    """
    Obtiene todos los paquetes activos
    """
    try:
        result, status_code = PaqueteService.get_active_paquetes()
        return jsonify(result), status_code
    except Exception as e:
        return jsonify({"error": f"Error interno del servidor: {str(e)}"}), 500

@paquete_bp.route('/oferta/<int:oferta_id>', methods=['GET'])
def get_paquetes_by_oferta(oferta_id):
    """
    Obtiene todos los paquetes de una oferta
    """
    try:
        result, status_code = PaqueteService.get_paquetes_by_oferta(oferta_id)
        return jsonify(result), status_code
    except Exception as e:
        return jsonify({"error": f"Error interno del servidor: {str(e)}"}), 500

@paquete_bp.route('/<int:paquete_id>', methods=['GET'])
def get_paquete(paquete_id):
    """
    Obtiene un paquete por ID
    """
    try:
        result, status_code = PaqueteService.get_paquete_by_id(paquete_id)
        return jsonify(result), status_code
    except Exception as e:
        return jsonify({"error": f"Error interno del servidor: {str(e)}"}), 500

@paquete_bp.route('/<int:paquete_id>/info-completa', methods=['GET'])
def get_paquete_detailed_info(paquete_id):
    """
    Obtiene información completa de un paquete incluyendo:
    - Datos del paquete (cantidad_clases, nombre, ilimitado)
    - Datos de la oferta (id, nombre, whatsapp link)
    - Datos del ciclo (id, nombre)
    - Datos de la subcategoría
    """
    try:
        result, status_code = PaqueteService.get_paquete_detailed_info(paquete_id)
        return jsonify(result), status_code
    except Exception as e:
        return jsonify({"error": f"Error interno del servidor: {str(e)}"}), 500

@paquete_bp.route('/', methods=['POST'])
def create_paquete():
    """
    Crea un nuevo paquete
    
    Body esperado:
    {
        "nombre": "Paquete Básico",
        "cantidad_clases": 8,
        "dias_validez": 30,
        "ilimitado": false,
        "oferta_id": 1,
        "precio": 350.00
    }
    """
    try:
        data = request.get_json()

        # Validar datos requeridos
        required_fields = ['nombre', 'oferta_id', 'precio']
        if not data or not all(field in data for field in required_fields):
            return jsonify({"error": "Faltan campos requeridos: nombre, oferta_id, precio"}), 400

        result, status_code = PaqueteService.create_paquete(data)
        return jsonify(result), status_code

    except Exception as e:
        return jsonify({"error": f"Error interno del servidor: {str(e)}"}), 500

@paquete_bp.route('/<int:paquete_id>', methods=['PUT'])
def update_paquete(paquete_id):
    """
    Actualiza un paquete existente
    """
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "Datos requeridos"}), 400

        result, status_code = PaqueteService.update_paquete(paquete_id, data)
        return jsonify(result), status_code

    except Exception as e:
        return jsonify({"error": f"Error interno del servidor: {str(e)}"}), 500

@paquete_bp.route('/<int:paquete_id>', methods=['DELETE'])
def delete_paquete(paquete_id):
    """
    Elimina un paquete (borrado lógico)
    """
    try:
        result, status_code = PaqueteService.delete_paquete(paquete_id)
        return jsonify(result), status_code

    except Exception as e:
        return jsonify({"error": f"Error interno del servidor: {str(e)}"}), 500
