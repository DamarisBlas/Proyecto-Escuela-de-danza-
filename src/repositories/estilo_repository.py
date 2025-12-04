from src.models import Estilo
from src.app import db

class EstiloRepository:
    """
    Repositorio para operaciones de base de datos de Estilo
    """

    @staticmethod
    def get_all():
        """
        Obtiene todos los estilos
        """
        return Estilo.query.all()

    @staticmethod
    def get_by_id(estilo_id):
        """
        Obtiene un estilo por su ID
        """
        return Estilo.query.get(estilo_id)

    @staticmethod
    def get_active():
        """
        Obtiene todos los estilos activos
        """
        return Estilo.query.filter_by(estado=True).all()

    @staticmethod
    def create(estilo_data):
        """
        Crea un nuevo estilo
        """
        nuevo_estilo = Estilo(
            nombre_estilo=estilo_data['nombre_estilo'],
            descripcion_estilo=estilo_data.get('descripcion_estilo'),
            beneficios_estilo=estilo_data.get('beneficios_estilo'),
            estado=estilo_data.get('estado', True)
        )
        db.session.add(nuevo_estilo)
        db.session.commit()
        return nuevo_estilo

    @staticmethod
    def update(estilo_id, estilo_data):
        """
        Actualiza un estilo existente
        """
        estilo = Estilo.query.get(estilo_id)
        if estilo:
            estilo.nombre_estilo = estilo_data.get('nombre_estilo', estilo.nombre_estilo)
            estilo.descripcion_estilo = estilo_data.get('descripcion_estilo', estilo.descripcion_estilo)
            estilo.beneficios_estilo = estilo_data.get('beneficios_estilo', estilo.beneficios_estilo)
            estilo.estado = estilo_data.get('estado', estilo.estado)
            db.session.commit()
        return estilo

    @staticmethod
    def delete(estilo_id):
        """
        Elimina un estilo (borrado lógico cambiando estado)
        """
        estilo = Estilo.query.get(estilo_id)
        if estilo:
            estilo.estado = False
            db.session.commit()
        return estilo

    @staticmethod
    def hard_delete(estilo_id):
        """
        Elimina permanentemente un estilo
        """
        estilo = Estilo.query.get(estilo_id)
        if estilo:
            db.session.delete(estilo)
            db.session.commit()
        return estilo

    @staticmethod
    def get_by_name_active(nombre_estilo):
        """
        Obtiene un estilo por nombre que esté activo
        """
        return Estilo.query.filter_by(nombre_estilo=nombre_estilo, estado=True).first()

    @staticmethod
    def get_by_name_active_exclude_id(nombre_estilo, exclude_id):
        """
        Obtiene un estilo por nombre que esté activo, excluyendo un ID
        """
        return Estilo.query.filter(
            Estilo.nombre_estilo == nombre_estilo, 
            Estilo.estado == True, 
            Estilo.id_estilo != exclude_id
        ).first()