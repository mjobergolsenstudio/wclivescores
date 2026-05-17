// api/matches.js — Vercel Serverless Function
// Combines two FREE sources — no API key required:
//   1. ESPN unofficial API  → live scores, status, minute
//   2. openfootball GitHub  → full schedule with kickoff times & venues
//
// Cache: 45s during tournament, 10min before/after

const OPENFOOTBALL_URL =
  "https://raw.githubusercontent.com/openfootball/worldcup.json/master/2026/worldcup.json";

const ESPN_URL =
  "https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/scoreboard?limit=200";

// In-memory cache (lives for the duration of the serverless function instance)
let cache = { data: null, ts: 0, ttl: 0 };

const TOURNAMENT_START = new Date("2026-06-11T00:00:00Z").getTime();
const TOURNAMENT_END   = new Date("2026-07-20T00:00:00Z").getTime();

function getCacheTTL() {
  const now = Date.now();
  if (now < TOURNAMENT_START || now > TOURNAMENT_END) return 10 * 60 * 1000; // 10min outside tournament
  return 45 * 1000; // 45s during tournament
}

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET");
  res.setHeader("Cache-Control", "public, s-maxage=45");

  const now = Date.now();

  // Serve from cache if fresh
  if (cache.data && now - cache.ts < cache.ttl) {
    return res.status(200).json({ source: "cache", ...cache.data });
  }

  try {
    // Fetch both sources in parallel
    const [espnRes, ofRes] = await Promise.allSettled([
      fetch(ESPN_URL, { headers: { "User-Agent": "Mozilla/5.0" } }),
      fetch(OPENFOOTBALL_URL),
    ]);

    const espnData  = espnRes.status  === "fulfilled" && espnRes.value.ok  ? await espnRes.value.json()  : null;
    const ofData    = ofRes.status    === "fulfilled" && ofRes.value.ok    ? await ofRes.value.json()    : null;

    // Build a map of ESPN scores keyed by "HomeTeam vs AwayTeam"
    const espnMap = buildEspnMap(espnData);

    // Build match list from openfootball (has the full schedule)
    const matches = buildMatches(ofData, espnMap);

    const payload = {
      matches,
      updatedAt: new Date().toISOString(),
      sources: {
        espn: !!espnData,
        openfootball: !!ofData,
      },
    };

    const ttl = getCacheTTL();
    cache = { data: payload, ts: now, ttl };

    return res.status(200).json({ source: "live", ...payload });

  } catch (err) {
    console.error("API fetch error:", err);
    if (cache.data) {
      return res.status(200).json({ source: "stale-cache", ...cache.data });
    }
    return res.status(502).json({ error: "Failed to fetch match data." });
  }
}

// ── ESPN parser ────────────────────────────────────────────────────────────────
function buildEspnMap(data) {
  const map = {};
  if (!data?.events) return map;

  for (const event of data.events) {
    const comp = event.competitions?.[0];
    if (!comp) continue;

    const home = comp.competitors?.find(c => c.homeAway === "home");
    const away = comp.competitors?.find(c => c.homeAway === "away");
    if (!home || !away) continue;

    const homeTeam = normalizeTeamName(home.team?.displayName || home.team?.name || "");
    const awayTeam = normalizeTeamName(away.team?.displayName || away.team?.name || "");
    const key = `${homeTeam}|${awayTeam}`;

    const status = comp.status?.type;
    const clock  = comp.status?.displayClock || "";

    map[key] = {
      home_score: parseInt(home.score ?? "-1", 10),
      away_score: parseInt(away.score ?? "-1", 10),
      status:     mapEspnStatus(status?.name),
      minute:     parseMinute(clock),
      espnId:     event.id,
    };
  }
  return map;
}

function mapEspnStatus(name) {
  if (!name) return null;
  if (name === "STATUS_IN_PROGRESS") return "live";
  if (name === "STATUS_FINAL")       return "finished";
  if (name === "STATUS_HALFTIME")    return "live";
  return "upcoming";
}

function parseMinute(clock) {
  if (!clock) return null;
  const match = clock.match(/(\d+)/);
  return match ? parseInt(match[1], 10) : null;
}

// ── openfootball parser ────────────────────────────────────────────────────────
function buildMatches(ofData, espnMap) {
  const rawMatches = ofData?.matches || [];
  const result = [];
  let id = 1;

  for (const m of rawMatches) {
    // Skip knockout placeholder matches (team1/team2 are codes like "W101")
    const home = m.team1;
    const away = m.team2;
    if (!home || !away || home.startsWith("W") || away.startsWith("W")) continue;

    // Parse kickoff — openfootball stores "13:00 UTC-6" style
    const kickoff = parseKickoff(m.date, m.time);

    // Derive group letter from "Group A" → "A"
    const group = m.group?.replace("Group ", "").trim() || "";

    // Check ESPN for live/finished data
    const normHome = normalizeTeamName(home);
    const normAway = normalizeTeamName(away);
    const espnKey  = `${normHome}|${normAway}`;
    const espn     = espnMap[espnKey] || null;

    // Determine status
    let status = "upcoming";
    let home_score = null;
    let away_score = null;
    let minute = null;

    if (espn) {
      status = espn.status || "upcoming";
      if (espn.home_score >= 0) home_score = espn.home_score;
      if (espn.away_score >= 0) away_score = espn.away_score;
      minute = espn.minute;
    } else if (m.score) {
      // openfootball has final score in score.ft: [homeGoals, awayGoals]
      status = "finished";
      home_score = m.score.ft?.[0] ?? null;
      away_score = m.score.ft?.[1] ?? null;
    } else if (kickoff && kickoff < Date.now() - 95 * 60 * 1000) {
      // Kickoff was more than 95min ago — assume finished if no score available
      status = "finished";
    }

    // Build events from openfootball goal data
    const events = buildEvents(m, home, away);

    result.push({
      id: id++,
      group,
      round: m.round || "",
      home,
      away,
      home_score,
      away_score,
      status,
      minute,
      kickoff: kickoff ? new Date(kickoff).toISOString() : null,
      venue: m.ground || "",
      events,
    });
  }

  // Sort: live → upcoming → finished
  return result.sort((a, b) => {
    const o = { live: 0, upcoming: 1, finished: 2 };
    if (o[a.status] !== o[b.status]) return o[a.status] - o[b.status];
    return new Date(a.kickoff || 0) - new Date(b.kickoff || 0);
  });
}

function buildEvents(m, home, away) {
  const events = [];

  const addGoals = (goalList, team) => {
    if (!Array.isArray(goalList)) return;
    for (const g of goalList) {
      events.push({
        type: "goal",
        team,
        player: g.name || "Unknown",
        minute: g.minute || 0,
        extra: g.penalty ? "pen." : g.owngoal ? "o.g." : "",
      });
    }
  };

  addGoals(m.goals1, home);
  addGoals(m.goals2, away);

  return events.sort((a, b) => a.minute - b.minute);
}

// ── Utils ──────────────────────────────────────────────────────────────────────

// Parse openfootball date + time string into a UTC timestamp
// date: "2026-06-11"  time: "13:00 UTC-6"
function parseKickoff(date, time) {
  if (!date) return null;
  try {
    if (!time) return new Date(date).getTime();

    // Extract offset like UTC-6 or UTC+2
    const offsetMatch = time.match(/UTC([+-])(\d+)/);
    const timeMatch   = time.match(/(\d{1,2}):(\d{2})/);
    if (!timeMatch) return new Date(date).getTime();

    const [, hh, mm] = timeMatch;
    let offsetMin = 0;
    if (offsetMatch) {
      const sign = offsetMatch[1] === "+" ? 1 : -1;
      offsetMin  = sign * parseInt(offsetMatch[2], 10) * 60;
    }

    // Build as UTC: local time - offset = UTC
    const localMs = Date.UTC(
      ...date.split("-").map(Number),
      parseInt(hh, 10),
      parseInt(mm, 10)
    );
    return localMs - offsetMin * 60 * 1000;
  } catch {
    return null;
  }
}

// Normalize team names so ESPN and openfootball match up
// ESPN uses "Czech Republic", openfootball uses "Czech Republic" / "Czechia" etc.
const NAME_MAP = {
  "czech republic":    "Czechia",
  "bosnia and herzegovina": "Bosnia-Herzegovina",
  "ivory coast":       "Ivory Coast",
  "côte d'ivoire":     "Ivory Coast",
  "curacao":           "Curaçao",
  "curaçao":           "Curaçao",
  "turkey":            "Türkiye",
  "türkiye":           "Türkiye",
  "cape verde":        "Cape Verde",
  "cape verde islands":"Cape Verde",
  "south korea":       "South Korea",
  "korea republic":    "South Korea",
  "dr congo":          "DR Congo",
  "congo dr":          "DR Congo",
  "democratic republic of congo": "DR Congo",
  "new zealand":       "New Zealand",
  "saudi arabia":      "Saudi Arabia",
  "usa":               "USA",
  "united states":     "USA",
};

function normalizeTeamName(name) {
  if (!name) return "";
  const lower = name.toLowerCase().trim();
  return NAME_MAP[lower] || name.trim();
}
