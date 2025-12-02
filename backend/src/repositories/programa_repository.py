from src.models import Programa
from src.app import db

class ProgramaRepository:
    """
    Repositorio para operaciones de base de datos de Programa
    """

    @staticmethod
    def get_all():
        """
        Obtiene todos los programas
        """
        return Programa.query.all()

    @staticmethod
    def get_by_id(programa_id):
        """
        Obtiene un programa por su ID
        """
        return Programa.query.get(programa_id)

    @staticmethod
    def get_active():
        """
        Obtiene todos los programas activos
        """
        return Programa.query.filter_by(estado=True).all()

    @staticmethod
    def create(programa_data):
        """
        Crea un nuevo programa
        """
        nuevo_programa = Programa(
            nombre_programa=programa_data['nombre_programa'],
            descricpcion_programa=programa_data['descricpcion_programa'],
            estado=programa_data.get('estado', True)
        )
        db.session.add(nuevo_programa)
        db.session.commit()
        return nuevo_programa

    @staticmethod
    def update(programa_id, programa_data):
        """
        Actualiza un programa existente
        """
        programa = Programa.query.get(programa_id)
        if programa:
            programa.nombre_programa = programa_data.get('nombre_programa', programa.nombre_programa)
            programa.descricpcion_programa = programa_data.get('descricpcion_programa', programa.descricpcion_programa)
            programa.estado = programa_data.get('estado', programa.estado)
            db.session.commit()
        return programa

    @staticmethod
    def delete(programa_id):
        """
        Elimina un programa (borrado lógico cambiando estado)
        """
        programa = Programa.query.get(programa_id)
        if programa:
            programa.estado = False
            db.session.commit()
        return programa

    @staticmethod
    def get_by_name_active(nombre_programa):
        """
        Obtiene un programa por nombre que esté activo
        """
        return Programa.query.filter_by(nombre_programa=nombre_programa, estado=True).first()

    @staticmethod
    def get_by_name_active_exclude_id(nombre_programa, exclude_id):
        """
        Obtiene un programa por nombre que esté activo, excluyendo un ID específico
        """
        return Programa.query.filter(Programa.nombre_programa == nombre_programa, Programa.estado == True, Programa.id_programa != exclude_id).first()