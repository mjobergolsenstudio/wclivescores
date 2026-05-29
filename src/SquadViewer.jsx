// src/SquadViewer.jsx
// Fetches squad data from /api/squads (Wikipedia, cached 6h)
// Falls back to static data if API not available yet

import { useState, useEffect } from "react";

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

const GROUPS = {
  A:["Mexico","South Africa","South Korea","Czechia"],
  B:["Canada","Bosnia-Herzegovina","Qatar","Switzerland"],
  C:["Brazil","Morocco","Haiti","Scotland"],
  D:["USA","Paraguay","Australia","Türkiye"],
  E:["Germany","Curaçao","Ivory Coast","Ecuador"],
  F:["Netherlands","Japan","Sweden","Tunisia"],
  G:["Belgium","Egypt","Iran","New Zealand"],
  H:["Spain","Cape Verde","Saudi Arabia","Uruguay"],
  I:["France","Senegal","Iraq","Norway"],
  J:["Argentina","Algeria","Austria","Jordan"],
  K:["Portugal","DR Congo","Uzbekistan","Colombia"],
  L:["England","Croatia","Ghana","Panama"],
};

const ALL_TEAMS = Object.values(GROUPS).flat();

// Group lookup
const TEAM_GROUP = {};
Object.entries(GROUPS).forEach(([g,teams]) => teams.forEach(t => TEAM_GROUP[t]=g));

const TEAM_COLORS = {
  France:{home:"#1E3A8A",text:"#fff"},
  Norway:{home:"#DC2626",text:"#fff"},
  Argentina:{home:"#60A5FA",text:"#000"},
  England:{home:"#f9f9f9",text:"#000"},
  Brazil:{home:"#FBBF24",text:"#000"},
  Germany:{home:"#f9f9f9",text:"#000"},
  Scotland:{home:"#1E40AF",text:"#fff"},
  Spain:{home:"#DC2626",text:"#fff"},
  Portugal:{home:"#DC2626",text:"#fff"},
  Netherlands:{home:"#F97316",text:"#000"},
  Belgium:{home:"#DC2626",text:"#000"},
  Japan:{home:"#1E3A8A",text:"#fff"},
  USA:{home:"#1E3A8A",text:"#fff"},
  Mexico:{home:"#16A34A",text:"#fff"},
  default:{home:"#1E40AF",text:"#fff"},
};

const POS_COLORS = { GK:"#FBBF24", DEF:"#3B82F6", MID:"#10B981", FWD:"#EF4444" };
const POS_ORDER = ["GK","DEF","MID","FWD"];
const POS_LABELS = { GK:"Goalkeepers", DEF:"Defenders", MID:"Midfielders", FWD:"Forwards" };

// Known star players
const STARS = {
  France:["Kylian Mbappé","Mbappé"],
  Norway:["Erling Haaland","Haaland","Martin Ødegaard","Ødegaard"],
  Argentina:["Lionel Messi","Messi","Julián Álvarez"],
  England:["Harry Kane","Kane","Jude Bellingham","Bellingham","Bukayo Saka"],
  Brazil:["Vinícius Jr","Vinícius","Raphinha"],
  Germany:["Florian Wirtz","Wirtz","Jamal Musiala","Musiala"],
  Scotland:["Scott McTominay","McTominay","Andy Robertson","Robertson"],
  Spain:["Lamine Yamal","Yamal","Pedri"],
  Portugal:["Cristiano Ronaldo","Ronaldo","Bernardo Silva"],
  Netherlands:["Virgil van Dijk","Van Dijk","Cody Gakpo"],
};

function isStar(playerName, team) {
  const stars = STARS[team] || [];
  return stars.some(s => playerName.includes(s) || s.includes(playerName.split(" ").pop()));
}

export default function SquadViewer() {
  const [squads, setSquads] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTeam, setSelectedTeam] = useState("Norway");
  const [view, setView] = useState("list");
  const [search, setSearch] = useState("");
  const [updatedAt, setUpdatedAt] = useState(null);
  const [groupFilter, setGroupFilter] = useState("all");

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/squads");
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (data.squads && Object.keys(data.squads).length > 0) {
          setSquads(data.squads);
          setUpdatedAt(data.updatedAt);
          // Pick first team with players confirmed
          const first = Object.entries(data.squads).find(([,s])=>s.confirmed&&s.players.length>0);
          if (first) setSelectedTeam(first[0]);
        } else {
          throw new Error("No squad data yet");
        }
      } catch (err) {
        setError("Squads not yet confirmed — official announcement June 2, 2026");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const team = squads[selectedTeam];
  const colors = TEAM_COLORS[selectedTeam] || TEAM_COLORS.default;

  const byPos = {};
  if (team?.players) {
    team.players.forEach(p => {
      if (!byPos[p.pos]) byPos[p.pos] = [];
      byPos[p.pos].push(p);
    });
  }

  // Filter teams by group and search
  const filteredTeams = ALL_TEAMS.filter(t => {
    if (groupFilter !== "all" && TEAM_GROUP[t] !== groupFilter) return false;
    if (search && !t.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const confirmedCount = Object.values(squads).filter(s=>s.confirmed&&s.players.length>0).length;

  return (
    <div style={{ background:"#060A14", minHeight:"100vh", fontFamily:"'DM Sans',system-ui,sans-serif", color:"#E8EDF5" }}>

      {/* HEADER */}
      <div style={{ background:"#0D1525", borderBottom:"1px solid rgba(255,255,255,.07)", padding:"16px 20px" }}>
        <div style={{ maxWidth:900, margin:"0 auto" }}>
          <div style={{ fontSize:11, fontWeight:700, letterSpacing:3, textTransform:"uppercase", color:"#00E5FF", marginBottom:6 }}>
            FIFA WORLD CUP 2026 · SQUADS
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:12, flexWrap:"wrap" }}>
            <div style={{ fontSize:20, fontWeight:700, color:"#fff" }}>Official Squad Viewer</div>
            {!loading && (
              <div style={{ fontSize:12, color:"#6B7FA3" }}>
                {confirmedCount > 0
                  ? `${confirmedCount}/48 squads confirmed`
                  : "Squads announced June 2"}
              </div>
            )}
            {updatedAt && (
              <div style={{ fontSize:11, color:"#4A5E80", marginLeft:"auto" }}>
                Updated: {new Date(updatedAt).toLocaleString(undefined,{day:"numeric",month:"short",hour:"2-digit",minute:"2-digit"})}
              </div>
            )}
          </div>
        </div>
      </div>

      <div style={{ maxWidth:900, margin:"0 auto", padding:"20px 16px" }}>

        {/* STATUS BAR */}
        {!loading && error && (
          <div style={{ background:"rgba(255,200,0,.06)", border:"1px solid rgba(255,200,0,.2)", borderRadius:10, padding:"12px 16px", marginBottom:16, fontSize:13, color:"#FFD700", display:"flex", alignItems:"center", gap:8 }}>
            ⏳ {error}
          </div>
        )}

        {loading && (
          <div style={{ background:"#0D1525", borderRadius:16, padding:40, textAlign:"center" }}>
            <div style={{ fontSize:24, marginBottom:8 }}>⚽</div>
            <div style={{ fontSize:14, color:"#6B7FA3" }}>Loading squads from Wikipedia...</div>
          </div>
        )}

        {!loading && (
          <>
            {/* FILTERS */}
            <div style={{ display:"flex", gap:8, marginBottom:16, flexWrap:"wrap", alignItems:"center" }}>
              <button onClick={()=>setGroupFilter("all")} style={{ padding:"6px 14px", borderRadius:20, border:groupFilter==="all"?"1px solid #00E5FF":"1px solid rgba(255,255,255,.1)", background:groupFilter==="all"?"rgba(73,188,227,.12)":"transparent", color:groupFilter==="all"?"#00E5FF":"#6B7FA3", cursor:"pointer", fontSize:12, fontWeight:500, fontFamily:"inherit" }}>
                All Groups
              </button>
              {"ABCDEFGHIJKL".split("").map(g => (
                <button key={g} onClick={()=>setGroupFilter(g)} style={{ padding:"6px 12px", borderRadius:20, border:groupFilter===g?"1px solid #00E5FF":"1px solid rgba(255,255,255,.1)", background:groupFilter===g?"rgba(73,188,227,.12)":"transparent", color:groupFilter===g?"#00E5FF":"#6B7FA3", cursor:"pointer", fontSize:12, fontFamily:"inherit" }}>
                  Grp {g}
                </button>
              ))}
              <div style={{ marginLeft:"auto", position:"relative" }}>
                <span style={{ position:"absolute", left:11, top:"50%", transform:"translateY(-50%)", color:"#6B7FA3", fontSize:13, pointerEvents:"none" }}>🔍</span>
                <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search team..." style={{ background:"#0D1525", border:"1px solid rgba(255,255,255,.1)", borderRadius:20, padding:"7px 14px 7px 34px", color:"#E8EDF5", fontFamily:"inherit", fontSize:12, width:160, outline:"none" }}/>
              </div>
            </div>

            {/* TEAM GRID */}
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(130px,1fr))", gap:8, marginBottom:20 }}>
              {filteredTeams.map(name => {
                const s = squads[name];
                const isSelected = selectedTeam === name;
                const hasPlayers = s?.confirmed && s?.players?.length > 0;
                return (
                  <button key={name} onClick={()=>setSelectedTeam(name)} style={{
                    background: isSelected ? "rgba(73,188,227,.12)" : "#0D1525",
                    border: isSelected ? "2px solid #00E5FF" : "1px solid rgba(255,255,255,.07)",
                    borderRadius:12, padding:"10px 8px", cursor:"pointer",
                    display:"flex", flexDirection:"column", alignItems:"center", gap:4,
                    transition:"all .15s", fontFamily:"inherit",
                  }}>
                    <span style={{ fontSize:24 }}>{FLAGS[name]||"🏳️"}</span>
                    <span style={{ fontSize:11, fontWeight:600, color:isSelected?"#00E5FF":"#E8EDF5", textAlign:"center", lineHeight:1.2 }}>{name}</span>
                    <span style={{ fontSize:9, color:hasPlayers?"#00FF88":"#4A5E80", fontWeight:600 }}>
                      {hasPlayers ? `${s.players.length} players ✓` : "TBC Jun 2"}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* SELECTED TEAM DETAIL */}
            {team && (
              <>
                {/* Team header */}
                <div style={{ background:"#0D1525", border:"1px solid rgba(255,255,255,.07)", borderRadius:16, padding:"16px 20px", marginBottom:16, display:"flex", alignItems:"center", gap:16, flexWrap:"wrap" }}>
                  <div style={{ fontSize:48, lineHeight:1 }}>{FLAGS[selectedTeam]||"🏳️"}</div>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:22, fontWeight:700, color:"#fff" }}>{selectedTeam}</div>
                    <div style={{ fontSize:13, color:"#6B7FA3", marginTop:3 }}>
                      Group {TEAM_GROUP[selectedTeam]}
                      {team.coach && team.coach !== "Unknown" && ` · Coach: ${team.coach}`}
                      {team.formation && ` · ${team.formation}`}
                    </div>
                  </div>
                  <div style={{ display:"flex", gap:6 }}>
                    {["list","pitch"].map(v=>(
                      <button key={v} onClick={()=>setView(v)} style={{ padding:"7px 14px", borderRadius:20, border:"1px solid rgba(255,255,255,.1)", background:view===v?"#00E5FF":"transparent", color:view===v?"#000":"#6B7FA3", fontFamily:"inherit", fontSize:12, fontWeight:600, cursor:"pointer" }}>
                        {v==="list"?"📋 List":"⚽ Pitch"}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Not confirmed yet */}
                {!team.confirmed || team.players.length === 0 ? (
                  <div style={{ background:"#0D1525", border:"1px solid rgba(255,255,255,.07)", borderRadius:16, padding:40, textAlign:"center" }}>
                    <div style={{ fontSize:32, marginBottom:12 }}>⏳</div>
                    <div style={{ fontSize:15, fontWeight:600, color:"#fff", marginBottom:6 }}>{selectedTeam} squad not yet announced</div>
                    <div style={{ fontSize:13, color:"#6B7FA3" }}>All 48 squads confirmed by FIFA on June 2, 2026</div>
                  </div>
                ) : view === "list" ? (
                  /* LIST VIEW */
                  <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
                    {POS_ORDER.filter(pos=>byPos[pos]).map(pos=>(
                      <div key={pos}>
                        <div style={{ fontSize:11, fontWeight:700, letterSpacing:2, textTransform:"uppercase", color:POS_COLORS[pos], marginBottom:8, display:"flex", alignItems:"center", gap:6 }}>
                          <div style={{ width:8, height:8, borderRadius:"50%", background:POS_COLORS[pos] }}/>
                          {POS_LABELS[pos]} ({byPos[pos].length})
                        </div>
                        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(220px,1fr))", gap:8 }}>
                          {byPos[pos].map(p=>{
                            const star = isStar(p.name, selectedTeam);
                            return (
                              <div key={p.name} style={{ background:star?"rgba(244,197,66,.04)":"#0D1525", border:star?"1px solid rgba(244,197,66,.25)":"1px solid rgba(255,255,255,.07)", borderRadius:10, padding:"10px 14px", display:"flex", alignItems:"center", gap:10 }}>
                                <div style={{ width:34, height:34, borderRadius:"50%", background:colors.home, display:"flex", alignItems:"center", justifyContent:"center", fontSize:12, fontWeight:700, color:colors.text, border:star?"2px solid #FFD700":"1px solid rgba(255,255,255,.2)", flexShrink:0 }}>
                                  {p.no || "?"}
                                </div>
                                <div style={{ flex:1, minWidth:0 }}>
                                  <div style={{ fontSize:13, fontWeight:600, color:star?"#FFD700":"#fff", display:"flex", alignItems:"center", gap:4, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                                    {p.name}{star&&<span style={{fontSize:10}}>⭐</span>}
                                  </div>
                                  <div style={{ fontSize:11, color:"#6B7FA3", marginTop:1, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                                    {p.club}{p.age?` · Age ${p.age}`:""}{p.caps?` · ${p.caps} caps`:""}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  /* PITCH VIEW */
                  <div style={{ background:"linear-gradient(180deg,#0a3d0a 0%,#0d4a0d 40%,#0d4a0d 60%,#0a3d0a 100%)", borderRadius:16, padding:"28px 16px", position:"relative", minHeight:520, border:"2px solid rgba(255,255,255,.06)" }}>
                    <div style={{ position:"absolute", inset:16, border:"1px solid rgba(255,255,255,.1)", borderRadius:4, pointerEvents:"none" }}/>
                    <div style={{ position:"absolute", left:"50%", top:16, bottom:16, width:1, background:"rgba(255,255,255,.08)", transform:"translateX(-50%)", pointerEvents:"none" }}/>
                    <div style={{ position:"absolute", left:"50%", top:"50%", width:80, height:80, borderRadius:"50%", border:"1px solid rgba(255,255,255,.08)", transform:"translate(-50%,-50%)", pointerEvents:"none" }}/>

                    {POS_ORDER.filter(pos=>byPos[pos]).map((pos, rowIdx, arr)=>{
                      const rowPlayers = byPos[pos].slice(0,6);
                      const topPct = 6 + (rowIdx / (arr.length-1)) * 88;
                      return (
                        <div key={pos} style={{ position:"absolute", left:0, right:0, top:`${topPct}%`, display:"flex", justifyContent:"space-around", padding:"0 24px" }}>
                          {rowPlayers.map((p,i)=>{
                            const star = isStar(p.name, selectedTeam);
                            return (
                              <div key={i} style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:3, minWidth:56 }} title={`${p.name} · ${p.club}`}>
                                <div style={{ width:star?42:36, height:star?42:36, borderRadius:"50%", background:colors.home, border:star?"3px solid #FFD700":"2px solid rgba(255,255,255,.25)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, fontWeight:700, color:colors.text, boxShadow:star?"0 0 12px rgba(244,197,66,.4)":"0 2px 6px rgba(0,0,0,.4)", position:"relative" }}>
                                  {p.no||"?"}
                                  {star&&<div style={{ position:"absolute", top:-6, right:-4, fontSize:10 }}>⭐</div>}
                                </div>
                                <div style={{ fontSize:9, fontWeight:600, color:"#fff", textAlign:"center", maxWidth:58, textShadow:"0 1px 3px rgba(0,0,0,.8)", background:"rgba(0,0,0,.5)", borderRadius:5, padding:"1px 4px", lineHeight:1.2, overflow:"hidden", whiteSpace:"nowrap", textOverflow:"ellipsis" }}>
                                  {p.name.split(" ").pop()}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      );
                    })}

                    <div style={{ position:"absolute", bottom:8, left:"50%", transform:"translateX(-50%)", fontSize:10, color:"rgba(255,255,255,.25)", letterSpacing:2, fontWeight:600 }}>
                      {team.formation || "SQUAD"}
                    </div>
                  </div>
                )}

                {/* Stats */}
                {team.players.length > 0 && (
                  <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(120px,1fr))", gap:10, marginTop:16 }}>
                    {[
                      { l:"Players", v:team.players.length },
                      { l:"⭐ Stars", v:team.players.filter(p=>isStar(p.name,selectedTeam)).length, c:"#FFD700" },
                      { l:"Avg age", v:team.players.filter(p=>p.age).length > 0 ? Math.round(team.players.filter(p=>p.age).reduce((s,p)=>s+p.age,0)/team.players.filter(p=>p.age).length) : "—" },
                      { l:"Group", v:`Group ${TEAM_GROUP[selectedTeam]}`, c:"#00E5FF" },
                    ].map(s=>(
                      <div key={s.l} style={{ background:"#0D1525", border:"1px solid rgba(255,255,255,.07)", borderRadius:12, padding:"12px 14px", textAlign:"center" }}>
                        <div style={{ fontSize:20, fontWeight:700, color:s.c||"#fff" }}>{s.v}</div>
                        <div style={{ fontSize:10, fontWeight:600, letterSpacing:1, textTransform:"uppercase", color:"#6B7FA3", marginTop:3 }}>{s.l}</div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}

            <div style={{ marginTop:16, fontSize:12, color:"#4A5E80", textAlign:"center" }}>
              ⭐ Star players &nbsp;·&nbsp; Data from Wikipedia, updates automatically &nbsp;·&nbsp;
              Official squads confirmed by FIFA June 2, 2026
            </div>
          </>
        )}
      </div>
    </div>
  );
}
