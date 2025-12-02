"""
Servicio ML para exponer predicciones al frontend
"""

from src.ml.predictors.inscripcion_predictor import InscripcionPredictor

class MLService:
    """
    Servicio para predicciones de Machine Learning
    """
    
    @staticmethod
    def predict_compra_paquete(data, model_type='random_forest'):
        """
        Predice si un alumno comprará paquete
        
        Args:
            data: {
                'Departamento': 'LP',
                'Ciclo': 3,
                'Genero': 'Femenino',
                'Proyecto': 'Camino Femme',
                'Metodo de pago': 'QR',
                'Descuento': '15%',
                'mes_inscripcion': 11
            }
            model_type: 'random_forest' o 'logistic_regression'
        
        Returns:
            (dict, int): Resultado y código HTTP
        """
        try:
            predictor = InscripcionPredictor(model_type=model_type)
            resultado = predictor.predict_compra_paquete(data)
            
            if 'error' in resultado:
                return {"error": resultado['error']}, 400
            
            return {
                "prediccion": resultado,
                "modelo_usado": model_type,
                "interpretacion": {
                    "mensaje": f"{'Sí' if resultado['comprara_paquete'] else 'No'} comprará paquete",
                    "probabilidad_texto": f"{resultado['probabilidad']}% de probabilidad",
                    "nivel_confianza": resultado['confianza']
                }
            }, 200
            
        except Exception as e:
            return {"error": f"Error en predicción: {str(e)}"}, 500
    
    @staticmethod
    def comparar_modelos_paquete(data):
        """
        Compara predicciones de ambos modelos para compra de paquete
        
        Args:
            data: Datos del alumno
        
        Returns:
            (dict, int): Comparación de modelos
        """
        try:
            # Random Forest
            rf_predictor = InscripcionPredictor(model_type='random_forest')
            rf_result = rf_predictor.predict_compra_paquete(data)
            
            # Logistic Regression
            lr_predictor = InscripcionPredictor(model_type='logistic_regression')
            lr_result = lr_predictor.predict_compra_paquete(data)
            
            return {
                "random_forest": rf_result,
                "logistic_regression": lr_result,
                "coinciden": rf_result.get('comprara_paquete') == lr_result.get('comprara_paquete'),
                "diferencia_probabilidad": abs(rf_result.get('probabilidad', 0) - lr_result.get('probabilidad', 0))
            }, 200
            
        except Exception as e:
            return {"error": f"Error comparando modelos: {str(e)}"}, 500
