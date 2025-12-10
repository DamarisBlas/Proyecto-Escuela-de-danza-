from src.routes.user_routes import user_bp
from src.routes.auth_routes import auth_bp
from src.routes.director_routes import director_bp
from src.routes.ciclo_routes import ciclo_bp
from src.routes.programa_routes import programa_bp
from src.routes.categoria_routes import categoria_bp
from src.routes.subcategoria_routes import subcategoria_bp
from src.routes.sala_routes import sala_bp
from src.routes.estilo_routes import estilo_bp
from src.routes.oferta_routes import oferta_bp
from src.routes.horario_routes import horario_bp
from src.routes.paquete_routes import paquete_bp
from src.routes.profesor_routes import profesor_bp
from src.routes.sesion_routes import sesion_bp
from src.routes.inscripcion_routes import inscripcion_bp
from src.routes.asistencia_routes import asistencia_bp
from src.routes.pago_routes import pago_bp
from src.routes.promocion_routes import promocion_bp
from src.routes.metodo_pago_routes import metodo_pago_bp
from src.routes.notificacion_routes import notificacion_bp
from src.routes.notificacion_persona_routes import notificacion_persona_bp
from src.routes.permiso_routes import permiso_bp
from src.routes.dashboard_routes import dashboard_bp
from src.routes.ml_routes import ml_bp
from src.routes.stripe_routes import stripe_bp
from src.routes.sorteo_routes import sorteo_bp
from src.routes.ganador_routes import ganador_bp

def register_routes(app):
    app.register_blueprint(user_bp, url_prefix='/users')
    app.register_blueprint(auth_bp, url_prefix='/auth')
    app.register_blueprint(director_bp, url_prefix='/director')
    app.register_blueprint(ciclo_bp, url_prefix='/ciclos')
    app.register_blueprint(programa_bp, url_prefix='/programas')
    app.register_blueprint(categoria_bp, url_prefix='/categorias')
    app.register_blueprint(subcategoria_bp, url_prefix='/subcategorias')
    app.register_blueprint(sala_bp, url_prefix='/salas')
    app.register_blueprint(estilo_bp, url_prefix='/estilos')
    app.register_blueprint(oferta_bp, url_prefix='/ofertas')
    app.register_blueprint(horario_bp, url_prefix='/horarios')
    app.register_blueprint(paquete_bp, url_prefix='/paquetes')
    app.register_blueprint(profesor_bp, url_prefix='/profesores')
    app.register_blueprint(sesion_bp, url_prefix='/sesiones')
    app.register_blueprint(inscripcion_bp, url_prefix='/inscripciones')
    app.register_blueprint(asistencia_bp, url_prefix='/asistencias')
    app.register_blueprint(pago_bp, url_prefix='/pagos')
    app.register_blueprint(promocion_bp, url_prefix='/promociones')
    app.register_blueprint(metodo_pago_bp, url_prefix='/metodos-pago')
    app.register_blueprint(notificacion_bp, url_prefix='/notificaciones')
    app.register_blueprint(notificacion_persona_bp, url_prefix='/notificaciones-personas')
    app.register_blueprint(permiso_bp, url_prefix='/permisos')
    app.register_blueprint(dashboard_bp, url_prefix='/dashboard')
    app.register_blueprint(ml_bp, url_prefix='/ml')
    app.register_blueprint(stripe_bp, url_prefix='/stripe')
    app.register_blueprint(sorteo_bp)
    app.register_blueprint(ganador_bp)