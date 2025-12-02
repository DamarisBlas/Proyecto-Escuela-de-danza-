"""
Rutas para predicciones de Machine Learning
"""

from flask import Blueprint, request, jsonify
from src.services.ml_service import MLService

ml_bp = Blueprint('ml_bp', __name__)

@ml_bp.route('/predict/paquete', methods=['POST'])
def predict_compra_paquete():
    """
    Predice si un alumno comprará paquete
    
    Body ejemplo:
    {
        "Departamento": "LP",
        "Ciclo": 3,
        "Genero": "Femenino",
        "Proyecto": "Camino Femme",
        "Metodo de pago": "QR",
        "Descuento": "15%",
        "mes_inscripcion": 11,
        "modelo": "random_forest"
    }
    """
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "No se proporcionaron datos"}), 400
        
        model_type = data.pop('modelo', 'random_forest')
        
        result, status_code = MLService.predict_compra_paquete(data, model_type)
        return jsonify(result), status_code
    
    except Exception as e:
        return jsonify({"error": f"Error en la solicitud: {str(e)}"}), 400


@ml_bp.route('/predict/paquete/comparar', methods=['POST'])
def comparar_modelos_paquete():
    """
    Compara predicciones de Random Forest vs Regresión Logística para paquete
    
    Body: Mismo formato que /predict/paquete (sin campo "modelo")
    """
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "No se proporcionaron datos"}), 400
        
        result, status_code = MLService.comparar_modelos_paquete(data)
        return jsonify(result), status_code
    
    except Exception as e:
        return jsonify({"error": f"Error en la solicitud: {str(e)}"}), 400


@ml_bp.route('/health', methods=['GET'])
def health_check():
    """
    Verifica que los modelos ML estén disponibles
    """
    try:
        import os
        
        models_dir = 'src/ml/models'
        rf_exists = os.path.exists(f'{models_dir}/rf_paquete_classifier.pkl')
        lr_exists = os.path.exists(f'{models_dir}/lr_paquete_classifier.pkl')
        
        return jsonify({
            "status": "ok" if (rf_exists and lr_exists) else "models_missing",
            "models": {
                "random_forest_paquete": "disponible" if rf_exists else "no_entrenado",
                "logistic_regression_paquete": "disponible" if lr_exists else "no_entrenado"
            },
            "funcionalidad": "Predicción de compra de paquetes",
            "message": "Modelos listos" if (rf_exists and lr_exists) else "Entrena los modelos primero"
        }), 200
    
    except Exception as e:
        return jsonify({
            "status": "error",
            "error": str(e)
        }), 500
