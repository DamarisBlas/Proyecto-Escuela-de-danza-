from flask import Blueprint, request, jsonify
from src.services.notificacion_service import NotificacionService

notificacion_bp = Blueprint('notificacion', __name__)

@notificacion_bp.route('/', methods=['GET'])
def get_all_notificaciones():
    """
    Endpoint para obtener todas las notificaciones
    """
    try:
        result, status_code = NotificacionService.get_all_notificaciones()
        return jsonify(result), status_code
    except Exception as e:
        return jsonify({"error": f"Error interno del servidor: {str(e)}"}), 500

@notificacion_bp.route('/active', methods=['GET'])
def get_active_notificaciones():
    """
    Endpoint para obtener todas las notificaciones activas
    """
    try:
        result, status_code = NotificacionService.get_active_notificaciones()
        return jsonify(result), status_code
    except Exception as e:
        return jsonify({"error": f"Error interno del servidor: {str(e)}"}), 500

@notificacion_bp.route('/<int:notificacion_id>', methods=['GET'])
def get_notificacion(notificacion_id):
    """
    Endpoint para obtener una notificación específica por ID
    """
    try:
        result, status_code = NotificacionService.get_notificacion_by_id(notificacion_id)
        return jsonify(result), status_code
    except Exception as e:
        return jsonify({"error": f"Error interno del servidor: {str(e)}"}), 500

@notificacion_bp.route('/tipo/<string:tipo>', methods=['GET'])
def get_notificaciones_by_tipo(tipo):
    """
    Endpoint para obtener notificaciones por tipo
    """
    try:
        result, status_code = NotificacionService.get_notificaciones_by_tipo(tipo)
        return jsonify(result), status_code
    except Exception as e:
        return jsonify({"error": f"Error interno del servidor: {str(e)}"}), 500

@notificacion_bp.route('/categoria/<string:categoria>', methods=['GET'])
def get_notificaciones_by_categoria(categoria):
    """
    Endpoint para obtener notificaciones por categoría
    """
    try:
        result, status_code = NotificacionService.get_notificaciones_by_categoria(categoria)
        return jsonify(result), status_code
    except Exception as e:
        return jsonify({"error": f"Error interno del servidor: {str(e)}"}), 500

@notificacion_bp.route('/prioridad/<string:prioridad>', methods=['GET'])
def get_notificaciones_by_prioridad(prioridad):
    """
    Endpoint para obtener notificaciones por prioridad
    """
    try:
        result, status_code = NotificacionService.get_notificaciones_by_prioridad(prioridad)
        return jsonify(result), status_code
    except Exception as e:
        return jsonify({"error": f"Error interno del servidor: {str(e)}"}), 500

@notificacion_bp.route('/creador/<int:creado_por>', methods=['GET'])
def get_notificaciones_by_creador(creado_por):
    """
    Endpoint para obtener notificaciones por creador
    """
    try:
        result, status_code = NotificacionService.get_notificaciones_by_creador(creado_por)
        return jsonify(result), status_code
    except Exception as e:
        return jsonify({"error": f"Error interno del servidor: {str(e)}"}), 500

@notificacion_bp.route('/', methods=['POST'])
def create_notificacion():
    """
    Endpoint para crear una nueva notificación
    """
    try:
        data = request.get_json()
        
        # Validar que se enviaron datos
        if not data:
            return jsonify({"error": "No se proporcionaron datos"}), 400
        
        result, status_code = NotificacionService.create_notificacion(data)
        return jsonify(result), status_code
        
    except Exception as e:
        return jsonify({"error": f"Error interno del servidor: {str(e)}"}), 500

@notificacion_bp.route('/<int:notificacion_id>', methods=['PUT'])
def update_notificacion(notificacion_id):
    """
    Endpoint para actualizar una notificación existente
    """
    try:
        data = request.get_json()
        
        # Validar que se enviaron datos
        if not data:
            return jsonify({"error": "No se proporcionaron datos para actualizar"}), 400
        
        result, status_code = NotificacionService.update_notificacion(notificacion_id, data)
        return jsonify(result), status_code
        
    except Exception as e:
        return jsonify({"error": f"Error interno del servidor: {str(e)}"}), 500

@notificacion_bp.route('/<int:notificacion_id>', methods=['DELETE'])
def delete_notificacion(notificacion_id):
    """
    Endpoint para eliminar una notificación (eliminación lógica)
    """
    try:
        result, status_code = NotificacionService.delete_notificacion(notificacion_id)
        return jsonify(result), status_code
    except Exception as e:
        return jsonify({"error": f"Error interno del servidor: {str(e)}"}), 500