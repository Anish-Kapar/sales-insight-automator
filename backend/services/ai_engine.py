import os
from dotenv import load_dotenv
load_dotenv()

import httpx
import logging

logger = logging.getLogger(__name__)

GROQ_API_KEY = os.getenv("GROQ_API_KEY", "")
GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions"
GROQ_MODEL = "llama-3.3-70b-versatile"

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent"

SYSTEM_PROMPT = """You are a senior business analyst. You will receive raw sales data in CSV format.
Generate a professional executive summary (3-5 paragraphs) covering:
1. Overall performance overview (total revenue, units sold)
2. Top performing products/categories and regions
3. Notable trends or anomalies
4. Actionable recommendations

Write in clean prose paragraphs suitable for an email. No markdown headers or bullet points."""


async def generate_summary(data_text: str) -> str:
    if GROQ_API_KEY and GROQ_API_KEY.strip():
        try:
            logger.info("Trying Groq...")
            return await _groq_summary(data_text)
        except Exception as e:
            logger.warning(f"Groq failed: {e}")

    if GEMINI_API_KEY and GEMINI_API_KEY.strip():
        try:
            logger.info("Trying Gemini...")
            return await _gemini_summary(data_text)
        except Exception as e:
            logger.error(f"Gemini failed: {e}")
            raise RuntimeError(f"Gemini error: {str(e)}")

    raise RuntimeError("No AI API key configured. Set GROQ_API_KEY or GEMINI_API_KEY.")


async def _groq_summary(data_text: str) -> str:
    truncated = data_text[:3000]
    headers = {
        "Authorization": f"Bearer {GROQ_API_KEY.strip()}",
        "Content-Type": "application/json",
    }
    payload = {
        "model": GROQ_MODEL,
        "messages": [
            {
                "role": "user",
                "content": f"{SYSTEM_PROMPT}\n\nHere is the sales data:\n\n{truncated}"
            }
        ],
        "max_tokens": 800,
        "temperature": 0.4,
    }
    async with httpx.AsyncClient(timeout=60) as client:
        resp = await client.post(GROQ_API_URL, headers=headers, json=payload)
        logger.info(f"Groq response status: {resp.status_code}")
        if resp.status_code != 200:
            logger.error(f"Groq error body: {resp.text}")
        resp.raise_for_status()
        data = resp.json()
        return data["choices"][0]["message"]["content"].strip()


async def _gemini_summary(data_text: str) -> str:
    truncated = data_text[:3000]
    url = f"{GEMINI_API_URL}?key={GEMINI_API_KEY.strip()}"
    payload = {
        "contents": [
            {
                "role": "user",
                "parts": [{"text": f"{SYSTEM_PROMPT}\n\nHere is the sales data:\n\n{truncated}"}]
            }
        ],
        "generationConfig": {
            "maxOutputTokens": 800,
            "temperature": 0.4
        }
    }
    async with httpx.AsyncClient(timeout=60) as client:
        resp = await client.post(url, json=payload)
        logger.info(f"Gemini response status: {resp.status_code}")
        if resp.status_code != 200:
            logger.error(f"Gemini error body: {resp.text}")
        resp.raise_for_status()
        data = resp.json()
        return data["candidates"][0]["content"]["parts"][0]["text"].strip()