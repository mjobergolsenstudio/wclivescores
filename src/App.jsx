// App.jsx — WC Live Scores 2026 — V4 Design
// Aurora palette + Neon Pitch aesthetic + clean nav

import { useState, useEffect, useCallback, useRef } from "react";
import Bracket from "./Bracket.jsx";
import TeamStats from "./TeamStats.jsx";
import SquadViewer from "./SquadViewer.jsx";
import MatchModal from "./MatchModal.jsx";

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

const PLAYERS = {
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

const VENUES=["Estadio Azteca","SoFi Stadium","MetLife Stadium","AT&T Stadium","Hard Rock Stadium","Mercedes-Benz Stadium","Arrowhead Stadium","Levi's Stadium","Estadio BBVA","BMO Field","BC Place","Gillette Stadium","Lincoln Financial Field","NRG Stadium"];

function rng(seed){let s=seed;return()=>{s=(s*1664525+1013904223)&0xffffffff;return Math.abs(s)/0xffffffff;};}
function genEvents(home,away,hs,as_,seed){
  const r=rng(seed),evs=[];
  const add=(t,n)=>{const p=PLAYERS[t]||["Player"];for(let i=0;i<n;i++)evs.push({type:"goal",team:t,minute:Math.floor(r()*90)+1,player:p[Math.floor(r()*p.length)],extra:r()<.12?"pen.":r()<.08?"o.g.":""});};
  const card=(t,y,rd)=>{const p=PLAYERS[t]||["Player"];for(let i=0;i<y;i++)evs.push({type:"yellow",team:t,minute:Math.floor(r()*88)+1,player:p[Math.floor(r()*p.length)],extra:""});for(let i=0;i<rd;i++)evs.push({type:"red",team:t,minute:Math.floor(r()*60)+30,player:p[Math.floor(r()*p.length)],extra:""});};
  add(home,hs);add(away,as_);card(home,Math.floor(r()*3),r()<.05?1:0);card(away,Math.floor(r()*3),r()<.05?1:0);
  return evs.sort((a,b)=>a.minute-b.minute);
}
function simMatches(){
  const start=new Date("2026-06-11T19:00:00Z");let ms=[],id=1;
  Object.entries(GROUPS).forEach(([g,ts],gi)=>{
    const pairs=[];for(let a=0;a<ts.length;a++)for(let b=a+1;b<ts.length;b++)pairs.push([ts[a],ts[b]]);
    pairs.forEach((p,pi)=>{
      const ko=new Date(start.getTime()+(gi*6+pi)*3*3600*1000);
      const diff=Date.now()-ko.getTime();
      const seed=gi*1000+pi*37+p[0].charCodeAt(0);const r=rng(seed);
      let status="upcoming",minute=null,hs=0,as_=0;
      if(diff>0&&diff<95*60*1000){status="live";minute=Math.min(90,Math.floor(diff/60000));hs=Math.floor(r()*4);as_=Math.floor(r()*3);}
      else if(diff>=95*60*1000){status="finished";hs=Math.floor(r()*5);as_=Math.floor(r()*4);}
      ms.push({id:id++,group:g,home:p[0],away:p[1],home_score:hs,away_score:as_,status,minute,kickoff:ko.toISOString(),events:status!=="upcoming"?genEvents(p[0],p[1],hs,as_,seed+7):[],venue:VENUES[(id+gi*3)%VENUES.length],simulated:true});
    });
  });
  return ms.sort((a,b)=>{const o={live:0,upcoming:1,finished:2};return o[a.status]!==o[b.status]?o[a.status]-o[b.status]:new Date(a.kickoff)-new Date(b.kickoff);});
}
function buildTable(group,matches){
  const t={};(GROUPS[group]||[]).forEach(n=>t[n]={p:0,w:0,d:0,l:0,gf:0,ga:0,pts:0});
  matches.filter(m=>m.group===group&&m.status!=="upcoming").forEach(m=>{
    if(!t[m.home])t[m.home]={p:0,w:0,d:0,l:0,gf:0,ga:0,pts:0};
    if(!t[m.away])t[m.away]={p:0,w:0,d:0,l:0,gf:0,ga:0,pts:0};
    const h=m.home,a=m.away,hs=m.home_score??0,as_=m.away_score??0;
    t[h].p++;t[a].p++;t[h].gf+=hs;t[h].ga+=as_;t[a].gf+=as_;t[a].ga+=hs;
    if(hs>as_){t[h].w++;t[h].pts+=3;t[a].l++;}else if(hs<as_){t[a].w++;t[a].pts+=3;t[h].l++;}else{t[h].d++;t[h].pts++;t[a].d++;t[a].pts++;}
  });
  return Object.entries(t).map(([name,s])=>({name,...s,gd:s.gf-s.ga})).sort((a,b)=>b.pts-a.pts||b.gd-a.gd||b.gf-a.gf);
}
function scoreTip(tip,m){
  if(m.status!=="finished")return null;
  const hs=m.home_score??0,as_=m.away_score??0;
  if(tip.home===hs&&tip.away===as_)return 3;
  const tr=tip.home>tip.away?"H":tip.home<tip.away?"A":"D",rr=hs>as_?"H":hs<as_?"A":"D";
  return tr===rr?1:0;
}
const fmtD=iso=>new Date(iso).toLocaleDateString(undefined,{day:"numeric",month:"short"});
const fmtT=iso=>new Date(iso).toLocaleTimeString(undefined,{hour:"2-digit",minute:"2-digit"});
const getTz=()=>{const tz=Intl.DateTimeFormat().resolvedOptions().timeZone.split("/").pop().replace(/_/g," ");const ab=new Date().toLocaleTimeString(undefined,{timeZoneName:"short"}).split(" ").pop();return`${tz} (${ab})`;};
const getNow=()=>new Date().toLocaleTimeString(undefined,{hour:"2-digit",minute:"2-digit",timeZoneName:"short"});
function useCountdown(iso){const[d,setD]=useState(0);useEffect(()=>{if(!iso)return;const t=()=>setD(new Date(iso)-Date.now());t();const i=setInterval(t,1000);return()=>clearInterval(i);},[iso]);if(d<=0)return null;return{d:Math.floor(d/86400000),h:Math.floor((d%86400000)/3600000),m:Math.floor((d%3600000)/60000),s:Math.floor((d%60000)/1000)};}
const isLive=()=>Date.now()>=new Date("2026-06-11T00:00:00Z").getTime();

// ── AURORA CANVAS ─────────────────────────────────────────────────────────────
function Aurora(){
  const ref=useRef(null);
  useEffect(()=>{
    const c=ref.current;if(!c)return;
    const ctx=c.getContext("2d");let frame,t=0;
    const resize=()=>{c.width=window.innerWidth;c.height=window.innerHeight;};
    resize();window.addEventListener("resize",resize);
    function draw(){
      t+=0.004;ctx.clearRect(0,0,c.width,c.height);
      ctx.fillStyle="#081428";ctx.fillRect(0,0,c.width,c.height);
      [{x:.22+Math.sin(t*.6)*.12,y:.15+Math.cos(t*.4)*.08,r:.48,col:"0,90,147",a:.14},
       {x:.78+Math.cos(t*.5)*.1,y:.2+Math.sin(t*.7)*.06,r:.38,col:"73,188,227",a:.09},
       {x:.5+Math.sin(t*.3)*.14,y:.82,r:.44,col:"0,90,147",a:.1},
       {x:.08,y:.5+Math.cos(t*.4)*.1,r:.3,col:"73,188,227",a:.08}
      ].forEach(b=>{
        const g=ctx.createRadialGradient(b.x*c.width,b.y*c.height,0,b.x*c.width,b.y*c.height,b.r*c.width);
        g.addColorStop(0,`rgba(${b.col},${b.a})`);g.addColorStop(1,"rgba(0,0,0,0)");
        ctx.fillStyle=g;ctx.fillRect(0,0,c.width,c.height);
      });
      ctx.strokeStyle="rgba(73,188,227,0.028)";ctx.lineWidth=1;
      for(let i=0;i<10;i++)ctx.strokeRect(i*c.width/10,0,c.width/10,c.height);
      for(let i=0;i<14;i++)ctx.strokeRect(0,i*c.height/14,c.width,c.height/14);
      frame=requestAnimationFrame(draw);
    }
    draw();
    return()=>{cancelAnimationFrame(frame);window.removeEventListener("resize",resize);};
  },[]);
  return <canvas ref={ref} style={{position:"fixed",inset:0,width:"100%",height:"100%",pointerEvents:"none",zIndex:0}}/>;
}

// ── TICKER ────────────────────────────────────────────────────────────────────
function Ticker({matches}){
  const items=matches.filter(m=>m.status==="live"||m.status==="finished").slice(0,10);
  if(!items.length)return null;
  const all=[...items,...items];
  return(
    <div style={{height:34,background:"rgba(0,0,0,0.65)",borderBottom:"1px solid rgba(73,188,227,0.18)",overflow:"hidden",position:"relative",zIndex:30}}>
      <div style={{position:"absolute",left:0,top:0,bottom:0,background:"#005A93",display:"flex",alignItems:"center",padding:"0 14px",gap:7,zIndex:2,borderRight:"1px solid rgba(73,188,227,0.3)"}}>
        <div style={{width:6,height:6,borderRadius:"50%",background:"#F4C542",boxShadow:"0 0 6px #F4C542",animation:"tdot 1.2s infinite"}}/>
        <span style={{fontFamily:"'Orbitron',monospace",fontSize:8,fontWeight:700,letterSpacing:3,color:"#fff"}}>LIVE</span>
      </div>
      <div style={{position:"absolute",right:0,top:0,bottom:0,width:40,background:"linear-gradient(90deg,transparent,rgba(8,20,40,.95))",zIndex:2,pointerEvents:"none"}}/>
      <div style={{display:"flex",alignItems:"center",height:"100%",paddingLeft:88,animation:"tsroll 50s linear infinite",whiteSpace:"nowrap"}}>
        {all.map((m,i)=>(
          <div key={i} style={{display:"flex",alignItems:"center",gap:7,paddingRight:28,borderRight:"1px solid rgba(255,255,255,0.07)",marginRight:28,flexShrink:0,fontSize:12,fontFamily:"'Rajdhani',sans-serif",fontWeight:600,color:"rgba(255,255,255,0.75)"}}>
            <span style={{fontSize:15}}>{FLAGS[m.home]||"🏳️"}</span>
            <span>{m.home}</span>
            <span style={{fontFamily:"'Orbitron',monospace",fontSize:12,fontWeight:900,letterSpacing:1,color:m.status==="live"?"#49BCE3":"rgba(255,255,255,0.35)"}}>{m.home_score??0}–{m.away_score??0}</span>
            <span>{m.away}</span>
            <span style={{fontSize:15}}>{FLAGS[m.away]||"🏳️"}</span>
            {m.status==="live"&&<span style={{fontFamily:"'Orbitron',monospace",fontSize:8,fontWeight:700,background:"#EF4444",color:"#fff",padding:"1px 5px",borderRadius:3,letterSpacing:1}}>{m.minute}'</span>}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── STYLES ────────────────────────────────────────────────────────────────────
const CSS=`
@import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Rajdhani:wght@400;500;600;700&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
body{background:#081428;color:#E8EDF5;font-family:'Rajdhani',sans-serif;overflow-x:hidden;}
:root{--pri:#005A93;--sec:#49BCE3;--acc:#F4C542;--dark:#0A1F44;--border:rgba(73,188,227,0.15);--border2:rgba(255,255,255,0.07);--muted:#6B7FA3;--muted2:#1a2e4a;--fo:'Orbitron',monospace;--fb:'Rajdhani',sans-serif;}
@keyframes tdot{0%,100%{opacity:1;box-shadow:0 0 6px #F4C542}50%{opacity:.3}}
@keyframes tsroll{0%{transform:translateX(0)}100%{transform:translateX(-50%)}}
@keyframes shimmer{0%{transform:translateX(-100%)}100%{transform:translateX(100%)}}

/* HEADER */
.hdr{background:rgba(6,21,48,0.92);backdrop-filter:blur(20px);border-bottom:1px solid var(--border);padding:0 16px;display:flex;align-items:center;height:54px;position:sticky;top:34px;z-index:25;gap:12px;}
.logo{font-family:var(--fo);font-size:18px;font-weight:900;color:#fff;letter-spacing:-1px;flex-shrink:0;}
.logo span{color:var(--sec);}
.hdr-mid{flex:1;display:flex;justify-content:center;}
.live-pill{display:flex;align-items:center;gap:7px;background:rgba(73,188,227,0.08);border:1px solid rgba(73,188,227,0.25);border-radius:20px;padding:5px 14px;font-family:var(--fo);font-size:9px;font-weight:700;color:var(--sec);letter-spacing:2px;}
.lpd{width:6px;height:6px;border-radius:50%;background:var(--sec);box-shadow:0 0 6px var(--sec);animation:tdot 1.4s infinite;}
.hdr-right{display:flex;align-items:center;gap:8px;flex-shrink:0;}
.fav-btn-h{background:rgba(244,197,66,0.1);border:1px solid rgba(244,197,66,0.25);border-radius:8px;padding:6px 10px;font-size:14px;cursor:pointer;position:relative;}
.fav-badge{position:absolute;top:-5px;right:-5px;background:var(--acc);color:var(--dark);font-family:var(--fo);font-size:7px;font-weight:900;width:14px;height:14px;border-radius:50%;display:flex;align-items:center;justify-content:center;}
.tip-hbtn{background:var(--acc);color:var(--dark);border:none;border-radius:8px;padding:7px 14px;font-family:var(--fo);font-size:9px;font-weight:700;letter-spacing:1px;cursor:pointer;}

/* NAV */
.nav{background:rgba(6,21,48,0.88);backdrop-filter:blur(20px);border-bottom:1px solid var(--border2);position:sticky;top:88px;z-index:20;}
.nr1{display:flex;align-items:center;padding:4px 16px;gap:2px;overflow-x:auto;scrollbar-width:none;border-bottom:1px solid rgba(255,255,255,0.04);}
.nr1::-webkit-scrollbar,.nr2::-webkit-scrollbar{display:none;}
.nr2{display:flex;align-items:center;padding:6px 16px;gap:6px;overflow-x:auto;scrollbar-width:none;}
.nt{font-family:var(--fo);font-size:9px;font-weight:700;letter-spacing:1.5px;padding:8px 14px;border-radius:6px;border:1px solid transparent;background:transparent;color:var(--muted);cursor:pointer;transition:all .18s;white-space:nowrap;text-transform:uppercase;}
.nt:hover{color:#E8EDF5;background:rgba(255,255,255,0.04);}
.nt.on{background:var(--pri);border-color:rgba(0,90,147,0.8);color:#fff;box-shadow:0 2px 12px rgba(0,90,147,0.4);}
.nf{font-family:var(--fb);font-size:12px;font-weight:600;padding:4px 14px;border-radius:20px;border:1.5px solid var(--border2);background:transparent;color:var(--muted);cursor:pointer;transition:all .15s;white-space:nowrap;}
.nf:hover{border-color:var(--sec);color:#E8EDF5;}
.nf.on{background:rgba(73,188,227,0.1);border-color:var(--sec);color:var(--sec);}
.nf.lf{border-color:rgba(239,68,68,0.3);color:#EF4444;}
.nf.lf.on{background:rgba(239,68,68,0.1);border-color:#EF4444;}
.ndiv{width:1px;height:14px;background:var(--border2);flex-shrink:0;margin:0 2px;}
.si{margin-left:auto;position:relative;flex-shrink:0;}
.sinp{background:rgba(255,255,255,0.04);border:1.5px solid var(--border2);border-radius:20px;padding:5px 12px 5px 28px;color:#E8EDF5;font-family:var(--fb);font-size:12px;width:140px;outline:none;transition:border-color .2s;}
.sinp:focus{border-color:var(--sec);}
.sico{position:absolute;left:9px;top:50%;transform:translateY(-50%);color:var(--muted);font-size:12px;pointer-events:none;}

/* CONTENT */
.app{max-width:920px;margin:0 auto;padding:16px 16px 100px;position:relative;z-index:1;}

/* SECTION LABEL */
.sl{font-family:var(--fo);font-size:9px;letter-spacing:4px;color:var(--muted);text-transform:uppercase;margin:20px 0 10px;display:flex;align-items:center;gap:12px;}
.sl::after{content:'';flex:1;height:1px;background:linear-gradient(90deg,var(--border),transparent);}

/* COUNTDOWN */
.cd{background:linear-gradient(135deg,rgba(0,90,147,0.35),rgba(73,188,227,0.08));border:1px solid var(--border);border-radius:14px;padding:18px 20px;margin-bottom:14px;display:flex;align-items:center;gap:16px;flex-wrap:wrap;}
.cd-left{flex:1;min-width:160px;}
.cd-eye{font-family:var(--fo);font-size:8px;letter-spacing:3px;color:var(--sec);margin-bottom:6px;text-transform:uppercase;}
.cd-match{font-family:var(--fb);font-size:15px;font-weight:700;color:#E8EDF5;margin-bottom:3px;}
.cd-venue{font-family:var(--fb);font-size:12px;color:var(--muted);}
.cd-nums{display:flex;gap:7px;flex-shrink:0;}
.cd-box{background:rgba(255,255,255,0.06);border:1px solid var(--border);border-radius:10px;padding:7px 10px;text-align:center;min-width:52px;}
.cd-n{font-family:var(--fo);font-size:24px;font-weight:900;color:#fff;line-height:1;}
.cd-s{font-family:var(--fo);font-size:7px;letter-spacing:2px;color:var(--muted);margin-top:3px;text-transform:uppercase;}
.notif{background:var(--acc);color:var(--dark);border:none;border-radius:8px;padding:9px 14px;font-family:var(--fo);font-size:8px;font-weight:700;letter-spacing:1px;cursor:pointer;flex-shrink:0;}
.notif.on{background:var(--sec);}

/* BARS */
.tz-bar{display:flex;align-items:center;gap:8px;background:rgba(73,188,227,0.04);border:1px solid var(--border);border-radius:6px;padding:8px 14px;margin-bottom:10px;font-size:12px;color:var(--muted);flex-wrap:wrap;}
.tzv{color:var(--sec);font-family:var(--fo);font-size:9px;letter-spacing:1px;font-weight:700;}
.sim-bar{display:flex;align-items:center;gap:8px;background:rgba(244,197,66,0.05);border:1px solid rgba(244,197,66,0.18);border-radius:6px;padding:8px 14px;margin-bottom:10px;font-size:12px;color:#F4C542;}
.err-bar{display:flex;align-items:center;gap:8px;background:rgba(239,68,68,0.05);border:1px solid rgba(239,68,68,0.18);border-radius:6px;padding:8px 14px;margin-bottom:10px;font-size:12px;color:#EF4444;}
.ref-btn{background:none;border:1px solid var(--border2);border-radius:4px;padding:4px 10px;color:var(--muted);font-family:var(--fo);font-size:8px;letter-spacing:2px;cursor:pointer;margin-left:auto;transition:all .2s;}
.ref-btn:hover{border-color:var(--sec);color:var(--sec);}

/* MATCH CARD */
.mg{display:flex;flex-direction:column;gap:8px;}
.mc{background:linear-gradient(135deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02));border:1.5px solid var(--border2);border-radius:14px;overflow:hidden;cursor:pointer;transition:all .2s cubic-bezier(.4,0,.2,1);position:relative;}
.mc::before{content:'';position:absolute;inset:0;background:linear-gradient(135deg,rgba(73,188,227,0.07),transparent 60%);opacity:0;transition:opacity .25s;pointer-events:none;border-radius:inherit;}
.mc:hover{border-color:rgba(73,188,227,0.35);transform:translateY(-2px);box-shadow:0 8px 24px rgba(73,188,227,0.1);}
.mc:hover::before{opacity:1;}
.mc.live{border-color:rgba(73,188,227,0.28);}
.mc.live::after{content:'';position:absolute;top:0;left:0;right:0;height:2px;background:linear-gradient(90deg,transparent,var(--sec),transparent);}
.mc-in{padding:14px 18px 16px;display:grid;grid-template-columns:1fr auto 1fr;align-items:center;gap:10px;position:relative;}
.gtag{position:absolute;top:10px;right:14px;font-family:var(--fo);font-size:7px;letter-spacing:2px;color:var(--muted2);}
.fmc{position:absolute;top:9px;right:48px;background:none;border:none;font-size:13px;cursor:pointer;opacity:.2;transition:opacity .2s;}
.fmc:hover,.fmc.on{opacity:1;}
.team{display:flex;flex-direction:column;gap:5px;}
.team.r{align-items:flex-end;}
.flag{font-size:26px;line-height:1;}
.tname{font-family:var(--fb);font-size:14px;font-weight:700;color:#E8EDF5;letter-spacing:1px;text-transform:uppercase;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:108px;}
.tname.win{color:var(--sec);}
.sb{text-align:center;min-width:84px;}
.score{font-family:var(--fo);font-size:34px;font-weight:900;color:#fff;letter-spacing:-1px;line-height:1;}
.score.lv{color:var(--sec);text-shadow:0 0 20px rgba(73,188,227,0.35);}
.vs{font-family:var(--fo);font-size:18px;color:var(--muted2);letter-spacing:4px;}
.badge{display:inline-block;padding:3px 9px;border-radius:20px;font-family:var(--fo);font-size:8px;font-weight:700;letter-spacing:1px;margin-top:4px;}
.bl{background:rgba(73,188,227,0.1);color:var(--sec);border:1px solid rgba(73,188,227,0.22);}
.bf{background:rgba(107,127,163,0.1);color:var(--muted);border:1px solid rgba(107,127,163,0.15);}
.bu{background:rgba(0,90,147,0.15);color:var(--sec);border:1px solid rgba(0,90,147,0.3);}
.meta{font-family:var(--fb);font-size:10px;color:var(--muted);margin-top:2px;}
.kick{font-family:var(--fo);font-size:10px;color:var(--sec);margin-top:2px;letter-spacing:1px;}
.evstrip{background:rgba(0,0,0,0.2);border-top:1px solid rgba(255,255,255,0.04);padding:7px 18px;display:flex;justify-content:space-between;align-items:center;}
.evstrip span{font-family:var(--fb);font-size:11px;color:var(--muted);}
.evstrip button{font-family:var(--fo);font-size:8px;color:var(--sec);letter-spacing:1px;background:none;border:none;cursor:pointer;}

/* TIPPING */
.tp{border-top:1px solid rgba(255,255,255,0.04);padding:9px 18px;background:rgba(244,197,66,0.02);display:flex;align-items:center;gap:10px;flex-wrap:wrap;}
.tlbl{font-family:var(--fo);font-size:8px;font-weight:700;letter-spacing:2px;color:var(--acc);min-width:36px;}
.tinp{width:38px;height:30px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);border-radius:4px;color:#fff;font-family:var(--fo);font-size:16px;text-align:center;outline:none;}
.tinp:focus{border-color:var(--acc);}
.tsep{font-family:var(--fo);font-size:14px;color:var(--muted2);}
.tsave{padding:6px 12px;background:var(--acc);border:none;border-radius:4px;color:var(--dark);font-family:var(--fo);font-size:8px;font-weight:700;letter-spacing:2px;cursor:pointer;}
.tr-ex{font-family:var(--fo);font-size:8px;padding:3px 9px;border-radius:3px;background:rgba(73,188,227,0.1);color:var(--sec);border:1px solid rgba(73,188,227,0.2);}
.tr-ok{font-family:var(--fo);font-size:8px;padding:3px 9px;border-radius:3px;background:rgba(73,188,227,0.08);color:var(--sec);border:1px solid rgba(73,188,227,0.15);}
.tr-no{font-family:var(--fo);font-size:8px;padding:3px 9px;border-radius:3px;background:rgba(239,68,68,0.08);color:#EF4444;border:1px solid rgba(239,68,68,0.15);}

/* STANDINGS */
.gtables{display:grid;grid-template-columns:repeat(auto-fill,minmax(310px,1fr));gap:10px;margin-top:8px;}
.gtbl{background:rgba(255,255,255,0.03);border:1.5px solid var(--border2);border-radius:12px;overflow:hidden;}
.gth{background:var(--pri);padding:10px 14px;display:flex;justify-content:space-between;align-items:center;}
.gth h4{font-family:var(--fo);font-size:11px;letter-spacing:2px;color:#fff;}
.gth span{font-family:var(--fb);font-size:11px;color:rgba(255,255,255,0.6);}
.gtbl table{width:100%;border-collapse:collapse;}
.gtbl th{font-family:var(--fo);font-size:7px;font-weight:700;letter-spacing:2px;color:var(--muted);text-transform:uppercase;padding:7px 10px 5px;text-align:center;border-bottom:1px solid var(--border2);background:rgba(0,0,0,0.15);}
.gtbl th:first-child{text-align:left;padding-left:12px;}
.gtbl td{padding:8px 10px;text-align:center;font-size:13px;border-bottom:1px solid rgba(255,255,255,0.02);font-family:var(--fb);}
.gtbl td:first-child{text-align:left;padding-left:12px;}
.gtbl tr:last-child td{border-bottom:none;}
.gtbl tr.q1 td{background:rgba(73,188,227,0.04);}
.gtbl tr.q2 td{background:rgba(73,188,227,0.02);}
.tc{display:flex;align-items:center;gap:6px;font-weight:600;}
.pos{width:17px;height:17px;border-radius:3px;display:flex;align-items:center;justify-content:center;font-family:var(--fo);font-size:8px;font-weight:900;flex-shrink:0;}
.p1{background:var(--pri);color:#fff;}
.p2{background:rgba(73,188,227,0.15);color:var(--sec);}
.p3,.p4{background:rgba(107,127,163,0.1);color:var(--muted);}
.pts{font-family:var(--fo);font-weight:700;color:var(--sec);}
.gdp{color:#4ade80;}.gdn{color:#f87171;}
.glegend{display:flex;gap:12px;padding:7px 12px;border-top:1px solid var(--border2);font-family:var(--fo);font-size:7px;letter-spacing:1px;color:var(--muted);text-transform:uppercase;}
.gld{display:inline-block;width:7px;height:7px;border-radius:2px;margin-right:4px;}

/* TEAMS */
.tgrid{display:grid;grid-template-columns:repeat(auto-fill,minmax(140px,1fr));gap:8px;margin-top:8px;}
.tcard{background:rgba(255,255,255,0.03);border:1.5px solid var(--border2);border-radius:10px;padding:14px 10px;text-align:center;cursor:pointer;transition:all .2s;position:relative;}
.tcard:hover{background:rgba(73,188,227,0.05);border-color:rgba(73,188,227,0.25);transform:translateY(-2px);}
.tcard.fav{border-color:rgba(244,197,66,0.3);background:rgba(244,197,66,0.02);}
.tcflag{font-size:32px;margin-bottom:8px;line-height:1;}
.tcname{font-family:var(--fb);font-size:12px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:#E8EDF5;}
.tcgrp{font-family:var(--fo);font-size:7px;color:var(--muted);margin-top:4px;letter-spacing:2px;}
.tcfav{position:absolute;top:7px;right:7px;background:none;border:none;font-size:11px;cursor:pointer;opacity:.2;transition:opacity .2s;}
.tcfav:hover,.tcfav.on{opacity:1;}

/* TIPPING PAGE */
.tsum{background:rgba(255,255,255,0.02);border:1.5px solid var(--border2);border-radius:12px;padding:20px;margin-bottom:20px;}
.tsum-title{font-family:var(--fo);font-size:11px;letter-spacing:3px;color:var(--acc);}
.tsum-big{font-family:var(--fo);font-size:52px;font-weight:900;color:#fff;line-height:1;margin:10px 0 4px;}
.tsum-sub{font-family:var(--fo);font-size:8px;letter-spacing:2px;color:var(--muted);}
.tsum-grid{display:flex;gap:10px;margin-top:14px;flex-wrap:wrap;}
.tsum-box{background:rgba(255,255,255,0.03);border:1px solid var(--border2);border-radius:6px;padding:10px 14px;text-align:center;flex:1;min-width:70px;}
.tsum-n{font-family:var(--fo);font-size:22px;color:#fff;}
.tsum-l{font-family:var(--fo);font-size:7px;letter-spacing:2px;text-transform:uppercase;color:var(--muted);margin-top:3px;}

/* SKELETON */
.skel{background:rgba(255,255,255,0.03);border:1px solid var(--border2);border-radius:10px;height:86px;position:relative;overflow:hidden;margin-bottom:8px;}
.skel::after{content:'';position:absolute;inset:0;background:linear-gradient(90deg,transparent,rgba(73,188,227,0.04),transparent);animation:shimmer 1.8s infinite;}

/* EMPTY */
.empty{text-align:center;padding:60px 20px;color:var(--muted);}
.eico{font-size:48px;margin-bottom:12px;}

::-webkit-scrollbar{width:3px;}
::-webkit-scrollbar-thumb{background:rgba(73,188,227,0.15);border-radius:2px;}

@media(max-width:600px){
  .tname{font-size:12px;max-width:78px;}.score{font-size:26px;}.mc-in{padding:12px 14px 14px;gap:8px;}.flag{font-size:20px;}
  .hdr{padding:0 12px;}.logo{font-size:15px;}.tip-hbtn span{display:none;}
  .cd-nums{gap:5px;}.cd-box{min-width:46px;padding:6px 8px;}.cd-n{font-size:20px;}
}
`;

// ── APP ───────────────────────────────────────────────────────────────────────
export default function App(){
  const[matches,setMatches]=useState([]);
  const[loading,setLoading]=useState(true);
  const[error,setError]=useState(null);
  const[isSim,setIsSim]=useState(false);
  const[tab,setTab]=useState("matches");
  const[sf,setSf]=useState("all");
  const[gf,setGf]=useState("all");
  const[q,setQ]=useState("");
  const[now,setNow]=useState(getNow());
  const[lastUp,setLastUp]=useState(null);
  const[notif,setNotif]=useState(false);
  const[sel,setSel]=useState(null);
  const[fmIds,setFmIds]=useState(()=>{try{return JSON.parse(localStorage.getItem("wc_fm")||"[]");}catch{return[];}});
  const[ftNames,setFtNames]=useState(()=>{try{return JSON.parse(localStorage.getItem("wc_ft")||"[]");}catch{return[];}});
  const[tips,setTips]=useState(()=>{try{return JSON.parse(localStorage.getItem("wc_tips")||"{}");}catch{return{};}});
  const[draft,setDraft]=useState({});

  const fetch_=useCallback(async()=>{
    if(!isLive()){setMatches(simMatches());setIsSim(true);setLoading(false);return;}
    try{const r=await fetch("/api/matches");if(!r.ok)throw new Error();const d=await r.json();if(d.error)throw new Error();setMatches(d.matches||[]);setIsSim(false);setError(null);setLastUp(new Date());}
    catch{setError("Could not load live data.");setMatches(simMatches());setIsSim(true);}
    finally{setLoading(false);}
  },[]);

  useEffect(()=>{fetch_();const t=setInterval(fetch_,isLive()?60000:5*60*1000);const c=setInterval(()=>setNow(getNow()),30000);return()=>{clearInterval(t);clearInterval(c);};},[fetch_]);
  useEffect(()=>{if("Notification"in window)setNotif(Notification.permission==="granted");},[]);
  useEffect(()=>{try{localStorage.setItem("wc_fm",JSON.stringify(fmIds));}catch{}},[fmIds]);
  useEffect(()=>{try{localStorage.setItem("wc_ft",JSON.stringify(ftNames));}catch{}},[ftNames]);
  useEffect(()=>{try{localStorage.setItem("wc_tips",JSON.stringify(tips));}catch{}},[tips]);

  const reqNotif=async()=>{if(!("Notification"in window))return;const p=await Notification.requestPermission();setNotif(p==="granted");};
  const togFM=id=>setFmIds(p=>p.includes(id)?p.filter(x=>x!==id):[...p,id]);
  const togFT=n=>setFtNames(p=>p.includes(n)?p.filter(x=>x!==n):[...p,n]);
  const saveTip=mid=>{const d=draft[mid];if(!d||d.h===""||d.a==="")return;setTips(p=>({...p,[mid]:{home:parseInt(d.h),away:parseInt(d.a)}}));};

  const liveN=matches.filter(m=>m.status==="live").length;
  const favN=fmIds.length+ftNames.length;
  const nextM=matches.find(m=>m.status==="upcoming"&&m.kickoff);
  const cd=useCountdown(nextM?.kickoff);
  const tippedFin=matches.filter(m=>tips[m.id]!==undefined&&m.status==="finished");
  const totalPts=tippedFin.reduce((s,m)=>s+(scoreTip(tips[m.id],m)||0),0);
  const exactN=tippedFin.filter(m=>scoreTip(tips[m.id],m)===3).length;
  const okN=tippedFin.filter(m=>scoreTip(tips[m.id],m)===1).length;
  const gkeys=matches.length?[...new Set(matches.map(m=>m.group))].filter(Boolean).sort():Object.keys(GROUPS);

  let fil=matches;
  if(tab==="favorites")fil=fil.filter(m=>fmIds.includes(m.id)||ftNames.includes(m.home)||ftNames.includes(m.away));
  if(sf!=="all")fil=fil.filter(m=>m.status===sf);
  if(gf!=="all")fil=fil.filter(m=>m.group===gf);
  if(q){const ql=q.toLowerCase();fil=fil.filter(m=>m.home.toLowerCase().includes(ql)||m.away.toLowerCase().includes(ql)||(m.venue||"").toLowerCase().includes(ql));}

  const allTeams=Object.entries(GROUPS).flatMap(([g,ts])=>ts.map(t=>({name:t,group:g})));
  const shownTeams=(tab==="favorites"?allTeams.filter(t=>ftNames.includes(t.name)):allTeams).filter(t=>!q||t.name.toLowerCase().includes(q.toLowerCase()));

  function MC({m,showTip=false}){
    const isFav=fmIds.includes(m.id);
    const hw=m.status==="finished"&&(m.home_score??0)>(m.away_score??0);
    const aw=m.status==="finished"&&(m.away_score??0)>(m.home_score??0);
    const saved=tips[m.id];const ts=saved?scoreTip(saved,m):null;
    const dr=draft[m.id]||{h:"",a:""};
    const goals=(m.events||[]).filter(e=>e.type==="goal").slice(0,4).map(e=>`${FLAGS[e.team]||""}${e.player.split(" ").pop()} ${e.minute}'`).join("  ·  ");
    return(
      <div className={`mc ${m.status}`}>
        <div className="mc-in" onClick={()=>setSel(m)}>
          <div className="gtag">GRP {m.group}</div>
          <button className={`fmc ${isFav?"on":""}`} onClick={e=>{e.stopPropagation();togFM(m.id);}}>{isFav?"⭐":"☆"}</button>
          <div className="team"><span className="flag">{FLAGS[m.home]||"🏳️"}</span><span className={`tname${hw?" win":""}`}>{m.home}</span></div>
          <div className="sb">
            {m.status==="upcoming"?(<><div className="vs">VS</div><div><span className="badge bu">{fmtD(m.kickoff)}</span></div><div className="kick">🕐 {fmtT(m.kickoff)}</div></>)
            :(<><div className={`score${m.status==="live"?" lv":""}`}>{m.home_score??"-"}<span style={{color:"var(--muted2)",fontSize:18}}> – </span>{m.away_score??"-"}</div>
               {m.status==="live"&&<div><span className="badge bl">● {m.minute||0}'</span></div>}
               {m.status==="finished"&&<div><span className="badge bf">Full Time</span></div>}
               <div className="meta">{m.venue}</div></>)}
          </div>
          <div className="team r"><span className="flag">{FLAGS[m.away]||"🏳️"}</span><span className={`tname${aw?" win":""}`}>{m.away}</span></div>
        </div>
        {goals&&<div className="evstrip"><span>⚽ {goals}</span><button onClick={()=>setSel(m)}>Details ▸</button></div>}
        {!goals&&m.status==="upcoming"&&<div className="evstrip"><span style={{fontFamily:"var(--fo)",fontSize:9,letterSpacing:1}}>📍 {m.venue}</span><button onClick={()=>setSel(m)}>Tip ▸</button></div>}
        {(showTip||tab==="tipping")&&(
          <div className="tp">
            <span className="tlbl">Tip</span>
            {saved&&m.status==="finished"?(<><span style={{fontFamily:"var(--fo)",fontSize:12,color:"var(--muted)",letterSpacing:1}}>{saved.home}–{saved.away}</span><span className={ts===3?"tr-ex":ts===1?"tr-ok":"tr-no"}>{ts===3?"🎯 Exact":ts===1?"✅ Correct":"❌ Wrong"} +{ts}pts</span></>)
            :saved&&m.status!=="finished"?(<><span style={{fontFamily:"var(--fo)",fontSize:12,color:"var(--muted)",letterSpacing:1}}>{saved.home}–{saved.away}</span><span style={{fontSize:11,color:"var(--muted)"}}>Locked</span><button style={{marginLeft:"auto",background:"none",border:"1px solid var(--border2)",borderRadius:3,color:"var(--muted)",fontSize:9,padding:"3px 8px",cursor:"pointer",fontFamily:"var(--fo)"}} onClick={()=>setTips(p=>{const n={...p};delete n[m.id];return n;})}>Edit</button></>)
            :m.status==="finished"?(<span style={{fontSize:12,color:"var(--muted)"}}>No tip</span>)
            :(<><div style={{display:"flex",alignItems:"center",gap:6}}><input className="tinp" type="number" min="0" max="20" placeholder="0" value={dr.h} onChange={e=>setDraft(p=>({...p,[m.id]:{...dr,h:e.target.value}}))}/><span className="tsep">–</span><input className="tinp" type="number" min="0" max="20" placeholder="0" value={dr.a} onChange={e=>setDraft(p=>({...p,[m.id]:{...dr,a:e.target.value}}))}/></div><button className="tsave" onClick={()=>saveTip(m.id)}>Save</button></>)}
          </div>
        )}
      </div>
    );
  }

  function GT({group}){
    const rows=buildTable(group,matches);
    const played=matches.filter(m=>m.group===group&&m.status!=="upcoming").length;
    const total=matches.filter(m=>m.group===group).length;
    return(
      <div className="gtbl">
        <div className="gth"><h4>Group {group}</h4><span>{played}/{total}</span></div>
        <table>
          <thead><tr><th>Pos</th><th style={{textAlign:"left"}}>Team</th><th>P</th><th>W</th><th>D</th><th>L</th><th>G</th><th>GD</th><th>PTS</th></tr></thead>
          <tbody>{rows.map((r,i)=>(
            <tr key={r.name} className={i===0?"q1":i===1?"q2":""}>
              <td><div className={`pos p${i+1}`}>{i+1}</div></td>
              <td><div className="tc"><span>{FLAGS[r.name]||"🏳️"}</span><span>{r.name}</span></div></td>
              <td>{r.p}</td><td>{r.w}</td><td>{r.d}</td><td>{r.l}</td><td>{r.gf}:{r.ga}</td>
              <td className={r.gd>0?"gdp":r.gd<0?"gdn":""}>{r.gd>0?`+${r.gd}`:r.gd}</td>
              <td className="pts">{r.pts}</td>
            </tr>
          ))}</tbody>
        </table>
        <div className="glegend"><span><span className="gld" style={{background:"rgba(73,188,227,.3)"}}/>Advance</span><span><span className="gld" style={{background:"rgba(73,188,227,.12)"}}/>3rd</span></div>
      </div>
    );
  }

  return(<>
    <style>{CSS}</style>
    <Aurora/>

    {/* TICKER */}
    <div style={{position:"sticky",top:0,zIndex:30}}>
      <Ticker matches={matches}/>

      {/* HEADER */}
      <div className="hdr">
        <div className="logo">WC<span>2026</span> ⚽</div>
        <div className="hdr-mid">
          {liveN>0?<div className="live-pill"><div className="lpd"/>{liveN} Live</div>
          :<div style={{fontFamily:"var(--fo)",fontSize:9,color:"var(--muted)",letterSpacing:2}}>Jun 11 – Jul 19, 2026</div>}
        </div>
        <div className="hdr-right">
          <div className="fav-btn-h" onClick={()=>setTab("favorites")} style={{cursor:"pointer"}}>⭐{favN>0&&<div className="fav-badge">{favN}</div>}</div>
          <button className="tip-hbtn" onClick={()=>setTab("tipping")}>🏆 <span>Tipping{totalPts>0?` · ${totalPts}pts`:""}</span></button>
        </div>
      </div>

      {/* NAV ROW 1 */}
      <div className="nav">
        <div className="nr1">
          {[{id:"matches",l:"Matches"},{id:"tables",l:"Standings"},{id:"bracket",l:"Bracket"},{id:"squads",l:"Squads"},{id:"teams",l:"Teams"},{id:"teamstats",l:"Stats"},{id:"favorites",l:"Favourites"}].map(t=>(
            <button key={t.id} className={`nt${tab===t.id?" on":""}`} onClick={()=>setTab(t.id)}>{t.l}</button>
          ))}
        </div>

        {/* NAV ROW 2 — contextual filters */}
        {(tab==="matches"||tab==="favorites"||tab==="tables")&&(
          <div className="nr2">
            {(tab==="matches"||tab==="favorites")&&(
              <>{[{v:"all",l:"All"},{v:"live",l:"● Live"},{v:"upcoming",l:"Upcoming"},{v:"finished",l:"Finished"}].map(f=>(
                <button key={f.v} className={`nf${sf===f.v?" on":""}${f.v==="live"?" lf":""}`} onClick={()=>setSf(f.v)}>{f.l}</button>
              ))}<div className="ndiv"/></>
            )}
            <button className={`nf${gf==="all"?" on":""}`} onClick={()=>setGf("all")}>All</button>
            {gkeys.map(g=><button key={g} className={`nf${gf===g?" on":""}`} onClick={()=>setGf(g)} style={{fontSize:11}}>G{g}</button>)}
            {(tab==="matches"||tab==="favorites")&&(
              <div className="si"><span className="sico">🔍</span><input className="sinp" placeholder="Search..." value={q} onChange={e=>setQ(e.target.value)}/></div>
            )}
          </div>
        )}
      </div>
    </div>

    <div className="app">
      {/* COUNTDOWN */}
      {(tab==="matches"||tab==="favorites")&&cd&&nextM&&(
        <div className="cd">
          <div className="cd-left">
            <div className="cd-eye">Next Match</div>
            <div className="cd-match">{FLAGS[nextM.home]||""} {nextM.home} vs {nextM.away} {FLAGS[nextM.away]||""}</div>
            <div className="cd-venue">{fmtD(nextM.kickoff)} · {fmtT(nextM.kickoff)} local · {nextM.venue}</div>
          </div>
          <div className="cd-nums">
            {cd.d>0&&<div className="cd-box"><div className="cd-n">{String(cd.d).padStart(2,"0")}</div><div className="cd-s">Days</div></div>}
            <div className="cd-box"><div className="cd-n">{String(cd.h).padStart(2,"0")}</div><div className="cd-s">Hrs</div></div>
            <div className="cd-box"><div className="cd-n">{String(cd.m).padStart(2,"0")}</div><div className="cd-s">Min</div></div>
            <div className="cd-box"><div className="cd-n">{String(cd.s).padStart(2,"0")}</div><div className="cd-s">Sec</div></div>
          </div>
          <button className={`notif${notif?" on":""}`} onClick={reqNotif}>{notif?"🔔 On":"🔕 Notify"}</button>
        </div>
      )}

      {/* MATCHES & FAVORITES */}
      {(tab==="matches"||tab==="favorites")&&(<>
        <div className="tz-bar">🌍 Local time: <span className="tzv">{getTz()}</span> · {now}<button className="ref-btn" onClick={fetch_}>⟳</button></div>
        {error&&<div className="err-bar">⚠ {error}</div>}
        {isSim&&!error&&<div className="sim-bar">⏳ Tournament starts June 11 — simulated data.</div>}
        {loading&&[1,2,3,4,5].map(i=><div key={i} className="skel"/>)}
        {!loading&&["live","upcoming","finished"].map(status=>{
          const g=fil.filter(m=>m.status===status);if(!g.length)return null;
          const lbl={live:"● Live Now",upcoming:"Upcoming",finished:"Finished"}[status];
          return<div key={status}><div className={`sl${status==="live"?" sl-live":""}`}>{lbl}</div><div className="mg">{g.map(m=><MC key={m.id} m={m}/>)}</div></div>;
        })}
        {!loading&&fil.length===0&&<div className="empty"><div className="eico">{tab==="favorites"?"⭐":"⚽"}</div><div>{tab==="favorites"?"No favourites yet — tap ☆ on a match.":"No matches found."}</div></div>}
      </>)}

      {/* TIPPING */}
      {tab==="tipping"&&(<>
        <div className="tsum">
          <div className="tsum-title">Tipping Score</div>
          <div className="tsum-big">{totalPts}</div>
          <div className="tsum-sub">Total Points · Exact = 3pts · Result = 1pt</div>
          <div className="tsum-grid">
            {[{n:Object.keys(tips).length,l:"Tips"},{n:exactN,l:"Exact",c:"var(--sec)"},{n:okN,l:"Correct",c:"var(--sec)"},{n:matches.filter(m=>m.status==="upcoming").length,l:"To Tip"}].map(s=>(
              <div key={s.l} className="tsum-box"><div className="tsum-n" style={s.c?{color:s.c}:{}}>{s.n}</div><div className="tsum-l">{s.l}</div></div>
            ))}
          </div>
        </div>
        {matches.filter(m=>m.status==="upcoming"&&!tips[m.id]).length>0&&(
          <><div className="sl">Place Tips</div><div className="mg">{matches.filter(m=>m.status==="upcoming"&&!tips[m.id]).slice(0,20).map(m=><MC key={m.id} m={m} showTip/>)}</div></>
        )}
        {Object.keys(tips).length>0&&(
          <><div className="sl">Your Tips</div><div className="mg">{matches.filter(m=>tips[m.id]!==undefined).map(m=><MC key={m.id} m={m} showTip/>)}</div></>
        )}
      </>)}

      {/* STANDINGS */}
      {tab==="tables"&&(<>
        <div className="sl">Group Standings</div>
        {isSim&&<div className="sim-bar" style={{marginBottom:12}}>⏳ Real data from June 11.</div>}
        <div className="gtables">{gkeys.filter(g=>gf==="all"||gf===g).map(g=><GT key={g} group={g}/>)}</div>
      </>)}

      {tab==="bracket"&&<><div className="sl">Knockout Bracket</div><Bracket matches={matches}/></>}
      {tab==="squads"&&<><div className="sl">Official Squads</div><SquadViewer/></>}
      {tab==="teamstats"&&<><div className="sl">Team Statistics</div><TeamStats matches={matches} favTeams={ftNames}/></>}

      {/* ALL TEAMS */}
      {tab==="teams"&&(<>
        <div style={{marginBottom:12}}><div className="si" style={{marginLeft:0}}><span className="sico">🔍</span><input className="sinp" placeholder="Search team..." value={q} onChange={e=>setQ(e.target.value)}/></div></div>
        {Object.keys(GROUPS).map(g=>{
          const show=shownTeams.filter(t=>t.group===g);if(!show.length)return null;
          return(<div key={g}><div className="sl">Group {g}</div><div className="tgrid">
            {show.map(t=>(<div key={t.name} className={`tcard${ftNames.includes(t.name)?" fav":""}`}>
              <button className={`tcfav${ftNames.includes(t.name)?" on":""}`} onClick={()=>togFT(t.name)}>{ftNames.includes(t.name)?"⭐":"☆"}</button>
              <div className="tcflag">{FLAGS[t.name]||"🏳️"}</div>
              <div className="tcname">{t.name}</div>
              <div className="tcgrp">Group {t.group}</div>
            </div>))}
          </div></div>);
        })}
      </>)}

      <div style={{textAlign:"center",color:"var(--muted2)",fontFamily:"var(--fo)",fontSize:"7px",letterSpacing:"3px",marginTop:60,borderTop:"1px solid rgba(255,255,255,0.03)",paddingTop:20}}>
        {lastUp&&!isSim&&<span>Updated {lastUp.toLocaleTimeString(undefined,{hour:"2-digit",minute:"2-digit"})} · </span>}
        Not Affiliated With FIFA · wclivescores.com
      </div>
    </div>

    {sel&&<MatchModal match={sel} onClose={()=>setSel(null)}/>}
  </>);
}
