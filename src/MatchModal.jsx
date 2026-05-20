// src/MatchModal.jsx — Full match detail modal
// Shows: live score, events timeline, match stats, lineups

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

// Seeded random for consistent simulated stats
function seededRand(seed) {
  let s = seed;
  return () => { s=(s*1664525+1013904223)&0xffffffff; return Math.abs(s)/0xffffffff; };
}

// Generate realistic match stats
function genStats(homeTeam, awayTeam, homeScore, awayScore, seed) {
  const rng = seededRand(seed + 999);
  const homeDom = homeScore >= awayScore;
  const base = () => Math.floor(rng() * 100);

  const homePoss = homeDom ? 45 + Math.floor(rng()*20) : 35 + Math.floor(rng()*20);
  const awayPoss = 100 - homePoss;

  const homeShots = homeScore * 3 + 5 + Math.floor(rng()*8);
  const awayShots = awayScore * 3 + 4 + Math.floor(rng()*7);
  const homeShotsOT = Math.max(homeScore, Math.floor(homeShots * 0.35 + rng()*3));
  const awayShotsOT = Math.max(awayScore, Math.floor(awayShots * 0.35 + rng()*3));

  return {
    possession: [homePoss, awayPoss],
    shots: [homeShots, awayShots],
    shotsOnTarget: [homeShotsOT, awayShotsOT],
    corners: [2 + Math.floor(rng()*8), 2 + Math.floor(rng()*7)],
    fouls: [8 + Math.floor(rng()*10), 7 + Math.floor(rng()*10)],
    offsides: [Math.floor(rng()*5), Math.floor(rng()*4)],
    saves: [Math.max(0, awayShotsOT - awayScore), Math.max(0, homeShotsOT - homeScore)],
    yellowCards: [
      (events) => events.filter(e=>e.type==="yellow"&&e.team===homeTeam).length,
      (events) => events.filter(e=>e.type==="yellow"&&e.team===awayTeam).length,
    ],
    redCards: [
      (events) => events.filter(e=>e.type==="red"&&e.team===homeTeam).length,
      (events) => events.filter(e=>e.type==="red"&&e.team===awayTeam).length,
    ],
  };
}

// Generate lineup (4-3-3 or 4-2-3-1)
function genLineup(team, seed) {
  const rng = seededRand(seed);
  const formations = ["4-3-3","4-2-3-1","4-4-2","3-5-2","4-3-3"];
  const formation = formations[Math.floor(rng()*formations.length)];

  // Generic position groups
  const gk = ["M. Hernández","L. Mueller","A. Costa","J. Smith","K. Park","O. Hassan","P. Silva"][Math.floor(rng()*7)];
  const defs = ["R. Torres","A. García","L. Chen","J. Müller","K. Ahmed","P. Santos","O. Diallo","A. Kim"].slice(0,4).map(n=>({name:n,pos:"DEF"}));
  const mids = ["C. López","F. Weber","T. Johnson","A. Bello","M. Okonkwo","J. Park","L. Ferreira"].slice(0,3).map(n=>({name:n,pos:"MID"}));
  const fwds = ["E. Martínez","H. Silva","A. Dembélé"].slice(0,3).map(n=>({name:n,pos:"FWD"}));

  return {
    formation,
    players: [
      {name:gk, pos:"GK"},
      ...defs,
      ...mids,
      ...fwds,
    ]
  };
}

// Commentary lines based on minute
function genCommentary(m, homeTeam, awayTeam, events) {
  const lines = [];
  const sorted = [...events].sort((a,b)=>a.minute-b.minute);

  lines.push({ min:1,  text:`⚽ Kickoff! ${homeTeam} get the match underway.` });

  sorted.forEach(ev => {
    if (ev.type==="goal") {
      const scorer = ev.player;
      const team = ev.team;
      const isHome = team === homeTeam;
      lines.push({
        min: ev.minute,
        text: ev.extra==="pen."
          ? `⚽ PENALTY GOAL! ${scorer} (${team}) converts from the spot! ${ev.extra}`
          : ev.extra==="o.g."
          ? `⚽ OWN GOAL! Unlucky for ${team}. ${scorer} puts it into his own net.`
          : `⚽ GOAL! ${scorer} (${team}) finds the net! ${isHome?"Home":"Away"} side lead.`
      });
    }
    if (ev.type==="yellow") {
      lines.push({ min: ev.minute, text:`🟨 Yellow card — ${ev.player} (${ev.team}) is booked.` });
    }
    if (ev.type==="red") {
      lines.push({ min: ev.minute, text:`🟥 RED CARD! ${ev.player} (${ev.team}) is sent off! Down to ten men.` });
    }
  });

  if (m.minute && m.minute >= 45) {
    lines.push({ min:45, text:`⏱ Half time. ${homeTeam} ${m.home_score??0}–${m.away_score??0} ${awayTeam}` });
  }
  if (m.status==="finished") {
    lines.push({ min:90, text:`🏁 Full time! ${homeTeam} ${m.home_score??0}–${m.away_score??0} ${awayTeam}` });
  }

  return lines.sort((a,b)=>a.min-b.min);
}

function fmtDate(iso) { return new Date(iso).toLocaleDateString(undefined,{weekday:"long",day:"numeric",month:"long",year:"numeric"}); }
function fmtTime(iso) { return new Date(iso).toLocaleTimeString(undefined,{hour:"2-digit",minute:"2-digit"}); }

const MS = `
.modal-overlay{position:fixed;inset:0;background:rgba(0,0,0,.85);z-index:1000;display:flex;align-items:flex-end;justify-content:center;backdrop-filter:blur(4px);animation:fadeIn .2s ease}
@keyframes fadeIn{from{opacity:0}to{opacity:1}}
.modal{background:#0D1525;border-radius:20px 20px 0 0;width:100%;max-width:680px;max-height:92vh;overflow-y:auto;animation:slideUp .25s ease;scrollbar-width:thin}
@keyframes slideUp{from{transform:translateY(40px);opacity:0}to{transform:translateY(0);opacity:1}}
.modal::-webkit-scrollbar{width:4px}
.modal::-webkit-scrollbar-thumb{background:#162038;border-radius:2px}

/* HANDLE */
.modal-handle{width:40px;height:4px;background:rgba(255,255,255,.15);border-radius:2px;margin:12px auto 0}

/* HEADER */
.mhdr{padding:20px 20px 0;position:relative}
.mhdr-close{position:absolute;top:16px;right:16px;background:rgba(255,255,255,.08);border:none;color:var(--muted);font-size:18px;width:32px;height:32px;border-radius:50%;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:background .2s}
.mhdr-close:hover{background:rgba(255,255,255,.14)}
.mhdr-meta{font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:var(--muted);margin-bottom:16px}

/* SCORE HERO */
.score-hero{display:grid;grid-template-columns:1fr auto 1fr;align-items:center;gap:12px;padding:0 0 20px;border-bottom:1px solid var(--border)}
.sh-team{display:flex;flex-direction:column;align-items:center;gap:6px;text-align:center}
.sh-flag{font-size:44px;line-height:1}
.sh-name{font-size:14px;font-weight:700;color:var(--text)}
.sh-goals{font-size:11px;color:var(--live);min-height:14px}
.sh-center{text-align:center}
.sh-score{font-family:var(--fd);font-size:56px;line-height:1;color:#fff;letter-spacing:6px}
.sh-status{margin-top:6px}
.sh-venue{font-size:11px;color:var(--muted);margin-top:6px}
.sh-date{font-size:12px;color:var(--muted);margin-top:2px}

/* TABS */
.mtabs{display:flex;border-bottom:1px solid var(--border);padding:0 20px}
.mtab{flex:1;padding:12px 4px;border:none;background:transparent;color:var(--muted);font-family:var(--fb);font-size:13px;font-weight:500;cursor:pointer;border-bottom:2px solid transparent;transition:all .2s;text-align:center}
.mtab:hover{color:var(--text)}
.mtab.on{color:var(--accent);border-bottom-color:var(--accent)}

/* EVENTS TIMELINE */
.timeline{padding:16px 20px;display:flex;flex-direction:column;gap:4px}
.tl-item{display:flex;align-items:center;gap:10px;padding:8px 10px;border-radius:10px;transition:background .2s}
.tl-item:hover{background:rgba(255,255,255,.03)}
.tl-item.home{flex-direction:row}
.tl-item.away{flex-direction:row-reverse}
.tl-min{font-family:var(--fd);font-size:14px;color:var(--muted);min-width:36px;text-align:center;letter-spacing:1px}
.tl-ico{font-size:18px;min-width:24px;text-align:center}
.tl-info{flex:1}
.tl-player{font-size:13px;font-weight:600;color:var(--text)}
.tl-team{font-size:11px;color:var(--muted)}
.tl-extra{font-size:11px;color:var(--accent)}
.tl-away .tl-info{text-align:right}
.tl-goal .tl-player{color:#fff}
.tl-halftime{display:flex;align-items:center;gap:8px;padding:6px 10px;margin:4px 0}
.tl-halftime-line{flex:1;height:1px;background:var(--border)}
.tl-halftime-label{font-size:10px;font-weight:700;letter-spacing:2px;color:var(--muted);text-transform:uppercase;white-space:nowrap}
.tl-empty{text-align:center;padding:32px 20px;color:var(--muted);font-size:13px;font-style:italic}

/* STATS */
.stats-wrap{padding:16px 20px;display:flex;flex-direction:column;gap:14px}
.stat-row-full{display:flex;flex-direction:column;gap:5px}
.stat-label{font-size:11px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:var(--muted);text-align:center}
.stat-numbers{display:flex;justify-content:space-between;align-items:center;font-size:15px;font-weight:600;color:var(--text)}
.stat-bar-wrap{height:6px;background:var(--s3);border-radius:3px;overflow:hidden;display:flex}
.stat-bar-home{height:100%;background:var(--accent);border-radius:3px 0 0 3px;transition:width .6s ease}
.stat-bar-away{height:100%;background:#FF6B9D;border-radius:0 3px 3px 0;transition:width .6s ease}
.stat-divider{height:1px;background:var(--border);margin:4px 0}

/* LINEUP */
.lineup-wrap{padding:16px 20px}
.lineup-pitch{background:linear-gradient(180deg,#0a2a0a 0%,#0d3a0d 50%,#0a2a0a 100%);border-radius:12px;padding:20px;margin-bottom:16px;position:relative;min-height:300px;display:flex;flex-direction:column;justify-content:space-between}
.lineup-pitch::before{content:'';position:absolute;inset:10px;border:1px solid rgba(255,255,255,.08);border-radius:8px;pointer-events:none}
.lineup-pitch::after{content:'';position:absolute;left:50%;top:10px;bottom:10px;width:1px;background:rgba(255,255,255,.06);pointer-events:none}
.lineup-row{display:flex;justify-content:space-around;align-items:center;padding:4px 0}
.lineup-player{display:flex;flex-direction:column;align-items:center;gap:2px;min-width:56px}
.lineup-jersey{width:28px;height:28px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:700;color:#fff}
.home-jersey{background:rgba(0,229,255,.3);border:1px solid rgba(0,229,255,.5)}
.away-jersey{background:rgba(255,107,157,.3);border:1px solid rgba(255,107,157,.5)}
.lineup-pname{font-size:9px;color:rgba(255,255,255,.7);text-align:center;max-width:52px;line-height:1.2;overflow:hidden;white-space:nowrap;text-overflow:ellipsis}
.lineup-formation{font-size:11px;color:rgba(255,255,255,.4);letter-spacing:2px;text-align:center}
.lineup-teams{display:grid;grid-template-columns:1fr 1fr;gap:12px}
.lineup-team{background:var(--s2);border-radius:10px;padding:12px}
.lineup-team h4{font-size:12px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:var(--muted);margin-bottom:8px;display:flex;align-items:center;gap:6px}
.lineup-list{display:flex;flex-direction:column;gap:4px}
.lineup-li{display:flex;align-items:center;gap:6px;font-size:12px;color:var(--text)}
.lineup-pos{font-size:9px;font-weight:700;color:var(--muted);min-width:28px}

/* COMMENTARY */
.commentary{padding:16px 20px;display:flex;flex-direction:column;gap:6px}
.comm-item{display:flex;gap:10px;padding:8px 10px;border-radius:10px}
.comm-item:hover{background:rgba(255,255,255,.02)}
.comm-min{font-family:var(--fd);font-size:13px;color:var(--accent);min-width:32px;letter-spacing:1px}
.comm-text{font-size:13px;color:var(--text);line-height:1.5}
.comm-item.goal{background:rgba(0,255,136,.04)}
.comm-item.goal .comm-text{color:var(--live);font-weight:600}
.comm-item.red{background:rgba(255,80,80,.04)}
.comm-item.card .comm-text{color:var(--text)}

@media(min-width:640px){
  .modal-overlay{align-items:center}
  .modal{border-radius:20px;max-height:85vh}
}
`;

export default function MatchModal({ match, onClose }) {
  const [activeTab, setActiveTab] = useState("events");

  if (!match) return null;

  const seed = match.id * 17 + match.home.charCodeAt(0);
  const stats = (match.status !== "upcoming") ? genStats(match.home, match.away, match.home_score??0, match.away_score??0, seed) : null;
  const homeLineup = genLineup(match.home, seed);
  const awayLineup = genLineup(match.away, seed + 50);
  const commentary = (match.status !== "upcoming") ? genCommentary(match, match.home, match.away, match.events||[]) : [];

  const homeGoals = (match.events||[]).filter(e=>e.type==="goal"&&e.team===match.home);
  const awayGoals = (match.events||[]).filter(e=>e.type==="goal"&&e.team===match.away);

  const isUpcoming = match.status === "upcoming";
  const isLive = match.status === "live";
  const isFinished = match.status === "finished";

  function StatBar({ label, home, away, format }) {
    const total = home + away || 1;
    const homePct = (home / total) * 100;
    const awayPct = (away / total) * 100;
    return (
      <div className="stat-row-full">
        <div className="stat-numbers">
          <span>{format ? format(home) : home}</span>
          <span className="stat-label">{label}</span>
          <span>{format ? format(away) : away}</span>
        </div>
        <div className="stat-bar-wrap">
          <div className="stat-bar-home" style={{width:`${homePct}%`}}/>
          <div className="stat-bar-away" style={{width:`${awayPct}%`}}/>
        </div>
      </div>
    );
  }

  return (
    <>
      <style>{MS}</style>
      <div className="modal-overlay" onClick={e => e.target===e.currentTarget && onClose()}>
        <div className="modal">
          <div className="modal-handle"/>

          {/* HEADER */}
          <div className="mhdr">
            <button className="mhdr-close" onClick={onClose}>✕</button>
            <div className="mhdr-meta">Group {match.group} &nbsp;·&nbsp; {match.round || "Group Stage"}</div>

            {/* SCORE HERO */}
            <div className="score-hero">
              <div className="sh-team">
                <span className="sh-flag">{FLAGS[match.home]||"🏳️"}</span>
                <span className="sh-name">{match.home}</span>
                <span className="sh-goals">{homeGoals.map(g=>`${g.minute}' ${g.player.split(".").pop()}`).join(", ")}</span>
              </div>
              <div className="sh-center">
                {isUpcoming ? (
                  <>
                    <div style={{fontFamily:"var(--fd)",fontSize:"28px",color:"var(--muted)",letterSpacing:"4px"}}>VS</div>
                    <div style={{fontSize:"13px",color:"var(--text)",marginTop:"8px",fontWeight:"600"}}>{fmtDate(match.kickoff)}</div>
                    <div style={{fontSize:"15px",color:"var(--accent)",marginTop:"4px",fontWeight:"700"}}>🕐 {fmtTime(match.kickoff)} local</div>
                  </>
                ) : (
                  <>
                    <div className="sh-score">{match.home_score??0}<span style={{color:"var(--muted)",fontSize:"32px",letterSpacing:"2px"}}> – </span>{match.away_score??0}</div>
                    <div className="sh-status">
                      {isLive && <span className="badge bl">🔴 {match.minute||0}'</span>}
                      {isFinished && <span className="badge bf">Full Time</span>}
                    </div>
                  </>
                )}
                <div className="sh-venue">{match.venue}</div>
                {!isUpcoming && <div className="sh-date">{fmtDate(match.kickoff)}</div>}
              </div>
              <div className="sh-team">
                <span className="sh-flag">{FLAGS[match.away]||"🏳️"}</span>
                <span className="sh-name">{match.away}</span>
                <span className="sh-goals">{awayGoals.map(g=>`${g.minute}' ${g.player.split(".").pop()}`).join(", ")}</span>
              </div>
            </div>
          </div>

          {/* TABS */}
          {!isUpcoming && (
            <div className="mtabs">
              {[
                {id:"events", l:"Events"},
                {id:"stats",  l:"Stats"},
                {id:"lineup", l:"Lineup"},
                {id:"live",   l:"Commentary"},
              ].map(t=>(
                <button key={t.id} className={`mtab ${activeTab===t.id?"on":""}`} onClick={()=>setActiveTab(t.id)}>{t.l}</button>
              ))}
            </div>
          )}

          {/* EVENTS TIMELINE */}
          {(activeTab==="events" || isUpcoming) && (
            <div className="timeline">
              {isUpcoming && (
                <div className="tl-empty">
                  Match hasn't started yet.<br/>
                  <span style={{color:"var(--accent)",fontStyle:"normal",fontWeight:"600"}}>🕐 {fmtTime(match.kickoff)} local time</span>
                </div>
              )}
              {!isUpcoming && (match.events||[]).length===0 && (
                <div className="tl-empty">No events recorded yet</div>
              )}
              {!isUpcoming && [...(match.events||[])].sort((a,b)=>a.minute-b.minute).map((ev, i, arr) => {
                const isHome = ev.team === match.home;
                const showHT = ev.minute > 45 && (i===0 || arr[i-1].minute<=45);
                return (
                  <div key={i}>
                    {showHT && (
                      <div className="tl-halftime">
                        <div className="tl-halftime-line"/>
                        <div className="tl-halftime-label">Half Time · {match.home_score??0}–{match.away_score??0}</div>
                        <div className="tl-halftime-line"/>
                      </div>
                    )}
                    <div className={`tl-item ${isHome?"home":"away"} ${ev.type==="goal"?"tl-goal":""}`}>
                      <div className="tl-min">{ev.minute}'</div>
                      <div className="tl-ico">
                        {ev.type==="goal"?"⚽":ev.type==="yellow"?"🟨":"🟥"}
                      </div>
                      <div className="tl-info">
                        <div className="tl-player">{ev.player}</div>
                        <div className="tl-team">{ev.team}</div>
                        {ev.extra && <div className="tl-extra">{ev.extra}</div>}
                      </div>
                    </div>
                  </div>
                );
              })}
              {!isUpcoming && isFinished && (
                <div className="tl-halftime">
                  <div className="tl-halftime-line"/>
                  <div className="tl-halftime-label">Full Time · {match.home_score??0}–{match.away_score??0}</div>
                  <div className="tl-halftime-line"/>
                </div>
              )}
            </div>
          )}

          {/* STATS */}
          {activeTab==="stats" && stats && (
            <div className="stats-wrap">
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:"4px"}}>
                <span style={{fontSize:"13px",fontWeight:"700",color:"var(--accent)"}}>{match.home}</span>
                <span style={{fontSize:"11px",letterSpacing:"2px",textTransform:"uppercase",color:"var(--muted)"}}>Stats</span>
                <span style={{fontSize:"13px",fontWeight:"700",color:"#FF6B9D"}}>{match.away}</span>
              </div>
              <div className="stat-divider"/>
              <StatBar label="Possession" home={stats.possession[0]} away={stats.possession[1]} format={v=>`${v}%`}/>
              <StatBar label="Shots" home={stats.shots[0]} away={stats.shots[1]}/>
              <StatBar label="Shots on Target" home={stats.shotsOnTarget[0]} away={stats.shotsOnTarget[1]}/>
              <StatBar label="Corners" home={stats.corners[0]} away={stats.corners[1]}/>
              <StatBar label="Fouls" home={stats.fouls[0]} away={stats.fouls[1]}/>
              <StatBar label="Offsides" home={stats.offsides[0]} away={stats.offsides[1]}/>
              <StatBar label="Saves" home={stats.saves[0]} away={stats.saves[1]}/>
              <div className="stat-divider"/>
              <div style={{display:"flex",justifyContent:"space-between",fontSize:"14px",color:"var(--text)"}}>
                <span>{(match.events||[]).filter(e=>e.type==="yellow"&&e.team===match.home).length} 🟨</span>
                <span style={{fontSize:"11px",color:"var(--muted)",letterSpacing:"1px",textTransform:"uppercase"}}>Yellow Cards</span>
                <span>🟨 {(match.events||[]).filter(e=>e.type==="yellow"&&e.team===match.away).length}</span>
              </div>
              <div style={{display:"flex",justifyContent:"space-between",fontSize:"14px",color:"var(--text)"}}>
                <span>{(match.events||[]).filter(e=>e.type==="red"&&e.team===match.home).length} 🟥</span>
                <span style={{fontSize:"11px",color:"var(--muted)",letterSpacing:"1px",textTransform:"uppercase"}}>Red Cards</span>
                <span>🟥 {(match.events||[]).filter(e=>e.type==="red"&&e.team===match.away).length}</span>
              </div>
            </div>
          )}

          {/* LINEUP */}
          {activeTab==="lineup" && (
            <div className="lineup-wrap">
              {/* Visual pitch */}
              <div className="lineup-pitch">
                {/* Home forwards */}
                <div className="lineup-row">
                  {homeLineup.players.filter(p=>p.pos==="FWD").map((p,i)=>(
                    <div key={i} className="lineup-player">
                      <div className="lineup-jersey home-jersey">{i+9}</div>
                      <div className="lineup-pname">{p.name.split(" ").pop()}</div>
                    </div>
                  ))}
                </div>
                {/* Home midfielders */}
                <div className="lineup-row">
                  {homeLineup.players.filter(p=>p.pos==="MID").map((p,i)=>(
                    <div key={i} className="lineup-player">
                      <div className="lineup-jersey home-jersey">{i+6}</div>
                      <div className="lineup-pname">{p.name.split(" ").pop()}</div>
                    </div>
                  ))}
                </div>
                {/* Home defenders */}
                <div className="lineup-row">
                  {homeLineup.players.filter(p=>p.pos==="DEF").map((p,i)=>(
                    <div key={i} className="lineup-player">
                      <div className="lineup-jersey home-jersey">{i+2}</div>
                      <div className="lineup-pname">{p.name.split(" ").pop()}</div>
                    </div>
                  ))}
                </div>
                {/* Center divider */}
                <div style={{display:"flex",alignItems:"center",gap:"8px",margin:"4px 0"}}>
                  <div style={{flex:1,height:"1px",background:"rgba(255,255,255,.1)"}}/>
                  <div style={{fontSize:"10px",color:"rgba(255,255,255,.3)",letterSpacing:"2px"}}>{homeLineup.formation} vs {awayLineup.formation}</div>
                  <div style={{flex:1,height:"1px",background:"rgba(255,255,255,.1)"}}/>
                </div>
                {/* Away defenders */}
                <div className="lineup-row">
                  {awayLineup.players.filter(p=>p.pos==="DEF").map((p,i)=>(
                    <div key={i} className="lineup-player">
                      <div className="lineup-jersey away-jersey">{i+2}</div>
                      <div className="lineup-pname">{p.name.split(" ").pop()}</div>
                    </div>
                  ))}
                </div>
                {/* Away midfielders */}
                <div className="lineup-row">
                  {awayLineup.players.filter(p=>p.pos==="MID").map((p,i)=>(
                    <div key={i} className="lineup-player">
                      <div className="lineup-jersey away-jersey">{i+6}</div>
                      <div className="lineup-pname">{p.name.split(" ").pop()}</div>
                    </div>
                  ))}
                </div>
                {/* Away forwards */}
                <div className="lineup-row">
                  {awayLineup.players.filter(p=>p.pos==="FWD").map((p,i)=>(
                    <div key={i} className="lineup-player">
                      <div className="lineup-jersey away-jersey">{i+9}</div>
                      <div className="lineup-pname">{p.name.split(" ").pop()}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Player lists */}
              <div className="lineup-teams">
                <div className="lineup-team">
                  <h4><span>{FLAGS[match.home]||"🏳️"}</span> {match.home}</h4>
                  <div className="lineup-list">
                    {homeLineup.players.map((p,i)=>(
                      <div key={i} className="lineup-li">
                        <span className="lineup-pos">{p.pos}</span>
                        <span>{p.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="lineup-team">
                  <h4><span>{FLAGS[match.away]||"🏳️"}</span> {match.away}</h4>
                  <div className="lineup-list">
                    {awayLineup.players.map((p,i)=>(
                      <div key={i} className="lineup-li">
                        <span className="lineup-pos">{p.pos}</span>
                        <span>{p.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* LIVE COMMENTARY */}
          {activeTab==="live" && (
            <div className="commentary">
              {commentary.length===0 && (
                <div style={{textAlign:"center",padding:"32px 20px",color:"var(--muted)",fontSize:"13px",fontStyle:"italic"}}>
                  Commentary available once the match starts
                </div>
              )}
              {[...commentary].reverse().map((c,i)=>(
                <div key={i} className={`comm-item ${c.text.includes("GOAL")?"goal":c.text.includes("card")?"card":c.text.includes("RED")?"red":""}`}>
                  <div className="comm-min">{c.min}'</div>
                  <div className="comm-text">{c.text}</div>
                </div>
              ))}
            </div>
          )}

          <div style={{height:"20px"}}/>
        </div>
      </div>
    </>
  );
}

// Need useState imported in parent — export helper
export { useState };
