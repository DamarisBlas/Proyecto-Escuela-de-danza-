from ..app import db
from sqlalchemy import Column, Integer, Boolean, DateTime, ForeignKey, BigInteger

class NotificacionPersona(db.Model):
    __tablename__ = 'notificacion_persona'
    
    id_notificacion_persona = Column(Integer, primary_key=True, autoincrement=True)
    Notificacion_id_notificacion = Column(Integer, ForeignKey('notificacion.id_notificacion'), nullable=False)
    Persona_id_persona = Column(Integer, ForeignKey('Persona.id_persona'), nullable=False)
    Inscricpcion_id_inscricpcion = Column(Integer, ForeignKey('Inscripcion.id_inscripcion'), nullable=True)
    leida = Column(Boolean, nullable=False, default=False)
    fecha_leida = Column(DateTime, nullable=True)
    enviada_sistema = Column(Boolean, nullable=True, default=True)
    enviada_whatsapp = Column(Boolean, nullable=True, default=False)
    enviada_push = Column(Boolean, nullable=True, default=False)
    fecha_envio_push = Column(DateTime, nullable=True)
    fecha_envio_whatsapp = Column(DateTime, nullable=True)
    estado = Column(Boolean, nullable=False, default=True)

    def __repr__(self):
        return f"<NotificacionPersona {self.id_notificacion_persona}>"

    def to_dict(self):
        """
        Convierte el objeto NotificacionPersona a diccionario
        """
        return {
            "id_notificacion_persona": self.id_notificacion_persona,
            "Notificacion_id_notificacion": self.Notificacion_id_notificacion,
            "Persona_id_persona": self.Persona_id_persona,
            "Inscricpcion_id_inscricpcion": self.Inscricpcion_id_inscricpcion,
            "leida": self.leida,
            "fecha_leida": self.fecha_leida.isoformat() if self.fecha_leida else None,
            "enviada_sistema": self.enviada_sistema,
            "enviada_whatsapp": self.enviada_whatsapp,
            "enviada_push": self.enviada_push,
            "fecha_envio_push": self.fecha_envio_push.isoformat() if self.fecha_envio_push else None,
            "fecha_envio_whatsapp": self.fecha_envio_whatsapp.isoformat() if self.fecha_envio_whatsapp else None,
            "estado": self.estado
        }