from src.repositories.dashboard_repository import DashboardRepository


class DashboardService:
    def __init__(self):
        self.repository = DashboardRepository()
    
    def get_estadisticas_generales_ciclo(self, id_ciclo):
        """
        Servicio para obtener estadísticas generales de un ciclo
        """
        return self.repository.get_estadisticas_generales_ciclo(id_ciclo)
    
    def get_alumnas_por_estilo(self, id_ciclo):
        """
        Servicio para obtener alumnas por estilo
        """
        return self.repository.get_alumnas_por_estilo(id_ciclo)
    
    def get_ocupacion_por_estilo(self, id_ciclo):
        """
        Servicio para obtener ocupación por estilo
        """
        return self.repository.get_ocupacion_por_estilo(id_ciclo)
    
    def get_ingresos_mensuales(self, anio=None, meses=6):
        """
        Servicio para obtener ingresos mensuales
        """
        return self.repository.get_ingresos_mensuales(anio, meses)
    
    def get_top_profesores(self, id_ciclo, limit=10):
        """
        Servicio para obtener top profesores
        """
        return self.repository.get_top_profesores(id_ciclo, limit)
    
    def get_horarios_mas_demandados(self, id_ciclo):
        """
        Servicio para obtener horarios más demandados
        """
        return self.repository.get_horarios_mas_demandados(id_ciclo)
    
    def get_estado_pagos(self, id_ciclo):
        """
        Servicio para obtener estado de pagos
        """
        return self.repository.get_estado_pagos(id_ciclo)
    
    def get_asistencia_por_mes(self, id_ciclo):
        """
        Servicio para obtener asistencia por mes
        """
        return self.repository.get_asistencia_por_mes(id_ciclo)
    
    def get_alumnos_nuevos_vs_recurrentes(self, id_ciclo):
        """
        Servicio para obtener alumnos nuevos vs recurrentes
        """
        return self.repository.get_alumnos_nuevos_vs_recurrentes(id_ciclo)
