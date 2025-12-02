from flask import Blueprint, request, jsonify
from src.services.asistencia_service import AsistenciaService

# Crear blueprint para las rutas de asistencias
asistencia_bp = Blueprint('asistencias', __name__, url_prefix='/asistencias')

@asistencia_bp.route('/', methods=['GET'])
def get_all_asistencias():
    """
    Obtiene todas las asistencias
    """
    result, status_code = AsistenciaService.get_all_asistencias()
    return jsonify(result), status_code

@asistencia_bp.route('/activas', methods=['GET'])
def get_asistencias_activas():
    """
    Obtiene solo las asistencias activas (estado = True)
    """
    result, status_code = AsistenciaService.get_asistencias_activas()
    return jsonify(result), status_code

@asistencia_bp.route('/<int:asistencia_id>', methods=['GET'])
def get_asistencia_by_id(asistencia_id):
    """
    Obtiene una asistencia por su ID
    """
    result, status_code = AsistenciaService.get_asistencia_by_id(asistencia_id)
    return jsonify(result), status_code

@asistencia_bp.route('/inscripcion/<int:inscripcion_id>', methods=['GET'])
def get_asistencias_by_inscripcion(inscripcion_id):
    """
    Obtiene todas las asistencias de una inscripción específica
    
    Query params opcionales:
    - estado: true/false para filtrar por estado
    - asistio: true/false/null para filtrar por asistencia
    """
    try:
        result, status_code = AsistenciaService.get_asistencias_by_inscripcion(inscripcion_id)
        
        if status_code == 200:
            # Aplicar filtros opcionales
            estado_filter = request.args.get('estado')
            asistio_filter = request.args.get('asistio')
            
            if estado_filter is not None:
                estado_bool = estado_filter.lower() == 'true'
                result['asistencias'] = [
                    a for a in result['asistencias'] 
                    if a['estado'] == estado_bool
                ]
                result['total_asistencias'] = len(result['asistencias'])
            
            if asistio_filter is not None:
                if asistio_filter.lower() == 'null':
                    asistio_value = None
                else:
                    asistio_value = asistio_filter.lower() == 'true'
                
                result['asistencias'] = [
                    a for a in result['asistencias'] 
                    if a['asistio'] == asistio_value
                ]
                result['total_asistencias'] = len(result['asistencias'])
        
        return jsonify(result), status_code
    except Exception as e:
        return jsonify({"error": f"Error en la solicitud: {str(e)}"}), 400

@asistencia_bp.route('/sesion/<int:sesion_id>', methods=['GET'])
def get_asistencias_by_sesion(sesion_id):
    """
    Obtiene todas las asistencias de una sesión específica
    """
    result, status_code = AsistenciaService.get_asistencias_by_sesion(sesion_id)
    return jsonify(result), status_code

@asistencia_bp.route('/', methods=['POST'])
def create_asistencia():
    """
    Crea una nueva asistencia
    
    Body JSON esperado:
    {
        "Inscripcion_id_inscripcion": 1,
        "Horario_sesion_id_horario_sesion": 101,
        "asistio": null,
        "fecha": null,
        "estado": true
    }
    
    Campos requeridos:
    - Inscripcion_id_inscripcion
    - Horario_sesion_id_horario_sesion
    """
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "No se proporcionaron datos"}), 400

        result, status_code = AsistenciaService.create_asistencia(data)
        return jsonify(result), status_code

    except Exception as e:
        return jsonify({"error": f"Error en la solicitud: {str(e)}"}), 400

@asistencia_bp.route('/<int:asistencia_id>', methods=['PUT'])
def update_asistencia(asistencia_id):
    """
    Actualiza una asistencia existente
    
    Body JSON esperado (todos los campos opcionales):
    {
        "Inscripcion_id_inscripcion": 1,
        "Horario_sesion_id_horario_sesion": 101,
        "asistio": true,
        "fecha": "2025-11-11",
        "estado": true
    }
    """
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "No se proporcionaron datos"}), 400

        result, status_code = AsistenciaService.update_asistencia(asistencia_id, data)
        return jsonify(result), status_code

    except Exception as e:
        return jsonify({"error": f"Error en la solicitud: {str(e)}"}), 400

@asistencia_bp.route('/<int:asistencia_id>', methods=['DELETE'])
def delete_asistencia(asistencia_id):
    """
    Borrado lógico de una asistencia (estado = False)
    """
    result, status_code = AsistenciaService.delete_asistencia(asistencia_id)
    return jsonify(result), status_code

@asistencia_bp.route('/<int:asistencia_id>/marcar', methods=['PUT'])
def marcar_asistencia(asistencia_id):
    """
    Marca una asistencia como presente o ausente
    
    Body JSON esperado:
    {
        "asistio": true  // true = presente, false = ausente
    }
    """
    try:
        data = request.get_json()
        if not data or 'asistio' not in data:
            return jsonify({"error": "Campo 'asistio' requerido"}), 400

        result, status_code = AsistenciaService.marcar_asistencia(asistencia_id, data['asistio'])
        return jsonify(result), status_code

    except Exception as e:
        return jsonify({"error": f"Error en la solicitud: {str(e)}"}), 400

@asistencia_bp.route('/inscripcion/<int:inscripcion_id>/estadisticas', methods=['GET'])
def get_estadisticas_asistencia(inscripcion_id):
    """
    Obtiene estadísticas de asistencia para una inscripción
    
    Retorna:
    - Total de clases programadas
    - Clases asistidas
    - Clases no asistidas
    - Clases pendientes
    - Porcentaje de asistencia
    """
    result, status_code = AsistenciaService.get_estadisticas_asistencia(inscripcion_id)
    return jsonify(result), status_code

@asistencia_bp.route('/marcar-presente/<int:asistencia_id>', methods=['PUT'])
def marcar_presente(asistencia_id):
    """
    Shortcut para marcar una asistencia como presente
    """
    result, status_code = AsistenciaService.marcar_asistencia(asistencia_id, True)
    return jsonify(result), status_code

@asistencia_bp.route('/marcar-ausente/<int:asistencia_id>', methods=['PUT'])
def marcar_ausente(asistencia_id):
    """
    Shortcut para marcar una asistencia como ausente
    """
    result, status_code = AsistenciaService.marcar_asistencia(asistencia_id, False)
    return jsonify(result), status_code

@asistencia_bp.route('/inscritos', methods=['GET'])
def get_personas_inscritas():
    """
    Obtiene la lista de personas inscritas en un horario específico en una fecha
    con información completa de inscripción, asistencia, horario y sesión
    
    Query params requeridos:
    - horario_id: ID del horario
    - fecha: Fecha en formato YYYY-MM-DD
    
    Ejemplo: GET /asistencias/inscritos?horario_id=37&fecha=2025-11-22
    
    Retorna:
    - persona: todos los datos de la persona
    - inscripcion: id_inscripcion, fecha_inscripcion, estado_pago, etc.
    - asistencia: id_asistencia, asistio, fecha, estado
    - horario_sesion: id_horario_sesion, dia, hora_inicio, hora_fin, capacidad_maxima, etc.
    - horario: id_horario, capacidad, dias, nivel, etc.
    """
    try:
        horario_id = request.args.get('horario_id')
        fecha = request.args.get('fecha')
        
        if not horario_id or not fecha:
            return jsonify({"error": "Parámetros 'horario_id' y 'fecha' son requeridos"}), 400
        
        try:
            horario_id = int(horario_id)
        except ValueError:
            return jsonify({"error": "horario_id debe ser un número entero"}), 400
        
        result, status_code = AsistenciaService.get_personas_inscritas_por_horario_y_fecha(horario_id, fecha)
        return jsonify(result), status_code
        
    except Exception as e:
        return jsonify({"error": f"Error en la solicitud: {str(e)}"}), 400

@asistencia_bp.route('/inscritos/horario/<int:horario_id>', methods=['GET'])
def get_personas_inscritas_por_horario(horario_id):
    """
    Obtiene la lista de personas inscritas en todas las sesiones de un horario específico
    con información completa de inscripción, asistencia, horario y sesión
    
    Query params opcionales:
    - fecha: Fecha específica en formato YYYY-MM-DD (opcional, si no se especifica trae todas las sesiones)
    
    Ejemplo: GET /asistencias/inscritos/horario/37
    
    Retorna:
    - persona: todos los datos de la persona
    - inscripcion: id_inscripcion, fecha_inscripcion, estado_pago, etc.
    - asistencia: id_asistencia, asistio, fecha, estado
    - horario_sesion: id_horario_sesion, fecha, hora_inicio, hora_fin, capacidad_maxima, etc.
    - horario: id_horario, capacidad, dias, nivel, etc.
    """
    try:
        # Verificar si se especificó una fecha
        fecha = request.args.get('fecha')
        
        if fecha:
            # Si se especifica fecha, usar el endpoint existente
            result, status_code = AsistenciaService.get_personas_inscritas_por_horario_y_fecha(horario_id, fecha)
        else:
            # Si no se especifica fecha, obtener todas las sesiones del horario
            result, status_code = AsistenciaService.get_personas_inscritas_por_horario(horario_id)
        
        return jsonify(result), status_code
        
    except Exception as e:
        return jsonify({"error": f"Error en la solicitud: {str(e)}"}), 400

@asistencia_bp.route('/inscripcion/<int:inscripcion_id>/pendientes', methods=['GET'])
def get_asistencias_pendientes(inscripcion_id):
    """
    Obtiene las asistencias pendientes de marcar para una inscripción
    """
    try:
        result, status_code = AsistenciaService.get_asistencias_by_inscripcion(inscripcion_id)
        
        if status_code == 200:
            # Filtrar solo las asistencias pendientes (asistio = null)
            asistencias_pendientes = [
                a for a in result['asistencias'] 
                if a['asistio'] is None and a['estado'] == True
            ]
            
            result['asistencias'] = asistencias_pendientes
            result['total_asistencias'] = len(asistencias_pendientes)
            result['message'] = "Asistencias pendientes de marcar"
        
        return jsonify(result), status_code
    except Exception as e:
        return jsonify({"error": f"Error en la solicitud: {str(e)}"}), 400

@asistencia_bp.route('/inscritos/detallado/horario/<int:horario_id>', methods=['GET'])
def get_inscritos_completos_por_horario(horario_id):
    """
    Obtiene la lista completa de personas inscritas a un horario específico
    agrupadas por persona con toda su información y lista de sesiones inscritas
    
    Parámetros URL:
    - horario_id: ID del horario
    
    Retorna:
    - horario_id: ID del horario consultado
    - total_personas: Número total de personas inscritas
    - inscritos: Lista de personas agrupadas con información completa y sesiones
    """
    try:
        result, status_code = AsistenciaService.get_inscritos_completos_por_horario(horario_id)
        return jsonify(result), status_code
        
    except Exception as e:
        return jsonify({"error": f"Error en la solicitud: {str(e)}"}), 400

@asistencia_bp.route('/verificar-inscripcion/<int:persona_id>', methods=['GET'])
def verificar_inscripcion_persona(persona_id):
    """
    Verifica si una persona está inscrita en algún horario sesión.
    
    Parámetros URL:
    - persona_id: ID de la persona a consultar
    
    Retorna:
    - persona_id: ID de la persona consultada
    - tiene_inscripciones: Boolean indicando si tiene inscripciones activas
    - total_inscripciones_activas: Cantidad de inscripciones activas
    - total_sesiones_inscritas: Cantidad de sesiones únicas inscritas
    - sesiones_inscritas: Lista de IDs de horario_sesion donde está inscrito
    
    Ejemplo: GET /asistencias/verificar-inscripcion/59
    """
    try:
        result, status_code = AsistenciaService.verificar_inscripcion_persona(persona_id)
        return jsonify(result), status_code
        
    except Exception as e:
        return jsonify({"error": f"Error en la solicitud: {str(e)}"}), 400