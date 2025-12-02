from flask import Blueprint, request, jsonify
from src.services.horario_service import HorarioService
from src.services.horario_sesion_service import HorarioSesionService

horario_bp = Blueprint('horario', __name__)

@horario_bp.route('/', methods=['GET'])
def get_horarios():
    """
    Obtiene todos los horarios
    """
    try:
        result, status_code = HorarioService.get_all_horarios()
        return jsonify(result), status_code
    except Exception as e:
        return jsonify({"error": f"Error interno del servidor: {str(e)}"}), 500

@horario_bp.route('/active', methods=['GET'])
def get_active_horarios():
    """
    Obtiene todos los horarios activos
    """
    try:
        result, status_code = HorarioService.get_active_horarios()
        return jsonify(result), status_code
    except Exception as e:
        return jsonify({"error": f"Error interno del servidor: {str(e)}"}), 500

@horario_bp.route('/cursos-regulares/vigente', methods=['GET'])
def get_horarios_cursos_regulares_vigentes():
    """
    Obtiene los horarios de cursos regulares del ciclo activo vigente.
    
    Filtra por:
    - Oferta con estado=true
    - Subcategoría 'Regular'
    - Ciclo con estado=true y activo=true
    - Oferta vigente (fecha actual dentro del rango fecha_inicio - fecha_fin)
    
    Retorna:
    - Información de la oferta, ciclo, subcategoría, categoría y programa
    - Lista completa de horarios con estilo, profesor, sala, días y horarios
    """
    try:
        result, status_code = HorarioService.get_horarios_cursos_regulares_vigentes()
        return jsonify(result), status_code
    except Exception as e:
        return jsonify({"error": f"Error interno del servidor: {str(e)}"}), 500

@horario_bp.route('/oferta/<int:oferta_id>', methods=['GET'])
def get_horarios_by_oferta(oferta_id):
    """
    Obtiene todos los horarios de una oferta
    """
    try:
        result, status_code = HorarioService.get_horarios_by_oferta(oferta_id)
        return jsonify(result), status_code
    except Exception as e:
        return jsonify({"error": f"Error interno del servidor: {str(e)}"}), 500

@horario_bp.route('/profesor/<int:profesor_id>', methods=['GET'])
def get_horarios_by_profesor(profesor_id):
    """
    Obtiene todos los horarios de un profesor con información completa
    
    Incluye datos detallados de:
    - Oferta (nombre, ciclo, subcategoria, categoria, programa)
    - Sala (todos los datos)
    - Estilo (todos los datos)
    - Total de inscritos en el horario (contados desde la tabla asistencia)
    """
    try:
        result, status_code = HorarioService.get_horarios_by_profesor(profesor_id)
        return jsonify(result), status_code
    except Exception as e:
        return jsonify({"error": f"Error interno del servidor: {str(e)}"}), 500

@horario_bp.route('/<int:horario_id>', methods=['GET'])
def get_horario(horario_id):
    """
    Obtiene un horario por ID
    """
    try:
        result, status_code = HorarioService.get_horario_by_id(horario_id)
        return jsonify(result), status_code
    except Exception as e:
        return jsonify({"error": f"Error interno del servidor: {str(e)}"}), 500

@horario_bp.route('/<int:horario_id>/sesiones', methods=['GET'])
def get_sesiones_by_horario(horario_id):
    """
    Obtiene todas las sesiones de un horario
    """
    try:
        result, status_code = HorarioSesionService.get_sesiones_by_horario(horario_id)
        return jsonify(result), status_code
    except Exception as e:
        return jsonify({"error": f"Error interno del servidor: {str(e)}"}), 500

@horario_bp.route('/<int:horario_id>/sesiones/active', methods=['GET'])
def get_active_sesiones_by_horario(horario_id):
    """
    Obtiene todas las sesiones activas de un horario
    """
    try:
        result, status_code = HorarioSesionService.get_active_sesiones_by_horario(horario_id)
        return jsonify(result), status_code
    except Exception as e:
        return jsonify({"error": f"Error interno del servidor: {str(e)}"}), 500

@horario_bp.route('/<int:horario_id>/sesiones/<int:sesion_id>', methods=['GET'])
def get_sesion(horario_id, sesion_id):
    """
    Obtiene una sesión específica de un horario
    """
    try:
        result, status_code = HorarioSesionService.get_sesion_by_id(sesion_id)
        return jsonify(result), status_code
    except Exception as e:
        return jsonify({"error": f"Error interno del servidor: {str(e)}"}), 500

@horario_bp.route('/<int:horario_id>/sesiones/<int:sesion_id>', methods=['PUT'])
def update_sesion(horario_id, sesion_id):
    """
    Actualiza una sesión de un horario
    
    Body ejemplo:
    {
        "fecha": "2025-10-20",
        "hora_inicio": "19:00",
        "hora_fin": "20:30",
        "cancelado": true,
        "motivo": "Profesor enfermo"
    }
    """
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "Datos requeridos"}), 400

        result, status_code = HorarioSesionService.update_sesion(sesion_id, data)
        return jsonify(result), status_code

    except Exception as e:
        return jsonify({"error": f"Error interno del servidor: {str(e)}"}), 500

@horario_bp.route('/<int:horario_id>/sesiones/<int:sesion_id>', methods=['DELETE'])
def delete_sesion(horario_id, sesion_id):
    """
    Elimina una sesión de un horario (borrado lógico)
    """
    try:
        result, status_code = HorarioSesionService.delete_sesion(sesion_id)
        return jsonify(result), status_code

    except Exception as e:
        return jsonify({"error": f"Error interno del servidor: {str(e)}"}), 500

@horario_bp.route('/', methods=['POST'])
def create_horario():
    """
    Crea un nuevo horario y genera automáticamente sus sesiones
    
    Body esperado:
    {
        "oferta_id": 1,
        "estilo_id": 2,
        "nivel": 2,
        "profesor_id": 5,
        "sala_id": 1,
        "capacidad": 12,
        "dias": [1, 3, 5],  // Lunes, Miércoles, Viernes
        "hora_inicio": "18:00",
        "hora_fin": "19:30"
    }
    """
    try:
        data = request.get_json()

        # Validar datos requeridos
        required_fields = ['oferta_id', 'estilo_id', 'nivel', 'profesor_id', 
                         'sala_id', 'capacidad', 'dias', 'hora_inicio', 'hora_fin']
        if not data or not all(field in data for field in required_fields):
            return jsonify({"error": "Faltan campos requeridos"}), 400

        result, status_code = HorarioService.create_horario(data)
        return jsonify(result), status_code

    except Exception as e:
        return jsonify({"error": f"Error interno del servidor: {str(e)}"}), 500

@horario_bp.route('/<int:horario_id>', methods=['PUT'])
def update_horario(horario_id):
    """
    Actualiza un horario existente
    """
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "Datos requeridos"}), 400

        result, status_code = HorarioService.update_horario(horario_id, data)
        return jsonify(result), status_code

    except Exception as e:
        return jsonify({"error": f"Error interno del servidor: {str(e)}"}), 500

@horario_bp.route('/<int:horario_id>', methods=['DELETE'])
def delete_horario(horario_id):
    """
    Elimina un horario (borrado lógico)
    """
    try:
        result, status_code = HorarioService.delete_horario(horario_id)
        return jsonify(result), status_code

    except Exception as e:
        return jsonify({"error": f"Error interno del servidor: {str(e)}"}), 500

@horario_bp.route('/profesores', methods=['GET'])
def get_todos_horarios_detallados():
    """
    Obtiene todos los horarios con información detallada completa

    Incluye datos detallados de:
    - Profesor: nombre, apellido, email, celular (desde tabla Persona)
    - Sala: nombre, ubicación
    - Estilo: nombre
    - Oferta: nombre
    - Ciclo: nombre
    - Subcategoria: nombre
    - Categoria: nombre
    - Programa: nombre
    - Días transformados: 1=Lunes, 2=Martes, 3=Miércoles, etc.
    - Total de inscritos por horario
    """
    try:
        result, status_code = HorarioService.get_todos_horarios_detallados()
        return jsonify(result), status_code
    except Exception as e:
        return jsonify({"error": f"Error interno del servidor: {str(e)}"}), 500

@horario_bp.route('/marcado-automatico', methods=['GET'])
def marcado_automatico():
    """
    Selecciona automáticamente IDs de horario_sesion según parámetros
    
    Query params:
    - fecha_inicio: Fecha de inicio del periodo (YYYY-MM-DD)
    - fecha_fin: Fecha final del periodo (YYYY-MM-DD)
    - horarios_ids: Lista de IDs de horarios separados por coma (ej: 37,42,45)
    - cantidad_clases: Número de clases del paquete (opcional, omitir para ilimitado)
    
    Ejemplo: GET /horarios/marcado-automatico?fecha_inicio=2025-12-01&fecha_fin=2025-12-31&horarios_ids=37,42,45&cantidad_clases=8
    
    Retorna:
    - ids_horario_sesion: Lista de IDs seleccionados automáticamente
    - sesiones_detalle: Información detallada de cada sesión
    - total_sesiones_seleccionadas: Cantidad total seleccionada
    """
    try:
        # Obtener parámetros de query string
        fecha_inicio = request.args.get('fecha_inicio')
        fecha_fin = request.args.get('fecha_fin')
        horarios_ids_str = request.args.get('horarios_ids')
        cantidad_clases_str = request.args.get('cantidad_clases')
        
        # Validar campos requeridos
        if not fecha_inicio or not fecha_fin or not horarios_ids_str:
            return jsonify({"error": "Parámetros requeridos: fecha_inicio, fecha_fin, horarios_ids"}), 400
        
        # Convertir horarios_ids de string a lista de integers
        try:
            horarios_ids = [int(id.strip()) for id in horarios_ids_str.split(',')]
        except ValueError:
            return jsonify({"error": "horarios_ids debe ser una lista de números separados por coma"}), 400
        
        # Convertir cantidad_clases a int o None
        cantidad_clases = None
        if cantidad_clases_str:
            try:
                cantidad_clases = int(cantidad_clases_str)
            except ValueError:
                return jsonify({"error": "cantidad_clases debe ser un número"}), 400
        
        result, status_code = HorarioService.marcado_automatico(
            fecha_inicio, 
            fecha_fin, 
            horarios_ids, 
            cantidad_clases
        )
        return jsonify(result), status_code
        
    except Exception as e:
        return jsonify({"error": f"Error en la solicitud: {str(e)}"}), 400

@horario_bp.route('/sesiones/<int:horario_id>', methods=['GET'])
def get_sesiones_by_horario_fecha(horario_id):
    """
    Obtiene horarios sesión filtrados por horario y rango de fechas
    
    Query params:
    - fecha_inicio (required): Fecha inicio en formato YYYY-MM-DD
    - fecha_fin (required): Fecha fin en formato YYYY-MM-DD
    
    Filtros aplicados:
    - Estado activo (estado = True)
    - No cancelados (cancelado = False)
    - Con cupos disponibles
    
    Retorna información detallada de:
    - Sesión (fecha, hora, cupos)
    - Horario (nivel, capacidad)
    - Estilo (nombre, descripción)
    - Sala (nombre, ubicación)
    - Profesor (nombre, apellido)
    - Oferta (nombre, público objetivo)
    - Ciclo (nombre, fechas)
    
    Query params opcionales:
    - persona_id: Si se proporciona, excluye sesiones a las que ya se inscribió
    """
    try:
        from src.services.horario_sesion_service import HorarioSesionService
        from flask import request
        
        # Obtener parámetros de query
        fecha_inicio = request.args.get('fecha_inicio')
        fecha_fin = request.args.get('fecha_fin')
        persona_id = request.args.get('persona_id', type=int)
        
        if not fecha_inicio or not fecha_fin:
            return jsonify({
                "error": "Los parámetros fecha_inicio y fecha_fin son requeridos",
                "ejemplo": "/horarios/sesiones/1?fecha_inicio=2025-12-01&fecha_fin=2025-12-31&persona_id=123"
            }), 400
        
        result, status_code = HorarioSesionService.get_sesiones_by_horario_fecha(
            horario_id,
            fecha_inicio,
            fecha_fin,
            persona_id
        )
        return jsonify(result), status_code
        
    except Exception as e:
        return jsonify({"error": f"Error interno del servidor: {str(e)}"}), 500
