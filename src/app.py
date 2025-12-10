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
    
    
    CORS(app, 
         origins=[
             "http://localhost:5173", 
             "http://localhost:3000",
             "http://localhost:5174",
             "http://localhost:5175", 
             "https://proyecto-escuela-de-danza.vercel.app",
             "https://proyecto-escuela-de-danza-16kygqk99.vercel.app",
             "https://proyecto-escuela-de-danza-7ld1uxma0.vercel.app"
         ],
         methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
         allow_headers=["Content-Type", "Authorization"],
         supports_credentials=True)
  






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