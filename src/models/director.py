from ..app import db
from sqlalchemy import Column, Integer, String, ForeignKey, Boolean

class Director(db.Model):
    __tablename__ = 'Director'
    Persona_id_persona = Column(Integer, ForeignKey('Persona.id_persona'),  primary_key=True, nullable=False)
    departamento = Column(String(20), nullable=True)
    estado = Column(Boolean, nullable=False, default=True)

    def __repr__(self):
        return f"<Director {self.Persona_id_persona} departamento={self.departamento}>"
