// PlayerStats.jsx — Tournament top scorers + player detail stats
import { useState, useMemo } from "react";

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

const TEAM_GROUP = {
  Mexico:"A","South Africa":"A","South Korea":"A",Czechia:"A",
  Canada:"B","Bosnia-Herzegovina":"B",Qatar:"B",Switzerland:"B",
  Brazil:"C",Morocco:"C",Haiti:"C",Scotland:"C",
  USA:"D",Paraguay:"D",Australia:"D","Türkiye":"D",
  Germany:"E","Curaçao":"E","Ivory Coast":"E",Ecuador:"E",
  Netherlands:"F",Japan:"F",Sweden:"F",Tunisia:"F",
  Belgium:"G",Egypt:"G",Iran:"G","New Zealand":"G",
  Spain:"H","Cape Verde":"H","Saudi Arabia":"H",Uruguay:"H",
  France:"I",Senegal:"I",Iraq:"I",Norway:"I",
  Argentina:"J",Algeria:"J",Austria:"J",Jordan:"J",
  Portugal:"K","DR Congo":"K",Uzbekistan:"K",Colombia:"K",
  England:"L",Croatia:"L",Ghana:"L",Panama:"L",
};

const CSS = `
.ps-wrap{font-family:'Rajdhani',sans-serif;}
.ps-tabs{display:flex;gap:8px;margin-bottom:20px;flex-wrap:wrap;}
.ps-tab{padding:8px 20px;border-radius:20px;border:1.5px solid #CBD5E1;background:transparent;color:#64748B;cursor:pointer;font-family:'Rajdhani',sans-serif;font-size:13px;font-weight:600;transition:all .15s;}
.ps-tab.on{background:#1A56DB;border-color:#1A56DB;color:#fff;}
.ps-tab:hover:not(.on){border-color:#93C5FD;color:#1A56DB;}

/* TOP SCORERS */
.golden-boot{background:linear-gradient(135deg,#1A56DB,#0EA5E9);border-radius:14px;padding:18px 20px;margin-bottom:20px;display:flex;align-items:center;gap:16px;flex-wrap:wrap;}
.gb-left{flex:1;}
.gb-title{font-family:'Orbitron',monospace;font-size:10px;letter-spacing:3px;color:rgba(255,255,255,0.7);text-transform:uppercase;margin-bottom:6px;}
.gb-leader{font-size:18px;font-weight:700;color:#fff;}
.gb-goals{font-family:'Orbitron',monospace;font-size:48px;font-weight:900;color:#fff;line-height:1;}
.gb-label{font-family:'Orbitron',monospace;font-size:9px;letter-spacing:2px;color:rgba(255,255,255,0.6);text-transform:uppercase;}

.scorers-list{display:flex;flex-direction:column;gap:6px;margin-bottom:24px;}
.scorer-row{background:#fff;border:1.5px solid #E2E8F0;border-radius:10px;padding:12px 16px;display:flex;align-items:center;gap:12px;transition:all .2s;cursor:pointer;}
.scorer-row:hover{border-color:#93C5FD;box-shadow:0 4px 12px rgba(26,86,219,0.1);}
.scorer-row.selected{border-color:#1A56DB;background:#EFF6FF;}
.scorer-rank{font-family:'Orbitron',monospace;font-size:13px;font-weight:900;min-width:24px;text-align:center;}
.rank-1{color:#F59E0B;}
.rank-2{color:#94A3B8;}
.rank-3{color:#B45309;}
.rank-other{color:#CBD5E1;}
.scorer-flag{font-size:22px;}
.scorer-info{flex:1;}
.scorer-name{font-size:15px;font-weight:700;color:#0F2340;}
.scorer-team{font-size:11px;color:#94A3B8;margin-top:1px;}
.scorer-goals-wrap{display:flex;align-items:center;gap:6px;}
.scorer-goals{font-family:'Orbitron',monospace;font-size:22px;font-weight:900;color:#1A56DB;}
.scorer-goal-ico{font-size:16px;}
.scorer-pens{font-size:10px;color:#94A3B8;font-family:'Orbitron',monospace;}

/* CARDS */
.cards-section{display:flex;flex-direction:column;gap:6px;margin-bottom:24px;}
.card-row{background:#fff;border:1.5px solid #E2E8F0;border-radius:10px;padding:12px 16px;display:flex;align-items:center;gap:12px;}
.ycard{display:inline-block;width:12px;height:16px;background:#F59E0B;border-radius:2px;flex-shrink:0;}
.rcard{display:inline-block;width:12px;height:16px;background:#EF4444;border-radius:2px;flex-shrink:0;}

/* PLAYER DETAIL */
.player-detail{background:#fff;border:1.5px solid #E2E8F0;border-radius:14px;overflow:hidden;margin-top:16px;}
.pd-header{background:linear-gradient(135deg,#1A56DB,#0EA5E9);padding:20px;}
.pd-name{font-family:'Orbitron',monospace;font-size:18px;font-weight:900;color:#fff;margin-bottom:4px;}
.pd-team{font-size:14px;color:rgba(255,255,255,0.8);display:flex;align-items:center;gap:8px;}
.pd-stats{display:grid;grid-template-columns:repeat(4,1fr);gap:1px;background:#E2E8F0;}
.pd-stat{background:#fff;padding:14px 10px;text-align:center;}
.pd-stat-num{font-family:'Orbitron',monospace;font-size:26px;font-weight:900;color:#0F2340;line-height:1;}
.pd-stat-lbl{font-size:9px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:#94A3B8;margin-top:4px;}
.pd-events{padding:16px;}
.pd-ev-title{font-family:'Orbitron',monospace;font-size:9px;letter-spacing:3px;color:#94A3B8;text-transform:uppercase;margin-bottom:10px;}
.pd-ev-row{display:flex;align-items:center;gap:10px;padding:8px 0;border-bottom:1px solid #F1F5F9;font-size:13px;}
.pd-ev-row:last-child{border-bottom:none;}
.pd-ev-min{font-family:'Orbitron',monospace;font-size:12px;color:#94A3B8;min-width:32px;}
.pd-ev-ico{font-size:16px;min-width:20px;}
.pd-ev-match{color:#64748B;flex:1;}
.pd-ev-extra{font-size:10px;color:#F59E0B;font-family:'Orbitron',monospace;}

/* SEARCH */
.ps-search{position:relative;margin-bottom:16px;}
.ps-search input{background:#fff;border:1.5px solid #CBD5E1;border-radius:20px;padding:8px 14px 8px 34px;color:#0F2340;font-family:'Rajdhani',sans-serif;font-size:13px;width:100%;outline:none;transition:border-color .2s;}
.ps-search input:focus{border-color:#1A56DB;}
.ps-search-ico{position:absolute;left:12px;top:50%;transform:translateY(-50%);color:#94A3B8;font-size:13px;pointer-events:none;}

.empty{text-align:center;padding:40px 20px;color:#94A3B8;}
.sl{font-family:'Orbitron',monospace;font-size:9px;letter-spacing:4px;color:#94A3B8;text-transform:uppercase;margin:20px 0 10px;display:flex;align-items:center;gap:12px;}
.sl::after{content:'';flex:1;height:1px;background:linear-gradient(90deg,#E2E8F0,transparent);}
`;

function buildPlayerStats(matches) {
  const players = {};

  matches.forEach(m => {
    if (m.status === "upcoming") return;
    (m.events || []).forEach(ev => {
      if (!ev.player || ev.player === "Unknown") return;
      const key = `${ev.player}__${ev.team}`;
      if (!players[key]) {
        players[key] = {
          name: ev.player,
          team: ev.team,
          goals: 0,
          pens: 0,
          ownGoals: 0,
          yellow: 0,
          red: 0,
          events: [],
          matches: new Set(),
        };
      }
      const p = players[key];
      p.matches.add(m.id);
      p.events.push({ ...ev, matchHome: m.home, matchAway: m.away, matchId: m.id });

      if (ev.type === "goal") {
        if (ev.extra === "o.g.") p.ownGoals++;
        else { p.goals++; if (ev.extra === "pen.") p.pens++; }
      } else if (ev.type === "yellow") p.yellow++;
      else if (ev.type === "red") p.red++;
    });
  });

  return Object.values(players).map(p => ({ ...p, matchCount: p.matches.size }));
}

export default function PlayerStats({ matches }) {
  const [view, setView] = useState("scorers");
  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState("");

  const allPlayers = useMemo(() => buildPlayerStats(matches), [matches]);

  const topScorers = useMemo(() =>
    allPlayers.filter(p => p.goals > 0 && p.extra !== "o.g.")
      .sort((a, b) => b.goals - a.goals || a.pens - b.pens)
      .slice(0, 20),
    [allPlayers]
  );

  const mostCarded = useMemo(() =>
    allPlayers.filter(p => p.yellow > 0 || p.red > 0)
      .sort((a, b) => (b.yellow + b.red * 3) - (a.yellow + a.red * 3))
      .slice(0, 15),
    [allPlayers]
  );

  const searched = useMemo(() => {
    if (!search) return [];
    const q = search.toLowerCase();
    return allPlayers.filter(p => p.name.toLowerCase().includes(q) || p.team.toLowerCase().includes(q))
      .sort((a, b) => b.goals - a.goals).slice(0, 15);
  }, [allPlayers, search]);

  const leader = topScorers[0];

  function PlayerDetail({ player }) {
    if (!player) return null;
    const evs = player.events.sort((a, b) => {
      const ma = matches.find(m => m.id === a.matchId);
      const mb = matches.find(m => m.id === b.matchId);
      return new Date(ma?.kickoff || 0) - new Date(mb?.kickoff || 0);
    });
    return (
      <div className="player-detail">
        <div className="pd-header">
          <div className="pd-name">{player.name}</div>
          <div className="pd-team">
            <span>{FLAGS[player.team] || "🏳️"}</span>
            <span>{player.team}</span>
            {TEAM_GROUP[player.team] && <span style={{opacity:.7}}>· Group {TEAM_GROUP[player.team]}</span>}
          </div>
        </div>
        <div className="pd-stats">
          {[
            { n: player.goals, l: "Goals" },
            { n: player.pens, l: "Pens" },
            { n: player.yellow, l: "Yellows" },
            { n: player.red, l: "Red" },
          ].map(s => (
            <div key={s.l} className="pd-stat">
              <div className="pd-stat-num" style={s.l === "Goals" ? { color: "#1A56DB" } : s.l === "Red" && s.n > 0 ? { color: "#EF4444" } : s.l === "Yellows" && s.n > 0 ? { color: "#F59E0B" } : {}}>{s.n}</div>
              <div className="pd-stat-lbl">{s.l}</div>
            </div>
          ))}
        </div>
        {evs.length > 0 && (
          <div className="pd-events">
            <div className="pd-ev-title">Match Events</div>
            {evs.map((ev, i) => {
              const ico = ev.type === "goal" ? "⚽" : ev.type === "yellow" ? "🟨" : "🟥";
              const opp = ev.matchHome === player.team ? ev.matchAway : ev.matchHome;
              return (
                <div key={i} className="pd-ev-row">
                  <span className="pd-ev-min">{ev.minute}'</span>
                  <span className="pd-ev-ico">{ico}</span>
                  <span className="pd-ev-match">vs {FLAGS[opp] || ""} {opp}</span>
                  {ev.extra && <span className="pd-ev-extra">{ev.extra}</span>}
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  return (
    <>
      <style>{CSS}</style>
      <div className="ps-wrap">

        {/* Top Scorer Banner */}
        {leader && (
          <div className="golden-boot">
            <div className="gb-left">
              <div className="gb-title">🥇 Golden Boot Leader</div>
              <div className="gb-leader">{FLAGS[leader.team] || ""} {leader.name} · {leader.team}</div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div className="gb-goals">{leader.goals}</div>
              <div className="gb-label">Goals</div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="ps-tabs">
          <button className={`ps-tab${view === "scorers" ? " on" : ""}`} onClick={() => { setView("scorers"); setSelected(null); }}>⚽ Top Scorers</button>
          <button className={`ps-tab${view === "cards" ? " on" : ""}`} onClick={() => { setView("cards"); setSelected(null); }}>🟨 Cards</button>
          <button className={`ps-tab${view === "search" ? " on" : ""}`} onClick={() => { setView("search"); setSelected(null); }}>🔍 Search Player</button>
        </div>

        {/* TOP SCORERS */}
        {view === "scorers" && (
          <>
            <div className="sl">Top Scorers</div>
            {topScorers.length === 0 && <div className="empty">No goals scored yet — check back once matches start.</div>}
            <div className="scorers-list">
              {topScorers.map((p, i) => (
                <div key={`${p.name}-${p.team}`}
                  className={`scorer-row${selected?.name === p.name && selected?.team === p.team ? " selected" : ""}`}
                  onClick={() => setSelected(selected?.name === p.name && selected?.team === p.team ? null : p)}>
                  <span className={`scorer-rank rank-${i < 3 ? i + 1 : "other"}`}>{i + 1}</span>
                  <span className="scorer-flag">{FLAGS[p.team] || "🏳️"}</span>
                  <div className="scorer-info">
                    <div className="scorer-name">{p.name}</div>
                    <div className="scorer-team">{p.team}</div>
                  </div>
                  <div className="scorer-goals-wrap">
                    <span className="scorer-goals">{p.goals}</span>
                    <span className="scorer-goal-ico">⚽</span>
                    {p.pens > 0 && <span className="scorer-pens">({p.pens}p)</span>}
                  </div>
                </div>
              ))}
            </div>
            {selected && <PlayerDetail player={selected} />}
          </>
        )}

        {/* CARDS */}
        {view === "cards" && (
          <>
            <div className="sl">Most Carded Players</div>
            {mostCarded.length === 0 && <div className="empty">No cards yet.</div>}
            <div className="cards-section">
              {mostCarded.map((p, i) => (
                <div key={`${p.name}-${p.team}`}
                  className={`scorer-row${selected?.name === p.name && selected?.team === p.team ? " selected" : ""}`}
                  onClick={() => setSelected(selected?.name === p.name && selected?.team === p.team ? null : p)}>
                  <span className={`scorer-rank rank-${i < 3 ? i + 1 : "other"}`}>{i + 1}</span>
                  <span className="scorer-flag">{FLAGS[p.team] || "🏳️"}</span>
                  <div className="scorer-info">
                    <div className="scorer-name">{p.name}</div>
                    <div className="scorer-team">{p.team}</div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    {p.yellow > 0 && <><span className="ycard" /><span style={{ fontFamily: "'Orbitron',monospace", fontSize: 14, color: "#F59E0B" }}>{p.yellow}</span></>}
                    {p.red > 0 && <><span className="rcard" /><span style={{ fontFamily: "'Orbitron',monospace", fontSize: 14, color: "#EF4444" }}>{p.red}</span></>}
                  </div>
                </div>
              ))}
            </div>
            {selected && <PlayerDetail player={selected} />}
          </>
        )}

        {/* SEARCH */}
        {view === "search" && (
          <>
            <div className="ps-search">
              <span className="ps-search-ico">🔍</span>
              <input placeholder="Search player or team..." value={search} onChange={e => { setSearch(e.target.value); setSelected(null); }} autoFocus />
            </div>
            {search.length > 1 && searched.length === 0 && <div className="empty">No players found for "{search}"</div>}
            {searched.length > 0 && (
              <div className="scorers-list">
                {searched.map(p => (
                  <div key={`${p.name}-${p.team}`}
                    className={`scorer-row${selected?.name === p.name && selected?.team === p.team ? " selected" : ""}`}
                    onClick={() => setSelected(selected?.name === p.name && selected?.team === p.team ? null : p)}>
                    <span className="scorer-flag">{FLAGS[p.team] || "🏳️"}</span>
                    <div className="scorer-info">
                      <div className="scorer-name">{p.name}</div>
                      <div className="scorer-team">{p.team}</div>
                    </div>
                    <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                      {p.goals > 0 && <span style={{ fontFamily: "'Orbitron',monospace", fontSize: 13, color: "#1A56DB" }}>{p.goals} ⚽</span>}
                      {p.yellow > 0 && <span style={{ fontFamily: "'Orbitron',monospace", fontSize: 13, color: "#F59E0B" }}>{p.yellow} 🟨</span>}
                      {p.red > 0 && <span style={{ fontFamily: "'Orbitron',monospace", fontSize: 13, color: "#EF4444" }}>{p.red} 🟥</span>}
                    </div>
                  </div>
                ))}
              </div>
            )}
            {selected && <PlayerDetail player={selected} />}
            {search.length < 2 && <div className="empty">Type a player name or team to search</div>}
          </>
        )}
      </div>
    </>
  );
}
