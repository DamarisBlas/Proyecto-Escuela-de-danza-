"""Add numero_cuotas and montos_cuotas to Inscripcion

Revision ID: eeb64f3b8796
Revises: c84018049f11
Create Date: 2025-11-28 12:28:01.324943

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'eeb64f3b8796'
down_revision = 'c84018049f11'
branch_labels = None
depends_on = None


def upgrade():
    # Agregar columnas numero_cuotas y montos_cuotas a la tabla Inscripcion
    with op.batch_alter_table('Inscripcion', schema=None) as batch_op:
        batch_op.add_column(sa.Column('numero_cuotas', sa.Integer(), nullable=True))
        batch_op.add_column(sa.Column('montos_cuotas', sa.String(length=255), nullable=True))


def downgrade():
    # Remover columnas agregadas
    with op.batch_alter_table('Inscripcion', schema=None) as batch_op:
        batch_op.drop_column('montos_cuotas')
        batch_op.drop_column('numero_cuotas')
