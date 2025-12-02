from src.models.horario_sesion import HorarioSesion
from src.app import db

class HorarioSesionRepository:
    """
    Repositorio para operaciones de base de datos de HorarioSesion
    """

    @staticmethod
    def get_by_id(sesion_id):
        """
        Obtiene una sesión por su ID
        """
        return HorarioSesion.query.get(sesion_id)

    @staticmethod
    def get_by_horario(horario_id):
        """
        Obtiene todas las sesiones de un horario
        """
        return HorarioSesion.query.filter_by(Horario_id_horario=horario_id).all()

    @staticmethod
    def get_active_by_horario(horario_id):
        """
        Obtiene todas las sesiones activas de un horario
        """
        return HorarioSesion.query.filter_by(Horario_id_horario=horario_id, estado=True).all()

    @staticmethod
    def update(sesion_id, sesion_data):
        """
        Actualiza una sesión existente
        """
        sesion = HorarioSesion.query.get(sesion_id)
        if sesion:
            sesion.dia = sesion_data.get('dia', sesion.dia)
            sesion.hora_inicio = sesion_data.get('hora_inicio', sesion.hora_inicio)
            sesion.hora_fin = sesion_data.get('hora_fin', sesion.hora_fin)
            sesion.duracion = sesion_data.get('duracion', sesion.duracion)
            sesion.fecha = sesion_data.get('fecha', sesion.fecha)
            sesion.cancelado = sesion_data.get('cancelado', sesion.cancelado)
            sesion.motivo = sesion_data.get('motivo', sesion.motivo)
            sesion.estado = sesion_data.get('estado', sesion.estado)
            db.session.commit()
        return sesion

    @staticmethod
    def delete(sesion_id):
        """
        Elimina una sesión (borrado lógico cambiando estado)
        """
        sesion = HorarioSesion.query.get(sesion_id)
        if sesion:
            sesion.estado = False
            db.session.commit()
        return sesion

    @staticmethod
    def get_sesiones_agenda(fecha_desde, fecha_hasta):
        """
        Obtiene todas las sesiones activas en un rango de fechas
        con toda la información relacionada (horario, oferta, estilo, profesor, sala, paquetes)
        """
        from src.models.horario import Horario
        from src.models.oferta import Oferta
        from src.models.estilo import Estilo
        from src.models.profesor import Profesor
        from src.models.persona import Persona
        from src.models.sala import Sala
        from src.models.ciclo import Ciclo
        from src.models.paquete import Paquete
        
        # Query principal con todas las relaciones
        sesiones_query = db.session.query(
            HorarioSesion, 
            Horario, 
            Oferta, 
            Estilo, 
            Profesor, 
            Persona, 
            Sala,
            Ciclo
        ).join(
            Horario, HorarioSesion.Horario_id_horario == Horario.id_horario
        ).join(
            Oferta, Horario.Oferta_id_oferta == Oferta.id_oferta
        ).join(
            Estilo, Horario.Estilo_id_estilo == Estilo.id_estilo
        ).join(
            Profesor, Horario.Profesor_id_profesor == Profesor.id_profesor
        ).join(
            Persona, Profesor.Persona_id_persona == Persona.id_persona
        ).join(
            Sala, Horario.Sala_id_sala == Sala.id_sala
        ).join(
            Ciclo, Oferta.ciclo_id_ciclo == Ciclo.id_ciclo
        ).filter(
            HorarioSesion.fecha >= fecha_desde,
            HorarioSesion.fecha <= fecha_hasta,
            HorarioSesion.estado == True,
            Horario.estado == True,
            Oferta.estado == True
        ).order_by(
            HorarioSesion.fecha,
            HorarioSesion.hora_inicio
        ).all()
        
        # Para cada sesión, obtener los paquetes de su oferta
        result = []
        for sesion_data in sesiones_query:
            sesion, horario, oferta, estilo, profesor, persona, sala, ciclo = sesion_data
            
            # Obtener paquetes activos de la oferta
            paquetes = Paquete.query.filter_by(
                Oferta_id_oferta=oferta.id_oferta,
                estado=True
            ).all()
            
            result.append({
                'sesion_data': sesion_data,
                'paquetes': paquetes
            })
        
        return result

    @staticmethod
    def increment_cupos_ocupados(sesion_id):
        """
        Incrementa los cupos ocupados de una sesión en 1
        Valida que no se exceda la capacidad máxima
        """
        sesion = HorarioSesion.query.get(sesion_id)
        if sesion:
            if sesion.cupos_ocupados < sesion.capacidad_maxima:
                sesion.cupos_ocupados += 1
                db.session.flush()
                return True
            else:
                return False  # No hay cupos disponibles
        return None  # Sesión no encontrada

    @staticmethod
    def decrement_cupos_ocupados(sesion_id):
        """
        Decrementa los cupos ocupados de una sesión en 1
        Valida que no sea menor a 0
        """
        sesion = HorarioSesion.query.get(sesion_id)
        if sesion:
            if sesion.cupos_ocupados > 0:
                sesion.cupos_ocupados -= 1
                db.session.flush()
                return True
            else:
                return False  # Ya está en 0
        return None  # Sesión no encontrada

    @staticmethod
    def get_capacidad_info(sesion_id):
        """
        Obtiene información de capacidad de una sesión
        """
        sesion = HorarioSesion.query.get(sesion_id)
        if sesion:
            return {
                'capacidad_maxima': sesion.capacidad_maxima,
                'cupos_ocupados': sesion.cupos_ocupados,
                'cupos_disponibles': sesion.capacidad_maxima - sesion.cupos_ocupados
            }
        return None

    @staticmethod
    def bulk_increment_cupos(sesiones_ids):
        """
        Incrementa cupos ocupados para múltiples sesiones
        Retorna lista de sesiones que se pudieron actualizar
        """
        sesiones_actualizadas = []
        sesiones_sin_cupo = []
        
        for sesion_id in sesiones_ids:
            result = HorarioSesionRepository.increment_cupos_ocupados(sesion_id)
            if result is True:
                sesiones_actualizadas.append(sesion_id)
            elif result is False:
                sesiones_sin_cupo.append(sesion_id)
        
        return {
            'actualizadas': sesiones_actualizadas,
            'sin_cupo': sesiones_sin_cupo
        }
