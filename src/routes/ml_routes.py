"""
Rutas Flask para Machine Learning
Escuela de Danza - Predicción de Demanda de Cursos

Endpoints:
- POST /ml/predict - Hacer predicción de demanda
- GET /ml/metrics - Ver métricas de modelos
- GET /ml/comparison - Comparación de modelos
- POST /ml/train - Re-entrenar modelos
"""

from flask import Blueprint, request, jsonify
from src.services.ml_service import MLService
import logging

ml_bp = Blueprint('ml_bp', __name__)
logger = logging.getLogger(__name__)

# Inicializar servicio ML (singleton)
ml_service = MLService()


@ml_bp.route('/predict', methods=['POST'])
def predict_demand():
    """
    Realiza predicción de demanda para un curso
    
    Body JSON:
    {
        "tipo_cuenta": "NUEVO",
        "nombre_subcategoria": "Ballet Clásico",
        "nombre_categoria": "Ballet",
        "programa_nombre": "Programa Infantil",
        "mes_inscripcion": 3,
        "anio_inscripcion": 2025,
        "dia_semana_inscripcion": 2,
        "cantidad_clases": 12,
        "precio_final": 150.00,
        "precio_paquete": 180.00,
        "estado_pago": "PAGADO"
    }
    
    Retorna:
    {
        "prediccion": "ALTA",
        "probabilidades": {
            "BAJA": 0.15,
            "MEDIA": 0.25,
            "ALTA": 0.60
        },
        "modelo_usado": "Random Forest"
    }
    """
    try:
        # Obtener datos del request
        data = request.get_json()
        
        if not data:
            return jsonify({
                'error': 'No se proporcionaron datos para predicción'
            }), 400
        
        # Verificar que el modelo esté cargado
        if not ml_service.is_model_loaded():
            return jsonify({
                'error': 'Modelo no disponible. Entrene el modelo primero con POST /ml/train'
            }), 503
        
        # Hacer predicción
        result = ml_service.predict(data)
        
        return jsonify(result), 200
        
    except ValueError as e:
        logger.error(f"Error de validación en predicción: {str(e)}")
        return jsonify({
            'error': f'Error de validación: {str(e)}'
        }), 400
        
    except Exception as e:
        logger.error(f"Error en predicción: {str(e)}")
        return jsonify({
            'error': f'Error interno del servidor: {str(e)}'
        }), 500


@ml_bp.route('/metrics', methods=['GET'])
def get_metrics():
    """
    Obtiene métricas de los modelos entrenados
    
    Query params:
    - model: "random_forest" o "logistic_regression" (opcional, devuelve ambos si se omite)
    
    Retorna:
    {
        "random_forest": {
            "cross_validation": {...},
            "test": {...},
            "feature_importance": [...]
        },
        "logistic_regression": {
            "cross_validation": {...},
            "test": {...}
        }
    }
    """
    try:
        model_name = request.args.get('model', None)
        
        # Verificar que haya modelos entrenados
        if not ml_service.is_model_loaded():
            return jsonify({
                'error': 'No hay modelos entrenados. Entrene los modelos primero con POST /ml/train'
            }), 404
        
        # Obtener métricas
        metrics = ml_service.get_metrics(model_name)
        
        return jsonify(metrics), 200
        
    except ValueError as e:
        return jsonify({
            'error': str(e)
        }), 400
        
    except Exception as e:
        logger.error(f"Error obteniendo métricas: {str(e)}")
        return jsonify({
            'error': f'Error interno del servidor: {str(e)}'
        }), 500


@ml_bp.route('/comparison', methods=['GET'])
def get_model_comparison():
    """
    Obtiene comparación detallada entre Random Forest y Logistic Regression
    
    Retorna:
    {
        "timestamp": "2025-01-...",
        "models": [...],
        "recommendation": {...}
    }
    """
    try:
        if not ml_service.is_model_loaded():
            return jsonify({
                'error': 'No hay modelos para comparar. Entrene los modelos primero con POST /ml/train'
            }), 404
        
        comparison = ml_service.get_comparison()
        return jsonify(comparison), 200
        
    except Exception as e:
        logger.error(f"Error en comparación de modelos: {str(e)}")
        return jsonify({
            'error': f'Error interno del servidor: {str(e)}'
        }), 500


@ml_bp.route('/train', methods=['POST'])
def train_models():
    """
    Entrena o re-entrena los modelos de Machine Learning
    
    Body JSON (opcional):
    {
        "force_retrain": true,
        "test_size": 0.2,
        "cv_folds": 5
    }
    """
    try:
        data = request.get_json() or {}
        force_retrain = data.get('force_retrain', False)
        test_size = data.get('test_size', 0.2)
        cv_folds = data.get('cv_folds', 5)
        
        if not (0 < test_size < 1):
            return jsonify({'error': 'test_size debe estar entre 0 y 1'}), 400
        
        if cv_folds < 2:
            return jsonify({'error': 'cv_folds debe ser al menos 2'}), 400
        
        if ml_service.is_model_loaded() and not force_retrain:
            return jsonify({
                'error': 'Ya existen modelos entrenados. Use force_retrain=true para re-entrenar'
            }), 409
        
        logger.info("Iniciando entrenamiento de modelos ML...")
        result = ml_service.train_models(test_size=test_size, cv_folds=cv_folds)
        
        return jsonify(result), 200
        
    except Exception as e:
        logger.error(f"Error entrenando modelos: {str(e)}")
        return jsonify({'error': f'Error interno del servidor: {str(e)}'}), 500


@ml_bp.route('/status', methods=['GET'])
def get_status():
    """
    Obtiene el estado del sistema de ML
    """
    try:
        status = ml_service.get_status()
        return jsonify(status), 200
        
    except Exception as e:
        logger.error(f"Error obteniendo status: {str(e)}")
        return jsonify({'error': f'Error interno del servidor: {str(e)}'}), 500


@ml_bp.route('/feature-importance', methods=['GET'])
def get_feature_importance():
    """
    Obtiene la importancia de características del modelo Random Forest
    """
    try:
        if not ml_service.is_model_loaded():
            return jsonify({'error': 'Modelo no disponible'}), 404
        
        importance = ml_service.get_feature_importance()
        return jsonify({'features': importance}), 200
        
    except Exception as e:
        logger.error(f"Error obteniendo feature importance: {str(e)}")
        return jsonify({'error': f'Error interno del servidor: {str(e)}'}), 500


@ml_bp.route('/health', methods=['GET'])
def health_check():
    """
    Verifica que los modelos ML estén disponibles
    """
    try:
        status = ml_service.get_status()
        return jsonify({
            "status": "ok" if status.get('models_loaded') else "models_missing",
            "models_loaded": status.get('models_loaded', False),
            "models_available": status.get('models_available', []),
            "ready_for_predictions": status.get('ready_for_predictions', False),
            "message": "Modelos listos" if status.get('models_loaded') else "Entrene los modelos primero con POST /ml/train"
        }), 200
    
    except Exception as e:
        return jsonify({"status": "error", "error": str(e)}), 500

