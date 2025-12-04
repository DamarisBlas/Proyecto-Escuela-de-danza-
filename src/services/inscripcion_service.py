from src.repositories.inscripcion_repository import InscripcionRepository
from src.repositories.persona_repository import PersonaRepository
from src.repositories.paquete_repository import PaqueteRepository
from src.repositories.promocion_repository import PromocionRepository
from src.repositories.asistencia_repository import AsistenciaRepository
from src.repositories.horario_sesion_repository import HorarioSesionRepository
from src.repositories.pago_repository import PagoRepository
from src.app import db
from datetime import datetime, date, timedelta
from sqlalchemy import text
import math

class InscripcionService:
    """
    Servicio para lógica de negocio de Inscripcion
    """

    @staticmethod
    def get_all_inscripciones():
        """
        Obtiene todas las inscripciones
        """
        try:
            inscripciones = InscripcionRepository.get_all()
            return [inscripcion.to_dict() for inscripcion in inscripciones], 200
        except Exception as e:
            return {"error": f"Error al obtener inscripciones: {str(e)}"}, 500

    @staticmethod
    def get_inscripcion_by_id(inscripcion_id):
        """
        Obtiene una inscripción por ID
        """
        try:
            inscripcion = InscripcionRepository.get_by_id(inscripcion_id)
            if not inscripcion:
                return {"error": "Inscripción no encontrada"}, 404
            return inscripcion.to_dict(), 200
        except Exception as e:
            return {"error": f"Error al obtener inscripción: {str(e)}"}, 500

    @staticmethod
    def get_active_inscripciones():
        """
        Obtiene todas las inscripciones activas
        """
        try:
            inscripciones = InscripcionRepository.get_active()
            return [inscripcion.to_dict() for inscripcion in inscripciones], 200
        except Exception as e:
            return {"error": f"Error al obtener inscripciones completas: {str(e)}"}, 500

    @staticmethod
    def get_inscritos_por_horario(horario_id):
        """
        Obtiene todas las personas inscritas a un horario específico
        con información detallada de persona, inscripción, paquete y sesiones
        
        Args:
            horario_id: ID del horario
            
        Returns:
            Diccionario con información del horario y lista de inscritos con sus sesiones
        """
        try:
            from src.models.horario import Horario
            from src.models.horario_sesion import HorarioSesion
            from src.models.inscripcion import Inscripcion
            from src.models.asistencia import Asistencia
            from src.models.persona import Persona
            from src.models.paquete import Paquete
            from src.models.estilo import Estilo
            
            # Obtener información del horario
            horario = db.session.query(Horario, Estilo).join(
                Estilo, Horario.Estilo_id_estilo == Estilo.id_estilo
            ).filter(
                Horario.id_horario == horario_id
            ).first()
            
            if not horario:
                return {"error": "Horario no encontrado"}, 404
            
            horario_obj, estilo_obj = horario
            
            # Convertir días a nombres
            dias_numeros = [int(d.strip()) for d in horario_obj.dias.split(',')]
            dias_nombres_map = {
                1: 'Lunes', 2: 'Martes', 3: 'Miércoles',
                4: 'Jueves', 5: 'Viernes', 6: 'Sábado', 7: 'Domingo'
            }
            dias_texto = ', '.join([dias_nombres_map.get(d, str(d)) for d in dias_numeros])
            
            # Obtener todas las asistencias de sesiones de este horario
            asistencias_query = db.session.query(
                Asistencia, HorarioSesion, Inscripcion, Persona, Paquete
            ).join(
                HorarioSesion, Asistencia.Horario_sesion_id_horario_sesion == HorarioSesion.id_horario_sesion
            ).join(
                Inscripcion, Asistencia.Inscripcion_id_inscripcion == Inscripcion.id_inscripcion
            ).join(
                Persona, Inscripcion.Persona_id_persona == Persona.id_persona
            ).join(
                Paquete, Inscripcion.Paquete_id_paquete == Paquete.id_paquete
            ).filter(
                HorarioSesion.Horario_id_horario == horario_id,
                Inscripcion.estado == 'ACTIVO',
                Asistencia.estado == True
            ).order_by(
                Persona.nombre,
                HorarioSesion.fecha
            ).all()
            
            # Agrupar por persona
            inscritos_dict = {}
            
            for asistencia, sesion, inscripcion, persona, paquete in asistencias_query:
                persona_id = persona.id_persona
                
                if persona_id not in inscritos_dict:
                    inscritos_dict[persona_id] = {
                        "persona": {
                            "id_persona": persona.id_persona,
                            "nombre": persona.nombre,
                            "apellido": persona.apellido,
                            "email": persona.email,
                            "celular": persona.celular
                        },
                        "inscripcion": {
                            "id_inscripcion": inscripcion.id_inscripcion,
                            "estado": inscripcion.estado,
                            "clases_restantes": inscripcion.clases_restantes,
                            "clases_usadas": inscripcion.clases_usadas,
                            "fecha_inicio": inscripcion.fecha_inicio.isoformat() if inscripcion.fecha_inicio else None,
                            "fecha_fin": inscripcion.fecha_fin.isoformat() if inscripcion.fecha_fin else None,
                            "estado_pago": inscripcion.estado_pago,
                            "paquete": {
                                "id_paquete": paquete.id_paquete,
                                "nombre": paquete.nombre,
                                "cantidad_clases": paquete.cantidad_clases
                            }
                        },
                        "sesiones": []
                    }
                
                # Agregar sesión a la lista
                sesion_dict = {
                    "id_sesion": sesion.id_horario_sesion,
                    "fecha": sesion.fecha.isoformat() if sesion.fecha else None,
                    "hora_inicio": sesion.hora_inicio.strftime('%H:%M') if sesion.hora_inicio else None,
                    "hora_fin": sesion.hora_fin.strftime('%H:%M') if sesion.hora_fin else None,
                    "asistencia": {
                        "id_asistencia": asistencia.id_asistencia,
                        "asistio": asistencia.asistio
                    }
                }
                
                inscritos_dict[persona_id]["sesiones"].append(sesion_dict)
            
            # Convertir el diccionario a lista
            inscritos_lista = list(inscritos_dict.values())
            
            # Construir respuesta
            resultado = {
                "horario": {
                    "id_horario": horario_obj.id_horario,
                    "dias": dias_texto,
                    "hora_inicio": horario_obj.hora_inicio.strftime('%H:%M') if horario_obj.hora_inicio else None,
                    "hora_fin": horario_obj.hora_fin.strftime('%H:%M') if horario_obj.hora_fin else None,
                    "capacidad": horario_obj.capacidad,
                    "nivel": horario_obj.nivel,
                    "estilo": {
                        "id_estilo": estilo_obj.id_estilo,
                        "nombre_estilo": estilo_obj.nombre_estilo
                    }
                },
                "total_inscritos": len(inscritos_lista),
                "inscritos": inscritos_lista
            }
            
            return resultado, 200
            
        except Exception as e:
            return {"error": f"Error al obtener inscritos por horario: {str(e)}"}, 500

    @staticmethod
    def get_inscripciones_by_persona(persona_id):
        """
        Obtiene todas las inscripciones de una persona
        """
        try:
            inscripciones = InscripcionRepository.get_by_persona(persona_id)
            return [inscripcion.to_dict() for inscripcion in inscripciones], 200
        except Exception as e:
            return {"error": f"Error al obtener inscripciones de la persona: {str(e)}"}, 500

    @staticmethod
    def create_inscripcion(inscripcion_data):
        """
        Crea una nueva inscripción con validaciones y cálculos automáticos
        Incluye creación automática de asistencias para las clases seleccionadas
        """
        try:
            # Validaciones requeridas
            required_fields = ['Persona_id_persona', 'Paquete_id_paquete', 'fecha_inscripcion', 'fecha_inicio', 'metodo_pago_id']
            if not all(field in inscripcion_data for field in required_fields):
                return {"error": "Faltan campos requeridos"}, 400

            # Extraer clases seleccionadas y método de pago del body
            clases_seleccionadas = inscripcion_data.pop('clases_seleccionadas', [])
            metodo_pago_id = inscripcion_data.pop('metodo_pago_id')

            # Extraer info de cuotas (separar para no pasar como keyword inesperado)
            numero_cuotas_in = inscripcion_data.pop('numero_cuotas', None)
            montos_cuotas_in = inscripcion_data.pop('montos_cuotas', None)

            # Validar que la persona existe
            from src.repositories.persona_repository import PersonaRepository
            persona = PersonaRepository.get_by_id(inscripcion_data['Persona_id_persona'])
            if not persona:
                return {"error": "Persona no encontrada"}, 404

            # Validar que el paquete existe
            from src.repositories.paquete_repository import PaqueteRepository
            paquete = PaqueteRepository.get_by_id(inscripcion_data['Paquete_id_paquete'])
            if not paquete:
                return {"error": "Paquete no encontrado"}, 404

            # Validar que el método de pago existe
            from src.repositories.metodo_pago_repository import MetodoPagoRepository
            metodo_pago = MetodoPagoRepository.get_by_id(metodo_pago_id)
            if not metodo_pago:
                return {"error": "Método de pago no encontrado"}, 404

            # Calcular fechas y monto/estado
            fecha_inscripcion = datetime.strptime(inscripcion_data['fecha_inscripcion'], '%Y-%m-%d').date()
            fecha_inicio = datetime.strptime(inscripcion_data['fecha_inicio'], '%Y-%m-%d').date()
            pago_a_cuotas = inscripcion_data.get('pago_a_cuotas', False)

            if len(clases_seleccionadas) == 1 or not pago_a_cuotas:
                fecha_fin = fecha_inicio
            else:
                fecha_fin = fecha_inicio + timedelta(days=30)
            inscripcion_data['fecha_fin'] = fecha_fin

            # Clases restantes
            if paquete.ilimitado:
                inscripcion_data['clases_restantes'] = None
            else:
                inscripcion_data['clases_restantes'] = paquete.cantidad_clases

            # Precios
            precio_original = float(paquete.precio)
            inscripcion_data['precio_original'] = precio_original
            descuento_aplicado = 0
            if inscripcion_data.get('Promocion_id_promocion'):
                try:
                    from src.repositories.promocion_repository import PromocionRepository
                    promocion = PromocionRepository.get_by_id(inscripcion_data['Promocion_id_promocion'])
                    if promocion and promocion.estado:
                        descuento_aplicado = (precio_original * float(promocion.porcentaje_descuento)) / 100
                except Exception:
                    pass
            inscripcion_data['descuento_aplicado'] = descuento_aplicado
            inscripcion_data['precio_final'] = precio_original - descuento_aplicado

            # Estado pago
            if metodo_pago_id == 1:
                estado_pago_inicial = 'PENDIENTE'
            else:
                estado_pago_inicial = 'PAGADO'

            inscripcion_data.setdefault('clases_usadas', 0)
            inscripcion_data.setdefault('pago_a_cuotas', pago_a_cuotas)
            inscripcion_data.setdefault('estado_pago', estado_pago_inicial)
            inscripcion_data.setdefault('estado', 'ACTIVO')

            # Crear inscripción (sin numero_cuotas/montos_cuotas)
            inscripcion = InscripcionRepository.create(inscripcion_data)

            # Crear asistencias automáticas
            asistencias_creadas = []
            cupos_actualizados = {}
            sesiones_info = []  # Para almacenar info de fecha y hora de las sesiones
            
            if clases_seleccionadas:
                sesiones_sin_cupo = []
                for horario_sesion_id in clases_seleccionadas:
                    capacidad_info = HorarioSesionRepository.get_capacidad_info(horario_sesion_id)
                    if not capacidad_info:
                        return {"error": f"Sesión {horario_sesion_id} no encontrada"}, 404
                    if capacidad_info['cupos_disponibles'] <= 0:
                        sesiones_sin_cupo.append(horario_sesion_id)
                    
                    # Obtener información de la sesión (fecha y hora)
                    sesion = HorarioSesionRepository.get_by_id(horario_sesion_id)
                    if sesion:
                        sesiones_info.append({
                            'id': horario_sesion_id,
                            'fecha': sesion.fecha,
                            'hora_inicio': sesion.hora_inicio
                        })
                
                if sesiones_sin_cupo:
                    return {"error": "No hay cupos disponibles en las siguientes sesiones", "sesiones_sin_cupo": sesiones_sin_cupo}, 400
                
                asistencias_data = []
                for horario_sesion_id in clases_seleccionadas:
                    asistencia_data = {
                        'Inscripcion_id_inscripcion': inscripcion.id_inscripcion,
                        'Horario_sesion_id_horario_sesion': horario_sesion_id,
                        'asistio': None,
                        'fecha': None,
                        'estado': True
                    }
                    asistencias_data.append(asistencia_data)
                asistencias_creadas = AsistenciaRepository.create_bulk(asistencias_data)
                cupos_actualizados = HorarioSesionRepository.bulk_increment_cupos(clases_seleccionadas)

            # Ordenar sesiones por fecha y hora
            sesiones_ordenadas = sorted(sesiones_info, key=lambda x: (x['fecha'], x['hora_inicio']))

            # Calcular costo por clase
            precio_final = float(inscripcion_data['precio_final'])
            cantidad_clases_paquete = paquete.cantidad_clases if not paquete.ilimitado else len(clases_seleccionadas)
            if cantidad_clases_paquete == 0 or cantidad_clases_paquete is None:
                cantidad_clases_paquete = len(clases_seleccionadas) if clases_seleccionadas else 1
            
            costo_por_clase = precio_final / cantidad_clases_paquete

            # Estado de pago según método
            estado_pago = 'PENDIENTE' if metodo_pago_id == 1 else 'CONFIRMADO'

            pagos_creados = []
            if inscripcion_data.get('pago_a_cuotas', False) and clases_seleccionadas:
                numero_cuotas = int(numero_cuotas_in) if numero_cuotas_in else 3
                # Parse montos
                montos_list = []
                if montos_cuotas_in:
                    if isinstance(montos_cuotas_in, str):
                        try:
                            montos_list = [float(m.strip()) for m in montos_cuotas_in.split(',') if m.strip()]
                        except Exception:
                            return {"error": "montos_cuotas debe ser string con numeros separados por coma"}, 400
                    elif isinstance(montos_cuotas_in, (list, tuple)):
                        try:
                            montos_list = [float(m) for m in montos_cuotas_in]
                        except Exception:
                            return {"error": "montos_cuotas contiene valores no numéricos"}, 400
                    else:
                        return {"error": "montos_cuotas debe ser string o lista"}, 400

                # If not provided, distribute equally
                if not montos_list:
                    total = round(float(inscripcion_data['precio_final']), 2)
                    cuota_base = round(total / numero_cuotas, 2)
                    montos_list = [cuota_base] * numero_cuotas
                    suma = round(sum(montos_list), 2)
                    if suma != total:
                        diferencia = round(total - suma, 2)
                        montos_list[-1] = round(montos_list[-1] + diferencia, 2)

                # Validate length
                if len(montos_list) != numero_cuotas:
                    return {"error": "El número de montos no coincide con numero_cuotas"}, 400

                # Validate sum equals precio_final
                suma_montos = round(sum(montos_list), 2)
                if abs(suma_montos - round(float(inscripcion_data['precio_final']), 2)) > 0.01:
                    return {"error": "La suma de montos_cuotas no coincide con precio_final"}, 400

                # Persist numero_cuotas and montos_cuotas
                # Use direct SQL UPDATE because model mapper may not include these columns yet
                montos_str = ','.join([str(m) for m in montos_list])
                try:
                    db.session.execute(
                        text("UPDATE \"Inscripcion\" SET numero_cuotas = :nc, montos_cuotas = :mc WHERE id_inscripcion = :id"),
                        {
                            'nc': numero_cuotas,
                            'mc': montos_str,
                            'id': inscripcion.id_inscripcion
                        }
                    )
                    db.session.flush()
                except Exception as ex:
                    db.session.rollback()
                    return {"error": f"No se pudo asignar numero_cuotas/montos_cuotas: {str(ex)}"}, 500

                # Calcular fechas de vencimiento basadas en clases cubiertas por cada cuota
                clase_index = 0  # Índice de la clase actual
                
                for idx_cuota in range(1, numero_cuotas + 1):
                    monto_cuota = montos_list[idx_cuota - 1]
                    
                    # Calcular cuántas clases cubre esta cuota
                    # Redondear hacia abajo (int trunca decimales: 2.3 -> 2, 2.9 -> 2)
                    clases_cubiertas = int(monto_cuota / costo_por_clase)
                    
                    # Asegurarse de que cubre al menos 1 clase
                    if clases_cubiertas < 1:
                        clases_cubiertas = 1
                    
                    # La fecha de vencimiento es la fecha de la primera clase que cubre esta cuota
                    if clase_index < len(sesiones_ordenadas):
                        fecha_vencimiento = sesiones_ordenadas[clase_index]['fecha']
                    else:
                        # Si no hay más clases, usar la última fecha + un día
                        if sesiones_ordenadas:
                            fecha_vencimiento = sesiones_ordenadas[-1]['fecha'] + timedelta(days=1)
                        else:
                            fecha_vencimiento = fecha_inicio
                    
                    # fecha_pago: si está confirmado, usar fecha_vencimiento; si pendiente, None
                    fecha_pago_cuota = fecha_vencimiento if metodo_pago_id != 1 else None
                    fecha_confirmacion_cuota = fecha_vencimiento if metodo_pago_id != 1 else None
                    
                    pago_data = {
                        'Inscripcion_id_inscripcion': inscripcion.id_inscripcion,
                        'Metodo_pago_id_metodo_pago': metodo_pago_id,
                        'numero_cuota': idx_cuota,
                        'monto': monto_cuota,
                        'fecha_pago': fecha_pago_cuota,
                        'fecha_vencimiento': fecha_vencimiento,
                        'fecha_confirmacion_director': fecha_confirmacion_cuota,
                        'confirmado_por': 0,
                        'observaciones': None,
                        'estado': estado_pago
                    }
                    pago = PagoRepository.create(pago_data)
                    pagos_creados.append(pago)
                    
                    # Avanzar el índice de clases según las clases cubiertas
                    clase_index += clases_cubiertas
            else:
                # Pago único - usar la fecha de la primera clase o fecha_inscripcion
                if sesiones_ordenadas:
                    fecha_vencimiento = sesiones_ordenadas[0]['fecha']
                else:
                    fecha_vencimiento = fecha_inscripcion
                
                # fecha_pago: si está confirmado, usar fecha_vencimiento; si pendiente, None
                fecha_pago_unico = fecha_vencimiento if metodo_pago_id != 1 else None
                fecha_confirmacion_unico = fecha_vencimiento if metodo_pago_id != 1 else None
                
                # Actualizar campos de inscripción para pago único
                # Use direct SQL UPDATE because model mapper may not include these columns yet
                try:
                    db.session.execute(
                        text("UPDATE \"Inscripcion\" SET numero_cuotas = :nc, montos_cuotas = :mc WHERE id_inscripcion = :id"),
                        {
                            'nc': 1,
                            'mc': str(precio_final),
                            'id': inscripcion.id_inscripcion
                        }
                    )
                    db.session.flush()
                except Exception:
                    pass  # No es crítico para pago único
                
                pago_data = {
                    'Inscripcion_id_inscripcion': inscripcion.id_inscripcion,
                    'Metodo_pago_id_metodo_pago': metodo_pago_id,
                    'numero_cuota': 1,
                    'monto': precio_final,
                    'fecha_pago': fecha_pago_unico,
                    'fecha_vencimiento': fecha_vencimiento,
                    'fecha_confirmacion_director': fecha_confirmacion_unico,
                    'confirmado_por': 0,
                    'observaciones': None,
                    'estado': estado_pago
                }
                pago = PagoRepository.create(pago_data)
                pagos_creados.append(pago)

            db.session.commit()

            return {
                'message': 'Inscripción creada exitosamente',
                'inscripcion': inscripcion.to_dict(),
                'asistencias_creadas': len(asistencias_creadas),
                'clases_programadas': [a.to_dict() for a in asistencias_creadas],
                'cupos_actualizados': cupos_actualizados,
                'pagos_creados': len(pagos_creados),
                'pagos_programados': [p.to_dict() for p in pagos_creados]
            }, 201

        except Exception as e:
            db.session.rollback()
            return {"error": f"Error al crear inscripción: {str(e)}"}, 500

    @staticmethod
    def update_inscripcion(inscripcion_id, inscripcion_data):
        """
        Actualiza una inscripción existente
        """
        try:
            # Verificar que la inscripción existe
            existing_inscripcion = InscripcionRepository.get_by_id(inscripcion_id)
            if not existing_inscripcion:
                return {"error": "Inscripción no encontrada"}, 404

            # Recalcular precio_final si se actualiza descuento
            if 'descuento_aplicado' in inscripcion_data:
                precio_original = existing_inscripcion.precio_original
                nuevo_descuento = inscripcion_data['descuento_aplicado']
                inscripcion_data['precio_final'] = precio_original - nuevo_descuento

            inscripcion = InscripcionRepository.update(inscripcion_id, inscripcion_data)
            db.session.commit()

            return {
                "message": "Inscripción actualizada exitosamente",
                "inscripcion": inscripcion.to_dict()
            }, 200

        except Exception as e:
            db.session.rollback()
            return {"error": f"Error al actualizar inscripción: {str(e)}"}, 500

    @staticmethod
    def cancel_inscripcion(inscripcion_id):
        """
        Cancela una inscripción (borrado lógico)
        """
        try:
            inscripcion = InscripcionRepository.delete(inscripcion_id)
            if not inscripcion:
                return {"error": "Inscripción no encontrada"}, 404

            db.session.commit()
            return {"message": "Inscripción cancelada exitosamente"}, 200

        except Exception as e:
            db.session.rollback()
            return {"error": f"Error al cancelar inscripción: {str(e)}"}, 500

    @staticmethod
    def use_class(inscripcion_id):
        """
        Registra el uso de una clase (incrementa clases_usadas, decrementa clases_restantes)
        """
        try:
            inscripcion = InscripcionRepository.get_by_id(inscripcion_id)
            if not inscripcion:
                return {"error": "Inscripción no encontrada"}, 404

            if inscripcion.estado == 'CANCELADO':
                return {"error": "No se puede usar clase de inscripción cancelada"}, 400

            # Verificar si tiene clases disponibles (solo si no es ilimitado)
            if inscripcion.clases_restantes is not None and inscripcion.clases_restantes <= 0:
                return {"error": "No hay clases disponibles"}, 400

            # Incrementar clases usadas
            nuevo_clases_usadas = inscripcion.clases_usadas + 1
            update_data = {'clases_usadas': nuevo_clases_usadas}

            # Decrementar clases restantes (solo si no es ilimitado)
            if inscripcion.clases_restantes is not None:
                update_data['clases_restantes'] = inscripcion.clases_restantes - 1

            # Verificar si completó todas las clases
            from src.repositories.paquete_repository import PaqueteRepository
            paquete = PaqueteRepository.get_by_id(inscripcion.Paquete_id_paquete)
            
            # Si no es ilimitado y ya usó todas las clases, marcar como COMPLETADO
            if (paquete and not paquete.ilimitado and 
                inscripcion.clases_restantes is not None and 
                inscripcion.clases_restantes <= 0):
                update_data['estado'] = 'COMPLETADO'

            inscripcion = InscripcionRepository.update(inscripcion_id, update_data)
            db.session.commit()

            return {
                "message": "Clase registrada exitosamente",
                "inscripcion": inscripcion.to_dict()
            }, 200

        except Exception as e:
            db.session.rollback()
            return {"error": f"Error al registrar clase: {str(e)}"}, 500

    @staticmethod
    def actualizar_estado_pago_inscripcion(inscripcion_id):
        """
        Actualiza el estado_pago de una inscripción basándose en sus pagos
        """
        try:
            from src.repositories.pago_repository import PagoRepository
            
            # Obtener todos los pagos de la inscripción
            pagos = PagoRepository.get_by_inscripcion(inscripcion_id)
            
            if not pagos:
                # Si no hay pagos, estado_pago = PENDIENTE
                estado_pago = 'PENDIENTE'
            else:
                pagos_confirmados = [p for p in pagos if p.estado == 'CONFIRMADO']
                total_pagos = len(pagos)
                pagos_confirmados_count = len(pagos_confirmados)
                
                if pagos_confirmados_count == 0:
                    estado_pago = 'PENDIENTE'
                elif pagos_confirmados_count == total_pagos:
                    estado_pago = 'PAGADO'
                else:
                    estado_pago = 'PAGO_PARCIAL'
            
            # Actualizar el estado_pago
            InscripcionRepository.update(inscripcion_id, {'estado_pago': estado_pago})
            return estado_pago
            
        except Exception as e:
            return None

    @staticmethod
    def verificar_y_actualizar_vencimientos():
        """
        Verifica inscripciones con pagos vencidos y actualiza estados
        """
        try:
            from datetime import date
            from src.repositories.pago_repository import PagoRepository
            
            # Obtener pagos vencidos
            pagos_vencidos = PagoRepository.get_pagos_vencidos()
            inscripciones_a_suspender = set()
            
            for pago in pagos_vencidos:
                inscripciones_a_suspender.add(pago.Inscripcion_id_inscripcion)
            
            # Actualizar inscripciones a SUSPENDIDO
            for inscripcion_id in inscripciones_a_suspender:
                inscripcion = InscripcionRepository.get_by_id(inscripcion_id)
                if inscripcion and inscripcion.estado == 'ACTIVO':
                    InscripcionRepository.update(inscripcion_id, {
                        'estado': 'SUSPENDIDO',
                        'estado_pago': 'VENCIDO'
                    })
            
            db.session.commit()
            return len(inscripciones_a_suspender)
            
        except Exception as e:
            db.session.rollback()
            return 0

    @staticmethod
    def get_inscripciones_vigentes():
        """
        Obtiene inscripciones vigentes
        """
        try:
            inscripciones = InscripcionRepository.get_inscripciones_vigentes()
            return [inscripcion.to_dict() for inscripcion in inscripciones], 200
        except Exception as e:
            return {"error": f"Error al obtener inscripciones vigentes: {str(e)}"}, 500

    @staticmethod
    def get_inscripciones_vencidas():
        """
        Obtiene inscripciones vencidas
        """
        try:
            inscripciones = InscripcionRepository.get_inscripciones_vencidas()
            return [inscripcion.to_dict() for inscripcion in inscripciones], 200
        except Exception as e:
            return {"error": f"Error al obtener inscripciones vencidas: {str(e)}"}, 500

    @staticmethod
    def get_inscripciones_completas():
        """
        Obtiene todas las inscripciones con información completa detallada
        Incluye datos de persona, paquete, promoción, oferta, ciclo, subcategoría, categoría y programa
        """
        try:
            # Obtener inscripciones con joins a todas las tablas relacionadas
            inscripciones_completas = InscripcionRepository.get_inscripciones_completas()

            if not inscripciones_completas:
                return {"inscripciones": [], "mensaje": "No hay inscripciones disponibles"}, 200

            # Formatear la respuesta con información completa
            inscripciones_formateadas = []
            for inscripcion, persona, paquete, promocion, oferta, ciclo, subcategoria, categoria, programa in inscripciones_completas:
                inscripcion_dict = {
                    "id_inscripcion": inscripcion.id_inscripcion,
                    "fecha_inscripcion": inscripcion.fecha_inscripcion.isoformat() if inscripcion.fecha_inscripcion else None,
                    "fecha_inicio": inscripcion.fecha_inicio.isoformat() if inscripcion.fecha_inicio else None,
                    "fecha_fin": inscripcion.fecha_fin.isoformat() if inscripcion.fecha_fin else None,
                    "precio_original": float(inscripcion.precio_original) if inscripcion.precio_original is not None else None,
                    "descuento_aplicado": float(inscripcion.descuento_aplicado) if inscripcion.descuento_aplicado is not None else 0.0,
                    "precio_final": float(inscripcion.precio_final) if inscripcion.precio_final is not None else None,
                    "estado_pago": inscripcion.estado_pago,
                    "clases_usadas": inscripcion.clases_usadas,
                    "clases_restantes": inscripcion.clases_restantes,
                    "pago_a_cuotas": inscripcion.pago_a_cuotas,
                    "estado": inscripcion.estado,

                    # Información completa de la persona
                    "persona": {
                        "id_persona": persona.id_persona,
                        "nombre": persona.nombre,
                        "apellido": persona.apellido,
                        "email": persona.email,
                        "celular": persona.celular,
                        "estado": persona.estado
                    } if persona else None,

                    # Información completa del paquete
                    "paquete": {
                        "id_paquete": paquete.id_paquete,
                        "nombre": paquete.nombre,
                        "cantidad_clases": paquete.cantidad_clases,
                        "dias_validez": paquete.dias_validez,
                        "ilimitado": paquete.ilimitado,
                        "precio": float(paquete.precio) if paquete.precio else None,
                        "estado": paquete.estado
                    } if paquete else None,

                    # Información completa de la promoción (si existe)
                    "promocion": {
                        "id_promocion": promocion.id_promocion,
                        "nombre_promocion": promocion.nombre_promocion,
                        "descricpcion": promocion.descricpcion,
                        "fecha_inicio": promocion.fecha_inicio.isoformat() if promocion.fecha_inicio else None,
                        "fecha_fin": promocion.fecha_fin.isoformat() if promocion.fecha_fin else None,
                        "porcentaje_descuento": float(promocion.porcentaje_descuento) if promocion.porcentaje_descuento is not None else None,
                        "paquetes_especificos": promocion.paquetes_especificos,
                        "aplica_nuevos_usuarios": promocion.aplica_nuevos_usuarios,
                        "tiene_sorteo": promocion.tiene_sorteo,
                        "cantidad_premios": promocion.cantidad_premios,
                        "activo": promocion.activo,
                        "estado": promocion.estado
                    } if promocion else None,

                    # Información completa de la oferta
                    "oferta": {
                        "id_oferta": oferta.id_oferta,
                        "nombre_oferta": oferta.nombre_oferta,
                        "descripcion": oferta.descripcion,
                        "fecha_inicio": oferta.fecha_inicio.isoformat() if oferta.fecha_inicio else None,
                        "fecha_fin": oferta.fecha_fin.isoformat() if oferta.fecha_fin else None,
                        "estado": oferta.estado,
                        "cantidad_cursos": oferta.cantidad_cursos,
                        "publico_objetivo": oferta.publico_objetivo,
                        "repite_semanalmente": oferta.repite_semanalmente,
                        "ciclo": {
                            "id_ciclo": ciclo.id_ciclo,
                            "nombre_ciclo": ciclo.nombre
                        } if ciclo else None,
                        # Subcategoria, Categoria y Programa asociados a la oferta
                        "subcategoria": {
                            "id_subcategoria": subcategoria.id_subcategoria,
                            "nombre_subcategoria": subcategoria.nombre_subcategoria
                        } if subcategoria else None,
                        "categoria": {
                            "id_categoria": categoria.id_categoria,
                            "nombre_categoria": categoria.nombre_categoria
                        } if categoria else None,
                        "programa": {
                            "id_programa": programa.id_programa,
                            "nombre_programa": programa.nombre_programa
                        } if programa else None
                    } if oferta else None
                }
                inscripciones_formateadas.append(inscripcion_dict)

            return {
                "inscripciones": inscripciones_formateadas,
                "total_inscripciones": len(inscripciones_formateadas)
            }, 200

        except Exception as e:
            return {"error": f"Error al obtener inscripciones completas: {str(e)}"}, 500