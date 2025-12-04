from ..app import db
from sqlalchemy import Column, Integer, String, Date, Boolean, ForeignKey, BigInteger

class AlumnoFemme(db.Model):
    __tablename__ = 'Alumno_Femme'
    id_alumno_femme = Column(Integer, primary_key=True, autoincrement=True)
    Persona_id_persona = Column(BigInteger, ForeignKey('Persona.id_persona'), nullable=False)
    cumpleanos = Column(Date, nullable=False)
    signo = Column(String(30), nullable=False)
    departamento = Column(String(20), nullable=False)
    estado = Column(Boolean, nullable=False, default=True)

    def __repr__(self):
        return f"<AlumnoFemme {self.id_alumno_femme} persona={self.Persona_id_persona}>"