from src.models.horario import Horario
from src.models.horario_sesion import HorarioSesion
from src.models.oferta import Oferta
from src.models.ciclo import Ciclo
from src.models.sala import Sala
from src.models.estilo import Estilo
from src.models.subcategoria import Subcategoria
from src.models.categoria import Categoria
from src.models.programa import Programa
from src.models.asistencia import Asistencia
from src.models.profesor import Profesor
from src.models.persona import Persona
from src.app import db
from sqlalchemy import func

class HorarioRepository:
    """
    Repositorio para operaciones de base de datos de Horario
    """

    @staticmethod
    def get_all():
        """
        Obtiene todos los horarios
        """
        return Horario.query.all()

    @staticmethod
    def get_by_id(horario_id):
        """
        Obtiene un horario por su ID
        """
        return Horario.query.get(horario_id)

    @staticmethod
    def get_active():
        """
        Obtiene todos los horarios activos
        """
        return Horario.query.filter_by(estado=True).all()

    @staticmethod
    def get_by_oferta(oferta_id):
        """
        Obtiene todos los horarios de una oferta
        """
        return Horario.query.filter_by(Oferta_id_oferta=oferta_id, estado=True).all()

    @staticmethod
    def create(horario_data):
        """
        Crea un nuevo horario
        """
        nuevo_horario = Horario(
            Oferta_id_oferta=horario_data['oferta_id'],
            Estilo_id_estilo=horario_data['estilo_id'],
            nivel=horario_data['nivel'],
            Profesor_id_profesor=horario_data['profesor_id'],
            Sala_id_sala=horario_data['sala_id'],
            capacidad=horario_data['capacidad'],
            dias=horario_data['dias'],  # String: "1,3,5"
            hora_inicio=horario_data['hora_inicio'],
            hora_fin=horario_data['hora_fin'],
            estado=horario_data.get('estado', True)
        )
        db.session.add(nuevo_horario)
        db.session.flush()  # Para obtener el id_horario
        return nuevo_horario

    @staticmethod
    def update(horario_id, horario_data):
        """
        Actualiza un horario existente
        """
        horario = Horario.query.get(horario_id)
        if horario:
            horario.Oferta_id_oferta = horario_data.get('oferta_id', horario.Oferta_id_oferta)
            horario.Estilo_id_estilo = horario_data.get('estilo_id', horario.Estilo_id_estilo)
            horario.nivel = horario_data.get('nivel', horario.nivel)
            horario.Profesor_id_profesor = horario_data.get('profesor_id', horario.Profesor_id_profesor)
            horario.Sala_id_sala = horario_data.get('sala_id', horario.Sala_id_sala)
            horario.capacidad = horario_data.get('capacidad', horario.capacidad)
            horario.dias = horario_data.get('dias', horario.dias)
            horario.hora_inicio = horario_data.get('hora_inicio', horario.hora_inicio)
            horario.hora_fin = horario_data.get('hora_fin', horario.hora_fin)
            horario.estado = horario_data.get('estado', horario.estado)
            db.session.commit()
        return horario

    @staticmethod
    def delete(horario_id):
        """
        Elimina un horario (borrado lógico cambiando estado)
        """
        horario = Horario.query.get(horario_id)
        if horario:
            horario.estado = False
            db.session.commit()
        return horario

    @staticmethod
    def get_sesiones_by_horario(horario_id):
        """
        Obtiene todas las sesiones de un horario
        """
        return HorarioSesion.query.filter_by(Horario_id_horario=horario_id, estado=True).all()
    
    @staticmethod
    def get_horarios_completos_by_profesor(profesor_id):
        """
        Obtiene todos los horarios de un profesor con información completa de oferta, ciclo, sala y estilo
        Incluye el conteo total de inscritos por horario
        """
        # Subquery para contar inscritos por horario
        subquery_inscritos = db.session.query(
            HorarioSesion.Horario_id_horario,
            func.count(Asistencia.id_asistencia).label('total_inscritos')
        ).join(
            Asistencia, HorarioSesion.id_horario_sesion == Asistencia.Horario_sesion_id_horario_sesion
        ).filter(
            HorarioSesion.estado == True,
            Asistencia.estado == True
        ).group_by(HorarioSesion.Horario_id_horario).subquery()
        
        # Query principal con joins y conteo de inscritos
        return db.session.query(
            Horario, Oferta, Ciclo, Sala, Estilo, Subcategoria, Categoria, Programa,
            func.coalesce(subquery_inscritos.c.total_inscritos, 0).label('total_inscritos')
        ).join(
            Oferta, Horario.Oferta_id_oferta == Oferta.id_oferta
        ).join(
            Ciclo, Oferta.ciclo_id_ciclo == Ciclo.id_ciclo
        ).join(
            Sala, Horario.Sala_id_sala == Sala.id_sala
        ).join(
            Estilo, Horario.Estilo_id_estilo == Estilo.id_estilo
        ).join(
            Subcategoria, Oferta.Subcategoria_id_subcategoria == Subcategoria.id_subcategoria
        ).join(
            Categoria, Subcategoria.Categoria_id_categoria == Categoria.id_categoria
        ).join(
            Programa, Categoria.Programa_id_programa == Programa.id_programa
        ).outerjoin(
            subquery_inscritos, Horario.id_horario == subquery_inscritos.c.Horario_id_horario
        ).filter(
            Horario.Profesor_id_profesor == profesor_id,
            Horario.estado == True
        ).all()

    def get_todos_horarios_detallados():
        """
        Obtiene todos los horarios con información completa detallada:
        - Profesor: nombre, apellido, email, celular
        - Sala: nombre, ubicación
        - Estilo: nombre
        - Oferta: nombre
        - Ciclo: nombre
        - Subcategoria: nombre
        - Categoria: nombre
        - Programa: nombre
        """
        # Subquery para contar inscritos por horario
        subquery_inscritos = db.session.query(
            HorarioSesion.Horario_id_horario,
            func.count(Asistencia.id_asistencia).label('total_inscritos')
        ).join(
            Asistencia, HorarioSesion.id_horario_sesion == Asistencia.Horario_sesion_id_horario_sesion
        ).filter(
            HorarioSesion.estado == True,
            Asistencia.estado == True
        ).group_by(HorarioSesion.Horario_id_horario).subquery()

        # Query principal con todos los joins necesarios
        return db.session.query(
            Horario, 
            Profesor, 
            Persona,  # Información del profesor
            Sala, 
            Estilo, 
            Oferta, 
            Ciclo, 
            Subcategoria, 
            Categoria, 
            Programa,
            func.coalesce(subquery_inscritos.c.total_inscritos, 0).label('total_inscritos')
        ).join(
            Profesor, Horario.Profesor_id_profesor == Profesor.id_profesor
        ).join(
            Persona, Profesor.Persona_id_persona == Persona.id_persona  # Join con Persona del profesor
        ).join(
            Sala, Horario.Sala_id_sala == Sala.id_sala
        ).join(
            Estilo, Horario.Estilo_id_estilo == Estilo.id_estilo
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
        ).outerjoin(
            subquery_inscritos, Horario.id_horario == subquery_inscritos.c.Horario_id_horario
        ).filter(
            Horario.estado == True,
            Profesor.estado == True
            # Removido: Persona.estado == True para incluir horarios con personas inactivas
        ).all()
