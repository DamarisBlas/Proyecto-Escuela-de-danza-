from ..app import db
from sqlalchemy import Column, BigInteger, Integer, Boolean, ForeignKey, String

class Alumno(db.Model):
    __tablename__ = 'Alumno'
    id_alumno = Column(BigInteger, primary_key=True, autoincrement=True)
    Persona_id_persona = Column(Integer, ForeignKey('Persona.id_persona'), nullable=False)
    departamento = Column(String(20), nullable=True)
    estado = Column(Boolean, nullable=False, default=True)

    def __repr__(self):
        return f"<Alumno {self.id_alumno} persona={self.Persona_id_persona}>"
