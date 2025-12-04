from flask import Blueprint, request, jsonify
from src.services.oferta_service import OfertaService

oferta_bp = Blueprint('oferta', __name__)

@oferta_bp.route('/', methods=['GET'])
def get_ofertas():
    """
    Obtiene todas las ofertas
    """
    try:
        result, status_code = OfertaService.get_all_ofertas()
        return jsonify(result), status_code
    except Exception as e:
        return jsonify({"error": f"Error interno del servidor: {str(e)}"}), 500

@oferta_bp.route('/active', methods=['GET'])
def get_active_ofertas():
    """
    Obtiene todas las ofertas activas
    """
    try:
        result, status_code = OfertaService.get_active_ofertas()
        return jsonify(result), status_code
    except Exception as e:
        return jsonify({"error": f"Error interno del servidor: {str(e)}"}), 500

@oferta_bp.route('/ciclo/<int:ciclo_id>', methods=['GET'])
def get_ofertas_by_ciclo(ciclo_id):
    """
    Obtiene todas las ofertas de un ciclo
    """
    try:
        result, status_code = OfertaService.get_ofertas_by_ciclo(ciclo_id)
        return jsonify(result), status_code
    except Exception as e:
        return jsonify({"error": f"Error interno del servidor: {str(e)}"}), 500

@oferta_bp.route('/<int:oferta_id>', methods=['GET'])
def get_oferta(oferta_id):
    """
    Obtiene una oferta por ID
    """
    try:
        result, status_code = OfertaService.get_oferta_by_id(oferta_id)
        return jsonify(result), status_code
    except Exception as e:
        return jsonify({"error": f"Error interno del servidor: {str(e)}"}), 500

@oferta_bp.route('/<int:oferta_id>/completa', methods=['GET'])
def get_oferta_completa(oferta_id):
    """
    Obtiene una oferta con toda su información relacionada
    """
    try:
        result, status_code = OfertaService.get_oferta_completa(oferta_id)
        return jsonify(result), status_code
    except Exception as e:
        return jsonify({"error": f"Error interno del servidor: {str(e)}"}), 500

@oferta_bp.route('/', methods=['POST'])
def create_oferta():
    """
    Crea una nueva oferta
    """
    try:
        data = request.get_json()

        # Validar datos requeridos
        required_fields = ['ciclo_id_ciclo', 'Subcategoria_id_subcategoria', 'nombre_oferta', 
                         'fecha_inicio', 'fecha_fin', 'cantidad_cursos']
        if not data or not all(field in data for field in required_fields):
            return jsonify({"error": "Faltan campos requeridos"}), 400

        result, status_code = OfertaService.create_oferta(data)
        return jsonify(result), status_code

    except Exception as e:
        return jsonify({"error": f"Error interno del servidor: {str(e)}"}), 500

@oferta_bp.route('/<int:oferta_id>', methods=['PUT'])
def update_oferta(oferta_id):
    """
    Actualiza una oferta existente
    """
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "Datos requeridos"}), 400

        result, status_code = OfertaService.update_oferta(oferta_id, data)
        return jsonify(result), status_code

    except Exception as e:
        return jsonify({"error": f"Error interno del servidor: {str(e)}"}), 500

@oferta_bp.route('/<int:oferta_id>', methods=['DELETE'])
def delete_oferta(oferta_id):
    """
    Elimina una oferta (borrado lógico)
    """
    try:
        result, status_code = OfertaService.delete_oferta(oferta_id)
        return jsonify(result), status_code

    except Exception as e:
        return jsonify({"error": f"Error interno del servidor: {str(e)}"}), 500
