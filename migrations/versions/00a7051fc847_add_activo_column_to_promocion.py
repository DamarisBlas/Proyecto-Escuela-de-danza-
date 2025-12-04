"""add_activo_column_to_promocion

Revision ID: 00a7051fc847
Revises: 3a3b370c31d3
Create Date: 2025-11-17 19:15:26.863646

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '00a7051fc847'
down_revision = '3a3b370c31d3'
branch_labels = None
depends_on = None


def upgrade():
    op.add_column('Promocion', sa.Column('activo', sa.Boolean(), nullable=True, server_default='true'))


def downgrade():
    op.drop_column('Promocion', 'activo')
