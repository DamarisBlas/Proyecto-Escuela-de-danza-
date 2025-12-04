"""add_cantidad_beneficiarios_inscritos_and_change_type

Revision ID: bd5f7e576c94
Revises: 126df737d118
Create Date: 2025-12-03 17:55:43.767466

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'bd5f7e576c94'
down_revision = '126df737d118'
branch_labels = None
depends_on = None


def upgrade():
    # Cambiar tipo de cantidad_beneficiarios de BigInteger a Integer
    op.alter_column('Promocion', 'cantidad_beneficiarios',
                    existing_type=sa.BigInteger(),
                    type_=sa.Integer(),
                    existing_nullable=True)
    
    # Agregar columna cantidad_beneficiarios_inscritos
    op.add_column('Promocion', sa.Column('cantidad_beneficiarios_inscritos', sa.Integer(), nullable=True, server_default='0'))


def downgrade():
    # Eliminar columna cantidad_beneficiarios_inscritos
    op.drop_column('Promocion', 'cantidad_beneficiarios_inscritos')
    
    # Revertir tipo de cantidad_beneficiarios a BigInteger
    op.alter_column('Promocion', 'cantidad_beneficiarios',
                    existing_type=sa.Integer(),
                    type_=sa.BigInteger(),
                    existing_nullable=True)
