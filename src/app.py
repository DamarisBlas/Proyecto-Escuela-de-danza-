from flask import Flask
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
import os
from .config import Config

db = SQLAlchemy()
migrate = Migrate()

def create_app():
    app = Flask(__name__)

    # Load configuration from the Config class in src/config.py
    app.config.from_object(Config)
    app.url_map.strict_slashes = False

    CORS(app, origins=[ "Access-Control-Allow-Origin","http://localhost:5173","http://localhost:5174","http://localhost:5175", "https://proyecto-escuela-de-danza.vercel.app/"],
         methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
         allow_headers=["Content-Type", "Authorization"],
         supports_credentials=True)
    
    @app.before_request
    def handle_preflight():
        from flask import request
        if request.method == "OPTIONS":
            from flask import make_response
            response = make_response()
            response.headers.add("Access-Control-Allow-Origin", "http://localhost:5173")
            response.headers.add("Access-Control-Allow-Headers", "Content-Type,Authorization")
            response.headers.add("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS")
            response.headers.add("Access-Control-Allow-Credentials", "true")
            return response



    db.init_app(app)
    migrate.init_app(app, db)
    
    # Import models so Flask-Migrate can detect them
    from . import models
    
     # CREAR TABLAS EN LA BD REMOTA (bloque temporal)
    with app.app_context():
        db.create_all()
    
    # Register routes
    from .routes import register_routes
    register_routes(app)
    
    return app