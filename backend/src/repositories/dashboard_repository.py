from sqlalchemy import func, case, extract, and_, or_
from sqlalchemy.orm import aliased
from src.app import db
from src.models.ciclo import Ciclo
from src.models.inscripcion import Inscripcion
from src.models.persona import Persona
from src.models.paquete import Paquete
from src.models.pago import Pago
from src.models.asistencia import Asistencia
from src.models.horario import Horario
from src.models.horario_sesion import HorarioSesion
from src.models.estilo import Estilo
from src.models.oferta import Oferta
from src.models.profesor import Profesor
from src.models.sala import Sala
from datetime import datetime, date


class DashboardRepository:
    
    def get_estadisticas_generales_ciclo(self, id_ciclo):
        """
        Obtiene KPIs generales de un ciclo específico
        """
        # Obtener información del ciclo
        ciclo = db.session.query(Ciclo).filter(Ciclo.id_ciclo == id_ciclo).first()
        
        if not ciclo:
            return None
        
        # Total de alumnas únicas inscritas en ofertas del ciclo
        total_alumnas = db.session.query(
            func.count(func.distinct(Inscripcion.Persona_id_persona))
        ).join(
            Paquete, Inscripcion.Paquete_id_paquete == Paquete.id_paquete
        ).join(
            Oferta, Paquete.Oferta_id_oferta == Oferta.id_oferta
        ).filter(
            Oferta.ciclo_id_ciclo == id_ciclo,
            Inscripcion.estado == 'ACTIVO'
        ).scalar() or 0
        
        # Ocupación promedio de horarios del ciclo
        ocupacion_promedio = db.session.query(
            func.avg(
                case(
                    (HorarioSesion.capacidad_maxima > 0, 
                     (HorarioSesion.cupos_ocupados * 100.0) / HorarioSesion.capacidad_maxima),
                    else_=0
                )
            )
        ).join(
            Horario, HorarioSesion.Horario_id_horario == Horario.id_horario
        ).join(
            Oferta, Horario.Oferta_id_oferta == Oferta.id_oferta
        ).filter(
            Oferta.ciclo_id_ciclo == id_ciclo,
            HorarioSesion.estado == True,
            HorarioSesion.cancelado == False
        ).scalar() or 0
        
        # Ingresos del mes actual (inscripciones del ciclo en el mes actual)
        mes_actual = datetime.now().month
        anio_actual = datetime.now().year
        
        ingresos_mes_actual = db.session.query(
            func.coalesce(func.sum(Pago.monto), 0)
        ).join(
            Inscripcion, Pago.Inscripcion_id_inscripcion == Inscripcion.id_inscripcion
        ).join(
            Paquete, Inscripcion.Paquete_id_paquete == Paquete.id_paquete
        ).join(
            Oferta, Paquete.Oferta_id_oferta == Oferta.id_oferta
        ).filter(
            Oferta.ciclo_id_ciclo == id_ciclo,
            extract('month', Pago.fecha_pago) == mes_actual,
            extract('year', Pago.fecha_pago) == anio_actual,
            Pago.estado == 'CONFIRMADO'
        ).scalar() or 0
        
        # Asistencia promedio del ciclo
        asistencia_promedio = db.session.query(
            func.avg(
                case(
                    (Asistencia.asistio == True, 100.0),
                    else_=0
                )
            )
        ).join(
            HorarioSesion, Asistencia.Horario_sesion_id_horario_sesion == HorarioSesion.id_horario_sesion
        ).join(
            Horario, HorarioSesion.Horario_id_horario == Horario.id_horario
        ).join(
            Oferta, Horario.Oferta_id_oferta == Oferta.id_oferta
        ).filter(
            Oferta.ciclo_id_ciclo == id_ciclo,
            Asistencia.estado == True
        ).scalar() or 0
        
        return {
            'ciclo': {
                'id_ciclo': ciclo.id_ciclo,
                'nombre_ciclo': ciclo.nombre,
                'fecha_inicio': ciclo.inicio.isoformat() if ciclo.inicio else None,
                'fecha_fin': ciclo.fin.isoformat() if ciclo.fin else None
            },
            'kpis': {
                'total_alumnas': int(total_alumnas),
                'ocupacion_promedio': round(float(ocupacion_promedio), 2),
                'ingresos_mes_actual': float(ingresos_mes_actual),
                'asistencia_promedio': round(float(asistencia_promedio), 2)
            }
        }
    
    def get_alumnas_por_estilo(self, id_ciclo):
        """
        Obtiene el total de alumnas inscritas por estilo en un ciclo
        """
        resultados = db.session.query(
            Estilo.id_estilo,
            Estilo.nombre_estilo,
            func.count(func.distinct(Inscripcion.Persona_id_persona)).label('total_alumnas')
        ).join(
            Horario, Estilo.id_estilo == Horario.Estilo_id_estilo
        ).join(
            Oferta, Horario.Oferta_id_oferta == Oferta.id_oferta
        ).join(
            Paquete, Paquete.Oferta_id_oferta == Oferta.id_oferta
        ).join(
            Inscripcion, Inscripcion.Paquete_id_paquete == Paquete.id_paquete
        ).filter(
            Oferta.ciclo_id_ciclo == id_ciclo,
            Inscripcion.estado == 'ACTIVO',
            Estilo.estado == True
        ).group_by(
            Estilo.id_estilo,
            Estilo.nombre_estilo
        ).order_by(
            func.count(func.distinct(Inscripcion.Persona_id_persona)).desc()
        ).all()
        
        estilos = [
            {
                'id_estilo': r.id_estilo,
                'nombre_estilo': r.nombre_estilo,
                'total_alumnas': r.total_alumnas
            }
            for r in resultados
        ]
        
        return {
            'ciclo_id': id_ciclo,
            'estilos': estilos
        }
    
    def get_ocupacion_por_estilo(self, id_ciclo):
        """
        Obtiene la ocupación y capacidad por estilo en un ciclo
        """
        resultados = db.session.query(
            Estilo.nombre_estilo,
            func.sum(HorarioSesion.capacidad_maxima).label('capacidad_total'),
            func.sum(HorarioSesion.cupos_ocupados).label('cupos_ocupados')
        ).join(
            Horario, Estilo.id_estilo == Horario.Estilo_id_estilo
        ).join(
            HorarioSesion, Horario.id_horario == HorarioSesion.Horario_id_horario
        ).join(
            Oferta, Horario.Oferta_id_oferta == Oferta.id_oferta
        ).filter(
            Oferta.ciclo_id_ciclo == id_ciclo,
            HorarioSesion.estado == True,
            HorarioSesion.cancelado == False,
            Estilo.estado == True
        ).group_by(
            Estilo.nombre_estilo
        ).all()
        
        ocupacion = []
        for r in resultados:
            capacidad_total = r.capacidad_total or 0
            cupos_ocupados = r.cupos_ocupados or 0
            porcentaje = (cupos_ocupados * 100.0 / capacidad_total) if capacidad_total > 0 else 0
            
            ocupacion.append({
                'nombre_estilo': r.nombre_estilo,
                'capacidad_total': capacidad_total,
                'cupos_ocupados': cupos_ocupados,
                'porcentaje_ocupacion': round(porcentaje, 2)
            })
        
        return {
            'ciclo_id': id_ciclo,
            'ocupacion': ocupacion
        }
    
    def get_ingresos_mensuales(self, anio=None, meses=6):
        """
        Obtiene los ingresos mensuales (últimos N meses)
        """
        if anio is None:
            anio = datetime.now().year
        
        # Obtener ingresos por mes
        resultados = db.session.query(
            extract('month', Pago.fecha_pago).label('mes_numero'),
            func.sum(Pago.monto).label('total_ingresos')
        ).filter(
            extract('year', Pago.fecha_pago) == anio,
            Pago.estado == 'CONFIRMADO'
        ).group_by(
            extract('month', Pago.fecha_pago)
        ).order_by(
            extract('month', Pago.fecha_pago)
        ).all()
        
        meses_nombres = {
            1: 'Enero', 2: 'Febrero', 3: 'Marzo', 4: 'Abril',
            5: 'Mayo', 6: 'Junio', 7: 'Julio', 8: 'Agosto',
            9: 'Septiembre', 10: 'Octubre', 11: 'Noviembre', 12: 'Diciembre'
        }
        
        ingresos = [
            {
                'mes': meses_nombres.get(int(r.mes_numero), ''),
                'mes_numero': int(r.mes_numero),
                'total_ingresos': float(r.total_ingresos or 0)
            }
            for r in resultados
        ]
        
        # Limitar a los últimos N meses
        ingresos = ingresos[-meses:] if len(ingresos) > meses else ingresos
        
        return {
            'periodo': str(anio),
            'ingresos': ingresos
        }
    
    def get_top_profesores(self, id_ciclo, limit=10):
        """
        Obtiene los profesores más populares por asistencia
        """
        resultados = db.session.query(
            Profesor.id_profesor,
            Persona.nombre,
            Persona.apellido,
            func.count(Asistencia.id_asistencia).label('total_asistencias'),
            func.avg(
                case(
                    (Asistencia.asistio == True, 100.0),
                    else_=0
                )
            ).label('tasa_asistencia')
        ).join(
            Persona, Profesor.Persona_id_persona == Persona.id_persona
        ).join(
            Horario, Profesor.id_profesor == Horario.Profesor_id_profesor
        ).join(
            HorarioSesion, Horario.id_horario == HorarioSesion.Horario_id_horario
        ).join(
            Asistencia, HorarioSesion.id_horario_sesion == Asistencia.Horario_sesion_id_horario_sesion
        ).join(
            Oferta, Horario.Oferta_id_oferta == Oferta.id_oferta
        ).filter(
            Oferta.ciclo_id_ciclo == id_ciclo,
            Asistencia.estado == True,
            Profesor.estado == True
        ).group_by(
            Profesor.id_profesor,
            Persona.nombre,
            Persona.apellido
        ).order_by(
            func.count(Asistencia.id_asistencia).desc()
        ).limit(limit).all()
        
        profesores = [
            {
                'id_profesor': r.id_profesor,
                'nombre_completo': f"{r.nombre} {r.apellido}",
                'total_asistencias': r.total_asistencias,
                'tasa_asistencia': round(float(r.tasa_asistencia or 0), 2)
            }
            for r in resultados
        ]
        
        return {
            'ciclo_id': id_ciclo,
            'profesores': profesores
        }
    
    def get_horarios_mas_demandados(self, id_ciclo):
        """
        Obtiene los días y horarios con mayor ocupación
        """
        resultados = db.session.query(
            HorarioSesion.dia,
            HorarioSesion.hora_inicio,
            Estilo.nombre_estilo,
            func.avg(
                case(
                    (HorarioSesion.capacidad_maxima > 0,
                     (HorarioSesion.cupos_ocupados * 100.0) / HorarioSesion.capacidad_maxima),
                    else_=0
                )
            ).label('ocupacion_promedio'),
            func.count(HorarioSesion.id_horario_sesion).label('total_sesiones')
        ).join(
            Horario, HorarioSesion.Horario_id_horario == Horario.id_horario
        ).join(
            Estilo, Horario.Estilo_id_estilo == Estilo.id_estilo
        ).join(
            Oferta, Horario.Oferta_id_oferta == Oferta.id_oferta
        ).filter(
            Oferta.ciclo_id_ciclo == id_ciclo,
            HorarioSesion.estado == True,
            HorarioSesion.cancelado == False
        ).group_by(
            HorarioSesion.dia,
            HorarioSesion.hora_inicio,
            Estilo.nombre_estilo
        ).order_by(
            func.avg(
                case(
                    (HorarioSesion.capacidad_maxima > 0,
                     (HorarioSesion.cupos_ocupados * 100.0) / HorarioSesion.capacidad_maxima),
                    else_=0
                )
            ).desc()
        ).limit(10).all()
        
        dias_nombres = {
            1: 'Lunes', 2: 'Martes', 3: 'Miércoles', 4: 'Jueves',
            5: 'Viernes', 6: 'Sábado', 7: 'Domingo'
        }
        
        horarios = [
            {
                'dia': dias_nombres.get(r.dia, f'Día {r.dia}'),
                'dia_numero': r.dia,
                'hora_inicio': r.hora_inicio.strftime('%H:%M') if r.hora_inicio else None,
                'estilo': r.nombre_estilo,
                'ocupacion_promedio': round(float(r.ocupacion_promedio or 0), 2),
                'total_sesiones': r.total_sesiones
            }
            for r in resultados
        ]
        
        return {
            'ciclo_id': id_ciclo,
            'horarios': horarios
        }
    
    def get_estado_pagos(self, id_ciclo):
        """
        Distribución de pagos por estado
        """
        resultados = db.session.query(
            Pago.estado,
            func.count(Pago.id_pago).label('total_pagos'),
            func.sum(Pago.monto).label('monto_total')
        ).join(
            Inscripcion, Pago.Inscripcion_id_inscripcion == Inscripcion.id_inscripcion
        ).join(
            Paquete, Inscripcion.Paquete_id_paquete == Paquete.id_paquete
        ).join(
            Oferta, Paquete.Oferta_id_oferta == Oferta.id_oferta
        ).filter(
            Oferta.ciclo_id_ciclo == id_ciclo
        ).group_by(
            Pago.estado
        ).all()
        
        pagos = [
            {
                'estado': r.estado,
                'total_pagos': r.total_pagos,
                'monto_total': float(r.monto_total or 0)
            }
            for r in resultados
        ]
        
        return {
            'ciclo_id': id_ciclo,
            'distribucion_pagos': pagos
        }
    
    def get_asistencia_por_mes(self, id_ciclo):
        """
        Tendencia de asistencia por mes en el ciclo
        """
        resultados = db.session.query(
            extract('month', Asistencia.fecha).label('mes_numero'),
            func.count(Asistencia.id_asistencia).label('total_registros'),
            func.sum(
                case(
                    (Asistencia.asistio == True, 1),
                    else_=0
                )
            ).label('total_asistencias'),
            func.avg(
                case(
                    (Asistencia.asistio == True, 100.0),
                    else_=0
                )
            ).label('tasa_asistencia')
        ).join(
            HorarioSesion, Asistencia.Horario_sesion_id_horario_sesion == HorarioSesion.id_horario_sesion
        ).join(
            Horario, HorarioSesion.Horario_id_horario == Horario.id_horario
        ).join(
            Oferta, Horario.Oferta_id_oferta == Oferta.id_oferta
        ).filter(
            Oferta.ciclo_id_ciclo == id_ciclo,
            Asistencia.estado == True
        ).group_by(
            extract('month', Asistencia.fecha)
        ).order_by(
            extract('month', Asistencia.fecha)
        ).all()
        
        meses_nombres = {
            1: 'Enero', 2: 'Febrero', 3: 'Marzo', 4: 'Abril',
            5: 'Mayo', 6: 'Junio', 7: 'Julio', 8: 'Agosto',
            9: 'Septiembre', 10: 'Octubre', 11: 'Noviembre', 12: 'Diciembre'
        }
        
        asistencias = []
        for r in resultados:
            if r.mes_numero is not None:
                asistencias.append({
                    'mes': meses_nombres.get(int(r.mes_numero), ''),
                    'mes_numero': int(r.mes_numero),
                    'total_registros': r.total_registros,
                    'total_asistencias': r.total_asistencias,
                    'tasa_asistencia': round(float(r.tasa_asistencia or 0), 2)
                })
        
        return {
            'ciclo_id': id_ciclo,
            'asistencia_mensual': asistencias
        }
    
    def get_alumnos_nuevos_vs_recurrentes(self, id_ciclo):
        """
        Comparación de alumnos nuevos vs recurrentes
        """
        # Obtener fecha de inicio del ciclo
        ciclo = db.session.query(Ciclo).filter(Ciclo.id_ciclo == id_ciclo).first()
        if not ciclo:
            return None
        
        # Obtener todos los alumnos inscritos en este ciclo
        alumnos_ciclo_actual = db.session.query(
            Inscripcion.Persona_id_persona
        ).join(
            Paquete, Inscripcion.Paquete_id_paquete == Paquete.id_paquete
        ).join(
            Oferta, Paquete.Oferta_id_oferta == Oferta.id_oferta
        ).filter(
            Oferta.ciclo_id_ciclo == id_ciclo,
            Inscripcion.estado == 'ACTIVO'
        ).distinct().all()
        
        total_alumnos = len(alumnos_ciclo_actual)
        
        # Para cada alumno, verificar si tuvo inscripciones previas
        alumnos_recurrentes = 0
        for alumno in alumnos_ciclo_actual:
            # Verificar si tiene inscripciones en ciclos anteriores
            tiene_inscripcion_previa = db.session.query(
                func.count(Inscripcion.id_inscripcion)
            ).join(
                Paquete, Inscripcion.Paquete_id_paquete == Paquete.id_paquete
            ).join(
                Oferta, Paquete.Oferta_id_oferta == Oferta.id_oferta
            ).filter(
                Inscripcion.Persona_id_persona == alumno.Persona_id_persona,
                Oferta.fecha_inicio < ciclo.inicio
            ).scalar()
            
            if tiene_inscripcion_previa and tiene_inscripcion_previa > 0:
                alumnos_recurrentes += 1
        
        alumnos_nuevos = total_alumnos - alumnos_recurrentes
        
        return {
            'ciclo_id': id_ciclo,
            'total_alumnos': total_alumnos,
            'alumnos_nuevos': alumnos_nuevos,
            'alumnos_recurrentes': alumnos_recurrentes,
            'porcentaje_nuevos': round((alumnos_nuevos * 100.0 / total_alumnos), 2) if total_alumnos > 0 else 0,
            'porcentaje_recurrentes': round((alumnos_recurrentes * 100.0 / total_alumnos), 2) if total_alumnos > 0 else 0
        }
