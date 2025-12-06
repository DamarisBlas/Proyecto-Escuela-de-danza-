from ..app import db
from sqlalchemy import Column, BigInteger, Integer, Boolean, ForeignKey, String

class Alumno(db.Model):
    __tablename__ = 'Alumno'
    Persona_id_persona = Column(Integer, ForeignKey('Persona.id_persona'),  primary_key=True, nullable=False)
    departamento = Column(String(20), nullable=True)
    estado = Column(Boolean, nullable=False, default=True)

    def __repr__(self):
        return f"<Alumno persona={self.Persona_id_persona}>"
