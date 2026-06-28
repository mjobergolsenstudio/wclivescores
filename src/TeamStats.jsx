// src/TeamStats.jsx — Per-team statistics panel

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

function fmtDate(iso) { return new Date(iso).toLocaleDateString(undefined,{day:"numeric",month:"short"}); }
function fmtTime(iso) { return new Date(iso).toLocaleTimeString(undefined,{hour:"2-digit",minute:"2-digit"}); }

const TS = `
.ts-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:16px;margin-top:8px}
.ts-card{background:#FFFFFF;border:1px solid #E2E8F0;border-radius:16px;overflow:hidden}
.ts-head{background:#EFF6FF;padding:14px 16px;display:flex;align-items:center;gap:12px}
.ts-flag{font-size:36px;line-height:1}
.ts-name{font-family:'Orbitron',monospace;font-size:22px;letter-spacing:1px;color:#0F2340}
.ts-group{font-size:11px;color:#94A3B8;letter-spacing:1px;margin-top:2px}
.ts-stats{display:grid;grid-template-columns:repeat(4,1fr);gap:1px;background:#E2E8F0}
.ts-stat{background:#FFFFFF;padding:10px 8px;text-align:center}
.ts-stat-num{font-family:'Orbitron',monospace;font-size:24px;color:#0F2340;line-height:1}
.ts-stat-label{font-size:9px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:#94A3B8;margin-top:3px}
.ts-form{display:flex;gap:4px;padding:10px 16px;align-items:center}
.ts-form-label{font-size:10px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#94A3B8;margin-right:4px}
.ts-form-dot{width:22px;height:22px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:700}
.ts-form-w{background:rgba(73,188,227,.2);color:var(--live)}
.ts-form-d{background:rgba(73,188,227,.15);color:var(--accent)}
.ts-form-l{background:rgba(255,80,80,.15);color:#FF8080}
.ts-form-u{background:#F8FAFC;color:#94A3B8}
.ts-matches{padding:0 16px 12px}
.ts-match-row{display:flex;align-items:center;gap:8px;padding:7px 0;border-bottom:1px solid #E2E8F0;font-size:12px}
.ts-match-row:last-child{border-bottom:none}
.ts-match-opp{flex:1;color:var(--text);display:flex;align-items:center;gap:6px}
.ts-match-score{font-family:'Orbitron',monospace;font-size:14px;letter-spacing:1px;color:#94A3B8}
.ts-match-score.win{color:var(--live)}
.ts-match-score.draw{color:var(--accent)}
.ts-match-score.loss{color:#FF8080}
.ts-match-date{font-size:10px;color:var(--muted2);white-space:nowrap}
.ts-no-matches{padding:16px;font-size:12px;color:#94A3B8;text-align:center;font-style:italic}
.ts-scorers{padding:0 16px 12px}
.ts-scorer-row{display:flex;align-items:center;gap:8px;padding:5px 0;border-bottom:1px solid #E2E8F0;font-size:12px}
.ts-scorer-row:last-child{border-bottom:none}
.ts-scorer-name{flex:1;color:var(--text)}
.ts-scorer-goals{font-family:'Orbitron',monospace;font-size:14px;color:#F59E0B}
.ts-section-label{font-size:9px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#94A3B8;padding:10px 16px 4px}
`;

function getTeamStats(team, matches) {
  const played = matches.filter(m => (m.home === team || m.away === team) && m.status === "finished");
  let w=0,d=0,l=0,gf=0,ga=0;
  played.forEach(m => {
    const isHome = m.home === team;
    const ts = isHome ? m.home_score??0 : m.away_score??0;
    const os = isHome ? m.away_score??0 : m.home_score??0;
    gf += ts; ga += os;
    if (ts > os) w++;
    else if (ts === os) d++;
    else l++;
  });
  const upcoming = matches.filter(m => (m.home === team || m.away === team) && m.status === "upcoming");

  // Top scorers from events
  const scorers = {};
  played.forEach(m => {
    (m.events||[]).filter(e=>e.type==="goal"&&e.team===team&&e.extra!=="o.g.").forEach(e=>{
      scorers[e.player] = (scorers[e.player]||0)+1;
    });
  });
  const topScorers = Object.entries(scorers).sort((a,b)=>b[1]-a[1]).slice(0,5);

  return { played, upcoming, w, d, l, gf, ga, pts: w*3+d, topScorers };
}

function FormDot({ result }) {
  const cls = result === "W" ? "ts-form-w" : result === "D" ? "ts-form-d" : result === "L" ? "ts-form-l" : "ts-form-u";
  return <div className={`ts-form-dot ${cls}`}>{result || "?"}</div>;
}

function TeamCard({ team, group, matches }) {
  const stats = getTeamStats(team, matches);

  const form = stats.played.slice(-5).map(m => {
    const isHome = m.home === team;
    const ts = isHome ? m.home_score??0 : m.away_score??0;
    const os = isHome ? m.away_score??0 : m.home_score??0;
    return ts > os ? "W" : ts === os ? "D" : "L";
  });

  return (
    <div className="ts-card">
      <div className="ts-head">
        <span className="ts-flag">{FLAGS[team]||"🏳️"}</span>
        <div>
          <div className="ts-name">{team}</div>
          <div className="ts-group">Group {group}</div>
        </div>
      </div>

      {/* Stats row */}
      <div className="ts-stats">
        {[
          {n:stats.played.length,l:"Played"},
          {n:stats.w,l:"Won"},
          {n:stats.gf,l:"Goals for"},
          {n:stats.pts,l:"Points"},
        ].map(s=>(
          <div key={s.l} className="ts-stat">
            <div className="ts-stat-num">{s.n}</div>
            <div className="ts-stat-label">{s.l}</div>
          </div>
        ))}
      </div>

      {/* Form */}
      {form.length > 0 && (
        <div className="ts-form">
          <span className="ts-form-label">Form</span>
          {[...Array(5)].map((_,i)=><FormDot key={i} result={form[i]}/>)}
        </div>
      )}

      {/* Matches */}
      {stats.played.length > 0 && (
        <>
          <div className="ts-section-label">Results</div>
          <div className="ts-matches">
            {stats.played.map(m => {
              const isHome = m.home === team;
              const opp = isHome ? m.away : m.home;
              const ts = isHome ? m.home_score??0 : m.away_score??0;
              const os = isHome ? m.away_score??0 : m.home_score??0;
              const res = ts > os ? "win" : ts === os ? "draw" : "loss";
              return (
                <div key={m.id} className="ts-match-row">
                  <div className="ts-match-opp">
                    <span>{FLAGS[opp]||"🏳️"}</span>
                    <span>{opp}</span>
                  </div>
                  <span className={`ts-match-score ${res}`}>{isHome?`${ts}–${os}`:`${os}–${ts}`}</span>
                  <span className="ts-match-date">{fmtDate(m.kickoff)}</span>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* Upcoming */}
      {stats.upcoming.length > 0 && (
        <>
          <div className="ts-section-label">Upcoming</div>
          <div className="ts-matches">
            {stats.upcoming.slice(0,3).map(m => {
              const opp = m.home === team ? m.away : m.home;
              return (
                <div key={m.id} className="ts-match-row">
                  <div className="ts-match-opp">
                    <span>{FLAGS[opp]||"🏳️"}</span>
                    <span>{opp}</span>
                  </div>
                  <span className="ts-match-date">{fmtDate(m.kickoff)} {fmtTime(m.kickoff)}</span>
                </div>
              );
            })}
          </div>
        </>
      )}

      {stats.played.length === 0 && stats.upcoming.length === 0 && (
        <div className="ts-no-matches">No matches yet</div>
      )}

      {/* Top scorers */}
      {stats.topScorers.length > 0 && (
        <>
          <div className="ts-section-label">⚽ Top Scorers</div>
          <div className="ts-scorers">
            {stats.topScorers.map(([name, goals]) => (
              <div key={name} className="ts-scorer-row">
                <span className="ts-scorer-name">{name}</span>
                <span className="ts-scorer-goals">{goals} ⚽</span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

const GROUPS_STATIC = {
  A: ["Mexico", "South Africa", "South Korea", "Czechia"],
  B: ["Canada", "Bosnia-Herzegovina", "Qatar", "Switzerland"],
  C: ["Brazil", "Morocco", "Haiti", "Scotland"],
  D: ["USA", "Paraguay", "Australia", "Türkiye"],
  E: ["Germany", "Curaçao", "Ivory Coast", "Ecuador"],
  F: ["Netherlands", "Japan", "Sweden", "Tunisia"],
  G: ["Belgium", "Egypt", "Iran", "New Zealand"],
  H: ["Spain", "Cape Verde", "Saudi Arabia", "Uruguay"],
  I: ["France", "Senegal", "Iraq", "Norway"],
  J: ["Argentina", "Algeria", "Austria", "Jordan"],
  K: ["Portugal", "DR Congo", "Uzbekistan", "Colombia"],
  L: ["England", "Croatia", "Ghana", "Panama"],
};

export default function TeamStats({ matches, favTeams }) {
  const allTeams = Object.entries(GROUPS_STATIC).flatMap(([g,ts])=>ts.map(t=>({name:t,group:g})));
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");

  let shown = allTeams;
  if (filter === "favs") shown = shown.filter(t => favTeams.includes(t.name));
  if (search) shown = shown.filter(t => t.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <>
      <style>{TS}</style>
      <div style={{display:"flex",gap:"8px",marginBottom:"16px",flexWrap:"wrap",alignItems:"center"}}>
        <button className={`fbtn ${filter==="all"?"on":""}`} onClick={()=>setFilter("all")}>All teams</button>
        {favTeams.length>0 && <button className={`fbtn ${filter==="favs"?"on":""}`} onClick={()=>setFilter("favs")}>⭐ Favourites</button>}
        <div className="swrap">
          <span className="sico">🔍</span>
          <input className="sinp" placeholder="Search team…" value={search} onChange={e=>setSearch(e.target.value)}/>
        </div>
      </div>
      <div className="ts-grid">
        {shown.map(t => <TeamCard key={t.name} team={t.name} group={t.group} matches={matches}/>)}
      </div>
      {shown.length === 0 && (
        <div className="empty"><div className="eico">🔍</div><div>No teams found.</div></div>
      )}
    </>
  );
}
