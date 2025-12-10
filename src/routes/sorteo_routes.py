from flask import Blueprint, request, jsonify
from src.services.sorteo_service import SorteoService

sorteo_bp = Blueprint('sorteo', __name__, url_prefix='/sorteos')

@sorteo_bp.route('/', methods=['GET'])
def get_sorteos():
    """
    Obtiene todos los sorteos
    """
    try:
        result, status_code = SorteoService.get_all_sorteos()
        return jsonify(result), status_code
    except Exception as e:
        return jsonify({"error": f"Error interno del servidor: {str(e)}"}), 500

@sorteo_bp.route('/active', methods=['GET'])
def get_active_sorteos():
    """
    Obtiene todos los sorteos activos
    """
    try:
        result, status_code = SorteoService.get_active_sorteos()
        return jsonify(result), status_code
    except Exception as e:
        return jsonify({"error": f"Error interno del servidor: {str(e)}"}), 500

@sorteo_bp.route('/vigentes', methods=['GET'])
def get_sorteos_vigentes():
    """
    Obtiene todos los sorteos vigentes
    """
    try:
        result, status_code = SorteoService.get_sorteos_vigentes()
        return jsonify(result), status_code
    except Exception as e:
        return jsonify({"error": f"Error interno del servidor: {str(e)}"}), 500

@sorteo_bp.route('/promocion/<int:promocion_id>', methods=['GET'])
def get_sorteos_by_promocion(promocion_id):
    """
    Obtiene todos los sorteos de una promoción
    """
    try:
        result, status_code = SorteoService.get_sorteos_by_promocion(promocion_id)
        return jsonify(result), status_code
    except Exception as e:
        return jsonify({"error": f"Error interno del servidor: {str(e)}"}), 500

@sorteo_bp.route('/<int:sorteo_id>', methods=['GET'])
def get_sorteo(sorteo_id):
    """
    Obtiene un sorteo por ID
    """
    try:
        result, status_code = SorteoService.get_sorteo_by_id(sorteo_id)
        return jsonify(result), status_code
    except Exception as e:
        return jsonify({"error": f"Error interno del servidor: {str(e)}"}), 500

@sorteo_bp.route('/ganadores-detalle', methods=['GET'])
def get_all_ganadores_detalle():
    """
    Obtiene información detallada de TODOS los ganadores de TODOS los sorteos
    Incluye nombre completo, email, premio ganado y datos de inscripción
    """
    try:
        result, status_code = SorteoService.get_all_ganadores_detalle()
        return jsonify(result), status_code
    except Exception as e:
        return jsonify({"error": f"Error interno del servidor: {str(e)}"}), 500

@sorteo_bp.route('/<int:sorteo_id>/ganadores-detalle', methods=['GET'])
def get_ganadores_detalle(sorteo_id):
    """
    Obtiene información detallada de los ganadores de un sorteo
    Incluye nombre completo, email, premio ganado y datos de inscripción
    """
    try:
        result, status_code = SorteoService.get_ganadores_detalle(sorteo_id)
        return jsonify(result), status_code
    except Exception as e:
        return jsonify({"error": f"Error interno del servidor: {str(e)}"}), 500

@sorteo_bp.route('/', methods=['POST'])
def create_sorteo():
    """
    Crea un nuevo sorteo
    La fecha del sorteo se genera automáticamente (fecha actual)
    El estado siempre es True
    """
    try:
        data = request.get_json()

        # Validar datos requeridos
        required_fields = ['Promocion_id_promocion']
        if not data or not all(field in data for field in required_fields):
            return jsonify({"error": "Promocion_id_promocion es requerido"}), 400

        result, status_code = SorteoService.create_sorteo(data)
        return jsonify(result), status_code

    except Exception as e:
        return jsonify({"error": f"Error interno del servidor: {str(e)}"}), 500

@sorteo_bp.route('/<int:sorteo_id>', methods=['PUT'])
def update_sorteo(sorteo_id):
    """
    Actualiza un sorteo existente
    """
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "Datos requeridos"}), 400

        result, status_code = SorteoService.update_sorteo(sorteo_id, data)
        return jsonify(result), status_code

    except Exception as e:
        return jsonify({"error": f"Error interno del servidor: {str(e)}"}), 500

@sorteo_bp.route('/<int:sorteo_id>', methods=['DELETE'])
def delete_sorteo(sorteo_id):
    """
    Elimina un sorteo (borrado lógico)
    """
    try:
        result, status_code = SorteoService.delete_sorteo(sorteo_id)
        return jsonify(result), status_code

    except Exception as e:
        return jsonify({"error": f"Error interno del servidor: {str(e)}"}), 500