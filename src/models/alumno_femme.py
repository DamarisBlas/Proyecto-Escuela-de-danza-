from ..app import db
from sqlalchemy import Column, Integer, String, Date, Boolean, ForeignKey, BigInteger

class AlumnoFemme(db.Model):
    __tablename__ = 'Alumno_Femme'
   
    Persona_id_persona = Column(Integer, ForeignKey('Persona.id_persona'),primary_key=True,nullable=False)
    cumpleanos = Column(Date, nullable=False)
    signo = Column(String(30), nullable=False)
    departamento = Column(String(20), nullable=False)
    estado = Column(Boolean, nullable=False, default=True)

    def __repr__(self):
        return f"<AlumnoFemme  persona={self.Persona_id_persona}>"