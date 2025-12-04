from src.models.permiso import Permiso
from src.app import db
from sqlalchemy import and_, or_, desc, asc
from datetime import datetime

class PermisoRepository:
    
    @staticmethod
    def get_all():
        """Obtiene todos los permisos"""
        try:
            print("Intentando obtener todos los permisos...")
            permisos = Permiso.query.all()
            print(f"Permisos encontrados: {len(permisos)}")
            return permisos
        except Exception as e:
            print(f"Error al obtener todos los permisos: {str(e)}")
            import traceback
            traceback.print_exc()
            return []
    
    @staticmethod
    def get_by_id(permiso_id):
        """Obtiene un permiso por ID"""
        try:
            return Permiso.query.filter_by(permiso_id=permiso_id).first()
        except Exception as e:
            print(f"Error al obtener permiso por ID {permiso_id}: {str(e)}")
            return None
    
    @staticmethod
    def get_active():
        """Obtiene todos los permisos activos"""
        try:
            return Permiso.query.filter_by(activo=True).all()
        except Exception as e:
            print(f"Error al obtener permisos activos: {str(e)}")
            return []
    
    @staticmethod
    def get_by_persona(persona_id):
        """Obtiene todos los permisos de una persona"""
        try:
            return Permiso.query.filter_by(
                persona_id_persona=persona_id,
                activo=True
            ).order_by(desc(Permiso.fecha_solicitud)).all()
        except Exception as e:
            print(f"Error al obtener permisos de persona {persona_id}: {str(e)}")
            return []
    
    @staticmethod
    def get_by_inscripcion(inscripcion_id):
        """Obtiene todos los permisos de una inscripción"""
        try:
            return Permiso.query.filter_by(
                inscripcion_id_inscripcion=inscripcion_id,
                activo=True
            ).order_by(desc(Permiso.fecha_solicitud)).all()
        except Exception as e:
            print(f"Error al obtener permisos de inscripción {inscripcion_id}: {str(e)}")
            return []
    
    @staticmethod
    def get_by_estado(estado):
        """Obtiene permisos por estado"""
        try:
            return Permiso.query.filter_by(
                estado_permiso=estado,
                activo=True
            ).order_by(desc(Permiso.fecha_solicitud)).all()
        except Exception as e:
            print(f"Error al obtener permisos con estado {estado}: {str(e)}")
            return []
    
    @staticmethod
    def get_pendientes():
        """Obtiene permisos pendientes"""
        try:
            return Permiso.query.filter_by(
                estado_permiso='PENDIENTE',
                activo=True
            ).order_by(asc(Permiso.fecha_solicitud)).all()
        except Exception as e:
            print(f"Error al obtener permisos pendientes: {str(e)}")
            return []
    
    @staticmethod
    def get_by_horario_sesion(horario_sesion_id):
        """Obtiene permisos por sesión de horario"""
        try:
            return Permiso.query.filter_by(
                horario_sesion_id_horario_sesion=horario_sesion_id,
                activo=True
            ).order_by(desc(Permiso.fecha_solicitud)).all()
        except Exception as e:
            print(f"Error al obtener permisos de horario sesión {horario_sesion_id}: {str(e)}")
            return []
    
    @staticmethod
    def get_respondidos_por(persona_id):
        """Obtiene permisos respondidos por una persona"""
        try:
            return Permiso.query.filter_by(
                respondida_por=persona_id,
                activo=True
            ).filter(Permiso.estado_permiso.in_(['APROBADO', 'RECHAZADO'])).order_by(desc(Permiso.fecha_respuesta)).all()
        except Exception as e:
            print(f"Error al obtener permisos respondidos por {persona_id}: {str(e)}")
            return []
    
    @staticmethod
    def create(permiso_data):
        """Crea un nuevo permiso"""
        try:
            print(f"🔍 Datos recibidos para crear permiso: {permiso_data}")
            print(f"🔍 Tipo de datos: {type(permiso_data)}")
            
            # Validar que los campos necesarios existen (en lowercase)
            campos_requeridos = ['persona_id_persona', 'inscripcion_id_inscripcion', 'asistencia_original_id', 'motivo', 'horario_sesion_id_horario_sesion']
            for campo in campos_requeridos:
                if campo not in permiso_data:
                    print(f"❌ Campo faltante: {campo}")
                    return None
                print(f"✅ Campo {campo}: {permiso_data[campo]} ({type(permiso_data[campo])})")
            
            print("🔍 Creando objeto Permiso...")
            nuevo_permiso = Permiso(**permiso_data)
            print(f"✅ Permiso creado en memoria: {nuevo_permiso}")
            print(f"🔍 Permiso ID antes de guardar: {nuevo_permiso.permiso_id}")
            
            print("🔍 Agregando a sesión...")
            db.session.add(nuevo_permiso)
            
            print("🔍 Haciendo commit...")
            db.session.commit()
            
            print(f"✅ Permiso guardado en DB con ID: {nuevo_permiso.permiso_id}")
            return nuevo_permiso
        except Exception as e:
            db.session.rollback()
            print(f"❌ Error al crear permiso: {str(e)}")
            print(f"❌ Tipo de error: {type(e)}")
            import traceback
            traceback.print_exc()
            return None
    
    @staticmethod
    def update(permiso_id, permiso_data):
        """Actualiza un permiso existente"""
        try:
            permiso = Permiso.query.filter_by(permiso_id=permiso_id).first()
            if permiso:
                for key, value in permiso_data.items():
                    if hasattr(permiso, key):
                        setattr(permiso, key, value)
                db.session.commit()
                return permiso
            return None
        except Exception as e:
            db.session.rollback()
            print(f"Error al actualizar permiso {permiso_id}: {str(e)}")
            return None
    
    @staticmethod
    def delete(permiso_id):
        """Elimina lógicamente un permiso (marca como inactivo)"""
        try:
            permiso = Permiso.query.filter_by(permiso_id=permiso_id).first()
            if permiso:
                permiso.activo = False
                db.session.commit()
                return True
            return False
        except Exception as e:
            db.session.rollback()
            print(f"Error al eliminar permiso {permiso_id}: {str(e)}")
            return False
    
    @staticmethod
    def aprobar_permiso(permiso_id, respondida_por, asistencia_reemplazo_id=None):
        """Aprueba un permiso (permite cambiar decisión previa)"""
        try:
            permiso = Permiso.query.filter_by(permiso_id=permiso_id).first()
            if permiso and permiso.activo:
                permiso.estado_permiso = 'APROBADO'
                permiso.respondida_por = respondida_por
                permiso.fecha_respuesta = datetime.utcnow()
                permiso.motivo_rechazo = None  # Limpiar motivo de rechazo previo
                if asistencia_reemplazo_id:
                    permiso.Asistencia_reemplazo_id = asistencia_reemplazo_id
                db.session.commit()
                return permiso
            return None
        except Exception as e:
            db.session.rollback()
            print(f"Error al aprobar permiso {permiso_id}: {str(e)}")
            return None
    
    @staticmethod
    def rechazar_permiso(permiso_id, respondida_por, motivo_rechazo):
        """Rechaza un permiso (permite cambiar decisión previa)"""
        try:
            permiso = Permiso.query.filter_by(permiso_id=permiso_id).first()
            if permiso and permiso.activo:
                permiso.estado_permiso = 'RECHAZADO'
                permiso.respondida_por = respondida_por
                permiso.fecha_respuesta = datetime.utcnow()
                permiso.motivo_rechazo = motivo_rechazo
                permiso.Asistencia_reemplazo_id = None  # Limpiar asistencia de reemplazo previa
                db.session.commit()
                return permiso
            return None
        except Exception as e:
            db.session.rollback()
            print(f"Error al rechazar permiso {permiso_id}: {str(e)}")
            return None
    
    @staticmethod
    def get_estadisticas():
        """Obtiene estadísticas de permisos"""
        try:
            total = Permiso.query.filter_by(activo=True).count()
            pendientes = Permiso.query.filter_by(estado_permiso='PENDIENTE', activo=True).count()
            aprobados = Permiso.query.filter_by(estado_permiso='APROBADO', activo=True).count()
            rechazados = Permiso.query.filter_by(estado_permiso='RECHAZADO', activo=True).count()
            
            return {
                'total': total,
                'pendientes': pendientes,
                'aprobados': aprobados,
                'rechazados': rechazados
            }
        except Exception as e:
            print(f"Error al obtener estadísticas de permisos: {str(e)}")
            return {
                'total': 0,
                'pendientes': 0,
                'aprobados': 0,
                'rechazados': 0
            }
    
    @staticmethod
    def get_detailed_info(permiso_id):
        """
        Obtiene información detallada de un permiso incluyendo:
        - Datos de la persona (nombre, apellido, email, celular)
        - Datos de la asistencia original (con horario sesion, horario, clase/estilo)
        - Datos de la inscripción (con paquete, oferta, ciclo)
        - Datos de quien respondió el permiso (si aplica)
        """
        from src.models.persona import Persona
        from src.models.asistencia import Asistencia
        from src.models.inscripcion import Inscripcion
        from src.models.horario_sesion import HorarioSesion
        from src.models.horario import Horario
        from src.models.paquete import Paquete
        from src.models.oferta import Oferta
        from src.models.ciclo import Ciclo
        from src.models.estilo import Estilo
        
        try:
            # Query con todos los joins necesarios
            result = db.session.query(
                Permiso,
                Persona,  # Persona solicitante
                Asistencia,  # Asistencia original
                HorarioSesion,  # Horario sesión
                Horario,  # Horario (tiene info de estilo, nivel, días)
                Estilo,  # Estilo de la clase
                Inscripcion,  # Inscripción
                Paquete,  # Paquete
                Oferta,  # Oferta
                Ciclo  # Ciclo
            ).join(
                Persona, Permiso.persona_id_persona == Persona.id_persona
            ).join(
                Asistencia, Permiso.asistencia_original_id == Asistencia.id_asistencia
            ).join(
                HorarioSesion, Permiso.horario_sesion_id_horario_sesion == HorarioSesion.id_horario_sesion
            ).join(
                Horario, HorarioSesion.Horario_id_horario == Horario.id_horario
            ).join(
                Estilo, Horario.Estilo_id_estilo == Estilo.id_estilo
            ).join(
                Inscripcion, Permiso.inscripcion_id_inscripcion == Inscripcion.id_inscripcion
            ).join(
                Paquete, Inscripcion.Paquete_id_paquete == Paquete.id_paquete
            ).join(
                Oferta, Paquete.Oferta_id_oferta == Oferta.id_oferta
            ).join(
                Ciclo, Oferta.ciclo_id_ciclo == Ciclo.id_ciclo
            ).filter(
                Permiso.permiso_id == permiso_id
            ).first()
            
            return result
        except Exception as e:
            print(f"Error al obtener información detallada del permiso {permiso_id}: {str(e)}")
            import traceback
            traceback.print_exc()
            return None
    
    @staticmethod
    def get_all_detailed():
        """
        Obtiene información detallada de todos los permisos activos
        """
        from src.models.persona import Persona
        from src.models.asistencia import Asistencia
        from src.models.inscripcion import Inscripcion
        from src.models.horario_sesion import HorarioSesion
        from src.models.horario import Horario
        from src.models.paquete import Paquete
        from src.models.oferta import Oferta
        from src.models.ciclo import Ciclo
        from src.models.estilo import Estilo
        
        try:
            results = db.session.query(
                Permiso,
                Persona,
                Asistencia,
                HorarioSesion,
                Horario,
                Estilo,
                Inscripcion,
                Paquete,
                Oferta,
                Ciclo
            ).join(
                Persona, Permiso.persona_id_persona == Persona.id_persona
            ).join(
                Asistencia, Permiso.asistencia_original_id == Asistencia.id_asistencia
            ).join(
                HorarioSesion, Permiso.horario_sesion_id_horario_sesion == HorarioSesion.id_horario_sesion
            ).join(
                Horario, HorarioSesion.Horario_id_horario == Horario.id_horario
            ).join(
                Estilo, Horario.Estilo_id_estilo == Estilo.id_estilo
            ).join(
                Inscripcion, Permiso.inscripcion_id_inscripcion == Inscripcion.id_inscripcion
            ).join(
                Paquete, Inscripcion.Paquete_id_paquete == Paquete.id_paquete
            ).join(
                Oferta, Paquete.Oferta_id_oferta == Oferta.id_oferta
            ).join(
                Ciclo, Oferta.ciclo_id_ciclo == Ciclo.id_ciclo
            ).filter(
                Permiso.activo == True
            ).order_by(desc(Permiso.fecha_solicitud)).all()
            
            return results
        except Exception as e:
            print(f"Error al obtener información detallada de todos los permisos: {str(e)}")
            import traceback
            traceback.print_exc()
            return []