from sqlalchemy import Column, BigInteger, Integer, Text, String, DateTime, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.ext.declarative import declarative_base
from src.app import db
from datetime import datetime

class Permiso(db.Model):
    __tablename__ = 'Permiso'
    
    # Campos de la tabla (nombres en minúsculas como están en la BD)
    permiso_id = Column(Integer, primary_key=True, autoincrement=True)
    persona_id_persona = Column('persona_id_persona', Integer, ForeignKey('Persona.id_persona'), nullable=False)
    inscripcion_id_inscripcion = Column('inscripcion_id_inscripcion', Integer, ForeignKey('Inscripcion.id_inscripcion'), nullable=False)
    asistencia_original_id = Column('asistencia_original_id', Integer, ForeignKey('Asistencia.id_asistencia'), nullable=False)
    motivo = Column(Text, nullable=False)
    horario_sesion_id_horario_sesion = Column('horario_sesion_id_horario_sesion', Integer, ForeignKey('HorarioSesion.id_horario_sesion'), nullable=False)
    fecha_solicitud = Column(DateTime, nullable=False, default=datetime.utcnow)
    estado_permiso = Column(String(30), nullable=False, default='PENDIENTE')
    motivo_rechazo = Column(Text, nullable=True)
    fecha_respuesta = Column(DateTime, nullable=True)
    respondida_por = Column(Integer, ForeignKey('Persona.id_persona'), nullable=True)
    asistencia_reemplazo_id = Column('asistencia_reemplazo_id', Integer, ForeignKey('Asistencia.id_asistencia'), nullable=True)
    activo = Column(Boolean, nullable=False, default=True)
    
    # Relaciones comentadas temporalmente para evitar conflictos
    # Se pueden activar después cuando se configuren correctamente las relaciones bidireccionales
    # persona = relationship("Persona", foreign_keys=[Persona_id_persona])
    # inscripcion = relationship("Inscripcion")
    # asistencia_original = relationship("Asistencia", foreign_keys=[Asistencia_original_id])
    # horario_sesion = relationship("HorarioSesion")
    # respondida_por_persona = relationship("Persona", foreign_keys=[respondida_por])
    # asistencia_reemplazo = relationship("Asistencia", foreign_keys=[Asistencia_reemplazo_id])
    
    def __repr__(self):
        return f'<Permiso {self.permiso_id}: {self.estado_permiso}>'
    
    def to_dict(self):
        return {
            'permiso_id': self.permiso_id,
            'persona_id_persona': self.persona_id_persona,
            'inscripcion_id_inscripcion': self.inscripcion_id_inscripcion,
            'asistencia_original_id': self.asistencia_original_id,
            'motivo': self.motivo,
            'horario_sesion_id_horario_sesion': self.horario_sesion_id_horario_sesion,
            'fecha_solicitud': self.fecha_solicitud.isoformat() if self.fecha_solicitud else None,
            'estado_permiso': self.estado_permiso,
            'motivo_rechazo': self.motivo_rechazo,
            'fecha_respuesta': self.fecha_respuesta.isoformat() if self.fecha_respuesta else None,
            'respondida_por': self.respondida_por,
            'asistencia_reemplazo_id': self.asistencia_reemplazo_id,
            'activo': self.activo
        }