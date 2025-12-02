"""
Predictor de asistencias usando modelos entrenados
"""

import joblib
import numpy as np
import os

class AsistenciaPredictor:
    def __init__(self, model_type='random_forest'):
        """
        Inicializa el predictor
        
        Args:
            model_type: 'random_forest' o 'logistic_regression'
        """
        self.model_type = model_type
        self.model = None
        self.scaler = None
        self.label_encoders = None
        self.feature_names = None
        
        self._load_models()
    
    def _load_models(self):
        """Carga los modelos y componentes guardados"""
        base_path = 'src/ml/models'
        
        try:
            # Cargar modelo según tipo
            if self.model_type == 'random_forest':
                model_path = f'{base_path}/random_forest_asistencias.pkl'
                self.model = joblib.load(model_path)
            else:
                model_path = f'{base_path}/logistic_regression_asistencias.pkl'
                self.model = joblib.load(model_path)
                # Regresión logística necesita scaler
                self.scaler = joblib.load(f'{base_path}/scaler_asistencias.pkl')
            
            # Cargar componentes comunes
            self.label_encoders = joblib.load(f'{base_path}/label_encoders_asistencias.pkl')
            self.feature_names = joblib.load(f'{base_path}/feature_names_asistencias.pkl')
            
            print(f"✅ Modelo {self.model_type} cargado correctamente")
            
        except Exception as e:
            print(f"❌ Error cargando modelos: {str(e)}")
            print("⚠️  Asegúrate de entrenar los modelos primero ejecutando train_asistencias.py")
    
    def predict(self, features_dict):
        """
        Predice si una persona asistirá a una clase
        
        Args:
            features_dict: Diccionario con las características de la clase
                Ejemplo: {
                    'Departamento': 'SCZ',
                    'Ciclo': 3,
                    'Dia': 'Domingo',
                    'Turno': 'Tarde',
                    'Hora Inicio': '15:00',
                    'Hora_Sesion': 1.5,
                    'Modalidad': 'Presencial',
                    'Nivel': 'Multinivel',
                    'Genero': 'Femenino',
                    'Proyecto': 'Camino Femme',
                    'Paquete': 'No',
                    'Cantidad clases': 0,
                    'Descuento': '0%',
                    'Metodo de pago': 'Efectivo'
                }
        
        Returns:
            dict: {'asistira': bool, 'probabilidad': float}
        """
        if self.model is None:
            return {'error': 'Modelo no cargado'}
        
        try:
            # Construir vector de features
            features = self._build_feature_vector(features_dict)
            
            # Predecir
            if self.model_type == 'logistic_regression':
                features = self.scaler.transform([features])
                prediction = self.model.predict(features)[0]
                probability = self.model.predict_proba(features)[0][1]
            else:
                prediction = self.model.predict([features])[0]
                probability = self.model.predict_proba([features])[0][1]
            
            return {
                'asistira': bool(prediction),
                'probabilidad': round(float(probability * 100), 2),
                'confianza': 'Alta' if probability > 0.7 or probability < 0.3 else 'Media'
            }
            
        except Exception as e:
            return {'error': f'Error en predicción: {str(e)}'}
    
    def _build_feature_vector(self, features_dict):
        """Construye el vector de features desde el diccionario"""
        feature_vector = []
        
        for feature_name in self.feature_names:
            if feature_name == 'Ciclo':
                feature_vector.append(features_dict.get('Ciclo', 0))
            
            elif feature_name == 'hora_inicio_minutos':
                hora = features_dict.get('Hora Inicio', '00:00')
                h, m = map(int, hora.split(':'))
                feature_vector.append(h * 60 + m)
            
            elif feature_name == 'Hora_Sesion':
                feature_vector.append(features_dict.get('Hora_Sesion', 1.5))
            
            elif feature_name == 'tiene_paquete':
                feature_vector.append(1 if features_dict.get('Paquete') == 'Si' else 0)
            
            elif feature_name == 'cantidad_clases_num':
                feature_vector.append(features_dict.get('Cantidad clases', 0))
            
            elif feature_name == 'descuento_porcentaje':
                desc = features_dict.get('Descuento', '0%')
                feature_vector.append(float(desc.replace('%', '')))
            
            elif feature_name.endswith('_encoded'):
                # Es una variable categórica codificada
                original_col = feature_name.replace('_encoded', '')
                value = features_dict.get(original_col, '')
                
                if original_col in self.label_encoders:
                    encoder = self.label_encoders[original_col]
                    try:
                        encoded_value = encoder.transform([str(value)])[0]
                    except:
                        # Si el valor no existe, usar el más común (0)
                        encoded_value = 0
                    feature_vector.append(encoded_value)
                else:
                    feature_vector.append(0)
        
        return feature_vector
    
    def predict_batch(self, features_list):
        """
        Predice para múltiples registros
        
        Args:
            features_list: Lista de diccionarios con features
        
        Returns:
            list: Lista de predicciones
        """
        results = []
        for features in features_list:
            result = self.predict(features)
            results.append(result)
        return results


# Ejemplo de uso
if __name__ == '__main__':
    # Crear predictor
    predictor = AsistenciaPredictor(model_type='random_forest')
    
    # Ejemplo de predicción
    alumno_ejemplo = {
        'Departamento': 'SCZ',
        'Ciclo': 3,
        'Dia': 'Domingo',
        'Turno': 'Tarde',
        'Hora Inicio': '15:00',
        'Hora_Sesion': 1.5,
        'Modalidad': 'Presencial',
        'Nivel': 'Multinivel',
        'Genero': 'Femenino',
        'Proyecto': 'Camino Femme',
        'Paquete': 'No',
        'Cantidad clases': 0,
        'Descuento': '0%',
        'Metodo de pago': 'Efectivo'
    }
    
    resultado = predictor.predict(alumno_ejemplo)
    print("\n📊 Predicción de asistencia:")
    print(f"   Asistirá: {resultado.get('asistira')}")
    print(f"   Probabilidad: {resultado.get('probabilidad')}%")
    print(f"   Confianza: {resultado.get('confianza')}")
