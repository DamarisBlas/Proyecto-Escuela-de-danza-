from src.models import Subcategoria
from src.app import db

class SubcategoriaRepository:
    """
    Repositorio para operaciones de base de datos de Subcategoria
    """

    @staticmethod
    def get_all():
        """
        Obtiene todas las subcategorías
        """
        return Subcategoria.query.all()

    @staticmethod
    def get_by_id(subcategoria_id):
        """
        Obtiene una subcategoría por su ID
        """
        return Subcategoria.query.get(subcategoria_id)

    @staticmethod
    def get_by_categoria(categoria_id):
        """
        Obtiene todas las subcategorías de una categoría específica
        """
        return Subcategoria.query.filter_by(Categoria_id_categoria=categoria_id).all()

    @staticmethod
    def get_active():
        """
        Obtiene todas las subcategorías activas
        """
        return Subcategoria.query.filter_by(estado=True).all()

    @staticmethod
    def get_active_by_categoria(categoria_id):
        """
        Obtiene todas las subcategorías activas de una categoría específica
        """
        return Subcategoria.query.filter_by(Categoria_id_categoria=categoria_id, estado=True).all()

    @staticmethod
    def create(subcategoria_data):
        """
        Crea una nueva subcategoría
        """
        nueva_subcategoria = Subcategoria(
            Categoria_id_categoria=subcategoria_data['Categoria_id_categoria'],
            nombre_subcategoria=subcategoria_data['nombre_subcategoria'],
            descripcion_subcategoria=subcategoria_data['descripcion_subcategoria'],
            estado=subcategoria_data.get('estado', True)
        )
        db.session.add(nueva_subcategoria)
        db.session.commit()
        return nueva_subcategoria

    @staticmethod
    def update(subcategoria_id, subcategoria_data):
        """
        Actualiza una subcategoría existente
        """
        subcategoria = Subcategoria.query.get(subcategoria_id)
        if subcategoria:
            subcategoria.Categoria_id_categoria = subcategoria_data.get('Categoria_id_categoria', subcategoria.Categoria_id_categoria)
            subcategoria.nombre_subcategoria = subcategoria_data.get('nombre_subcategoria', subcategoria.nombre_subcategoria)
            subcategoria.descripcion_subcategoria = subcategoria_data.get('descripcion_subcategoria', subcategoria.descripcion_subcategoria)
            subcategoria.estado = subcategoria_data.get('estado', subcategoria.estado)
            db.session.commit()
        return subcategoria

    @staticmethod
    def delete(subcategoria_id):
        """
        Elimina una subcategoría (borrado lógico cambiando estado)
        """
        subcategoria = Subcategoria.query.get(subcategoria_id)
        if subcategoria:
            subcategoria.estado = False
            db.session.commit()
        return subcategoria

    @staticmethod
    def get_by_name_active_in_categoria(nombre_subcategoria, categoria_id):
        """
        Obtiene una subcategoría por nombre que esté activa dentro de una categoría específica
        """
        return Subcategoria.query.filter_by(
            nombre_subcategoria=nombre_subcategoria, 
            Categoria_id_categoria=categoria_id, 
            estado=True
        ).first()

    @staticmethod
    def get_by_name_active_in_categoria_exclude_id(nombre_subcategoria, categoria_id, exclude_id):
        """
        Obtiene una subcategoría por nombre que esté activa dentro de una categoría específica, excluyendo un ID
        """
        return Subcategoria.query.filter(
            Subcategoria.nombre_subcategoria == nombre_subcategoria, 
            Subcategoria.Categoria_id_categoria == categoria_id, 
            Subcategoria.estado == True, 
            Subcategoria.id_subcategoria != exclude_id
        ).first()