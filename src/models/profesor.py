from ..app import db
from sqlalchemy import Column, Integer, String, Text, Boolean, ForeignKey, Date

class Profesor(db.Model):
    __tablename__ = 'Profesor'
    Persona_id_persona = Column(Integer, ForeignKey('Persona.id_persona') ,  primary_key=True, nullable=False)
    frase = Column(String(50), nullable=True)
    descripcion = Column(String(500), nullable=True)
    redes_sociales = Column(Text, nullable=True)
    pais_origen = Column(String(50), nullable=True)
    cuando_comenzo_danza = Column(Date, nullable=True)
    signo = Column(String(20), nullable=True)
    musica = Column(String(200), nullable=True)
    
    estado = Column(Boolean, nullable=False, default=False)
    
    def to_dict(self):
        return {
            
            'Persona_id_persona': self.Persona_id_persona,
            'frase': self.frase,
            'descripcion': self.descripcion,
            'redes_sociales': self.redes_sociales,
            'pais_origen': self.pais_origen,
            'cuando_comenzo_danza': self.cuando_comenzo_danza.isoformat() if self.cuando_comenzo_danza else None,
            'signo': self.signo,
            'musica': self.musica,
           
            'estado': self.estado
        }
      
    def __repr__(self):
        return f"<Profesor persona={self.Persona_id_persona}>"
