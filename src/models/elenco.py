from ..app import db
from sqlalchemy import Column, Integer, String, Date, Text, Boolean, ForeignKey, BigInteger

class Elenco(db.Model):
    __tablename__ = 'Elenco'
  
    Persona_id_persona = Column(Integer, ForeignKey('Persona.id_persona'),primary_key=True, nullable=False)
    departamento = Column(String(20), nullable=True)
    cumpleanos = Column(Date, nullable=True)
    signo = Column(String(30), nullable=False)
    instagram = Column(Text, nullable=True)
    estado = Column(Boolean, nullable=False, default=True)

    def __repr__(self):
        return f"<Elenco persona={self.Persona_id_persona}>"