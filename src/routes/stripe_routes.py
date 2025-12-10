import os
import stripe
from flask import Blueprint, request, jsonify
from dotenv import load_dotenv
from src.models.pago import Pago
from src.models.inscripcion import Inscripcion
from src.app import db
from datetime import datetime

# Cargar variables de entorno
load_dotenv()

# Configurar Stripe
stripe.api_key = os.getenv("STRIPE_SECRET_KEY")

stripe_bp = Blueprint('stripe', __name__)

@stripe_bp.route('/create-payment-intent', methods=['POST'])
def create_payment_intent():
    """
    Crea un PaymentIntent para pagos con tarjeta o QR
    
    Body esperado:
    {
        "amount": 5000,  # en centavos (5000 = 50.00 USD)
        "currency": "usd",
        "payment_method_type": "card",  # o "cashapp", "wechat_pay", etc.
        "inscripcion_id": 123,  # opcional: para vincular con tu inscripción
        "metodo_pago_id": 1,  # opcional: ID del método de pago en tu sistema
        "numero_cuota": 1  # opcional: número de cuota
    }
    """
    try:
        data = request.get_json()
        
        # Validar datos requeridos
        if not data or 'amount' not in data:
            return jsonify({"error": "El campo 'amount' es requerido"}), 400
        
        amount = data.get('amount')
        currency = data.get('currency', 'usd')
        payment_method_type = data.get('payment_method_type', 'card')
        
        # Crear PaymentIntent según el tipo de pago
        if payment_method_type == 'card':
            # Pago con tarjeta (métodos automáticos)
            intent = stripe.PaymentIntent.create(
                amount=amount,
                currency=currency,
                automatic_payment_methods={"enabled": True},
                metadata={
                    "integration": "escuela_danza",
                    "inscripcion_id": data.get('inscripcion_id', ''),
                    "numero_cuota": data.get('numero_cuota', '')
                }
            )
        else:
            # Pago con QR u otros métodos específicos (cashapp, wechat_pay, pix, etc.)
            intent = stripe.PaymentIntent.create(
                amount=amount,
                currency=currency,
                payment_method_types=[payment_method_type],
                metadata={
                    "integration": "escuela_danza",
                    "inscripcion_id": data.get('inscripcion_id', ''),
                    "numero_cuota": data.get('numero_cuota', '')
                }
            )
        
        # Guardar en la base de datos (estado pendiente)
        if data.get('inscripcion_id') and data.get('metodo_pago_id'):
            nuevo_pago = Pago(
                Inscripcion_id_inscripcion=data.get('inscripcion_id'),
                Metodo_pago_id_metodo_pago=data.get('metodo_pago_id'),
                numero_cuota=data.get('numero_cuota', 1),
                monto=amount / 100,  # Convertir de centavos a dólares
                payment_intent_id=intent.id,
                fecha_vencimiento=datetime.now().date(),
                confirmado_por=0,  # Sistema (Stripe)
                estado='PROCESANDO'  # Estado inicial cuando se crea el PaymentIntent
            )
            db.session.add(nuevo_pago)
            db.session.commit()
        
        return jsonify({
            "clientSecret": intent.client_secret,
            "paymentIntentId": intent.id
        }), 200
        
    except stripe.error.StripeError as e:
        return jsonify({"error": f"Error de Stripe: {e.user_message}"}), 400
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": f"Error interno del servidor: {str(e)}"}), 500


@stripe_bp.route('/payment-status/<payment_intent_id>', methods=['GET'])
def get_payment_status(payment_intent_id):
    """
    Obtiene el estado de un pago
    """
    try:
        intent = stripe.PaymentIntent.retrieve(payment_intent_id)
        
        return jsonify({
            "status": intent.status,
            "amount": intent.amount,
            "currency": intent.currency,
            "created": intent.created
        }), 200
        
    except stripe.error.StripeError as e:
        return jsonify({"error": f"Error de Stripe: {e.user_message}"}), 400
    except Exception as e:
        return jsonify({"error": f"Error interno del servidor: {str(e)}"}), 500


@stripe_bp.route('/confirm-payment/<payment_intent_id>', methods=['POST'])
def confirm_payment_manual(payment_intent_id):
    """
    Endpoint manual para confirmar un pago (solo para desarrollo/testing)
    Simula lo que haría el webhook de Stripe
    """
    try:
        # Verificar el estado real del pago en Stripe
        intent = stripe.PaymentIntent.retrieve(payment_intent_id)
        
        # Buscar el pago en la base de datos
        pago = Pago.query.filter_by(payment_intent_id=payment_intent_id).first()
        
        if not pago:
            return jsonify({"error": "Pago no encontrado en la base de datos"}), 404
        
        # Actualizar según el estado real de Stripe
        if intent.status == 'succeeded':
            pago.estado = 'CONFIRMADO'
            pago.fecha_pago = datetime.now()
            
            # Actualizar estado de la inscripción
            inscripcion = Inscripcion.query.get(pago.Inscripcion_id_inscripcion)
            if inscripcion:
                # Verificar si todas las cuotas están pagadas
                todos_pagos = Pago.query.filter_by(
                    Inscripcion_id_inscripcion=inscripcion.id_inscripcion
                ).all()
                
                pagos_confirmados = sum(1 for p in todos_pagos if p.estado == 'CONFIRMADO')
                total_cuotas = len(todos_pagos)
                
                if pagos_confirmados == total_cuotas:
                    inscripcion.estado_pago = 'PAGADO'
                elif pagos_confirmados > 0:
                    inscripcion.estado_pago = 'PAGO_PARCIAL'
            
            db.session.commit()
            
            return jsonify({
                "message": "Pago confirmado exitosamente",
                "pago": pago.to_dict(),
                "stripe_status": intent.status
            }), 200
            
        elif intent.status in ['requires_payment_method', 'requires_confirmation', 'requires_action']:
            return jsonify({
                "message": "El pago aún no está completo en Stripe",
                "stripe_status": intent.status,
                "pago_estado": pago.estado
            }), 200
            
        else:
            pago.estado = 'FALLIDO'
            db.session.commit()
            
            return jsonify({
                "message": "El pago falló",
                "pago": pago.to_dict(),
                "stripe_status": intent.status
            }), 200
        
    except stripe.error.StripeError as e:
        return jsonify({"error": f"Error de Stripe: {e.user_message}"}), 400
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": f"Error interno del servidor: {str(e)}"}), 500


@stripe_bp.route('/webhook', methods=['POST'])
def stripe_webhook():
    """
    Webhook para recibir eventos de Stripe
    (confirmar pagos, actualizaciones, etc.)
    """
    payload = request.get_data()
    sig_header = request.headers.get('Stripe-Signature')
    webhook_secret = os.getenv('STRIPE_WEBHOOK_SECRET')  # Configúralo en Stripe Dashboard
    
    try:
        if webhook_secret:
            event = stripe.Webhook.construct_event(
                payload, sig_header, webhook_secret
            )
        else:
            event = stripe.Event.construct_from(
                request.get_json(), stripe.api_key
            )
        
        # Manejar diferentes tipos de eventos
        if event['type'] == 'payment_intent.succeeded':
            payment_intent = event['data']['object']
            
            # Actualizar el estado del pago en la base de datos
            pago = Pago.query.filter_by(payment_intent_id=payment_intent['id']).first()
            if pago:
                pago.estado = 'CONFIRMADO'
                pago.fecha_pago = datetime.now()
                
                # Actualizar estado de la inscripción
                inscripcion = Inscripcion.query.get(pago.Inscripcion_id_inscripcion)
                if inscripcion:
                    # Verificar si todas las cuotas están pagadas
                    todos_pagos = Pago.query.filter_by(
                        Inscripcion_id_inscripcion=inscripcion.id_inscripcion
                    ).all()
                    
                    pagos_confirmados = sum(1 for p in todos_pagos if p.estado == 'CONFIRMADO')
                    total_cuotas = len(todos_pagos)
                    
                    if pagos_confirmados == total_cuotas:
                        inscripcion.estado_pago = 'PAGADO'
                    elif pagos_confirmados > 0:
                        inscripcion.estado_pago = 'PAGO_PARCIAL'
                
                db.session.commit()
                print(f"Pago confirmado exitosamente: {payment_intent['id']}")
            
        elif event['type'] == 'payment_intent.payment_failed':
            payment_intent = event['data']['object']
            
            # Actualizar el estado del pago en la base de datos
            pago = Pago.query.filter_by(payment_intent_id=payment_intent['id']).first()
            if pago:
                pago.estado = 'FALLIDO'
                
                # Actualizar estado de la inscripción
                inscripcion = Inscripcion.query.get(pago.Inscripcion_id_inscripcion)
                if inscripcion:
                    inscripcion.estado_pago = 'PENDIENTE'  # Volver a pendiente
                
                db.session.commit()
                print(f"Pago fallido actualizado: {payment_intent['id']}")
        
        return jsonify({"status": "success"}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 400
