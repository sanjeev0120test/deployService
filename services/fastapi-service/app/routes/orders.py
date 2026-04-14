from datetime import datetime, timezone

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

router = APIRouter(prefix="/api")


class OrderCreate(BaseModel):
    customer: str
    item: str
    quantity: int = 1


class Order(BaseModel):
    id: str
    customer: str
    item: str
    quantity: int
    created_at: str


_orders: list[Order] = [
    Order(
        id="1",
        customer="Alice",
        item="Widget A",
        quantity=2,
        created_at="2025-01-01T00:00:00Z",
    ),
    Order(
        id="2",
        customer="Bob",
        item="Widget B",
        quantity=1,
        created_at="2025-01-02T00:00:00Z",
    ),
]
_next_id = 3


@router.get("/orders")
async def list_orders():
    return {"data": _orders, "total": len(_orders)}


@router.get("/orders/{order_id}")
async def get_order(order_id: str):
    order = next((o for o in _orders if o.id == order_id), None)
    if not order:
        raise HTTPException(status_code=404, detail=f"Order {order_id} not found")
    return {"data": order}


@router.post("/orders", status_code=201)
async def create_order(body: OrderCreate):
    global _next_id

    if not body.customer or not body.customer.strip():
        raise HTTPException(status_code=400, detail="customer is required")
    if not body.item or not body.item.strip():
        raise HTTPException(status_code=400, detail="item is required")
    if body.quantity < 1:
        raise HTTPException(status_code=400, detail="quantity must be >= 1")

    order = Order(
        id=str(_next_id),
        customer=body.customer.strip(),
        item=body.item.strip(),
        quantity=body.quantity,
        created_at=datetime.now(timezone.utc).isoformat(),
    )
    _next_id += 1
    _orders.append(order)
    return {"data": order}
