"""Change Director estado from String to Boolean

Revision ID: efd867493027
Revises: 50c3812a4232
Create Date: 2025-09-22 15:04:26.487006

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'efd867493027'
down_revision = '50c3812a4232'
branch_labels = None
depends_on = None


def upgrade():
    # Convertir campo estado de INTEGER a BOOLEAN usando USING clause
    op.execute("ALTER TABLE \"Director\" ALTER COLUMN estado TYPE BOOLEAN USING CASE WHEN estado = 1 THEN TRUE ELSE FALSE END")


def downgrade():
    # Convertir de vuelta a INTEGER
    op.execute("ALTER TABLE \"Director\" ALTER COLUMN estado TYPE INTEGER USING CASE WHEN estado = TRUE THEN 1 ELSE 0 END")
