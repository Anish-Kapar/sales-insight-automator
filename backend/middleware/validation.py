import os
from fastapi import Header, HTTPException
from typing import Optional

API_KEY = os.getenv("API_KEY", "")


async def validate_api_key(x_api_key: Optional[str] = Header(None)):
    """
    Optional API key guard. If API_KEY is set in env, all requests must
    include the matching X-API-Key header.
    """
    if not API_KEY:
        # No key configured — open access (dev mode)
        return

    if x_api_key is None:
        raise HTTPException(
            status_code=401,
            detail="Missing X-API-Key header.",
        )

    if x_api_key != API_KEY:
        raise HTTPException(
            status_code=403,
            detail="Invalid API key.",
        )
