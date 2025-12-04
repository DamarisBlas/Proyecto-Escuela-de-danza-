from ..app import db
from sqlalchemy import Column, Integer, String, Date, Text, Boolean, ForeignKey, BigInteger

class Elenco(db.Model):
    __tablename__ = 'Elenco'
    id_elenco = Column(Integer, primary_key=True, autoincrement=True)
    Persona_id_persona = Column(BigInteger, ForeignKey('Persona.id_persona'), nullable=False)
    departamento = Column(String(20), nullable=True)
    cumpleanos = Column(Date, nullable=True)
    signo = Column(String(30), nullable=False)
    instagram = Column(Text, nullable=True)
    estado = Column(Boolean, nullable=False, default=True)

    def __repr__(self):
        return f"<Elenco {self.id_elenco} persona={self.Persona_id_persona}>"