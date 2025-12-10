"""
Servicio de Machine Learning
Escuela de Danza - Predicción de Demanda de Cursos

Este servicio coordina:
1. Entrenamiento de modelos
2. Predicciones
3. Evaluación y comparación
4. Gestión de modelos guardados
"""

import pandas as pd
import numpy as np
from datetime import datetime
import os
import sys

# Agregar path del proyecto
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(__file__))))

from src.ml.preprocessing import DataPreprocessor
from src.ml.eda import run_complete_eda
from src.ml.random_forest_model import RandomForestModel
from src.ml.logistic_regression_model import LogisticRegressionModel
from src.ml.model_comparison import compare_models
from src.ml.historical_validation import perform_historical_validation
from src.app import db


class MLService:
    """
    Servicio principal de Machine Learning
    """
    
    def __init__(self):
        """
        Inicializa el servicio ML
        """
        self.rf_model = None
        self.lr_model = None
        self.preprocessor = None
        self.rf_metrics = None
        self.lr_metrics = None
        self.comparison_report = None
        self.last_training = None
        
    def is_model_loaded(self):
        """
        Verifica si hay modelos cargados
        
        Retorna:
            bool: True si hay modelos disponibles
        """
        return self.rf_model is not None and self.lr_model is not None
    
    def train_models(self, test_size=0.2, cv_folds=5):
        """
        Entrena ambos modelos (Random Forest y Logistic Regression)
        
        Parámetros:
            test_size: Proporción de datos para test (default 0.2)
            cv_folds: Número de folds para validación cruzada (default 5)
            
        Retorna:
            Dict con resultados de entrenamiento
        """
        print("\n" + "="*80)
        print("🚀 INICIANDO PIPELINE COMPLETO DE MACHINE LEARNING")
        print("="*80 + "\n")
        
        # 1. Preprocesamiento de datos
        print("PASO 1: Preprocesamiento de datos")
        print("-"*80)
        
        self.preprocessor = DataPreprocessor()
        X_preprocessed, y_preprocessed, df_preprocessed = self.preprocessor.full_preprocessing_pipeline()
        
        if df_preprocessed is None or len(df_preprocessed) == 0:
            raise ValueError("No se pudieron obtener datos para entrenamiento")
        
        print(f"✅ Datos preprocesados: {len(df_preprocessed)} registros\n")
        
        # 2. Análisis Exploratorio de Datos (EDA)
        print("\nPASO 2: Análisis Exploratorio de Datos (EDA)")
        print("-"*80)
        
        # 2. Análisis Exploratorio de Datos (EDA)
        print("\nPASO 2: Análisis Exploratorio de Datos (EDA)")
        print("-"*80)
        
        eda_results = run_complete_eda(df_preprocessed)
        
        # 3. Preparar features y target (ya los tenemos del preprocessing)
        print("\nPASO 3: Preparación de features y target")
        print("-"*80)
        
        X, y = X_preprocessed, y_preprocessed
        feature_names = X.columns.tolist() if hasattr(X, 'columns') else [f"feature_{i}" for i in range(X.shape[1])]
        print(f"Features: {len(feature_names)}")
        print(f"Registros: {len(X)}")
        
        # Split train/test
        from sklearn.model_selection import train_test_split
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=test_size, random_state=42, stratify=y
        )
        
        print(f"Training set: {len(X_train)} muestras")
        print(f"Test set: {len(X_test)} muestras")
        print(f"Features: {len(feature_names)}\n")
        
        # 4. Entrenar Random Forest
        print("\nPASO 4: Entrenamiento de Random Forest")
        print("-"*80)
        
        self.rf_model = RandomForestModel(
            n_estimators=100,
            max_depth=10,
            random_state=42
        )
        
        rf_cv_metrics = self.rf_model.train_with_cross_validation(
            X_train, y_train,
            feature_names=feature_names,
            cv=cv_folds
        )
        
        rf_test_metrics = self.rf_model.evaluate(X_test, y_test, dataset_name="Test")
        
        self.rf_metrics = {
            'cross_validation': rf_cv_metrics,
            'test_evaluation': rf_test_metrics
        }
        
        # Guardar modelo RF
        self.rf_model.save_model('models/random_forest_model.pkl')
        
        # 5. Entrenar Logistic Regression
        print("\nPASO 5: Entrenamiento de Logistic Regression")
        print("-"*80)
        
        self.lr_model = LogisticRegressionModel(
            max_iter=1000,
            random_state=42
        )
        
        lr_cv_metrics = self.lr_model.train_with_cross_validation(
            X_train, y_train,
            feature_names=feature_names,
            cv=cv_folds,
            scale_features=True
        )
        
        lr_test_metrics = self.lr_model.evaluate(X_test, y_test, dataset_name="Test")
        
        self.lr_metrics = {
            'cross_validation': lr_cv_metrics,
            'test_evaluation': lr_test_metrics
        }
        
        # Guardar modelo LR
        self.lr_model.save_model('models/logistic_regression_model.pkl')
        
        # 6. Comparar modelos
        print("\nPASO 6: Comparación de modelos")
        print("-"*80)
        
        comparison, report = compare_models(
            self.rf_model, self.rf_metrics,
            self.lr_model, self.lr_metrics
        )
        
        self.comparison_report = report
        
        # 7. Validación histórica
        print("\nPASO 7: Validación histórica")
        print("-"*80)
        
        # Usar el modelo recomendado para validación histórica
        recommended_model_name = report['recommendation']['recommended_model']
        
        if recommended_model_name == 'Random Forest':
            validation_model = self.rf_model
        else:
            validation_model = self.lr_model
        
        validator, validation_results = perform_historical_validation(
            validation_model,
            df_preprocessed,
            target_col='demanda'
        )
        
        # Guardar timestamp
        self.last_training = datetime.now().isoformat()
        
        # Resumen final
        print("\n" + "="*80)
        print("✅ PIPELINE DE ML COMPLETADO EXITOSAMENTE")
        print("="*80)
        print(f"\nModelos entrenados y guardados:")
        print(f"  • Random Forest: models/random_forest_model.pkl")
        print(f"  • Logistic Regression: models/logistic_regression_model.pkl")
        print(f"\nModelo recomendado: {recommended_model_name}")
        print(f"Timestamp: {self.last_training}")
        print("="*80 + "\n")
        
        return {
            'status': 'success',
            'message': 'Modelos entrenados exitosamente',
            'timestamp': self.last_training,
            'recommended_model': recommended_model_name,
            'metrics': {
                'random_forest': self.rf_metrics,
                'logistic_regression': self.lr_metrics
            },
            'comparison': comparison.export_to_dict(),
            'historical_validation': validator.get_results_summary()
        }
    
    def predict(self, data):
        """
        Realiza predicción de demanda
        
        Parámetros:
            data: Dict con características de la inscripción
            
        Retorna:
            Dict con predicción y probabilidades
        """
        if not self.is_model_loaded():
            # Intentar cargar modelos guardados
            try:
                self.rf_model = RandomForestModel.load_model()
                self.lr_model = LogisticRegressionModel.load_model()
            except:
                raise ValueError("No hay modelos disponibles. Entrene los modelos primero.")
        
        # Validar datos de entrada
        required_fields = [
            'tipo_cuenta', 'nombre_subcategoria', 'nombre_categoria',
            'programa_nombre', 'mes_inscripcion', 'anio_inscripcion',
            'dia_semana_inscripcion', 'cantidad_clases', 'precio_final',
            'precio_paquete', 'estado_pago'
        ]
        
        for field in required_fields:
            if field not in data:
                raise ValueError(f"Campo requerido faltante: {field}")
        
        # Convertir a DataFrame
        df_input = pd.DataFrame([data])
        
        # Usar Random Forest como modelo principal
        prediction = self.rf_model.predict(df_input)[0]
        probabilities = self.rf_model.predict_proba(df_input)[0]
        
        # Obtener nombres de clases
        class_names = self.rf_model.model.classes_
        
        # Crear dict de probabilidades
        prob_dict = {
            class_name: float(prob)
            for class_name, prob in zip(class_names, probabilities)
        }
        
        return {
            'prediccion': prediction,
            'probabilidades': prob_dict,
            'modelo_usado': 'Random Forest',
            'confianza': float(max(probabilities)),
            'timestamp': datetime.now().isoformat()
        }
    
    def get_metrics(self, model_name=None):
        """
        Obtiene métricas de modelos
        
        Parámetros:
            model_name: "random_forest", "logistic_regression" o None (ambos)
            
        Retorna:
            Dict con métricas
        """
        if not self.is_model_loaded():
            raise ValueError("No hay modelos cargados")
        
        if model_name == 'random_forest':
            return {'random_forest': self.rf_metrics}
        elif model_name == 'logistic_regression':
            return {'logistic_regression': self.lr_metrics}
        else:
            return {
                'random_forest': self.rf_metrics,
                'logistic_regression': self.lr_metrics
            }
    
    def get_comparison(self):
        """
        Obtiene comparación de modelos
        
        Retorna:
            Dict con comparación
        """
        if not self.is_model_loaded():
            raise ValueError("No hay modelos para comparar")
        
        if self.comparison_report is None:
            # Generar comparación si no existe
            comparison, report = compare_models(
                self.rf_model, self.rf_metrics,
                self.lr_model, self.lr_metrics
            )
            self.comparison_report = report
        
        return self.comparison_report
    
    def get_feature_importance(self):
        """
        Obtiene importancia de características del Random Forest
        
        Retorna:
            List de features con importancia
        """
        if self.rf_model is None:
            raise ValueError("Random Forest no está entrenado")
        
        if self.rf_model.feature_importance is None:
            return []
        
        return self.rf_model.feature_importance.to_dict('records')
    
    def get_status(self):
        """
        Obtiene estado del servicio ML
        
        Retorna:
            Dict con estado
        """
        models_available = []
        
        if self.rf_model is not None:
            models_available.append('Random Forest')
        
        if self.lr_model is not None:
            models_available.append('Logistic Regression')
        
        return {
            'models_loaded': self.is_model_loaded(),
            'models_available': models_available,
            'last_training': self.last_training,
            'ready_for_predictions': self.is_model_loaded()
        }

    
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
