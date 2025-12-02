from src.models import Sala
from src.app import db

class SalaRepository:
    """
    Repositorio para operaciones de base de datos de Sala
    """

    @staticmethod
    def get_all():
        """
        Obtiene todas las salas
        """
        return Sala.query.all()

    @staticmethod
    def get_by_id(sala_id):
        """
        Obtiene una sala por su ID
        """
        return Sala.query.get(sala_id)

    @staticmethod
    def get_by_departamento(departamento):
        """
        Obtiene todas las salas de un departamento específico
        """
        return Sala.query.filter_by(departamento=departamento).all()

    @staticmethod
    def get_by_zona(zona):
        """
        Obtiene todas las salas de una zona específica (búsqueda case-insensitive)
        """
        return Sala.query.filter(Sala.zona.ilike(zona)).all()

    @staticmethod
    def get_active():
        """
        Obtiene todas las salas activas
        """
        return Sala.query.filter_by(estado=True).all()

    @staticmethod
    def get_active_by_departamento(departamento):
        """
        Obtiene todas las salas activas de un departamento específico
        """
        return Sala.query.filter_by(departamento=departamento, estado=True).all()

    @staticmethod
    def get_active_by_zona(zona):
        """
        Obtiene todas las salas activas de una zona específica (búsqueda case-insensitive)
        """
        return Sala.query.filter(Sala.zona.ilike(zona), Sala.estado == True).all()

    @staticmethod
    def create(sala_data):
        """
        Crea una nueva sala
        """
        nueva_sala = Sala(
            nombre_sala=sala_data['nombre_sala'],
            ubicacion=sala_data['ubicacion'],
            link_ubicacion=sala_data.get('link_ubicacion'),
            departamento=sala_data['departamento'],
            zona=sala_data['zona'],
            estado=sala_data.get('estado', True)
        )
        db.session.add(nueva_sala)
        db.session.commit()
        return nueva_sala

    @staticmethod
    def update(sala_id, sala_data):
        """
        Actualiza una sala existente
        """
        sala = Sala.query.get(sala_id)
        if sala:
            sala.nombre_sala = sala_data.get('nombre_sala', sala.nombre_sala)
            sala.ubicacion = sala_data.get('ubicacion', sala.ubicacion)
            sala.link_ubicacion = sala_data.get('link_ubicacion', sala.link_ubicacion)
            sala.departamento = sala_data.get('departamento', sala.departamento)
            sala.zona = sala_data.get('zona', sala.zona)
            sala.estado = sala_data.get('estado', sala.estado)
            db.session.commit()
        return sala

    @staticmethod
    def delete(sala_id):
        """
        Elimina una sala (borrado lógico cambiando estado)
        """
        sala = Sala.query.get(sala_id)
        if sala:
            sala.estado = False
            db.session.commit()
        return sala

    @staticmethod
    def hard_delete(sala_id):
        """
        Elimina permanentemente una sala
        """
        sala = Sala.query.get(sala_id)
        if sala:
            db.session.delete(sala)
            db.session.commit()
        return sala

    @staticmethod
    def get_by_name_active(nombre_sala):
        """
        Obtiene una sala por nombre que esté activa
        """
        return Sala.query.filter_by(nombre_sala=nombre_sala, estado=True).first()

    @staticmethod
    def get_by_name_active_exclude_id(nombre_sala, exclude_id):
        """
        Obtiene una sala por nombre que esté activa, excluyendo un ID
        """
        return Sala.query.filter(
            Sala.nombre_sala == nombre_sala, 
            Sala.estado == True, 
            Sala.id_sala != exclude_id
        ).first()