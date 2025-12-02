from flask import Blueprint, request, jsonify
from src.services.auth_service import AuthService

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/login', methods=['POST'])
def login():
    """
    Endpoint para login de usuarios
    """
    try:
        data = request.get_json()
        
        # Validar datos requeridos
        if not data or not data.get('email') or not data.get('password'):
            return jsonify({"error": "Email y password son requeridos"}), 400
        
        # Intentar hacer login
        result, status_code = AuthService.login(data['email'], data['password'])
        
        return jsonify(result), status_code
        
    except Exception as e:
        return jsonify({"error": f"Error interno del servidor: {str(e)}"}), 500


@auth_bp.route('/change-password', methods=['PUT'])
def change_password():
    """
    Endpoint para cambiar la contraseña de un usuario
    
    Body JSON esperado:
    {
        "id_persona": 123,
        "old_password": "contraseña_actual",
        "new_password": "nueva_contraseña"
    }
    """
    try:
        data = request.get_json()
        
        # Validar datos requeridos
        if not data:
            return jsonify({"error": "Datos requeridos"}), 400
        
        id_persona = data.get('id_persona')
        old_password = data.get('old_password')
        new_password = data.get('new_password')
        
        if not id_persona:
            return jsonify({"error": "id_persona es requerido"}), 400
        
        if not old_password:
            return jsonify({"error": "old_password es requerida"}), 400
        
        if not new_password:
            return jsonify({"error": "new_password es requerida"}), 400
        
        # Llamar al servicio para cambiar la contraseña
        result, status_code = AuthService.change_password(id_persona, old_password, new_password)
        
        return jsonify(result), status_code
        
    except Exception as e:
        return jsonify({"error": f"Error interno del servidor: {str(e)}"}), 500