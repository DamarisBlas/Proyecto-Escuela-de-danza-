from ..app import db
from sqlalchemy import Column, Integer, Time, Boolean, ForeignKey, Numeric, BigInteger, String, Date

class HorarioSesion(db.Model):
    __tablename__ = 'HorarioSesion'
    id_horario_sesion = Column(Integer, primary_key=True, autoincrement=True)
    Horario_id_horario = Column(Integer, ForeignKey('Horario.id_horario'), nullable=False)
    dia = Column(Integer, nullable=False)
    hora_inicio = Column(Time, nullable=False)
    hora_fin = Column(Time, nullable=False)
    duracion = Column(Numeric(5,2), nullable=False)
    fecha = Column(Date, nullable=False)
    estado = Column(Boolean, nullable=False, default=True)
    
    motivo = Column(String(1000), nullable=True)
    cancelado = Column(Boolean, nullable=False, default=False)
    
    capacidad_maxima = Column(Integer, nullable=False)
    cupos_ocupados = Column(Integer, nullable=False, default=0)
    
    es_reposicion = Column(Boolean, nullable=True, default=False)
    sesion_original_id = Column(Integer, ForeignKey('HorarioSesion.id_horario_sesion'), nullable=True)
    
    
    def __repr__(self):
        return f"<HorarioSesion {self.id_horario_sesion} horario={self.Horario_id_horario}>"
    
    def to_dict(self):
        return {
            'id_horario_sesion': self.id_horario_sesion,
            'horario_id': self.Horario_id_horario,
            'dia': self.dia,
            'hora_inicio': self.hora_inicio.strftime('%H:%M') if self.hora_inicio else None,
            'hora_fin': self.hora_fin.strftime('%H:%M') if self.hora_fin else None,
            'duracion': float(self.duracion),
            'fecha': self.fecha.isoformat() if self.fecha else None,
            'cancelado': self.cancelado,
            'motivo': self.motivo,
            'estado': self.estado,
            'capacidad_maxima': self.capacidad_maxima,
            'cupos_ocupados': self.cupos_ocupados,
            'cupos_disponibles': self.capacidad_maxima - self.cupos_ocupados,
            'es_reposicion': self.es_reposicion,
            'sesion_original_id': self.sesion_original_id,
           
        }
