from src.models import Categoria
from src.app import db

class CategoriaRepository:
    """
    Repositorio para operaciones de base de datos de Categoria
    """

    @staticmethod
    def get_all():
        """
        Obtiene todas las categorías
        """
        return Categoria.query.all()

    @staticmethod
    def get_by_id(categoria_id):
        """
        Obtiene una categoría por su ID
        """
        return Categoria.query.get(categoria_id)

    @staticmethod
    def get_by_programa(programa_id):
        """
        Obtiene todas las categorías de un programa específico
        """
        return Categoria.query.filter_by(Programa_id_programa=programa_id).all()

    @staticmethod
    def get_active():
        """
        Obtiene todas las categorías activas
        """
        return Categoria.query.filter_by(estado=True).all()

    @staticmethod
    def get_active_by_programa(programa_id):
        """
        Obtiene todas las categorías activas de un programa específico
        """
        return Categoria.query.filter_by(Programa_id_programa=programa_id, estado=True).all()

    @staticmethod
    def create(categoria_data):
        """
        Crea una nueva categoría
        """
        nueva_categoria = Categoria(
            Programa_id_programa=categoria_data['Programa_id_programa'],
            nombre_categoria=categoria_data['nombre_categoria'],
            descripcion_categoria=categoria_data.get('descripcion_categoria'),
            estado=categoria_data.get('estado', True)
        )
        db.session.add(nueva_categoria)
        db.session.commit()
        return nueva_categoria

    @staticmethod
    def update(categoria_id, categoria_data):
        """
        Actualiza una categoría existente
        """
        categoria = Categoria.query.get(categoria_id)
        if categoria:
            categoria.Programa_id_programa = categoria_data.get('Programa_id_programa', categoria.Programa_id_programa)
            categoria.nombre_categoria = categoria_data.get('nombre_categoria', categoria.nombre_categoria)
            categoria.descripcion_categoria = categoria_data.get('descripcion_categoria', categoria.descripcion_categoria)
            categoria.estado = categoria_data.get('estado', categoria.estado)
            db.session.commit()
        return categoria

    @staticmethod
    def delete(categoria_id):
        """
        Elimina una categoría (borrado lógico cambiando estado)
        """
        categoria = Categoria.query.get(categoria_id)
        if categoria:
            categoria.estado = False
            db.session.commit()
        return categoria

    @staticmethod
    def get_by_name_active_in_programa(nombre_categoria, programa_id):
        """
        Obtiene una categoría por nombre que esté activa dentro de un programa específico
        """
        return Categoria.query.filter_by(
            nombre_categoria=nombre_categoria, 
            Programa_id_programa=programa_id, 
            estado=True
        ).first()

    @staticmethod
    def get_by_name_active_in_programa_exclude_id(nombre_categoria, programa_id, exclude_id):
        """
        Obtiene una categoría por nombre que esté activa dentro de un programa específico, excluyendo un ID
        """
        return Categoria.query.filter(
            Categoria.nombre_categoria == nombre_categoria, 
            Categoria.Programa_id_programa == programa_id, 
            Categoria.estado == True, 
            Categoria.id_categoria != exclude_id
        ).first()