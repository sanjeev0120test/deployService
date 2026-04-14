from datetime import datetime, timezone

from fastapi import APIRouter

router = APIRouter()

_is_ready = False


def set_ready(ready: bool):
    global _is_ready
    _is_ready = ready


@router.get("/health")
async def health():
    return {"status": "ok", "timestamp": datetime.now(timezone.utc).isoformat()}


@router.get("/ready")
async def ready():
    if _is_ready:
        return {"status": "ready", "timestamp": datetime.now(timezone.utc).isoformat()}
    from fastapi.responses import JSONResponse

    return JSONResponse(
        status_code=503,
        content={"status": "not_ready", "timestamp": datetime.now(timezone.utc).isoformat()},
    )
