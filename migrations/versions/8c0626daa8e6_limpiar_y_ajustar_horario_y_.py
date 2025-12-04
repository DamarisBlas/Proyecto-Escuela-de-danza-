"""Limpiar y ajustar Horario y HorarioSesion

Revision ID: 8c0626daa8e6
Revises: af8c0182fa54
Create Date: 2025-10-14 12:24:06.445863

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '8c0626daa8e6'
down_revision = 'af8c0182fa54'
branch_labels = None
depends_on = None


def upgrade():
    # === HORARIO ===
    # Eliminar columnas que NO están en el modelo
    with op.batch_alter_table('Horario', schema=None) as batch_op:
        batch_op.drop_column('tipo')
        batch_op.drop_column('activo_desde')
        batch_op.drop_column('activo_hasta')
        batch_op.drop_column('precio')
        
        # Agregar columnas del modelo
        batch_op.add_column(sa.Column('dias', sa.String(length=20), nullable=False, server_default=''))
        batch_op.add_column(sa.Column('hora_inicio', sa.Time(), nullable=False, server_default='00:00'))
        batch_op.add_column(sa.Column('hora_fin', sa.Time(), nullable=False, server_default='00:00'))
    
    # === HORARIOSESION ===
    # Eliminar columna que NO está en el modelo
    with op.batch_alter_table('HorarioSesion', schema=None) as batch_op:
        batch_op.drop_column('es_recurrente')
        
        # Agregar columnas del modelo
        batch_op.add_column(sa.Column('motivo', sa.String(length=200), nullable=True))
        batch_op.add_column(sa.Column('cancelado', sa.Boolean(), nullable=False, server_default='false'))
    
    # Convertir fecha de VARCHAR a DATE
    op.execute('ALTER TABLE "HorarioSesion" ALTER COLUMN fecha TYPE DATE USING fecha::DATE')
    op.alter_column('HorarioSesion', 'fecha', nullable=False, existing_type=sa.Date())


def downgrade():
    # Revertir HorarioSesion
    op.alter_column('HorarioSesion', 'fecha', type_=sa.String(length=10), existing_type=sa.Date(), nullable=True)
    
    with op.batch_alter_table('HorarioSesion', schema=None) as batch_op:
        batch_op.drop_column('cancelado')
        batch_op.drop_column('motivo')
        batch_op.add_column(sa.Column('es_recurrente', sa.Boolean(), nullable=False, server_default='false'))
    
    # Revertir Horario
    with op.batch_alter_table('Horario', schema=None) as batch_op:
        batch_op.drop_column('hora_fin')
        batch_op.drop_column('hora_inicio')
        batch_op.drop_column('dias')
        
        batch_op.add_column(sa.Column('tipo', sa.String(length=50), nullable=True))
        batch_op.add_column(sa.Column('activo_desde', sa.String(length=10), nullable=True))
        batch_op.add_column(sa.Column('activo_hasta', sa.String(length=10), nullable=True))
        batch_op.add_column(sa.Column('precio', sa.Numeric(precision=10, scale=2), nullable=True))
