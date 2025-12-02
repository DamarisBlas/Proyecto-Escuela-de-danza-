from flask import Blueprint, jsonify, request
from src.services.dashboard_service import DashboardService

dashboard_bp = Blueprint('dashboard', __name__, url_prefix='/dashboard')
dashboard_service = DashboardService()


@dashboard_bp.route('/estadisticas/<int:id_ciclo>', methods=['GET'])
def get_estadisticas_generales(id_ciclo):
    """
    GET /dashboard/estadisticas/{id_ciclo}
    
    Obtiene las estadísticas generales de un ciclo específico:
    - Total de alumnas
    - Ocupación promedio
    - Ingresos del mes actual
    - Asistencia promedio
    """
    try:
        resultado = dashboard_service.get_estadisticas_generales_ciclo(id_ciclo)
        
        if resultado is None:
            return jsonify({'error': 'Ciclo no encontrado'}), 404
        
        return jsonify(resultado), 200
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@dashboard_bp.route('/alumnas-por-estilo/<int:id_ciclo>', methods=['GET'])
def get_alumnas_por_estilo(id_ciclo):
    """
    GET /dashboard/alumnas-por-estilo/{id_ciclo}
    
    Obtiene el total de alumnas por estilo de baile en un ciclo.
    Útil para gráficos de barras.
    """
    try:
        resultado = dashboard_service.get_alumnas_por_estilo(id_ciclo)
        return jsonify(resultado), 200
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@dashboard_bp.route('/ocupacion-por-estilo/<int:id_ciclo>', methods=['GET'])
def get_ocupacion_por_estilo(id_ciclo):
    """
    GET /dashboard/ocupacion-por-estilo/{id_ciclo}
    
    Obtiene la ocupación (capacidad vs cupos ocupados) por estilo.
    Útil para gráficos de pie/donut.
    """
    try:
        resultado = dashboard_service.get_ocupacion_por_estilo(id_ciclo)
        return jsonify(resultado), 200
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@dashboard_bp.route('/ingresos-mensuales', methods=['GET'])
def get_ingresos_mensuales():
    """
    GET /dashboard/ingresos-mensuales?anio=2025&meses=6
    
    Obtiene los ingresos mensuales.
    Query params:
    - anio: Año (default: año actual)
    - meses: Cantidad de meses a mostrar (default: 6)
    
    Útil para gráficos de líneas de tendencia.
    """
    try:
        anio = request.args.get('anio', type=int)
        meses = request.args.get('meses', default=6, type=int)
        
        resultado = dashboard_service.get_ingresos_mensuales(anio, meses)
        return jsonify(resultado), 200
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@dashboard_bp.route('/top-profesores/<int:id_ciclo>', methods=['GET'])
def get_top_profesores(id_ciclo):
    """
    GET /dashboard/top-profesores/{id_ciclo}?limit=10
    
    Obtiene los profesores más populares basado en asistencias.
    Query params:
    - limit: Cantidad de profesores a mostrar (default: 10)
    """
    try:
        limit = request.args.get('limit', default=10, type=int)
        resultado = dashboard_service.get_top_profesores(id_ciclo, limit)
        return jsonify(resultado), 200
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@dashboard_bp.route('/horarios-demandados/<int:id_ciclo>', methods=['GET'])
def get_horarios_mas_demandados(id_ciclo):
    """
    GET /dashboard/horarios-demandados/{id_ciclo}
    
    Obtiene los días y horarios con mayor ocupación.
    Útil para identificar horarios peak.
    """
    try:
        resultado = dashboard_service.get_horarios_mas_demandados(id_ciclo)
        return jsonify(resultado), 200
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@dashboard_bp.route('/estado-pagos/<int:id_ciclo>', methods=['GET'])
def get_estado_pagos(id_ciclo):
    """
    GET /dashboard/estado-pagos/{id_ciclo}
    
    Obtiene la distribución de pagos por estado (CONFIRMADO, PENDIENTE, etc.).
    Útil para gráficos de pie.
    """
    try:
        resultado = dashboard_service.get_estado_pagos(id_ciclo)
        return jsonify(resultado), 200
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@dashboard_bp.route('/asistencia-mensual/<int:id_ciclo>', methods=['GET'])
def get_asistencia_por_mes(id_ciclo):
    """
    GET /dashboard/asistencia-mensual/{id_ciclo}
    
    Obtiene la tendencia de asistencia por mes en el ciclo.
    Útil para gráficos de líneas de tendencia.
    """
    try:
        resultado = dashboard_service.get_asistencia_por_mes(id_ciclo)
        return jsonify(resultado), 200
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@dashboard_bp.route('/alumnos-nuevos-recurrentes/<int:id_ciclo>', methods=['GET'])
def get_alumnos_nuevos_vs_recurrentes(id_ciclo):
    """
    GET /dashboard/alumnos-nuevos-recurrentes/{id_ciclo}
    
    Obtiene la comparación entre alumnos nuevos y recurrentes.
    Útil para medir retención y crecimiento.
    """
    try:
        resultado = dashboard_service.get_alumnos_nuevos_vs_recurrentes(id_ciclo)
        
        if resultado is None:
            return jsonify({'error': 'Ciclo no encontrado'}), 404
        
        return jsonify(resultado), 200
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500
