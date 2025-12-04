from src.models.inscripcion import Inscripcion
from src.models.persona import Persona
from src.models.paquete import Paquete
from src.models.promocion import Promocion
from src.models.oferta import Oferta
from src.models.ciclo import Ciclo
from src.models.subcategoria import Subcategoria
from src.models.categoria import Categoria
from src.models.programa import Programa
from src.app import db

class InscripcionRepository:
    """
    Repositorio para operaciones CRUD de Inscripcion
    """

    @staticmethod
    def get_all():
        """
        Obtiene todas las inscripciones
        """
        return Inscripcion.query.all()

    @staticmethod
    def get_by_id(inscripcion_id):
        """
        Obtiene una inscripción por ID
        """
        return Inscripcion.query.get(inscripcion_id)

    @staticmethod
    def get_active():
        """
        Obtiene todas las inscripciones activas
        """
        return Inscripcion.query.filter(Inscripcion.estado != 'CANCELADO').all()

    @staticmethod
    def get_by_persona(persona_id):
        """
        Obtiene todas las inscripciones de una persona
        """
        return Inscripcion.query.filter_by(Persona_id_persona=persona_id).all()

    @staticmethod
    def get_by_paquete(paquete_id):
        """
        Obtiene todas las inscripciones de un paquete
        """
        return Inscripcion.query.filter_by(Paquete_id_paquete=paquete_id).all()

    @staticmethod
    def get_by_estado(estado):
        """
        Obtiene inscripciones por estado específico
        """
        return Inscripcion.query.filter_by(estado=estado).all()

    @staticmethod
    def create(inscripcion_data):
        """
        Crea una nueva inscripción
        """
        inscripcion = Inscripcion(**inscripcion_data)
        db.session.add(inscripcion)
        db.session.flush()  # Para obtener el ID
        return inscripcion

    @staticmethod
    def update(inscripcion_id, inscripcion_data):
        """
        Actualiza una inscripción existente
        """
        inscripcion = Inscripcion.query.get(inscripcion_id)
        if not inscripcion:
            return None

        for key, value in inscripcion_data.items():
            if hasattr(inscripcion, key):
                setattr(inscripcion, key, value)

        db.session.flush()
        return inscripcion

    @staticmethod
    def delete(inscripcion_id):
        """
        Elimina una inscripción (borrado lógico)
        """
        inscripcion = Inscripcion.query.get(inscripcion_id)
        if not inscripcion:
            return None

        inscripcion.estado = 'CANCELADO'
        db.session.flush()
        return inscripcion

    @staticmethod
    def get_inscripciones_vigentes():
        """
        Obtiene inscripciones vigentes (fecha_fin >= hoy)
        """
        from datetime import date
        today = date.today()
        return Inscripcion.query.filter(
            Inscripcion.fecha_fin >= today,
            Inscripcion.estado != 'CANCELADO'
        ).all()

    @staticmethod
    def get_inscripciones_vencidas():
        """
        Obtiene inscripciones vencidas (fecha_fin < hoy)
        """
        from datetime import date
        today = date.today()
        return Inscripcion.query.filter(
            Inscripcion.fecha_fin < today,
            Inscripcion.estado != 'CANCELADO'
        ).all()

    @staticmethod
    def get_inscripciones_completas():
        """
        Obtiene todas las inscripciones con información completa detallada:
        - Persona: nombre, apellido, email, celular
        - Paquete: nombre, cantidad_clases, precio, oferta completa
        - Promocion: nombre, porcentaje_descuento, etc.
        - Oferta: nombre, ciclo, subcategoria, categoria, programa
        """
        return db.session.query(
            Inscripcion,
            Persona,
            Paquete,
            Promocion,
            Oferta,
            Ciclo,
            Subcategoria,
            Categoria,
            Programa
        ).join(
            Persona, Inscripcion.Persona_id_persona == Persona.id_persona
        ).join(
            Paquete, Inscripcion.Paquete_id_paquete == Paquete.id_paquete
        ).outerjoin(
            Promocion, Inscripcion.Promocion_id_promocion == Promocion.id_promocion
        ).join(
            Oferta, Paquete.Oferta_id_oferta == Oferta.id_oferta
        ).join(
            Ciclo, Oferta.ciclo_id_ciclo == Ciclo.id_ciclo
        ).join(
            Subcategoria, Oferta.Subcategoria_id_subcategoria == Subcategoria.id_subcategoria
        ).join(
            Categoria, Subcategoria.Categoria_id_categoria == Categoria.id_categoria
        ).join(
            Programa, Categoria.Programa_id_programa == Programa.id_programa
        ).filter(
            Inscripcion.estado != 'CANCELADO'
        ).all()