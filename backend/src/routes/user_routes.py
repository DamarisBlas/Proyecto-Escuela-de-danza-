from flask import Blueprint, request, jsonify
from src.services.user_service import UserService
from src.services.persona_service import PersonaService

user_bp = Blueprint('user_bp', __name__)

@user_bp.route('/create', methods=['POST'])
def create_user():
    data = request.get_json() or {}
    try:
        result = UserService.create_user(data)
        persona = result['persona']
        alumno_id = result.get('alumno_id')

        if alumno_id:
            return jsonify({"message": "User created and classified as Alumno", "user_id": persona.id_persona, "alumno_id": alumno_id}), 201
        else:
            # User requested special role (profesor) - pending director approval
            return jsonify({"message": "User created, pending special role approval", "user_id": persona.id_persona}), 201
    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    except Exception as e:
        # Log the exception if you have logging setup (omitted here)
        return jsonify({"error": "Internal server error"}), 500

@user_bp.route('/personas', methods=['GET'])
def get_all_personas():
    """
    Obtiene todas las personas con campos específicos:
    - id_persona
    - nombre
    - apellido
    - email
    - celular
    - fecha_creacion
    - solicitud_user_especial
    - estado
    - tipo_cuenta
    - temporal
    """
    result, status_code = PersonaService.get_all_personas()
    return jsonify(result), status_code

@user_bp.route('/personas/<int:persona_id>', methods=['PUT'])
def update_persona(persona_id):
    """
    Actualiza una persona existente
    
    Campos permitidos para actualizar:
    - nombre (requerido)
    - apellido
    - email (debe ser único)
    - celular
    - solicitud_user_especial
    - estado
    - tipo_cuenta
    - temporal
    """
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "No se proporcionaron datos"}), 400

        result, status_code = PersonaService.update_persona(persona_id, data)
        return jsonify(result), status_code

    except Exception as e:
        return jsonify({"error": f"Error en la solicitud: {str(e)}"}), 400

@user_bp.route('/personas/<int:persona_id>/detalle', methods=['GET'])
def get_persona_detallada(persona_id):
    """
    Obtiene información detallada de una persona según su tipo_cuenta.
    
    Retorna:
    - Todos los campos de Persona (excepto password)
    - Campos específicos del rol correspondiente:
      * profesor: frase, descripcion, redes_sociales, cuidad, experiencia, signo, musica, estilos
      * alumno: departamento, estado_rol
      * alumno_femme: cumpleanos, signo, departamento, estado_rol
      * elenco: departamento, cumpleanos, signo, instagram, estado_rol
      * director: departamento, estado_rol
    """
    result, status_code = PersonaService.get_persona_detallada(persona_id)
    return jsonify(result), status_code






