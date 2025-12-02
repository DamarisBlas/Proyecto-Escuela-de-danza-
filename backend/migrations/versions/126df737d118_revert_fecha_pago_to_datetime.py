"""revert fecha_pago to datetime

Revision ID: 126df737d118
Revises: ae67f9ae1df2
Create Date: 2025-12-01 00:38:16.341627

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '126df737d118'
down_revision = 'ae67f9ae1df2'
branch_labels = None
depends_on = None


def upgrade():
    # Cambiar fecha_pago de DATE a TIMESTAMP (DateTime)
    with op.batch_alter_table('Pago', schema=None) as batch_op:
        batch_op.alter_column('fecha_pago',
                              existing_type=sa.DATE(),
                              type_=sa.TIMESTAMP(),
                              existing_nullable=True)


def downgrade():
    # Revertir fecha_pago de TIMESTAMP a DATE
    with op.batch_alter_table('Pago', schema=None) as batch_op:
        batch_op.alter_column('fecha_pago',
                              existing_type=sa.TIMESTAMP(),
                              type_=sa.DATE(),
                              existing_nullable=True)
