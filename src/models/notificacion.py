from ..app import db
from sqlalchemy import Column, Integer, String, Date, Boolean, ForeignKey, Text

class Notificacion(db.Model):
    __tablename__ = 'notificacion'
    
    id_notificacion = Column(Integer, primary_key=True, autoincrement=True)
    titulo = Column(String(100), nullable=False)
    mensaje = Column(Text, nullable=False)
    tipo = Column(String(50), nullable=False)
    categoria = Column(String(50), nullable=False)
    prioridad = Column(String(50), nullable=False)
    fecha_creacion = Column(Date, nullable=False)
    creado_por = Column(Integer, nullable=True)
    estado = Column(Boolean, nullable=False, default=True)

    def __repr__(self):
        return f"<Notificacion {self.titulo}>"

    def to_dict(self):
        """
        Convierte el objeto Notificacion a diccionario
        """
        return {
            "id_notificacion": self.id_notificacion,
            "titulo": self.titulo,
            "mensaje": self.mensaje,
            "tipo": self.tipo,
            "categoria": self.categoria,
            "prioridad": self.prioridad,
            "fecha_creacion": self.fecha_creacion.isoformat() if self.fecha_creacion else None,
            "creado_por": self.creado_por,
            "estado": self.estado
        }