"""
Script de entrenamiento para predecir INSCRIPCIONES usando datos históricos

Predice:
- Cantidad de inscripciones por curso/horario/ciclo
- Demanda de diferentes tipos de clases
- Patrones de inscripción

Compara Random Forest vs Regresión Logística
"""

import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.ensemble import RandomForestClassifier, RandomForestRegressor
from sklearn.linear_model import LogisticRegression, LinearRegression
from sklearn.preprocessing import LabelEncoder, StandardScaler
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, mean_squared_error, mean_absolute_error, r2_score
import joblib
import os

class InscripcionTrainer:
    def __init__(self, excel_path):
        """
        Inicializa el entrenador de modelos de inscripciones
        
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
        
        # Modelos para CLASIFICACIÓN (ej: se inscribirá o no, comprará paquete o no)
        self.rf_classifier = None
        self.lr_classifier = None
        
        # Modelos para REGRESIÓN (ej: cuántas inscripciones habrá)
        self.rf_regressor = None
        self.linear_regressor = None
    
    def load_data(self):
        """Carga los datos desde Excel"""
        print("📊 Cargando datos históricos desde Excel...")
        self.df = pd.read_excel(self.excel_path)
        print(f"✅ Datos cargados: {len(self.df)} inscripciones históricas")
        print(f"📋 Columnas: {list(self.df.columns)}")
        
        # Mostrar años disponibles
        if 'Fecha incripcion' in self.df.columns:
            self.df['año_inscripcion'] = pd.to_datetime(self.df['Fecha incripcion'], errors='coerce').dt.year
            años = self.df['año_inscripcion'].dropna().unique()
            print(f"📅 Años históricos: {sorted(años)}")
        
        return self.df
    
    def analyze_data(self):
        """Analiza los datos para entender patrones"""
        print("\n" + "="*60)
        print("📊 ANÁLISIS DE DATOS HISTÓRICOS")
        print("="*60)
        
        # Inscripciones por año
        if 'año_inscripcion' in self.df.columns:
            inscripciones_año = self.df.groupby('año_inscripcion').size()
            print("\n📈 Inscripciones por año:")
            for año, cantidad in inscripciones_año.items():
                print(f"   {int(año)}: {cantidad} inscripciones")
        
        # Inscripciones por ciclo
        if 'Ciclo' in self.df.columns:
            inscripciones_ciclo = self.df.groupby('Ciclo').size()
            print("\n🔄 Inscripciones por ciclo:")
            for ciclo, cantidad in inscripciones_ciclo.items():
                print(f"   Ciclo {ciclo}: {cantidad} inscripciones")
        
        # Cursos más populares
        if 'Curso' in self.df.columns:
            top_cursos = self.df['Curso'].value_counts().head(5)
            print("\n🎯 Top 5 cursos más populares:")
            for curso, cantidad in top_cursos.items():
                print(f"   {curso}: {cantidad} inscripciones")
        
        # Proyectos más demandados
        if 'Proyecto' in self.df.columns:
            proyectos = self.df['Proyecto'].value_counts()
            print("\n📁 Inscripciones por proyecto:")
            for proyecto, cantidad in proyectos.items():
                print(f"   {proyecto}: {cantidad} inscripciones")
        
        # Departamentos
        if 'Departamento' in self.df.columns:
            departamentos = self.df['Departamento'].value_counts()
            print("\n🏢 Inscripciones por departamento:")
            for depto, cantidad in departamentos.items():
                print(f"   {depto}: {cantidad} inscripciones")
        
        # Paquetes vs individual
        if 'Paquete' in self.df.columns:
            paquetes = self.df['Paquete'].value_counts()
            print("\n📦 Compra de paquetes:")
            for tipo, cantidad in paquetes.items():
                print(f"   {tipo}: {cantidad} inscripciones ({cantidad/len(self.df)*100:.1f}%)")
    
    def prepare_features_paquete(self):
        """
        Prepara features para predecir si comprará PAQUETE
        
        TARGET: Paquete (Si/No)
        """
        print("\n🔧 Preparando características para predicción de COMPRA DE PAQUETE...")
        
        df_features = self.df.copy()
        
        # TARGET: Si compró paquete o no
        if 'Paquete' not in df_features.columns:
            print("❌ No se encontró columna 'Paquete'")
            return None, None
        
        df_features['compra_paquete'] = (df_features['Paquete'] == 'Si').astype(int)
        
        # Features categóricas
        categorical_columns = ['Departamento', 'Proyecto', 'Genero', 'Metodo de pago']
        
        for col in categorical_columns:
            if col in df_features.columns:
                self.label_encoders[col] = LabelEncoder()
                df_features[f'{col}_encoded'] = self.label_encoders[col].fit_transform(
                    df_features[col].astype(str).fillna('Unknown')
                )
        
        # Features numéricas
        feature_columns = ['Ciclo']
        
        # Agregar categóricas codificadas
        for col in categorical_columns:
            if f'{col}_encoded' in df_features.columns:
                feature_columns.append(f'{col}_encoded')
        
        # Descuento
        if 'Descuento' in df_features.columns:
            df_features['descuento_porcentaje'] = df_features['Descuento'].str.replace('%', '').astype(float)
            feature_columns.append('descuento_porcentaje')
        
        # Mes de inscripción
        if 'Fecha incripcion' in df_features.columns:
            df_features['mes_inscripcion'] = pd.to_datetime(df_features['Fecha incripcion'], errors='coerce').dt.month
            feature_columns.append('mes_inscripcion')
        
        print(f"📌 Features: {feature_columns}")
        
        # Limpiar datos
        df_clean = df_features[feature_columns + ['compra_paquete']].dropna()
        
        X = df_clean[feature_columns]
        y = df_clean['compra_paquete']
        
        print(f"✅ Dataset: {len(X)} registros")
        print(f"📊 Distribución:")
        print(f"   - Compra paquete: {sum(y == 1)} ({sum(y == 1)/len(y)*100:.1f}%)")
        print(f"   - No compra paquete: {sum(y == 0)} ({sum(y == 0)/len(y)*100:.1f}%)")
        
        return X, y
    
    def prepare_features_demanda_curso(self):
        """
        Prepara datos para predecir DEMANDA por tipo de curso
        
        Agrupa por Proyecto/Curso y cuenta inscripciones
        """
        print("\n🔧 Preparando datos para predicción de DEMANDA...")
        
        # Agrupar por Proyecto, Ciclo, Departamento
        agrupado = self.df.groupby(['Proyecto', 'Ciclo', 'Departamento']).agg({
            'Nombre': 'count',  # Cantidad de inscripciones
            'Paquete': lambda x: (x == 'Si').sum()  # Cuántos compraron paquete
        }).reset_index()
        
        # Calcular descuento promedio aparte
        agrupado['descuento_promedio'] = 0.0
        
        agrupado.columns = ['Proyecto', 'Ciclo', 'Departamento', 'cantidad_inscripciones', 'paquetes_vendidos', 'descuento_promedio']
        
        print(f"✅ {len(agrupado)} combinaciones de Proyecto-Ciclo-Departamento")
        print("\n📊 Top 5 combinaciones con más inscripciones:")
        print(agrupado.nlargest(5, 'cantidad_inscripciones')[['Proyecto', 'Ciclo', 'Departamento', 'cantidad_inscripciones']])
        
        # Codificar categóricas
        for col in ['Proyecto', 'Departamento']:
            if col not in self.label_encoders:
                self.label_encoders[col] = LabelEncoder()
                agrupado[f'{col}_encoded'] = self.label_encoders[col].fit_transform(agrupado[col])
            else:
                agrupado[f'{col}_encoded'] = self.label_encoders[col].transform(agrupado[col])
        
        # Features y target
        feature_columns = ['Proyecto_encoded', 'Ciclo', 'Departamento_encoded', 'descuento_promedio']
        X = agrupado[feature_columns]
        y = agrupado['cantidad_inscripciones']
        
        print(f"\n📌 Features para regresión: {feature_columns}")
        print(f"📊 Rango de inscripciones: {y.min()} - {y.max()}")
        
        return X, y
    
    def split_data(self, X, y, test_size=0.2, random_state=42):
        """Divide datos en train/test"""
        print(f"\n📊 Dividiendo datos ({int((1-test_size)*100)}% train, {int(test_size)*100}% test)...")
        
        self.X_train, self.X_test, self.y_train, self.y_test = train_test_split(
            X, y, test_size=test_size, random_state=random_state
        )
        
        self.X_train_scaled = self.scaler.fit_transform(self.X_train)
        self.X_test_scaled = self.scaler.transform(self.X_test)
        
        print(f"✅ Train: {len(self.X_train)} | Test: {len(self.X_test)}")
    
    def train_classification(self):
        """Entrena modelos de CLASIFICACIÓN (paquete Si/No)"""
        print("\n" + "="*60)
        print("🎯 ENTRENANDO MODELOS DE CLASIFICACIÓN")
        print("="*60)
        
        # Random Forest
        print("\n🌲 Random Forest Classifier...")
        self.rf_classifier = RandomForestClassifier(
            n_estimators=100, max_depth=10, random_state=42, class_weight='balanced'
        )
        self.rf_classifier.fit(self.X_train, self.y_train)
        
        y_pred = self.rf_classifier.predict(self.X_test)
        print(f"   Accuracy: {accuracy_score(self.y_test, y_pred):.4f}")
        print(f"   Precision: {precision_score(self.y_test, y_pred, zero_division=0):.4f}")
        print(f"   Recall: {recall_score(self.y_test, y_pred, zero_division=0):.4f}")
        print(f"   F1-Score: {f1_score(self.y_test, y_pred, zero_division=0):.4f}")
        
        # Regresión Logística
        print("\n📈 Logistic Regression...")
        self.lr_classifier = LogisticRegression(max_iter=1000, random_state=42, class_weight='balanced')
        self.lr_classifier.fit(self.X_train_scaled, self.y_train)
        
        y_pred_lr = self.lr_classifier.predict(self.X_test_scaled)
        print(f"   Accuracy: {accuracy_score(self.y_test, y_pred_lr):.4f}")
        print(f"   Precision: {precision_score(self.y_test, y_pred_lr, zero_division=0):.4f}")
        print(f"   Recall: {recall_score(self.y_test, y_pred_lr, zero_division=0):.4f}")
        print(f"   F1-Score: {f1_score(self.y_test, y_pred_lr, zero_division=0):.4f}")
    
    def train_regression(self):
        """Entrena modelos de REGRESIÓN (cantidad de inscripciones)"""
        print("\n" + "="*60)
        print("📊 ENTRENANDO MODELOS DE REGRESIÓN")
        print("="*60)
        
        # Random Forest Regressor
        print("\n🌲 Random Forest Regressor...")
        self.rf_regressor = RandomForestRegressor(n_estimators=100, max_depth=10, random_state=42)
        self.rf_regressor.fit(self.X_train, self.y_train)
        
        y_pred = self.rf_regressor.predict(self.X_test)
        print(f"   MAE (Error Absoluto): {mean_absolute_error(self.y_test, y_pred):.2f} inscripciones")
        print(f"   RMSE: {np.sqrt(mean_squared_error(self.y_test, y_pred)):.2f}")
        print(f"   R² Score: {r2_score(self.y_test, y_pred):.4f}")
        
        # Regresión Lineal
        print("\n📈 Linear Regression...")
        self.linear_regressor = LinearRegression()
        self.linear_regressor.fit(self.X_train_scaled, self.y_train)
        
        y_pred_lr = self.linear_regressor.predict(self.X_test_scaled)
        print(f"   MAE (Error Absoluto): {mean_absolute_error(self.y_test, y_pred_lr):.2f} inscripciones")
        print(f"   RMSE: {np.sqrt(mean_squared_error(self.y_test, y_pred_lr)):.2f}")
        print(f"   R² Score: {r2_score(self.y_test, y_pred_lr):.4f}")
    
    def save_models(self, output_dir='src/ml/models'):
        """Guarda todos los modelos"""
        print(f"\n💾 Guardando modelos en {output_dir}...")
        os.makedirs(output_dir, exist_ok=True)
        
        if self.rf_classifier:
            joblib.dump(self.rf_classifier, f'{output_dir}/rf_paquete_classifier.pkl')
            print("✅ Random Forest Classifier (paquete)")
        
        if self.lr_classifier:
            joblib.dump(self.lr_classifier, f'{output_dir}/lr_paquete_classifier.pkl')
            print("✅ Logistic Regression Classifier (paquete)")
        
        if self.rf_regressor:
            joblib.dump(self.rf_regressor, f'{output_dir}/rf_demanda_regressor.pkl')
            print("✅ Random Forest Regressor (demanda)")
        
        if self.linear_regressor:
            joblib.dump(self.linear_regressor, f'{output_dir}/linear_demanda_regressor.pkl')
            print("✅ Linear Regressor (demanda)")
        
        joblib.dump(self.scaler, f'{output_dir}/scaler_inscripciones.pkl')
        joblib.dump(self.label_encoders, f'{output_dir}/label_encoders_inscripciones.pkl')
        
        print("\n✅ Todos los modelos guardados!")


def main():
    excel_path = 'src/ml/data/datos_historicos_asistencias.xlsx'
    
    if not os.path.exists(excel_path):
        print(f"❌ No se encontró {excel_path}")
        return
    
    trainer = InscripcionTrainer(excel_path)
    
    # 1. Cargar y analizar datos
    trainer.load_data()
    trainer.analyze_data()
    
    # 2. MODELO 1: Predecir compra de paquete
    print("\n" + "="*60)
    print("🎯 MODELO 1: PREDICCIÓN DE COMPRA DE PAQUETE")
    print("="*60)
    
    X_paquete, y_paquete = trainer.prepare_features_paquete()
    if X_paquete is not None and len(y_paquete.unique()) > 1:
        trainer.split_data(X_paquete, y_paquete)
        trainer.train_classification()
    else:
        print("⚠️  No hay suficiente variedad en datos de paquetes")
    
    # 3. MODELO 2: Predecir demanda (cantidad de inscripciones)
    print("\n" + "="*60)
    print("📊 MODELO 2: PREDICCIÓN DE DEMANDA")
    print("="*60)
    
    X_demanda, y_demanda = trainer.prepare_features_demanda_curso()
    if len(X_demanda) > 10:  # Necesitamos suficientes datos
        trainer.split_data(X_demanda, y_demanda)
        trainer.train_regression()
    else:
        print("⚠️  Pocos datos para predecir demanda")
    
    # 4. Guardar modelos
    trainer.save_models()
    
    print("\n🎉 ¡Entrenamiento completado!")


if __name__ == '__main__':
    main()
