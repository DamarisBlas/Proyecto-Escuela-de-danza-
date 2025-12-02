from flask import Blueprint, request, jsonify
from src.services.metodo_pago_service import MetodoPagoService

metodo_pago_bp = Blueprint('metodo_pago', __name__, url_prefix='/metodos-pago')

@metodo_pago_bp.route('/', methods=['GET'])
def get_all_metodos_pago():
    """
    Obtiene todos los métodos de pago
    """
    result, status_code = MetodoPagoService.get_all_metodos_pago()
    return jsonify(result), status_code

@metodo_pago_bp.route('/<int:metodo_pago_id>', methods=['GET'])
def get_metodo_pago_by_id(metodo_pago_id):
    """
    Obtiene un método de pago por ID
    """
    result, status_code = MetodoPagoService.get_metodo_pago_by_id(metodo_pago_id)
    return jsonify(result), status_code

@metodo_pago_bp.route('/activos', methods=['GET'])
def get_active_metodos_pago():
    """
    Obtiene todos los métodos de pago activos
    """
    result, status_code = MetodoPagoService.get_active_metodos_pago()
    return jsonify(result), status_code

@metodo_pago_bp.route('/', methods=['POST'])
def create_metodo_pago():
    """
    Crea un nuevo método de pago
    
    Body JSON ejemplo:
    {
        "nombre_metodo": "Tarjeta de Crédito",
        "descripcion": "Pagos con tarjeta de crédito Visa/MasterCard"
    }
    """
    if not request.is_json:
        return jsonify({"error": "Content-Type debe ser application/json"}), 400
    
    metodo_pago_data = request.get_json()
    result, status_code = MetodoPagoService.create_metodo_pago(metodo_pago_data)
    return jsonify(result), status_code

@metodo_pago_bp.route('/<int:metodo_pago_id>', methods=['PUT'])
def update_metodo_pago(metodo_pago_id):
    """
    Actualiza un método de pago existente
    
    Body JSON ejemplo:
    {
        "nombre_metodo": "Transferencia Bancaria",
        "descripcion": "Pagos mediante transferencia bancaria"
    }
    """
    if not request.is_json:
        return jsonify({"error": "Content-Type debe ser application/json"}), 400
    
    metodo_pago_data = request.get_json()
    result, status_code = MetodoPagoService.update_metodo_pago(metodo_pago_id, metodo_pago_data)
    return jsonify(result), status_code

@metodo_pago_bp.route('/<int:metodo_pago_id>', methods=['DELETE'])
def delete_metodo_pago(metodo_pago_id):
    """
    Elimina un método de pago (borrado lógico)
    """
    result, status_code = MetodoPagoService.delete_metodo_pago(metodo_pago_id)
    return jsonify(result), status_code