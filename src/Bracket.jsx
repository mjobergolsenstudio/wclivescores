// src/Bracket.jsx — WC 2026 Knockout Bracket
// Round of 32 → Round of 16 → QF → SF → Final

import { useState } from "react";

const FLAGS = {
  Mexico:"🇲🇽","South Africa":"🇿🇦","South Korea":"🇰🇷",Czechia:"🇨🇿",
  Canada:"🇨🇦","Bosnia-Herzegovina":"🇧🇦",Qatar:"🇶🇦",Switzerland:"🇨🇭",
  Brazil:"🇧🇷",Morocco:"🇲🇦",Haiti:"🇭🇹",Scotland:"🏴󠁧󠁢󠁳󠁣󠁴󠁿",
  USA:"🇺🇸",Paraguay:"🇵🇾",Australia:"🇦🇺","Türkiye":"🇹🇷",
  Germany:"🇩🇪","Curaçao":"🇨🇼","Ivory Coast":"🇨🇮",Ecuador:"🇪🇨",
  Netherlands:"🇳🇱",Japan:"🇯🇵",Sweden:"🇸🇪",Tunisia:"🇹🇳",
  Belgium:"🇧🇪",Egypt:"🇪🇬",Iran:"🇮🇷","New Zealand":"🇳🇿",
  Spain:"🇪🇸","Cape Verde":"🇨🇻","Saudi Arabia":"🇸🇦",Uruguay:"🇺🇾",
  France:"🇫🇷",Senegal:"🇸🇳",Iraq:"🇮🇶",Norway:"🇳🇴",
  Argentina:"🇦🇷",Algeria:"🇩🇿",Austria:"🇦🇹",Jordan:"🇯🇴",
  Portugal:"🇵🇹","DR Congo":"🇨🇩",Uzbekistan:"🇺🇿",Colombia:"🇨🇴",
  England:"🏴󠁧󠁢󠁥󠁮󠁧󠁿",Croatia:"🇭🇷",Ghana:"🇬🇭",Panama:"🇵🇦",
};

// WC 2026 knockout structure — 32 teams advance from group stage
// Top 2 from each group + 8 best 3rd-place teams = 32
// Pre-defined R32 matchups based on FIFA seeding rules
const R32_STRUCTURE = [
  // Match label, home slot, away slot
  { id:"R32-1",  label:"Match 49",  date:"Jun 28", home:"1A", away:"3D/E/F" },
  { id:"R32-2",  label:"Match 50",  date:"Jun 28", home:"1C", away:"3A/B/F" },
  { id:"R32-3",  label:"Match 51",  date:"Jun 29", home:"1B", away:"3A/C/D" },
  { id:"R32-4",  label:"Match 52",  date:"Jun 29", home:"1D", away:"3B/E/G" },
  { id:"R32-5",  label:"Match 53",  date:"Jun 30", home:"1E", away:"3A/C/H" },
  { id:"R32-6",  label:"Match 54",  date:"Jun 30", home:"1F", away:"3B/D/H" },
  { id:"R32-7",  label:"Match 55",  date:"Jul 1",  home:"1G", away:"3C/G/H" },
  { id:"R32-8",  label:"Match 56",  date:"Jul 1",  home:"1H", away:"3E/F/G" },
  { id:"R32-9",  label:"Match 57",  date:"Jul 2",  home:"2A", away:"2B" },
  { id:"R32-10", label:"Match 58",  date:"Jul 2",  home:"2C", away:"2D" },
  { id:"R32-11", label:"Match 59",  date:"Jul 3",  home:"2E", away:"2F" },
  { id:"R32-12", label:"Match 60",  date:"Jul 3",  home:"2G", away:"2H" },
  { id:"R32-13", label:"Match 61",  date:"Jul 4",  home:"2I", away:"2J" },
  { id:"R32-14", label:"Match 62",  date:"Jul 4",  home:"2K", away:"2L" },
  { id:"R32-15", label:"Match 63",  date:"Jul 5",  home:"1I", away:"1J" },
  { id:"R32-16", label:"Match 64",  date:"Jul 5",  home:"1K", away:"1L" },
];

const R16_STRUCTURE = [
  { id:"R16-1", label:"Match 65", date:"Jul 6",  home:"W49", away:"W50" },
  { id:"R16-2", label:"Match 66", date:"Jul 6",  home:"W51", away:"W52" },
  { id:"R16-3", label:"Match 67", date:"Jul 7",  home:"W53", away:"W54" },
  { id:"R16-4", label:"Match 68", date:"Jul 7",  home:"W55", away:"W56" },
  { id:"R16-5", label:"Match 69", date:"Jul 8",  home:"W57", away:"W58" },
  { id:"R16-6", label:"Match 70", date:"Jul 8",  home:"W59", away:"W60" },
  { id:"R16-7", label:"Match 71", date:"Jul 9",  home:"W61", away:"W62" },
  { id:"R16-8", label:"Match 72", date:"Jul 9",  home:"W63", away:"W64" },
];

const QF_STRUCTURE = [
  { id:"QF-1", label:"QF 1", date:"Jul 11", home:"W65", away:"W66" },
  { id:"QF-2", label:"QF 2", date:"Jul 11", home:"W67", away:"W68" },
  { id:"QF-3", label:"QF 3", date:"Jul 12", home:"W69", away:"W70" },
  { id:"QF-4", label:"QF 4", date:"Jul 12", home:"W71", away:"W72" },
];

const SF_STRUCTURE = [
  { id:"SF-1", label:"Semi Final 1", date:"Jul 14", home:"W QF1", away:"W QF2" },
  { id:"SF-2", label:"Semi Final 2", date:"Jul 15", home:"W QF3", away:"W QF4" },
];

const FINAL_STRUCTURE = [
  { id:"3RD", label:"3rd Place", date:"Jul 18", home:"L SF1", away:"L SF2" },
  { id:"FIN", label:"🏆 Final",  date:"Jul 19", home:"W SF1", away:"W SF2" },
];

const BS = `
.bracket-wrap{overflow-x:auto;padding-bottom:16px}
.bracket-info{background:rgba(0,229,255,.06);border:1px solid rgba(0,229,255,.15);border-radius:10px;padding:12px 16px;margin-bottom:20px;font-size:12px;color:var(--muted)}
.bracket-grid{display:flex;gap:0;min-width:900px}
.bracket-round{display:flex;flex-direction:column;flex:1;min-width:160px}
.bracket-round-title{font-family:var(--fd);font-size:13px;letter-spacing:2px;color:var(--accent);text-align:center;padding:0 8px 12px;text-transform:uppercase}
.bracket-slots{display:flex;flex-direction:column;justify-content:space-around;flex:1;gap:8px;padding:0 4px}
.bracket-match{background:var(--s1);border:1px solid var(--border);border-radius:10px;overflow:hidden;transition:border-color .2s}
.bracket-match:hover{border-color:rgba(0,229,255,.3)}
.bracket-match-label{font-size:9px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:var(--muted2);padding:5px 8px 3px;background:var(--s2)}
.bracket-team{display:flex;align-items:center;gap:6px;padding:6px 8px;font-size:12px;font-weight:500;border-bottom:1px solid var(--border)}
.bracket-team:last-child{border-bottom:none}
.bracket-team.winner{background:rgba(0,229,255,.06);color:#fff;font-weight:600}
.bracket-team.tbd{color:var(--muted);font-style:italic}
.bracket-score{margin-left:auto;font-family:var(--fd);font-size:14px;color:var(--muted)}
.bracket-score.win{color:#fff}
.bracket-flag{font-size:14px}
.bracket-date{font-size:9px;color:var(--muted);padding:2px 8px 4px;background:var(--s2);text-align:right}
.final-match .bracket-match{border-color:rgba(255,215,0,.3);background:linear-gradient(135deg,var(--s1),rgba(255,215,0,.04))}
.final-match .bracket-match-label{color:var(--gold)}
`;

function BracketMatch({ m, result }) {
  const homeWin = result && result.home_score > result.away_score;
  const awayWin = result && result.away_score > result.home_score;
  const isTBD = !result && !m.homeTeam && !m.awayTeam;

  const homeTeam = result?.home || m.homeTeam || null;
  const awayTeam = result?.away || m.awayTeam || null;

  return (
    <div className="bracket-match">
      <div className="bracket-match-label">{m.label}</div>
      <div className={`bracket-team ${homeWin?"winner":""} ${!homeTeam?"tbd":""}`}>
        <span className="bracket-flag">{homeTeam ? (FLAGS[homeTeam]||"🏳️") : ""}</span>
        <span>{homeTeam || m.home}</span>
        {result && <span className={`bracket-score ${homeWin?"win":""}`}>{result.home_score}</span>}
      </div>
      <div className={`bracket-team ${awayWin?"winner":""} ${!awayTeam?"tbd":""}`}>
        <span className="bracket-flag">{awayTeam ? (FLAGS[awayTeam]||"🏳️") : ""}</span>
        <span>{awayTeam || m.away}</span>
        {result && <span className={`bracket-score ${awayWin?"win":""}`}>{result.away_score}</span>}
      </div>
      <div className="bracket-date">{m.date}</div>
    </div>
  );
}

export default function Bracket({ matches }) {
  // Try to extract knockout results from match data
  const knockoutMatches = matches.filter(m => m.round && !m.round.toLowerCase().includes("group") && !m.round.toLowerCase().includes("matchday"));

  const getResult = (label) => {
    return knockoutMatches.find(m => m.round?.includes(label) || m.label === label) || null;
  };

  return (
    <>
      <style>{BS}</style>
      <div className="bracket-info">
        🏆 The knockout stage begins <strong>June 28</strong>. The bracket updates automatically as teams advance. Top 2 from each group + 8 best 3rd-place teams qualify.
      </div>
      <div className="bracket-wrap">
        <div className="bracket-grid">

          {/* Round of 32 */}
          <div className="bracket-round">
            <div className="bracket-round-title">Round of 32</div>
            <div className="bracket-slots">
              {R32_STRUCTURE.map(m => (
                <BracketMatch key={m.id} m={m} result={getResult(m.label)} />
              ))}
            </div>
          </div>

          {/* Round of 16 */}
          <div className="bracket-round">
            <div className="bracket-round-title">Round of 16</div>
            <div className="bracket-slots">
              {R16_STRUCTURE.map(m => (
                <BracketMatch key={m.id} m={m} result={getResult(m.label)} />
              ))}
            </div>
          </div>

          {/* Quarter Finals */}
          <div className="bracket-round">
            <div className="bracket-round-title">Quarter Finals</div>
            <div className="bracket-slots">
              {QF_STRUCTURE.map(m => (
                <BracketMatch key={m.id} m={m} result={getResult(m.label)} />
              ))}
            </div>
          </div>

          {/* Semi Finals */}
          <div className="bracket-round">
            <div className="bracket-round-title">Semi Finals</div>
            <div className="bracket-slots">
              {SF_STRUCTURE.map(m => (
                <BracketMatch key={m.id} m={m} result={getResult(m.label)} />
              ))}
            </div>
          </div>

          {/* Final */}
          <div className="bracket-round">
            <div className="bracket-round-title">Final</div>
            <div className="bracket-slots">
              {FINAL_STRUCTURE.map(m => (
                <div key={m.id} className={m.id==="FIN"?"final-match":""}>
                  <BracketMatch m={m} result={getResult(m.label)} />
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </>
  );
}
