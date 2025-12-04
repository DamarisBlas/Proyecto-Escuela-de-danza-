from ..app import db
from sqlalchemy import Column, Integer, Time, Boolean, ForeignKey, Numeric, BigInteger, String

class Horario(db.Model):
    __tablename__ = 'Horario'
    id_horario = Column(BigInteger, primary_key=True, autoincrement=True)
    Oferta_id_oferta = Column(Integer, ForeignKey('Oferta.id_oferta'), nullable=False)
    Estilo_id_estilo = Column(Integer, ForeignKey('Estilo.id_estilo'), nullable=False)
    nivel = Column(Integer, nullable=False) #  1 Basico,2 Intermedio,3 Avanzado,4 Multinivel
    Profesor_id_profesor = Column(Integer, ForeignKey('Profesor.id_profesor'), nullable=False)
    Sala_id_sala = Column(Integer, ForeignKey('Sala.id_sala'), nullable=False)
    capacidad = Column(Integer, nullable=False)
    estado = Column(Boolean, nullable=False, default=True)
    #array de dias 1 lunes, 2 martes, 3 miercoles, 4 jueves, 5 viernes, 6 sabado, 7 domingo
    dias = Column(String(20), nullable=False) 
    hora_inicio = Column(Time, nullable=False)
    hora_fin = Column(Time, nullable=False) 

    def __repr__(self):
        return f"<Horario {self.id_horario} oferta={self.Oferta_id_oferta}>"
    
    def to_dict(self):
        return {
            'id_horario': self.id_horario,
            'oferta_id': self.Oferta_id_oferta,
            'estilo_id': self.Estilo_id_estilo,
            'nivel': self.nivel,
            'profesor_id': self.Profesor_id_profesor,
            'sala_id': self.Sala_id_sala,
            'capacidad': self.capacidad,
            'estado': self.estado,
            'dias': self.dias,
            'hora_inicio': self.hora_inicio.strftime('%H:%M') if self.hora_inicio else None,
            'hora_fin': self.hora_fin.strftime('%H:%M') if self.hora_fin else None
        }
