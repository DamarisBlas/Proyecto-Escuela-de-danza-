from flask import Blueprint, request, jsonify
from src.services.pago_service import PagoService

# Crear blueprint para las rutas de pagos
pago_bp = Blueprint('pagos', __name__, url_prefix='/pagos')

@pago_bp.route('/', methods=['GET'])
def get_all_pagos():
    """
    Obtiene todos los pagos
    """
    result, status_code = PagoService.get_all_pagos()
    return jsonify(result), status_code

@pago_bp.route('/pendientes', methods=['GET'])
def get_pagos_pendientes():
    """
    Obtiene pagos pendientes
    """
    result, status_code = PagoService.get_pagos_pendientes()
    return jsonify(result), status_code

@pago_bp.route('/vencidos', methods=['GET'])
def get_pagos_vencidos():
    """
    Obtiene pagos vencidos
    """
    result, status_code = PagoService.get_pagos_vencidos()
    return jsonify(result), status_code

@pago_bp.route('/inscripcion/<int:inscripcion_id>', methods=['GET'])
def get_pagos_by_inscripcion(inscripcion_id):
    """
    Obtiene todos los pagos de una inscripción
    """
    result, status_code = PagoService.get_pagos_by_inscripcion(inscripcion_id)
    return jsonify(result), status_code

@pago_bp.route('/inscripcion/<int:inscripcion_id>/resumen', methods=['GET'])
def get_resumen_cuotas_inscripcion(inscripcion_id):
    """
    Obtiene el resumen de cuotas de una inscripción
    """
    result, status_code = PagoService.get_resumen_cuotas_inscripcion(inscripcion_id)
    return jsonify(result), status_code

@pago_bp.route('/<int:pago_id>', methods=['GET'])
def get_pago_by_id(pago_id):
    """
    Obtiene un pago por ID
    """
    result, status_code = PagoService.get_pago_by_id(pago_id)
    return jsonify(result), status_code

@pago_bp.route('/', methods=['POST'])
def create_pago():
    """
    Crea un nuevo pago
    """
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "No se proporcionaron datos"}), 400

        result, status_code = PagoService.create_pago(data)
        return jsonify(result), status_code

    except Exception as e:
        return jsonify({"error": f"Error en la solicitud: {str(e)}"}), 400

@pago_bp.route('/<int:pago_id>', methods=['PUT'])
def update_pago(pago_id):
    """
    Actualiza un pago existente
    """
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "No se proporcionaron datos"}), 400

        result, status_code = PagoService.update_pago(pago_id, data)
        return jsonify(result), status_code

    except Exception as e:
        return jsonify({"error": f"Error en la solicitud: {str(e)}"}), 400

@pago_bp.route('/<int:pago_id>/confirmar', methods=['PUT'])
def confirmar_pago(pago_id):
    """
    Confirma un pago (marca como CONFIRMADO)
    """
    try:
        data = request.get_json() or {}
        confirmado_por = data.get('confirmado_por')
        
        result, status_code = PagoService.confirmar_pago(pago_id, confirmado_por)
        return jsonify(result), status_code

    except Exception as e:
        return jsonify({"error": f"Error en la solicitud: {str(e)}"}), 400

@pago_bp.route('/<int:pago_id>/cancel', methods=['PUT'])
def cancel_pago(pago_id):
    """
    Cancela un pago (borrado lógico)
    """
    result, status_code = PagoService.cancel_pago(pago_id)
    return jsonify(result), status_code

@pago_bp.route('/inscripcion/<int:inscripcion_id>/generate-cuotas', methods=['POST'])
def generate_cuotas_inscripcion(inscripcion_id):
    """
    Genera automáticamente las cuotas de pago para una inscripción
    """
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "No se proporcionaron datos"}), 400

        required_fields = ['numero_cuotas', 'metodo_pago_id', 'confirmado_por']
        if not all(field in data for field in required_fields):
            return jsonify({"error": "Faltan campos requeridos: numero_cuotas, metodo_pago_id, confirmado_por"}), 400

        result, status_code = PagoService.generate_cuotas_inscripcion(
            inscripcion_id,
            data['numero_cuotas'],
            data['metodo_pago_id'],
            data['confirmado_por']
        )
        return jsonify(result), status_code

    except Exception as e:
        return jsonify({"error": f"Error en la solicitud: {str(e)}"}), 400

@pago_bp.route('/inscripciones-activas/detallado', methods=['GET'])
def get_inscripciones_activas_detallado():
    """
    Obtiene todas las inscripciones activas con información detallada:
    - Datos de la inscripción y persona
    - Información del paquete
    - Información de la oferta
    - Información del ciclo
    - Información de la subcategoría, categoría y programa
    - Lista completa de pagos asociados a cada inscripción
    """
    result, status_code = PagoService.get_inscripciones_activas_con_pagos()
    return jsonify(result), status_code