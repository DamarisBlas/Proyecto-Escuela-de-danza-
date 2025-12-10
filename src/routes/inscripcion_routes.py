from flask import Blueprint, request, jsonify
from src.services.inscripcion_service import InscripcionService

# Crear blueprint para las rutas de inscripciones
inscripcion_bp = Blueprint('inscripciones', __name__, url_prefix='/inscripciones')

@inscripcion_bp.route('/', methods=['GET'])
def get_all_inscripciones():
    """
    Obtiene todas las inscripciones
    """
    result, status_code = InscripcionService.get_all_inscripciones()
    return jsonify(result), status_code

@inscripcion_bp.route('/active', methods=['GET'])
def get_active_inscripciones():
    """
    Obtiene todas las inscripciones activas
    """
    result, status_code = InscripcionService.get_active_inscripciones()
    return jsonify(result), status_code

@inscripcion_bp.route('/vigentes', methods=['GET'])
def get_inscripciones_vigentes():
    """
    Obtiene inscripciones vigentes (no vencidas)
    """
    result, status_code = InscripcionService.get_inscripciones_vigentes()
    return jsonify(result), status_code

@inscripcion_bp.route('/vencidas', methods=['GET'])
def get_inscripciones_vencidas():
    """
    Obtiene inscripciones vencidas
    """
    result, status_code = InscripcionService.get_inscripciones_vencidas()
    return jsonify(result), status_code

@inscripcion_bp.route('/persona/<int:persona_id>', methods=['GET'])
def get_inscripciones_by_persona(persona_id):
    """
    Obtiene todas las inscripciones de una persona
    """
    result, status_code = InscripcionService.get_inscripciones_by_persona(persona_id)
    return jsonify(result), status_code

@inscripcion_bp.route('/<int:inscripcion_id>', methods=['GET'])
def get_inscripcion_by_id(inscripcion_id):
    """
    Obtiene una inscripción por ID
    """
    result, status_code = InscripcionService.get_inscripcion_by_id(inscripcion_id)
    return jsonify(result), status_code

@inscripcion_bp.route('/', methods=['POST'])
def create_inscripcion():
    """
    Crea una nueva inscripción con asistencias automáticas
    
    Body JSON esperado:
    {
        "Persona_id_persona": 1,
        "Paquete_id_paquete": 1,
        "fecha_inscripcion": "2025-01-15",
        "fecha_inicio": "2025-01-20",
        "metodo_pago_id": 1,
        "pago_a_cuotas": false,
        "clases_seleccionadas": [101, 105, 108, 112]
    }
    
    El campo 'clases_seleccionadas' contiene los IDs de HorarioSesion
    para crear automáticamente los registros de asistencia.
    El campo 'metodo_pago_id' es requerido para crear los pagos automáticamente.
    El campo 'pago_a_cuotas' determina si se divide en 3 cuotas (true) o pago único (false).
    """
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "No se proporcionaron datos"}), 400

        result, status_code = InscripcionService.create_inscripcion(data)
        return jsonify(result), status_code

    except Exception as e:
        import traceback
        error_trace = traceback.format_exc()
        print(f"Error completo al crear inscripción: {error_trace}")
        return jsonify({"error": f"Error en la solicitud: {str(e)}", "trace": error_trace}), 500

@inscripcion_bp.route('/<int:inscripcion_id>', methods=['PUT'])
def update_inscripcion(inscripcion_id):
    """
    Actualiza una inscripción existente
    """
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "No se proporcionaron datos"}), 400

        result, status_code = InscripcionService.update_inscripcion(inscripcion_id, data)
        return jsonify(result), status_code

    except Exception as e:
        return jsonify({"error": f"Error en la solicitud: {str(e)}"}), 400

@inscripcion_bp.route('/<int:inscripcion_id>/cancel', methods=['PUT'])
def cancel_inscripcion(inscripcion_id):
    """
    Cancela una inscripción (borrado lógico)
    """
    result, status_code = InscripcionService.cancel_inscripcion(inscripcion_id)
    return jsonify(result), status_code

@inscripcion_bp.route('/<int:inscripcion_id>/use-class', methods=['PUT'])
def use_class(inscripcion_id):
    """
    Registra el uso de una clase (incrementa clases_usadas)
    """
    result, status_code = InscripcionService.use_class(inscripcion_id)
    return jsonify(result), status_code

@inscripcion_bp.route('/verificar-vencimientos', methods=['POST'])
def verificar_vencimientos():
    """
    Verifica y actualiza inscripciones con pagos vencidos
    """
    try:
        count = InscripcionService.verificar_y_actualizar_vencimientos()
        return jsonify({
            "message": f"Se actualizaron {count} inscripciones por vencimiento",
            "inscripciones_actualizadas": count
        }), 200
    except Exception as e:
        return jsonify({"error": f"Error al verificar vencimientos: {str(e)}"}), 500

@inscripcion_bp.route('/completas', methods=['GET'])
def get_inscripciones_completas():
    """
    Obtiene todas las inscripciones con información completa detallada

    Incluye datos detallados de:
    - Persona: nombre, apellido, email, celular
    - Paquete: nombre, cantidad_clases, precio, oferta completa
    - Promocion: nombre, porcentaje_descuento, etc.
    - Oferta: nombre, ciclo, subcategoria, categoria, programa
    """
    try:
        result, status_code = InscripcionService.get_inscripciones_completas()
        return jsonify(result), status_code
    except Exception as e:
        return jsonify({"error": f"Error interno del servidor: {str(e)}"}), 500

@inscripcion_bp.route('/horario/<int:horario_id>/inscritos', methods=['GET'])
def get_inscritos_por_horario(horario_id):
    try:
        result, status_code = InscripcionService.get_inscritos_por_horario(horario_id)
        return jsonify(result), status_code
    except Exception as e:
        return jsonify({"error": f"Error: {str(e)}"}), 500

