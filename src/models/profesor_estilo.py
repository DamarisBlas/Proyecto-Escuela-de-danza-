from ..app import db
from sqlalchemy import Column, Integer, Boolean, DateTime, ForeignKey, BigInteger

class ProfesorEstilo(db.Model):
    __tablename__ = 'profesor_estilo'
    Profesor_id_profesor = Column(Integer, ForeignKey('Profesor.Persona_id_persona'), primary_key=True, nullable=False)
    Estilo_id_estilo = Column(Integer, ForeignKey('Estilo.id_estilo'), primary_key=True, nullable=False)
    estado = Column(Boolean, nullable=False, default=True)

    def __repr__(self):
        return f"<ProfesorEstilo profesor={self.Profesor_id_profesor} estilo={self.Estilo_id_estilo}>"
    
    def to_dict(self):
        """
        Convierte el objeto ProfesorEstilo a diccionario
        """
        return {
            "Profesor_id_profesor": self.Profesor_id_profesor,
            "Estilo_id_estilo": self.Estilo_id_estilo,
            "estado": self.estado
        }