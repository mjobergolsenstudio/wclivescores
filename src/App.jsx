// src/App.jsx
// World Cup 2026 Livescore App
// - Fetches real data from /api/matches (Vercel serverless, cached)
// - Falls back to simulated data before June 11 2026
// - All times in user's local timezone
// - Full English, global audience

import { useState, useEffect, useCallback } from "react";

// ─── STATIC DATA (fallback + flags) ──────────────────────────────────────────
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

const PLAYER_NAMES = {
  Mexico:["H. Lozano","R. Jiménez","A. Guardado","E. Álvarez"],
  "South Africa":["P. Nodada","L. Mothiba","T. Dolly","S. Tau"],
  "South Korea":["H. Son","J. Hwang","K. Lee","C. Lee"],
  Czechia:["P. Schick","L. Provod","M. Kuchta","A. Hlozek"],
  Canada:["A. Davies","J. David","C. Buchanan","S. Eustaquio"],
  "Bosnia-Herzegovina":["E. Džeko","E. Demirović","M. Pjanić","S. Kolašinac"],
  Qatar:["A. Afif","H. Al-Haydos","A. Hatem","B. Khoukhi"],
  Switzerland:["G. Xhaka","B. Embolo","X. Shaqiri","N. Akanji"],
  Brazil:["V. Jr","G. Jesus","L. Paquetá","M. Guimarães"],
  Morocco:["H. Ziyech","Y. En-Nesyri","A. Ounahi","R. Hakimi"],
  Haiti:["N. Geffrard","K. Antoine","J. St-Fleur","D. Chery"],
  Scotland:["A. Robertson","J. McGinn","L. Ferguson","C. McGregor"],
  USA:["C. Pulisic","W. Reyna","T. Adams","J. Sargent"],
  Paraguay:["M. Almirón","J. Sanabria","R. Rojas","G. Gómez"],
  Australia:["M. Leckie","A. Hrustic","J. Irvine","M. Duke"],
  "Türkiye":["H. Çalhanoğlu","B. Yıldız","Z. Güler","M. Demiral"],
  Germany:["K. Havertz","J. Musiala","L. Wirtz","I. Gündoğan"],
  "Curaçao":["L. Fer","Q. Promes","R. Boadu","G. van Aanholt"],
  "Ivory Coast":["W. Zaha","S. Haller","F. Koné","I. Sangaré"],
  Ecuador:["E. Valencia","M. Caicedo","G. Plata","J. Sarmiento"],
  Netherlands:["V. van Dijk","C. Gakpo","M. Depay","S. de Jong"],
  Japan:["D. Ito","H. Kubo","S. Mitoma","T. Endo"],
  Sweden:["V. Gyökeres","D. Kulusevski","E. Forsberg","A. Isak"],
  Tunisia:["Y. Msakni","H. Laïdouni","A. Abdi","E. Jaziri"],
  Belgium:["R. Lukaku","K. De Bruyne","T. Hazard","A. Tielemans"],
  Egypt:["M. Salah","T. Mohamed","O. Kamal","R. Hamdi"],
  Iran:["M. Taremi","S. Azmoun","A. Jahanbakhsh","V. Amiri"],
  "New Zealand":["C. Wood","W. Grigg","R. De Vries","T. Smith"],
  Spain:["A. Morata","P. Gavi","P. Pedri","L. Yamal"],
  "Cape Verde":["R. Tavares","Z. Andrade","M. Andrade","D. Lopes"],
  "Saudi Arabia":["S. Al-Dawsari","M. Al-Burayk","Y. Al-Shahrani","F. Al-Ghannam"],
  Uruguay:["L. Suárez","D. Núñez","F. Valverde","R. Araújo"],
  France:["K. Mbappé","A. Griezmann","O. Dembélé","A. Tchouaméni"],
  Senegal:["S. Mané","I. Sarr","K. Coulibaly","P. Gueye"],
  Iraq:["A. Hussein","A. Fadhel","B. Hassan","M. Karrar"],
  Norway:["E. Haaland","M. Ødegaard","A. Sörloth","S. Berge"],
  Argentina:["L. Messi","J. Álvarez","Á. Di María","R. De Paul"],
  Algeria:["R. Mahrez","I. Bennacer","B. Bounedjah","Y. Atal"],
  Austria:["D. Alaba","M. Arnautović","C. Baumgartner","K. Laimer"],
  Jordan:["M. Al-Deandeh","A. Obeidat","H. Al-Bawab","A. Al-Smeran"],
  Portugal:["C. Ronaldo","B. Fernandes","R. Leão","D. Jota"],
  "DR Congo":["S. Kakuta","Y. Bolasie","M. Bongonda","A. Mbemba"],
  Uzbekistan:["E. Shomurodov","O. Zhamaletdinov","J. Khamdamov","A. Turayev"],
  Colombia:["L. Díaz","J. Lerma","R. Falcao","J. Cuadrado"],
  England:["H. Kane","B. Saka","J. Bellingham","P. Foden"],
  Croatia:["L. Modrić","I. Perišić","M. Brozović","A. Kramarić"],
  Ghana:["T. Partey","M. Kudus","J. Ayew","A. Ayew"],
  Panama:["R. Torres","A. Murillo","J. Davis","E. Fajardo"],
};

const VENUES = [
  "Estadio Azteca","SoFi Stadium","MetLife Stadium","AT&T Stadium",
  "Hard Rock Stadium","Mercedes-Benz Stadium","Arrowhead Stadium",
  "Levi's Stadium","Estadio BBVA","BMO Field","BC Place",
  "Gillette Stadium","Lincoln Financial Field","NRG Stadium",
  "Estadio Akron","Estadio Guadalajara",
];

// ─── SIMULATION (pre-tournament fallback) ─────────────────────────────────────
function seededRand(seed) {
  let s = seed;
  return () => { s = (s * 1664525 + 1013904223) & 0xffffffff; return Math.abs(s) / 0xffffffff; };
}

function genEvents(home, away, hs, as_, seed) {
  const rng = seededRand(seed);
  const events = [];
  const add = (team, count) => {
    const pool = PLAYER_NAMES[team] || ["Player"];
    for (let i = 0; i < count; i++)
      events.push({ type:"goal", team, minute: Math.floor(rng()*90)+1,
        player: pool[Math.floor(rng()*pool.length)],
        extra: rng()<0.12?"pen.":rng()<0.08?"o.g.":"" });
  };
  const card = (team, y, r) => {
    const pool = PLAYER_NAMES[team] || ["Player"];
    for (let i=0;i<y;i++) events.push({type:"yellow",team,minute:Math.floor(rng()*88)+1,player:pool[Math.floor(rng()*pool.length)],extra:""});
    for (let i=0;i<r;i++) events.push({type:"red",team,minute:Math.floor(rng()*60)+30,player:pool[Math.floor(rng()*pool.length)],extra:""});
  };
  add(home,hs); add(away,as_);
  card(home,Math.floor(rng()*3),rng()<0.05?1:0);
  card(away,Math.floor(rng()*3),rng()<0.05?1:0);
  return events.sort((a,b)=>a.minute-b.minute);
}

function generateSimulatedMatches() {
  const start = new Date("2026-06-11T19:00:00Z");
  let matches=[], id=1;
  Object.entries(GROUPS_STATIC).forEach(([group,teams],gi)=>{
    const pairs=[];
    for(let a=0;a<teams.length;a++) for(let b=a+1;b<teams.length;b++) pairs.push([teams[a],teams[b]]);
    pairs.forEach((pair,pi)=>{
      const kickoff=new Date(start.getTime()+(gi*6+pi)*3*3600*1000);
      const diff=Date.now()-kickoff.getTime();
      const seed=gi*1000+pi*37+pair[0].charCodeAt(0);
      const rng=seededRand(seed);
      let status="upcoming",minute=null,home_score=0,away_score=0;
      if(diff>0&&diff<95*60*1000){status="live";minute=Math.min(90,Math.floor(diff/60000));home_score=Math.floor(rng()*4);away_score=Math.floor(rng()*3);}
      else if(diff>=95*60*1000){status="finished";home_score=Math.floor(rng()*5);away_score=Math.floor(rng()*4);}
      matches.push({id:id++,group,home:pair[0],away:pair[1],home_score,away_score,status,minute,kickoff:kickoff.toISOString(),
        events:status!=="upcoming"?genEvents(pair[0],pair[1],home_score,away_score,seed+7):[],
        venue:VENUES[(id+gi*3)%VENUES.length],simulated:true});
    });
  });
  return matches.sort((a,b)=>{const o={live:0,upcoming:1,finished:2};return o[a.status]!==o[b.status]?o[a.status]-o[b.status]:new Date(a.kickoff)-new Date(b.kickoff);});
}

// ─── TABLE BUILDER ────────────────────────────────────────────────────────────
function buildTable(group, matches) {
  const table = {};
  (GROUPS_STATIC[group] || []).forEach(t => table[t]={p:0,w:0,d:0,l:0,gf:0,ga:0,pts:0});
  matches.filter(m=>m.group===group&&m.status!=="upcoming").forEach(m=>{
    if(!table[m.home]) table[m.home]={p:0,w:0,d:0,l:0,gf:0,ga:0,pts:0};
    if(!table[m.away]) table[m.away]={p:0,w:0,d:0,l:0,gf:0,ga:0,pts:0};
    const h=m.home,a=m.away,hs=m.home_score??0,as_=m.away_score??0;
    table[h].p++;table[a].p++;table[h].gf+=hs;table[h].ga+=as_;table[a].gf+=as_;table[a].ga+=hs;
    if(hs>as_){table[h].w++;table[h].pts+=3;table[a].l++;}
    else if(hs<as_){table[a].w++;table[a].pts+=3;table[h].l++;}
    else{table[h].d++;table[h].pts++;table[a].d++;table[a].pts++;}
  });
  return Object.entries(table).map(([name,s])=>({name,...s,gd:s.gf-s.ga}))
    .sort((a,b)=>b.pts-a.pts||b.gd-a.gd||b.gf-a.gf);
}

// ─── TIME UTILS ───────────────────────────────────────────────────────────────
function fmtDate(iso) {
  return new Date(iso).toLocaleDateString(undefined,{day:"numeric",month:"short"});
}
function fmtTime(iso) {
  return new Date(iso).toLocaleTimeString(undefined,{hour:"2-digit",minute:"2-digit"});
}
function getTzLabel() {
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone.split("/").pop().replace(/_/g," ");
  const abbr = new Date().toLocaleTimeString(undefined,{timeZoneName:"short"}).split(" ").pop();
  return `${tz} (${abbr})`;
}
function getNowStr() {
  return new Date().toLocaleTimeString(undefined,{hour:"2-digit",minute:"2-digit",timeZoneName:"short"});
}

// ─── STYLES ──────────────────────────────────────────────────────────────────
const S = `
@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@300;400;500;600&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
:root{
  --bg:#060A14;--s1:#0D1525;--s2:#111C30;--s3:#162038;
  --border:rgba(255,255,255,.07);--accent:#00E5FF;--live:#00FF88;
  --text:#E8EDF5;--muted:#6B7FA3;--muted2:#4A5E80;
  --fd:'Bebas Neue',sans-serif;--fb:'DM Sans',sans-serif;
}
body{background:var(--bg);color:var(--text);font-family:var(--fb);min-height:100vh;overflow-x:hidden}
.app{max-width:1140px;margin:0 auto;padding:0 16px 100px}

/* HEADER */
.hdr{position:relative;padding:32px 0 24px;text-align:center}
.hdr::before{content:'';position:absolute;top:-80px;left:50%;transform:translateX(-50%);width:700px;height:350px;background:radial-gradient(ellipse,rgba(0,229,255,.11) 0%,transparent 70%);pointer-events:none}
.ey{font-size:11px;font-weight:600;letter-spacing:4px;text-transform:uppercase;color:var(--accent);margin-bottom:8px}
.ht{font-family:var(--fd);font-size:clamp(52px,10vw,100px);line-height:.9;background:linear-gradient(135deg,#fff 0%,var(--accent) 55%,#007AFF 100%);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
.hs{color:var(--muted);font-size:13px;margin-top:10px;letter-spacing:1px}
.livebadge{display:inline-flex;align-items:center;gap:6px;background:rgba(0,255,136,.1);border:1px solid rgba(0,255,136,.3);border-radius:20px;padding:4px 12px;font-size:11px;font-weight:600;color:var(--live);letter-spacing:2px;text-transform:uppercase;margin-top:12px}
.ldot{width:7px;height:7px;background:var(--live);border-radius:50%;animation:pulse 1.4s infinite}
@keyframes pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.4;transform:scale(.7)}}

/* TABS */
.tabs{display:flex;gap:4px;background:var(--s1);border:1px solid var(--border);border-radius:14px;padding:4px;margin:24px 0 20px;overflow-x:auto;scrollbar-width:none}
.tabs::-webkit-scrollbar{display:none}
.tab{flex:none;padding:9px 18px;border-radius:10px;border:none;background:transparent;color:var(--muted);font-family:var(--fb);font-size:13px;font-weight:500;cursor:pointer;transition:all .2s;white-space:nowrap}
.tab:hover{color:var(--text);background:var(--s2)}
.tab.on{background:var(--accent);color:#000;font-weight:600}

/* FILTERS */
.filters{display:flex;gap:8px;margin-bottom:16px;flex-wrap:wrap;align-items:center}
.fbtn{padding:6px 14px;border-radius:20px;border:1px solid var(--border);background:transparent;color:var(--muted);font-family:var(--fb);font-size:12px;font-weight:500;cursor:pointer;transition:all .18s}
.fbtn:hover{border-color:var(--accent);color:var(--text)}
.fbtn.on{background:rgba(0,229,255,.12);border-color:var(--accent);color:var(--accent)}
.swrap{margin-left:auto;position:relative}
.sinp{background:var(--s1);border:1px solid var(--border);border-radius:20px;padding:7px 14px 7px 34px;color:var(--text);font-family:var(--fb);font-size:12px;width:180px;outline:none;transition:border-color .2s}
.sinp:focus{border-color:var(--accent)}
.sico{position:absolute;left:11px;top:50%;transform:translateY(-50%);color:var(--muted);font-size:13px;pointer-events:none}

/* SECTION LABEL */
.sl{font-family:var(--fd);font-size:13px;letter-spacing:3px;color:var(--muted);text-transform:uppercase;margin:24px 0 10px;display:flex;align-items:center;gap:10px}
.sl::after{content:'';flex:1;height:1px;background:var(--border)}

/* INFO BARS */
.tz-bar{display:flex;align-items:center;gap:10px;background:rgba(0,229,255,.06);border:1px solid rgba(0,229,255,.15);border-radius:10px;padding:10px 16px;margin-bottom:12px;font-size:12px;color:var(--muted);flex-wrap:wrap}
.tz-val{color:var(--accent);font-weight:600;margin:0 3px}
.lcbar{display:flex;align-items:center;gap:10px;background:rgba(0,255,136,.06);border:1px solid rgba(0,255,136,.18);border-radius:10px;padding:10px 16px;margin-bottom:12px;font-size:13px}
.lct{color:var(--live);font-weight:600}
.lcs{color:var(--muted);font-size:12px}
.sim-bar{display:flex;align-items:center;gap:8px;background:rgba(255,200,0,.06);border:1px solid rgba(255,200,0,.2);border-radius:10px;padding:10px 16px;margin-bottom:12px;font-size:12px;color:#FFD700}
.err-bar{display:flex;align-items:center;gap:8px;background:rgba(255,80,80,.06);border:1px solid rgba(255,80,80,.2);border-radius:10px;padding:10px 16px;margin-bottom:12px;font-size:12px;color:#FF8080}

/* LOADING SKELETON */
.skeleton{display:flex;flex-direction:column;gap:8px}
.skel-card{background:var(--s1);border:1px solid var(--border);border-radius:16px;height:90px;overflow:hidden;position:relative}
.skel-card::after{content:'';position:absolute;inset:0;background:linear-gradient(90deg,transparent 0%,rgba(255,255,255,.04) 50%,transparent 100%);animation:shimmer 1.5s infinite}
@keyframes shimmer{0%{transform:translateX(-100%)}100%{transform:translateX(100%)}}

/* MATCH CARD */
.mgrid{display:flex;flex-direction:column;gap:8px}
.mc{background:var(--s1);border:1px solid var(--border);border-radius:16px;overflow:hidden;transition:background .2s,border-color .2s}
.mc.live{border-color:rgba(0,255,136,.2);background:linear-gradient(135deg,var(--s1) 0%,rgba(0,255,136,.04) 100%)}
.mc::before{content:'';display:block;height:3px;background:transparent}
.mc.live::before{background:var(--live)}
.mc.finished::before{background:var(--muted2)}
.mc.upcoming::before{background:var(--accent)}
.mc-main{padding:16px 20px 20px;display:grid;grid-template-columns:1fr auto 1fr;align-items:center;gap:12px;position:relative;cursor:pointer}
.mc-main:hover{background:rgba(255,255,255,.02)}
.gtag{position:absolute;top:10px;right:14px;font-size:9px;font-weight:700;letter-spacing:2px;color:var(--muted);text-transform:uppercase}
.favbtn{position:absolute;top:9px;right:52px;background:none;border:none;cursor:pointer;font-size:15px;opacity:.3;transition:opacity .2s,transform .2s;line-height:1}
.favbtn:hover,.favbtn.on{opacity:1;transform:scale(1.2)}
.exp-btn{position:absolute;bottom:5px;left:50%;transform:translateX(-50%);background:none;border:none;cursor:pointer;color:var(--muted);font-size:10px;letter-spacing:1px;font-family:var(--fb);opacity:.55;transition:opacity .2s,color .2s;padding:2px 8px;white-space:nowrap}
.exp-btn:hover{opacity:1;color:var(--accent)}
.team{display:flex;flex-direction:column;gap:4px}
.team.r{align-items:flex-end}
.tflag{font-size:26px;line-height:1}
.tname{font-size:13px;font-weight:600;color:var(--text);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:105px}
.tname.win{color:#fff}
.sb{text-align:center;min-width:86px}
.score{font-family:var(--fd);font-size:40px;line-height:1;color:#fff;letter-spacing:4px}
.sdash{font-family:var(--fd);font-size:26px;color:var(--muted);letter-spacing:6px}
.badge{display:inline-block;padding:3px 8px;border-radius:6px;font-size:10px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;margin-top:5px}
.bl{background:rgba(0,255,136,.15);color:var(--live)}
.bf{background:rgba(107,127,163,.15);color:var(--muted)}
.bu{background:rgba(0,229,255,.12);color:var(--accent)}
.mmeta{font-size:10px;color:var(--muted);margin-top:3px}
.local-t{font-size:11px;color:var(--accent);margin-top:3px;font-weight:500}

/* EVENTS */
.events{border-top:1px solid var(--border);padding:12px 20px 14px;display:flex;flex-direction:column;gap:6px;background:rgba(0,0,0,.15)}
.ev-row{display:flex;align-items:center;gap:10px;font-size:12px}
.ev-min{font-family:var(--fd);font-size:13px;color:var(--muted);min-width:30px;text-align:right;letter-spacing:1px}
.ev-ico{font-size:15px;min-width:20px;text-align:center}
.ev-txt{color:var(--text);flex:1}
.ev-team{font-size:10px;color:var(--muted);margin-left:auto;white-space:nowrap}

/* STANDINGS TABLE */
.tables-wrap{display:grid;grid-template-columns:repeat(auto-fill,minmax(340px,1fr));gap:16px;margin-top:8px}
.group-table{background:var(--s1);border:1px solid var(--border);border-radius:16px;overflow:hidden}
.gt-head{background:var(--s2);padding:12px 16px}
.gt-title{font-family:var(--fd);font-size:18px;letter-spacing:2px;color:var(--accent)}
.gt-sub{font-size:11px;color:var(--muted);margin-top:2px}
.gt-tbl{width:100%;border-collapse:collapse}
.gt-tbl th{font-size:9px;font-weight:700;letter-spacing:2px;color:var(--muted);text-transform:uppercase;padding:8px 12px 6px;text-align:center;border-bottom:1px solid var(--border)}
.gt-tbl th:first-child,.gt-tbl td:first-child{text-align:left;padding-left:16px}
.gt-tbl td{padding:9px 12px;text-align:center;font-size:13px;border-bottom:1px solid rgba(255,255,255,.03)}
.gt-tbl tr:last-child td{border-bottom:none}
.gt-tbl tr.q1 td{background:rgba(0,229,255,.05)}
.gt-tbl tr.q2 td{background:rgba(0,229,255,.02)}
.gt-name{display:flex;align-items:center;gap:8px;font-weight:500;white-space:nowrap}
.gt-flag{font-size:16px}
.gt-pts{font-weight:700;color:#fff}
.pos-b{display:inline-flex;align-items:center;justify-content:center;width:18px;height:18px;border-radius:4px;font-size:10px;font-weight:700;font-family:var(--fd)}
.p1{background:rgba(0,229,255,.2);color:var(--accent)}.p2{background:rgba(0,229,255,.1);color:var(--accent)}
.p3{background:rgba(107,127,163,.15);color:var(--muted)}.p4{color:var(--muted2)}
.gt-legend{display:flex;gap:16px;padding:10px 16px;border-top:1px solid var(--border);font-size:10px;color:var(--muted)}
.gld{display:inline-block;width:8px;height:8px;border-radius:2px;margin-right:4px}
.gld-1{background:rgba(0,229,255,.4)}.gld-2{background:rgba(0,229,255,.2)}

/* TEAMS */
.tgrid{display:grid;grid-template-columns:repeat(auto-fill,minmax(160px,1fr));gap:12px;margin-top:8px}
.tcard{background:var(--s1);border:1px solid var(--border);border-radius:16px;padding:20px 16px;text-align:center;cursor:pointer;transition:all .2s;position:relative}
.tcard:hover{background:var(--s2);border-color:rgba(0,229,255,.3);transform:translateY(-2px)}
.tcard.fav{border-color:rgba(255,215,0,.4);background:rgba(255,215,0,.04)}
.tcflag{font-size:40px;margin-bottom:10px;line-height:1}
.tcname{font-size:13px;font-weight:600}
.tcgroup{font-size:11px;color:var(--muted);margin-top:3px;letter-spacing:1px}
.tcfav{position:absolute;top:10px;right:10px;background:none;border:none;font-size:13px;cursor:pointer;opacity:.3;transition:opacity .2s}
.tcfav:hover,.tcfav.on{opacity:1}

/* EMPTY */
.empty{text-align:center;padding:60px 20px;color:var(--muted)}
.eico{font-size:48px;margin-bottom:12px}

/* REFRESH BTN */
.refresh-btn{background:none;border:1px solid var(--border);border-radius:20px;padding:5px 14px;color:var(--muted);font-family:var(--fb);font-size:12px;cursor:pointer;transition:all .2s;margin-left:auto}
.refresh-btn:hover{border-color:var(--accent);color:var(--accent)}

::-webkit-scrollbar{width:6px}
::-webkit-scrollbar-thumb{background:var(--s3);border-radius:3px}

@media(max-width:640px){
  .tname{font-size:11px;max-width:75px}.score{font-size:28px}.mc-main{padding:12px 14px 18px;gap:6px}
  .tflag{font-size:19px}.tgrid{grid-template-columns:repeat(auto-fill,minmax(130px,1fr))}
  .tables-wrap{grid-template-columns:1fr}.sinp{width:140px}
}
`;

// ─── APP ──────────────────────────────────────────────────────────────────────
const TOURNAMENT_START = new Date("2026-06-11T00:00:00Z");
const isTournamentLive = () => Date.now() >= TOURNAMENT_START.getTime();

export default function App() {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSimulated, setIsSimulated] = useState(false);
  const [tab, setTab] = useState("matches");
  const [sf, setSf] = useState("all");
  const [gf, setGf] = useState("all");
  const [q, setQ] = useState("");
  const [expanded, setExpanded] = useState({});
  const [nowStr, setNowStr] = useState(getNowStr());
  const [fmIds, setFmIds] = useState(() => { try { return JSON.parse(localStorage.getItem("wc_fm")||"[]"); } catch { return []; } });
  const [ftNames, setFtNames] = useState(() => { try { return JSON.parse(localStorage.getItem("wc_ft")||"[]"); } catch { return []; } });
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchMatches = useCallback(async () => {
    // Before tournament: always use simulation
    if (!isTournamentLive()) {
      setMatches(generateSimulatedMatches());
      setIsSimulated(true);
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/matches");
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setMatches(data.matches || []);
      setIsSimulated(false);
      setError(null);
      setLastUpdated(new Date());
    } catch (err) {
      console.error("Failed to fetch live data:", err);
      setError("Could not load live data — showing simulated scores.");
      setMatches(generateSimulatedMatches());
      setIsSimulated(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMatches();
    // Poll every 60s during tournament, every 5min before
    const interval = isTournamentLive() ? 60000 : 5 * 60 * 1000;
    const t = setInterval(fetchMatches, interval);
    const clock = setInterval(() => setNowStr(getNowStr()), 30000);
    return () => { clearInterval(t); clearInterval(clock); };
  }, [fetchMatches]);

  useEffect(() => { try { localStorage.setItem("wc_fm", JSON.stringify(fmIds)); } catch {} }, [fmIds]);
  useEffect(() => { try { localStorage.setItem("wc_ft", JSON.stringify(ftNames)); } catch {} }, [ftNames]);

  const toggleFM = id => setFmIds(p => p.includes(id) ? p.filter(x=>x!==id) : [...p,id]);
  const toggleFT = n  => setFtNames(p => p.includes(n)  ? p.filter(x=>x!==n)  : [...p,n]);
  const toggleExp = id => setExpanded(p => ({...p,[id]:!p[id]}));

  const liveCount = matches.filter(m=>m.status==="live").length;
  const favCount = fmIds.length + ftNames.length;

  // Derive groups from actual match data when available, fall back to static
  const groupKeys = matches.length
    ? [...new Set(matches.map(m=>m.group))].filter(Boolean).sort()
    : Object.keys(GROUPS_STATIC);

  let filtered = matches;
  if (tab==="favorites") filtered=filtered.filter(m=>fmIds.includes(m.id)||ftNames.includes(m.home)||ftNames.includes(m.away));
  if (sf!=="all") filtered=filtered.filter(m=>m.status===sf);
  if (gf!=="all") filtered=filtered.filter(m=>m.group===gf);
  if (q) { const ql=q.toLowerCase(); filtered=filtered.filter(m=>m.home.toLowerCase().includes(ql)||m.away.toLowerCase().includes(ql)||(m.venue||"").toLowerCase().includes(ql)); }

  const allTeams = Object.entries(GROUPS_STATIC).flatMap(([g,ts])=>ts.map(t=>({name:t,group:g})));
  const shownTeams = (tab==="favorites"?allTeams.filter(t=>ftNames.includes(t.name)):allTeams)
    .filter(t=>!q||t.name.toLowerCase().includes(q.toLowerCase()));

  // ── SUB-COMPONENTS ──
  function MatchCard({ m }) {
    const isFav = fmIds.includes(m.id);
    const isExp = expanded[m.id];
    const hw = m.status==="finished" && (m.home_score??0)>(m.away_score??0);
    const aw = m.status==="finished" && (m.away_score??0)>(m.home_score??0);
    const hasEv = m.events && m.events.length>0;
    return (
      <div className={`mc ${m.status}`}>
        <div className="mc-main" onClick={()=>hasEv&&toggleExp(m.id)}>
          <div className="gtag">Group {m.group}</div>
          <button className={`favbtn ${isFav?"on":""}`} onClick={e=>{e.stopPropagation();toggleFM(m.id);}}>{isFav?"⭐":"☆"}</button>
          <div className="team">
            <span className="tflag">{FLAGS[m.home]||"🏳️"}</span>
            <span className={`tname ${hw?"win":""}`}>{m.home}</span>
          </div>
          <div className="sb">
            {m.status==="upcoming" ? (
              <>
                <div className="sdash">vs</div>
                <div className="mmeta">{fmtDate(m.kickoff)}</div>
                <div className="local-t">🕐 {fmtTime(m.kickoff)} local</div>
                <span className="badge bu">Upcoming</span>
              </>
            ) : (
              <>
                <div className="score">{m.home_score??"-"}<span style={{color:"var(--muted)",fontSize:"22px"}}> – </span>{m.away_score??"-"}</div>
                {m.status==="live" && <span className="badge bl">🔴 {m.minute||0}'</span>}
                {m.status==="finished" && <span className="badge bf">Full Time</span>}
                <div className="mmeta">{m.venue}</div>
              </>
            )}
          </div>
          <div className="team r">
            <span className="tflag">{FLAGS[m.away]||"🏳️"}</span>
            <span className={`tname ${aw?"win":""}`}>{m.away}</span>
          </div>
          {hasEv && <button className="exp-btn" onClick={e=>{e.stopPropagation();toggleExp(m.id);}}>{isExp?"▲ hide events":"▼ match events"}</button>}
        </div>
        {isExp && hasEv && (
          <div className="events">
            {m.events.map((ev,i)=>(
              <div key={i} className="ev-row">
                <span className="ev-min">{ev.minute}'</span>
                <span className="ev-ico">{ev.type==="goal"?"⚽":ev.type==="yellow"?"🟨":"🟥"}</span>
                <span className="ev-txt">{ev.player}{ev.extra&&<span style={{color:"var(--muted)",fontSize:"11px"}}> ({ev.extra})</span>}</span>
                <span className="ev-team">{FLAGS[ev.team]||""} {ev.team}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  function GroupTable({ group }) {
    const rows = buildTable(group, matches);
    const played = matches.filter(m=>m.group===group&&m.status!=="upcoming").length;
    const total  = matches.filter(m=>m.group===group).length;
    return (
      <div className="group-table">
        <div className="gt-head">
          <div className="gt-title">Group {group}</div>
          <div className="gt-sub">{played}/{total} played</div>
        </div>
        <table className="gt-tbl">
          <thead>
            <tr>
              <th>#</th><th style={{textAlign:"left",paddingLeft:"16px"}}>Team</th>
              <th title="Played">P</th><th title="Won">W</th><th title="Draw">D</th><th title="Lost">L</th>
              <th title="Goals">G</th><th title="Goal difference">GD</th><th title="Points">PTS</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r,i)=>(
              <tr key={r.name} className={i===0?"q1":i===1?"q2":""}>
                <td><span className={`pos-b p${i+1}`}>{i+1}</span></td>
                <td><div className="gt-name"><span className="gt-flag">{FLAGS[r.name]||"🏳️"}</span><span>{r.name}</span></div></td>
                <td>{r.p}</td><td>{r.w}</td><td>{r.d}</td><td>{r.l}</td>
                <td>{r.gf}:{r.ga}</td>
                <td style={{color:r.gd>0?"var(--live)":r.gd<0?"#FF6B6B":"var(--muted)"}}>{r.gd>0?`+${r.gd}`:r.gd}</td>
                <td className="gt-pts">{r.pts}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="gt-legend">
          <span><span className="gld gld-1"/>Advance (top 2)</span>
          <span><span className="gld gld-2"/>Possible 3rd place</span>
        </div>
      </div>
    );
  }

  const groupFilters = (
    <>
      <button className={`fbtn ${gf==="all"?"on":""}`} onClick={()=>setGf("all")}>All groups</button>
      {groupKeys.map(g=>(
        <button key={g} className={`fbtn ${gf===g?"on":""}`} onClick={()=>setGf(g)}>Grp {g}</button>
      ))}
    </>
  );

  return (
    <>
      <style>{S}</style>
      <div className="app">
        {/* HEADER */}
        <div className="hdr">
          <div className="ey">FIFA</div>
          <div className="ht">World Cup 2026</div>
          <div className="hs">USA · Canada · Mexico &nbsp;·&nbsp; Jun 11 – Jul 19, 2026</div>
          {liveCount>0 && (
            <div style={{display:"flex",justifyContent:"center",marginTop:"12px"}}>
              <div className="livebadge"><div className="ldot"/>{liveCount} Live</div>
            </div>
          )}
        </div>

        {/* TABS */}
        <div className="tabs">
          {[{id:"matches",l:"Matches"},{id:"tables",l:"Standings"},{id:"teams",l:"All Teams (48)"},{id:"favorites",l:`⭐ Favourites${favCount>0?` (${favCount})`:""}`}]
            .map(t=><button key={t.id} className={`tab ${tab===t.id?"on":""}`} onClick={()=>setTab(t.id)}>{t.l}</button>)}
        </div>

        {/* ── MATCHES & FAVOURITES ── */}
        {(tab==="matches"||tab==="favorites") && (
          <>
            <div className="filters">
              {[{v:"all",l:"All"},{v:"live",l:"🔴 Live"},{v:"upcoming",l:"Upcoming"},{v:"finished",l:"Finished"}]
                .map(f=><button key={f.v} className={`fbtn ${sf===f.v?"on":""}`} onClick={()=>setSf(f.v)}>{f.l}</button>)}
              {groupFilters}
              <div className="swrap">
                <span className="sico">🔍</span>
                <input className="sinp" placeholder="Search team / venue…" value={q} onChange={e=>setQ(e.target.value)}/>
              </div>
            </div>

            {/* Status bars */}
            <div className="tz-bar">
              <span>🌍</span>
              All times in your local time:
              <span className="tz-val">{getTzLabel()}</span>
              &nbsp;·&nbsp; Now: {nowStr}
              <button className="refresh-btn" onClick={fetchMatches}>⟳ Refresh</button>
            </div>

            {error && <div className="err-bar">⚠️ {error}</div>}
            {isSimulated && !error && (
              <div className="sim-bar">
                ⏳ Tournament starts June 11, 2026 — showing simulated preview data. Real scores will load automatically.
              </div>
            )}
            {liveCount>0 && !["finished","upcoming"].includes(sf) && (
              <div className="lcbar">
                <div className="ldot"/>
                <span className="lct">{liveCount} matches in progress</span>
                <span className="lcs">&nbsp;· updates every 60s</span>
              </div>
            )}

            {/* Loading skeleton */}
            {loading && (
              <div className="skeleton">
                {[1,2,3,4,5].map(i=><div key={i} className="skel-card"/>)}
              </div>
            )}

            {!loading && ["live","upcoming","finished"].map(status=>{
              const g=filtered.filter(m=>m.status===status);
              if(!g.length) return null;
              const lbl={live:"🔴 Live Now",upcoming:"Upcoming Matches",finished:"Finished"}[status];
              return <div key={status}><div className="sl">{lbl}</div><div className="mgrid">{g.map(m=><MatchCard key={m.id} m={m}/>)}</div></div>;
            })}

            {!loading && filtered.length===0 && (
              <div className="empty">
                <div className="eico">{tab==="favorites"?"⭐":"⚽"}</div>
                <div>{tab==="favorites"?"No favourites yet — tap ☆ on a match or a team.":"No matches found."}</div>
              </div>
            )}
          </>
        )}

        {/* ── STANDINGS ── */}
        {tab==="tables" && (
          <>
            <div className="filters">{groupFilters}</div>
            {isSimulated && <div className="sim-bar" style={{marginBottom:"16px"}}>⏳ Standings are simulated — real standings load from June 11.</div>}
            <div className="sl">Group Standings</div>
            <div className="tables-wrap">
              {groupKeys.filter(g=>gf==="all"||gf===g).map(g=><GroupTable key={g} group={g}/>)}
            </div>
          </>
        )}

        {/* ── TEAMS ── */}
        {tab==="teams" && (
          <>
            <div className="filters">
              <div className="swrap">
                <span className="sico">🔍</span>
                <input className="sinp" placeholder="Search team…" value={q} onChange={e=>setQ(e.target.value)}/>
              </div>
            </div>
            {Object.keys(GROUPS_STATIC).map(g=>{
              const show=shownTeams.filter(t=>t.group===g);
              if(!show.length) return null;
              return (
                <div key={g}>
                  <div className="sl">Group {g}</div>
                  <div className="tgrid">
                    {show.map(t=>(
                      <div key={t.name} className={`tcard ${ftNames.includes(t.name)?"fav":""}`}>
                        <button className={`tcfav ${ftNames.includes(t.name)?"on":""}`} onClick={()=>toggleFT(t.name)}>{ftNames.includes(t.name)?"⭐":"☆"}</button>
                        <div className="tcflag">{FLAGS[t.name]||"🏳️"}</div>
                        <div className="tcname">{t.name}</div>
                        <div className="tcgroup">Group {t.group}</div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </>
        )}

        {/* FOOTER */}
        <div style={{textAlign:"center",color:"var(--muted)",fontSize:"11px",marginTop:"60px",borderTop:"1px solid var(--border)",paddingTop:"20px"}}>
          {lastUpdated && !isSimulated && <span>Last updated: {lastUpdated.toLocaleTimeString(undefined,{hour:"2-digit",minute:"2-digit"})} &nbsp;·&nbsp; </span>}
          Data powered by API-Football &nbsp;·&nbsp; Not affiliated with FIFA
        </div>
      </div>
    </>
  );
}
