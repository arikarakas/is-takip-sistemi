"""add_project_assignments_table

Revision ID: 81d8d291c4bd
Revises: b0c1d2e3f4a5
Create Date: 2026-07-09 10:24:20.333433

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '81d8d291c4bd'
down_revision: Union[str, Sequence[str], None] = 'b0c1d2e3f4a5'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.create_table('project_assignments',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('project_id', sa.Integer(), nullable=False),
    sa.Column('assigned_user_id', sa.Integer(), nullable=True),
    sa.Column('assigned_custom_name', sa.String(), nullable=True),
    sa.ForeignKeyConstraint(['assigned_user_id'], ['users.id'], ondelete='SET NULL'),
    sa.ForeignKeyConstraint(['project_id'], ['projects.id'], ondelete='CASCADE'),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_project_assignments_id'), 'project_assignments', ['id'], unique=False)
    op.drop_index(op.f('ix_project_changes_id'), table_name='project_changes')


def downgrade() -> None:
    """Downgrade schema."""
    op.create_index(op.f('ix_project_changes_id'), 'project_changes', ['id'], unique=False)
    op.drop_index(op.f('ix_project_assignments_id'), table_name='project_assignments')
    op.drop_table('project_assignments')
