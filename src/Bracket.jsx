// Bracket.jsx — WC 2026 Knockout Bracket with real qualified teams

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

// Round of 32 — confirmed matchups as of June 27
const R32 = [
  { id:1,  date:"Jun 28", home:"Mexico",      away:"South Korea",       venue:"Estadio Azteca" },
  { id:2,  date:"Jun 28", home:"Switzerland", away:"Morocco",           venue:"BC Place" },
  { id:3,  date:"Jun 29", home:"Canada",      away:"South Africa",      venue:"SoFi Stadium" },
  { id:4,  date:"Jun 29", home:"Brazil",      away:"Japan",             venue:"NRG Stadium" },
  { id:5,  date:"Jun 30", home:"Germany",     away:"Ecuador",           venue:"Mercedes-Benz Stadium" },
  { id:6,  date:"Jun 30", home:"Netherlands", away:"Sweden",            venue:"MetLife Stadium" },
  { id:7,  date:"Jul 1",  home:"USA",         away:"Bosnia-Herzegovina",venue:"Levi's Stadium" },
  { id:8,  date:"Jul 1",  home:"Ivory Coast", away:"Egypt",             venue:"AT&T Stadium" },
  { id:9,  date:"Jul 1",  home:"Belgium",     away:"Australia",         venue:"Hard Rock Stadium" },
  { id:10, date:"Jul 2",  home:"Spain",       away:"Cape Verde",        venue:"SoFi Stadium" },
  { id:11, date:"Jul 2",  home:"France",      away:"Ivory Coast",       venue:"Lincoln Financial Field" },
  { id:12, date:"Jul 2",  home:"Norway",      away:"Senegal",           venue:"MetLife Stadium" },
  { id:13, date:"Jul 3",  home:"Argentina",   away:"Cape Verde",        venue:"Levi's Stadium" },
  { id:14, date:"Jul 3",  home:"Colombia",    away:"Portugal",          venue:"Hard Rock Stadium" },
  { id:15, date:"Jul 3",  home:"England",     away:"Ghana",             venue:"Gillette Stadium" },
  { id:16, date:"Jul 3",  home:"Croatia",     away:"Paraguay",          venue:"Arrowhead Stadium" },
];

const R16 = [
  { id:17, date:"Jul 5", home:"W1", away:"W2" },
  { id:18, date:"Jul 5", home:"W3", away:"W4" },
  { id:19, date:"Jul 6", home:"W5", away:"W6" },
  { id:20, date:"Jul 6", home:"W7", away:"W8" },
  { id:21, date:"Jul 7", home:"W9", away:"W10" },
  { id:22, date:"Jul 7", home:"W11", away:"W12" },
  { id:23, date:"Jul 8", home:"W13", away:"W14" },
  { id:24, date:"Jul 8", home:"W15", away:"W16" },
];

const QF = [
  { id:25, date:"Jul 10", home:"W17", away:"W18" },
  { id:26, date:"Jul 10", home:"W19", away:"W20" },
  { id:27, date:"Jul 11", home:"W21", away:"W22" },
  { id:28, date:"Jul 11", home:"W23", away:"W24" },
];

const SF = [
  { id:29, date:"Jul 14", home:"W25", away:"W26" },
  { id:30, date:"Jul 15", home:"W27", away:"W28" },
];

const FINAL = [
  { id:31, date:"Jul 18", home:"L29", away:"L30", label:"3rd Place" },
  { id:32, date:"Jul 19", home:"W29", away:"W30", label:"🏆 FINAL" },
];

const BS = `
.bracket-wrap{overflow-x:auto;padding-bottom:16px;-webkit-overflow-scrolling:touch;}
.bracket-grid{display:flex;gap:12px;min-width:960px;align-items:flex-start;}
.bracket-round{display:flex;flex-direction:column;flex:1;min-width:170px;}
.br-title{font-family:'Orbitron',monospace;font-size:10px;letter-spacing:3px;color:#49BCE3;text-align:center;padding:0 6px 12px;text-transform:uppercase;}
.br-slots{display:flex;flex-direction:column;justify-content:space-around;flex:1;gap:8px;padding:0 4px;}
.bm{background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:10px;overflow:hidden;transition:border-color .2s;}
.bm:hover{border-color:rgba(73,188,227,0.3);}
.bm-label{font-family:'Orbitron',monospace;font-size:8px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:#2a3e5e;padding:5px 8px 3px;background:rgba(0,0,0,0.2);}
.bm-team{display:flex;align-items:center;gap:6px;padding:7px 8px;font-size:12px;font-weight:600;border-bottom:1px solid rgba(255,255,255,0.05);color:#E8EDF5;font-family:'Rajdhani',sans-serif;}
.bm-team:last-child{border-bottom:none;}
.bm-team.tbd{color:#2a3e5e;font-style:italic;}
.bm-team.winner{background:rgba(73,188,227,0.08);color:#49BCE3;}
.bm-flag{font-size:15px;}
.bm-score{margin-left:auto;font-family:'Orbitron',monospace;font-size:13px;color:#6B7FA3;}
.bm-score.win{color:#E8EDF5;}
.bm-date{font-size:9px;color:#2a3e5e;padding:3px 8px 4px;background:rgba(0,0,0,0.2);text-align:right;font-family:'Orbitron',monospace;letter-spacing:1px;}
.final-m .bm{border-color:rgba(244,197,66,0.3);background:linear-gradient(135deg,rgba(244,197,66,0.06),rgba(244,197,66,0.02));}
.final-m .bm-label{color:#F4C542;}
.info-box{background:rgba(0,90,147,0.15);border:1px solid rgba(73,188,227,0.2);border-radius:10px;padding:12px 16px;margin-bottom:16px;font-size:12px;color:#6B7FA3;line-height:1.5;}
.info-box strong{color:#49BCE3;}
`;

function BM({ m, isFinal, label }) {
  const homeFlag = FLAGS[m.home];
  const awayFlag = FLAGS[m.away];
  const isTBDHome = !homeFlag && m.home?.startsWith("W");
  const isTBDAway = !awayFlag && m.away?.startsWith("W");
  const hw = m.home_score !== undefined && m.away_score !== undefined && m.home_score > m.away_score;
  const aw = m.home_score !== undefined && m.away_score !== undefined && m.away_score > m.home_score;

  return (
    <div className={isFinal ? "bm final-m" : "bm"} style={isFinal ? {} : {}}>
      {label && <div className="bm-label">{label}</div>}
      {!label && <div className="bm-label">Match {m.id}</div>}
      <div className={`bm-team ${isTBDHome ? "tbd" : ""} ${hw ? "winner" : ""}`}>
        <span className="bm-flag">{homeFlag || "🏳️"}</span>
        <span>{isTBDHome ? m.home : m.home}</span>
        {m.home_score !== undefined && <span className={`bm-score ${hw ? "win" : ""}`}>{m.home_score}</span>}
      </div>
      <div className={`bm-team ${isTBDAway ? "tbd" : ""} ${aw ? "winner" : ""}`}>
        <span className="bm-flag">{awayFlag || "🏳️"}</span>
        <span>{isTBDAway ? m.away : m.away}</span>
        {m.away_score !== undefined && <span className={`bm-score ${aw ? "win" : ""}`}>{m.away_score}</span>}
      </div>
      <div className="bm-date">{m.venue ? `${m.date} · ${m.venue}` : m.date}</div>
    </div>
  );
}

export default function Bracket() {
  return (
    <>
      <style>{BS}</style>
      <div className="info-box">
        🏆 Round of 32 begins <strong>June 28</strong>. 32 teams qualify: top 2 from each of 12 groups + 8 best 3rd-place teams. Bracket updates as teams advance.
      </div>
      <div className="bracket-wrap">
        <div className="bracket-grid">

          {/* R32 */}
          <div className="bracket-round">
            <div className="br-title">Round of 32</div>
            <div className="br-slots">
              {R32.map(m => <BM key={m.id} m={m}/>)}
            </div>
          </div>

          {/* R16 */}
          <div className="bracket-round">
            <div className="br-title">Round of 16</div>
            <div className="br-slots">
              {R16.map(m => <BM key={m.id} m={m}/>)}
            </div>
          </div>

          {/* QF */}
          <div className="bracket-round">
            <div className="br-title">Quarter Finals</div>
            <div className="br-slots">
              {QF.map(m => <BM key={m.id} m={m}/>)}
            </div>
          </div>

          {/* SF */}
          <div className="bracket-round">
            <div className="br-title">Semi Finals</div>
            <div className="br-slots">
              {SF.map(m => <BM key={m.id} m={m}/>)}
            </div>
          </div>

          {/* FINAL */}
          <div className="bracket-round">
            <div className="br-title">Final</div>
            <div className="br-slots">
              {FINAL.map(m => (
                <div key={m.id} className={m.label?.includes("FINAL") ? "final-m" : ""}>
                  <BM m={m} label={m.label}/>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </>
  );
}
