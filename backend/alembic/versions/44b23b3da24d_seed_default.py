"""seed default

Revision ID: 44b23b3da24d
Revises: 1369fcbae141
Create Date: 2025-02-03 22:53:15.565585

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '44b23b3da24d'
down_revision: Union[str, None] = '1369fcbae141'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Use a SQL command to insert a whiteboard record with id 1 if it doesn't exist.
    op.execute(
        """
        INSERT INTO whiteboards (id, name)
        VALUES (1, 'Default Whiteboard')
        ON CONFLICT (id) DO NOTHING;
        """
    )

def downgrade():
    op.execute("DELETE FROM whiteboards WHERE id = 1;")
