// src/App.jsx — WC Live Scores 2026
// Round 2: Dark/Light mode, Knockout Bracket, Team Statistics

import { useState, useEffect, useCallback } from "react";
import Bracket from "./Bracket.jsx";
import MatchModal from "./MatchModal.jsx";
import TeamStats from "./TeamStats.jsx";

// ─── STATIC DATA ──────────────────────────────────────────────────────────────
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

// ─── SIMULATION ───────────────────────────────────────────────────────────────
function seededRand(seed) {
  let s = seed;
  return () => { s=(s*1664525+1013904223)&0xffffffff; return Math.abs(s)/0xffffffff; };
}

function genEvents(home,away,hs,as_,seed) {
  const rng=seededRand(seed); const events=[];
  const add=(team,count)=>{const pool=PLAYER_NAMES[team]||["Player"];for(let i=0;i<count;i++)events.push({type:"goal",team,minute:Math.floor(rng()*90)+1,player:pool[Math.floor(rng()*pool.length)],extra:rng()<0.12?"pen.":rng()<0.08?"o.g.":""});};
  const card=(team,y,r)=>{const pool=PLAYER_NAMES[team]||["Player"];for(let i=0;i<y;i++)events.push({type:"yellow",team,minute:Math.floor(rng()*88)+1,player:pool[Math.floor(rng()*pool.length)],extra:""});for(let i=0;i<r;i++)events.push({type:"red",team,minute:Math.floor(rng()*60)+30,player:pool[Math.floor(rng()*pool.length)],extra:""});};
  add(home,hs);add(away,as_);card(home,Math.floor(rng()*3),rng()<0.05?1:0);card(away,Math.floor(rng()*3),rng()<0.05?1:0);
  return events.sort((a,b)=>a.minute-b.minute);
}

function generateSimulatedMatches() {
  const start=new Date("2026-06-11T19:00:00Z");let matches=[],id=1;
  Object.entries(GROUPS_STATIC).forEach(([group,teams],gi)=>{
    const pairs=[];for(let a=0;a<teams.length;a++)for(let b=a+1;b<teams.length;b++)pairs.push([teams[a],teams[b]]);
    pairs.forEach((pair,pi)=>{
      const kickoff=new Date(start.getTime()+(gi*6+pi)*3*3600*1000);
      const diff=Date.now()-kickoff.getTime();
      const seed=gi*1000+pi*37+pair[0].charCodeAt(0);const rng=seededRand(seed);
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

function buildTable(group,matches) {
  const table={};(GROUPS_STATIC[group]||[]).forEach(t=>table[t]={p:0,w:0,d:0,l:0,gf:0,ga:0,pts:0});
  matches.filter(m=>m.group===group&&m.status!=="upcoming").forEach(m=>{
    if(!table[m.home])table[m.home]={p:0,w:0,d:0,l:0,gf:0,ga:0,pts:0};if(!table[m.away])table[m.away]={p:0,w:0,d:0,l:0,gf:0,ga:0,pts:0};
    const h=m.home,a=m.away,hs=m.home_score??0,as_=m.away_score??0;
    table[h].p++;table[a].p++;table[h].gf+=hs;table[h].ga+=as_;table[a].gf+=as_;table[a].ga+=hs;
    if(hs>as_){table[h].w++;table[h].pts+=3;table[a].l++;}else if(hs<as_){table[a].w++;table[a].pts+=3;table[h].l++;}else{table[h].d++;table[h].pts++;table[a].d++;table[a].pts++;}
  });
  return Object.entries(table).map(([name,s])=>({name,...s,gd:s.gf-s.ga})).sort((a,b)=>b.pts-a.pts||b.gd-a.gd||b.gf-a.gf);
}

function scoreTip(tip,match) {
  if(match.status!=="finished")return null;
  const hs=match.home_score??0,as_=match.away_score??0;
  if(tip.home===hs&&tip.away===as_)return 3;
  const tr=tip.home>tip.away?"H":tip.home<tip.away?"A":"D",rr=hs>as_?"H":hs<as_?"A":"D";
  return tr===rr?1:0;
}

function fmtDate(iso){return new Date(iso).toLocaleDateString(undefined,{day:"numeric",month:"short"});}
function fmtTime(iso){return new Date(iso).toLocaleTimeString(undefined,{hour:"2-digit",minute:"2-digit"});}
function getTzLabel(){const tz=Intl.DateTimeFormat().resolvedOptions().timeZone.split("/").pop().replace(/_/g," ");const abbr=new Date().toLocaleTimeString(undefined,{timeZoneName:"short"}).split(" ").pop();return `${tz} (${abbr})`;}
function getNowStr(){return new Date().toLocaleTimeString(undefined,{hour:"2-digit",minute:"2-digit",timeZoneName:"short"});}

function useCountdown(targetIso) {
  const [diff,setDiff]=useState(0);
  useEffect(()=>{if(!targetIso)return;const tick=()=>setDiff(new Date(targetIso)-Date.now());tick();const t=setInterval(tick,1000);return()=>clearInterval(t);},[targetIso]);
  if(diff<=0)return null;
  return{d:Math.floor(diff/86400000),h:Math.floor((diff%86400000)/3600000),m:Math.floor((diff%3600000)/60000),s:Math.floor((diff%60000)/1000)};
}

const TOURNAMENT_START=new Date("2026-06-11T00:00:00Z").getTime();
const isTournamentLive=()=>Date.now()>=TOURNAMENT_START;

// ─── THEME ────────────────────────────────────────────────────────────────────
const DARK = {
  "--bg":"#060A14","--s1":"#0D1525","--s2":"#111C30","--s3":"#162038",
  "--border":"rgba(255,255,255,.07)","--text":"#E8EDF5","--muted":"#6B7FA3","--muted2":"#4A5E80",
};
const LIGHT = {
  "--bg":"#F0F4FA","--s1":"#FFFFFF","--s2":"#F4F7FC","--s3":"#E8EDF5",
  "--border":"rgba(0,0,0,.08)","--text":"#0D1525","--muted":"#6B7FA3","--muted2":"#9AAAC4",
};

// ─── STYLES ──────────────────────────────────────────────────────────────────
const S = `
@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@300;400;500;600&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
:root{
  --bg:#060A14;--s1:#0D1525;--s2:#111C30;--s3:#162038;
  --border:rgba(255,255,255,.07);--accent:#00E5FF;--live:#00FF88;
  --gold:#FFD700;--text:#E8EDF5;--muted:#6B7FA3;--muted2:#4A5E80;
  --fd:'Bebas Neue',sans-serif;--fb:'DM Sans',sans-serif;
}
body{background:var(--bg);color:var(--text);font-family:var(--fb);min-height:100vh;overflow-x:hidden;transition:background .3s,color .3s}

.app{max-width:1140px;margin:0 auto;padding:0 16px 100px}

/* HEADER */
.hdr{position:relative;padding:28px 0 20px;text-align:center}
.hdr::before{content:'';position:absolute;top:-80px;left:50%;transform:translateX(-50%);width:700px;height:350px;background:radial-gradient(ellipse,rgba(0,229,255,.11) 0%,transparent 70%);pointer-events:none}
.hdr-top{display:flex;justify-content:flex-end;margin-bottom:8px}
.theme-btn{background:var(--s1);border:1px solid var(--border);border-radius:20px;padding:6px 14px;font-family:var(--fb);font-size:12px;color:var(--muted);cursor:pointer;transition:all .2s}
.theme-btn:hover{border-color:var(--accent);color:var(--accent)}
.ey{font-size:11px;font-weight:600;letter-spacing:4px;text-transform:uppercase;color:var(--accent);margin-bottom:8px}
.ht{font-family:var(--fd);font-size:clamp(48px,10vw,96px);line-height:.9;background:linear-gradient(135deg,var(--text) 0%,var(--accent) 55%,#007AFF 100%);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
.hs{color:var(--muted);font-size:13px;margin-top:10px;letter-spacing:1px}
.livebadge{display:inline-flex;align-items:center;gap:6px;background:rgba(0,255,136,.1);border:1px solid rgba(0,255,136,.3);border-radius:20px;padding:4px 12px;font-size:11px;font-weight:600;color:var(--live);letter-spacing:2px;text-transform:uppercase;margin-top:12px}
.ldot{width:7px;height:7px;background:var(--live);border-radius:50%;animation:pulse 1.4s infinite}
@keyframes pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.4;transform:scale(.7)}}

/* COUNTDOWN */
.countdown-wrap{background:linear-gradient(135deg,var(--s1) 0%,rgba(0,229,255,.06) 100%);border:1px solid rgba(0,229,255,.2);border-radius:20px;padding:24px 20px;margin:20px 0;text-align:center}
.countdown-label{font-size:11px;font-weight:600;letter-spacing:3px;text-transform:uppercase;color:var(--accent);margin-bottom:16px}
.countdown-grid{display:flex;justify-content:center;gap:12px;flex-wrap:wrap}
.countdown-unit{display:flex;flex-direction:column;align-items:center;gap:4px}
.countdown-num{font-family:var(--fd);font-size:clamp(36px,7vw,64px);line-height:1;color:var(--text);background:var(--s2);border:1px solid var(--border);border-radius:12px;min-width:64px;padding:6px 10px}
.countdown-sub{font-size:9px;font-weight:600;letter-spacing:2px;text-transform:uppercase;color:var(--muted)}
.next-match-bar{margin-top:14px;font-size:13px;color:var(--muted)}
.next-match-bar strong{color:var(--text)}
.notify-btn{display:inline-flex;align-items:center;gap:8px;background:rgba(0,229,255,.1);border:1px solid rgba(0,229,255,.3);border-radius:20px;padding:8px 18px;font-family:var(--fb);font-size:13px;font-weight:500;color:var(--accent);cursor:pointer;transition:all .2s;margin-top:12px}
.notify-btn:hover{background:rgba(0,229,255,.2)}
.notify-btn.on{background:rgba(0,255,136,.1);border-color:rgba(0,255,136,.3);color:var(--live)}

/* TABS */
.tabs{display:flex;gap:4px;background:var(--s1);border:1px solid var(--border);border-radius:14px;padding:4px;margin:20px 0;overflow-x:auto;scrollbar-width:none}
.tabs::-webkit-scrollbar{display:none}
.tab{flex:none;padding:8px 16px;border-radius:10px;border:none;background:transparent;color:var(--muted);font-family:var(--fb);font-size:13px;font-weight:500;cursor:pointer;transition:all .2s;white-space:nowrap}
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

/* BARS */
.tz-bar{display:flex;align-items:center;gap:10px;background:rgba(0,229,255,.06);border:1px solid rgba(0,229,255,.15);border-radius:10px;padding:10px 16px;margin-bottom:12px;font-size:12px;color:var(--muted);flex-wrap:wrap}
.tz-val{color:var(--accent);font-weight:600;margin:0 3px}
.lcbar{display:flex;align-items:center;gap:10px;background:rgba(0,255,136,.06);border:1px solid rgba(0,255,136,.18);border-radius:10px;padding:10px 16px;margin-bottom:12px;font-size:13px}
.lct{color:var(--live);font-weight:600}.lcs{color:var(--muted);font-size:12px}
.sim-bar{display:flex;align-items:center;gap:8px;background:rgba(255,200,0,.06);border:1px solid rgba(255,200,0,.2);border-radius:10px;padding:10px 16px;margin-bottom:12px;font-size:12px;color:#FFD700}
.err-bar{display:flex;align-items:center;gap:8px;background:rgba(255,80,80,.06);border:1px solid rgba(255,80,80,.2);border-radius:10px;padding:10px 16px;margin-bottom:12px;font-size:12px;color:#FF8080}

/* SKELETON */
.skeleton{display:flex;flex-direction:column;gap:8px}
.skel-card{background:var(--s1);border:1px solid var(--border);border-radius:16px;height:88px;overflow:hidden;position:relative}
.skel-card::after{content:'';position:absolute;inset:0;background:linear-gradient(90deg,transparent 0%,rgba(255,255,255,.04) 50%,transparent 100%);animation:shimmer 1.5s infinite}
@keyframes shimmer{0%{transform:translateX(-100%)}100%{transform:translateX(100%)}}

/* MATCH CARD */
.mgrid{display:flex;flex-direction:column;gap:8px}
.mc{background:var(--s1);border:1px solid var(--border);border-radius:16px;overflow:hidden;transition:background .2s,border-color .2s}
.mc.live{border-color:rgba(0,255,136,.2);background:linear-gradient(135deg,var(--s1) 0%,rgba(0,255,136,.04) 100%)}
.mc::before{content:'';display:block;height:3px}
.mc.live::before{background:var(--live)}.mc.finished::before{background:var(--muted2)}.mc.upcoming::before{background:var(--accent)}
.mc-main{padding:14px 20px 18px;display:grid;grid-template-columns:1fr auto 1fr;align-items:center;gap:12px;position:relative;cursor:pointer}
.mc-main:hover{background:rgba(128,128,128,.04)}
.gtag{position:absolute;top:10px;right:14px;font-size:9px;font-weight:700;letter-spacing:2px;color:var(--muted);text-transform:uppercase}
.favbtn{position:absolute;top:9px;right:52px;background:none;border:none;cursor:pointer;font-size:15px;opacity:.3;transition:opacity .2s,transform .2s;line-height:1}
.favbtn:hover,.favbtn.on{opacity:1;transform:scale(1.2)}
.exp-btn{position:absolute;bottom:4px;left:50%;transform:translateX(-50%);background:none;border:none;cursor:pointer;color:var(--muted);font-size:10px;letter-spacing:1px;font-family:var(--fb);opacity:.55;transition:opacity .2s,color .2s;padding:2px 8px;white-space:nowrap}
.exp-btn:hover{opacity:1;color:var(--accent)}
.team{display:flex;flex-direction:column;gap:4px}.team.r{align-items:flex-end}
.tflag{font-size:24px;line-height:1}
.tname{font-size:13px;font-weight:600;color:var(--text);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:105px}
.tname.win{color:var(--accent)}
.sb{text-align:center;min-width:86px}
.score{font-family:var(--fd);font-size:38px;line-height:1;color:var(--text);letter-spacing:4px}
.sdash{font-family:var(--fd);font-size:24px;color:var(--muted);letter-spacing:6px}
.badge{display:inline-block;padding:3px 8px;border-radius:6px;font-size:10px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;margin-top:5px}
.bl{background:rgba(0,255,136,.15);color:var(--live)}.bf{background:rgba(107,127,163,.15);color:var(--muted)}.bu{background:rgba(0,229,255,.12);color:var(--accent)}
.mmeta{font-size:10px;color:var(--muted);margin-top:3px}
.local-t{font-size:11px;color:var(--accent);margin-top:3px;font-weight:500}

/* EVENTS */
.events{border-top:1px solid var(--border);padding:10px 20px 12px;display:flex;flex-direction:column;gap:5px;background:rgba(0,0,0,.08)}
.ev-row{display:flex;align-items:center;gap:10px;font-size:12px}
.ev-min{font-family:var(--fd);font-size:13px;color:var(--muted);min-width:30px;text-align:right;letter-spacing:1px}
.ev-ico{font-size:14px;min-width:20px;text-align:center}
.ev-txt{color:var(--text);flex:1}
.ev-team{font-size:10px;color:var(--muted);margin-left:auto;white-space:nowrap}

/* TIPPING */
.tip-panel{border-top:1px solid var(--border);padding:10px 20px;background:rgba(255,215,0,.03);display:flex;align-items:center;gap:12px;flex-wrap:wrap}
.tip-label{font-size:11px;font-weight:600;letter-spacing:1px;text-transform:uppercase;color:var(--gold);min-width:60px}
.tip-inputs{display:flex;align-items:center;gap:8px}
.tip-inp{width:40px;height:34px;background:var(--s2);border:1px solid var(--border);border-radius:8px;color:var(--text);font-family:var(--fd);font-size:18px;text-align:center;outline:none;transition:border-color .2s}
.tip-inp:focus{border-color:var(--gold)}
.tip-sep{font-family:var(--fd);font-size:18px;color:var(--muted)}
.tip-save{padding:7px 16px;background:var(--gold);border:none;border-radius:8px;color:#000;font-family:var(--fb);font-size:12px;font-weight:700;cursor:pointer;transition:opacity .2s}
.tip-save:hover{opacity:.85}
.tip-result{font-size:12px;font-weight:600;padding:5px 12px;border-radius:8px}
.tip-exact{background:rgba(0,255,136,.15);color:var(--live)}
.tip-correct{background:rgba(0,229,255,.12);color:var(--accent)}
.tip-wrong{background:rgba(255,80,80,.1);color:#FF8080}
.tip-pts{font-family:var(--fd);font-size:16px;margin-left:4px}
.tip-summary{background:var(--s1);border:1px solid var(--border);border-radius:16px;padding:20px;margin-bottom:20px}
.tip-summary-title{font-family:var(--fd);font-size:24px;letter-spacing:2px;color:var(--gold);margin-bottom:4px}
.tip-summary-sub{font-size:13px;color:var(--muted)}
.tip-score-big{font-family:var(--fd);font-size:56px;color:var(--text);line-height:1;margin:12px 0 4px}
.tip-score-label{font-size:11px;letter-spacing:2px;text-transform:uppercase;color:var(--muted)}
.tip-breakdown{display:flex;gap:12px;margin-top:16px;flex-wrap:wrap}
.tip-stat{background:var(--s2);border-radius:10px;padding:10px 16px;text-align:center;flex:1;min-width:80px}
.tip-stat-num{font-family:var(--fd);font-size:28px;color:var(--text)}
.tip-stat-label{font-size:10px;letter-spacing:1px;text-transform:uppercase;color:var(--muted);margin-top:2px}

/* STANDINGS */
.tables-wrap{display:grid;grid-template-columns:repeat(auto-fill,minmax(330px,1fr));gap:16px;margin-top:8px}
.group-table{background:var(--s1);border:1px solid var(--border);border-radius:16px;overflow:hidden}
.gt-head{background:var(--s2);padding:12px 16px}
.gt-title{font-family:var(--fd);font-size:18px;letter-spacing:2px;color:var(--accent)}
.gt-sub{font-size:11px;color:var(--muted);margin-top:2px}
.gt-tbl{width:100%;border-collapse:collapse}
.gt-tbl th{font-size:9px;font-weight:700;letter-spacing:2px;color:var(--muted);text-transform:uppercase;padding:8px 12px 6px;text-align:center;border-bottom:1px solid var(--border)}
.gt-tbl th:first-child,.gt-tbl td:first-child{text-align:left;padding-left:16px}
.gt-tbl td{padding:9px 12px;text-align:center;font-size:13px;border-bottom:1px solid rgba(128,128,128,.08)}
.gt-tbl tr:last-child td{border-bottom:none}
.gt-tbl tr.q1 td{background:rgba(0,229,255,.05)}.gt-tbl tr.q2 td{background:rgba(0,229,255,.02)}
.gt-name{display:flex;align-items:center;gap:8px;font-weight:500;white-space:nowrap}
.gt-flag{font-size:16px}.gt-pts{font-weight:700;color:var(--text)}
.pos-b{display:inline-flex;align-items:center;justify-content:center;width:18px;height:18px;border-radius:4px;font-size:10px;font-weight:700;font-family:var(--fd)}
.p1{background:rgba(0,229,255,.2);color:var(--accent)}.p2{background:rgba(0,229,255,.1);color:var(--accent)}
.p3{background:rgba(107,127,163,.15);color:var(--muted)}.p4{color:var(--muted2)}
.gt-legend{display:flex;gap:16px;padding:10px 16px;border-top:1px solid var(--border);font-size:10px;color:var(--muted)}
.gld{display:inline-block;width:8px;height:8px;border-radius:2px;margin-right:4px}
.gld-1{background:rgba(0,229,255,.4)}.gld-2{background:rgba(0,229,255,.2)}

/* TEAMS */
.tgrid{display:grid;grid-template-columns:repeat(auto-fill,minmax(155px,1fr));gap:12px;margin-top:8px}
.tcard{background:var(--s1);border:1px solid var(--border);border-radius:16px;padding:18px 14px;text-align:center;cursor:pointer;transition:all .2s;position:relative}
.tcard:hover{background:var(--s2);border-color:rgba(0,229,255,.3);transform:translateY(-2px)}
.tcard.fav{border-color:rgba(255,215,0,.4);background:rgba(255,215,0,.04)}
.tcflag{font-size:38px;margin-bottom:10px;line-height:1}
.tcname{font-size:13px;font-weight:600;color:var(--text)}
.tcgroup{font-size:11px;color:var(--muted);margin-top:3px;letter-spacing:1px}
.tcfav{position:absolute;top:10px;right:10px;background:none;border:none;font-size:13px;cursor:pointer;opacity:.3;transition:opacity .2s}
.tcfav:hover,.tcfav.on{opacity:1}

.empty{text-align:center;padding:60px 20px;color:var(--muted)}
.eico{font-size:48px;margin-bottom:12px}
.refresh-btn{background:none;border:1px solid var(--border);border-radius:20px;padding:5px 14px;color:var(--muted);font-family:var(--fb);font-size:12px;cursor:pointer;transition:all .2s;margin-left:auto}
.refresh-btn:hover{border-color:var(--accent);color:var(--accent)}

::-webkit-scrollbar{width:6px}
::-webkit-scrollbar-thumb{background:var(--s3);border-radius:3px}

@media(max-width:640px){
  .tname{font-size:11px;max-width:75px}.score{font-size:28px}.mc-main{padding:10px 14px 16px;gap:8px}
  .tflag{font-size:20px}.tables-wrap{grid-template-columns:1fr}.sinp{width:140px}
  .countdown-num{min-width:52px}
}
`;

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
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [nowStr, setNowStr] = useState(getNowStr());
  const [lastUpdated, setLastUpdated] = useState(null);
  const [notifyEnabled, setNotifyEnabled] = useState(false);
  const [darkMode, setDarkMode] = useState(() => { try { return localStorage.getItem("wc_dark") !== "false"; } catch { return true; } });

  const [fmIds, setFmIds] = useState(() => { try { return JSON.parse(localStorage.getItem("wc_fm")||"[]"); } catch { return []; } });
  const [ftNames, setFtNames] = useState(() => { try { return JSON.parse(localStorage.getItem("wc_ft")||"[]"); } catch { return []; } });
  const [tips, setTips] = useState(() => { try { return JSON.parse(localStorage.getItem("wc_tips")||"{}"); } catch { return {}; } });
  const [tipDraft, setTipDraft] = useState({});

  const fetchMatches = useCallback(async () => {
    if (!isTournamentLive()) { setMatches(generateSimulatedMatches()); setIsSimulated(true); setLoading(false); return; }
    try {
      const res = await fetch("/api/matches");
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setMatches(data.matches||[]); setIsSimulated(false); setError(null); setLastUpdated(new Date());
    } catch (err) {
      setError("Could not load live data — showing simulated scores.");
      setMatches(generateSimulatedMatches()); setIsSimulated(true);
    } finally { setLoading(false); }
  }, []);

  useEffect(() => {
    fetchMatches();
    const interval = isTournamentLive() ? 60000 : 5*60*1000;
    const t = setInterval(fetchMatches, interval);
    const clock = setInterval(() => setNowStr(getNowStr()), 30000);
    return () => { clearInterval(t); clearInterval(clock); };
  }, [fetchMatches]);

  // Apply theme
  useEffect(() => {
    const theme = darkMode ? DARK : LIGHT;
    Object.entries(theme).forEach(([k,v]) => document.documentElement.style.setProperty(k, v));
    try { localStorage.setItem("wc_dark", darkMode); } catch {}
  }, [darkMode]);

  useEffect(() => { if ("Notification" in window) setNotifyEnabled(Notification.permission === "granted"); }, []);
  useEffect(() => { try { localStorage.setItem("wc_fm", JSON.stringify(fmIds)); } catch {} }, [fmIds]);
  useEffect(() => { try { localStorage.setItem("wc_ft", JSON.stringify(ftNames)); } catch {} }, [ftNames]);
  useEffect(() => { try { localStorage.setItem("wc_tips", JSON.stringify(tips)); } catch {} }, [tips]);

  const requestNotifications = async () => {
    if (!("Notification" in window)) { alert("Notifications not supported in this browser."); return; }
    const perm = await Notification.requestPermission();
    setNotifyEnabled(perm === "granted");
    if (perm === "granted") new Notification("✅ Notifications enabled!", { body: "You'll be notified 1 hour before your favourite team plays." });
  };

  const toggleFM = id => setFmIds(p => p.includes(id) ? p.filter(x=>x!==id) : [...p,id]);
  const toggleFT = n  => setFtNames(p => p.includes(n)  ? p.filter(x=>x!==n)  : [...p,n]);
  const toggleExp = id => setExpanded(p => ({...p,[id]:!p[id]}));
  const saveTip = (matchId) => {
    const d = tipDraft[matchId];
    if (!d || d.home === "" || d.away === "") return;
    setTips(p => ({...p,[matchId]:{home:parseInt(d.home),away:parseInt(d.away)}}));
  };

  const liveCount = matches.filter(m=>m.status==="live").length;
  const favCount = fmIds.length + ftNames.length;
  const nextMatch = matches.find(m=>m.status==="upcoming"&&m.kickoff);
  const countdown = useCountdown(nextMatch?.kickoff);

  const tippedFinished = matches.filter(m=>tips[m.id]!==undefined&&m.status==="finished");
  const totalPoints = tippedFinished.reduce((s,m)=>s+(scoreTip(tips[m.id],m)||0),0);
  const exactCount = tippedFinished.filter(m=>scoreTip(tips[m.id],m)===3).length;
  const correctCount = tippedFinished.filter(m=>scoreTip(tips[m.id],m)===1).length;

  const groupKeys = matches.length ? [...new Set(matches.map(m=>m.group))].filter(Boolean).sort() : Object.keys(GROUPS_STATIC);

  let filtered = matches;
  if (tab==="favorites") filtered=filtered.filter(m=>fmIds.includes(m.id)||ftNames.includes(m.home)||ftNames.includes(m.away));
  if (sf!=="all") filtered=filtered.filter(m=>m.status===sf);
  if (gf!=="all") filtered=filtered.filter(m=>m.group===gf);
  if (q) { const ql=q.toLowerCase(); filtered=filtered.filter(m=>m.home.toLowerCase().includes(ql)||m.away.toLowerCase().includes(ql)||(m.venue||"").toLowerCase().includes(ql)); }

  const allTeams = Object.entries(GROUPS_STATIC).flatMap(([g,ts])=>ts.map(t=>({name:t,group:g})));
  const shownTeams = (tab==="favorites"?allTeams.filter(t=>ftNames.includes(t.name)):allTeams).filter(t=>!q||t.name.toLowerCase().includes(q.toLowerCase()));

  function CountdownWidget() {
    if (!countdown || !nextMatch) return null;
    const {d,h,m,s} = countdown;
    return (
      <div className="countdown-wrap">
        <div className="countdown-label">⏱ Next match kicks off in</div>
        <div className="countdown-grid">
          {d>0 && <div className="countdown-unit"><div className="countdown-num">{String(d).padStart(2,"0")}</div><div className="countdown-sub">Days</div></div>}
          <div className="countdown-unit"><div className="countdown-num">{String(h).padStart(2,"0")}</div><div className="countdown-sub">Hours</div></div>
          <div className="countdown-unit"><div className="countdown-num">{String(m).padStart(2,"0")}</div><div className="countdown-sub">Min</div></div>
          <div className="countdown-unit"><div className="countdown-num">{String(s).padStart(2,"0")}</div><div className="countdown-sub">Sec</div></div>
        </div>
        <div className="next-match-bar">
          <strong>{FLAGS[nextMatch.home]||""} {nextMatch.home}</strong> vs <strong>{FLAGS[nextMatch.away]||""} {nextMatch.away}</strong>
          &nbsp;·&nbsp; {fmtDate(nextMatch.kickoff)} {fmtTime(nextMatch.kickoff)} local
        </div>
        <div><button className={`notify-btn ${notifyEnabled?"on":""}`} onClick={requestNotifications}>{notifyEnabled?"🔔 Notifications on":"🔕 Notify me for my teams"}</button></div>
      </div>
    );
  }

  function MatchCard({ m, showTip=false }) {
    const isFav=fmIds.includes(m.id),isExp=expanded[m.id];
    const hw=m.status==="finished"&&(m.home_score??0)>(m.away_score??0);
    const aw=m.status==="finished"&&(m.away_score??0)>(m.home_score??0);
    const hasEv=m.events&&m.events.length>0;
    const savedTip=tips[m.id];const tipScore=savedTip?scoreTip(savedTip,m):null;
    const draft=tipDraft[m.id]||{home:"",away:""};
    return (
      <div className={`mc ${m.status}`}>
        <div className="mc-main" onClick={()=>setSelectedMatch(m)}>
          <div className="gtag">Group {m.group}</div>
          <button className={`favbtn ${isFav?"on":""}`} onClick={e=>{e.stopPropagation();toggleFM(m.id);}}>{isFav?"⭐":"☆"}</button>
          <div className="team"><span className="tflag">{FLAGS[m.home]||"🏳️"}</span><span className={`tname ${hw?"win":""}`}>{m.home}</span></div>
          <div className="sb">
            {m.status==="upcoming"?(<><div className="sdash">vs</div><div className="mmeta">{fmtDate(m.kickoff)}</div><div className="local-t">🕐 {fmtTime(m.kickoff)} local</div><span className="badge bu">Upcoming</span></>)
            :(<><div className="score">{m.home_score??"-"}<span style={{color:"var(--muted)",fontSize:"20px"}}> – </span>{m.away_score??"-"}</div>
              {m.status==="live"&&<span className="badge bl">🔴 {m.minute||0}'</span>}
              {m.status==="finished"&&<span className="badge bf">Full Time</span>}
              <div className="mmeta">{m.venue}</div></>)}
          </div>
          <div className="team r"><span className="tflag">{FLAGS[m.away]||"🏳️"}</span><span className={`tname ${aw?"win":""}`}>{m.away}</span></div>
          {<button className="exp-btn" onClick={e=>{e.stopPropagation();setSelectedMatch(m);}}>▼ match details</button>}
        </div>

        {(showTip||tab==="tipping")&&(
          <div className="tip-panel">
            <span className="tip-label">🏆 Tip</span>
            {savedTip&&m.status==="finished"?(
              <><span style={{fontFamily:"var(--fd)",fontSize:"14px",color:"var(--muted)",letterSpacing:"1px"}}>{savedTip.home} – {savedTip.away}</span>
              <span className={`tip-result ${tipScore===3?"tip-exact":tipScore===1?"tip-correct":"tip-wrong"}`}>{tipScore===3?"🎯 Exact!":tipScore===1?"✅ Correct":"❌ Wrong"}<span className="tip-pts"> +{tipScore}pts</span></span></>
            ):savedTip&&m.status!=="finished"?(
              <><span style={{fontFamily:"var(--fd)",fontSize:"14px",letterSpacing:"1px",color:"var(--muted)"}}>{savedTip.home} – {savedTip.away}</span>
              <span style={{fontSize:"11px",color:"var(--muted)"}}>Tip locked ✓</span>
              <button style={{marginLeft:"auto",background:"none",border:"1px solid var(--border)",borderRadius:"6px",color:"var(--muted)",fontSize:"11px",padding:"3px 8px",cursor:"pointer"}} onClick={()=>setTips(p=>{const n={...p};delete n[m.id];return n;})}>Edit</button></>
            ):m.status==="finished"?(
              <span style={{fontSize:"12px",color:"var(--muted)"}}>No tip placed</span>
            ):(
              <><div className="tip-inputs">
                <input className="tip-inp" type="number" min="0" max="20" placeholder="0" value={draft.home} onChange={e=>setTipDraft(p=>({...p,[m.id]:{...draft,home:e.target.value}}))}/>
                <span className="tip-sep">–</span>
                <input className="tip-inp" type="number" min="0" max="20" placeholder="0" value={draft.away} onChange={e=>setTipDraft(p=>({...p,[m.id]:{...draft,away:e.target.value}}))}/>
              </div>
              <button className="tip-save" onClick={()=>saveTip(m.id)}>Save</button></>
            )}
          </div>
        )}
      </div>
    );
  }

  function GroupTable({ group }) {
    const rows=buildTable(group,matches);
    const played=matches.filter(m=>m.group===group&&m.status!=="upcoming").length;
    const total=matches.filter(m=>m.group===group).length;
    return (
      <div className="group-table">
        <div className="gt-head"><div className="gt-title">Group {group}</div><div className="gt-sub">{played}/{total} played</div></div>
        <table className="gt-tbl">
          <thead><tr><th>#</th><th style={{textAlign:"left",paddingLeft:"16px"}}>Team</th><th>P</th><th>W</th><th>D</th><th>L</th><th>G</th><th>GD</th><th>PTS</th></tr></thead>
          <tbody>{rows.map((r,i)=>(
            <tr key={r.name} className={i===0?"q1":i===1?"q2":""}>
              <td><span className={`pos-b p${i+1}`}>{i+1}</span></td>
              <td><div className="gt-name"><span className="gt-flag">{FLAGS[r.name]||"🏳️"}</span><span>{r.name}</span></div></td>
              <td>{r.p}</td><td>{r.w}</td><td>{r.d}</td><td>{r.l}</td>
              <td>{r.gf}:{r.ga}</td>
              <td style={{color:r.gd>0?"var(--live)":r.gd<0?"#FF6B6B":"var(--muted)"}}>{r.gd>0?`+${r.gd}`:r.gd}</td>
              <td className="gt-pts">{r.pts}</td>
            </tr>
          ))}</tbody>
        </table>
        <div className="gt-legend"><span><span className="gld gld-1"/>Advance</span><span><span className="gld gld-2"/>Possible 3rd</span></div>
      </div>
    );
  }

  const groupFilters = (
    <>{<button className={`fbtn ${gf==="all"?"on":""}`} onClick={()=>setGf("all")}>All groups</button>}
    {groupKeys.map(g=><button key={g} className={`fbtn ${gf===g?"on":""}`} onClick={()=>setGf(g)}>Grp {g}</button>)}</>
  );

  return (
    <>
      <style>{S}</style>
      <div className="app">
        <div className="hdr">
          <div className="hdr-top">
            <button className="theme-btn" onClick={()=>setDarkMode(d=>!d)}>{darkMode?"☀️ Light mode":"🌙 Dark mode"}</button>
          </div>
          <div className="ey">FIFA</div>
          <div className="ht">World Cup 2026</div>
          <div className="hs">USA · Canada · Mexico &nbsp;·&nbsp; Jun 11 – Jul 19, 2026</div>
          {liveCount>0&&<div style={{display:"flex",justifyContent:"center",marginTop:"12px"}}><div className="livebadge"><div className="ldot"/>{liveCount} Live</div></div>}
        </div>

        <CountdownWidget />

        <div className="tabs">
          {[
            {id:"matches",l:"Matches"},
            {id:"tipping",l:`🏆 Tipping${totalPoints>0?` · ${totalPoints}pts`:""}`},
            {id:"tables",l:"Standings"},
            {id:"bracket",l:"🗓 Bracket"},
            {id:"teamstats",l:"Team Stats"},
            {id:"teams",l:"All Teams"},
            {id:"favorites",l:`⭐ Favourites${favCount>0?` (${favCount})`:""}`},
          ].map(t=><button key={t.id} className={`tab ${tab===t.id?"on":""}`} onClick={()=>setTab(t.id)}>{t.l}</button>)}
        </div>

        {/* MATCHES & FAVOURITES */}
        {(tab==="matches"||tab==="favorites")&&(
          <>
            <div className="filters">
              {[{v:"all",l:"All"},{v:"live",l:"🔴 Live"},{v:"upcoming",l:"Upcoming"},{v:"finished",l:"Finished"}].map(f=><button key={f.v} className={`fbtn ${sf===f.v?"on":""}`} onClick={()=>setSf(f.v)}>{f.l}</button>)}
              {groupFilters}
              <div className="swrap"><span className="sico">🔍</span><input className="sinp" placeholder="Search team / venue…" value={q} onChange={e=>setQ(e.target.value)}/></div>
            </div>
            <div className="tz-bar"><span>🌍</span>All times in your local time:<span className="tz-val">{getTzLabel()}</span>&nbsp;·&nbsp;Now: {nowStr}<button className="refresh-btn" onClick={fetchMatches}>⟳ Refresh</button></div>
            {error&&<div className="err-bar">⚠️ {error}</div>}
            {isSimulated&&!error&&<div className="sim-bar">⏳ Tournament starts June 11 — showing simulated data.</div>}
            {liveCount>0&&!["finished","upcoming"].includes(sf)&&<div className="lcbar"><div className="ldot"/><span className="lct">{liveCount} matches in progress</span><span className="lcs">&nbsp;· updates every 60s</span></div>}
            {loading&&<div className="skeleton">{[1,2,3,4,5].map(i=><div key={i} className="skel-card"/>)}</div>}
            {!loading&&["live","upcoming","finished"].map(status=>{
              const g=filtered.filter(m=>m.status===status);if(!g.length)return null;
              const lbl={live:"🔴 Live Now",upcoming:"Upcoming Matches",finished:"Finished"}[status];
              return <div key={status}><div className="sl">{lbl}</div><div className="mgrid">{g.map(m=><MatchCard key={m.id} m={m}/>)}</div></div>;
            })}
            {!loading&&filtered.length===0&&<div className="empty"><div className="eico">{tab==="favorites"?"⭐":"⚽"}</div><div>{tab==="favorites"?"No favourites yet — tap ☆ on a match or a team.":"No matches found."}</div></div>}
          </>
        )}

        {/* TIPPING */}
        {tab==="tipping"&&(
          <>
            <div className="tip-summary">
              <div className="tip-summary-title">Your Tipping Score</div>
              <div className="tip-summary-sub">Exact score = 3pts · Correct result = 1pt</div>
              <div className="tip-score-big">{totalPoints}</div>
              <div className="tip-score-label">Total points</div>
              <div className="tip-breakdown">
                {[{n:Object.keys(tips).length,l:"Tips placed"},{n:exactCount,l:"Exact scores",c:"var(--live)"},{n:correctCount,l:"Correct results",c:"var(--accent)"},{n:matches.filter(m=>m.status==="upcoming").length,l:"To tip"}].map(s=>(
                  <div key={s.l} className="tip-stat"><div className="tip-stat-num" style={s.c?{color:s.c}:{}}>{s.n}</div><div className="tip-stat-label">{s.l}</div></div>
                ))}
              </div>
            </div>
            {matches.filter(m=>m.status==="upcoming"&&!tips[m.id]).length>0&&(
              <><div className="sl">Place your tips</div><div className="mgrid">{matches.filter(m=>m.status==="upcoming"&&!tips[m.id]).slice(0,20).map(m=><MatchCard key={m.id} m={m} showTip/>)}</div></>
            )}
            {Object.keys(tips).length>0&&(
              <><div className="sl">Your tips</div><div className="mgrid">{matches.filter(m=>tips[m.id]!==undefined).map(m=><MatchCard key={m.id} m={m} showTip/>)}</div></>
            )}
          </>
        )}

        {/* STANDINGS */}
        {tab==="tables"&&(
          <><div className="filters">{groupFilters}</div>
          {isSimulated&&<div className="sim-bar" style={{marginBottom:"16px"}}>⏳ Simulated standings — real data from June 11.</div>}
          <div className="sl">Group Standings</div>
          <div className="tables-wrap">{groupKeys.filter(g=>gf==="all"||gf===g).map(g=><GroupTable key={g} group={g}/>)}</div></>
        )}

        {/* BRACKET */}
        {tab==="bracket"&&(
          <><div className="sl">Knockout Bracket</div><Bracket matches={matches}/></>
        )}

        {/* TEAM STATS */}
        {tab==="teamstats"&&(
          <><div className="sl">Team Statistics</div><TeamStats matches={matches} favTeams={ftNames}/></>
        )}

        {/* ALL TEAMS */}
        {tab==="teams"&&(
          <>
            <div className="filters"><div className="swrap"><span className="sico">🔍</span><input className="sinp" placeholder="Search team…" value={q} onChange={e=>setQ(e.target.value)}/></div></div>
            {Object.keys(GROUPS_STATIC).map(g=>{
              const show=shownTeams.filter(t=>t.group===g);if(!show.length)return null;
              return(<div key={g}><div className="sl">Group {g}</div><div className="tgrid">
                {show.map(t=>(<div key={t.name} className={`tcard ${ftNames.includes(t.name)?"fav":""}`}>
                  <button className={`tcfav ${ftNames.includes(t.name)?"on":""}`} onClick={()=>toggleFT(t.name)}>{ftNames.includes(t.name)?"⭐":"☆"}</button>
                  <div className="tcflag">{FLAGS[t.name]||"🏳️"}</div>
                  <div className="tcname">{t.name}</div>
                  <div className="tcgroup">Group {t.group}</div>
                </div>))}
              </div></div>);
            })}
          </>
        )}

        {selectedMatch && <MatchModal match={selectedMatch} onClose={()=>setSelectedMatch(null)}/>}
        <div style={{textAlign:"center",color:"var(--muted)",fontSize:"11px",marginTop:"60px",borderTop:"1px solid var(--border)",paddingTop:"20px"}}>
          {lastUpdated&&!isSimulated&&<span>Last updated: {lastUpdated.toLocaleTimeString(undefined,{hour:"2-digit",minute:"2-digit"})} &nbsp;·&nbsp; </span>}
          Not affiliated with FIFA
        </div>
      </div>
    </>
  );
}
