"""
Script para probar los endpoints ML sin necesidad de servidor corriendo
"""

import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from src.ml.predictors.inscripcion_predictor import InscripcionPredictor

print("="*70)
print("🎯 PRUEBA DE PREDICCIÓN DE COMPRA DE PAQUETE")
print("="*70)

# Crear predictor
predictor_rf = InscripcionPredictor(model_type='random_forest')
predictor_lr = InscripcionPredictor(model_type='logistic_regression')

# Ejemplo 1: Alumna de La Paz, Ciclo 3
print("\n📊 CASO 1: Alumna de La Paz")
print("-" * 70)
alumna_lp = {
    'Departamento': 'LP',
    'Ciclo': 3,
    'Genero': 'Femenino',
    'Proyecto': 'Camino Femme',
    'Metodo de pago': 'QR',
    'Descuento': '15%',
    'mes_inscripcion': 11
}

print("\n🔸 Datos de entrada:")
for key, value in alumna_lp.items():
    print(f"   {key}: {value}")

resultado_rf = predictor_rf.predict_compra_paquete(alumna_lp)
resultado_lr = predictor_lr.predict_compra_paquete(alumna_lp)

print("\n🌲 Random Forest:")
print(f"   ¿Comprará paquete? {'✅ SÍ' if resultado_rf['comprara_paquete'] else '❌ NO'}")
print(f"   Probabilidad: {resultado_rf['probabilidad']}%")
print(f"   Confianza: {resultado_rf['confianza']}")
print(f"   Recomendación: {resultado_rf['recomendacion']}")

print("\n📈 Logistic Regression:")
print(f"   ¿Comprará paquete? {'✅ SÍ' if resultado_lr['comprara_paquete'] else '❌ NO'}")
print(f"   Probabilidad: {resultado_lr['probabilidad']}%")
print(f"   Confianza: {resultado_lr['confianza']}")
print(f"   Recomendación: {resultado_lr['recomendacion']}")

# Ejemplo 2: Alumna de Oruro
print("\n\n📊 CASO 2: Alumna de Oruro")
print("-" * 70)
alumna_or = {
    'Departamento': 'OR',
    'Ciclo': 2,
    'Genero': 'Femenino',
    'Proyecto': 'Camino Femme',
    'Metodo de pago': 'Efectivo',
    'Descuento': '0%',
    'mes_inscripcion': 8
}

print("\n🔸 Datos de entrada:")
for key, value in alumna_or.items():
    print(f"   {key}: {value}")

resultado_rf2 = predictor_rf.predict_compra_paquete(alumna_or)
resultado_lr2 = predictor_lr.predict_compra_paquete(alumna_or)

print("\n🌲 Random Forest:")
print(f"   ¿Comprará paquete? {'✅ SÍ' if resultado_rf2['comprara_paquete'] else '❌ NO'}")
print(f"   Probabilidad: {resultado_rf2['probabilidad']}%")
print(f"   Confianza: {resultado_rf2['confianza']}")
print(f"   Recomendación: {resultado_rf2['recomendacion']}")

print("\n📈 Logistic Regression:")
print(f"   ¿Comprará paquete? {'✅ SÍ' if resultado_lr2['comprara_paquete'] else '❌ NO'}")
print(f"   Probabilidad: {resultado_lr2['probabilidad']}%")
print(f"   Confianza: {resultado_lr2['confianza']}")
print(f"   Recomendación: {resultado_lr2['recomendacion']}")

# Ejemplo 3: Alumna de Santa Cruz
print("\n\n📊 CASO 3: Alumna de Santa Cruz")
print("-" * 70)
alumna_scz = {
    'Departamento': 'SCZ',
    'Ciclo': 1,
    'Genero': 'Femenino',
    'Proyecto': 'Camino Femme',
    'Metodo de pago': 'QR',
    'Descuento': '20%',
    'mes_inscripcion': 3
}

print("\n🔸 Datos de entrada:")
for key, value in alumna_scz.items():
    print(f"   {key}: {value}")

resultado_rf3 = predictor_rf.predict_compra_paquete(alumna_scz)
resultado_lr3 = predictor_lr.predict_compra_paquete(alumna_scz)

print("\n🌲 Random Forest:")
print(f"   ¿Comprará paquete? {'✅ SÍ' if resultado_rf3['comprara_paquete'] else '❌ NO'}")
print(f"   Probabilidad: {resultado_rf3['probabilidad']}%")
print(f"   Confianza: {resultado_rf3['confianza']}")
print(f"   Recomendación: {resultado_rf3['recomendacion']}")

print("\n📈 Logistic Regression:")
print(f"   ¿Comprará paquete? {'✅ SÍ' if resultado_lr3['comprara_paquete'] else '❌ NO'}")
print(f"   Probabilidad: {resultado_lr3['probabilidad']}%")
print(f"   Confianza: {resultado_lr3['confianza']}")
print(f"   Recomendación: {resultado_lr3['recomendacion']}")

print("\n" + "="*70)
print("✅ PRUEBA COMPLETADA")
print("="*70)
print("\n💡 Cómo usar en el frontend:")
print("   POST http://localhost:5000/ml/predict/paquete")
print("   Body: { datos del alumno }")
print("\n📚 Ver documentación en: docs/MACHINE_LEARNING.md")
