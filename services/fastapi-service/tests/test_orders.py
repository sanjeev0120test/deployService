import pytest
import pytest_asyncio
from httpx import ASGITransport, AsyncClient

from app.main import app


@pytest_asyncio.fixture
async def client():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac


@pytest.mark.asyncio
async def test_health(client: AsyncClient):
    resp = await client.get("/health")
    assert resp.status_code == 200
    assert resp.json()["status"] == "ok"


@pytest.mark.asyncio
async def test_ready(client: AsyncClient):
    resp = await client.get("/ready")
    assert resp.status_code in (200, 503)


@pytest.mark.asyncio
async def test_list_orders(client: AsyncClient):
    resp = await client.get("/api/orders")
    assert resp.status_code == 200
    data = resp.json()
    assert data["total"] >= 2


@pytest.mark.asyncio
async def test_get_order(client: AsyncClient):
    resp = await client.get("/api/orders/1")
    assert resp.status_code == 200
    assert resp.json()["data"]["id"] == "1"


@pytest.mark.asyncio
async def test_get_order_not_found(client: AsyncClient):
    resp = await client.get("/api/orders/999")
    assert resp.status_code == 404


@pytest.mark.asyncio
async def test_create_order(client: AsyncClient):
    resp = await client.post(
        "/api/orders",
        json={"customer": "Charlie", "item": "Gadget X", "quantity": 3},
    )
    assert resp.status_code == 201
    assert resp.json()["data"]["customer"] == "Charlie"


@pytest.mark.asyncio
async def test_create_order_missing_customer(client: AsyncClient):
    resp = await client.post(
        "/api/orders",
        json={"customer": "", "item": "Gadget X"},
    )
    assert resp.status_code == 400
