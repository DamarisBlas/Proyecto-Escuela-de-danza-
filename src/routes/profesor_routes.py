from flask import Blueprint, request, jsonify
from src.services.profesor_service import ProfesorService

profesor_bp = Blueprint('profesor', __name__)

@profesor_bp.route('/', methods=['GET'])
def get_profesores():
    """
    Obtiene todos los profesores (temporales y permanentes)
    """
    try:
        result, status_code = ProfesorService.get_all_profesores()
        return jsonify(result), status_code
    except Exception as e:
        return jsonify({"error": f"Error interno del servidor: {str(e)}"}), 500

@profesor_bp.route('/active', methods=['GET'])
def get_active_profesores():
    """
    Obtiene todos los profesores activos
    """
    try:
        result, status_code = ProfesorService.get_profesores_activos()
        return jsonify(result), status_code
    except Exception as e:
        return jsonify({"error": f"Error interno del servidor: {str(e)}"}), 500

@profesor_bp.route('/temporales', methods=['GET'])
def get_temporales():
    """
    Obtiene todos los profesores temporales
    """
    try:
        result, status_code = ProfesorService.get_profesores_temporales()
        return jsonify(result), status_code
    except Exception as e:
        return jsonify({"error": f"Error interno del servidor: {str(e)}"}), 500

@profesor_bp.route('/<int:profesor_id>', methods=['GET'])
def get_profesor(profesor_id):
    """
    Obtiene un profesor por ID
    """
    try:
        result, status_code = ProfesorService.get_profesor_by_id(profesor_id)
        return jsonify(result), status_code
    except Exception as e:
        return jsonify({"error": f"Error interno del servidor: {str(e)}"}), 500

@profesor_bp.route('/persona/<int:persona_id>', methods=['GET'])
def get_profesor_by_persona_id(persona_id):
    """
    Busca si una persona es profesor y devuelve sus datos
    
    Si la persona no tiene registro en la tabla profesor,
    significa que no es un profesor registrado
    """
    try:
        result, status_code = ProfesorService.get_profesor_by_persona_id(persona_id)
        return jsonify(result), status_code
    except Exception as e:
        return jsonify({"error": f"Error interno del servidor: {str(e)}"}), 500

@profesor_bp.route('/temporal', methods=['POST'])
def create_profesor_temporal():
    """
    Crea un profesor temporal (sin cuenta de usuario)
    
    Body esperado:
    {
        "nombre": "Juan Pérez",
        "cuidad": "Santa Cruz",
        "redes_sociales": "instagram: @juanperez",
        "frase": "Bailar es vivir",
        "descripcion": "Instructor de salsa con 5 años de experiencia",
        "experiencia": 5,
        "estilos": "Salsa,Bachata"
    }
    """
    try:
        data = request.get_json()

        # Validar campo requerido
        if not data or not data.get('nombre'):
            return jsonify({"error": "El nombre es requerido"}), 400

        result, status_code = ProfesorService.create_profesor_temporal(data)
        return jsonify(result), status_code

    except Exception as e:
        return jsonify({"error": f"Error interno del servidor: {str(e)}"}), 500

@profesor_bp.route('/<int:profesor_id>', methods=['PUT'])
def update_profesor(profesor_id):
    """
    Actualiza un profesor
    
    Body esperado (todos los campos son opcionales):
    {
        "nombre": "Juan Carlos",
        "apellido": "Pérez López",
        "cuidad": "La Paz",
        "redes_sociales": "instagram: @juancarlos",
        "frase": "Nueva frase",
        "descripcion": "Nueva descripción",
        "experiencia": 6,
        "estilos": "Salsa,Bachata,Kizomba"
    }
    """
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "Datos requeridos"}), 400

        result, status_code = ProfesorService.update_profesor(profesor_id, data)
        return jsonify(result), status_code

    except Exception as e:
        return jsonify({"error": f"Error interno del servidor: {str(e)}"}), 500

@profesor_bp.route('/<int:profesor_id>', methods=['DELETE'])
def delete_profesor(profesor_id):
    """
    Elimina un profesor de forma lógica (estado = false)
    """
    try:
        result, status_code = ProfesorService.delete_profesor(profesor_id)
        return jsonify(result), status_code

    except Exception as e:
        return jsonify({"error": f"Error interno del servidor: {str(e)}"}), 500
