from src.models.asistencia import Asistencia
from src.models.horario_sesion import HorarioSesion
from src.models.inscripcion import Inscripcion
from src.models.persona import Persona
from src.models.horario import Horario
from src.models.oferta import Oferta
from src.models.ciclo import Ciclo
from src.models.subcategoria import Subcategoria
from src.models.categoria import Categoria
from src.models.programa import Programa
from src.app import db

class AsistenciaRepository:
    """
    Repositorio para operaciones CRUD de Asistencia
    """

    @staticmethod
    def get_all():
        """
        Obtiene todas las asistencias
        """
        return Asistencia.query.all()

    @staticmethod
    def get_by_id(asistencia_id):
        """
        Obtiene una asistencia por ID
        """
        return Asistencia.query.get(asistencia_id)

    @staticmethod
    def get_active():
        """
        Obtiene todas las asistencias activas (estado = True)
        """
        return Asistencia.query.filter_by(estado=True).all()

    @staticmethod
    def get_by_inscripcion(inscripcion_id):
        """
        Obtiene todas las asistencias de una inscripción
        """
        return Asistencia.query.filter_by(
            Inscripcion_id_inscripcion=inscripcion_id,
            estado=True
        ).all()

    @staticmethod
    def get_by_horario_sesion(horario_sesion_id):
        """
        Obtiene todas las asistencias de un horario de sesión
        """
        return Asistencia.query.filter_by(
            Horario_sesion_id_horario_sesion=horario_sesion_id,
            estado=True
        ).all()

    @staticmethod
    def create(asistencia_data):
        """
        Crea una nueva asistencia
        """
        asistencia = Asistencia(**asistencia_data)
        db.session.add(asistencia)
        db.session.flush()  # Para obtener el ID sin hacer commit
        return asistencia

    @staticmethod
    def create_bulk(asistencias_data):
        """
        Crea múltiples asistencias en una sola operación
        """
        asistencias = []
        for data in asistencias_data:
            asistencia = Asistencia(**data)
            asistencias.append(asistencia)
        
        db.session.add_all(asistencias)
        db.session.flush()
        return asistencias

    @staticmethod
    def update(asistencia_id, asistencia_data):
        """
        Actualiza una asistencia existente
        """
        asistencia = AsistenciaRepository.get_by_id(asistencia_id)
        if asistencia:
            for key, value in asistencia_data.items():
                if hasattr(asistencia, key):
                    setattr(asistencia, key, value)
            db.session.flush()
        return asistencia

    @staticmethod
    def delete(asistencia_id):
        """
        Elimina una asistencia (borrado lógico)
        """
        asistencia = AsistenciaRepository.get_by_id(asistencia_id)
        if asistencia:
            asistencia.estado = False
            db.session.flush()
        return asistencia

    @staticmethod
    def get_by_inscripcion_and_horario(inscripcion_id, horario_sesion_id):
        """
        Obtiene una asistencia específica por inscripción y horario de sesión
        """
        return Asistencia.query.filter_by(
            Inscripcion_id_inscripcion=inscripcion_id,
            Horario_sesion_id_horario_sesion=horario_sesion_id,
            estado=True
        ).first()

    @staticmethod
    def marcar_asistencia(inscripcion_id, horario_sesion_id, asistio, fecha):
        """
        Marca la asistencia de un alumno a una clase específica
        """
        asistencia = AsistenciaRepository.get_by_inscripcion_and_horario(
            inscripcion_id, horario_sesion_id
        )
        
        if asistencia:
            asistencia.asistio = asistio
            asistencia.fecha = fecha
            db.session.flush()
            return asistencia
        
        return None

    @staticmethod
    def get_personas_inscritas_por_horario_y_fecha(horario_id, fecha):
        """
        Obtiene la lista de personas inscritas en un horario específico en una fecha determinada
        con información completa de todas las entidades relacionadas
        
        Realiza joins: Asistencia -> HorarioSesion -> Inscripcion -> Persona -> Horario
        """
        from sqlalchemy import and_
        from src.models.horario import Horario
        
        # Query con joins para obtener las personas inscritas con toda la información
        query = db.session.query(
            Persona,
            Inscripcion,
            Asistencia,
            HorarioSesion,
            Horario
        ).join(
            Inscripcion, Persona.id_persona == Inscripcion.Persona_id_persona
        ).join(
            Asistencia, Inscripcion.id_inscripcion == Asistencia.Inscripcion_id_inscripcion
        ).join(
            HorarioSesion, Asistencia.Horario_sesion_id_horario_sesion == HorarioSesion.id_horario_sesion
        ).join(
            Horario, HorarioSesion.Horario_id_horario == Horario.id_horario
        ).filter(
            and_(
                HorarioSesion.Horario_id_horario == horario_id,
                HorarioSesion.fecha == fecha,
                HorarioSesion.estado == True,
                Asistencia.estado == True,
                Inscripcion.estado == 'ACTIVO'
            )
        ).all()
        
        return query

    @staticmethod
    def get_personas_inscritas_por_horario(horario_id):
        """
        Obtiene la lista de personas inscritas en todas las sesiones de un horario específico
        con información completa de todas las entidades relacionadas
        
        Realiza joins: Asistencia -> HorarioSesion -> Inscripcion -> Persona -> Horario
        """
        from sqlalchemy import and_
        
        # Query con joins para obtener las personas inscritas con toda la información
        query = db.session.query(
            Persona,
            Inscripcion,
            Asistencia,
            HorarioSesion,
            Horario
        ).join(
            Inscripcion, Persona.id_persona == Inscripcion.Persona_id_persona
        ).join(
            Asistencia, Inscripcion.id_inscripcion == Asistencia.Inscripcion_id_inscripcion
        ).join(
            HorarioSesion, Asistencia.Horario_sesion_id_horario_sesion == HorarioSesion.id_horario_sesion
        ).join(
            Horario, HorarioSesion.Horario_id_horario == Horario.id_horario
        ).filter(
            and_(
                HorarioSesion.Horario_id_horario == horario_id,
                HorarioSesion.estado == True,
                Asistencia.estado == True,
                Inscripcion.estado == 'ACTIVO'
            )
        ).all()
        
        return query

    @staticmethod
    def get_inscritos_completos_por_horario(horario_id):
        """
        Obtiene la lista completa de personas inscritas a un horario específico
        con toda la información relacionada para agrupar por persona
        
        Realiza joins: Asistencia -> HorarioSesion -> Inscripcion -> Persona -> Oferta -> Ciclo -> Subcategoria -> Categoria -> Programa
        """
        from sqlalchemy import and_
        
        # Query con joins para obtener toda la información necesaria
        query = db.session.query(
            Persona,
            Inscripcion,
            Asistencia,
            HorarioSesion,
            Horario,
            Oferta,
            Ciclo,
            Subcategoria,
            Categoria,
            Programa
        ).join(
            Inscripcion, Persona.id_persona == Inscripcion.Persona_id_persona
        ).join(
            Asistencia, Inscripcion.id_inscripcion == Asistencia.Inscripcion_id_inscripcion
        ).join(
            HorarioSesion, Asistencia.Horario_sesion_id_horario_sesion == HorarioSesion.id_horario_sesion
        ).join(
            Horario, HorarioSesion.Horario_id_horario == Horario.id_horario
        ).join(
            Oferta, Horario.Oferta_id_oferta == Oferta.id_oferta
        ).join(
            Ciclo, Oferta.ciclo_id_ciclo == Ciclo.id_ciclo
        ).join(
            Subcategoria, Oferta.Subcategoria_id_subcategoria == Subcategoria.id_subcategoria
        ).join(
            Categoria, Subcategoria.Categoria_id_categoria == Categoria.id_categoria
        ).join(
            Programa, Categoria.Programa_id_programa == Programa.id_programa
        ).filter(
            and_(
                HorarioSesion.Horario_id_horario == horario_id,
                HorarioSesion.estado == True,
                Asistencia.estado == True,
                Inscripcion.estado == 'ACTIVO'
            )
        ).all()
        
        return query