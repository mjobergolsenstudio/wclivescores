import { useState, useEffect } from "react";

const QUESTIONS = [
  {
    q: "It's Saturday night. What's your vibe?",
    opts: [
      { e: "💃", t: "Dancing until sunrise — life is a party", tags: { brazil: 3, spain: 2, mexico: 1 } },
      { e: "📚", t: "Prepping for next week — always a step ahead", tags: { germany: 3, england: 2, japan: 1 } },
      { e: "🍕", t: "Hosting friends with amazing food and wine", tags: { france: 2, italy: 3, argentina: 1 } },
      { e: "🎯", t: "Solo flow — focused on your own thing", tags: { usa: 2, portugal: 1, netherlands: 2 } },
    ],
  },
  {
    q: "How do you handle a crisis?",
    opts: [
      { e: "🔥", t: "Attack it head-on. Chaos is my playground.", tags: { brazil: 2, argentina: 3, portugal: 1 } },
      { e: "📋", t: "Make a plan. Execute the plan. Win.", tags: { germany: 3, england: 2, japan: 2 } },
      { e: "🤝", t: "Rally the team and sort it together", tags: { france: 3, spain: 2, usa: 1 } },
      { e: "🧘", t: "Stay calm, adapt, trust the process", tags: { japan: 3, south_korea: 2, morocco: 1 } },
    ],
  },
  {
    q: "Pick your football philosophy:",
    opts: [
      { e: "✨", t: "Beautiful, creative, flair-first football", tags: { brazil: 3, spain: 2, portugal: 2 } },
      { e: "⚙️", t: "Tactical precision — every player knows their role", tags: { germany: 3, italy: 2, netherlands: 2 } },
      { e: "❤️", t: "Heart and passion above everything", tags: { argentina: 3, mexico: 2, morocco: 2 } },
      { e: "🚀", t: "Direct, fast, physical — let's get it done", tags: { england: 3, usa: 2, australia: 2 } },
    ],
  },
  {
    q: "Your ideal holiday destination?",
    opts: [
      { e: "🏖️", t: "Tropical beach with music and colour", tags: { brazil: 3, mexico: 2, senegal: 1 } },
      { e: "🏔️", t: "Mountain trek — challenge and panorama", tags: { switzerland: 2, germany: 1, colombia: 2 } },
      { e: "🏙️", t: "Buzzing metropolis — culture, food, nightlife", tags: { france: 3, spain: 2, japan: 2 } },
      { e: "🏜️", t: "Desert or open plains — raw, untamed", tags: { morocco: 3, senegal: 2, usa: 1 } },
    ],
  },
  {
    q: "Your superpower in a team?",
    opts: [
      { e: "🎨", t: "Creativity — I come up with the unexpected idea", tags: { brazil: 2, portugal: 3, spain: 2 } },
      { e: "🛡️", t: "Reliability — I never let the team down", tags: { germany: 3, england: 2, japan: 3 } },
      { e: "🗣️", t: "Leadership — I lift everyone around me", tags: { argentina: 3, france: 2, usa: 2 } },
      { e: "⚡", t: "Energy — I bring the intensity every time", tags: { mexico: 3, south_korea: 2, australia: 2 } },
    ],
  },
  {
    q: "How do you celebrate a big win?",
    opts: [
      { e: "🕺", t: "Wild dancing and singing — maximum joy", tags: { brazil: 3, mexico: 3, senegal: 2 } },
      { e: "🍾", t: "Elegant dinner with the people I love most", tags: { france: 3, italy: 2, spain: 1 } },
      { e: "🏆", t: "Hoist the trophy and soak it all in", tags: { argentina: 3, germany: 2, portugal: 2 } },
      { e: "🔮", t: "Start planning the next challenge immediately", tags: { england: 2, usa: 2, netherlands: 2 } },
    ],
  },
  {
    q: "What's your fashion sense?",
    opts: [
      { e: "🌈", t: "Colourful, bold, loud — you'll notice me", tags: { brazil: 3, mexico: 2, senegal: 2 } },
      { e: "🖤", t: "Minimalist and sleek — less is more", tags: { germany: 2, netherlands: 3, japan: 2 } },
      { e: "👑", t: "Classic with a touch of luxury", tags: { france: 3, spain: 2, portugal: 2 } },
      { e: "🤠", t: "Comfortable and practical — function over form", tags: { usa: 3, australia: 3, england: 1 } },
    ],
  },
  {
    q: "How do you feel about underdogs?",
    opts: [
      { e: "🙌", t: "I AM the underdog — and I love it", tags: { morocco: 3, south_korea: 3, senegal: 2 } },
      { e: "🦁", t: "I expect to win. Always.", tags: { brazil: 2, argentina: 3, germany: 2 } },
      { e: "😎", t: "I root for the underdog while quietly preparing to dominate", tags: { spain: 2, france: 3, portugal: 2 } },
      { e: "🤝", t: "Every game is equal — it's about the day", tags: { japan: 3, england: 2, usa: 2 } },
    ],
  },
  {
    q: "Pick a movie genre:",
    opts: [
      { e: "🎭", t: "Epic drama with passion and heartbreak", tags: { argentina: 3, italy: 3, portugal: 2 } },
      { e: "🕵️", t: "Thriller — cerebral, tactical, intense", tags: { germany: 3, spain: 2, netherlands: 2 } },
      { e: "🎉", t: "Comedy — life's too short not to laugh", tags: { brazil: 3, mexico: 2, australia: 2 } },
      { e: "🚀", t: "Action blockbuster — explosions, energy, pace", tags: { usa: 3, england: 2, france: 1 } },
    ],
  },
  {
    q: "Your football legacy would be...",
    opts: [
      { e: "🌟", t: "The most entertaining team the world ever saw", tags: { brazil: 3, spain: 2, portugal: 2 } },
      { e: "🏅", t: "Multiple titles through sheer consistency", tags: { germany: 3, france: 2, argentina: 2 } },
      { e: "💥", t: "One perfect tournament that nobody forgets", tags: { south_korea: 3, morocco: 3, argentina: 1 } },
      { e: "🌍", t: "Inspiring an entire generation and continent", tags: { senegal: 3, morocco: 2, usa: 2 } },
    ],
  },
];

const NATIONS = {
  brazil:      { name: "Brazil",       flag: "🇧🇷", desc: "You live for passion, creativity, and joy. You make everything look effortless — and you're always the life of the party.", traits: ["Creative", "Passionate", "Magnetic"] },
  germany:     { name: "Germany",      flag: "🇩🇪", desc: "Disciplined, efficient, unstoppable. You show up prepared every single time and deliver when it counts most.", traits: ["Reliable", "Tactical", "Precise"] },
  argentina:   { name: "Argentina",    flag: "🇦🇷", desc: "Emotional, dramatic, brilliant. You carry the weight of expectation and turn it into pure gold when the moment arrives.", traits: ["Leader", "Intense", "Legendary"] },
  france:      { name: "France",       flag: "🇫🇷", desc: "Elegant, sophisticated, and deceptively dangerous. You combine style and substance like nobody else.", traits: ["Refined", "Smart", "Adaptable"] },
  spain:       { name: "Spain",        flag: "🇪🇸", desc: "Patient, artistic, and methodical. You control the tempo of everything — life is a game of possession.", traits: ["Artistic", "Patient", "Technical"] },
  portugal:    { name: "Portugal",     flag: "🇵🇹", desc: "Individual brilliance wrapped in team ambition. One moment of magic from you can change everything.", traits: ["Brilliant", "Flair", "Driven"] },
  england:     { name: "England",      flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", desc: "Passionate, energetic, and eternally optimistic. You believe deeply — and you're building toward something historic.", traits: ["Energetic", "Hopeful", "Passionate"] },
  japan:       { name: "Japan",        flag: "🇯🇵", desc: "Disciplined, humble, and quietly lethal. People underestimate you — and that's exactly how you like it.", traits: ["Disciplined", "Precise", "Determined"] },
  morocco:     { name: "Morocco",      flag: "🇲🇦", desc: "The ultimate underdog story. You defy expectations with heart, organisation, and a burning desire to make history.", traits: ["Resilient", "United", "Historic"] },
  usa:         { name: "USA",          flag: "🇺🇸", desc: "Bold, ambitious, and always improving. You bring raw energy and you're not afraid to dream big.", traits: ["Bold", "Athletic", "Ambitious"] },
  mexico:      { name: "Mexico",       flag: "🇲🇽", desc: "Festive, passionate, and never boring. You bring the most electric atmosphere wherever you go.", traits: ["Electric", "Passionate", "Fun"] },
  south_korea: { name: "South Korea",  flag: "🇰🇷", desc: "High energy, disciplined, and capable of miracle runs. You surprise everyone with your intensity and never give up.", traits: ["Intense", "Never-give-up", "Surprising"] },
  netherlands: { name: "Netherlands",  flag: "🇳🇱", desc: "Total football, total thinker. You see the big picture and execute with precision and intelligence.", traits: ["Intelligent", "Versatile", "Principled"] },
  senegal:     { name: "Senegal",      flag: "🇸🇳", desc: "Raw talent, unity, and continental pride. You play with a freedom and joy that is simply infectious.", traits: ["Joyful", "United", "Explosive"] },
  italy:       { name: "Italy",        flag: "🇮🇹", desc: "Stylish, tactical, and historically magnificent. You know how to win the moments that matter most.", traits: ["Stylish", "Tactical", "Winner"] },
  australia:   { name: "Australia",    flag: "🇦🇺", desc: "Fearless and down-to-earth. You never back down from a challenge and you do it with a smile.", traits: ["Fearless", "Spirited", "Grounded"] },
  colombia:    { name: "Colombia",     flag: "🇨🇴", desc: "Expressive, talented, and magnetic. Your style of football is pure entertainment.", traits: ["Expressive", "Talented", "Entertaining"] },
  switzerland: { name: "Switzerland",  flag: "🇨🇭", desc: "Solid, reliable, and full of surprises. You're always better than people expect.", traits: ["Solid", "Composed", "Underrated"] },
};

function getTopNation(scores) {
  return Object.entries(scores).sort((a, b) => b[1] - a[1])[0]?.[0] || "brazil";
}

export default function NationQuiz() {
  const [screen, setScreen] = useState("start"); // start | quiz | result
  const [currentQ, setCurrentQ] = useState(0);
  const [scores, setScores] = useState({});
  const [result, setResult] = useState(null);
  const [copied, setCopied] = useState(false);

  const answer = (tags) => {
    const newScores = { ...scores };
    for (const [nation, pts] of Object.entries(tags)) {
      newScores[nation] = (newScores[nation] || 0) + pts;
    }
    setScores(newScores);

    if (currentQ + 1 >= QUESTIONS.length) {
      setResult(getTopNation(newScores));
      setScreen("result");
    } else {
      setCurrentQ(currentQ + 1);
    }
  };

  const restart = () => {
    setScreen("start");
    setCurrentQ(0);
    setScores({});
    setResult(null);
    setCopied(false);
  };

  const nation = result ? NATIONS[result] : null;

  const shareText = nation
    ? `I just took the FIFA World Cup 2026 quiz and I'm ${nation.flag} ${nation.name}! Which nation are you? ⚽ ${window.location.origin}/quiz`
    : "";

  const handleCopy = () => {
    navigator.clipboard.writeText(shareText).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  const handleTwitter = () => {
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`, "_blank");
  };

  const pct = Math.round((currentQ / QUESTIONS.length) * 100);
  const q = QUESTIONS[currentQ];

  return (
    <div style={{
      fontFamily: "'Nunito', sans-serif",
      background: "linear-gradient(160deg, #0d0d1a 0%, #0f1923 100%)",
      minHeight: "100vh",
      color: "#fff",
      padding: "0 0 60px",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Nunito:wght@400;600;700;800&display=swap');
        @keyframes slideUp { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
        @keyframes popIn { from { opacity:0; transform:scale(0.85); } to { opacity:1; transform:scale(1); } }
        @keyframes bounce { 0%,100% { transform:translateY(0); } 50% { transform:translateY(-10px); } }
        .quiz-opt:hover { background: rgba(255,215,0,0.08) !important; border-color: rgba(255,215,0,0.35) !important; color: #fff !important; transform: translateX(4px); }
        .quiz-opt { transition: all 0.18s; }
        .share-btn:hover { transform: scale(1.04); filter: brightness(1.1); }
      `}</style>

      {/* Header */}
      <div style={{ textAlign: "center", padding: "40px 20px 28px" }}>
        <span style={{ fontSize: "52px", display: "block", animation: "bounce 2s ease-in-out infinite", marginBottom: "10px" }}>⚽</span>
        <h1 style={{
          fontFamily: "'Bebas Neue', sans-serif",
          fontSize: "clamp(30px, 8vw, 52px)",
          letterSpacing: "2px",
          background: "linear-gradient(135deg, #fff 0%, #FFD700 50%, #FFA500 100%)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          margin: "0 0 6px",
          lineHeight: 1.05,
        }}>
          Which World Cup<br />Nation Are You?
        </h1>
        <p style={{ color: "#666", fontSize: "14px", fontWeight: 600 }}>
          10 questions · FIFA World Cup 2026 · 18 possible nations
        </p>
      </div>

      <div style={{ maxWidth: 580, margin: "0 auto", padding: "0 16px" }}>

        {/* ── START ── */}
        {screen === "start" && (
          <div style={{ animation: "slideUp 0.35s ease", background: "#141428", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 20, padding: "32px 24px", textAlign: "center" }}>
            <p style={{ color: "#aaa", fontSize: 15, fontWeight: 600, lineHeight: 1.6, marginBottom: 24 }}>
              The FIFA World Cup 2026 kicks off <strong style={{ color: "#FFD700" }}>June 11</strong> with <strong style={{ color: "#FFD700" }}>48 nations</strong> competing across the USA, Canada & Mexico.<br /><br />
              Answer 10 questions and find out which country matches your soul.
            </p>
            <button
              onClick={() => setScreen("quiz")}
              style={{ background: "linear-gradient(135deg, #00C853, #00a844)", color: "#fff", border: "none", borderRadius: 16, padding: "18px 44px", fontSize: 18, fontWeight: 800, cursor: "pointer", fontFamily: "'Nunito', sans-serif" }}
            >
              ⚽ Start the Quiz
            </button>
            <div style={{ display: "flex", gap: 16, justifyContent: "center", marginTop: 20 }}>
              {["🕐 2 minutes", "📊 10 questions", "🌍 18 possible nations"].map(t => (
                <span key={t} style={{ fontSize: 13, color: "#555", fontWeight: 700 }}>{t}</span>
              ))}
            </div>
          </div>
        )}

        {/* ── QUIZ ── */}
        {screen === "quiz" && (
          <div style={{ animation: "slideUp 0.35s ease" }}>
            {/* Progress */}
            <div style={{ marginBottom: 24 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: "#666", fontWeight: 700, marginBottom: 8 }}>
                <span>Question {currentQ + 1} of {QUESTIONS.length}</span>
                <span>{pct}%</span>
              </div>
              <div style={{ height: 6, background: "rgba(255,255,255,0.08)", borderRadius: 99, overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${pct}%`, background: "linear-gradient(90deg, #00C853, #FFD700)", borderRadius: 99, transition: "width 0.4s cubic-bezier(0.4,0,0.2,1)" }} />
              </div>
            </div>

            {/* Question */}
            <div style={{ background: "#141428", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 18, padding: "24px 20px", marginBottom: 14 }}>
              <p style={{ fontSize: 12, fontWeight: 800, color: "#FFD700", letterSpacing: 2, textTransform: "uppercase", marginBottom: 10 }}>Question {currentQ + 1}</p>
              <p style={{ fontSize: "clamp(17px,4vw,21px)", fontWeight: 800, lineHeight: 1.35 }}>{q.q}</p>
            </div>

            {/* Options */}
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {q.opts.map((opt, i) => (
                <button
                  key={i}
                  className="quiz-opt"
                  onClick={() => answer(opt.tags)}
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    border: "1.5px solid rgba(255,255,255,0.09)",
                    borderRadius: 14,
                    padding: "16px 20px",
                    cursor: "pointer",
                    fontFamily: "'Nunito', sans-serif",
                    fontSize: 15,
                    fontWeight: 700,
                    color: "#ddd",
                    textAlign: "left",
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    width: "100%",
                  }}
                >
                  <span style={{ fontSize: 22, flexShrink: 0 }}>{opt.e}</span>
                  <span>{opt.t}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── RESULT ── */}
        {screen === "result" && nation && (
          <div style={{ animation: "popIn 0.5s cubic-bezier(0.34,1.56,0.64,1)", background: "#141428", border: "1px solid rgba(255,215,0,0.2)", borderRadius: 24, padding: "36px 24px", textAlign: "center" }}>
            <span style={{ fontSize: 80, display: "block", marginBottom: 10 }}>{nation.flag}</span>
            <p style={{ fontSize: 13, fontWeight: 800, color: "#666", letterSpacing: 3, textTransform: "uppercase", marginBottom: 6 }}>You Are</p>
            <div style={{
              fontFamily: "'Bebas Neue', sans-serif",
              fontSize: "clamp(36px,10vw,60px)",
              letterSpacing: 2,
              background: "linear-gradient(135deg, #FFD700, #FFA500)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              marginBottom: 14,
              lineHeight: 1,
            }}>
              {nation.name}
            </div>
            <p style={{ fontSize: 15, color: "#bbb", lineHeight: 1.6, fontWeight: 600, marginBottom: 24, maxWidth: 380, margin: "0 auto 24px" }}>
              {nation.desc}
            </p>
            <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap", marginBottom: 28 }}>
              {nation.traits.map(t => (
                <span key={t} style={{ background: "rgba(255,215,0,0.1)", border: "1px solid rgba(255,215,0,0.2)", borderRadius: 20, padding: "6px 14px", fontSize: 13, fontWeight: 700, color: "#FFD700" }}>
                  {t}
                </span>
              ))}
            </div>

            {/* Share */}
            <p style={{ fontSize: 12, color: "#555", fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", marginBottom: 12 }}>Share your result</p>
            <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap", marginBottom: 20 }}>
              <button className="share-btn" onClick={handleTwitter} style={{ background: "#1DA1F2", color: "#fff", border: "none", borderRadius: 12, padding: "12px 22px", fontSize: 14, fontWeight: 800, cursor: "pointer", fontFamily: "'Nunito',sans-serif" }}>
                𝕏 Share on X
              </button>
              <button className="share-btn" onClick={handleCopy} style={{ background: "rgba(255,255,255,0.08)", color: "#fff", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 12, padding: "12px 22px", fontSize: 14, fontWeight: 800, cursor: "pointer", fontFamily: "'Nunito',sans-serif" }}>
                {copied ? "✅ Copied!" : "📋 Copy"}
              </button>
            </div>

            <button onClick={restart} style={{ background: "transparent", border: "1.5px solid rgba(255,255,255,0.15)", color: "#888", padding: "10px 22px", borderRadius: 12, fontFamily: "'Nunito',sans-serif", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>
              🔄 Try again
            </button>

            <p style={{ marginTop: 20, fontSize: 13, color: "#444", fontWeight: 600 }}>
              ⚽ VM starter 11. juni — <a href="/" style={{ color: "#FFD700", textDecoration: "none" }}>følg live scores →</a>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
