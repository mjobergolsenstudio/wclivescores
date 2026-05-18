// api/matches.js — Vercel Serverless Function
// Fetches WC 2026 data from API-Football (api-sports.io)
// Requires API_FOOTBALL_KEY in Vercel environment variables

let cache = { data: null, ts: 0, ttl: 0 };

const TOURNAMENT_START = new Date("2026-06-11T00:00:00Z").getTime();
const TOURNAMENT_END   = new Date("2026-07-20T00:00:00Z").getTime();

const WC_LEAGUE_ID = 1;    // FIFA World Cup in API-Football
const WC_SEASON    = 2026;

function getCacheTTL() {
  const now = Date.now();
  if (now < TOURNAMENT_START || now > TOURNAMENT_END) return 10 * 60 * 1000; // 10 min outside tournament
  return 60 * 1000; // 60s during tournament (free plan: 100 calls/day)
}

async function apiFetch(path, apiKey) {
  const res = await fetch(`https://v3.football.api-sports.io${path}`, {
    headers: {
      "x-apisports-key": apiKey,
    },
  });
  if (!res.ok) throw new Error(`API-Football error: ${res.status} on ${path}`);
  return res.json();
}

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET");
  res.setHeader("Cache-Control", "public, s-maxage=60");

  const now = Date.now();

  if (cache.data && now - cache.ts < cache.ttl) {
    return res.status(200).json({ source: "cache", ...cache.data });
  }

  const API_KEY = process.env.API_FOOTBALL_KEY;
  if (!API_KEY) {
    return res.status(500).json({ error: "API_FOOTBALL_KEY not set in environment." });
  }

  try {
    // Fetch all fixtures for WC 2026
    const fixturesJson = await apiFetch(
      `/fixtures?league=${WC_LEAGUE_ID}&season=${WC_SEASON}`,
      API_KEY
    );

    const rawFixtures = fixturesJson.response || [];

    // Build matches array
    const matches = rawFixtures.map((f) => {
      const fixture  = f.fixture;
      const teams    = f.teams;
      const goals    = f.goals;
      const score    = f.score;
      const league   = f.league;

      const status   = mapStatus(fixture.status?.short);
      const minute   = fixture.status?.elapsed ?? null;

      // Extract group from league.round (e.g. "Group Stage - 1" or "Group A")
      const round    = league.round || "";
      const groupMatch = round.match(/Group\s+([A-L])/i);
      const group    = groupMatch ? groupMatch[1].toUpperCase() : "";

      return {
        id:         fixture.id,
        group,
        round,
        home:       teams.home?.name || "",
        away:       teams.away?.name || "",
        home_score: goals.home ?? null,
        away_score: goals.away ?? null,
        status,
        minute,
        kickoff:    fixture.date || null,
        venue:      fixture.venue?.name || "",
        events:     [], // filled below per fixture
      };
    }).sort((a, b) => {
      const o = { live: 0, upcoming: 1, finished: 2 };
      if (o[a.status] !== o[b.status]) return o[a.status] - o[b.status];
      return new Date(a.kickoff || 0) - new Date(b.kickoff || 0);
    });

    // Fetch events for live + recently finished matches (save API calls)
    const activeIds = matches
      .filter(m => m.status === "live" || (m.status === "finished" && isRecent(m.kickoff)))
      .map(m => m.id)
      .slice(0, 10); // cap to preserve free quota

    if (activeIds.length > 0) {
      await Promise.all(activeIds.map(async (fixtureId) => {
        try {
          const evJson = await apiFetch(`/fixtures/events?fixture=${fixtureId}`, API_KEY);
          const match = matches.find(m => m.id === fixtureId);
          if (match && evJson.response) {
            match.events = evJson.response
              .map(ev => ({
                type:   mapEventType(ev.type, ev.detail),
                team:   ev.team?.name || "",
                player: ev.player?.name || "Unknown",
                minute: ev.time?.elapsed || 0,
                extra:  ev.detail === "Penalty" ? "pen." : ev.detail === "Own Goal" ? "o.g." : "",
              }))
              .filter(ev => ev.type !== null)
              .sort((a, b) => a.minute - b.minute);
          }
        } catch (e) {
          console.warn(`Could not fetch events for fixture ${fixtureId}:`, e.message);
        }
      }));
    }

    // Fetch standings
    let standings = [];
    try {
      const standJson = await apiFetch(
        `/standings?league=${WC_LEAGUE_ID}&season=${WC_SEASON}`,
        API_KEY
      );
      standings = standJson.response?.[0]?.league?.standings?.flat() || [];
    } catch (e) {
      console.warn("Could not fetch standings:", e.message);
    }

    const payload = { matches, standings, updatedAt: new Date().toISOString() };
    const ttl = getCacheTTL();
    cache = { data: payload, ts: now, ttl };

    return res.status(200).json({ source: "live", ...payload });

  } catch (err) {
    console.error("API-Football fetch error:", err);
    if (cache.data) {
      return res.status(200).json({ source: "stale-cache", ...cache.data });
    }
    return res.status(502).json({ error: err.message || "Failed to fetch match data." });
  }
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function mapStatus(short) {
  if (!short) return "upcoming";
  const live = ["1H","HT","2H","ET","BT","P","SUSP","INT","LIVE"];
  const done = ["FT","AET","PEN"];
  if (live.includes(short)) return "live";
  if (done.includes(short)) return "finished";
  return "upcoming";
}

function mapEventType(type, detail) {
  if (!type) return null;
  const t = type.toLowerCase();
  if (t === "goal") return detail === "Own Goal" ? "goal" : "goal";
  if (t === "card") {
    if (detail?.toLowerCase().includes("yellow")) return "yellow";
    if (detail?.toLowerCase().includes("red"))    return "red";
  }
  return null;
}

function isRecent(kickoff) {
  if (!kickoff) return false;
  const age = Date.now() - new Date(kickoff).getTime();
  return age < 3 * 60 * 60 * 1000; // within last 3 hours
}
