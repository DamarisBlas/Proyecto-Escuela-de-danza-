from src.models.oferta import Oferta
from src.models.horario import Horario
from src.models.paquete import Paquete
from src.models.ciclo import Ciclo
from src.models.subcategoria import Subcategoria
from src.models.categoria import Categoria
from src.models.programa import Programa
from src.models.sesion import Sesion
from src.models.inscripcion import Inscripcion
from src.app import db
from sqlalchemy.orm import joinedload
from sqlalchemy import func

class OfertaRepository:
    """
    Repositorio para operaciones de base de datos de Oferta
    """

    @staticmethod
    def get_all():
        """
        Obtiene todas las ofertas
        """
        return Oferta.query.all()

    @staticmethod
    def get_by_id(oferta_id):
        """
        Obtiene una oferta por su ID
        """
        return Oferta.query.get(oferta_id)

    @staticmethod
    def get_active():
        """
        Obtiene todas las ofertas activas
        """
        return Oferta.query.filter_by(estado=True).all()

    @staticmethod
    def get_by_ciclo(ciclo_id):
        """
        Obtiene todas las ofertas de un ciclo
        """
        return Oferta.query.filter_by(ciclo_id_ciclo=ciclo_id, estado=True).all()

    @staticmethod
    def create(oferta_data):
        """
        Crea una nueva oferta
        """
        nueva_oferta = Oferta(
            ciclo_id_ciclo=oferta_data['ciclo_id_ciclo'],
            Subcategoria_id_subcategoria=oferta_data['Subcategoria_id_subcategoria'],
            nombre_oferta=oferta_data['nombre_oferta'],
            fecha_inicio=oferta_data['fecha_inicio'],
            fecha_fin=oferta_data['fecha_fin'],
            descripcion=oferta_data.get('descripcion'),
            cantidad_cursos=oferta_data['cantidad_cursos'],
            publico_objetivo=oferta_data.get('publico_objetivo'),
            whatsapplink=oferta_data.get('whatsapplink'),
            repite_semanalmente=oferta_data.get('repite_semanalmente', False),
            estado=oferta_data.get('estado', True)
        )
        db.session.add(nueva_oferta)
        db.session.commit()
        return nueva_oferta

    @staticmethod
    def update(oferta_id, oferta_data):
        """
        Actualiza una oferta existente
        """
        oferta = Oferta.query.get(oferta_id)
        if oferta:
            oferta.ciclo_id_ciclo = oferta_data.get('ciclo_id_ciclo', oferta.ciclo_id_ciclo)
            oferta.Subcategoria_id_subcategoria = oferta_data.get('Subcategoria_id_subcategoria', oferta.Subcategoria_id_subcategoria)
            oferta.nombre_oferta = oferta_data.get('nombre_oferta', oferta.nombre_oferta)
            oferta.fecha_inicio = oferta_data.get('fecha_inicio', oferta.fecha_inicio)
            oferta.fecha_fin = oferta_data.get('fecha_fin', oferta.fecha_fin)
            oferta.descripcion = oferta_data.get('descripcion', oferta.descripcion)
            oferta.cantidad_cursos = oferta_data.get('cantidad_cursos', oferta.cantidad_cursos)
            oferta.publico_objetivo = oferta_data.get('publico_objetivo', oferta.publico_objetivo)
            oferta.whatsapplink = oferta_data.get('whatsapplink', oferta.whatsapplink)
            oferta.repite_semanalmente = oferta_data.get('repite_semanalmente', oferta.repite_semanalmente)
            oferta.estado = oferta_data.get('estado', oferta.estado)
            db.session.commit()
        return oferta

    @staticmethod
    def delete(oferta_id):
        """
        Elimina una oferta (borrado lógico cambiando estado)
        """
        oferta = Oferta.query.get(oferta_id)
        if oferta:
            oferta.estado = False
            db.session.commit()
        return oferta

    @staticmethod
    def get_oferta_completa(oferta_id):
        """
        Obtiene una oferta con toda su información relacionada
        """
        try:
            # Obtener la oferta base
            oferta = Oferta.query.get(oferta_id)
            if not oferta:
                return None

            # Construir el diccionario base de la oferta
            oferta_dict = oferta.to_dict()

            # Obtener información del ciclo
            ciclo = Ciclo.query.get(oferta.ciclo_id_ciclo)
            if ciclo:
                oferta_dict['ciclo'] = ciclo.to_dict()

            # Obtener información de la subcategoría y categoría
            subcategoria = Subcategoria.query.get(oferta.Subcategoria_id_subcategoria)
            if subcategoria:
                subcategoria_dict = subcategoria.to_dict()
                
                # Obtener información de la categoría
                categoria = Categoria.query.get(subcategoria.Categoria_id_categoria)
                if categoria:
                    categoria_dict = categoria.to_dict()
                    
                    # Obtener información del programa
                    programa = Programa.query.get(categoria.Programa_id_programa)
                    if programa:
                        categoria_dict['programa'] = programa.to_dict()
                    
                    subcategoria_dict['categoria'] = categoria_dict
                
                oferta_dict['subcategoria'] = subcategoria_dict

            # Obtener paquetes asociados a la oferta
            paquetes = Paquete.query.filter_by(Oferta_id_oferta=oferta_id, estado=True).all()
            oferta_dict['paquetes'] = [paquete.to_dict() for paquete in paquetes]

            # Obtener horarios asociados a la oferta con información relacionada
            horarios = Horario.query.filter_by(Oferta_id_oferta=oferta_id, estado=True).all()
            horarios_completos = []
            
            for horario in horarios:
                horario_dict = horario.to_dict()
                
                # Obtener información del estilo
                if horario.Estilo_id_estilo:
                    from src.models.estilo import Estilo
                    estilo = Estilo.query.get(horario.Estilo_id_estilo)
                    if estilo:
                        horario_dict['estilo'] = estilo.to_dict()

                # Obtener información de la sala
                if horario.Sala_id_sala:
                    from src.models.sala import Sala
                    sala = Sala.query.get(horario.Sala_id_sala)
                    if sala:
                        horario_dict['sala'] = sala.to_dict()

                # Obtener información del profesor
                if horario.Profesor_id_profesor:
                    from src.models.profesor import Profesor
                    profesor = Profesor.query.get(horario.Profesor_id_profesor)
                    if profesor:
                        profesor_dict = profesor.to_dict()
                        
                        # Obtener información de la persona del profesor
                        if profesor.Persona_id_persona:
                            from src.models.persona import Persona
                            persona = Persona.query.get(profesor.Persona_id_persona)
                            if persona:
                                profesor_dict['persona'] = persona.to_dict()
                        
                        horario_dict['profesor'] = profesor_dict

                horarios_completos.append(horario_dict)
            
            oferta_dict['horarios'] = horarios_completos

            # Contar sesiones totales de la oferta (a través de horarios)
            sesiones_count = db.session.query(func.count(Sesion.id_sesion)).join(
                Horario, Sesion.Horario_id_horario == Horario.id_horario
            ).filter(Horario.Oferta_id_oferta == oferta_id).scalar() or 0
            oferta_dict['sesiones_count'] = sesiones_count

            # Contar inscripciones activas (a través de paquetes)
            inscripciones_activas = db.session.query(func.count(Inscripcion.id_inscripcion)).join(
                Paquete, Inscripcion.Paquete_id_paquete == Paquete.id_paquete
            ).filter(
                Paquete.Oferta_id_oferta == oferta_id,
                Inscripcion.estado.in_(['ACTIVA', 'CONFIRMADA', 'COMPLETADA'])
            ).scalar() or 0
            oferta_dict['inscripciones_activas'] = inscripciones_activas

            return oferta_dict

        except Exception as e:
            print(f"Error en get_oferta_completa: {str(e)}")
            return None
