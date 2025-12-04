"""Renombrar columna inscricpcion a inscripcion

Revision ID: ba0c486dd3dd
Revises: 460a56cb9507
Create Date: 2025-11-15 05:56:43.454032

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'ba0c486dd3dd'
down_revision = 'f84fe732fc1f'
branch_labels = None
depends_on = None


def upgrade():
    # Renombrar la columna
    op.alter_column('Permiso', 'inscricpcion_id_inscricpcion', new_column_name='inscripcion_id_inscripcion')


def downgrade():
    # Revertir el cambio
    op.alter_column('Permiso', 'inscripcion_id_inscripcion', new_column_name='inscricpcion_id_inscricpcion')
