// api/matches.js — Vercel Serverless Function
// Fetches live WC 2026 data from ESPN unofficial API

let cache = { data: null, ts: 0 };
const CACHE_TTL = 60 * 1000; // 1 min cache for live matches

const TEAM_MAP = {
  "Mexico": "Mexico", "South Africa": "South Africa", "South Korea": "South Korea",
  "Czech Republic": "Czechia", "Czechia": "Czechia",
  "Canada": "Canada", "Bosnia-Herzegovina": "Bosnia-Herzegovina",
  "Bosnia and Herzegovina": "Bosnia-Herzegovina",
  "Qatar": "Qatar", "Switzerland": "Switzerland",
  "Brazil": "Brazil", "Morocco": "Morocco", "Haiti": "Haiti", "Scotland": "Scotland",
  "USA": "USA", "United States": "USA", "Paraguay": "Paraguay",
  "Australia": "Australia", "Turkey": "Türkiye", "Türkiye": "Türkiye",
  "Germany": "Germany", "Curaçao": "Curaçao", "Curacao": "Curaçao",
  "Ivory Coast": "Ivory Coast", "Cote d'Ivoire": "Ivory Coast",
  "Ecuador": "Ecuador", "Netherlands": "Netherlands", "Japan": "Japan",
  "Sweden": "Sweden", "Tunisia": "Tunisia", "Belgium": "Belgium",
  "Egypt": "Egypt", "Iran": "Iran", "New Zealand": "New Zealand",
  "Spain": "Spain", "Cape Verde": "Cape Verde", "Saudi Arabia": "Saudi Arabia",
  "Uruguay": "Uruguay", "France": "France", "Senegal": "Senegal",
  "Iraq": "Iraq", "Norway": "Norway", "Argentina": "Argentina",
  "Algeria": "Algeria", "Austria": "Austria", "Jordan": "Jordan",
  "Portugal": "Portugal", "DR Congo": "DR Congo",
  "Democratic Republic of the Congo": "DR Congo",
  "Congo DR": "DR Congo",
  "Uzbekistan": "Uzbekistan", "Colombia": "Colombia",
  "England": "England", "Croatia": "Croatia", "Ghana": "Ghana", "Panama": "Panama",
};

const GROUP_MAP = {
  "Mexico":"A","South Africa":"A","South Korea":"A","Czechia":"A",
  "Canada":"B","Bosnia-Herzegovina":"B","Qatar":"B","Switzerland":"B",
  "Brazil":"C","Morocco":"C","Haiti":"C","Scotland":"C",
  "USA":"D","Paraguay":"D","Australia":"D","Türkiye":"D",
  "Germany":"E","Curaçao":"E","Ivory Coast":"E","Ecuador":"E",
  "Netherlands":"F","Japan":"F","Sweden":"F","Tunisia":"F",
  "Belgium":"G","Egypt":"G","Iran":"G","New Zealand":"G",
  "Spain":"H","Cape Verde":"H","Saudi Arabia":"H","Uruguay":"H",
  "France":"I","Senegal":"I","Iraq":"I","Norway":"I",
  "Argentina":"J","Algeria":"J","Austria":"J","Jordan":"J",
  "Portugal":"K","DR Congo":"K","Uzbekistan":"K","Colombia":"K",
  "England":"L","Croatia":"L","Ghana":"L","Panama":"L",
};

function normTeam(name) {
  if (!name) return name;
  return TEAM_MAP[name] || name;
}

function parseStatus(comp) {
  const st = comp?.status?.type?.name || "";
  const det = comp?.status?.type?.detail || "";
  if (st === "STATUS_IN_PROGRESS") return "live";
  if (st === "STATUS_FINAL" || st === "STATUS_FULL_TIME") return "finished";
  if (st === "STATUS_HALFTIME") return "live";
  return "upcoming";
}

function parseMinute(comp) {
  const clock = comp?.status?.displayClock;
  const period = comp?.status?.period || 1;
  if (!clock) return null;
  const mins = parseInt(clock.split(":")[0]) || 0;
  if (period === 2) return Math.max(45, mins + 45);
  return mins;
}

function parseEvents(comp, homeTeam, awayTeam) {
  const events = [];
  const details = comp?.details || [];
  details.forEach(d => {
    const type = d?.type?.text?.toLowerCase() || "";
    const team = d?.team?.displayName ? normTeam(d.team.displayName) : null;
    const athlete = d?.athletesInvolved?.[0]?.displayName || "Unknown";
    const minute = d?.clock?.displayValue ? parseInt(d.clock.displayValue) : 0;
    if (type.includes("goal") || type.includes("score")) {
      events.push({ type: "goal", team, minute, player: athlete, extra: type.includes("penalty") ? "pen." : "" });
    } else if (type.includes("yellow")) {
      events.push({ type: "yellow", team, minute, player: athlete, extra: "" });
    } else if (type.includes("red")) {
      events.push({ type: "red", team, minute, player: athlete, extra: "" });
    }
  });
  return events.sort((a, b) => a.minute - b.minute);
}

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Cache-Control", "public, s-maxage=60");

  const now = Date.now();
  if (cache.data && now - cache.ts < CACHE_TTL) {
    return res.status(200).json({ source: "cache", matches: cache.data });
  }

  try {
    // Fetch all WC 2026 matches from ESPN
    const url = "https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/scoreboard?limit=200&dates=20260611-20260719";
    const r = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0", "Accept": "application/json" }
    });
    if (!r.ok) throw new Error(`ESPN HTTP ${r.status}`);
    const data = await r.json();

    const events = data?.events || [];
    if (!events.length) throw new Error("No events from ESPN");

    let id = 1;
    const matches = events.map(ev => {
      const comp = ev?.competitions?.[0];
      if (!comp) return null;

      const home = normTeam(comp.competitors?.find(c => c.homeAway === "home")?.team?.displayName);
      const away = normTeam(comp.competitors?.find(c => c.homeAway === "away")?.team?.displayName);
      const homeScore = parseInt(comp.competitors?.find(c => c.homeAway === "home")?.score) || 0;
      const awayScore = parseInt(comp.competitors?.find(c => c.homeAway === "away")?.score) || 0;
      const status = parseStatus(comp);
      const minute = status === "live" ? parseMinute(comp) : null;
      const venue = comp.venue?.fullName || comp.venue?.address?.city || "";
      const kickoff = comp.date || ev.date;
      const group = GROUP_MAP[home] || GROUP_MAP[away] || "?";
      const evs = (status !== "upcoming") ? parseEvents(comp, home, away) : [];

      return {
        id: id++,
        group,
        home,
        away,
        home_score: status !== "upcoming" ? homeScore : null,
        away_score: status !== "upcoming" ? awayScore : null,
        status,
        minute,
        kickoff,
        events: evs,
        venue,
        espn_id: ev.id,
      };
    }).filter(Boolean);

    // Sort: live first, then upcoming, then finished
    matches.sort((a, b) => {
      const o = { live: 0, upcoming: 1, finished: 2 };
      if (o[a.status] !== o[b.status]) return o[a.status] - o[b.status];
      return new Date(a.kickoff) - new Date(b.kickoff);
    });

    cache = { data: matches, ts: now };
    return res.status(200).json({ source: "espn", matches, updatedAt: new Date().toISOString() });

  } catch (err) {
    console.error("ESPN fetch error:", err.message);
    if (cache.data) {
      return res.status(200).json({ source: "stale-cache", matches: cache.data });
    }
    return res.status(502).json({ error: err.message, matches: [] });
  }
}
