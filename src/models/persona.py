from ..app import db
from sqlalchemy import Column, Integer, String, Text, DateTime, Boolean, BigInteger
from datetime import datetime

class Persona(db.Model):
    __tablename__ = 'Persona'
    id_persona = Column(Integer, primary_key=True, autoincrement=True)
    nombre = Column(String(50), nullable=False)
    apellido_paterno = Column(String(50), nullable=True)
    apellido_materno = Column(String(50), nullable=True)
    email = Column(String(50), nullable=True)
    celular = Column(String(50), nullable=True)
    password = Column(Text, nullable=True)
    fecha_creacion = Column(DateTime, nullable=False, default=datetime.utcnow)
    solicitud_user_especial = Column(Boolean, nullable=False, default=False)
    estado = Column(Boolean, nullable=False, default=True) #Borrado lógico

    tipo_cuenta = Column(String(20), nullable=True) #Para ver si es de tipo profesor, alumno, director, elenco, alumno femme
    temporal = Column(Boolean, nullable=True, default=False) #Para un usuario temporal

    def to_dict(self):
        return {
            'id_persona': self.id_persona,
            'nombre': self.nombre,
            'apellido_paterno': self.apellido_paterno,
            'apellido_materno': self.apellido_materno,
            'email': self.email,
            'celular': self.celular,
            'fecha_creacion': self.fecha_creacion.isoformat() if self.fecha_creacion else None,
            'solicitud_user_especial': self.solicitud_user_especial,
            'estado': self.estado,
            'tipo_cuenta': self.tipo_cuenta,
            'temporal': self.temporal
        }

    def __repr__(self):
        return f"<Persona {self.nombre} {self.apellido}>"
