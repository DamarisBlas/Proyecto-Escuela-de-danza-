"""
Script de entrenamiento para predecir asistencias usando datos históricos de Excel

Compara Random Forest vs Regresión Logística
"""

import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.ensemble import RandomForestClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.preprocessing import LabelEncoder, StandardScaler
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, confusion_matrix, classification_report
import joblib
import os

class AsistenciaTrainer:
    def __init__(self, excel_path):
        """
        Inicializa el entrenador de modelos de asistencia
        
        Args:
            excel_path: Ruta al archivo Excel con datos históricos
        """
        self.excel_path = excel_path
        self.df = None
        self.X_train = None
        self.X_test = None
        self.y_train = None
        self.y_test = None
        self.scaler = StandardScaler()
        self.label_encoders = {}
        
        # Modelos
        self.rf_model = None
        self.lr_model = None
    
    def load_data(self):
        """Carga los datos desde Excel"""
        print("📊 Cargando datos desde Excel...")
        self.df = pd.read_excel(self.excel_path)
        print(f"✅ Datos cargados: {len(self.df)} registros")
        print(f"📋 Columnas disponibles: {list(self.df.columns)}")
        return self.df
    
    def prepare_features(self):
        """
        Prepara las características desde los datos del Excel
        
        Características basadas en tu Excel:
        - Departamento (SCZ, OR)
        - Ciclo (número)
        - Día de la semana (Domingo, Sábado, etc)
        - Turno (Tarde, Mañana, Noche)
        - Hora de inicio
        - Duración (Hora_Sesion)
        - Modalidad (Presencial)
        - Nivel (Multinivel, Principiante)
        - Género (Femenino)
        - Proyecto (Camino Femme, Taller, Intensivo)
        - Tiene paquete (Si/No)
        - Cantidad de clases del paquete
        - Descuento aplicado
        - Método de pago (Efectivo, QR, En Puertas)
        """
        print("\n🔧 Preparando características...")
        
        df_features = self.df.copy()
        
        # TARGET: Determinar si asistió o no
        # Basado en tu Excel, si tiene "Monto" significa que asistió y pagó
        if 'Monto' in df_features.columns:
            df_features['asistio'] = df_features['Monto'].notna().astype(int)
        else:
            # Si no hay columna Monto, usar otra lógica
            print("⚠️  No se encontró columna 'Monto'. Usando otra lógica para asistencia.")
            df_features['asistio'] = 1  # Temporal
        
        # Convertir columnas categóricas a numéricas
        categorical_columns = ['Departamento', 'Dia', 'Turno', 'Modalidad', 'Nivel', 
                              'Profesor', 'Genero', 'Proyecto', 'Sede Profesor',
                              'Metodo de pago']
        
        for col in categorical_columns:
            if col in df_features.columns:
                self.label_encoders[col] = LabelEncoder()
                df_features[f'{col}_encoded'] = self.label_encoders[col].fit_transform(
                    df_features[col].astype(str)
                )
        
        # Convertir horas a minutos desde medianoche
        if 'Hora Inicio' in df_features.columns:
            df_features['hora_inicio_minutos'] = pd.to_datetime(
                df_features['Hora Inicio'], format='%H:%M', errors='coerce'
            ).dt.hour * 60 + pd.to_datetime(
                df_features['Hora Inicio'], format='%H:%M', errors='coerce'
            ).dt.minute
        
        # Convertir variables booleanas
        if 'Paquete' in df_features.columns:
            df_features['tiene_paquete'] = (df_features['Paquete'] == 'Si').astype(int)
        
        # Descuento como numérico
        if 'Descuento' in df_features.columns:
            df_features['descuento_porcentaje'] = df_features['Descuento'].str.replace('%', '').astype(float)
        
        # Seleccionar features finales
        feature_columns = [
            'Ciclo', 'Dia_encoded', 'Turno_encoded', 'hora_inicio_minutos',
            'Hora_Sesion', 'Modalidad_encoded', 'Nivel_encoded', 
            'Genero_encoded', 'Proyecto_encoded', 'Departamento_encoded'
        ]
        
        # Agregar features opcionales si existen
        if 'tiene_paquete' in df_features.columns:
            feature_columns.append('tiene_paquete')
        if 'Cantidad clases' in df_features.columns:
            df_features['cantidad_clases_num'] = pd.to_numeric(df_features['Cantidad clases'], errors='coerce').fillna(0)
            feature_columns.append('cantidad_clases_num')
        if 'descuento_porcentaje' in df_features.columns:
            feature_columns.append('descuento_porcentaje')
        if 'Metodo de pago_encoded' in df_features.columns:
            feature_columns.append('Metodo de pago_encoded')
        
        # Filtrar solo columnas que existen
        feature_columns = [col for col in feature_columns if col in df_features.columns]
        
        print(f"📌 Features seleccionadas: {feature_columns}")
        
        # Eliminar filas con valores nulos
        df_clean = df_features[feature_columns + ['asistio']].dropna()
        
        X = df_clean[feature_columns]
        y = df_clean['asistio']
        
        print(f"✅ Dataset preparado: {len(X)} registros, {len(feature_columns)} features")
        print(f"📊 Distribución de clases:")
        print(f"   - Asistió: {sum(y == 1)} ({sum(y == 1)/len(y)*100:.1f}%)")
        print(f"   - No asistió: {sum(y == 0)} ({sum(y == 0)/len(y)*100:.1f}%)")
        
        return X, y
    
    def split_data(self, X, y, test_size=0.2, random_state=42):
        """Divide los datos en entrenamiento y prueba"""
        print(f"\n📊 Dividiendo datos ({int((1-test_size)*100)}% train, {int(test_size*100)}% test)...")
        
        self.X_train, self.X_test, self.y_train, self.y_test = train_test_split(
            X, y, test_size=test_size, random_state=random_state, stratify=y
        )
        
        # Escalar features
        self.X_train_scaled = self.scaler.fit_transform(self.X_train)
        self.X_test_scaled = self.scaler.transform(self.X_test)
        
        print(f"✅ Train: {len(self.X_train)} registros")
        print(f"✅ Test: {len(self.X_test)} registros")
    
    def train_random_forest(self, n_estimators=100, max_depth=10, random_state=42):
        """Entrena modelo Random Forest"""
        print("\n🌲 Entrenando Random Forest...")
        
        self.rf_model = RandomForestClassifier(
            n_estimators=n_estimators,
            max_depth=max_depth,
            random_state=random_state,
            class_weight='balanced'  # Balancear clases
        )
        
        self.rf_model.fit(self.X_train, self.y_train)
        
        # Evaluar
        y_pred_train = self.rf_model.predict(self.X_train)
        y_pred_test = self.rf_model.predict(self.X_test)
        
        print("\n📊 RESULTADOS RANDOM FOREST:")
        print(f"   Accuracy Train: {accuracy_score(self.y_train, y_pred_train):.4f}")
        print(f"   Accuracy Test:  {accuracy_score(self.y_test, y_pred_test):.4f}")
        print(f"   Precision Test: {precision_score(self.y_test, y_pred_test, zero_division=0):.4f}")
        print(f"   Recall Test:    {recall_score(self.y_test, y_pred_test, zero_division=0):.4f}")
        print(f"   F1-Score Test:  {f1_score(self.y_test, y_pred_test, zero_division=0):.4f}")
        
        # Importancia de features
        feature_importance = pd.DataFrame({
            'feature': self.X_train.columns,
            'importance': self.rf_model.feature_importances_
        }).sort_values('importance', ascending=False)
        
        print("\n🔍 Top 5 Features más importantes:")
        print(feature_importance.head(5).to_string(index=False))
        
        return self.rf_model
    
    def train_logistic_regression(self, max_iter=1000, random_state=42):
        """Entrena modelo Regresión Logística"""
        print("\n📈 Entrenando Regresión Logística...")
        
        self.lr_model = LogisticRegression(
            max_iter=max_iter,
            random_state=random_state,
            class_weight='balanced'  # Balancear clases
        )
        
        # Usar datos escalados para regresión logística
        self.lr_model.fit(self.X_train_scaled, self.y_train)
        
        # Evaluar
        y_pred_train = self.lr_model.predict(self.X_train_scaled)
        y_pred_test = self.lr_model.predict(self.X_test_scaled)
        
        print("\n📊 RESULTADOS REGRESIÓN LOGÍSTICA:")
        print(f"   Accuracy Train: {accuracy_score(self.y_train, y_pred_train):.4f}")
        print(f"   Accuracy Test:  {accuracy_score(self.y_test, y_pred_test):.4f}")
        print(f"   Precision Test: {precision_score(self.y_test, y_pred_test, zero_division=0):.4f}")
        print(f"   Recall Test:    {recall_score(self.y_test, y_pred_test, zero_division=0):.4f}")
        print(f"   F1-Score Test:  {f1_score(self.y_test, y_pred_test, zero_division=0):.4f}")
        
        return self.lr_model
    
    def compare_models(self):
        """Compara ambos modelos"""
        print("\n" + "="*60)
        print("📊 COMPARACIÓN DE MODELOS")
        print("="*60)
        
        rf_pred = self.rf_model.predict(self.X_test)
        lr_pred = self.lr_model.predict(self.X_test_scaled)
        
        print(f"\n{'Métrica':<20} {'Random Forest':<15} {'Reg. Logística':<15}")
        print("-" * 60)
        print(f"{'Accuracy':<20} {accuracy_score(self.y_test, rf_pred):<15.4f} {accuracy_score(self.y_test, lr_pred):<15.4f}")
        print(f"{'Precision':<20} {precision_score(self.y_test, rf_pred, zero_division=0):<15.4f} {precision_score(self.y_test, lr_pred, zero_division=0):<15.4f}")
        print(f"{'Recall':<20} {recall_score(self.y_test, rf_pred, zero_division=0):<15.4f} {recall_score(self.y_test, lr_pred, zero_division=0):<15.4f}")
        print(f"{'F1-Score':<20} {f1_score(self.y_test, rf_pred, zero_division=0):<15.4f} {f1_score(self.y_test, lr_pred, zero_division=0):<15.4f}")
        
        # Determinar mejor modelo
        rf_f1 = f1_score(self.y_test, rf_pred, zero_division=0)
        lr_f1 = f1_score(self.y_test, lr_pred, zero_division=0)
        
        print("\n" + "="*60)
        if rf_f1 > lr_f1:
            print("🏆 GANADOR: Random Forest")
            best_model = 'random_forest'
        else:
            print("🏆 GANADOR: Regresión Logística")
            best_model = 'logistic_regression'
        print("="*60)
        
        return best_model
    
    def save_models(self, output_dir='src/ml/models'):
        """Guarda ambos modelos entrenados"""
        print(f"\n💾 Guardando modelos en {output_dir}...")
        
        os.makedirs(output_dir, exist_ok=True)
        
        # Guardar Random Forest
        joblib.dump(self.rf_model, f'{output_dir}/random_forest_asistencias.pkl')
        print("✅ Random Forest guardado")
        
        # Guardar Regresión Logística
        joblib.dump(self.lr_model, f'{output_dir}/logistic_regression_asistencias.pkl')
        print("✅ Regresión Logística guardada")
        
        # Guardar Scaler (necesario para Regresión Logística)
        joblib.dump(self.scaler, f'{output_dir}/scaler_asistencias.pkl')
        print("✅ Scaler guardado")
        
        # Guardar Label Encoders
        joblib.dump(self.label_encoders, f'{output_dir}/label_encoders_asistencias.pkl')
        print("✅ Label Encoders guardados")
        
        # Guardar lista de features
        joblib.dump(list(self.X_train.columns), f'{output_dir}/feature_names_asistencias.pkl')
        print("✅ Feature names guardados")
        
        print("\n✅ Todos los modelos y componentes guardados exitosamente!")


def main():
    """
    Función principal para entrenar modelos
    
    INSTRUCCIONES:
    1. Coloca tu archivo Excel en src/ml/data/
    2. Actualiza la ruta del archivo en excel_path
    3. Ejecuta: python src/ml/training/train_asistencias.py
    """
    
    # 🔧 CONFIGURA AQUÍ LA RUTA A TU EXCEL
    excel_path = 'src/ml/data/datos_historicos_asistencias.xlsx'
    
    # Verificar que existe el archivo
    if not os.path.exists(excel_path):
        print(f"❌ ERROR: No se encontró el archivo {excel_path}")
        print(f"📁 Coloca tu archivo Excel en: src/ml/data/")
        return
    
    # Crear trainer
    trainer = AsistenciaTrainer(excel_path)
    
    # 1. Cargar datos
    trainer.load_data()
    
    # 2. Preparar features
    X, y = trainer.prepare_features()
    
    # 3. Dividir datos
    trainer.split_data(X, y)
    
    # 4. Entrenar Random Forest
    trainer.train_random_forest(
        n_estimators=100,
        max_depth=10
    )
    
    # 5. Entrenar Regresión Logística
    trainer.train_logistic_regression()
    
    # 6. Comparar modelos
    best_model = trainer.compare_models()
    
    # 7. Guardar modelos
    trainer.save_models()
    
    print(f"\n🎉 ¡Entrenamiento completado!")
    print(f"📌 Mejor modelo: {best_model}")
    print(f"📂 Modelos guardados en: src/ml/models/")


if __name__ == '__main__':
    main()
