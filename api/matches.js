// api/matches.js — Vercel Serverless Function
// Fetches WC 2026 data from Balldontlie API
// Add BALLDONTLIE_KEY to Vercel environment variables

let cache = { data: null, ts: 0, ttl: 0 };

const TOURNAMENT_START = new Date("2026-06-11T00:00:00Z").getTime();
const TOURNAMENT_END   = new Date("2026-07-20T00:00:00Z").getTime();

function getCacheTTL() {
  const now = Date.now();
  if (now < TOURNAMENT_START || now > TOURNAMENT_END) return 10 * 60 * 1000;
  return 45 * 1000;
}

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET");
  res.setHeader("Cache-Control", "public, s-maxage=45");

  const now = Date.now();

  if (cache.data && now - cache.ts < cache.ttl) {
    return res.status(200).json({ source: "cache", ...cache.data });
  }

  const API_KEY = process.env.BALLDONTLIE_KEY;
  if (!API_KEY) {
    return res.status(500).json({ error: "BALLDONTLIE_KEY not set in environment." });
  }

  try {
    const headers = { Authorization: API_KEY };

    const [matchesRes, standingsRes] = await Promise.all([
      fetch("https://api.balldontlie.io/fifa/worldcup/v1/matches?per_page=200", { headers }),
      fetch("https://api.balldontlie.io/fifa/worldcup/v1/group_standings", { headers }),
    ]);

    if (!matchesRes.ok) throw new Error(`Matches API error: ${matchesRes.status}`);
    if (!standingsRes.ok) throw new Error(`Standings API error: ${standingsRes.status}`);

    const [matchesJson, standingsJson] = await Promise.all([
      matchesRes.json(),
      standingsRes.json(),
    ]);

    const matches = (matchesJson.data || []).map((m) => {
      const status = mapStatus(m.status);
      return {
        id: m.id,
        group: m.group?.name?.replace("Group ", "") || "",
        round: m.stage?.name || "",
        home: m.home_team?.name || "",
        away: m.away_team?.name || "",
        home_score: m.home_score ?? null,
        away_score: m.away_score ?? null,
        status,
        minute: m.clock ?? null,
        kickoff: m.datetime || null,
        venue: m.stadium?.name || "",
        events: buildEvents(m),
      };
    }).sort((a, b) => {
      const o = { live: 0, upcoming: 1, finished: 2 };
      if (o[a.status] !== o[b.status]) return o[a.status] - o[b.status];
      return new Date(a.kickoff || 0) - new Date(b.kickoff || 0);
    });

    const standings = standingsJson.data || [];

    const payload = { matches, standings, updatedAt: new Date().toISOString() };
    const ttl = getCacheTTL();
    cache = { data: payload, ts: now, ttl };

    return res.status(200).json({ source: "live", ...payload });

  } catch (err) {
    console.error("Balldontlie fetch error:", err);
    if (cache.data) {
      return res.status(200).json({ source: "stale-cache", ...cache.data });
    }
    return res.status(502).json({ error: err.message || "Failed to fetch match data." });
  }
}

function mapStatus(status) {
  if (!status) return "upcoming";
  const s = status.toLowerCase();
  if (s === "in_progress" || s === "live" || s === "halftime") return "live";
  if (s === "completed" || s === "finished" || s === "ft") return "finished";
  return "upcoming";
}

function buildEvents(m) {
  const events = [];
  if (!m.events) return events;
  for (const ev of m.events) {
    const type = mapEventType(ev.type);
    if (!type) continue;
    events.push({
      type,
      team: ev.team?.name || "",
      player: ev.player?.name || ev.player || "Unknown",
      minute: ev.minute || ev.clock || 0,
      extra: ev.detail === "Penalty" ? "pen." : ev.detail === "Own Goal" ? "o.g." : "",
    });
  }
  return events.sort((a, b) => a.minute - b.minute);
}

function mapEventType(type) {
  if (!type) return null;
  const t = type.toLowerCase();
  if (t.includes("goal")) return "goal";
  if (t.includes("yellow")) return "yellow";
  if (t.includes("red")) return "red";
  return null;
}
