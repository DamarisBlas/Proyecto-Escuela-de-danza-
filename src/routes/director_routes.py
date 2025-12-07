from flask import Blueprint, request, jsonify
from src.services.director_service import DirectorService

director_bp = Blueprint('director', __name__)

@director_bp.route('/create', methods=['POST'])
def create_director():
    """
    Endpoint para crear un nuevo director
    """
    try:
        data = request.get_json()
        
        # Validar datos requeridos
        required_fields = ['nombre', 'email', 'password']
        if not data or not all(field in data for field in required_fields):
            return jsonify({"error": "Nombre, email y password son requeridos"}), 400
        
        # Crear director
        result, status_code = DirectorService.create_director(data)
        
        return jsonify(result), status_code
        
    except Exception as e:
        return jsonify({"error": f"Error interno del servidor: {str(e)}"}), 500