from flask import Blueprint, request, jsonify
from src.services.permiso_service import PermisoService

# Crear blueprint para las rutas de permisos
permiso_bp = Blueprint('permisos', __name__, url_prefix='/permisos')

@permiso_bp.route('/', methods=['GET'])
def get_all_permisos():
    """
    Obtiene todos los permisos
    """
    result, status_code = PermisoService.get_all_permisos()
    return jsonify(result), status_code

@permiso_bp.route('/detallados', methods=['GET'])
def get_all_permisos_detallados():
    """
    Obtiene todos los permisos con información detallada incluyendo:
    - Datos completos de la persona
    - Información del horario y la clase
    - Datos del paquete, oferta y ciclo
    """
    result, status_code = PermisoService.get_all_permisos_detallados()
    return jsonify(result), status_code

@permiso_bp.route('/active', methods=['GET'])
def get_active_permisos():
    """
    Obtiene todos los permisos activos
    """
    result, status_code = PermisoService.get_active_permisos()
    return jsonify(result), status_code

@permiso_bp.route('/pendientes', methods=['GET'])
def get_permisos_pendientes():
    """
    Obtiene permisos pendientes de aprobación
    """
    result, status_code = PermisoService.get_permisos_pendientes()
    return jsonify(result), status_code

@permiso_bp.route('/estado/<string:estado>', methods=['GET'])
def get_permisos_by_estado(estado):
    """
    Obtiene permisos por estado (PENDIENTE, APROBADO, RECHAZADO)
    """
    result, status_code = PermisoService.get_permisos_by_estado(estado)
    return jsonify(result), status_code

@permiso_bp.route('/persona/<int:persona_id>', methods=['GET'])
def get_permisos_by_persona(persona_id):
    """
    Obtiene todos los permisos solicitados por una persona
    """
    result, status_code = PermisoService.get_permisos_by_persona(persona_id)
    return jsonify(result), status_code

@permiso_bp.route('/inscripcion/<int:inscripcion_id>', methods=['GET'])
def get_permisos_by_inscripcion(inscripcion_id):
    """
    Obtiene todos los permisos de una inscripción
    """
    result, status_code = PermisoService.get_permisos_by_inscripcion(inscripcion_id)
    return jsonify(result), status_code

@permiso_bp.route('/horario-sesion/<int:horario_sesion_id>', methods=['GET'])
def get_permisos_by_horario_sesion(horario_sesion_id):
    """
    Obtiene permisos por sesión de horario
    """
    result, status_code = PermisoService.get_permisos_by_horario_sesion(horario_sesion_id)
    return jsonify(result), status_code

@permiso_bp.route('/respondidos-por/<int:persona_id>', methods=['GET'])
def get_permisos_respondidos_por(persona_id):
    """
    Obtiene permisos respondidos por una persona (director/admin)
    """
    result, status_code = PermisoService.get_permisos_respondidos_por(persona_id)
    return jsonify(result), status_code

@permiso_bp.route('/<int:permiso_id>', methods=['GET'])
def get_permiso_by_id(permiso_id):
    """
    Obtiene un permiso por ID (información básica)
    """
    result, status_code = PermisoService.get_permiso_by_id(permiso_id)
    return jsonify(result), status_code

@permiso_bp.route('/<int:permiso_id>/detallado', methods=['GET'])
def get_permiso_detallado(permiso_id):
    """
    Obtiene un permiso por ID con información completa y detallada incluyendo:
    - Datos completos de la persona solicitante (nombre, apellido, email, celular)
    - Información de la asistencia original
    - Datos del horario sesión (fecha, hora, duración)
    - Información de la clase (estilo, nivel, días, horarios)
    - Datos de la inscripción
    - Información del paquete
    - Datos de la oferta
    - Información del ciclo
    - Persona que respondió (si aplica)
    - Asistencia de reemplazo (si aplica)
    """
    result, status_code = PermisoService.get_permiso_detallado(permiso_id)
    return jsonify(result), status_code

@permiso_bp.route('/', methods=['POST'])
def create_permiso():
    """
    Crea un nuevo permiso
    
    Body JSON esperado:
    {
        "Persona_id_persona": 1,
        "Inscricpcion_id_inscricpcion": 1,
        "Asistencia_original_id": 1,
        "motivo": "Tengo una cita médica importante",
        "Horario_sesion_id_horario_sesion": 1
    }
    """
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "No se proporcionaron datos"}), 400

        result, status_code = PermisoService.create_permiso(data)
        return jsonify(result), status_code

    except Exception as e:
        return jsonify({"error": f"Error en la solicitud: {str(e)}"}), 400

@permiso_bp.route('/<int:permiso_id>', methods=['PUT'])
def update_permiso(permiso_id):
    """
    Actualiza un permiso existente
    """
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "No se proporcionaron datos"}), 400

        result, status_code = PermisoService.update_permiso(permiso_id, data)
        return jsonify(result), status_code

    except Exception as e:
        return jsonify({"error": f"Error en la solicitud: {str(e)}"}), 400

@permiso_bp.route('/<int:permiso_id>', methods=['DELETE'])
def delete_permiso(permiso_id):
    """
    Elimina lógicamente un permiso (marca como inactivo)
    """
    try:
        result, status_code = PermisoService.delete_permiso(permiso_id)
        return jsonify(result), status_code

    except Exception as e:
        return jsonify({"error": f"Error en la solicitud: {str(e)}"}), 400

@permiso_bp.route('/<int:permiso_id>/aprobar', methods=['POST'])
def aprobar_permiso(permiso_id):
    """
    Aprueba un permiso pendiente
    
    Body JSON esperado:
    {
        "respondida_por": 1,
        "Asistencia_reemplazo_id": 2  // Opcional: nueva asistencia de reemplazo
    }
    """
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "No se proporcionaron datos"}), 400

        result, status_code = PermisoService.aprobar_permiso(permiso_id, data)
        return jsonify(result), status_code

    except Exception as e:
        return jsonify({"error": f"Error en la solicitud: {str(e)}"}), 400

@permiso_bp.route('/<int:permiso_id>/rechazar', methods=['POST'])
def rechazar_permiso(permiso_id):
    """
    Rechaza un permiso pendiente
    
    Body JSON esperado:
    {
        "respondida_por": 1,
        "motivo_rechazo": "No se puede cambiar la fecha con tan poco tiempo de anticipación"
    }
    """
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "No se proporcionaron datos"}), 400

        result, status_code = PermisoService.rechazar_permiso(permiso_id, data)
        return jsonify(result), status_code

    except Exception as e:
        return jsonify({"error": f"Error en la solicitud: {str(e)}"}), 400

@permiso_bp.route('/estadisticas', methods=['GET'])
def get_estadisticas_permisos():
    """
    Obtiene estadísticas de permisos (total, pendientes, aprobados, rechazados)
    """
    result, status_code = PermisoService.get_estadisticas_permisos()
    return jsonify(result), status_code

