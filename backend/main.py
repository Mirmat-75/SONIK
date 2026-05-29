"""
SONIK – Backend API (FastAPI)
Endpoints consumed by the React frontend.
"""

import os
import asyncio
import httpx
from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
from typing import Optional
from supabase import create_client, Client
from dotenv import load_dotenv
import google.generativeai as genai

load_dotenv()

# ── Clients ─────────────────────────────────────────────────────────────────
SUPABASE_URL: str = os.environ["SUPABASE_URL"]
SUPABASE_SERVICE_KEY: str = os.environ["SUPABASE_SERVICE_ROLE_KEY"]
TICKETMASTER_KEY: str = os.environ["TICKETMASTER_API_KEY"]
GEMINI_KEY: str = os.environ["GEMINI_API_KEY"] 
genai.configure(api_key=GEMINI_KEY)

supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)
gemini_model = genai.GenerativeModel("gemini-1.5-flash")

app = FastAPI(title="SONIK API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[os.getenv("FRONTEND_URL", "http://localhost:5173")],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

security = HTTPBearer()


# ── Auth helper ──────────────────────────────────────────────────────────────
def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Validate Supabase JWT and return user payload."""
    try:
        user = supabase.auth.get_user(credentials.credentials)
        return user.user
    except Exception:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")


# ── Schemas ──────────────────────────────────────────────────────────────────
class FavoriteRequest(BaseModel):
    event_id: str

class RecommendRequest(BaseModel):
    genres: list[str]
    city: Optional[str] = None


# ── 1. GET /events  ──────────────────────────────────────────────────────────
@app.get("/events")
async def get_events(
    keyword: Optional[str] = None,
    genre: Optional[str] = None,
    city: Optional[str] = None,
    date: Optional[str] = None,   # YYYY-MM-DD
    size: int = 20,
):
    """
    Proxy Ticketmaster Discovery API.
    API key lives server-side — never exposed to the browser.
    Implements timeout + retry (L2 pattern).
    """
    params = {
        "apikey": TICKETMASTER_KEY,
        "classificationName": "music",
        "size": size,
        "sort": "date,asc",
    }
    if keyword:
        params["keyword"] = keyword
    if genre:
        params["segmentName"] = genre
    if city:
        params["city"] = city
    if date:
        params["startDateTime"] = f"{date}T00:00:00Z"

    for attempt in range(3):          # retry logic (L2 pattern)
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                response = await client.get(
                    "https://app.ticketmaster.com/discovery/v2/events.json",
                    params=params,
                )
                response.raise_for_status()
                data = response.json()
                events = data.get("_embedded", {}).get("events", [])
                return {"events": _normalize_events(events)}
        except httpx.TimeoutException:
            if attempt == 2:
                raise HTTPException(status_code=504, detail="Ticketmaster timeout")
            await asyncio.sleep(1)
        except httpx.HTTPStatusError as e:
            raise HTTPException(status_code=e.response.status_code, detail="Ticketmaster error")


def _normalize_events(raw: list) -> list:
    """Flatten Ticketmaster response into a simple dict."""
    out = []
    for e in raw:
        venue = e.get("_embedded", {}).get("venues", [{}])[0]
        image = next((i["url"] for i in e.get("images", []) if i.get("ratio") == "16_9"), None)
        out.append({
            "id": e["id"],
            "title": e.get("name"),
            "artist": e.get("_embedded", {}).get("attractions", [{}])[0].get("name"),
            "date": e.get("dates", {}).get("start", {}).get("localDate"),
            "time": e.get("dates", {}).get("start", {}).get("localTime"),
            "location": venue.get("name"),
            "city": venue.get("city", {}).get("name"),
            "genre": e.get("classifications", [{}])[0].get("genre", {}).get("name"),
            "image_url": image,
            "description": e.get("info") or e.get("pleaseNote"),
            "url": e.get("url"),
        })
    return out


# ── 2. GET /events/{event_id} ────────────────────────────────────────────────
@app.get("/events/{event_id}")
async def get_event(event_id: str):
    """Fetch a single event detail from Ticketmaster."""
    async with httpx.AsyncClient(timeout=10.0) as client:
        r = await client.get(
            f"https://app.ticketmaster.com/discovery/v2/events/{event_id}.json",
            params={"apikey": TICKETMASTER_KEY},
        )
        if r.status_code == 404:
            raise HTTPException(status_code=404, detail="Event not found")
        r.raise_for_status()
        e = r.json()
    venue = e.get("_embedded", {}).get("venues", [{}])[0]
    image = next((i["url"] for i in e.get("images", []) if i.get("ratio") == "16_9"), None)
    return {
        "id": e["id"],
        "title": e.get("name"),
        "artist": e.get("_embedded", {}).get("attractions", [{}])[0].get("name"),
        "date": e.get("dates", {}).get("start", {}).get("localDate"),
        "time": e.get("dates", {}).get("start", {}).get("localTime"),
        "location": venue.get("name"),
        "city": venue.get("city", {}).get("name"),
        "genre": e.get("classifications", [{}])[0].get("genre", {}).get("name"),
        "image_url": image,
        "description": e.get("info") or e.get("pleaseNote"),
        "url": e.get("url"),
        "price_min": e.get("priceRanges", [{}])[0].get("min"),
        "price_max": e.get("priceRanges", [{}])[0].get("max"),
    }


# ── 3. GET /favorites ────────────────────────────────────────────────────────
@app.get("/favorites")
async def get_favorites(user=Depends(get_current_user)):
    result = supabase.table("favorites").select("*").eq("user_id", user.id).execute()
    return {"favorites": result.data}


# ── 4. POST /favorites ───────────────────────────────────────────────────────
@app.post("/favorites", status_code=201)
async def add_favorite(body: FavoriteRequest, user=Depends(get_current_user)):
    existing = (
        supabase.table("favorites")
        .select("id")
        .eq("user_id", user.id)
        .eq("event_id", body.event_id)
        .execute()
    )
    if existing.data:
        raise HTTPException(status_code=409, detail="Already in favorites")
    result = supabase.table("favorites").insert(
        {"user_id": user.id, "event_id": body.event_id}
    ).execute()
    return result.data[0]


# ── 5. DELETE /favorites/{event_id} ─────────────────────────────────────────
@app.delete("/favorites/{event_id}", status_code=204)
async def remove_favorite(event_id: str, user=Depends(get_current_user)):
    supabase.table("favorites").delete().eq("user_id", user.id).eq("event_id", event_id).execute()
    return None


# ── 6. POST /recommendations ─────────────────────────────────────────────────
@app.post("/recommendations")
async def get_recommendations(body: RecommendRequest, user=Depends(get_current_user)):
    """
    Use Anthropic API to generate a short personalised recommendation blurb,
    then fetch matching Ticketmaster events in parallel (asyncio fan-out).
    """
    genres_str = ", ".join(body.genres) if body.genres else "all genres"
    city_str = body.city or "your city"

    # Fan-out: call Anthropic + Ticketmaster concurrently (L2 asyncio pattern)
    async def fetch_tm():
        async with httpx.AsyncClient(timeout=10.0) as client:
            r = await client.get(
                "https://app.ticketmaster.com/discovery/v2/events.json",
                params={
                    "apikey": TICKETMASTER_KEY,
                    "classificationName": "music",
                    "city": body.city or "",
                    "keyword": body.genres[0] if body.genres else "",
                    "size": 6,
                    "sort": "date,asc",
                },
            )
            r.raise_for_status()
            return _normalize_events(r.json().get("_embedded", {}).get("events", []))

    async def fetch_ai_blurb():
        prompt = (
            f"Write a 2-sentence personalized intro for a music event recommendation "
            f"page. The user likes: {genres_str}. Their city: {city_str}. "
            f"Be warm, concise, and mention the genres. No markdown."
        )
        response = await asyncio.to_thread(gemini_model.generate_content, prompt)
        return response.text

    events, blurb = await asyncio.gather(fetch_tm(), asyncio.to_thread(fetch_ai_blurb))
    return {"blurb": blurb, "events": events}


# ── Health check ─────────────────────────────────────────────────────────────
@app.get("/health")
async def health():
    return {"status": "ok"}
