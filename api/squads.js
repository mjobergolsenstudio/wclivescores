// api/squads.js — Vercel Serverless Function
// Fetches WC 2026 squad data from Wikipedia REST API
// No API key needed — Wikipedia is free and open
// Cache: 6 hours (squads don't change often)

let cache = { data: null, ts: 0 };
const CACHE_TTL = 6 * 60 * 60 * 1000; // 6 hours

// Wikipedia REST API — returns page content as structured JSON
const WIKI_API = "https://en.wikipedia.org/api/rest_v1/page/summary/2026_FIFA_World_Cup_squads";
const WIKI_PARSE = "https://en.wikipedia.org/w/api.php?action=parse&page=2026_FIFA_World_Cup_squads&prop=wikitext&format=json&origin=*";

// Team name normalization — Wikipedia uses full names
const TEAM_MAP = {
  "Mexico": "Mexico",
  "South Africa": "South Africa",
  "South Korea": "South Korea",
  "Czech Republic": "Czechia",
  "Czechia": "Czechia",
  "Canada": "Canada",
  "Bosnia and Herzegovina": "Bosnia-Herzegovina",
  "Bosnia & Herzegovina": "Bosnia-Herzegovina",
  "Qatar": "Qatar",
  "Switzerland": "Switzerland",
  "Brazil": "Brazil",
  "Morocco": "Morocco",
  "Haiti": "Haiti",
  "Scotland": "Scotland",
  "United States": "USA",
  "Paraguay": "Paraguay",
  "Australia": "Australia",
  "Turkey": "Türkiye",
  "Türkiye": "Türkiye",
  "Germany": "Germany",
  "Curaçao": "Curaçao",
  "Ivory Coast": "Ivory Coast",
  "Côte d'Ivoire": "Ivory Coast",
  "Ecuador": "Ecuador",
  "Netherlands": "Netherlands",
  "Japan": "Japan",
  "Sweden": "Sweden",
  "Tunisia": "Tunisia",
  "Belgium": "Belgium",
  "Egypt": "Egypt",
  "Iran": "Iran",
  "New Zealand": "New Zealand",
  "Spain": "Spain",
  "Cape Verde": "Cape Verde",
  "Saudi Arabia": "Saudi Arabia",
  "Uruguay": "Uruguay",
  "France": "France",
  "Senegal": "Senegal",
  "Iraq": "Iraq",
  "Norway": "Norway",
  "Argentina": "Argentina",
  "Algeria": "Algeria",
  "Austria": "Austria",
  "Jordan": "Jordan",
  "Portugal": "Portugal",
  "DR Congo": "DR Congo",
  "Democratic Republic of the Congo": "DR Congo",
  "Uzbekistan": "Uzbekistan",
  "Colombia": "Colombia",
  "England": "England",
  "Croatia": "Croatia",
  "Ghana": "Ghana",
  "Panama": "Panama",
};

// Position mapping from Wikipedia codes
const POS_MAP = {
  "GK": "GK",
  "DF": "DEF",
  "MF": "MID",
  "FW": "FWD",
  "DEF": "DEF",
  "MID": "MID",
  "FWD": "FWD",
};

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Cache-Control", "public, s-maxage=21600"); // 6h CDN cache

  const now = Date.now();

  // Serve from cache if fresh
  if (cache.data && now - cache.ts < CACHE_TTL) {
    return res.status(200).json({ source: "cache", squads: cache.data, updatedAt: new Date(cache.ts).toISOString() });
  }

  try {
    // Fetch Wikipedia wikitext (structured source data)
    const wikiRes = await fetch(WIKI_PARSE, {
      headers: { "User-Agent": "wclivescores.com/1.0 (contact@wclivescores.com)" }
    });

    if (!wikiRes.ok) throw new Error(`Wikipedia error: ${wikiRes.status}`);

    const wikiJson = await wikiRes.json();
    const wikitext = wikiJson?.parse?.wikitext?.["*"] || "";

    const squads = parseWikitext(wikitext);

    const payload = squads;
    cache = { data: payload, ts: now };

    return res.status(200).json({
      source: "wikipedia",
      squads: payload,
      updatedAt: new Date().toISOString(),
      note: "Data from Wikipedia — updates as squads are confirmed"
    });

  } catch (err) {
    console.error("Wikipedia fetch error:", err);

    // Return stale cache if available
    if (cache.data) {
      return res.status(200).json({
        source: "stale-cache",
        squads: cache.data,
        updatedAt: new Date(cache.ts).toISOString()
      });
    }

    return res.status(502).json({ error: "Failed to fetch squad data." });
  }
}

// ── WIKITEXT PARSER ───────────────────────────────────────────────────────────
function parseWikitext(wikitext) {
  const squads = {};

  // Split by team sections
  // Wikipedia format: === [[Team Name]] === followed by coach and player tables
  const teamSections = wikitext.split(/===\s*\[\[/);

  for (const section of teamSections) {
    // Extract team name from section header
    const teamMatch = section.match(/^([^\]]+)\]\]/);
    if (!teamMatch) continue;

    const rawName = teamMatch[1].trim();
    // Handle "Team name|Display name" wiki links
    const teamName = rawName.includes("|") ? rawName.split("|").pop().trim() : rawName;
    const normalizedName = TEAM_MAP[teamName] || teamName;

    if (!normalizedName) continue;

    // Extract coach
    const coachMatch = section.match(/\|\s*coach\s*=\s*\{\{flagicon[^}]*\}\}\s*(?:\[\[)?([^\]|\n]+)/i)
      || section.match(/Coach[:\s]+\[\[([^\]|]+)/i)
      || section.match(/coach\s*=\s*(?:\[\[)?([^|\]\n]+)/i);
    const coach = coachMatch ? coachMatch[1].trim().replace(/\[\[|\]\]/g, "") : "Unknown";

    // Extract formation if mentioned
    const formationMatch = section.match(/formation\s*=\s*([0-9-]+)/i);
    const formation = formationMatch ? formationMatch[1] : "4-3-3";

    // Parse player rows from wikitables
    const players = parsePlayers(section);

    if (players.length > 0 || rawName.length < 50) {
      squads[normalizedName] = {
        name: normalizedName,
        coach: coach.split("(")[0].trim(),
        formation,
        players,
        confirmed: players.length > 0,
      };
    }
  }

  return squads;
}

function parsePlayers(section) {
  const players = [];

  // Match wikitable rows: | no || pos || [[Player Name]] || dob || caps || club
  // Wikipedia squad tables have consistent format
  const rowRegex = /\|\s*(\d+)\s*\|\|\s*(GK|DF|MF|FW)\s*\|\|\s*(?:\{\{[^}]*\}\}\s*)?(?:\[\[)?([^\]|\n,]+?)(?:\|[^\]]*)?(?:\]\])?\s*\|\|\s*([^\|]+)\|\|\s*(\d+)\s*\|\|\s*(?:\{\{[^}]*\}\}\s*)?([^\|\n]+)/gi;

  let match;
  while ((match = rowRegex.exec(section)) !== null) {
    const [, no, posCode, name, dob, caps, clubRaw] = match;

    const cleanName = name
      .replace(/\[\[|\]\]/g, "")
      .replace(/\{\{[^}]*\}\}/g, "")
      .split("|").pop()
      .trim();

    const cleanClub = clubRaw
      .replace(/\[\[|\]\]/g, "")
      .replace(/\{\{[^}]*\}\}/g, "")
      .replace(/'''|''/g, "")
      .split("|").pop()
      .trim()
      .split("\n")[0]
      .trim();

    // Extract birth year from dob string like "{{birth date and age|1990|5|15}}"
    const yearMatch = dob.match(/(\d{4})/);
    const birthYear = yearMatch ? parseInt(yearMatch[1]) : null;
    const age = birthYear ? 2026 - birthYear : null;

    if (cleanName && cleanName.length > 1) {
      players.push({
        no: parseInt(no),
        pos: POS_MAP[posCode] || posCode,
        name: cleanName,
        age,
        caps: parseInt(caps) || 0,
        club: cleanClub || "Unknown",
      });
    }
  }

  // Also try simpler format
  if (players.length === 0) {
    const simpleRegex = /\|\s*(\d+)\s*\|[^|]*\|\s*(GK|DF|MF|FW)\s*\|[^|]*\|\s*([^\|\n]{3,40})\s*\|/gi;
    while ((match = simpleRegex.exec(section)) !== null) {
      const [, no, posCode, name] = match;
      const cleanName = name.replace(/\[\[|\]\]/g, "").split("|").pop().trim();
      if (cleanName && cleanName.length > 1 && !cleanName.includes("{")) {
        players.push({
          no: parseInt(no),
          pos: POS_MAP[posCode] || posCode,
          name: cleanName,
          age: null,
          caps: 0,
          club: "",
        });
      }
    }
  }

  return players.sort((a, b) => {
    const posOrder = { GK: 0, DEF: 1, MID: 2, FWD: 3 };
    return (posOrder[a.pos] ?? 9) - (posOrder[b.pos] ?? 9) || a.no - b.no;
  });
}
