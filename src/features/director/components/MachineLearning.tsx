import React, { useState, useEffect } from 'react';
import { env } from '@/config/env';
import Button from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import Table, { TableColumn } from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';
import Input from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import Label from '@/components/ui/Label';
import { toast } from 'sonner';

interface MLStatus {
  models_loaded: boolean;
  models_available: string[];
  last_training: string | null;
  ready_for_predictions: boolean;
}

interface MLModelMetrics {
  model: string;
  accuracy_cv: number;
  f1_cv: number;
  accuracy_test: number;
  f1_test: number;
}

interface MLModelComparison {
  modelo: string;
  accuracy_cv: number;
  f1_cv: number;
  accuracy_test: number;
  f1_test: number;
}

interface MLFeatureImportance {
  feature: string;
  importance: number;
}

interface MLPredictionInput {
  [key: string]: any;
}

interface MLPredictionResult {
  prediction: any;
  probability?: number;
  model_used: string;
}

interface Metrics {
  random_forest?: {
    cross_validation: {
      accuracy: { test_mean: number; test_std: number };
      f1_macro: { test_mean: number; test_std: number };
    };
    test_evaluation: {
      accuracy: number;
      f1_score: number;
    };
  };
  logistic_regression?: {
    cross_validation: {
      accuracy: { test_mean: number; test_std: number };
      f1_macro: { test_mean: number; test_std: number };
    };
    test_evaluation: {
      accuracy: number;
      f1_score: number;
    };
  };
}

interface Comparison {
  recommendation: {
    recommended_model: string;
    confidence: string;
    justification: string[];
  };
  metrics_comparison: {
    Modelo: string[];
    "Accuracy (CV)": string[];
    "F1-Score (CV)": string[];
    "Accuracy (Test)": string[];
    "F1-Score (Test)": string[];
  };
}

interface FeatureImportance {
  features: Array<{
    feature: string;
    importance: number;
  }>;
}

interface PredictionForm {
  tipo_cuenta: string;
  nombre_subcategoria: string;
  nombre_categoria: string;
  programa_nombre: string;
  mes_inscripcion: number;
  anio_inscripcion: number;
  dia_semana_inscripcion: number;
  cantidad_clases: number;
  precio_final: number;
  precio_paquete: number;
  estado_pago: string;
}

interface PredictionResult {
  prediccion: 'BAJA' | 'MEDIA' | 'ALTA';
  probabilidades: {
    BAJA: number;
    MEDIA: number;
    ALTA: number;
  };
  modelo_usado: string;
  confianza: number;
  timestamp: string;
}

export default function MachineLearning() {
  const [status, setStatus] = useState<MLStatus | null>(null);
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [comparison, setComparison] = useState<Comparison | null>(null);
  const [featureImportance, setFeatureImportance] = useState<FeatureImportance | null>(null);
  const [training, setTraining] = useState(false);
  const [predictionForm, setPredictionForm] = useState<PredictionForm>({
    tipo_cuenta: 'NUEVO',
    nombre_subcategoria: '',
    nombre_categoria: '',
    programa_nombre: '',
    mes_inscripcion: new Date().getMonth() + 1,
    anio_inscripcion: new Date().getFullYear(),
    dia_semana_inscripcion: new Date().getDay(),
    cantidad_clases: 12,
    precio_final: 0,
    precio_paquete: 0,
    estado_pago: 'PAGADO'
  });
  const [predictionResult, setPredictionResult] = useState<PredictionResult | null>(null);
  const [predicting, setPredicting] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [statusRes, metricsRes, comparisonRes, importanceRes] = await Promise.all([
        fetch(`${env.API_URL}/ml/status`).then(r => r.ok ? r.json() : null),
        fetch(`${env.API_URL}/ml/metrics`).then(r => r.ok ? r.json() : null),
        fetch(`${env.API_URL}/ml/comparison`).then(r => r.ok ? r.json() : null),
        fetch(`${env.API_URL}/ml/feature-importance`).then(r => r.ok ? r.json() : null)
      ]);

      setStatus(statusRes);
      setMetrics(metricsRes);
      setComparison(comparisonRes);
      setFeatureImportance(importanceRes);
    } catch (error) {
      console.error('Error loading ML data:', error);
      toast.error('Error al cargar datos de ML');
    }
  };

  const handleTrain = async () => {
    if (!confirm('¿Entrenar modelos ML? Esto puede tomar varios minutos.')) return;

    setTraining(true);
    try {
      const response = await fetch(`${env.API_URL}/ml/train`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ force_retrain: true })
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      const data = await response.json();
      toast.success(`Modelos entrenados: ${data.recommended_model}`);
      loadData();
    } catch (error) {
      console.error('Error training models:', error);
      toast.error('Error al entrenar modelos');
    } finally {
      setTraining(false);
    }
  };

  const handlePredict = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!status?.ready_for_predictions) {
      toast.error('Modelos no disponibles. Entrene primero.');
      return;
    }

    setPredicting(true);
    try {
      const response = await fetch(`${env.API_URL}/ml/predict`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(predictionForm)
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      const data = await response.json();
      setPredictionResult(data);
    } catch (error) {
      console.error('Error predicting:', error);
      toast.error('Error al predecir demanda');
    } finally {
      setPredicting(false);
    }
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setPredictionForm(prev => ({
      ...prev,
      [name]: ['mes_inscripcion', 'anio_inscripcion', 'dia_semana_inscripcion', 'cantidad_clases', 'precio_final', 'precio_paquete'].includes(name)
        ? Number(value)
        : value
    }));
  };

  const getDemandColor = (demanda: string) => {
    switch (demanda) {
      case 'ALTA': return 'text-green-600';
      case 'MEDIA': return 'text-yellow-600';
      case 'BAJA': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const metricsColumns: TableColumn<MLModelMetrics>[] = [
    { key: 'model', label: 'Modelo', render: (row: MLModelMetrics) => row.model },
    { key: 'accuracy_cv', label: 'Accuracy CV', render: (row: MLModelMetrics) => `${(row.accuracy_cv * 100).toFixed(1)}%` },
    { key: 'f1_cv', label: 'F1-Score CV', render: (row: MLModelMetrics) => `${(row.f1_cv * 100).toFixed(1)}%` },
    { key: 'accuracy_test', label: 'Accuracy Test', render: (row: MLModelMetrics) => `${(row.accuracy_test * 100).toFixed(1)}%` },
    { key: 'f1_test', label: 'F1-Score Test', render: (row: MLModelMetrics) => `${(row.f1_test * 100).toFixed(1)}%` }
  ];

  const comparisonColumns: TableColumn<MLModelComparison>[] = [
    { key: 'modelo', label: 'Modelo', render: (row: MLModelComparison) => row.modelo },
    { key: 'accuracy_cv', label: 'Accuracy CV', render: (row: MLModelComparison) => row.accuracy_cv },
    { key: 'f1_cv', label: 'F1-Score CV', render: (row: MLModelComparison) => row.f1_cv },
    { key: 'accuracy_test', label: 'Accuracy Test', render: (row: MLModelComparison) => row.accuracy_test },
    { key: 'f1_test', label: 'F1-Score Test', render: (row: MLModelComparison) => row.f1_test }
  ];

  const importanceColumns: TableColumn<MLFeatureImportance>[] = [
    { key: 'feature', label: 'Característica', render: (row: MLFeatureImportance) => row.feature },
    { key: 'importance', label: 'Importancia', render: (row: MLFeatureImportance) => `${(row.importance * 100).toFixed(1)}%` }
  ];

  const metricsData = metrics ? [
    {
      model: 'Random Forest',
      accuracy_cv: metrics.random_forest?.cross_validation.accuracy.test_mean || 0,
      f1_cv: metrics.random_forest?.cross_validation.f1_macro.test_mean || 0,
      accuracy_test: metrics.random_forest?.test_evaluation.accuracy || 0,
      f1_test: metrics.random_forest?.test_evaluation.f1_score || 0
    },
    {
      model: 'Logistic Regression',
      accuracy_cv: metrics.logistic_regression?.cross_validation.accuracy.test_mean || 0,
      f1_cv: metrics.logistic_regression?.cross_validation.f1_macro.test_mean || 0,
      accuracy_test: metrics.logistic_regression?.test_evaluation.accuracy || 0,
      f1_test: metrics.logistic_regression?.test_evaluation.f1_score || 0
    }
  ] : [];

  const comparisonData: MLModelComparison[] = comparison ? comparison.metrics_comparison.Modelo.map((modelo, i) => ({
    modelo,
    accuracy_cv: parseFloat(comparison.metrics_comparison["Accuracy (CV)"][i]) || 0,
    f1_cv: parseFloat(comparison.metrics_comparison["F1-Score (CV)"][i]) || 0,
    accuracy_test: parseFloat(comparison.metrics_comparison["Accuracy (Test)"][i]) || 0,
    f1_test: parseFloat(comparison.metrics_comparison["F1-Score (Test)"][i]) || 0
  })) : [];

  const importanceData = featureImportance?.features.slice(0, 10) || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-ink">Machine Learning</h1>
        <Button onClick={handleTrain} disabled={training} variant="primary">
          {training ? 'Entrenando...' : 'Entrenar Modelos'}
        </Button>
      </div>

      {/* Estado del Sistema */}
      <Card>
        <div className="p-4">
          <h2 className="text-lg font-medium mb-4">Estado del Sistema</h2>
          {status ? (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Modelos cargados</p>
                <Badge variant={status.models_loaded ? 'success' : 'error'}>
                  {status.models_loaded ? 'Sí' : 'No'}
                </Badge>
              </div>
              <div>
                <p className="text-sm text-gray-600">Modelos disponibles</p>
                <p className="text-sm">{status.models_available.join(', ') || 'Ninguno'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Último entrenamiento</p>
                <p className="text-sm">{status.last_training ? new Date(status.last_training).toLocaleString() : 'Nunca'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Listo para predicciones</p>
                <Badge variant={status.ready_for_predictions ? 'success' : 'error'}>
                  {status.ready_for_predictions ? 'Sí' : 'No'}
                </Badge>
              </div>
            </div>
          ) : (
            <p className="text-gray-500">Cargando estado...</p>
          )}
        </div>
      </Card>

      {/* Métricas */}
      {metrics && (
        <Card>
          <div className="p-4">
            <h2 className="text-lg font-medium mb-4">Métricas de Evaluación</h2>
            <Table columns={metricsColumns} data={metricsData} />
          </div>
        </Card>
      )}

      {/* Comparación */}
      {comparison && (
        <Card>
          <div className="p-4">
            <h2 className="text-lg font-medium mb-4">Comparación de Modelos</h2>
            <div className="mb-4">
              <p className="text-sm text-gray-600">Modelo recomendado:</p>
              <Badge variant="primary">{comparison.recommendation.recommended_model}</Badge>
              <p className="text-sm mt-2">Confianza: {comparison.recommendation.confidence}</p>
            </div>
            <Table columns={comparisonColumns} data={comparisonData} />
          </div>
        </Card>
      )}

      {/* Importancia de Características */}
      {featureImportance && (
        <Card>
          <div className="p-4">
            <h2 className="text-lg font-medium mb-4">Importancia de Características (Top 10)</h2>
            <Table columns={importanceColumns} data={importanceData} />
          </div>
        </Card>
      )}

      {/* Predictor */}
      <Card>
        <div className="p-4">
          <h2 className="text-lg font-medium mb-4">Predictor de Demanda</h2>
          <form onSubmit={handlePredict} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="tipo_cuenta">Tipo de Cuenta</Label>
                <Select
                  id="tipo_cuenta"
                  name="tipo_cuenta"
                  value={predictionForm.tipo_cuenta}
                  onChange={handleFormChange}
                >
                  <option value="NUEVO">NUEVO</option>
                  <option value="RECURRENTE">RECURRENTE</option>
                </Select>
              </div>

              <div>
                <Label htmlFor="nombre_subcategoria">Subcategoría</Label>
                <Input
                  id="nombre_subcategoria"
                  name="nombre_subcategoria"
                  value={predictionForm.nombre_subcategoria}
                  onChange={handleFormChange}
                  placeholder="Ej: Ballet Clásico"
                  required
                />
              </div>

              <div>
                <Label htmlFor="nombre_categoria">Categoría</Label>
                <Input
                  id="nombre_categoria"
                  name="nombre_categoria"
                  value={predictionForm.nombre_categoria}
                  onChange={handleFormChange}
                  placeholder="Ej: Ballet"
                  required
                />
              </div>

              <div>
                <Label htmlFor="programa_nombre">Programa</Label>
                <Input
                  id="programa_nombre"
                  name="programa_nombre"
                  value={predictionForm.programa_nombre}
                  onChange={handleFormChange}
                  placeholder="Ej: Programa Infantil"
                  required
                />
              </div>

              <div>
                <Label htmlFor="mes_inscripcion">Mes</Label>
                <Input
                  id="mes_inscripcion"
                  name="mes_inscripcion"
                  type="number"
                  value={predictionForm.mes_inscripcion}
                  onChange={handleFormChange}
                  min="1"
                  max="12"
                  required
                />
              </div>

              <div>
                <Label htmlFor="anio_inscripcion">Año</Label>
                <Input
                  id="anio_inscripcion"
                  name="anio_inscripcion"
                  type="number"
                  value={predictionForm.anio_inscripcion}
                  onChange={handleFormChange}
                  min="2020"
                  required
                />
              </div>

              <div>
                <Label htmlFor="dia_semana_inscripcion">Día Semana</Label>
                <Select
                  id="dia_semana_inscripcion"
                  name="dia_semana_inscripcion"
                  value={predictionForm.dia_semana_inscripcion}
                  onChange={handleFormChange}
                >
                  <option value="0">Domingo</option>
                  <option value="1">Lunes</option>
                  <option value="2">Martes</option>
                  <option value="3">Miércoles</option>
                  <option value="4">Jueves</option>
                  <option value="5">Viernes</option>
                  <option value="6">Sábado</option>
                </Select>
              </div>

              <div>
                <Label htmlFor="cantidad_clases">Cantidad de Clases</Label>
                <Input
                  id="cantidad_clases"
                  name="cantidad_clases"
                  type="number"
                  value={predictionForm.cantidad_clases}
                  onChange={handleFormChange}
                  min="1"
                  required
                />
              </div>

              <div>
                <Label htmlFor="precio_final">Precio Final</Label>
                <Input
                  id="precio_final"
                  name="precio_final"
                  type="number"
                  step="0.01"
                  value={predictionForm.precio_final}
                  onChange={handleFormChange}
                  min="0"
                  required
                />
              </div>

              <div>
                <Label htmlFor="precio_paquete">Precio Paquete</Label>
                <Input
                  id="precio_paquete"
                  name="precio_paquete"
                  type="number"
                  step="0.01"
                  value={predictionForm.precio_paquete}
                  onChange={handleFormChange}
                  min="0"
                  required
                />
              </div>

              <div>
                <Label htmlFor="estado_pago">Estado de Pago</Label>
                <Select
                  id="estado_pago"
                  name="estado_pago"
                  value={predictionForm.estado_pago}
                  onChange={handleFormChange}
                >
                  <option value="PAGADO">PAGADO</option>
                  <option value="PENDIENTE">PENDIENTE</option>
                  <option value="CANCELADO">CANCELADO</option>
                </Select>
              </div>
            </div>

            <Button type="submit" disabled={predicting || !status?.ready_for_predictions} variant="primary">
              {predicting ? 'Prediciendo...' : 'Predecir Demanda'}
            </Button>
          </form>

          {predictionResult && (
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h3 className="text-lg font-medium mb-4">Resultado de Predicción</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Predicción</p>
                  <p className={`text-2xl font-bold ${getDemandColor(predictionResult.prediccion)}`}>
                    {predictionResult.prediccion}
                  </p>
                  <p className="text-sm text-gray-600 mt-2">
                    Confianza: {(predictionResult.confianza * 100).toFixed(1)}%
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-2">Probabilidades</p>
                  <div className="space-y-2">
                    {Object.entries(predictionResult.probabilidades).map(([clase, prob]) => (
                      <div key={clase} className="flex items-center justify-between">
                        <span className="text-sm">{clase}</span>
                        <div className="flex items-center gap-2">
                          <div className="w-20 bg-gray-200 rounded-full h-2">
                            <div
                              className="h-2 rounded-full"
                              style={{
                                width: `${prob * 100}%`,
                                backgroundColor: clase === 'ALTA' ? '#4caf50' : clase === 'MEDIA' ? '#ff9800' : '#f44336'
                              }}
                            />
                          </div>
                          <span className="text-sm w-12 text-right">{(prob * 100).toFixed(1)}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="mt-4 text-sm text-gray-600">
                <p>Modelo usado: {predictionResult.modelo_usado}</p>
                <p>Timestamp: {new Date(predictionResult.timestamp).toLocaleString()}</p>
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}