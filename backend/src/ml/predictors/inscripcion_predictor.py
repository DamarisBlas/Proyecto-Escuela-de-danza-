"""
Predictor de inscripciones usando modelos entrenados
"""

import joblib
import numpy as np
import os

class InscripcionPredictor:
    def __init__(self, model_type='random_forest'):
        """
        Inicializa el predictor de inscripciones
        
        Args:
            model_type: 'random_forest' o 'logistic_regression'
        """
        self.model_type = model_type
        self.model = None
        self.scaler = None
        self.label_encoders = None
        
        self._load_models()
    
    def _load_models(self):
        """Carga los modelos entrenados"""
        base_path = 'src/ml/models'
        
        try:
            # Cargar modelo según tipo
            if self.model_type == 'random_forest':
                model_path = f'{base_path}/rf_paquete_classifier.pkl'
                self.model = joblib.load(model_path)
            else:
                model_path = f'{base_path}/lr_paquete_classifier.pkl'
                self.model = joblib.load(model_path)
            
            # Cargar componentes
            self.scaler = joblib.load(f'{base_path}/scaler_inscripciones.pkl')
            self.label_encoders = joblib.load(f'{base_path}/label_encoders_inscripciones.pkl')
            
            print(f"✅ Modelo {self.model_type} cargado")
            
        except Exception as e:
            print(f"❌ Error cargando modelo: {str(e)}")
    
    def predict_compra_paquete(self, alumno_data):
        """
        Predice si un alumno comprará paquete
        
        Args:
            alumno_data: {
                'Departamento': 'LP',
                'Ciclo': 3,
                'Genero': 'Femenino',
                'Proyecto': 'Camino Femme',
                'Metodo de pago': 'QR',
                'Descuento': '15%',
                'mes_inscripcion': 11
            }
        
        Returns:
            dict: {'comprara_paquete': bool, 'probabilidad': float, 'confianza': str}
        """
        if self.model is None:
            return {'error': 'Modelo no cargado'}
        
        try:
            # Construir features
            features = []
            
            # Ciclo
            features.append(alumno_data.get('Ciclo', 1))
            
            # Departamento (codificado)
            dept = alumno_data.get('Departamento', 'LP')
            if 'Departamento' in self.label_encoders:
                try:
                    dept_encoded = self.label_encoders['Departamento'].transform([dept])[0]
                except:
                    dept_encoded = 0
            else:
                dept_encoded = 0
            features.append(dept_encoded)
            
            # Proyecto (codificado)
            proyecto = alumno_data.get('Proyecto', 'Camino Femme')
            if 'Proyecto' in self.label_encoders:
                try:
                    proyecto_encoded = self.label_encoders['Proyecto'].transform([proyecto])[0]
                except:
                    proyecto_encoded = 0
            else:
                proyecto_encoded = 0
            features.append(proyecto_encoded)
            
            # Genero (codificado)
            genero = alumno_data.get('Genero', 'Femenino')
            if 'Genero' in self.label_encoders:
                try:
                    genero_encoded = self.label_encoders['Genero'].transform([genero])[0]
                except:
                    genero_encoded = 0
            else:
                genero_encoded = 0
            features.append(genero_encoded)
            
            # Metodo de pago (codificado)
            metodo = alumno_data.get('Metodo de pago', 'QR')
            if 'Metodo de pago' in self.label_encoders:
                try:
                    metodo_encoded = self.label_encoders['Metodo de pago'].transform([metodo])[0]
                except:
                    metodo_encoded = 0
            else:
                metodo_encoded = 0
            features.append(metodo_encoded)
            
            # Descuento
            descuento_str = alumno_data.get('Descuento', '0%')
            descuento = float(descuento_str.replace('%', ''))
            features.append(descuento)
            
            # Mes inscripción
            features.append(alumno_data.get('mes_inscripcion', 1))
            
            # Predecir
            features_array = np.array([features])
            
            if self.model_type == 'logistic_regression':
                features_array = self.scaler.transform(features_array)
            
            prediction = self.model.predict(features_array)[0]
            probability = self.model.predict_proba(features_array)[0][1]
            
            return {
                'comprara_paquete': bool(prediction),
                'probabilidad': round(float(probability * 100), 2),
                'confianza': 'Alta' if probability > 0.7 or probability < 0.3 else 'Media',
                'recomendacion': self._get_recomendacion(bool(prediction), probability)
            }
            
        except Exception as e:
            return {'error': f'Error en predicción: {str(e)}'}
    
    def _get_recomendacion(self, comprara, probabilidad):
        """Genera recomendación basada en predicción"""
        if comprara and probabilidad > 0.7:
            return "Alta probabilidad de comprar paquete. Ofrecer opciones de paquete."
        elif comprara:
            return "Probable que compre paquete. Mencionar beneficios."
        elif not comprara and probabilidad < 0.3:
            return "Baja probabilidad de comprar paquete. Enfocarse en clases individuales."
        else:
            return "Probabilidad media. Presentar ambas opciones."


# Ejemplo de uso
if __name__ == '__main__':
    predictor = InscripcionPredictor(model_type='random_forest')
    
    # Ejemplo 1: Alumna de LP
    alumna_lp = {
        'Departamento': 'LP',
        'Ciclo': 3,
        'Genero': 'Femenino',
        'Proyecto': 'Camino Femme',
        'Metodo de pago': 'QR',
        'Descuento': '15%',
        'mes_inscripcion': 11
    }
    
    resultado = predictor.predict_compra_paquete(alumna_lp)
    print("\n📊 Predicción Alumna LP:")
    print(f"   Comprará paquete: {resultado.get('comprara_paquete')}")
    print(f"   Probabilidad: {resultado.get('probabilidad')}%")
    print(f"   Confianza: {resultado.get('confianza')}")
    print(f"   Recomendación: {resultado.get('recomendacion')}")
    
    # Ejemplo 2: Alumna de OR
    alumna_or = {
        'Departamento': 'OR',
        'Ciclo': 2,
        'Genero': 'Femenino',
        'Proyecto': 'Camino Femme',
        'Metodo de pago': 'Efectivo',
        'Descuento': '0%',
        'mes_inscripcion': 8
    }
    
    resultado2 = predictor.predict_compra_paquete(alumna_or)
    print("\n📊 Predicción Alumna OR:")
    print(f"   Comprará paquete: {resultado2.get('comprara_paquete')}")
    print(f"   Probabilidad: {resultado2.get('probabilidad')}%")
    print(f"   Confianza: {resultado2.get('confianza')}")
    print(f"   Recomendación: {resultado2.get('recomendacion')}")
