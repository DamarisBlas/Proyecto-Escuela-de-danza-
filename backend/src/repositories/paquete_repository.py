from src.models.paquete import Paquete
from src.app import db

class PaqueteRepository:
    """
    Repositorio para operaciones de base de datos de Paquete
    """

    @staticmethod
    def get_all():
        """
        Obtiene todos los paquetes
        """
        return Paquete.query.all()

    @staticmethod
    def get_by_id(paquete_id):
        """
        Obtiene un paquete por su ID
        """
        return Paquete.query.get(paquete_id)

    @staticmethod
    def get_active():
        """
        Obtiene todos los paquetes activos
        """
        return Paquete.query.filter_by(estado=True).all()

    @staticmethod
    def get_by_oferta(oferta_id):
        """
        Obtiene todos los paquetes de una oferta
        """
        return Paquete.query.filter_by(Oferta_id_oferta=oferta_id, estado=True).all()

    @staticmethod
    def get_by_name_active(nombre):
        """
        Obtiene un paquete por nombre que esté activo
        """
        return Paquete.query.filter_by(nombre=nombre, estado=True).first()

    @staticmethod
    def get_by_name_active_exclude_id(nombre, exclude_id):
        """
        Obtiene un paquete por nombre que esté activo, excluyendo un ID específico
        """
        return Paquete.query.filter(Paquete.nombre == nombre, Paquete.estado == True, Paquete.id_paquete != exclude_id).first()

    @staticmethod
    def create(paquete_data):
        """
        Crea un nuevo paquete
        """
        nuevo_paquete = Paquete(
            nombre=paquete_data['nombre'],
            cantidad_clases=paquete_data.get('cantidad_clases'),
            dias_validez=paquete_data.get('dias_validez', 30),
            ilimitado=paquete_data.get('ilimitado', False),
            Oferta_id_oferta=paquete_data['oferta_id'],
            precio=paquete_data['precio'],
            estado=paquete_data.get('estado', True)
        )
        db.session.add(nuevo_paquete)
        db.session.commit()
        return nuevo_paquete

    @staticmethod
    def update(paquete_id, paquete_data):
        """
        Actualiza un paquete existente
        """
        paquete = Paquete.query.get(paquete_id)
        if paquete:
            paquete.nombre = paquete_data.get('nombre', paquete.nombre)
            paquete.cantidad_clases = paquete_data.get('cantidad_clases', paquete.cantidad_clases)
            paquete.dias_validez = paquete_data.get('dias_validez', paquete.dias_validez)
            paquete.ilimitado = paquete_data.get('ilimitado', paquete.ilimitado)
            paquete.Oferta_id_oferta = paquete_data.get('oferta_id', paquete.Oferta_id_oferta)
            paquete.precio = paquete_data.get('precio', paquete.precio)
            paquete.estado = paquete_data.get('estado', paquete.estado)
            db.session.commit()
        return paquete

    @staticmethod
    def delete(paquete_id):
        """
        Elimina un paquete (borrado lógico cambiando estado)
        """
        paquete = Paquete.query.get(paquete_id)
        if paquete:
            paquete.estado = False
            db.session.commit()
        return paquete

    @staticmethod
    def get_detailed_info(paquete_id):
        """
        Obtiene información detallada de un paquete incluyendo datos de la oferta,
        ciclo y subcategoría relacionados
        """
        from src.models.oferta import Oferta
        from src.models.ciclo import Ciclo
        from src.models.subcategoria import Subcategoria
        
        result = db.session.query(
            Paquete,
            Oferta,
            Ciclo,
            Subcategoria
        ).join(
            Oferta, Paquete.Oferta_id_oferta == Oferta.id_oferta
        ).join(
            Ciclo, Oferta.ciclo_id_ciclo == Ciclo.id_ciclo
        ).join(
            Subcategoria, Oferta.Subcategoria_id_subcategoria == Subcategoria.id_subcategoria
        ).filter(
            Paquete.id_paquete == paquete_id
        ).first()
        
        return result
