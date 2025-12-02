from ..app import db
from sqlalchemy import Column, Integer, String, Text, Boolean, ForeignKey

class Profesor(db.Model):
    __tablename__ = 'Profesor'
    id_profesor = Column(Integer, primary_key=True, autoincrement=True)
    Persona_id_persona = Column(Integer, ForeignKey('Persona.id_persona'), nullable=False)
    frase = Column(String(50), nullable=True)
    descripcion = Column(String(500), nullable=True)
    redes_sociales = Column(Text, nullable=True)
    cuidad = Column(String(50), nullable=True)
    experiencia = Column(Integer, nullable=True)
    signo = Column(String(20), nullable=True)
    musica = Column(String(200), nullable=True)
    estilos = Column(String(200), nullable=True)
    estado = Column(Boolean, nullable=False, default=False)
    
    def to_dict(self):
        return {
            'id_profesor': self.id_profesor,
            'Persona_id_persona': self.Persona_id_persona,
            'frase': self.frase,
            'descripcion': self.descripcion,
            'redes_sociales': self.redes_sociales,
            'cuidad': self.cuidad,
            'experiencia': self.experiencia,
            'signo': self.signo,
            'musica': self.musica,
            'estilos': self.estilos,
            'estado': self.estado
        }
    
    def __repr__(self):
        return f"<Profesor {self.id_profesor} persona={self.Persona_id_persona}>"
