from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_
from pydantic import BaseModel
from datetime import date
from typing import Optional
from app.database import get_db
from app.dependencies import get_current_user
from app.models.user import User
from app.models.task import Task
from app.models.neurons import NeuronsTransaction, ActionType
import uuid

NEURONS_TASK_COMPLETE = 5

router = APIRouter()


# ── Schemas ───────────────────────────────────────────────────────────────────

class TaskCreate(BaseModel):
    title: str
    subject: str = "عام"
    estimated_minutes: int = 25
    due_date: Optional[date] = None


class TaskUpdate(BaseModel):
    title: Optional[str] = None
    subject: Optional[str] = None
    estimated_minutes: Optional[int] = None
    due_date: Optional[date] = None
    completed: Optional[bool] = None


class TaskResponse(BaseModel):
    id: str
    title: str
    subject: str
    estimated_minutes: int
    due_date: Optional[date]
    completed: bool
    rolled_over: bool
    created_at: str


def _serialize(task: Task) -> TaskResponse:
    return TaskResponse(
        id=str(task.id),
        title=task.title,
        subject=task.subject,
        estimated_minutes=task.estimated_minutes,
        due_date=task.due_date,
        completed=task.completed,
        rolled_over=task.rolled_over,
        created_at=task.created_at.isoformat(),
    )


# ── Endpoints ─────────────────────────────────────────────────────────────────

@router.get("/")
async def list_tasks(
    task_date: Optional[date] = None,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Returns tasks. If task_date provided, filters to that date."""
    filters = [Task.user_id == user.id, Task.deleted_at.is_(None)]
    if task_date:
        filters.append(Task.due_date == task_date)

    result = await db.execute(
        select(Task).where(and_(*filters)).order_by(Task.created_at.desc())
    )
    tasks = result.scalars().all()
    return {"tasks": [_serialize(t) for t in tasks]}


@router.post("/")
async def create_task(
    body: TaskCreate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    task = Task(
        id=uuid.uuid4(),
        user_id=user.id,
        title=body.title,
        subject=body.subject,
        estimated_minutes=body.estimated_minutes,
        due_date=body.due_date,
    )
    db.add(task)
    await db.flush()
    return {"task": _serialize(task)}


@router.patch("/{task_id}")
async def update_task(
    task_id: str,
    body: TaskUpdate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Task).where(and_(Task.id == uuid.UUID(task_id), Task.user_id == user.id))
    )
    task = result.scalar_one_or_none()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    if body.title is not None:
        task.title = body.title
    if body.subject is not None:
        task.subject = body.subject
    if body.estimated_minutes is not None:
        task.estimated_minutes = body.estimated_minutes
    if body.due_date is not None:
        task.due_date = body.due_date
    if body.completed is not None:
        task.completed = body.completed

    await db.flush()
    return {"task": _serialize(task)}


@router.delete("/{task_id}")
async def delete_task(
    task_id: str,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    from datetime import datetime
    result = await db.execute(
        select(Task).where(and_(Task.id == uuid.UUID(task_id), Task.user_id == user.id))
    )
    task = result.scalar_one_or_none()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    task.deleted_at = datetime.utcnow()
    await db.flush()
    return {"status": "deleted"}


@router.post("/rollover")
async def rollover_tasks(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Rolls over all incomplete tasks from previous days to today.
    Called automatically at midnight or on app open.
    """
    today = date.today()
    result = await db.execute(
        select(Task).where(
            and_(
                Task.user_id == user.id,
                Task.completed == False,
                Task.due_date < today,
                Task.deleted_at.is_(None),
            )
        )
    )
    tasks = result.scalars().all()
    for task in tasks:
        task.due_date = today
        task.rolled_over = True

    await db.flush()
    return {"rolled_over_count": len(tasks)}


@router.post("/{task_id}/complete")
async def complete_task(
    task_id: str,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Task).where(and_(Task.id == uuid.UUID(task_id), Task.user_id == user.id))
    )
    task = result.scalar_one_or_none()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    if task.completed:
        return {"task": _serialize(task), "neurons_earned": 0}

    task.completed = True
    user.neurons_balance += NEURONS_TASK_COMPLETE
    db.add(NeuronsTransaction(
        id=uuid.uuid4(),
        user_id=user.id,
        amount=NEURONS_TASK_COMPLETE,
        action_type=ActionType.TASK_COMPLETE,
    ))
    await db.flush()
    return {"task": _serialize(task), "neurons_earned": NEURONS_TASK_COMPLETE}
