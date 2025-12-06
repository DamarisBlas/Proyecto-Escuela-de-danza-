import os
db_url = os.getenv(
    'DATABASE_URL',
    'postgresql://postgres:root@localhost:5432/escuela0'
)
print(">>> DATABASE_URL en tiempo de ejecución:", db_url)


if db_url and db_url.startswith("postgres://"):
    db_url = db_url.replace("postgres://", "postgresql+psycopg2://", 1)


db_url = os.getenv(
    'DATABASE_URL',
    'postgresql://postgres:root@localhost:5432/escuela0'
)
print(">>> DATABASE_URL en tiempo de ejecución:", db_url)


if db_url and db_url.startswith("postgres://"):
    db_url = db_url.replace("postgres://", "postgresql+psycopg2://", 1)

class Config:
    SQLALCHEMY_DATABASE_URI = db_url
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SECRET_KEY = 'abcd'
    UPLOAD_FOLDER = os.path.join(os.getcwd(), 'uploads')
    
