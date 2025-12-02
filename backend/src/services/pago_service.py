from src.repositories.pago_repository import PagoRepository
from src.repositories.inscripcion_repository import InscripcionRepository
from src.repositories.metodo_pago_repository import MetodoPagoRepository
from src.app import db
from datetime import datetime, date, timedelta

class PagoService:
    """
    Servicio para lógica de negocio de Pago
    """

    @staticmethod
    def get_all_pagos():
        """
        Obtiene todos los pagos
        """
        try:
            pagos = PagoRepository.get_all()
            return [pago.to_dict() for pago in pagos], 200
        except Exception as e:
            return {"error": f"Error al obtener pagos: {str(e)}"}, 500

    @staticmethod
    def get_pago_by_id(pago_id):
        """
        Obtiene un pago por ID
        """
        try:
            pago = PagoRepository.get_by_id(pago_id)
            if not pago:
                return {"error": "Pago no encontrado"}, 404
            return pago.to_dict(), 200
        except Exception as e:
            return {"error": f"Error al obtener pago: {str(e)}"}, 500

    @staticmethod
    def get_pagos_by_inscripcion(inscripcion_id):
        """
        Obtiene todos los pagos de una inscripción
        """
        try:
            pagos = PagoRepository.get_by_inscripcion(inscripcion_id)
            return [pago.to_dict() for pago in pagos], 200
        except Exception as e:
            return {"error": f"Error al obtener pagos de la inscripción: {str(e)}"}, 500

    @staticmethod
    def get_resumen_cuotas_inscripcion(inscripcion_id):
        """
        Obtiene el resumen de cuotas de una inscripción
        """
        try:
            resumen = PagoRepository.get_cuotas_by_inscripcion(inscripcion_id)
            return resumen, 200
        except Exception as e:
            return {"error": f"Error al obtener resumen de cuotas: {str(e)}"}, 500

    @staticmethod
    def create_pago(pago_data):
        """
        Crea un nuevo pago con validaciones
        """
        try:
            # Validaciones requeridas
            required_fields = ['Inscripcion_id_inscripcion', 'Metodo_pago_id_metodo_pago', 
                             'numero_cuota', 'monto', 'fecha_vencimiento', 'confirmado_por']
            if not all(field in pago_data for field in required_fields):
                return {"error": "Faltan campos requeridos"}, 400

            # Validar que la inscripción existe
            inscripcion = InscripcionRepository.get_by_id(pago_data['Inscripcion_id_inscripcion'])
            if not inscripcion:
                return {"error": "Inscripción no encontrada"}, 404

            # Validar que el método de pago existe
            try:
                from src.repositories.metodo_pago_repository import MetodoPagoRepository
                metodo_pago = MetodoPagoRepository.get_by_id(pago_data['Metodo_pago_id_metodo_pago'])
                if not metodo_pago:
                    return {"error": "Método de pago no encontrado"}, 404
            except ImportError:
                # Si no existe el repository, continuar sin validación
                pass

            # Validar que no existe otro pago con el mismo número de cuota para la misma inscripción
            pagos_existentes = PagoRepository.get_by_inscripcion(pago_data['Inscripcion_id_inscripcion'])
            for pago_existente in pagos_existentes:
                if pago_existente.numero_cuota == pago_data['numero_cuota']:
                    return {"error": f"Ya existe un pago para la cuota {pago_data['numero_cuota']}"}, 400

            # Valores por defecto
            pago_data.setdefault('estado', 'PENDIENTE')
            
            # Crear el pago
            pago = PagoRepository.create(pago_data)
            db.session.commit()

            return {
                "message": "Pago creado exitosamente",
                "pago": pago.to_dict()
            }, 201

        except Exception as e:
            db.session.rollback()
            return {"error": f"Error al crear pago: {str(e)}"}, 500

    @staticmethod
    def update_pago(pago_id, pago_data):
        """
        Actualiza un pago existente
        Si se proporciona id_persona, se actualiza confirmado_por y fecha_confirmacion_director
        Si se proporciona id_inscripcion, se actualiza Inscripcion_id_inscripcion
        Actualiza automáticamente el estado_pago de la inscripción basándose en los estados de todos sus pagos:
        - Todos CONFIRMADO → PAGADO
        - Todos CANCELADO → CANCELADO
        - Todos PENDIENTE → PENDIENTE
        - Mix con al menos un CONFIRMADO → PAGO_PARCIAL
        - Otros casos → PENDIENTE
        """
        try:
            # Verificar que el pago existe
            existing_pago = PagoRepository.get_by_id(pago_id)
            if not existing_pago:
                return {"error": "Pago no encontrado"}, 404

            # Si viene id_persona en el body, actualizar confirmado_por y fecha_confirmacion_director
            if 'id_persona' in pago_data:
                pago_data['confirmado_por'] = pago_data.pop('id_persona')
                # Solo actualizar fecha_confirmacion_director si no existe ya
                if not existing_pago.fecha_confirmacion_director:
                    pago_data['fecha_confirmacion_director'] = datetime.now()
            
            # Si viene id_inscripcion en el body, actualizar Inscripcion_id_inscripcion
            if 'id_inscripcion' in pago_data:
                pago_data['Inscripcion_id_inscripcion'] = pago_data.pop('id_inscripcion')

            # Actualizar el pago
            pago = PagoRepository.update(pago_id, pago_data)
            
            # Obtener el id de inscripción (puede venir del body o del pago existente)
            inscripcion_id = pago.Inscripcion_id_inscripcion
            
            # Obtener todos los pagos de esta inscripción
            todos_pagos = PagoRepository.get_by_inscripcion(inscripcion_id)
            
            # Contar estados de los pagos
            estados = [p.estado for p in todos_pagos]
            count_confirmado = estados.count('CONFIRMADO')
            count_cancelado = estados.count('CANCELADO')
            count_pendiente = estados.count('PENDIENTE')
            count_procesando = estados.count('PROCESANDO')
            count_rechazado = estados.count('RECHAZADO')
            total_pagos = len(estados)
            
            # Determinar el estado_pago de la inscripción
            nuevo_estado_pago = None
            
            if count_confirmado == total_pagos:
                # Todos los pagos están CONFIRMADO
                nuevo_estado_pago = 'PAGADO'
            elif count_cancelado == total_pagos:
                # Todos los pagos están CANCELADO
                nuevo_estado_pago = 'CANCELADO'
            elif count_confirmado > 0 and count_confirmado < total_pagos:
                # Hay al menos un CONFIRMADO pero no todos
                nuevo_estado_pago = 'PAGO_PARCIAL'
            elif count_pendiente == total_pagos:
                # Todos los pagos están PENDIENTE
                nuevo_estado_pago = 'PENDIENTE'
            elif count_procesando > 0 or count_rechazado > 0:
                # Hay pagos en PROCESANDO o RECHAZADO
                if count_confirmado > 0:
                    nuevo_estado_pago = 'PAGO_PARCIAL'
                else:
                    nuevo_estado_pago = 'PENDIENTE'
            else:
                # Caso por defecto
                nuevo_estado_pago = 'PENDIENTE'
            
            # Actualizar el estado_pago de la inscripción
            inscripcion = InscripcionRepository.get_by_id(inscripcion_id)
            if inscripcion and nuevo_estado_pago:
                InscripcionRepository.update(inscripcion_id, {'estado_pago': nuevo_estado_pago})
                db.session.commit()
                
                return {
                    "message": "Pago actualizado exitosamente",
                    "pago": pago.to_dict(),
                    "inscripcion_actualizada": True,
                    "estado_pago_inscripcion": nuevo_estado_pago,
                    "estadisticas_pagos": {
                        "total": total_pagos,
                        "confirmados": count_confirmado,
                        "pendientes": count_pendiente,
                        "cancelados": count_cancelado,
                        "procesando": count_procesando,
                        "rechazados": count_rechazado
                    }
                }, 200
            
            db.session.commit()

            return {
                "message": "Pago actualizado exitosamente",
                "pago": pago.to_dict()
            }, 200

        except Exception as e:
            db.session.rollback()
            return {"error": f"Error al actualizar pago: {str(e)}"}, 500

    @staticmethod
    def confirmar_pago(pago_id, confirmado_por=None):
        """
        Confirma un pago (marca como CONFIRMADO y registra fecha de confirmación)
        """
        try:
            pago = PagoRepository.get_by_id(pago_id)
            if not pago:
                return {"error": "Pago no encontrado"}, 404

            if pago.estado == 'CONFIRMADO':
                return {"error": "El pago ya está confirmado"}, 400

            update_data = {
                'estado': 'CONFIRMADO',
                'fecha_confirmacion_director': datetime.now(),
                'fecha_pago': datetime.now()
            }

            if confirmado_por:
                update_data['confirmado_por'] = confirmado_por

            pago = PagoRepository.update(pago_id, update_data)
            
            # Actualizar automáticamente el estado_pago de la inscripción
            from src.services.inscripcion_service import InscripcionService
            InscripcionService.actualizar_estado_pago_inscripcion(pago.Inscripcion_id_inscripcion)
            
            db.session.commit()

            return {
                "message": "Pago confirmado exitosamente",
                "pago": pago.to_dict()
            }, 200

        except Exception as e:
            db.session.rollback()
            return {"error": f"Error al confirmar pago: {str(e)}"}, 500

    @staticmethod
    def cancel_pago(pago_id):
        """
        Cancela un pago (borrado lógico)
        """
        try:
            pago = PagoRepository.delete(pago_id)
            if not pago:
                return {"error": "Pago no encontrado"}, 404

            db.session.commit()
            return {"message": "Pago cancelado exitosamente"}, 200

        except Exception as e:
            db.session.rollback()
            return {"error": f"Error al cancelar pago: {str(e)}"}, 500

    @staticmethod
    def get_pagos_pendientes():
        """
        Obtiene pagos pendientes
        """
        try:
            pagos = PagoRepository.get_pagos_pendientes()
            return [pago.to_dict() for pago in pagos], 200
        except Exception as e:
            return {"error": f"Error al obtener pagos pendientes: {str(e)}"}, 500

    @staticmethod
    def get_pagos_vencidos():
        """
        Obtiene pagos vencidos
        """
        try:
            pagos = PagoRepository.get_pagos_vencidos()
            return [pago.to_dict() for pago in pagos], 200
        except Exception as e:
            return {"error": f"Error al obtener pagos vencidos: {str(e)}"}, 500

    @staticmethod
    def generate_cuotas_inscripcion(inscripcion_id, numero_cuotas, metodo_pago_id, confirmado_por):
        """
        Genera automáticamente las cuotas de pago para una inscripción
        """
        try:
            # Validar inscripción
            inscripcion = InscripcionRepository.get_by_id(inscripcion_id)
            if not inscripcion:
                return {"error": "Inscripción no encontrada"}, 404

            # Calcular monto por cuota
            monto_total = float(inscripcion.precio_final)
            monto_por_cuota = monto_total / numero_cuotas

            # Fecha base para vencimientos: fecha_inscripcion + 30 días para la primera cuota
            fecha_inscripcion = inscripcion.fecha_inscripcion
            fecha_base_vencimiento = fecha_inscripcion + timedelta(days=30)

            cuotas_creadas = []
            for i in range(1, numero_cuotas + 1):
                # Fecha de vencimiento: cada cuota vence 30 días después de la anterior
                fecha_vencimiento = fecha_base_vencimiento + timedelta(days=(i-1) * 30)

                pago_data = {
                    'Inscripcion_id_inscripcion': inscripcion_id,
                    'Metodo_pago_id_metodo_pago': metodo_pago_id,
                    'numero_cuota': i,
                    'monto': monto_por_cuota,
                    'fecha_vencimiento': fecha_vencimiento,
                    'confirmado_por': confirmado_por,
                    'estado': 'PENDIENTE'
                }

                pago = PagoRepository.create(pago_data)
                cuotas_creadas.append(pago.to_dict())

            # Actualizar inscripción para indicar que tiene pago a cuotas
            InscripcionRepository.update(inscripcion_id, {'pago_a_cuotas': True})

            db.session.commit()

            return {
                "message": f"Se generaron {numero_cuotas} cuotas exitosamente",
                "cuotas": cuotas_creadas,
                "monto_por_cuota": monto_por_cuota,
                "monto_total": monto_total
            }, 201

        except Exception as e:
            db.session.rollback()
            return {"error": f"Error al generar cuotas: {str(e)}"}, 500

    @staticmethod
    def get_inscripciones_activas_con_pagos():
        """
        Obtiene todas las inscripciones activas con información detallada:
        - Datos de la inscripción
        - Información del paquete
        - Información de la oferta
        - Información del ciclo
        - Información de la subcategoría
        - Información de la categoría
        - Información del programa
        - Lista de todos los pagos asociados
        """
        try:
            from src.models.inscripcion import Inscripcion
            from src.models.paquete import Paquete
            from src.models.oferta import Oferta
            from src.models.ciclo import Ciclo
            from src.models.subcategoria import Subcategoria
            from src.models.categoria import Categoria
            from src.models.programa import Programa
            from src.models.pago import Pago
            from src.models.persona import Persona
            
            # Obtener todas las inscripciones activas
            inscripciones = Inscripcion.query.filter_by(estado='ACTIVO').all()
            
            resultado = []
            
            for inscripcion in inscripciones:
                # Obtener paquete
                paquete = Paquete.query.get(inscripcion.Paquete_id_paquete)
                if not paquete:
                    continue
                
                # Obtener oferta
                oferta = Oferta.query.get(paquete.Oferta_id_oferta)
                if not oferta:
                    continue
                
                # Obtener ciclo
                ciclo = Ciclo.query.get(oferta.ciclo_id_ciclo)
                
                # Obtener subcategoría
                subcategoria = Subcategoria.query.get(oferta.Subcategoria_id_subcategoria)
                
                # Obtener categoría
                categoria = None
                if subcategoria:
                    categoria = Categoria.query.get(subcategoria.Categoria_id_categoria)
                
                # Obtener programa
                programa = None
                if categoria:
                    programa = Programa.query.get(categoria.Programa_id_programa)
                
                # Obtener persona
                persona = Persona.query.get(inscripcion.Persona_id_persona)
                
                # Obtener todos los pagos de esta inscripción
                pagos = Pago.query.filter_by(Inscripcion_id_inscripcion=inscripcion.id_inscripcion).order_by(Pago.numero_cuota).all()
                
                # Construir objeto de respuesta
                inscripcion_detalle = {
                    "inscripcion": {
                        "id_inscripcion": inscripcion.id_inscripcion,
                        "fecha_inscripcion": inscripcion.fecha_inscripcion.isoformat() if inscripcion.fecha_inscripcion else None,
                        "fecha_inicio": inscripcion.fecha_inicio.isoformat() if inscripcion.fecha_inicio else None,
                        "fecha_fin": inscripcion.fecha_fin.isoformat() if inscripcion.fecha_fin else None,
                        "precio_original": float(inscripcion.precio_original) if inscripcion.precio_original else None,
                        "descuento_aplicado": float(inscripcion.descuento_aplicado) if inscripcion.descuento_aplicado else None,
                        "precio_final": float(inscripcion.precio_final) if inscripcion.precio_final else None,
                        "estado_pago": inscripcion.estado_pago,
                        "clases_usadas": inscripcion.clases_usadas,
                        "clases_restantes": inscripcion.clases_restantes,
                        "pago_a_cuotas": inscripcion.pago_a_cuotas,
                        "estado": inscripcion.estado
                    },
                    "persona": {
                        "id_persona": persona.id_persona,
                        "nombre": persona.nombre,
                        "apellido": persona.apellido,
                        "email": persona.email,
                        "celular": persona.celular,
                        "tipo_cuenta": persona.tipo_cuenta
                    } if persona else None,
                    "paquete": {
                        "id_paquete": paquete.id_paquete,
                        "nombre": paquete.nombre,
                        "cantidad_clases": paquete.cantidad_clases,
                        "dias_validez": paquete.dias_validez,
                        "precio": float(paquete.precio) if paquete.precio else None,
                        "ilimitado": paquete.ilimitado,
                        "estado": paquete.estado
                    },
                    "oferta": {
                        "id_oferta": oferta.id_oferta,
                        "nombre_oferta": oferta.nombre_oferta,
                        "fecha_inicio": oferta.fecha_inicio.isoformat() if oferta.fecha_inicio else None,
                        "fecha_fin": oferta.fecha_fin.isoformat() if oferta.fecha_fin else None,
                        "descripcion": oferta.descripcion,
                        "cantidad_cursos": oferta.cantidad_cursos,
                        "publico_objetivo": oferta.publico_objetivo,
                        "estado": oferta.estado
                    },
                    "ciclo": {
                        "id_ciclo": ciclo.id_ciclo,
                        "nombre": ciclo.nombre,
                        "inicio": ciclo.inicio.isoformat() if ciclo.inicio else None,
                        "fin": ciclo.fin.isoformat() if ciclo.fin else None,
                        "estado": ciclo.estado
                    } if ciclo else None,
                    "subcategoria": {
                        "id_subcategoria": subcategoria.id_subcategoria,
                        "nombre_subcategoria": subcategoria.nombre_subcategoria,
                        "descripcion_subcategoria": subcategoria.descripcion_subcategoria,
                        "estado": subcategoria.estado
                    } if subcategoria else None,
                    "categoria": {
                        "id_categoria": categoria.id_categoria,
                        "nombre_categoria": categoria.nombre_categoria,
                        "descripcion_categoria": categoria.descripcion_categoria,
                        "estado": categoria.estado
                    } if categoria else None,
                    "programa": {
                        "id_programa": programa.id_programa,
                        "nombre_programa": programa.nombre_programa,
                        "descricpcion_programa": programa.descricpcion_programa,
                        "estado": programa.estado
                    } if programa else None,
                    "pagos": [pago.to_dict() for pago in pagos]
                }
                
                resultado.append(inscripcion_detalle)
            
            return {
                "total_inscripciones_activas": len(resultado),
                "inscripciones": resultado
            }, 200
            
        except Exception as e:
            return {"error": f"Error al obtener inscripciones activas con pagos: {str(e)}"}, 500