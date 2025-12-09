from ..app import db
from sqlalchemy import Column, BigInteger, Integer, Boolean, ForeignKey, String, Text

class Alumno(db.Model):
    __tablename__ = 'Alumno'
    Persona_id_persona = Column(Integer, ForeignKey('Persona.id_persona'),  primary_key=True, nullable=False)
    departamento = Column(String(20), nullable=True, default="La Paz")
    estado = Column(Boolean, nullable=False, default=True)
    zona = Column(Text, nullable=True)
    
    def __repr__(self):
        return f"<Alumno persona={self.Persona_id_persona}>"
