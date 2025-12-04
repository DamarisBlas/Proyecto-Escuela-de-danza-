from flask import Blueprint, request, jsonify
from src.services.horario_sesion_service import HorarioSesionService
from datetime import datetime, timedelta

sesion_bp = Blueprint('sesion', __name__)

@sesion_bp.route('/agenda', methods=['GET'])
def get_agenda_semanal():
    """
    Obtiene todas las sesiones activas en un rango de fechas
    con toda la información completa para mostrar en la agenda
    
    Query params:
    - desde: Fecha inicial en formato YYYY-MM-DD (requerido)
    - hasta: Fecha final en formato YYYY-MM-DD (requerido)
    
    Ejemplo: GET /sesiones/agenda?desde=2025-10-27&hasta=2025-11-03
    """
    try:
        # Obtener parámetros de query
        fecha_desde = request.args.get('desde')
        fecha_hasta = request.args.get('hasta')
        
        # Validar que se proporcionaron las fechas
        if not fecha_desde or not fecha_hasta:
            return jsonify({
                "error": "Se requieren los parámetros 'desde' y 'hasta' en formato YYYY-MM-DD"
            }), 400
        
        # Validar formato de fechas
        try:
            fecha_desde_obj = datetime.strptime(fecha_desde, '%Y-%m-%d').date()
            fecha_hasta_obj = datetime.strptime(fecha_hasta, '%Y-%m-%d').date()
        except ValueError:
            return jsonify({
                "error": "Formato de fecha inválido. Use YYYY-MM-DD"
            }), 400
        
        # Validar que fecha_desde sea anterior a fecha_hasta
        if fecha_desde_obj > fecha_hasta_obj:
            return jsonify({
                "error": "La fecha 'desde' debe ser anterior o igual a la fecha 'hasta'"
            }), 400
        
        # Obtener las sesiones
        result, status_code = HorarioSesionService.get_agenda_semanal(
            fecha_desde_obj, 
            fecha_hasta_obj
        )
        
        return jsonify(result), status_code
        
    except Exception as e:
        return jsonify({"error": f"Error interno del servidor: {str(e)}"}), 500

@sesion_bp.route('/fecha/<string:fecha>', methods=['GET'])
def get_sesiones_por_fecha(fecha):
    """
    Obtiene todas las sesiones activas de una fecha específica
    con toda la información completa
    
    Path param:
    - fecha: Fecha en formato YYYY-MM-DD
    
    Ejemplo: GET /sesiones/fecha/2025-10-27
    """
    try:
        # Validar formato de fecha
        try:
            fecha_obj = datetime.strptime(fecha, '%Y-%m-%d').date()
        except ValueError:
            return jsonify({
                "error": "Formato de fecha inválido. Use YYYY-MM-DD"
            }), 400
        
        # Obtener las sesiones de esa fecha específica
        result, status_code = HorarioSesionService.get_agenda_semanal(
            fecha_obj, 
            fecha_obj
        )
        
        return jsonify(result), status_code
        
    except Exception as e:
        return jsonify({"error": f"Error interno del servidor: {str(e)}"}), 500

@sesion_bp.route('/detalle/<int:sesion_id>', methods=['GET'])
def get_sesion_with_horario_info(sesion_id):
    """
    Obtiene una sesión específica por ID junto con toda la información del horario relacionado
    
    Path param:
    - sesion_id: ID de la sesión (HorarioSesion)
    
    Ejemplo: GET /sesiones/detalle/157
    
    Retorna:
    - Información completa de la sesión (HorarioSesion)
    - Información completa del horario relacionado (Horario)
    - Datos de nivel, estilo, profesor, sala, oferta si están disponibles
    """
    try:
        result, status_code = HorarioSesionService.get_sesion_with_horario_info(sesion_id)
        return jsonify(result), status_code
        
    except Exception as e:
        return jsonify({"error": f"Error interno del servidor: {str(e)}"}), 500

@sesion_bp.route('/<int:sesion_id>', methods=['GET'])
def get_sesion_by_id(sesion_id):
    """
    Obtiene una sesión específica por ID
    
    Path param:
    - sesion_id: ID de la sesión (HorarioSesion)
    
    Ejemplo: GET /sesiones/157
    
    Retorna información básica de la sesión
    """
    try:
        result, status_code = HorarioSesionService.get_sesion_by_id(sesion_id)
        return jsonify(result), status_code
        
    except Exception as e:
        return jsonify({"error": f"Error interno del servidor: {str(e)}"}), 500

@sesion_bp.route('/<int:sesion_id>', methods=['PUT'])
def update_sesion(sesion_id):
    """
    Actualiza una sesión específica por ID
    Útil para cancelar clases cambiando el estado de cancelado y agregando motivo
    
    Path param:
    - sesion_id: ID de la sesión (HorarioSesion)
    
    Body (JSON):
    {
        "cancelado": true,
        "motivo": "Profesor enfermo"
    }
    
    O cualquier otro campo que se desee actualizar:
    {
        "hora_inicio": "19:00",
        "hora_fin": "20:00",
        "capacidad_maxima": 15
    }
    
    Ejemplo: PUT /sesiones/157
    """
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({"error": "No se proporcionó información para actualizar"}), 400
        
        result, status_code = HorarioSesionService.update_sesion(sesion_id, data)
        return jsonify(result), status_code
        
    except Exception as e:
        return jsonify({"error": f"Error interno del servidor: {str(e)}"}), 500
