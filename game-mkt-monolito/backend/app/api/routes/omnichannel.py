import json
import uuid
from typing import Any

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models import OmnichannelSession
from app.observability.logger import log_info
from app.services.omnichannel_runtime import broadcast, route_channel

router = APIRouter(prefix="/api/omnichannel", tags=["omnichannel"])


class SendRequest(BaseModel):
    channel: str
    recipient: str
    message: str
    session_id: str | None = None


class BroadcastRequest(BaseModel):
    channel: str
    recipients: list[str]
    message: str
    campaign: str | None = None


class RouterRequest(BaseModel):
    attempted_channels: list[str] = Field(default_factory=list)
    consents: dict[str, bool] = Field(default_factory=dict)
    metadata: dict[str, Any] = Field(default_factory=dict)


class EscalateRequest(BaseModel):
    session_id: str
    reason: str = "manual"
    target: str = "john"


class ConsentRequest(BaseModel):
    session_id: str | None = None
    consents: dict[str, bool]


# ── helpers ──────────────────────────────────────────────────────────────────

def _get_or_create_session(session_id: str, db: Session) -> OmnichannelSession:
    sess = db.query(OmnichannelSession).filter(OmnichannelSession.id == session_id).first()
    if not sess:
        sess = OmnichannelSession(id=session_id, messages=json.dumps([]), consents=json.dumps({}), status="active")
        db.add(sess)
        db.flush()
    return sess


def _serialize_session(sess: OmnichannelSession) -> dict:
    return {
        "session_id": sess.id,
        "messages": json.loads(sess.messages or "[]"),
        "consents": json.loads(sess.consents or "{}"),
        "status": sess.status,
        "last_channel": sess.last_channel,
        "escalated_to": sess.escalated_to,
        "escalation_reason": sess.escalation_reason,
    }


# ── routes ───────────────────────────────────────────────────────────────────

@router.post("/send")
async def send(payload: SendRequest, db: Session = Depends(get_db)):
    session_id = payload.session_id or str(uuid.uuid4())
    sess = _get_or_create_session(session_id, db)

    msgs = json.loads(sess.messages or "[]")
    msgs.append({"channel": payload.channel, "recipient": payload.recipient, "message": payload.message, "status": "queued"})
    sess.messages = json.dumps(msgs)
    sess.last_channel = payload.channel
    db.commit()
    log_info("Omnichannel send", session_id=session_id, channel=payload.channel)
    return {"session_id": session_id, "channel": payload.channel, "status": "queued", "message_index": len(msgs) - 1}


@router.post("/broadcast")
async def broadcast_message(payload: BroadcastRequest):
    return broadcast(payload.model_dump())


@router.post("/router")
async def route(payload: RouterRequest):
    return route_channel(payload.model_dump())


@router.post("/escalate")
async def escalate_session(payload: EscalateRequest, db: Session = Depends(get_db)):
    sess = db.query(OmnichannelSession).filter(OmnichannelSession.id == payload.session_id).first()
    if not sess:
        raise HTTPException(status_code=404, detail="Session not found")
    sess.status = "escalated"
    sess.escalated_to = payload.target
    sess.escalation_reason = payload.reason
    db.commit()
    return {"session_id": payload.session_id, "status": "escalated", "escalated_to": payload.target}


@router.get("/session/{session_id}")
async def session(session_id: str, db: Session = Depends(get_db)):
    sess = db.query(OmnichannelSession).filter(OmnichannelSession.id == session_id).first()
    if not sess:
        return {"session_id": session_id, "messages": [], "consents": {}, "status": "missing"}
    return _serialize_session(sess)


@router.post("/consent")
async def consent(payload: ConsentRequest, db: Session = Depends(get_db)):
    session_id = payload.session_id or str(uuid.uuid4())
    sess = _get_or_create_session(session_id, db)
    current = json.loads(sess.consents or "{}")
    current.update(payload.consents)
    sess.consents = json.dumps(current)
    db.commit()
    return {"session_id": session_id, "consents": current, "status": "updated"}
