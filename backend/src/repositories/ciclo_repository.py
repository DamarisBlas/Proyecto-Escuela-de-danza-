from src.models import Ciclo
from src.app import db

class CicloRepository:
    """
    Repositorio para operaciones de base de datos de Ciclo
    """

    @staticmethod
    def get_all():
        """
        Obtiene todos los ciclos
        """
        return Ciclo.query.all()

    @staticmethod
    def get_by_id(ciclo_id):
        """
        Obtiene un ciclo por su ID
        """
        return Ciclo.query.get(ciclo_id)

    @staticmethod
    def get_active():
        """
        Obtiene todos los ciclos activos
        """
        return Ciclo.query.filter_by(estado=True).all()

    @staticmethod
    def create(ciclo_data):
        """
        Crea un nuevo ciclo
        """
        nuevo_ciclo = Ciclo(
            nombre=ciclo_data['nombre'],
            inicio=ciclo_data['inicio'],
            fin=ciclo_data['fin'],
            estado=ciclo_data.get('estado', True)
        )
        db.session.add(nuevo_ciclo)
        db.session.commit()
        return nuevo_ciclo

    @staticmethod
    def update(ciclo_id, ciclo_data):
        """
        Actualiza un ciclo existente
        """
        ciclo = Ciclo.query.get(ciclo_id)
        if ciclo:
            ciclo.nombre = ciclo_data.get('nombre', ciclo.nombre)
            ciclo.inicio = ciclo_data.get('inicio', ciclo.inicio)
            ciclo.fin = ciclo_data.get('fin', ciclo.fin)
            ciclo.estado = ciclo_data.get('estado', ciclo.estado)
            db.session.commit()
        return ciclo

    @staticmethod
    def delete(ciclo_id):
        """
        Elimina un ciclo (borrado lógico cambiando estado)
        """
        ciclo = Ciclo.query.get(ciclo_id)
        if ciclo:
            ciclo.estado = False
            db.session.commit()
        return ciclo

    @staticmethod
    def get_by_name_active(nombre):
        """
        Obtiene un ciclo por nombre que esté activo
        """
        return Ciclo.query.filter_by(nombre=nombre, estado=True).first()

    @staticmethod
    def get_by_name_active_exclude_id(nombre, exclude_id):
        """
        Obtiene un ciclo por nombre que esté activo, excluyendo un ID específico
        """
        return Ciclo.query.filter(Ciclo.nombre == nombre, Ciclo.estado == True, Ciclo.id_ciclo != exclude_id).first()