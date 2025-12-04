from flask import Blueprint, request, jsonify
from src.services.notificacion_persona_service import NotificacionPersonaService

notificacion_persona_bp = Blueprint('notificacion_persona', __name__)

@notificacion_persona_bp.route('/', methods=['GET'])
def get_all_notificaciones_personas():
    """
    Endpoint para obtener todas las asignaciones de notificaciones a personas
    """
    try:
        result, status_code = NotificacionPersonaService.get_all_notificaciones_personas()
        return jsonify(result), status_code
    except Exception as e:
        return jsonify({"error": f"Error interno del servidor: {str(e)}"}), 500

@notificacion_persona_bp.route('/active', methods=['GET'])
def get_active_notificaciones_personas():
    """
    Endpoint para obtener todas las asignaciones activas
    """
    try:
        result, status_code = NotificacionPersonaService.get_active_notificaciones_personas()
        return jsonify(result), status_code
    except Exception as e:
        return jsonify({"error": f"Error interno del servidor: {str(e)}"}), 500

@notificacion_persona_bp.route('/<int:notificacion_persona_id>', methods=['GET'])
def get_notificacion_persona(notificacion_persona_id):
    """
    Endpoint para obtener una asignación específica por ID
    """
    try:
        result, status_code = NotificacionPersonaService.get_notificacion_persona_by_id(notificacion_persona_id)
        return jsonify(result), status_code
    except Exception as e:
        return jsonify({"error": f"Error interno del servidor: {str(e)}"}), 500

@notificacion_persona_bp.route('/persona/<int:persona_id>', methods=['GET'])
def get_notificaciones_by_persona(persona_id):
    """
    Endpoint para obtener todas las notificaciones de una persona
    """
    try:
        result, status_code = NotificacionPersonaService.get_notificaciones_by_persona(persona_id)
        return jsonify(result), status_code
    except Exception as e:
        return jsonify({"error": f"Error interno del servidor: {str(e)}"}), 500

@notificacion_persona_bp.route('/persona/<int:persona_id>/no-leidas', methods=['GET'])
def get_notificaciones_no_leidas_by_persona(persona_id):
    """
    Endpoint para obtener notificaciones no leídas de una persona
    """
    try:
        result, status_code = NotificacionPersonaService.get_notificaciones_no_leidas_by_persona(persona_id)
        return jsonify(result), status_code
    except Exception as e:
        return jsonify({"error": f"Error interno del servidor: {str(e)}"}), 500

@notificacion_persona_bp.route('/persona/<int:persona_id>/leidas', methods=['GET'])
def get_notificaciones_leidas_by_persona(persona_id):
    """
    Endpoint para obtener notificaciones leídas de una persona
    """
    try:
        result, status_code = NotificacionPersonaService.get_notificaciones_leidas_by_persona(persona_id)
        return jsonify(result), status_code
    except Exception as e:
        return jsonify({"error": f"Error interno del servidor: {str(e)}"}), 500

@notificacion_persona_bp.route('/persona/<int:persona_id>/estadisticas', methods=['GET'])
def get_estadisticas_persona(persona_id):
    """
    Endpoint para obtener estadísticas de notificaciones de una persona
    """
    try:
        result, status_code = NotificacionPersonaService.get_estadisticas_persona(persona_id)
        return jsonify(result), status_code
    except Exception as e:
        return jsonify({"error": f"Error interno del servidor: {str(e)}"}), 500

@notificacion_persona_bp.route('/inscripcion/<int:inscripcion_id>', methods=['GET'])
def get_notificaciones_by_inscripcion(inscripcion_id):
    """
    Endpoint para obtener notificaciones relacionadas con una inscripción
    """
    try:
        result, status_code = NotificacionPersonaService.get_notificaciones_by_inscripcion(inscripcion_id)
        return jsonify(result), status_code
    except Exception as e:
        return jsonify({"error": f"Error interno del servidor: {str(e)}"}), 500

@notificacion_persona_bp.route('/', methods=['POST'])
def create_notificacion_persona():
    """
    Endpoint para crear una nueva asignación de notificación a persona
    """
    try:
        data = request.get_json()
        
        # Validar que se enviaron datos
        if not data:
            return jsonify({"error": "No se proporcionaron datos"}), 400
        
        result, status_code = NotificacionPersonaService.create_notificacion_persona(data)
        return jsonify(result), status_code
        
    except Exception as e:
        return jsonify({"error": f"Error interno del servidor: {str(e)}"}), 500

@notificacion_persona_bp.route('/masiva', methods=['POST'])
def create_notificacion_masiva():
    """
    Endpoint para crear una notificación y enviarla a múltiples personas
    """
    try:
        data = request.get_json()
        
        # Validar que se enviaron datos
        if not data:
            return jsonify({"error": "No se proporcionaron datos"}), 400
        
        # Validar campos requeridos para notificación masiva
        if 'notificacion' not in data or 'personas_ids' not in data:
            return jsonify({"error": "Se requieren 'notificacion' y 'personas_ids'"}), 400
        
        notificacion_data = data['notificacion']
        personas_ids = data['personas_ids']
        inscripcion_id = data.get('inscripcion_id')
        
        result, status_code = NotificacionPersonaService.create_notificacion_masiva(
            notificacion_data, personas_ids, inscripcion_id
        )
        return jsonify(result), status_code
        
    except Exception as e:
        return jsonify({"error": f"Error interno del servidor: {str(e)}"}), 500

@notificacion_persona_bp.route('/<int:notificacion_persona_id>/marcar-leida', methods=['PUT'])
def marcar_como_leida(notificacion_persona_id):
    """
    Endpoint para marcar una notificación como leída
    """
    try:
        result, status_code = NotificacionPersonaService.marcar_como_leida(notificacion_persona_id)
        return jsonify(result), status_code
    except Exception as e:
        return jsonify({"error": f"Error interno del servidor: {str(e)}"}), 500

@notificacion_persona_bp.route('/<int:notificacion_persona_id>/marcar-whatsapp', methods=['PUT'])
def marcar_envio_whatsapp(notificacion_persona_id):
    """
    Endpoint para marcar una notificación como enviada por WhatsApp
    """
    try:
        result, status_code = NotificacionPersonaService.marcar_envio_whatsapp(notificacion_persona_id)
        return jsonify(result), status_code
    except Exception as e:
        return jsonify({"error": f"Error interno del servidor: {str(e)}"}), 500

@notificacion_persona_bp.route('/<int:notificacion_persona_id>/marcar-push', methods=['PUT'])
def marcar_envio_push(notificacion_persona_id):
    """
    Endpoint para marcar una notificación como enviada por Push
    """
    try:
        result, status_code = NotificacionPersonaService.marcar_envio_push(notificacion_persona_id)
        return jsonify(result), status_code
    except Exception as e:
        return jsonify({"error": f"Error interno del servidor: {str(e)}"}), 500

@notificacion_persona_bp.route('/<int:notificacion_persona_id>', methods=['PUT'])
def update_notificacion_persona(notificacion_persona_id):
    """
    Endpoint para actualizar una asignación de notificación
    """
    try:
        data = request.get_json()
        
        # Validar que se enviaron datos
        if not data:
            return jsonify({"error": "No se proporcionaron datos para actualizar"}), 400
        
        result, status_code = NotificacionPersonaService.update_notificacion_persona(notificacion_persona_id, data)
        return jsonify(result), status_code
        
    except Exception as e:
        return jsonify({"error": f"Error interno del servidor: {str(e)}"}), 500

@notificacion_persona_bp.route('/<int:notificacion_persona_id>', methods=['DELETE'])
def delete_notificacion_persona(notificacion_persona_id):
    """
    Endpoint para eliminar una asignación de notificación (eliminación lógica)
    """
    try:
        result, status_code = NotificacionPersonaService.delete_notificacion_persona(notificacion_persona_id)
        return jsonify(result), status_code
    except Exception as e:
        return jsonify({"error": f"Error interno del servidor: {str(e)}"}), 500