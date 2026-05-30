import { useState, useEffect, useRef, useCallback } from "react";

// ══════════════════════════════════════════════════════════════════════════════
//  PALETTE — Paraguay flag + regional colors
// ══════════════════════════════════════════════════════════════════════════════
const C = {
  red:"#D52B1E", white:"#FFFFFF", blue:"#0038A8",
  gold:"#C8A551", green:"#2D6A4F", terra:"#C1440E",
  river:"#4A90D9", jungle:"#1B4332", slate:"#4A5568",
  bg:"#F7F3EE", surface:"#EEE8DC", border:"#D6C9B0",
  softGold:"#F5E8C0", softGreen:"#E0F0E8", softRed:"#F8E8E4", softBlue:"#E4EDF8",
  ink:"#1A1A2E", muted:"#6B5C40", faint:"#9A8C70", onDark:"#F8F2E4",
};

// ══════════════════════════════════════════════════════════════════════════════
//  HOOKS
// ══════════════════════════════════════════════════════════════════════════════
function useLS(key, init) {
  const [val, setVal] = useState(() => { try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : init; } catch { return init; } });
  const save = useCallback((v) => { setVal(v); try { localStorage.setItem(key, JSON.stringify(v)); } catch {} }, [key]);
  return [val, save];
}
const toDay = () => new Date().toISOString().split("T")[0];
const dayOff = n => new Date(Date.now() + n * 86400000).toISOString().split("T")[0];

function useStreak() {
  const [data, save] = useLS("sn-streak", { current: 0, longest: 0, lastDate: null, total: 0, log: [] });
  useEffect(() => {
    const today = toDay(); if (data.lastDate === today) return;
    const yest = dayOff(-1);
    const streak = data.lastDate === yest ? (data.current || 0) + 1 : 1;
    save({ current: streak, longest: Math.max(streak, data.longest || 0), lastDate: today, total: (data.total || 0) + 1, log: [...(data.log || []).slice(-90), today] });
  }, []);
  return data;
}

function useCountdown(iso) {
  const [t, setT] = useState({});
  useEffect(() => {
    const calc = () => { const diff = new Date(iso) - Date.now(); if (diff <= 0) return setT({ done: true }); const s = Math.floor(diff / 1000); setT({ months: Math.floor(s / (30.44 * 86400)), weeks: Math.floor(s / (7 * 86400)), days: Math.floor(s / 86400), hours: Math.floor((s % 86400) / 3600), minutes: Math.floor((s % 3600) / 60), seconds: s % 60 }); };
    calc(); const id = setInterval(calc, 1000); return () => clearInterval(id);
  }, [iso]);
  return t;
}

// ══════════════════════════════════════════════════════════════════════════════
//  AZURE TTS — es-MX-JorgeNeural (male Spanish, falls back to browser)
// ══════════════════════════════════════════════════════════════════════════════
const _audioCache = {};
async function speakES(text, rate = 0.85) {
  const azureKey    = (() => { try { return JSON.parse(localStorage.getItem("sn-azure-key")) || ""; } catch { return ""; } })();
  const azureRegion = (() => { try { return JSON.parse(localStorage.getItem("sn-azure-region")) || "eastus"; } catch { return "eastus"; } })();
  if (azureKey) {
    const cacheKey = text.slice(0, 80);
    if (_audioCache[cacheKey]) { _audioCache[cacheKey].pause(); _audioCache[cacheKey].currentTime = 0; _audioCache[cacheKey].play(); return; }
    try {
      const ssml = `<speak version='1.0' xml:lang='es-MX'><voice name='es-MX-JorgeNeural'><prosody rate='${rate < 0.9 ? "-15%" : "0%"}'>${text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")}</prosody></voice></speak>`;
      const res = await fetch(`https://${azureRegion}.tts.speech.microsoft.com/cognitiveservices/v1`, {
        method: "POST",
        headers: { "Ocp-Apim-Subscription-Key": azureKey, "Content-Type": "application/ssml+xml", "X-Microsoft-OutputFormat": "audio-16khz-128kbitrate-mono-mp3", "User-Agent": "ElderNilssonApp" },
        body: ssml,
      });
      if (!res.ok) throw new Error(`Azure TTS error ${res.status}`);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      _audioCache[cacheKey] = audio;
      audio.play();
    } catch (e) {
      console.warn("Azure TTS failed, falling back to browser voice:", e.message);
      _browserSpeak(text, rate);
    }
  } else {
    _browserSpeak(text, rate);
  }
}
function _browserSpeak(text, rate = 0.85) {
  if (!("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text); u.lang = "es-ES"; u.rate = rate;
  const vs = window.speechSynthesis.getVoices();
  const v = vs.find(x => x.lang === "es-MX") || vs.find(x => x.lang === "es-ES") || vs.find(x => x.lang.startsWith("es"));
  if (v) u.voice = v;
  window.speechSynthesis.speak(u);
}

// ══════════════════════════════════════════════════════════════════════════════
//  UI HELPERS
// ══════════════════════════════════════════════════════════════════════════════
function FlagStrip({ width = 48, height = 9 }) {
  const h = height; const third = h / 3;
  return (
    <svg width={width} height={h} viewBox={`0 0 ${width} ${h}`} style={{ borderRadius: 2, overflow: "hidden", display: "block" }}>
      <rect x="0" y="0" width={width} height={third} fill={C.red} />
      <rect x="0" y={third} width={width} height={third} fill={C.white} />
      <rect x="0" y={third * 2} width={width} height={third} fill={C.blue} />
    </svg>
  );
}
function ParPat({ size = 120, opacity = 0.06 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" style={{ position: "absolute", top: 0, right: 0, opacity, pointerEvents: "none" }}>
      <rect x="2" y="2" width="16" height="16" fill="none" stroke={C.gold} strokeWidth="0.8" />
      <rect x="22" y="2" width="16" height="16" fill="none" stroke={C.gold} strokeWidth="0.8" />
      <rect x="2" y="22" width="16" height="16" fill="none" stroke={C.gold} strokeWidth="0.8" />
      <rect x="22" y="22" width="16" height="16" fill="none" stroke={C.gold} strokeWidth="0.8" />
      <circle cx="10" cy="10" r="4" fill="none" stroke={C.gold} strokeWidth="0.6" />
      <circle cx="30" cy="10" r="4" fill="none" stroke={C.gold} strokeWidth="0.6" />
      <circle cx="10" cy="30" r="4" fill="none" stroke={C.gold} strokeWidth="0.6" />
      <circle cx="30" cy="30" r="4" fill="none" stroke={C.gold} strokeWidth="0.6" />
    </svg>
  );
}

function StreakBadge({ streak }) {
  const cur = streak.current || 0;
  const ms = [...MILESTONES].reverse().find(m => m.days <= cur);
  return (
    <div style={{ background: "rgba(200,165,81,0.18)", border: `0.5px solid ${C.gold}`, borderRadius: "20px", padding: "6px 12px", display: "flex", alignItems: "center", gap: "7px", flexShrink: 0 }}>
      <span style={{ fontSize: "18px", lineHeight: 1 }}>{cur === 0 ? "✨" : ms ? ms.icon : "🔥"}</span>
      <div>
        <div style={{ fontSize: "17px", fontWeight: "600", color: C.gold, lineHeight: 1 }}>{cur}</div>
        <div style={{ fontSize: "9px", color: "rgba(200,165,81,0.7)", lineHeight: 1, letterSpacing: "0.08em", textTransform: "uppercase", marginTop: "1px" }}>dias</div>
      </div>
    </div>
  );
}

function StreakCard({ streak }) {
  const cur = streak.current || 0;
  const nextMs = MILESTONES.find(m => m.days > cur);
  const prevMs = [...MILESTONES].reverse().find(m => m.days <= cur);
  const pct = nextMs ? Math.round(((cur - (prevMs?.days || 0)) / (nextMs.days - (prevMs?.days || 0))) * 100) : 100;
  const last30 = Array.from({ length: 30 }, (_, i) => { const d = new Date(Date.now() - (29 - i) * 86400000); const str = d.toISOString().split("T")[0]; return { str, studied: (streak.log || []).includes(str), isToday: str === toDay() }; });
  const earned = MILESTONES.filter(m => m.days <= cur);
  return (
    <div style={{ background: C.surface, border: `0.5px solid ${C.border}`, borderRadius: "18px", padding: "20px", marginBottom: "18px", borderTop: `3px solid ${C.gold}` }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "18px" }}>
        <div>
          <div style={{ fontSize: "11px", letterSpacing: "0.12em", textTransform: "uppercase", color: C.faint, marginBottom: "4px" }}>Racha Diaria</div>
          <div style={{ display: "flex", alignItems: "baseline", gap: "8px" }}>
            <span style={{ fontSize: "48px", fontWeight: "400", color: C.red, lineHeight: 1 }}>{cur}</span>
            <span style={{ fontSize: "15px", color: C.muted }}>dias</span>
          </div>
          {prevMs && <div style={{ fontSize: "13px", color: C.gold, marginTop: "2px", display: "flex", alignItems: "center", gap: "5px" }}><span>{prevMs.icon}</span>{prevMs.label}</div>}
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: "11px", color: C.faint }}>Racha mas larga</div>
          <div style={{ fontSize: "26px", color: C.muted }}>{streak.longest || 0}</div>
          <div style={{ fontSize: "11px", color: C.faint, marginTop: "6px" }}>Total de dias</div>
          <div style={{ fontSize: "22px", color: C.muted }}>{streak.total || 0}</div>
        </div>
      </div>
      {nextMs && (
        <div style={{ marginBottom: "16px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "5px" }}>
            <span style={{ fontSize: "12px", color: C.muted }}>Siguiente: {nextMs.icon} <strong style={{ color: C.ink }}>{nextMs.label}</strong></span>
            <span style={{ fontSize: "12px", color: C.muted }}>{nextMs.days - cur} dias</span>
          </div>
          <div style={{ height: "8px", background: C.border, borderRadius: "4px", overflow: "hidden" }}>
            <div style={{ width: `${pct}%`, height: "100%", borderRadius: "4px", background: `linear-gradient(to right,${C.red},${C.gold})`, transition: "width 0.8s" }} />
          </div>
        </div>
      )}
      <div style={{ marginBottom: "14px" }}>
        <div style={{ fontSize: "11px", color: C.faint, marginBottom: "7px", letterSpacing: "0.1em", textTransform: "uppercase" }}>Ultimos 30 dias</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(10,1fr)", gap: "4px" }}>
          {last30.map((d, i) => (<div key={i} title={d.str} style={{ aspectRatio: "1", borderRadius: "3px", background: d.studied ? C.red : d.isToday ? C.softGold : C.border, border: d.isToday ? `1.5px solid ${C.gold}` : "none" }} />))}
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: "4px", fontSize: "10px", color: C.faint }}>
          <span>Hace 30 dias</span>
          <div style={{ display: "flex", alignItems: "center", gap: "5px" }}><div style={{ width: "10px", height: "10px", borderRadius: "2px", background: C.red }} /><span>Estudiado</span><div style={{ width: "10px", height: "10px", borderRadius: "2px", background: C.border, marginLeft: "6px" }} /><span>Perdido</span></div>
          <span>Hoy</span>
        </div>
      </div>
      {earned.length > 0 ? (
        <div><div style={{ fontSize: "11px", color: C.faint, marginBottom: "7px", letterSpacing: "0.1em", textTransform: "uppercase" }}>Logros obtenidos</div><div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>{earned.map(m => (<div key={m.days} style={{ background: C.softGold, border: `0.5px solid ${C.border}`, borderRadius: "20px", padding: "4px 11px", fontSize: "12px", color: C.gold, display: "flex", alignItems: "center", gap: "5px" }}><span>{m.icon}</span>{m.label}</div>))}</div></div>
      ) : (
        <div style={{ background: C.softGold, borderRadius: "10px", padding: "10px 14px", fontSize: "13px", color: C.gold, textAlign: "center" }}>Estudia hoy para ganar tu primer logro — <strong>Primer Dia!</strong></div>
      )}
    </div>
  );
}

// ── Real mic hook for alphabet practice ──────────────────────────────────────
function useLetterMic(target) {
  const [recording, setRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [score, setScore] = useState(null);
  const recRef = useRef(null);
  const start = () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { setTranscript("Se necesita Chrome o Edge para el reconocimiento de voz."); return; }
    if (recording) { recRef.current?.stop(); setRecording(false); return; }
    const rec = new SR(); rec.lang = "es-ES"; rec.continuous = false; rec.interimResults = false;
    recRef.current = rec;
    rec.onresult = e => {
      const said = e.results[0][0].transcript.trim(); setTranscript(said);
      const cl = s => s.toLowerCase().replace(/[.,!?;:]/g, "").trim();
      const tW = cl(target).split(" "); const gW = cl(said).split(" ");
      const mt = tW.filter(w => gW.some(g => g.includes(w.slice(0, 3)) || w.includes(g.slice(0, 3)))).length;
      setScore(Math.round((mt / tW.length) * 100));
    };
    rec.onerror = () => { setRecording(false); setTranscript("No se pudo escuchar — intenta de nuevo."); };
    rec.onend = () => setRecording(false);
    rec.start(); setRecording(true); setTranscript(""); setScore(null);
  };
  const reset = () => { setTranscript(""); setScore(null); };
  return { recording, transcript, score, start, reset };
}

function MicResult({ transcript, score, recording, onStart, color }) {
  const clr = color || C.red;
  return (<>
    <button onClick={onStart} style={{ background: recording ? C.red : "rgba(255,255,255,0.14)", border: "none", borderRadius: "9px", padding: "8px 13px", color: C.onDark, fontSize: "13px", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px", transition: "background 0.2s" }}>
      {recording ? "🔴 Escuchando..." : "🎤 Decirlo"}
    </button>
    {transcript && (
      <div style={{ marginTop: "10px", background: "rgba(0,0,0,0.2)", borderRadius: "10px", padding: "10px 13px" }}>
        <div style={{ fontSize: "10px", letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(248,242,228,0.6)", marginBottom: "3px" }}>Dijiste</div>
        <div style={{ fontSize: "14px", color: C.onDark, marginBottom: "7px" }}>"{transcript}"</div>
        {score !== null && (<>
          <div style={{ display: "flex", alignItems: "center", gap: "9px", marginBottom: "3px" }}>
            <div style={{ flex: 1, height: "6px", background: "rgba(255,255,255,0.15)", borderRadius: "3px", overflow: "hidden" }}>
              <div style={{ width: `${score}%`, height: "100%", borderRadius: "3px", background: score >= 80 ? "#4CAF50" : score >= 50 ? C.gold : C.red, transition: "width 0.6s" }} />
            </div>
            <span style={{ fontSize: "13px", fontWeight: "600", minWidth: "34px", color: score >= 80 ? "#90EE90" : score >= 50 ? C.gold : "#FF9999" }}>{score}%</span>
          </div>
          <div style={{ fontSize: "12px", color: score >= 80 ? "#90EE90" : score >= 50 ? C.gold : "#FF9999" }}>
            {score >= 80 ? "Excelente pronunciacion!" : score >= 50 ? "Bien — escucha otra vez y reintenta!" : "Escucha con cuidado y vuelve a intentarlo!"}
          </div>
        </>)}
      </div>
    )}
  </>);
}

// ══════════════════════════════════════════════════════════════════════════════
//  DATA
// ══════════════════════════════════════════════════════════════════════════════
const DAILY_PHRASES = [
  { es:"Dios te ama.", en:"God loves you." },
  { es:"La fe sin obras esta muerta.", en:"Faith without works is dead." },
  { es:"Pide y se te dara.", en:"Ask and it shall be given to you." },
  { es:"Arrepentios y sed bautizados.", en:"Repent and be baptized." },
  { es:"La familia puede ser eterna.", en:"Families can be eternal." },
  { es:"El Libro de Mormon es verdadero.", en:"The Book of Mormon is true." },
  { es:"Jesucristo es el Salvador del mundo.", en:"Jesus Christ is the Savior of the world." },
  { es:"Orad sin cesar.", en:"Pray without ceasing." },
  { es:"Con Dios todo es posible.", en:"With God all things are possible." },
  { es:"El Espiritu Santo testifica de la verdad.", en:"The Holy Ghost testifies of truth." },
  { es:"Toda buena dadiva viene de Dios.", en:"Every good gift comes from God." },
  { es:"Somos hijos de Dios.", en:"We are children of God." },
  { es:"La paz que sobrepasa todo entendimiento.", en:"Peace that surpasses all understanding." },
  { es:"Amad a vuestros projimos.", en:"Love your neighbors." },
  { es:"El arrepentimiento trae alegria.", en:"Repentance brings joy." },
  { es:"La oracion abre puertas.", en:"Prayer opens doors." },
  { es:"Buscad primeramente el reino de Dios.", en:"Seek first the kingdom of God." },
  { es:"La gracia de Cristo es suficiente.", en:"Christ's grace is sufficient." },
  { es:"Confia en el Senor con todo tu corazon.", en:"Trust in the Lord with all your heart." },
  { es:"El Evangelio es la buena nueva.", en:"The Gospel is the good news." },
  { es:"Venid a Cristo.", en:"Come unto Christ." },
  { es:"La mision es un privilegio sagrado.", en:"A mission is a sacred privilege." },
  { es:"El templo es la casa del Senor.", en:"The temple is the house of the Lord." },
  { es:"Las Escrituras iluminan el camino.", en:"The Scriptures illuminate the path." },
  { es:"El Padre Celestial escucha tus oraciones.", en:"Heavenly Father hears your prayers." },
  { es:"La expiacion sana todas las heridas.", en:"The Atonement heals all wounds." },
  { es:"Sed fuertes y valientes.", en:"Be strong and courageous." },
  { es:"Ensenad con el Espiritu.", en:"Teach by the Spirit." },
  { es:"El sacerdocio bendice la vida.", en:"The priesthood blesses life." },
  { es:"Paraguay espera tu mensaje.", en:"Paraguay awaits your message." },
];
const MILESTONES = [
  { days:1,   label:"Primer Dia!",      icon:"🌱" },
  { days:3,   label:"3 Dias de Fuego",  icon:"🔥" },
  { days:7,   label:"Una Semana",       icon:"🔥🔥" },
  { days:14,  label:"Dos Semanas!",     icon:"⭐" },
  { days:30,  label:"Un Mes!",          icon:"🌟" },
  { days:60,  label:"Dos Meses!",       icon:"💎" },
  { days:90,  label:"Listo para Mision!",icon:"🏆" },
  { days:120, label:"Maestro del Idioma!",icon:"👑" },
];
const SPANISH_LETTERS = [
  { letter:"A", name:"a",         ipa:"/a/",       example:"amor",       meaning:"love",         tip:"Open 'ah' — clear and bright, as in 'father'" },
  { letter:"B", name:"be",        ipa:"/b/",       example:"bautismo",   meaning:"baptism",      tip:"Like English B — lips close firmly" },
  { letter:"C", name:"ce",        ipa:"/k/ or /s/",example:"Cristo",     meaning:"Christ",       tip:'"K" before a,o,u — "S" before e,i' },
  { letter:"D", name:"de",        ipa:"/d/",       example:"Dios",       meaning:"God",          tip:"Like English D — softer between vowels" },
  { letter:"E", name:"e",         ipa:"/e/",       example:"Evangelio",  meaning:"Gospel",       tip:"Like 'e' in bed — always clear, never silent" },
  { letter:"F", name:"efe",       ipa:"/f/",       example:"fe",         meaning:"faith",        tip:"Exactly like English F" },
  { letter:"G", name:"ge",        ipa:"/g/ or /x/",example:"gracia",     meaning:"grace",        tip:'Hard G before a,o,u — throaty "h" before e,i' },
  { letter:"H", name:"hache",     ipa:"(silent)",  example:"hermano",    meaning:"brother",      tip:"⚠️ ALWAYS SILENT — hermano = 'er-MAH-no'" },
  { letter:"I", name:"i",         ipa:"/i/",       example:"iglesia",    meaning:"church",       tip:"Always clear 'ee' like in 'see'" },
  { letter:"J", name:"jota",      ipa:"/x/",       example:"Jesus",      meaning:"Jesus",        tip:"Throaty H — from the back of the throat, like Spanish J" },
  { letter:"K", name:"ka",        ipa:"/k/",       example:"kilometro",  meaning:"kilometer",    tip:"Rare — mostly in foreign words" },
  { letter:"L", name:"ele",       ipa:"/l/",       example:"libro",      meaning:"book",         tip:"Clear L — tongue tip touches upper teeth" },
  { letter:"M", name:"eme",       ipa:"/m/",       example:"mision",     meaning:"mission",      tip:"Like English M" },
  { letter:"N", name:"ene",       ipa:"/n/",       example:"nuevo",      meaning:"new",          tip:"Like English N — before K/G sounds like 'ng'" },
  { letter:"O", name:"o",         ipa:"/o/",       example:"oracion",    meaning:"prayer",       tip:"Like 'o' in 'ore' — always full and clear" },
  { letter:"P", name:"pe",        ipa:"/p/",       example:"profeta",    meaning:"prophet",      tip:"Like English P — no puff of air" },
  { letter:"Q", name:"cu",        ipa:"/k/",       example:"quorum",     meaning:"quorum",       tip:"Always with U (silent) — QUE = 'keh', QUI = 'kee'" },
  { letter:"R", name:"erre",      ipa:"/r/ or /rr/",example:"revelacion", meaning:"revelation",  tip:"⚠️ Single tap in middle; TRILL at word start or doubled" },
  { letter:"S", name:"ese",       ipa:"/s/",       example:"salvacion",  meaning:"salvation",    tip:"Clear S — never the 'sh' of European Portuguese" },
  { letter:"T", name:"te",        ipa:"/t/",       example:"templo",     meaning:"temple",       tip:"Like English T — never 'ch' like in Brazilian Portuguese" },
  { letter:"U", name:"u",         ipa:"/u/",       example:"usted",      meaning:"you (formal)", tip:"Always clear 'oo' like in 'moon'" },
  { letter:"V", name:"uve",       ipa:"/b/",       example:"verdad",     meaning:"truth",        tip:"Same sound as B in Latin American Spanish — no difference" },
  { letter:"W", name:"doble uve", ipa:"/w/",       example:"(extranjero)",meaning:"rare in Spanish",tip:"Rare — borrowed words only" },
  { letter:"X", name:"equis",     ipa:"/ks/ or /s/",example:"expiacion", meaning:"atonement",   tip:"Usually 'ks' — ex- = 'eks'" },
  { letter:"Y", name:"ye",        ipa:"/y/",       example:"yo",         meaning:"I",            tip:"Like 'y' in yes — or 'sh' in Paraguay specifically!" },
  { letter:"Z", name:"zeta",      ipa:"/s/",       example:"zona",       meaning:"zone",         tip:"In Latin America, always 'S' — never the 'th' of Spain" },
];
const SPECIAL_COMBOS = [
  { combo:"LL", name:"elle",       ipa:"/y/ or /sh/", example:"llamar",  meaning:"to call",  tip:"In most Spanish: like 'y'. In Paraguay: often like 'SH'!", why:"llamar, lleno, calle, ella, pollo...", clr:C.red },
  { combo:"RR", name:"erre doble", ipa:"/rr/",        example:"perro",   meaning:"dog",      tip:"A strong, sustained trill — very different from single R", why:"perro, tierra, carro, correr...",      clr:C.blue },
  { combo:"CH", name:"che",        ipa:"/ch/",        example:"muchacho",meaning:"boy",       tip:"Like 'ch' in 'church' — always this sound in Spanish",     why:"chipa, muchacho, mucho, noche...",     clr:C.gold },
  { combo:"QU", name:"cu",         ipa:"/k/",         example:"quorum",  meaning:"quorum",   tip:"The U is always silent — QUE = 'keh', QUI = 'kee'",        why:"quorum, que, quien, quedar...",        clr:C.green },
  { combo:"GU", name:"gu",         ipa:"/g/",         example:"seguir",  meaning:"to follow",tip:"Before E/I: the U is silent — GUIS = 'ghees' not 'gwees'",  why:"seguir, guerra, guia, lleguemos...",   clr:C.river },
];

const VOCAB_CATS = [
  { id:"numbers",  label:"Numeros",       sublabel:"Numbers",     icon:"🔢", color:C.blue,
    words:[{es:"cero",en:"zero"},{es:"uno",en:"one"},{es:"dos",en:"two"},{es:"tres",en:"three"},{es:"cuatro",en:"four"},{es:"cinco",en:"five"},{es:"seis",en:"six"},{es:"siete",en:"seven"},{es:"ocho",en:"eight"},{es:"nueve",en:"nine"},{es:"diez",en:"ten"},{es:"veinte",en:"twenty"},{es:"treinta",en:"thirty"},{es:"cien",en:"one hundred"},{es:"mil",en:"one thousand"},{es:"primero",en:"first"},{es:"segundo",en:"second"},{es:"ultimo",en:"last"}]},
  { id:"time",     label:"Dias y Tiempo", sublabel:"Days & Time", icon:"📅", color:C.green,
    words:[{es:"lunes",en:"Monday"},{es:"martes",en:"Tuesday"},{es:"miercoles",en:"Wednesday"},{es:"jueves",en:"Thursday"},{es:"viernes",en:"Friday"},{es:"sabado",en:"Saturday"},{es:"domingo",en:"Sunday"},{es:"hoy",en:"today"},{es:"manana",en:"tomorrow"},{es:"ayer",en:"yesterday"},{es:"ahora",en:"now"},{es:"tarde",en:"afternoon"},{es:"temprano",en:"early"},{es:"hora",en:"hour"},{es:"semana",en:"week"},{es:"mes",en:"month"},{es:"ano",en:"year"},{es:"siempre",en:"always"}]},
  { id:"food",     label:"Comida",        sublabel:"Food",        icon:"🍽️", color:C.terra,
    words:[{es:"sopa paraguaya",en:"Paraguayan cornbread"},{es:"chipa",en:"cheese bread"},{es:"mbeju",en:"starch flatbread"},{es:"terere",en:"cold yerba mate"},{es:"mate",en:"hot yerba mate"},{es:"mandioca",en:"cassava"},{es:"asado",en:"grilled meat"},{es:"agua",en:"water"},{es:"desayuno",en:"breakfast"},{es:"almuerzo",en:"lunch"},{es:"cena",en:"dinner"},{es:"delicioso",en:"delicious"},{es:"hambre",en:"hunger"},{es:"sed",en:"thirst"},{es:"gracias",en:"thank you"},{es:"pan",en:"bread"},{es:"fruta",en:"fruit"},{es:"pollo",en:"chicken"}]},
  { id:"shopping", label:"Compras",       sublabel:"Shopping",    icon:"🛒", color:C.gold,
    words:[{es:"mercado",en:"market"},{es:"precio",en:"price"},{es:"caro",en:"expensive"},{es:"barato",en:"cheap"},{es:"comprar",en:"to buy"},{es:"vender",en:"to sell"},{es:"dinero",en:"money"},{es:"guarani",en:"Paraguayan currency"},{es:"cambio",en:"change"},{es:"tienda",en:"store"},{es:"pagar",en:"to pay"},{es:"por favor",en:"please"},{es:"de nada",en:"you're welcome"},{es:"perdon",en:"excuse me"},{es:"ayuda",en:"help"},{es:"recibo",en:"receipt"},{es:"bolsa",en:"bag"},{es:"cuanto cuesta",en:"how much does it cost"}]},
  { id:"transport",label:"Transporte",    sublabel:"Transport",   icon:"🚌", color:C.river,
    words:[{es:"autobus",en:"bus"},{es:"taxi",en:"taxi"},{es:"bicicleta",en:"bicycle"},{es:"moto",en:"motorcycle"},{es:"calle",en:"street"},{es:"avenida",en:"avenue"},{es:"barrio",en:"neighborhood"},{es:"cerca",en:"near"},{es:"lejos",en:"far"},{es:"izquierda",en:"left"},{es:"derecha",en:"right"},{es:"recto",en:"straight ahead"},{es:"parada",en:"stop"},{es:"mapa",en:"map"},{es:"direccion",en:"address"},{es:"cruzar",en:"to cross"},{es:"doblar",en:"to turn"},{es:"caminar",en:"to walk"}]},
  { id:"family",   label:"Familia",       sublabel:"Family",      icon:"👨‍👩‍👧‍👦", color:C.red,
    words:[{es:"padre",en:"father"},{es:"madre",en:"mother"},{es:"hijo",en:"son"},{es:"hija",en:"daughter"},{es:"hermano",en:"brother"},{es:"hermana",en:"sister"},{es:"abuelo",en:"grandfather"},{es:"abuela",en:"grandmother"},{es:"esposo",en:"husband"},{es:"esposa",en:"wife"},{es:"tio",en:"uncle"},{es:"tia",en:"aunt"},{es:"primo",en:"cousin (m)"},{es:"prima",en:"cousin (f)"},{es:"familia",en:"family"},{es:"nino",en:"child (m)"},{es:"nina",en:"child (f)"},{es:"bebe",en:"baby"}]},
  { id:"gospel",   label:"Evangelio",     sublabel:"Gospel Terms",icon:"✝️", color:C.slate,
    words:[{es:"fe",en:"faith"},{es:"arrepentimiento",en:"repentance"},{es:"bautismo",en:"baptism"},{es:"Espiritu Santo",en:"Holy Ghost"},{es:"profeta",en:"prophet"},{es:"revelacion",en:"revelation"},{es:"Evangelio",en:"Gospel"},{es:"Salvador",en:"Savior"},{es:"gracia",en:"grace"},{es:"expiacion",en:"atonement"},{es:"Escrituras",en:"Scriptures"},{es:"oracion",en:"prayer"},{es:"testimonio",en:"testimony"},{es:"Padre Celestial",en:"Heavenly Father"},{es:"eterno",en:"eternal"},{es:"convenio",en:"covenant"},{es:"ordenanza",en:"ordinance"},{es:"santificacion",en:"sanctification"}]},
  { id:"church",   label:"La Iglesia",    sublabel:"The Church",  icon:"⛪", color:C.blue,
    words:[{es:"obispo",en:"bishop"},{es:"misionero",en:"missionary"},{es:"quorum",en:"quorum"},{es:"rama",en:"branch"},{es:"distrito",en:"district"},{es:"presidencia",en:"presidency"},{es:"sacerdocio",en:"priesthood"},{es:"ayuno",en:"fast"},{es:"diezmo",en:"tithing"},{es:"templo",en:"temple"},{es:"reunion sacramental",en:"sacrament meeting"},{es:"mision",en:"mission"},{es:"estaca",en:"stake"},{es:"elder",en:"elder"},{es:"investigador",en:"investigator"},{es:"conferencia",en:"conference"},{es:"llamamiento",en:"calling"},{es:"miembro",en:"member"}]},
  { id:"feelings", label:"Sentimientos",  sublabel:"Feelings",    icon:"💛", color:C.gold,
    words:[{es:"feliz",en:"happy"},{es:"triste",en:"sad"},{es:"agradecido",en:"grateful"},{es:"esperanza",en:"hope"},{es:"paz",en:"peace"},{es:"amor",en:"love"},{es:"confundido",en:"confused"},{es:"asustado",en:"scared"},{es:"emocionado",en:"excited"},{es:"cansado",en:"tired"},{es:"bendecido",en:"blessed"},{es:"preocupado",en:"worried"},{es:"contento",en:"content"},{es:"orgulloso",en:"proud"},{es:"animado",en:"encouraged"},{es:"humilde",en:"humble"},{es:"agobiado",en:"overwhelmed"},{es:"gozoso",en:"joyful"}]},
];
const PHRASE_CATEGORIES = [
  { id:"greetings", label:"Saludos",      sublabel:"Greetings",    color:C.blue, phrases:[
    { es:"Buenos dias.", en:"Good morning.", wbw:"Buenos=Good · dias=morning", note:"Until roughly noon" },
    { es:"Buenas tardes.", en:"Good afternoon.", wbw:"Buenas=Good · tardes=afternoon", note:"Noon until sunset" },
    { es:"Buenas noches.", en:"Good evening.", wbw:"Buenas=Good · noches=night/evening", note:"Evening greeting and farewell" },
    { es:"Como esta usted?", en:"How are you? (formal)", wbw:"Como=How · esta=are · usted=you(formal)", note:"Always use usted with adults — shows deep respect" },
    { es:"Mucho gusto en conocerle.", en:"Very pleased to meet you.", wbw:"Mucho=Much · gusto=pleasure · conocerle=to meet you", note:"Warm first-meeting greeting" },
    { es:"Como se llama usted?", en:"What is your name? (formal)", wbw:"Como=How · se llama=are you called · usted=you", note:"Formal way to ask someone's name" },
    { es:"Que le vaya bien.", en:"May things go well for you.", wbw:"Que=May · le=for you · vaya=go · bien=well", note:"Beautiful Paraguayan farewell blessing" },
    { es:"Hasta luego.", en:"Goodbye — Until later.", wbw:"Hasta=Until · luego=later", note:"Most common farewell in Paraguay" },
  ]},
  { id:"intro",     label:"Presentacion", sublabel:"Introduction", color:C.red, phrases:[
    { es:"Me llamo Elder Nilsson.", en:"My name is Elder Nilsson.", wbw:"Me=Myself · llamo=called · Elder=Elder · Nilsson=Nilsson", note:"Always introduce yourself first" },
    { es:"Soy misionero de La Iglesia de Jesucristo de los Santos de los Ultimos Dias.", en:"I am a missionary of The Church of Jesus Christ of Latter-day Saints.", wbw:"Soy=I am · misionero=missionary · de=of · La Iglesia=The Church", note:"Use the full Church name" },
    { es:"Venimos a compartir un mensaje importante.", en:"We come to share an important message.", wbw:"Venimos=We come · compartir=share · mensaje=message · importante=important", note:"State your purpose clearly" },
    { es:"Podemos pasar un momento?", en:"May we come in for a moment?", wbw:"Podemos=May we · pasar=come in · un momento=a moment", note:"Respectful request to enter the home" },
    { es:"Tenemos un mensaje sobre Jesucristo.", en:"We have a message about Jesus Christ.", wbw:"Tenemos=We have · mensaje=message · sobre=about · Jesucristo=Jesus Christ", note:"Focus on Christ from the very first moment" },
    { es:"Ha escuchado de nosotros antes?", en:"Have you heard of us before?", wbw:"Ha escuchado=Have you heard · de nosotros=of us · antes=before", note:"Gauge their prior knowledge of the Church" },
  ]},
  { id:"teaching",  label:"Ensenando",    sublabel:"Teaching",     color:C.green, phrases:[
    { es:"Dios es nuestro Padre Celestial.", en:"God is our Heavenly Father.", wbw:"Dios=God · es=is · nuestro=our · Padre=Father · Celestial=Heavenly", note:"The foundational first principle of the Gospel" },
    { es:"Jesucristo es el Salvador del mundo.", en:"Jesus Christ is the Savior of the world.", wbw:"Jesucristo=Jesus Christ · es=is · el Salvador=the Savior · del mundo=of the world", note:"Central to your testimony" },
    { es:"El Libro de Mormon es otro testamento de Jesucristo.", en:"The Book of Mormon is another testament of Jesus Christ.", wbw:"El Libro de Mormon=The Book of Mormon · es=is · otro=another · testamento=testament", note:"Introduce the Book of Mormon with faith" },
    { es:"Leeria usted el Libro de Mormon?", en:"Would you read the Book of Mormon?", wbw:"Leeria=Would you read · usted=you · el Libro de Mormon=the Book of Mormon", note:"The commitment begins with reading" },
    { es:"La familia puede ser eterna.", en:"The family can be eternal.", wbw:"La familia=The family · puede ser=can be · eterna=eternal", note:"Deeply powerful for Paraguayan families" },
    { es:"El arrepentimiento trae paz y alegria.", en:"Repentance brings peace and joy.", wbw:"El arrepentimiento=Repentance · trae=brings · paz=peace · alegria=joy", note:"Frame repentance positively — it is a gift" },
    { es:"Dios nos habla hoy por medio de un profeta vivo.", en:"God speaks to us today through a living prophet.", wbw:"Dios=God · nos habla=speaks to us · hoy=today · profeta vivo=living prophet", note:"The Restoration — God has not gone silent" },
    { es:"Le gustaria ser bautizado?", en:"Would you like to be baptized?", wbw:"Le=To you · gustaria=would like · ser=to be · bautizado=baptized", note:"Extend the baptismal invitation with love and faith" },
  ]},
  { id:"prayer",    label:"Oracion",      sublabel:"Prayer",       color:C.gold, phrases:[
    { es:"Podemos comenzar con una oracion?", en:"Can we begin with a prayer?", wbw:"Podemos=Can we · comenzar=begin · con=with · una oracion=a prayer", note:"Open every lesson with prayer" },
    { es:"Querido Padre Celestial,", en:"Dear Heavenly Father,", wbw:"Querido=Dear · Padre=Father · Celestial=Heavenly", note:"How to begin every prayer in Spanish" },
    { es:"Te damos gracias por...", en:"We give thee thanks for...", wbw:"Te=Thee · damos=we give · gracias=thanks · por=for", note:"Express sincere, specific gratitude" },
    { es:"Te pedimos que...", en:"We ask thee to...", wbw:"Te=Thee · pedimos=we ask · que=that", note:"Make your petition humbly and specifically" },
    { es:"Por favor bendice a esta familia.", en:"Please bless this family.", wbw:"Por favor=Please · bendice=bless · a esta familia=this family", note:"Bless every home you visit" },
    { es:"Ayudanos a sentir el Espiritu Santo.", en:"Help us to feel the Holy Ghost.", wbw:"Ayudanos=Help us · sentir=feel · el Espiritu Santo=the Holy Ghost", note:"Invite the Spirit into every discussion" },
    { es:"Pedimos esto en el nombre de Jesucristo.", en:"We ask this in the name of Jesus Christ.", wbw:"Pedimos=We ask · esto=this · en el nombre=in the name · de Jesucristo=of Jesus Christ", note:"Always before Amen — never omit" },
    { es:"Amen.", en:"Amen.", wbw:"Amen — closing word, said by all present", note:"Ah-MEN — said at the close of every prayer" },
  ]},
];

const CULTURE_SECTIONS = [
  { id:"asuncion",   icon:"🏛️", label:"Asuncion",         sublabel:"Capital de Paraguay", color:C.blue,  tagline:"La Madre de Ciudades — fundada en 1537", body:"Asuncion es una de las ciudades mas antiguas de Sudamerica, fundada en 1537 a orillas del Rio Paraguay. Conocida como La Madre de Ciudades, fue el punto de partida para la colonizacion espanola de gran parte del continente. El centro historico alberga la catedral metropolitana, el palacio de gobierno y la bahia que da al gran rio. La ciudad mezcla arquitectura colonial espanola con influencias guaranies y modernas.", vocab:["capital","rio","colonial","catedral","palacio","historia","ciudad","antiguo"], missionTip:"Los asuncenos sienten un orgullo profundo por su ciudad historica. Muestre interes genuino en la fundacion colonial y pregunte sus recomendaciones — para crear una conexion inmediata y autentica." },
  { id:"guarani",    icon:"🪶", label:"Cultura Guarani",   sublabel:"Raices indigenas",    color:C.green, tagline:"La lengua hermosa — Nee pora", body:"Paraguay es el unico pais verdaderamente bilingue de America del Sur donde una lengua indigena es co-oficial. El guarani es hablado por mas del 90% de los paraguayos, incluso en las ciudades. La mezcla diaria de espanol y guarani se llama Jopara y es el habla cotidiana. Los guaranies tenian una rica tradicion de artesania en encaje (nanduti), ceramica, y una profunda espiritualidad.", vocab:["guarani","idioma","lengua","nanduti","artesania","Jopara","tradicion","bilingue"], missionTip:"Aprender aunque sea una palabra en guarani abrira corazones de manera extraordinaria. Demuestra un respeto profundo por la identidad unica de Paraguay." },
  { id:"terere",     icon:"🌿", label:"Terere y Mate",     sublabel:"La bebida nacional",  color:C.green, tagline:"Compartir el terere es compartir el alma", body:"El terere (mate frio) es la bebida nacional de Paraguay y esta profundamente enraizado en cada aspecto de la vida diaria. Compartir terere es un ritual social de amistad, hospitalidad y confianza. Se bebe con una bombilla desde un guampa. Los yuyos (hierbas medicinales) se agregan al agua fria para dar sabor. Rechazar el terere puede interpretarse como una senal de desconfianza.", vocab:["terere","mate","yuyos","bombilla","guampa","compartir","amistad","hospitalidad"], missionTip:"Cuando le ofrezcan terere, aceptelo siempre. Este simple gesto dice los respeto y confio en ustedes mejor que cualquier palabra. Es la llave de oro para abrir corazones paraguayos." },
  { id:"navidad",    icon:"🎄", label:"Navidad Paraguaya", sublabel:"La Navidad en verano",color:C.red,   tagline:"Navidad bajo las estrellas del verano sudamericano", body:"En Paraguay, la Navidad se celebra en pleno verano austral (diciembre) con temperaturas de 35-40 grados. Las familias se reunen para la Misa de Gallo, comen sopa paraguaya y asado, y se intercambian regalos el 25. El pesebre (nacimiento) es central en cada hogar. Los villancicos llenan las noches calurosas.", vocab:["Navidad","pesebre","Jesus","villancico","Misa de Gallo","familia","nacimiento","celebrar"], missionTip:"La Navidad es la oportunidad perfecta para compartir el verdadero significado del nacimiento de Cristo. Pregunte: Que significa para usted la Navidad?" },
  { id:"comida",     icon:"🍽️", label:"Comida Paraguaya", sublabel:"Sabores unicos",       color:C.terra, tagline:"Cada plato cuenta una historia de dos mundos", body:"La cocina paraguaya es una mezcla unica de tradiciones guaranies y espanolas. La sopa paraguaya (a pesar del nombre, es un pan de maiz horneado con queso) es el plato nacional. La chipa se come especialmente en Semana Santa. El asado es casi sagrado en los encuentros familiares. La mandioca aparece en casi todas las comidas.", vocab:["sopa paraguaya","chipa","asado","mandioca","mbeju","Que rico","cocinar","sabor"], missionTip:"Siempre acepte las comidas que le ofrezcan. Exprese apreciacion sincera. Rechazar comidas puede cerrar puertas; aceptarlas con gratitud construye puentes de amor." },
  { id:"naturaleza", icon:"🌊", label:"El Rio Paraguay",   sublabel:"Naturaleza y Creacion",color:C.river, tagline:"El rio que divide y une una nacion entera", body:"El Rio Paraguay divide el pais en dos regiones: el Gran Chaco al oeste (seco, extenso) y la Region Oriental al este (fertil, boscosa). El Pantanal al norte es uno de los humedales tropicales mas grandes del mundo con biodiversidad extraordinaria. Los paraguayos tienen una conexion profunda con su tierra y sus rios.", vocab:["rio","Chaco","Pantanal","naturaleza","creacion","agua","tierra","biodiversidad"], missionTip:"La belleza natural de Paraguay es un testimonio de la creacion de Dios. Use la naturaleza como punto de entrada: No creen que toda esta belleza tiene un Creador que la ama?" },
];
const READER_TEXTS = [
  { id:"legend", category:"Folklore", icon:"🪶", level:"Basico",     levelColor:C.green,
    title:"La Leyenda de la Yerba Mate", subtitle:"Cuento Guarani",
    segments:[
      { es:"Cuentan los ancianos guaranies que hace mucho tiempo, los dioses bajaron a visitar la tierra.", en:"The Guarani elders tell that long ago, the gods came down to visit the earth." },
      { es:"Una familia muy humilde los recibio con gran hospitalidad, ofreciendo su unica comida y refugio.", en:"A very humble family received them with great hospitality, offering their only food and shelter." },
      { es:"En agradecimiento, los dioses decidieron dar a esa familia un regalo especial.", en:"In gratitude, the gods decided to give that family a special gift." },
      { es:"Transformaron a la hija menor en una planta nueva y hermosa: la yerba mate.", en:"They transformed the youngest daughter into a new and beautiful plant: the yerba mate." },
      { es:"Desde ese dia, la yerba mate da fuerza, compania y alegria a todos los que la comparten.", en:"From that day on, yerba mate gives strength, companionship, and joy to all who share it." },
      { es:"Por eso, compartir terere no es solo beber — es compartir un regalo sagrado.", en:"That is why sharing terere is not just drinking — it is sharing a sacred gift." },
    ]},
  { id:"pmg",    category:"Mision",   icon:"📖", level:"Avanzado",   levelColor:C.blue,
    title:"El Mensaje de la Restauracion", subtitle:"Predicad Mi Evangelio, Cap. 3",
    segments:[
      { es:"Dios es el Padre Celestial de todos los espiritus que han vivido y viviran en la tierra.", en:"God is the Heavenly Father of all the spirits that have lived and will live on the earth." },
      { es:"El ama a Sus hijos con amor perfecto y desea que todos retornen a Su presencia.", en:"He loves His children with perfect love and desires that all return to His presence." },
      { es:"Jesucristo es el Hijo de Dios. El vino a la tierra para redimir a la humanidad del pecado y de la muerte.", en:"Jesus Christ is the Son of God. He came to earth to redeem mankind from sin and death." },
      { es:"Mediante la Expiacion de Jesucristo, podemos ser perdonados del pecado y vivir con Dios eternamente.", en:"Through the Atonement of Jesus Christ, we can be forgiven of sin and live with God eternally." },
      { es:"Jose Smith fue llamado como profeta para restaurar el Evangelio de Jesucristo en su plenitud sobre la tierra.", en:"Joseph Smith was called as a prophet to restore the Gospel of Jesus Christ in its fullness." },
      { es:"Hoy existe un profeta vivo que guia a la Iglesia de Jesucristo con revelacion continua.", en:"Today there is a living prophet who guides the Church of Jesus Christ with continuous revelation." },
    ]},
  { id:"nephi",  category:"Escritura",icon:"📜", level:"Intermedio", levelColor:C.gold,
    title:"2 Nefi 31:20", subtitle:"El Libro de Mormon",
    segments:[
      { es:"Por lo tanto, os digo que debeis seguir adelante con firmeza en Cristo,", en:"Wherefore, I say unto you that ye must press forward with a steadfastness in Christ," },
      { es:"teniendo un brillo perfecto de esperanza y amor a Dios y a todos los hombres.", en:"having a perfect brightness of hope and a love of God and of all men." },
      { es:"Por lo cual, si seguís adelante,", en:"Wherefore, if ye shall press forward," },
      { es:"festejando en la palabra de Cristo,", en:"feasting upon the word of Christ," },
      { es:"y aguantais hasta el fin,", en:"and endure to the end," },
      { es:"he aqui, asi dice el Padre: Tendreis vida eterna.", en:"behold, thus saith the Father: Ye shall have eternal life." },
    ]},
  { id:"juan316",category:"Biblia",   icon:"✝️", level:"Basico",     levelColor:C.green,
    title:"Juan 3:16", subtitle:"El Nuevo Testamento",
    segments:[
      { es:"Porque de tal manera amo Dios al mundo,", en:"For God so loved the world," },
      { es:"que ha dado a su Hijo unigenito,", en:"that he gave his only begotten Son," },
      { es:"para que todo aquel que en el cree,", en:"that whosoever believeth in him" },
      { es:"no se pierda,", en:"should not perish," },
      { es:"sino que tenga vida eterna.", en:"but have everlasting life." },
    ]},
  { id:"oracion",category:"Oracion",  icon:"🙏", level:"Practica",   levelColor:C.red,
    title:"Oracion Matutina del Misionero", subtitle:"Practica de oracion",
    segments:[
      { es:"Querido Padre Celestial,", en:"Dear Heavenly Father," },
      { es:"te damos gracias por esta hermosa manana y por el privilegio de servir como misioneros en Paraguay.", en:"we thank thee for this beautiful morning and for the privilege of serving as missionaries in Paraguay." },
      { es:"Por favor, dirigenos hoy hacia las personas preparadas para recibir el Evangelio.", en:"Please lead us today toward the people prepared to receive the Gospel." },
      { es:"Ayudanos a ensenar con el poder del Espiritu Santo para que toquemos corazones.", en:"Help us to teach with the power of the Holy Ghost so that we may touch hearts." },
      { es:"Bendice a nuestras familias en casa y a los investigadores de esta area.", en:"Bless our families at home and the investigators in this area." },
      { es:"En el nombre de Jesucristo, amen.", en:"In the name of Jesus Christ, amen." },
    ]},
];


const SCRIPTURE_BOOKS = [
  { id:"bom", label:"El Libro de Mormon", sublabel:"Otro Testamento de Jesucristo", icon:"📗", color:C.blue,
    chapters:[
      { ref:"1 Nefi 1:1-3",   topic:"El principio del registro",
        verses:[{ num:1, es:"Yo, Nefi, habiendo nacido de padres buenos, y habiendo recibido mucha instruccion de mi padre; y habiendo visto muchas aflicciones en el transcurso de mis dias; sin embargo habiendo sido muy favorecido del Senor en todos mis dias...", en:"I, Nephi, having been born of goodly parents, therefore I was taught somewhat in all the learning of my father; and having seen many afflictions in the course of my days, nevertheless, having been highly favored of the Lord in all my days..." }]},
      { ref:"1 Nefi 3:7",    topic:"Ire y hare",
        verses:[{ num:7, es:"Y acontecio que yo, Nefi, le dije a mi padre: Ire y hare las cosas que el Senor ha mandado, pues se que el Senor no da mandamientos a los hijos de los hombres sino que preparara el camino para que puedan cumplir lo que les ha mandado.", en:"And it came to pass that I, Nephi, said unto my father: I will go and do the things which the Lord hath commanded, for I know that the Lord giveth no commandments unto the children of men, save he shall prepare a way for them that they may accomplish the thing which he commandeth them." }]},
      { ref:"2 Nefi 2:25",   topic:"Los hombres existen para tener gozo",
        verses:[{ num:25, es:"Adan cayo para que los hombres existieran; y existen los hombres para que tengan gozo.", en:"Adam fell that men might be; and men are, that they might have joy." }]},
      { ref:"2 Nefi 25:23",  topic:"La gracia despues de todo lo que podemos hacer",
        verses:[{ num:23, es:"Porque trabajamos diligentemente para escribir, a fin de persuadir a nuestros hijos y tambien a nuestros hermanos que crean en Cristo y se reconcilien con Dios; porque sabemos que es por la gracia que nos salvamos, despues de hacer cuanto podamos.", en:"For we labor diligently to write, to persuade our children, and also our brethren, to believe in Christ, and to be reconciled to God; for we know that it is by grace that we are saved, after all we can do." }]},
      { ref:"2 Nefi 31:17-20",topic:"La puerta del bautismo y el camino",
        verses:[{ num:17, es:"Pues la puerta por la cual debeis entrar es el arrepentimiento y el bautismo por agua; y entonces viene la remision de vuestros pecados por fuego y por el Espiritu Santo.", en:"For the gate by which ye should enter is repentance and baptism by water; and then cometh a remission of your sins by fire and by the Holy Ghost." },{ num:20, es:"Por lo tanto, os digo que debeis seguir adelante con firmeza en Cristo, teniendo un brillo perfecto de esperanza y amor a Dios y a todos los hombres. Y si aguantais hasta el fin, he aqui, asi dice el Padre: Tendreis vida eterna.", en:"Wherefore, ye must press forward with a steadfastness in Christ, having a perfect brightness of hope, and a love of God and of all men. And if ye shall press forward and endure to the end, behold, thus saith the Father: Ye shall have eternal life." }]},
      { ref:"Enos 1:3-8",    topic:"La oracion que cambio su alma",
        verses:[{ num:3, es:"He aqui, fui al bosque para cazar bestias; y las palabras que a menudo habia oido a mi padre hablar con respecto a la vida eterna y al gozo de los santos, se me penetraron profundamente en el corazon.", en:"Behold, I went to hunt beasts in the forests; and the words which I had often heard my father speak concerning eternal life, and the joy of the saints, sunk deep into my heart." },{ num:4, es:"Y mi alma tuvo hambre; y arrodille mis rodillas ante mi Hacedor, y clame a el en oracion poderosa y suplica por mi propia alma.", en:"And my soul hungered; and I kneeled down before my Maker, and I cried unto him in mighty prayer and supplication for mine own soul." },{ num:8, es:"Y me respondio, diciendo: Enos, tus pecados te son perdonados, y seras bendito.", en:"And he said unto me: Enos, thy sins are forgiven thee, and thou shalt be blessed." }]},
      { ref:"Mosiah 2:17",   topic:"Al servicio de vuestros semejantes",
        verses:[{ num:17, es:"Y he aqui, os digo estas cosas para que aprendais sabiduria; para que aprendais que cuando estais al servicio de vuestros semejantes, estais solamente al servicio de vuestro Dios.", en:"And behold, I tell you these things that ye may learn wisdom; that ye may learn that when ye are in the service of your fellow beings ye are only in the service of your God." }]},
      { ref:"Mosiah 3:17",   topic:"La salvacion solo viene por Cristo",
        verses:[{ num:17, es:"Y ademas, la salvacion no viene sino por el arrepentimiento y la fe en el Senor Jesucristo.", en:"And moreover, I say unto you, that there shall be no other name given nor any other way nor means whereby salvation can come unto the children of men, only in and through the name of Christ, the Lord Omnipotent." }]},
      { ref:"Alma 5:14",     topic:"El poderoso cambio",
        verses:[{ num:14, es:"Y ahora bien, habeis experimentado este poderoso cambio en vuestros corazones? Podeis sentir de este modo ahora? Habeis nacido de Dios?", en:"And now behold, I ask of you, my brethren of the church, have ye spiritually been born of God? Have ye received his image in your countenances? Have ye experienced this mighty change in your hearts?" }]},
      { ref:"Alma 7:11-12",  topic:"El sufrimiento de Cristo",
        verses:[{ num:11, es:"Y el saldra, sufriendo dolores y aflicciones y tentaciones de todo genero; y esto para que se cumpla la palabra que dice: El tomara sobre si los dolores y las enfermedades de su pueblo.", en:"And he shall go forth, suffering pains and afflictions and temptations of every kind; and this that the word might be fulfilled which saith he will take upon him the pains and the sicknesses of his people." },{ num:12, es:"Y tomara sobre si la muerte, a fin de aflojar los lazos de la muerte que ligan a su pueblo; y tomara sobre si sus enfermedades, para que sepa como socorrer a su pueblo segun sus enfermedades.", en:"And he will take upon him death, that he may loose the bands of death which bind his people; and he will take upon him their infirmities, that he may know according to the flesh how to succor his people according to their infirmities." }]},
      { ref:"Alma 32:21,27", topic:"La fe y la semilla",
        verses:[{ num:21, es:"Y ahora bien, como dije acerca de la fe, la fe no es tener un conocimiento perfecto de las cosas; por lo tanto, si teneis fe, esperais en cosas que no se ven, las cuales son verdaderas.", en:"And now as I said concerning faith — faith is not to have a perfect knowledge of things; therefore if ye have faith ye hope for things which are not seen, which are true." },{ num:27, es:"Pero he aqui, si despertais y despertais vuestras facultades, aunque sea hasta un experimento y ejerceis un poco de fe, si, aunque no sea mas que deseo de creer, dejese que este deseo obre en vosotros.", en:"But behold, if ye will awake and arouse your faculties, even to an experiment upon my words, and exercise a particle of faith, yea, even if ye can no more than desire to believe, let this desire work in you." }]},
      { ref:"Alma 34:32-33", topic:"Esta vida es el tiempo de prepararse",
        verses:[{ num:32, es:"Porque he aqui, esta vida es el tiempo para los hombres de prepararse para encontrar a Dios; si, he aqui que el dia de esta vida es el dia en que los hombres deben realizar sus obras.", en:"For behold, this life is the time for men to prepare to meet God; yea, behold the day of this life is the day for men to perform their labors." },{ num:33, es:"Que queda sino que os arrepintais de vuestros pecados y no procrastieis el dia de vuestro arrepentimiento?", en:"And now, as I said unto you before, as ye have had so many witnesses, therefore, I beseech of you that ye do not procrastinate the day of your repentance until the end." }]},
      { ref:"Alma 36:3",     topic:"Confianza en Dios en las pruebas",
        verses:[{ num:3, es:"Cuanto pondreis vuestra confianza en Dios, sereis sostenidos en vuestras pruebas, tribulaciones y aflicciones, y sereis levantados en el ultimo dia.", en:"Whosoever shall put their trust in God shall be supported in their trials, and their troubles, and their afflictions, and shall be lifted up at the last day." }]},
      { ref:"Alma 37:6-7",   topic:"Cosas pequenas y simples",
        verses:[{ num:6, es:"Ahora bien, mediante las cosas pequenas y simples se llevan a cabo las grandes cosas; y mediante los pequenos medios el Senor confunde a los sabios y lleva a cabo la salvacion de muchas almas.", en:"Now ye may suppose that this is foolishness in me; but behold I say unto you, that by small and simple things are great things brought to pass; and small means in many instances doth confound the wise." }]},
      { ref:"3 Nefi 11:10-11",topic:"La aparicion de Cristo",
        verses:[{ num:10, es:"He aqui, soy Jesucristo, de quien los profetas dieron testimonio de que habia de venir al mundo.", en:"Behold, I am Jesus Christ, whom the prophets testified shall come into the world." },{ num:11, es:"Y he aqui que soy la luz y la vida del mundo; y he bebido de esa copa amarga que el Padre me dio, y he glorificado al Padre al tomar sobre mi los pecados del mundo.", en:"And behold, I am the light and the life of the world; and I have drunk out of that bitter cup which the Father hath given me, and have glorified the Father in taking upon me the sins of the world." }]},
      { ref:"Moroni 7:47-48",topic:"La caridad — el amor puro de Cristo",
        verses:[{ num:47, es:"Mas la caridad es el amor puro de Cristo, y permanece para siempre; y el que se halle que la posee en el ultimo dia, le ira bien.", en:"But charity is the pure love of Christ, and it endureth forever; and whoso is found possessed of it at the last day, it shall be well with him." },{ num:48, es:"Por lo tanto, amados mios, orad al Padre con toda la energia de vuestro corazon para que seais llenos de este amor, que el ha otorgado a todos los que son verdaderos seguidores de su Hijo Jesucristo.", en:"Wherefore, my beloved brethren, pray unto the Father with all the energy of heart, that ye may be filled with this love, which he hath bestowed upon all who are true followers of his Son, Jesus Christ." }]},
      { ref:"Moroni 10:3-5", topic:"La promesa de Moroni",
        verses:[{ num:3, es:"He aqui, quisiera exhortaros a que, cuando leyereis estas cosas, recordeis cuan misericordioso ha sido el Senor con los hijos de los hombres desde la creacion de Adan, y mediteis sobre ello en vuestros corazones.", en:"Behold, I would exhort you that when ye shall read these things, that ye would remember how merciful the Lord hath been unto the children of men from the creation of Adam even down until the time that ye shall receive these things, and ponder it in your hearts." },{ num:4, es:"Y cuando recibiereis estas cosas, yo os exhortaria a que preguntaseis a Dios el Padre Eterno, en el nombre de Cristo, si no son verdaderas estas cosas; y si preguntareis con un corazon sincero, con verdadera intencion, teniendo fe en Cristo, el os manifestara la verdad de ellas por el poder del Espiritu Santo.", en:"And when ye shall receive these things, I would exhort you that ye would ask God, the Eternal Father, in the name of Christ, if these things are not true; and if ye shall ask with a sincere heart, with real intent, having faith in Christ, he will manifest the truth of it unto you, by the power of the Holy Ghost." },{ num:5, es:"Y por el poder del Espiritu Santo podeis saber la verdad de todas las cosas.", en:"And by the power of the Holy Ghost ye may know the truth of all things." }]},
    ]},
  { id:"at", label:"Antiguo Testamento", sublabel:"El Registro de Israel", icon:"📜", color:C.gold,
    chapters:[
      { ref:"Genesis 1:26-27",  topic:"El hombre a imagen de Dios",
        verses:[{ num:26, es:"Entonces dijo Dios: Hagamos al hombre a nuestra imagen, conforme a nuestra semejanza.", en:"And God said, Let us make man in our image, after our likeness." },{ num:27, es:"Y creo Dios al hombre a su imagen, a imagen de Dios lo creo; varon y hembra los creo.", en:"So God created man in his own image, in the image of God created he him; male and female created he them." }]},
      { ref:"Josue 24:15",       topic:"Escoged a quien sirveis",
        verses:[{ num:15, es:"Y si mal os parece servir a Jehova, escoged hoy a quien sirvais; pero yo y mi casa serviremos a Jehova.", en:"And if it seem evil unto you to serve the Lord, choose you this day whom ye will serve; but as for me and my house, we will serve the Lord." }]},
      { ref:"1 Reyes 19:11-12",  topic:"La voz apacible y delicada",
        verses:[{ num:11, es:"Y he aqui Jehova que pasaba, y un grande y poderoso viento que rompia los montes delante de Jehova; pero Jehova no estaba en el viento. Y tras el viento un terremoto; pero Jehova no estaba en el terremoto.", en:"And, behold, the Lord passed by, and a great and strong wind rent the mountains; but the Lord was not in the wind: and after the wind an earthquake; but the Lord was not in the earthquake." },{ num:12, es:"Y tras el terremoto un fuego; pero Jehova no estaba en el fuego. Y tras el fuego una voz apacible y delicada.", en:"And after the earthquake a fire; but the Lord was not in the fire: and after the fire a still small voice." }]},
      { ref:"Salmo 46:10",        topic:"Estad quietos y conoced a Dios",
        verses:[{ num:10, es:"Estad quietos, y conoced que yo soy Dios; sere exaltado entre las naciones; enaltecido sere en la tierra.", en:"Be still, and know that I am God: I will be exalted among the heathen, I will be exalted in the earth." }]},
      { ref:"Isaias 1:18",        topic:"Aunque vuestros pecados sean como la grana",
        verses:[{ num:18, es:"Venid luego, dice Jehova, y estemos a cuenta: si vuestros pecados fueren como la grana, como la nieve seran emblanquecidos; si fueren rojos como el carmesi, vendran a ser como blanca lana.", en:"Come now, and let us reason together, saith the Lord: though your sins be as scarlet, they shall be as white as snow; though they be red like crimson, they shall be as wool." }]},
      { ref:"Isaias 55:8-9",      topic:"Mis pensamientos no son vuestros pensamientos",
        verses:[{ num:8, es:"Porque mis pensamientos no son vuestros pensamientos, ni vuestros caminos mis caminos, dijo Jehova.", en:"For my thoughts are not your thoughts, neither are your ways my ways, saith the Lord." },{ num:9, es:"Como son mas altos los cielos que la tierra, asi son mis caminos mas altos que vuestros caminos, y mis pensamientos mas que vuestros pensamientos.", en:"For as the heavens are higher than the earth, so are my ways higher than your ways, and my thoughts than your thoughts." }]},
      { ref:"Jeremias 1:5",       topic:"Antes que te formase te conoci",
        verses:[{ num:5, es:"Antes que te formase en el vientre te conoci, y antes que nacieras te santifique, te di por profeta a las naciones.", en:"Before I formed thee in the belly I knew thee; and before thou camest forth out of the womb I sanctified thee, and I ordained thee a prophet unto the nations." }]},
      { ref:"Amos 3:7",           topic:"Dios revela sus secretos a sus profetas",
        verses:[{ num:7, es:"Porque no hara nada Jehova el Senor, sin que revele su secreto a sus siervos los profetas.", en:"Surely the Lord God will do nothing, but he revealeth his secret unto his servants the prophets." }]},
      { ref:"Malaquias 4:5-6",    topic:"Elias — sellador de familias",
        verses:[{ num:5, es:"He aqui, yo os envio el profeta Elias, antes que venga el dia de Jehova, grande y terrible.", en:"Behold, I will send you Elijah the prophet before the coming of the great and dreadful day of the Lord." },{ num:6, es:"El hara volver el corazon de los padres hacia los hijos, y el corazon de los hijos hacia los padres, no sea que yo venga y hiera la tierra con maldicion.", en:"And he shall turn the heart of the fathers to the children, and the heart of the children to their fathers, lest I come and smite the earth with a curse." }]},
    ]},
  { id:"nt", label:"Nuevo Testamento", sublabel:"El Evangelio de Jesucristo", icon:"✝️", color:C.red,
    chapters:[
      { ref:"Mateo 3:16-17",   topic:"El bautismo de Cristo",
        verses:[{ num:16, es:"Y Jesus, despues que fue bautizado, subio luego del agua; y he aqui los cielos le fueron abiertos, y vio al Espiritu de Dios que descendia como paloma.", en:"And Jesus, when he was baptized, went up straightway out of the water: and, lo, the heavens were opened unto him, and he saw the Spirit of God descending like a dove." },{ num:17, es:"Y hubo una voz de los cielos, que decia: Este es mi Hijo amado, en quien tengo complacencia.", en:"And lo a voice from heaven, saying, This is my beloved Son, in whom I am well pleased." }]},
      { ref:"Mateo 5:48",      topic:"Sed perfectos como vuestro Padre",
        verses:[{ num:48, es:"Sed, pues, vosotros perfectos, como vuestro Padre que esta en los cielos es perfecto.", en:"Be ye therefore perfect, even as your Father which is in heaven is perfect." }]},
      { ref:"Mateo 7:7-8",     topic:"Pedid, buscad, llamad",
        verses:[{ num:7, es:"Pedid, y se os dara; buscad, y hallareis; llamad, y se os abrira.", en:"Ask, and it shall be given you; seek, and ye shall find; knock, and it shall be opened unto you." },{ num:8, es:"Porque todo aquel que pide, recibe; y el que busca, halla; y al que llama, se le abrira.", en:"For every one that asketh receiveth; and he that seeketh findeth; and to him that knocketh it shall be opened." }]},
      { ref:"Mateo 22:36-40",  topic:"Los dos grandes mandamientos",
        verses:[{ num:37, es:"Jesus le dijo: Amaras al Senor tu Dios con todo tu corazon, y con toda tu alma, y con toda tu mente.", en:"Jesus said unto him, Thou shalt love the Lord thy God with all thy heart, and with all thy soul, and with all thy mind." },{ num:38, es:"Este es el primero y grande mandamiento.", en:"This is the first and great commandment." },{ num:39, es:"Y el segundo es semejante: Amaras a tu projimo como a ti mismo.", en:"And the second is like unto it, Thou shalt love thy neighbour as thyself." }]},
      { ref:"Mateo 28:19-20",  topic:"La Gran Comision",
        verses:[{ num:19, es:"Por tanto, id, y haced discipulos a todas las naciones, bautizandolos en el nombre del Padre, y del Hijo, y del Espiritu Santo;", en:"Go ye therefore, and teach all nations, baptizing them in the name of the Father, and of the Son, and of the Holy Ghost." },{ num:20, es:"y he aqui yo estoy con vosotros todos los dias, hasta el fin del mundo.", en:"and, lo, I am with you always, even unto the end of the world." }]},
      { ref:"Juan 3:5",        topic:"Nacer de agua y del Espiritu",
        verses:[{ num:5, es:"Respondio Jesus: De cierto, de cierto te digo, que el que no naciere de agua y del Espiritu, no puede entrar en el reino de Dios.", en:"Jesus answered, Verily, verily, I say unto thee, Except a man be born of water and of the Spirit, he cannot enter into the kingdom of God." }]},
      { ref:"Juan 3:16-17",    topic:"El amor de Dios",
        verses:[{ num:16, es:"Porque de tal manera amo Dios al mundo, que ha dado a su Hijo unigenito, para que todo aquel que en el cree, no se pierda, mas tenga vida eterna.", en:"For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life." },{ num:17, es:"Porque no envio Dios a su Hijo al mundo para condenar al mundo, sino para que el mundo sea salvo por el.", en:"For God sent not his Son into the world to condemn the world; but that the world through him might be saved." }]},
      { ref:"Juan 7:17",       topic:"Conocer si la doctrina es de Dios",
        verses:[{ num:17, es:"El que quiera hacer la voluntad de Dios, conocera si la doctrina es de Dios, o si yo hablo por mi propia cuenta.", en:"If any man will do his will, he shall know of the doctrine, whether it be of God, or whether I speak of myself." }]},
      { ref:"Juan 14:6",       topic:"Yo soy el camino, la verdad y la vida",
        verses:[{ num:6, es:"Jesus le dijo: Yo soy el camino, y la verdad, y la vida; nadie viene al Padre, sino por mi.", en:"Jesus saith unto him, I am the way, the truth, and the life: no man cometh unto the Father, but by me." }]},
      { ref:"Juan 14:26-27",   topic:"El Consolador — el Espiritu Santo",
        verses:[{ num:26, es:"Mas el Consolador, el Espiritu Santo, a quien el Padre enviara en mi nombre, el os ensenara todas las cosas, y os recordara todo lo que yo os he dicho.", en:"But the Comforter, which is the Holy Ghost, whom the Father will send in my name, he shall teach you all things, and bring all things to your remembrance, whatsoever I have said unto you." },{ num:27, es:"La paz os dejo, mi paz os doy; yo no os la doy como el mundo la da. No se turbe vuestro corazon, ni tenga miedo.", en:"Peace I leave with you, my peace I give unto you: not as the world giveth, give I unto you. Let not your heart be troubled, neither let it be afraid." }]},
      { ref:"Hechos 3:19-21",  topic:"La Restauracion de todas las cosas",
        verses:[{ num:19, es:"Arrepentios y convertios, para que sean borrados vuestros pecados; para que vengan de la presencia del Senor tiempos de refrigerio.", en:"Repent ye therefore, and be converted, that your sins may be blotted out, when the times of refreshing shall come from the presence of the Lord." },{ num:21, es:"A quien de cierto es necesario que el cielo reciba hasta los tiempos de la restauracion de todas las cosas, de que hablo Dios por boca de sus santos profetas que han sido desde tiempo antiguo.", en:"Whom the heaven must receive until the times of restitution of all things, which God hath spoken by the mouth of all his holy prophets since the world began." }]},
      { ref:"Hechos 8:14-17",  topic:"Imposicion de manos para el Espiritu Santo",
        verses:[{ num:15, es:"Los cuales, habiendo venido, oraron por ellos para que recibiesen el Espiritu Santo.", en:"Who, when they were come down, prayed for them, that they might receive the Holy Ghost." },{ num:17, es:"Entonces les imponian las manos, y recibian el Espiritu Santo.", en:"Then laid they their hands on them, and they received the Holy Ghost." }]},
      { ref:"Romanos 8:16-17", topic:"Hijos y herederos de Dios",
        verses:[{ num:16, es:"El Espiritu mismo da testimonio a nuestro espiritu, de que somos hijos de Dios.", en:"The Spirit itself beareth witness with our spirit, that we are the children of God." },{ num:17, es:"Y si hijos, tambien herederos; herederos de Dios y coherederos con Cristo.", en:"And if children, then heirs; heirs of God, and joint-heirs with Christ." }]},
      { ref:"Efesios 2:19-20", topic:"Fundados sobre apostoles y profetas",
        verses:[{ num:19, es:"Asi que ya no sois extranjeros ni advenedizos, sino conciudadanos de los santos, y miembros de la familia de Dios.", en:"Now therefore ye are no more strangers and foreigners, but fellowcitizens with the saints, and of the household of God." },{ num:20, es:"Edificados sobre el fundamento de los apostoles y profetas, siendo la principal piedra del angulo Jesucristo mismo.", en:"And are built upon the foundation of the apostles and prophets, Jesus Christ himself being the chief corner stone." }]},
      { ref:"Efesios 4:11-14", topic:"Apostoles y profetas en la Iglesia",
        verses:[{ num:11, es:"Y el mismo constituyo a unos, apostoles; a otros, profetas; a otros, evangelistas; a otros, pastores y maestros.", en:"And he gave some, apostles; and some, prophets; and some, evangelists; and some, pastors and teachers." },{ num:12, es:"A fin de perfeccionar a los santos para la obra del ministerio, para la edificacion del cuerpo de Cristo.", en:"For the perfecting of the saints, for the work of the ministry, for the edifying of the body of Christ." }]},
      { ref:"Hebreos 5:4",     topic:"Llamado por Dios como Aaron",
        verses:[{ num:4, es:"Y nadie toma para si esta honra, sino el que es llamado por Dios, como lo fue Aaron.", en:"And no man taketh this honour unto himself, but he that is called of God, as was Aaron." }]},
      { ref:"Santiago 1:5",    topic:"Pedid sabiduria a Dios",
        verses:[{ num:5, es:"Y si alguno de vosotros tiene falta de sabiduria, pidala a Dios, el cual da a todos abundantemente y sin reproche, y le sera dada.", en:"If any of you lack wisdom, let him ask of God, that giveth to all men liberally, and upbraideth not; and it shall be given him." }]},
      { ref:"Santiago 2:17",   topic:"La fe sin obras es muerta",
        verses:[{ num:17, es:"Asi tambien la fe, si no tiene obras, es muerta en si misma.", en:"Even so faith, if it hath not works, is dead, being alone." }]},
    ]},
  { id:"dyc", label:"Doctrina y Convenios", sublabel:"Revelacion Moderna", icon:"📘", color:C.green,
    chapters:[
      { ref:"D y C 1:30",     topic:"La unica Iglesia verdadera",
        verses:[{ num:30, es:"La unica iglesia verdadera y viviente sobre la faz de toda la tierra, con la cual yo, el Senor, estoy bien complacido.", en:"The only true and living church upon the face of the whole earth, with which I, the Lord, am well pleased." }]},
      { ref:"D y C 4:2-4",    topic:"La obra admirable de Dios",
        verses:[{ num:2, es:"Por lo tanto, oh vosotros que os embarcais en el servicio de Dios, ved que le sirveis con todo vuestro corazon, poder, mente y fuerza.", en:"Therefore, O ye that embark in the service of God, see that ye serve him with all your heart, might, mind and strength." },{ num:3, es:"Por tanto, si teneis deseos de servir a Dios, sois llamados a la obra.", en:"Therefore, if ye have desires to serve God ye are called to the work." }]},
      { ref:"D y C 6:36",     topic:"Mirad a mi en todo pensamiento",
        verses:[{ num:36, es:"Mirad a mi en todo pensamiento; no dudeis, no temais.", en:"Look unto me in every thought; doubt not, fear not." }]},
      { ref:"D y C 8:2-3",    topic:"El espiritu de revelacion",
        verses:[{ num:2, es:"Si, yo os dire en vuestra mente y en vuestro corazon, mediante el Espiritu Santo, el cual vendra sobre vosotros y morara en vuestro corazon.", en:"Yea, behold, I will tell you in your mind and in your heart, by the Holy Ghost, which shall come upon you and which shall dwell in your heart." },{ num:3, es:"Ahora he aqui, esto es el espiritu de revelacion; he aqui, esto es el principio de esta obra; por lo tanto, seguid hasta terminar.", en:"Now, behold, this is the spirit of revelation; behold, this is the spirit by which Moses brought the children of Israel through the Red Sea on dry ground." }]},
      { ref:"D y C 9:7-9",    topic:"El ardor en el seno",
        verses:[{ num:7, es:"Debes estudiar esto en tu mente; entonces deberas preguntarme si es correcto, y si es correcto te causare que tu seno arda dentro de ti; por tanto, sentiras que es correcto.", en:"You must study it out in your mind; then you must ask me if it be right, and if it is right I will cause that your bosom shall burn within you; therefore, you shall feel that it is right." },{ num:8, es:"Pero si no es correcto, no tendras tales sentimientos, sino que tendras una insensatez de pensamiento.", en:"But if it be not right you shall have no such feelings, but you shall have a stupor of thought that shall cause you to forget the thing which is wrong." }]},
      { ref:"D y C 14:7",     topic:"El mayor don de Dios",
        verses:[{ num:7, es:"Y si guardas mis mandamientos y perseveras hasta el fin, tendras vida eterna, lo cual es el mayor de todos los dones de Dios.", en:"And, if you keep my commandments and endure to the end you shall have eternal life, which gift is the greatest of all the gifts of God." }]},
      { ref:"D y C 18:10-11,15",topic:"El valor de las almas",
        verses:[{ num:10, es:"Recuerda que el valor de las almas es grande a los ojos de Dios;", en:"Remember the worth of souls is great in the sight of God." },{ num:11, es:"porque he aqui, el Senor tu Redentor sufrio la muerte en la carne; por lo tanto sufrio el dolor de todos los hombres para que todos los hombres pudieran arrepentirse y acudir a el.", en:"For, behold, the Lord your Redeemer suffered death in the flesh; wherefore he suffered the pain of all men, that all men might repent and come unto him." },{ num:15, es:"Y si sucede que te esfuerzas con todos los dias de tu vida en proclamar este arrepentimiento a esta gente, y traes aunque sea un alma a mi, cuan grande sera tu gozo con el en el reino de mi Padre!", en:"And if it so be that you should labor all your days in crying repentance unto this people, and bring, save it be one soul unto me, how great shall be your joy with him in the kingdom of my Father!" }]},
      { ref:"D y C 20:37",    topic:"Requisitos para el bautismo",
        verses:[{ num:37, es:"Y nuevamente, por cuestion de bautismo: todos los que se humillen ante Dios y deseen ser bautizados, y vengan con corazones quebrantados y espiritus contritos, y sean testigos ante la iglesia de que en verdad se han arrepentido de todos sus pecados.", en:"All those who humble themselves before God, and desire to be baptized, and come forth with broken hearts and contrite spirits, and witness before the church that they have truly repented of all their sins, shall be received by baptism into his church." }]},
      { ref:"D y C 58:26-27", topic:"Hombres diligentes y laboriosos",
        verses:[{ num:26, es:"Porque he aqui, no es justo que yo mande en todas las cosas, pues aquel que esta compelido en todas las cosas es un siervo perezoso e indigno.", en:"For behold, it is not meet that I should command in all things; for he that is compelled in all things, the same is a slothful and not a wise servant." },{ num:27, es:"Por tanto, los hombres deberan ser diligentemente laboriosos en muchas cosas por su propia voluntad, y lograr mucha justicia.", en:"Verily I say, men should be anxiously engaged in a good cause, and do many things of their own free will, and bring to pass much righteousness." }]},
      { ref:"D y C 76:22-24", topic:"Testimonio de Cristo resucitado",
        verses:[{ num:22, es:"Y ahora bien, este es el testimonio que declaramos al mundo: que el vive!", en:"And now, after the many testimonies which have been given of him, this is the testimony, last of all, which we give of him: That he lives!" },{ num:23, es:"Pues le vimos, si, a mano derecha de Dios; y oimos la voz que declaraba que el es el Unigenito del Padre.", en:"For we saw him, even on the right hand of God; and we heard the voice bearing record that he is the Only Begotten of the Father." }]},
      { ref:"D y C 88:63",    topic:"Acercaos a mi",
        verses:[{ num:63, es:"Acercaos a mi y yo me acercare a vosotros; buscadme diligentemente y me encontrareis; pedid, y recibireis; llamad, y se os abrira.", en:"Draw near unto me and I will draw near unto you; seek me diligently and ye shall find me; ask, and ye shall receive; knock, and it shall be opened unto you." }]},
      { ref:"D y C 121:7-8",  topic:"Paz en las tribulaciones",
        verses:[{ num:7, es:"Hijo mio, que te digan tus tribulaciones: La paz sea a tu alma. Tu adversidad y tus aflicciones no seran sino por un breve momento.", en:"My son, peace be unto thy soul; thine adversity and thine afflictions shall be but a small moment." },{ num:8, es:"Y luego, si soportas bien las cosas, Dios te exaltara en lo alto; triunfaras sobre todos tus enemigos.", en:"And then, if thou endure it well, God shall exalt thee on high; thou shalt triumph over all thy foes." }]},
      { ref:"D y C 130:22-23",topic:"La naturaleza de la Deidad",
        verses:[{ num:22, es:"El Padre tiene un cuerpo de carne y huesos tan palpable como el del hombre; el Hijo tambien; pero el Espiritu Santo no tiene un cuerpo de carne y huesos, sino que es un personaje de Espiritu.", en:"The Father has a body of flesh and bones as tangible as man's; the Son also; but the Holy Ghost has not a body of flesh and bones, but is a personage of Spirit." }]},
      { ref:"D y C 131:1-4",  topic:"El matrimonio eterno y la exaltacion",
        verses:[{ num:1, es:"En el grado celestial de gloria hay tres cielos, o grados.", en:"In the celestial glory there are three heavens or degrees." },{ num:2, es:"Y para obtener el mas elevado, un hombre debe entrar al orden del sacerdocio, que significa el nuevo y sempiterno convenio del matrimonio.", en:"And in order to obtain the highest, a man must enter into this order of the priesthood meaning the new and everlasting covenant of marriage." }]},
    ]},
  { id:"pgp", label:"La Perla de Gran Precio", sublabel:"Escrituras Adicionales", icon:"💎", color:C.terra,
    chapters:[
      { ref:"Moises 1:39",               topic:"La obra y la gloria de Dios",
        verses:[{ num:39, es:"Porque he aqui, esta es mi obra y mi gloria: llevar a cabo la inmortalidad y la vida eterna del hombre.", en:"For behold, this is my work and my glory — to bring to pass the immortality and eternal life of man." }]},
      { ref:"Moises 7:18",               topic:"Sion — un mismo corazon y una misma mente",
        verses:[{ num:18, es:"Y el Senor llamo a su pueblo Sion, porque eran de un mismo corazon y una misma mente, y moraban en justicia; y no habia pobres entre ellos.", en:"And the Lord called his people Zion, because they were of one heart and one mind, and dwelt in righteousness; and there was no poor among them." }]},
      { ref:"Abraham 3:22-23",           topic:"Los espiritus nobles en la vida preterrenal",
        verses:[{ num:22, es:"Y vi que habia muchas almas nobles y grandes al principio; y Dios estaba entre ellas, y les dijo: A estos hare mis gobernantes.", en:"Now the Lord had shown unto me, Abraham, the intelligences that were organized before the world was; and among all these there were many of the noble and great ones." },{ num:23, es:"Y Dios vio que estas almas eran buenas, y se puso en medio de ellas y dijo: A ti te hare gobernante mio; pues fue escogido desde el principio.", en:"And God saw these souls that they were good, and he stood in the midst of them, and he said: These I will make my rulers; Abraham, thou art one of them; thou wast chosen before thou wast born." }]},
      { ref:"Jose Smith — Historia 1:15-17",topic:"La Primera Vision",
        verses:[{ num:15, es:"Apenas me hube llegado al lugar senalado y me arrodille, empece a ofrecer los deseos de mi corazon a Dios, cuando de improviso me vi envuelto por un poder de sorprendente influencia.", en:"After I had retired to the place where I had previously designed to go, having looked around me, and finding myself alone, I kneeled down and began to offer up the desires of my heart to God." },{ num:17, es:"Al posarse la luz sobre mi, vi a dos Personajes, cuyo fulgor y gloria desafian toda descripcion, uno de los cuales me hablo, llamandome por mi nombre, y dijo, senalando al otro: Este es mi Hijo Amado. Escuchale!", en:"When the light rested upon me I saw two Personages, whose brightness and glory defy all description, standing above me in the air. One of them spake unto me, calling me by name and said, pointing to the other — This is My Beloved Son. Hear Him!" }]},
      { ref:"Jose Smith — Historia 1:19", topic:"Todos se habian extraviado",
        verses:[{ num:19, es:"Me fue contestado que no debia unirme a ninguna de ellas, pues todas se habian extraviado y se habian apartado del Evangelio; que sus credos eran una abominacion ante su presencia.", en:"I was answered that I must join none of them, for they were all wrong; and the Personage who addressed me said that all their creeds were an abomination in his sight; that those professors were all corrupt." }]},
      { ref:"Articulos de Fe 1:1-4",     topic:"La Deidad, el pecado, y la salvacion",
        verses:[{ num:1, es:"Creemos en Dios, el Padre Eterno, y en Su Hijo, Jesucristo, y en el Espiritu Santo.", en:"We believe in God, the Eternal Father, and in His Son, Jesus Christ, and in the Holy Ghost." },{ num:2, es:"Creemos que los hombres seran castigados por sus propios pecados, y no por la transgresion de Adan.", en:"We believe that men will be punished for their own sins, and not for Adam's transgression." },{ num:3, es:"Creemos que mediante la Expiacion de Cristo todo el genero humano puede salvarse, mediante el cumplimiento de las leyes y ordenanzas del Evangelio.", en:"We believe that through the Atonement of Christ, all mankind may be saved, by obedience to the laws and ordinances of the Gospel." },{ num:4, es:"Creemos que los primeros principios y ordenanzas del Evangelio son: primero, Fe en el Senor Jesucristo; segundo, Arrepentimiento; tercero, Bautismo por inmersion para la remision de pecados; cuarto, Imposicion de manos para el don del Espiritu Santo.", en:"We believe that the first principles and ordinances of the Gospel are: first, Faith in the Lord Jesus Christ; second, Repentance; third, Baptism by immersion for the remission of sins; fourth, Laying on of hands for the gift of the Holy Ghost." }]},
      { ref:"Articulos de Fe 1:6-7",     topic:"La organizacion de la Iglesia Primitiva",
        verses:[{ num:6, es:"Creemos en la misma organizacion que existio en la Iglesia Primitiva, a saber: apostoles, profetas, pastores, maestros, evangelistas, etc.", en:"We believe in the same organization that existed in the Primitive Church, namely, apostles, prophets, pastors, teachers, evangelists, and so forth." },{ num:7, es:"Creemos en el don de lenguas, profecia, revelacion, visiones, sanidades, interpretacion de lenguas, etc.", en:"We believe in the gift of tongues, prophecy, revelation, visions, healing, interpretation of tongues, and so forth." }]},
      { ref:"Articulo de Fe 1:13",       topic:"Virtud, honestidad y esperanza",
        verses:[{ num:13, es:"Creemos en ser honrados, veraces, castos, benevolos, virtuosos y en hacer el bien a todos los hombres; en realidad podemos decir que seguimos la admonicion de Pablo: Creemos todas las cosas, esperamos todas las cosas, hemos soportado muchas cosas y esperamos poder soportar todas las cosas. Si hay algo virtuoso, bello, de buena reputacion o digno de alabanza, a estas cosas aspiramos.", en:"We believe in being honest, true, chaste, benevolent, virtuous, and in doing good to all men; indeed, we may say that we follow the admonition of Paul — We believe all things, we hope all things, we have endured many things, and hope to be able to endure all things. If there is anything virtuous, lovely, or of good report or praiseworthy, we seek after these things." }]},
    ]},
];
const SPEAK_LEVELS = [
  { id:"sounds",   label:"Nivel 1", sublabel:"Sonidos y Palabras",        color:C.blue,  note:"Domina estos sonidos primero — definen el acento latinoamericano.",
    exercises:[{id:"rr",pt:"rr — rapido, perro, tierra",hint:"Trill your tongue — strong roll against the roof of your mouth!"},{id:"j",pt:"j — Jesus, joven, jardin",hint:"Throaty H from the back of the throat — like Spanish J"},{id:"ny",pt:"ni — nino, manana, Espana",hint:"Like 'ny' in canyon — tongue presses to palate"},{id:"ll",pt:"ll — llamar, calle, pollo",hint:"In Paraguay, often like 'sh' in shoe!"},{id:"r1",pt:"Rio",hint:"Trill the R at word start — RRR-ee-oh"},{id:"r2",pt:"terere",hint:"Soft tap between vowels — teh-reh-REH"},{id:"j1",pt:"Jesucristo",hint:"Zheh-soo-KREES-toh — J is throaty H"},{id:"b1",pt:"bautismo",hint:"bah-oo-TEES-moh — V and B same sound in Spanish"}]},
  { id:"basic",    label:"Nivel 2", sublabel:"Frases Basicas",             color:C.green, note:"Frases cortas del dia a dia — hasta que sean naturales.",
    exercises:[{id:"b1",pt:"Buenos dias, me llamo Elder Nilsson.",hint:"Good morning, my name is Elder Nilsson."},{id:"b2",pt:"Como esta usted hoy?",hint:"How are you today? (formal)"},{id:"b3",pt:"Mucho gusto en conocerle.",hint:"Very pleased to meet you."},{id:"b4",pt:"Que le vaya muy bien.",hint:"May things go well for you."},{id:"b5",pt:"Hasta luego, que Dios le bendiga.",hint:"Goodbye — may God bless you."},{id:"b6",pt:"Soy misionero de La Iglesia de Jesucristo.",hint:"I am a missionary of The Church of Jesus Christ."},{id:"b7",pt:"Dios le ama.",hint:"God loves you."},{id:"b8",pt:"Podemos compartir un mensaje?",hint:"May we share a message?"}]},
  { id:"mission",  label:"Nivel 3", sublabel:"Oraciones de Mision",        color:C.red,   note:"Oraciones misioneras completas — el lenguaje de cada puerta y leccion.",
    exercises:[{id:"m1",pt:"Soy misionero de La Iglesia de Jesucristo de los Santos de los Ultimos Dias.",hint:"Full Church name — practice until effortless"},{id:"m2",pt:"Queremos compartir un mensaje sobre Jesucristo y el Evangelio restaurado.",hint:"We want to share a message about Jesus Christ and the restored Gospel"},{id:"m3",pt:"El Libro de Mormon es otro testamento de Jesucristo que confirma la Biblia.",hint:"The Book of Mormon is another testament of Jesus Christ"},{id:"m4",pt:"La familia puede ser eterna mediante las ordenanzas sagradas del templo.",hint:"The family can be eternal through the sacred ordinances of the temple"},{id:"m5",pt:"Se que Dios es nuestro Padre Celestial y que nos ama.",hint:"I know that God is our Heavenly Father and that He loves us"},{id:"m6",pt:"Le gustaria ser bautizado/a?",hint:"Would you like to be baptized? (m/f)"},{id:"m7",pt:"Querido Padre Celestial, te damos gracias por tus bendiciones.",hint:"Opening a prayer — Dear Heavenly Father, we thank thee for thy blessings"},{id:"m8",pt:"Pedimos esto en el nombre de Jesucristo, amen.",hint:"Closing a prayer — always the same"}]},
  { id:"scripture",label:"Nivel 4", sublabel:"Versiculos de las Escrituras",color:C.gold,  note:"Las palabras que leeras en voz alta en cada leccion — practica para una entrega suave y reverente.",
    exercises:[{id:"s1",pt:"Porque de tal manera amo Dios al mundo, que ha dado a su Hijo unigenito.",hint:"Juan 3:16 — For God so loved the world"},{id:"s2",pt:"Recuerda que el valor de las almas es grande a los ojos de Dios.",hint:"D y C 18:10 — the worth of souls is great"},{id:"s3",pt:"Seguid adelante con firmeza en Cristo, teniendo un brillo perfecto de esperanza.",hint:"2 Nefi 31:20 — press forward with steadfastness"},{id:"s4",pt:"Y por el poder del Espiritu Santo podeis saber la verdad de todas las cosas.",hint:"Moroni 10:5 — know the truth of all things"}]},
];
const AI_PERSONAS = [
  { id:"carmen",    name:"Dona Carmen",    age:58, icon:"👵", color:C.terra,  description:"Viuda, barrio Trinidad, Asuncion",
    personality:"Warm traditional Catholic widow, deeply family-oriented. Speaks with genuine Paraguayan warmth. Curious about spiritual things but respectful of her traditions.",
    opening:"Buenas tardes, jovenes. De donde son? No los habia visto por el barrio antes...",
    scenarioLabel:"Visita a un hogar del barrio" },
  { id:"miguel",    name:"Miguel Rios",     age:24, icon:"👨‍🎓", color:C.blue,   description:"Estudiante de filosofia, UNA, Asuncion",
    personality:"Philosophy student, intellectually curious but skeptical of organized religion. Asks probing philosophical questions. Not hostile — genuinely seeking but analytical.",
    opening:"Ah, misioneros. Miren, respeto sus creencias, pero soy bastante agnostico. Que evidencia tienen de que lo que ensenan es verdad?",
    scenarioLabel:"Conversacion intelectual y filosofica" },
  { id:"flores",    name:"Senora Flores",   age:42, icon:"👩",  color:C.green,  description:"Madre de 3 hijos, Ciudad del Este",
    personality:"Warm mother of three children. Genuinely interested in messages about family and eternal life. Open and emotionally connected. Often mentions her children.",
    opening:"Buenos dias! Mis hijos me dijeron que pasaron unos jovenes ayer. Tienen un mensaje sobre la familia?",
    scenarioLabel:"Ensenanza sobre la familia eterna" },
  { id:"ramon",     name:"Don Ramon",       age:67, icon:"👴",  color:C.gold,   description:"Campesino, departamento de Caaguazu",
    personality:"Traditional farmer from the interior. Deeply Catholic and proud of his faith. Uses occasional Guarani words. Kind but resistant to change.",
    opening:"Buen dia, jovenes. Soy catolico de toda la vida, como mi tatarabuelo. Por que querria yo cambiar lo que siempre hemos creido?",
    scenarioLabel:"Perspectiva del catolico tradicional" },
  { id:"valentina", name:"Valentina Cruz",  age:21, icon:"👩‍💼", color:C.river,  description:"Joven profesional, Encarnacion",
    personality:"Young professional woman. Spiritual but not religious — she prays but does not attend church. Open and curious about faith and purpose.",
    opening:"Hola, jovenes. Vi su capilla por internet y me quede pensando. Yo creo en Dios, pero no se que creer exactamente. Me pueden ayudar?",
    scenarioLabel:"Busqueda espiritual sincera" },
];
const CURRICULUM = [
  { week:1,  title:"Fundamentos del Espanol",   tasks:["Aprende el alfabeto completo (27 letras)","Practica saludos basicos","Lee Juan 3:16 en espanol","Ora en espanol por primera vez"] },
  { week:2,  title:"Presentacion Personal",      tasks:["Memoriza tu introduccion misionera","Aprende vocabulario de familia","Practica con AI: Dona Carmen","Lee textos paralelos — Oracion"] },
  { week:3,  title:"El Evangelio de Jesucristo", tasks:["Aprende frases de ensenanza","Estudia 2 Nefi 31:20","Practica vocabulario del Evangelio","Completa quiz de numeros y dias"] },
  { week:4,  title:"El Libro de Mormon",         tasks:["Lee 1 Nefi 1 en espanol","Aprende a presentar el Libro de Mormon","Practica vocabulario de La Iglesia","Graba tu testimonio en espanol"] },
  { week:5,  title:"La Restauracion",            tasks:["Estudia Jose Smith — Historia","Memoriza La Primera Vision en espanol","Practica con AI: Miguel Rios","Aprende los articulos de fe 1-4"] },
  { week:6,  title:"Cultura Paraguaya",          tasks:["Estudia las 6 secciones de cultura","Aprende 3 palabras en guarani","Aprende sobre el terere","Lee textos paralelos — Folklore"] },
  { week:7,  title:"La Oracion",                 tasks:["Practica orar en voz alta en espanol","Memoriza apertura y cierre de oracion","Practica con AI: Valentina Cruz","Lee Alma 32 en espanol"] },
  { week:8,  title:"La Fe y el Arrepentimiento", tasks:["Estudia Alma 32:21,27","Practica frases avanzadas de ensenanza","Practica con AI: Senora Flores","Completa quiz de sentimientos"] },
  { week:9,  title:"El Bautismo",                tasks:["Memoriza D y C 18:10-11","Practica invitar al bautismo","Completa nivel 3 de hablar","Practica con AI: Don Ramon"] },
  { week:10, title:"La Familia Eterna",          tasks:["Estudia el plan de salvacion","Memoriza frases sobre el templo","Practica las 4 categorias de frases","Lee textos paralelos — 2 Nefi"] },
  { week:11, title:"Las Escrituras",             tasks:["Lee todos los 5 textos paralelos","Completa nivel 4 de hablar","Memoriza 5 versiculos clave","Completa quiz de todas las categorias"] },
  { week:12, title:"Listo para la Mision!",      tasks:["Completa todas las tarjetas de vocabulario","Logra 80%+ en todas las frases","Practica con todos los 5 AI personas","Recibe tu certificado misionero"] },
];

// ══════════════════════════════════════════════════════════════════════════════
//  READINESS SCORE
// ══════════════════════════════════════════════════════════════════════════════
function calcReadiness(alphaData, phraseData, vocabData, cultureData, readerData, speakingData) {
  const totalPhrases = PHRASE_CATEGORIES.reduce((a, c) => a + c.phrases.length, 0);
  const lettersMastered = Object.values(alphaData.plays || {}).filter(v => v >= 3).length;
  const phrasesMastered = Object.keys(phraseData.mastered || {}).length;
  const totalVocab = VOCAB_CATS.reduce((a, c) => a + c.words.length, 0);
  const vocabHeard = Object.keys(vocabData.heard || {}).length;
  const cultureRead = Object.keys(cultureData.read || {}).length;
  const textsCompleted = Object.keys(readerData.completed || {}).length;
  const totalSpeakEx = SPEAK_LEVELS.reduce((a, l) => a + l.exercises.length, 0);
  const speakPracticed = Object.keys(speakingData.scores || {}).length;
  const a = (lettersMastered / 27) * 15;
  const b = (phrasesMastered / totalPhrases) * 25;
  const c = (vocabHeard / totalVocab) * 20;
  const d = (cultureRead / 6) * 15;
  const e = (textsCompleted / 5) * 10;
  const f = Math.min((speakPracticed / totalSpeakEx) * 15, 15);
  const total = Math.round(a + b + c + d + e + f);
  return {
    total, lettersMastered, phrasesMastered, vocabHeard, totalVocab,
    cultureRead, textsCompleted, speakPracticed, totalSpeakEx,
    breakdown: [
      { label: "Alfabeto dominado",   score: Math.round(a), max: 15, value: `${lettersMastered}/27`,         color: C.blue },
      { label: "Frases dominadas",    score: Math.round(b), max: 25, value: `${phrasesMastered}/${totalPhrases}`, color: C.red },
      { label: "Vocabulario oido",    score: Math.round(c), max: 20, value: `${vocabHeard}/${totalVocab}`,    color: C.terra },
      { label: "Cultura estudiada",   score: Math.round(d), max: 15, value: `${cultureRead}/6`,               color: C.green },
      { label: "Textos completados",  score: Math.round(e), max: 10, value: `${textsCompleted}/5`,            color: C.river },
      { label: "Practica de habla",   score: Math.round(f), max: 15, value: `${speakPracticed}/${totalSpeakEx}`, color: C.gold },
    ],
  };
}

// ══════════════════════════════════════════════════════════════════════════════
//  COUNTDOWN VIEW
// ══════════════════════════════════════════════════════════════════════════════
function CountdownView({ streak, alphaData, phraseData, cultureData, readerData }) {
  const t = useCountdown("2026-09-23T09:00:00");
  const units = [{ l: "Meses", v: t.months }, { l: "Semanas", v: t.weeks }, { l: "Dias", v: t.days }, { l: "Horas", v: t.hours }, { l: "Minutos", v: t.minutes }, { l: "Segundos", v: t.seconds }];
  const daily = DAILY_PHRASES[new Date().getDay() % DAILY_PHRASES.length];
  const totalPhrases = PHRASE_CATEGORIES.reduce((a, c) => a + c.phrases.length, 0);
  const totalSegs = READER_TEXTS.reduce((a, t) => a + t.segments.length, 0);
  const stats = [
    { label: "Letras oidas",     value: `${Object.keys(alphaData.plays || {}).length}/27`,         color: C.blue },
    { label: "Frases oidas",     value: `${Object.keys(phraseData.plays || {}).length}/${totalPhrases}`, color: C.red },
    { label: "Frases dominadas", value: `${Object.keys(phraseData.mastered || {}).length}/${totalPhrases}`, color: C.green },
    { label: "Cultura",          value: `${Object.keys(cultureData.read || {}).length}/${CULTURE_SECTIONS.length}`, color: C.terra },
    { label: "Segmentos leidos", value: `${Object.keys(readerData.progress || {}).length}/${totalSegs}`, color: C.river },
    { label: "Textos completos", value: `${Object.keys(readerData.completed || {}).length}/${READER_TEXTS.length}`, color: C.gold },
  ];
  return (
    <div style={{ padding: "1.5rem 0" }}>
      <div style={{ textAlign: "center", marginBottom: "10px" }}><div style={{ display: "inline-block" }}><FlagStrip width={56} height={9} /></div><div style={{ height: 8 }} /><span style={{ fontSize: "11px", letterSpacing: "0.2em", textTransform: "uppercase", color: C.muted }}>Inicio del MTC</span></div>
      <h2 style={{ textAlign: "center", fontSize: "22px", fontWeight: "400", color: C.red, marginBottom: "22px" }}>23 de septiembre, 2026 · Asuncion, Paraguay 🇵🇾</h2>
      <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "9px", marginBottom: "26px" }}>
        {units.map((u, i) => (<div key={u.l} style={{ background: i < 3 ? C.red : C.blue, borderRadius: "14px", padding: "16px 12px", minWidth: "68px", textAlign: "center", boxShadow: "0 2px 8px rgba(0,0,0,0.15)" }}><div style={{ fontSize: "32px", fontWeight: "400", color: C.onDark, lineHeight: 1 }}>{t.done ? "0" : String(u.v ?? "--").padStart(2, "0")}</div><div style={{ fontSize: "10px", letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(248,242,228,0.6)", marginTop: "5px" }}>{u.l}</div></div>))}
      </div>
      <StreakCard streak={streak} />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "9px", marginBottom: "18px" }}>
        {stats.map(s => (<div key={s.label} style={{ background: C.surface, border: `0.5px solid ${C.border}`, borderRadius: "12px", padding: "13px", textAlign: "center", borderTop: `3px solid ${s.color}` }}><div style={{ fontSize: "20px", color: s.color, lineHeight: 1 }}>{s.value}</div><div style={{ fontSize: "10px", color: C.faint, marginTop: "5px", lineHeight: 1.3 }}>{s.label}</div></div>))}
      </div>
      <div style={{ borderRadius: "18px", overflow: "hidden", marginBottom: "18px", boxShadow: "0 4px 16px rgba(0,0,0,0.12)" }}>
        <div style={{ display: "flex", height: "5px" }}><div style={{ flex: 1, background: C.red }} /><div style={{ flex: 1, background: C.white }} /><div style={{ flex: 1, background: C.blue }} /></div>
        <div style={{ background: `linear-gradient(135deg, ${C.red} 0%, #8B0A0A 50%, ${C.blue} 100%)`, padding: "20px 24px" }}>
          <div style={{ fontSize: "10px", letterSpacing: "0.18em", textTransform: "uppercase", color: "rgba(200,165,81,0.85)", marginBottom: "9px" }}>Frase del dia · Daily phrase</div>
          <div style={{ fontSize: "20px", color: C.onDark, marginBottom: "6px", lineHeight: 1.45 }}>"{daily.es}"</div>
          <div style={{ fontSize: "13px", color: "rgba(248,242,228,0.6)", marginBottom: "16px" }}>{daily.en}</div>
          <button onClick={() => speakES(daily.es, 0.75)} style={{ background: "rgba(255,255,255,0.12)", border: `0.5px solid ${C.gold}`, borderRadius: "10px", padding: "8px 16px", color: C.onDark, fontSize: "13px", cursor: "pointer" }}>🔊 Escuchar en espanol</button>
        </div>
      </div>
      <div style={{ background: C.surface, border: `0.5px solid ${C.border}`, borderRadius: "14px", padding: "16px" }}>
        <div style={{ display: "flex", gap: "10px", alignItems: "center", marginBottom: "11px" }}><FlagStrip width={42} height={7} /><span style={{ fontSize: "13px", fontWeight: "500", color: C.ink }}>Informacion de la mision</span></div>
        {[["Mision", "Asuncion Paraguay Norte"], ["Idioma", "Espanol (es-MX)"], ["Inicio MTC", "23 de septiembre, 2026"], ["Servicio", "24 meses"], ["Ciudad", "Asuncion — capital del Paraguay, fundada 1537"]].map(([k, v]) => (<div key={k} style={{ display: "flex", gap: "12px", padding: "5px 0", borderBottom: `0.5px solid ${C.border}` }}><div style={{ fontSize: "12px", color: C.faint, width: "110px", flexShrink: 0 }}>{k}</div><div style={{ fontSize: "12px", color: C.ink }}>{v}</div></div>))}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
//  LEARNING PATH VIEW
// ══════════════════════════════════════════════════════════════════════════════
function LearningPathView({ streak, alphaData, phraseData, vocabData, cultureData, readerData, speakingData, setTab }) {
  const [pathData, savePathData] = useLS("sn-path", {});
  const r = calcReadiness(alphaData, phraseData, vocabData, cultureData, readerData, speakingData);
  const toggle = (wi, ti) => { const k = `${wi}-${ti}`; const nd = { ...pathData, [k]: !pathData[k] }; savePathData(nd); };
  const totalTasks = CURRICULUM.reduce((a, c) => a + c.tasks.length, 0);
  const doneTasks = Object.values(pathData).filter(Boolean).length;
  return (
    <div style={{ padding: "1.5rem 0" }}>
      <div style={{ background: C.surface, border: `0.5px solid ${C.border}`, borderRadius: "18px", padding: "20px", marginBottom: "18px", borderTop: `3px solid ${C.gold}` }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "14px" }}>
          <div>
            <div style={{ fontSize: "11px", letterSpacing: "0.12em", textTransform: "uppercase", color: C.faint, marginBottom: "4px" }}>Preparacion para la Mision</div>
            <div style={{ display: "flex", alignItems: "baseline", gap: "6px" }}>
              <span style={{ fontSize: "48px", fontWeight: "400", color: r.total >= 80 ? C.green : C.red, lineHeight: 1 }}>{r.total}</span>
              <span style={{ fontSize: "15px", color: C.muted }}>/ 100</span>
            </div>
          </div>
          <div style={{ fontSize: "48px" }}>{r.total >= 80 ? "🏆" : r.total >= 50 ? "⭐" : "🌱"}</div>
        </div>
        {r.total >= 80 && <div style={{ background: C.softGreen, border: `0.5px solid ${C.green}`, borderRadius: "10px", padding: "10px 14px", marginBottom: "14px", fontSize: "13px", color: C.green, textAlign: "center" }}>🎓 Certificado de Preparacion Desbloqueado!</div>}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: "8px", marginBottom: "14px" }}>
          {r.breakdown.map(b => (
            <div key={b.label} style={{ background: C.bg, borderRadius: "10px", padding: "10px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                <span style={{ fontSize: "11px", color: C.muted }}>{b.label}</span>
                <span style={{ fontSize: "11px", fontWeight: "600", color: b.color }}>{b.score}/{b.max}</span>
              </div>
              <div style={{ height: "5px", background: C.border, borderRadius: "3px", overflow: "hidden" }}>
                <div style={{ width: `${(b.score / b.max) * 100}%`, height: "100%", background: b.color, borderRadius: "3px" }} />
              </div>
              <div style={{ fontSize: "10px", color: C.faint, marginTop: "3px" }}>{b.value}</div>
            </div>
          ))}
        </div>
      </div>
      <div style={{ fontSize: "13px", fontWeight: "600", color: C.ink, marginBottom: "12px" }}>Plan de 12 Semanas — {doneTasks}/{totalTasks} tareas</div>
      {CURRICULUM.map((week, wi) => {
        const weekDone = week.tasks.filter((_, ti) => pathData[`${wi}-${ti}`]).length;
        return (
          <div key={wi} style={{ background: C.surface, borderRadius: "12px", marginBottom: "10px", overflow: "hidden", border: `0.5px solid ${C.border}` }}>
            <div style={{ background: weekDone === week.tasks.length ? C.softGreen : C.softBlue, padding: "12px 16px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: `0.5px solid ${C.border}` }}>
              <div><div style={{ fontSize: "10px", color: C.faint, textTransform: "uppercase", letterSpacing: "0.1em" }}>SEMANA {week.week}</div><div style={{ fontSize: "14px", fontWeight: "600", color: C.ink }}>{week.title}</div></div>
              <div style={{ fontSize: "13px", fontWeight: "600", color: weekDone === week.tasks.length ? C.green : C.muted }}>{weekDone}/{week.tasks.length} {weekDone === week.tasks.length ? "✅" : ""}</div>
            </div>
            <div style={{ padding: "6px 0" }}>
              {week.tasks.map((task, ti) => (
                <button key={ti} onClick={() => toggle(wi, ti)} style={{ width: "100%", background: "none", border: "none", textAlign: "left", padding: "8px 16px", cursor: "pointer", display: "flex", alignItems: "center", gap: "10px" }}>
                  <span style={{ fontSize: "18px", color: pathData[`${wi}-${ti}`] ? C.green : C.border }}>{pathData[`${wi}-${ti}`] ? "✅" : "⬜"}</span>
                  <span style={{ fontSize: "13px", color: C.ink, textDecoration: pathData[`${wi}-${ti}`] ? "line-through" : "none", opacity: pathData[`${wi}-${ti}`] ? 0.55 : 1 }}>{task}</span>
                </button>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
//  ALPHABET VIEW
// ══════════════════════════════════════════════════════════════════════════════
function AlphabetView({ alphaData, saveAlphaData }) {
  const [section, setSection] = useState("letters");
  const [selected, setSelected] = useState(null);
  const [speaking, setSpeaking] = useState(null);
  const [songPlaying, setSongPlaying] = useState(false);
  const [songIdx, setSongIdx] = useState(-1);
  const songRef = useRef(null);
  const [micLetter, setMicLetter] = useState(null);
  const [micSpecial, setMicSpecial] = useState(null);
  const plays = alphaData.plays || {};
  const logPlay = (letter) => { const p = { ...plays }; p[letter] = (p[letter] || 0) + 1; saveAlphaData({ ...alphaData, plays: p }); };
  const doSpeak = (l, e) => { e.stopPropagation(); setSpeaking(l.letter); logPlay(l.letter); speakES(l.name, 0.75); setTimeout(() => speakES(l.example, 0.85), 900); setTimeout(() => setSpeaking(null), 2200); };
  const practicedCount = Object.keys(plays).length;
  const masteredCount = Object.values(plays).filter(v => v >= 3).length;
  const playSong = () => {
    if (songPlaying) { setSongPlaying(false); setSongIdx(-1); if (songRef.current) clearTimeout(songRef.current); window.speechSynthesis?.cancel(); return; }
    setSongPlaying(true); let delay = 0;
    SPANISH_LETTERS.forEach((l, i) => { songRef.current = setTimeout(() => { setSongIdx(i); speakES(l.name, 0.8); if (i === SPANISH_LETTERS.length - 1) setTimeout(() => { setSongPlaying(false); setSongIdx(-1); }, 1200); }, delay); delay += 850; });
  };
  function LetterMic({ letter, name }) {
    const mic = useLetterMic(name);
    if (micLetter !== letter) return (<button onClick={() => setMicLetter(letter)} style={{ background: "rgba(255,255,255,0.14)", border: "none", borderRadius: "9px", padding: "8px 13px", color: C.onDark, fontSize: "13px", cursor: "pointer" }}>🎤 Decirlo</button>);
    return (<div><MicResult {...mic} onStart={mic.start} color={C.red} /><button onClick={() => { mic.reset(); setMicLetter(null); }} style={{ marginTop: "7px", background: "transparent", border: "none", color: "rgba(248,242,228,0.45)", fontSize: "11px", cursor: "pointer" }}>✕ Cerrar mic</button></div>);
  }
  function SpecialMic({ combo, example, clr }) {
    const mic = useLetterMic(example);
    if (micSpecial !== combo) return (<button onClick={() => setMicSpecial(combo)} style={{ background: "rgba(255,255,255,0.14)", border: "none", borderRadius: "9px", padding: "8px 13px", color: C.onDark, fontSize: "13px", cursor: "pointer" }}>🎤 Decirlo</button>);
    return (<div><MicResult {...mic} onStart={mic.start} color={clr} /><button onClick={() => { mic.reset(); setMicSpecial(null); }} style={{ marginTop: "7px", background: "transparent", border: "none", color: "rgba(248,242,228,0.45)", fontSize: "11px", cursor: "pointer" }}>✕ Cerrar mic</button></div>);
  }
  return (
    <div style={{ padding: "1.5rem 0" }}>
      <div style={{ display: "flex", gap: "8px", marginBottom: "16px" }}>
        {[["letters", "Las Letras"], ["specials", "Combinaciones"]].map(([id, label]) => (
          <button key={id} onClick={() => setSection(id)} style={{ flex: 1, padding: "10px", borderRadius: "10px", fontSize: "13px", cursor: "pointer", border: `0.5px solid ${section === id ? C.red : C.border}`, background: section === id ? C.red : "transparent", color: section === id ? C.onDark : C.muted, fontWeight: section === id ? "600" : "400" }}>{label}</button>
        ))}
      </div>
      {section === "letters" && (<>
        <div style={{ background: C.surface, border: `0.5px solid ${C.border}`, borderRadius: "12px", padding: "12px 16px", marginBottom: "14px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div><div style={{ fontSize: "12px", color: C.muted }}>Practicadas: {practicedCount}/27</div><div style={{ fontSize: "12px", color: C.green }}>Dominadas (x3+): {masteredCount}/27</div></div>
          <button onClick={playSong} style={{ padding: "8px 16px", borderRadius: "10px", fontSize: "13px", cursor: "pointer", border: `0.5px solid ${C.border}`, background: songPlaying ? C.red : C.surface, color: songPlaying ? C.onDark : C.muted }}>{songPlaying ? "⏹ Detener" : "▶ Cancion del Alfabeto"}</button>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "8px", marginBottom: "16px" }}>
          {SPANISH_LETTERS.map((l, i) => { const p = plays[l.letter] || 0; const isSel = selected?.letter === l.letter; const isSong = songIdx === i;
            return (<button key={l.letter} onClick={(e) => { setSelected(isSel ? null : l); doSpeak(l, e); }} style={{ background: isSong ? C.gold : p >= 3 ? C.softGreen : p > 0 ? C.softGold : C.surface, border: `1.5px solid ${isSel ? C.red : p >= 3 ? C.green : p > 0 ? C.gold : C.border}`, borderRadius: "12px", padding: "12px 4px", cursor: "pointer", textAlign: "center", transition: "all 0.15s" }}>
              <div style={{ fontSize: "22px", fontWeight: "600", color: isSong ? C.onDark : isSel ? C.red : C.ink, lineHeight: 1 }}>{l.letter}</div>
              <div style={{ fontSize: "9px", color: C.faint, marginTop: "3px" }}>{l.name}</div>
              {p > 0 && <div style={{ fontSize: "9px", color: p >= 3 ? C.green : C.gold }}>{"●".repeat(Math.min(p, 3))}</div>}
            </button>);
          })}
        </div>
        {selected && (
          <div style={{ background: `linear-gradient(135deg, ${C.red}, #8B0A0A)`, borderRadius: "20px", padding: "20px", marginBottom: "16px", position: "relative" }}>
            <ParPat size={100} opacity={0.08} />
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
              <div style={{ fontSize: "64px", fontWeight: "600", color: C.onDark, lineHeight: 1 }}>{selected.letter}</div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: "11px", color: "rgba(248,242,228,0.6)" }}>Nombre</div>
                <div style={{ fontSize: "18px", fontWeight: "600", color: C.onDark }}>"{selected.name}"</div>
                <div style={{ fontSize: "13px", color: C.gold, marginTop: "2px" }}>{selected.ipa}</div>
              </div>
            </div>
            <div style={{ background: "rgba(0,0,0,0.2)", borderRadius: "10px", padding: "10px 13px", marginBottom: "12px" }}>
              <div style={{ fontSize: "13px", color: "rgba(248,242,228,0.85)" }}>{selected.tip}</div>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
              <div><div style={{ fontSize: "10px", color: "rgba(248,242,228,0.6)" }}>Palabra de mision</div><div style={{ fontSize: "22px", fontWeight: "600", color: C.onDark }}>{selected.example}</div><div style={{ fontSize: "13px", color: C.gold }}>{selected.meaning}</div></div>
              <button onClick={() => speakES(selected.example, 0.8)} style={{ background: "rgba(255,255,255,0.15)", border: `0.5px solid ${C.gold}`, borderRadius: "10px", padding: "8px 14px", color: C.onDark, fontSize: "13px", cursor: "pointer" }}>🔊 Escuchar</button>
            </div>
            <LetterMic letter={selected.letter} name={selected.name} />
          </div>
        )}
      </>)}
      {section === "specials" && (<>
        <div style={{ background: C.softBlue, borderLeft: `3px solid ${C.blue}`, borderRadius: "10px", padding: "9px 13px", marginBottom: "14px", fontSize: "12px", color: C.blue }}>
          <strong>Combos especiales del espanol:</strong> estas combinaciones tienen sonidos unicos que debes dominar para ser comprendido en Paraguay.
        </div>
        {SPECIAL_COMBOS.map(c => (
          <div key={c.combo} style={{ background: `linear-gradient(135deg, ${c.clr}, ${c.clr}CC)`, borderRadius: "16px", padding: "18px", marginBottom: "12px", position: "relative" }}>
            <ParPat size={80} opacity={0.07} />
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "10px" }}>
              <div style={{ fontSize: "48px", fontWeight: "600", color: C.onDark, lineHeight: 1 }}>{c.combo}</div>
              <div style={{ textAlign: "right" }}><div style={{ fontSize: "11px", color: "rgba(248,242,228,0.6)" }}>IPA</div><div style={{ fontSize: "18px", color: C.onDark }}>{c.ipa}</div></div>
            </div>
            <div style={{ background: "rgba(0,0,0,0.2)", borderRadius: "10px", padding: "10px 13px", marginBottom: "10px" }}><div style={{ fontSize: "13px", color: C.onDark, marginBottom: "4px" }}>{c.tip}</div><div style={{ fontSize: "12px", color: "rgba(248,242,228,0.65)" }}>Ej: <em>{c.example}</em> — {c.meaning}</div></div>
            <div style={{ fontSize: "11px", color: "rgba(248,242,228,0.55)", marginBottom: "12px" }}>Tambien: {c.why}</div>
            <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
              <button onClick={() => speakES(c.example, 0.8)} style={{ background: "rgba(255,255,255,0.15)", border: "0.5px solid rgba(255,255,255,0.3)", borderRadius: "9px", padding: "8px 13px", color: C.onDark, fontSize: "13px", cursor: "pointer" }}>🔊 Escuchar</button>
              <SpecialMic combo={c.combo} example={c.example} clr={c.clr} />
            </div>
          </div>
        ))}
      </>)}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
//  PHRASES VIEW  — real SpeechRecognition mic + auto-mastered at 80%
// ══════════════════════════════════════════════════════════════════════════════
function PhraseCard({ phrase, index, color, phraseId, phraseData, savePhraseData }) {
  const [open, setOpen]         = useState(false);
  const [recording, setRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [score, setScore]       = useState(null);
  const recRef = useRef(null);

  const plays   = (phraseData.plays   || {})[phraseId] || 0;
  const scores  = (phraseData.scores  || {})[phraseId] || [];
  const best    = scores.length ? Math.max(...scores) : null;
  const mastered = best !== null && best >= 80;

  const logPlay = () => {
    const p = { ...(phraseData.plays || {}) }; p[phraseId] = (p[phraseId] || 0) + 1;
    savePhraseData({ ...phraseData, plays: p });
  };
  const logScore = (sc) => {
    const s = { ...(phraseData.scores || {}) };
    s[phraseId] = [...(s[phraseId] || []).slice(-4), sc];
    const m = { ...(phraseData.mastered || {}) };
    if (sc >= 80) m[phraseId] = true;
    savePhraseData({ ...phraseData, scores: s, mastered: m });
  };

  const handleRecord = () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { setTranscript("Reconocimiento de voz requiere Chrome o Edge."); return; }
    if (recording) { recRef.current?.stop(); setRecording(false); return; }
    const rec = new SR(); rec.lang = "es-MX"; rec.continuous = false; rec.interimResults = false;
    recRef.current = rec;
    rec.onresult = e => {
      const said = e.results[0][0].transcript; setTranscript(said);
      const cl = s => s.toLowerCase().replace(/[.,!?;:¡¿]/g, "").trim();
      const tW = cl(phrase.es).split(" "); const gW = cl(said).split(" ");
      const mt = tW.filter(w => gW.some(g => g.includes(w.slice(0, 4)) || w.includes(g.slice(0, 4)))).length;
      const sc = Math.round((mt / tW.length) * 100); setScore(sc); logScore(sc);
    };
    rec.onerror = () => { setRecording(false); setTranscript("No se pudo escuchar — inténtalo de nuevo."); };
    rec.onend = () => setRecording(false);
    rec.start(); setRecording(true); setTranscript(""); setScore(null);
  };

  return (
    <div style={{ background: C.surface, border: `0.5px solid ${C.border}`, borderRadius: "14px", padding: "14px 16px", marginBottom: "10px", borderLeft: `4px solid ${mastered ? C.gold : plays > 0 ? color : C.border}` }}>
      <div style={{ display: "flex", gap: "10px", alignItems: "flex-start", cursor: "pointer" }} onClick={() => setOpen(!open)}>
        <div style={{ width: "26px", height: "26px", borderRadius: "50%", flexShrink: 0, background: mastered ? C.gold : color, color: C.onDark, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px", marginTop: "3px" }}>{mastered ? "⭐" : index + 1}</div>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: "8px" }}>
            <div style={{ fontSize: "15px", fontWeight: "500", color: C.ink, lineHeight: 1.45, marginBottom: "3px", flex: 1 }}>{phrase.es}</div>
            <div style={{ flexShrink: 0, textAlign: "right" }}>
              {plays > 0 && <div style={{ fontSize: "10px", color: C.faint }}>oida ×{plays}</div>}
              {best !== null && <div style={{ fontSize: "10px", color: mastered ? C.green : C.terra, fontWeight: "500" }}>mejor {best}%</div>}
            </div>
          </div>
          <div style={{ fontSize: "12px", color: C.faint, fontStyle: "italic" }}>{phrase.en}</div>
        </div>
        <span style={{ fontSize: "12px", color: C.faint, paddingTop: "4px" }}>{open ? "▲" : "▼"}</span>
      </div>

      {open && (
        <div style={{ marginTop: "12px", borderTop: `0.5px solid ${C.border}`, paddingTop: "12px" }}>
          <div style={{ background: `${color}10`, borderLeft: `3px solid ${color}`, borderRadius: "8px", padding: "10px 13px", marginBottom: "10px" }}>
            <div style={{ fontSize: "10px", color: color, fontWeight: "600", marginBottom: "4px", textTransform: "uppercase", letterSpacing: "0.08em" }}>Palabra por palabra</div>
            <div style={{ fontSize: "13px", color: C.ink }}>{phrase.wbw}</div>
          </div>
          {phrase.note && <div style={{ background: C.softGold, borderRadius: "8px", padding: "8px 12px", marginBottom: "10px", fontSize: "12px", color: C.muted }}>{phrase.note}</div>}
          <div style={{ display: "flex", gap: "8px", marginBottom: "10px" }}>
            <button onClick={() => { speakES(phrase.es, 0.78); logPlay(); }} style={{ flex: 1, background: color, border: "none", borderRadius: "9px", padding: "9px", color: C.onDark, fontSize: "13px", cursor: "pointer" }}>🔊 Escuchar</button>
            <button onClick={handleRecord} style={{ flex: 1, background: recording ? C.red : C.surface, border: `0.5px solid ${recording ? C.red : C.border}`, borderRadius: "9px", padding: "9px", color: recording ? C.onDark : C.muted, fontSize: "13px", cursor: "pointer", transition: "all 0.2s" }}>
              {recording ? "⏹ Detener" : "🎤 Decirlo"}
            </button>
          </div>
          {transcript && (
            <div style={{ marginTop: "9px", background: C.softGreen, borderRadius: "10px", padding: "10px 13px", border: `0.5px solid ${C.border}` }}>
              <div style={{ fontSize: "10px", letterSpacing: "0.1em", textTransform: "uppercase", color: C.green, marginBottom: "3px" }}>Dijiste</div>
              <div style={{ fontSize: "14px", color: C.ink, marginBottom: "8px" }}>"{transcript}"</div>
              {score !== null && (<>
                <div style={{ display: "flex", alignItems: "center", gap: "9px", marginBottom: "3px" }}>
                  <div style={{ flex: 1, height: "7px", background: C.border, borderRadius: "4px", overflow: "hidden" }}>
                    <div style={{ width: `${score}%`, height: "100%", borderRadius: "4px", background: score >= 80 ? C.green : score >= 50 ? C.gold : C.red, transition: "width 0.6s" }} />
                  </div>
                  <span style={{ fontSize: "13px", fontWeight: "500", minWidth: "34px", color: score >= 80 ? C.green : score >= 50 ? C.gold : C.red }}>{score}%</span>
                </div>
                <div style={{ fontSize: "12px", color: score >= 80 ? C.green : score >= 50 ? C.gold : C.red }}>
                  {score >= 80 ? "🎉 ¡Excelente! ¡Frase dominada!" : score >= 50 ? "👍 Bien — escucha y vuelve a intentarlo." : "🔄 Sigue intentando — escucha con cuidado."}
                  {score >= 80 && <span style={{ color: C.gold, marginLeft: "6px", fontWeight: "500" }}>⭐ ¡Guardado!</span>}
                </div>
              </>)}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function PhrasesView({ phraseData, savePhraseData }) {
  const [activeCat, setActiveCat] = useState("greetings");
  const totalPhrases = PHRASE_CATEGORIES.reduce((a, c) => a + c.phrases.length, 0);
  const mastered = Object.keys(phraseData.mastered || {}).length;
  const active = PHRASE_CATEGORIES.find(c => c.id === activeCat);
  return (
    <div style={{ padding: "1.5rem 0" }}>
      <div style={{ background: C.surface, border: `0.5px solid ${C.border}`, borderRadius: "12px", padding: "12px 16px", marginBottom: "14px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "5px" }}>
          <span style={{ fontSize: "12px", color: C.muted }}>Frases dominadas (puntuación ≥ 80%)</span>
          <span style={{ fontSize: "13px", fontWeight: "500", color: C.gold }}>{mastered}/{totalPhrases}</span>
        </div>
        <div style={{ height: "7px", background: C.border, borderRadius: "4px", overflow: "hidden" }}>
          <div style={{ width: `${(mastered / totalPhrases) * 100}%`, height: "100%", borderRadius: "4px", background: `linear-gradient(to right,${C.red},${C.gold})`, transition: "width 0.5s" }} />
        </div>
        <div style={{ fontSize: "11px", color: C.faint, marginTop: "5px" }}>🔊 Escuchar · 📝 Palabra por palabra · 🎤 Decirlo y puntuar · ⭐ 80%+ = dominada · Todo guardado</div>
      </div>
      <div style={{ display: "flex", gap: "8px", marginBottom: "16px", overflowX: "auto", paddingBottom: "4px" }}>
        {PHRASE_CATEGORIES.map(c => {
          const cm = c.phrases.filter((_, i) => (phraseData.mastered || {})[`${c.id}-${i}`]).length;
          return (
            <button key={c.id} onClick={() => setActiveCat(c.id)} style={{ flexShrink: 0, padding: "8px 14px", borderRadius: "10px", fontSize: "13px", cursor: "pointer", border: activeCat === c.id ? "none" : `0.5px solid ${C.border}`, background: activeCat === c.id ? c.color : "transparent", color: activeCat === c.id ? C.onDark : C.muted, fontWeight: activeCat === c.id ? "500" : "400" }}>
              {c.label}<span style={{ fontSize: "11px", opacity: 0.7, marginLeft: "4px" }}>· {c.sublabel}</span>
              {cm > 0 && <span style={{ marginLeft: "5px", fontSize: "10px", background: activeCat === c.id ? "rgba(255,255,255,0.2)" : C.softGold, padding: "1px 5px", borderRadius: "10px", color: activeCat === c.id ? C.onDark : C.gold }}>⭐{cm}</span>}
            </button>
          );
        })}
      </div>
      {active && active.phrases.map((p, i) => (
        <PhraseCard key={i} phrase={p} index={i} color={active.color} phraseId={`${active.id}-${i}`} phraseData={phraseData} savePhraseData={savePhraseData} />
      ))}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
//  CULTURE VIEW
// ══════════════════════════════════════════════════════════════════════════════
function CultureView({ cultureData, saveCultureData }) {
  const [expanded, setExpanded] = useState(null);
  const read = cultureData.read || {};
  const markRead = (id) => { const r = { ...read }; r[id] = true; saveCultureData({ ...cultureData, read: r }); };
  return (
    <div style={{ padding: "1.5rem 0" }}>
      <div style={{ background: C.surface, border: `0.5px solid ${C.border}`, borderRadius: "12px", padding: "10px 16px", marginBottom: "14px", display: "flex", justifyContent: "space-between" }}>
        <span style={{ fontSize: "12px", color: C.muted }}>Temas estudiados</span>
        <span style={{ fontSize: "13px", fontWeight: "600", color: C.green }}>{Object.keys(read).length}/{CULTURE_SECTIONS.length}</span>
      </div>
      {CULTURE_SECTIONS.map(s => {
        const isOpen = expanded === s.id;
        return (
          <div key={s.id} style={{ background: C.surface, border: `0.5px solid ${read[s.id] ? s.color : C.border}`, borderRadius: "14px", marginBottom: "10px", overflow: "hidden", borderLeft: `4px solid ${read[s.id] ? s.color : C.border}` }}>
            <div style={{ cursor: "pointer", padding: "16px" }} onClick={() => { setExpanded(isOpen ? null : s.id); if (!isOpen) markRead(s.id); }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <span style={{ fontSize: "28px" }}>{s.icon}</span>
                  <div><div style={{ fontSize: "15px", fontWeight: "600", color: C.ink }}>{s.label}</div><div style={{ fontSize: "12px", color: C.faint }}>{s.sublabel}</div></div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>{read[s.id] && <span style={{ color: s.color }}>✅</span>}<span style={{ fontSize: "12px", color: C.faint }}>{isOpen ? "▲" : "▼"}</span></div>
              </div>
              {!isOpen && <div style={{ fontSize: "12px", color: s.color, marginTop: "8px", fontStyle: "italic" }}>{s.tagline}</div>}
            </div>
            {isOpen && (
              <div style={{ borderTop: `0.5px solid ${C.border}`, padding: "16px" }}>
                <div style={{ fontSize: "13px", color: s.color, fontStyle: "italic", fontWeight: "600", marginBottom: "12px" }}>{s.tagline}</div>
                <div style={{ fontSize: "13px", color: C.ink, lineHeight: 1.75, marginBottom: "14px" }}>{s.body}</div>
                <div style={{ background: C.softGold, borderLeft: `3px solid ${C.gold}`, borderRadius: "10px", padding: "12px 14px", marginBottom: "12px" }}>
                  <div style={{ fontSize: "11px", color: C.gold, fontWeight: "700", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.1em" }}>Consejo del Misionero</div>
                  <div style={{ fontSize: "13px", color: C.muted, lineHeight: 1.65 }}>{s.missionTip}</div>
                </div>
                <div style={{ fontSize: "11px", color: C.faint, marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.1em" }}>Vocabulario Clave</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                  {s.vocab.map(v => (<button key={v} onClick={() => speakES(v)} style={{ background: `${s.color}15`, border: `0.5px solid ${s.color}40`, borderRadius: "16px", padding: "4px 11px", fontSize: "12px", color: s.color, cursor: "pointer" }}>{v}</button>))}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
//  READER VIEW
// ══════════════════════════════════════════════════════════════════════════════
function ReaderView({ readerData, saveReaderData }) {
  const [active, setActive] = useState(null);
  const [cat, setCat] = useState("all");
  const progress = readerData.progress || {}; const completed = readerData.completed || {};
  const markProgress = (key) => { const p = { ...progress }; p[key] = true; saveReaderData({ ...readerData, progress: p }); };
  const markCompleted = (id) => { const c = { ...completed }; c[id] = true; saveReaderData({ ...readerData, completed: c }); };
  const cats = ["all", ...new Set(READER_TEXTS.map(t => t.category))];
  const filtered = cat === "all" ? READER_TEXTS : READER_TEXTS.filter(t => t.category === cat);
  if (active) {
    const t = READER_TEXTS.find(x => x.id === active);
    return (
      <div style={{ padding: "1.5rem 0" }}>
        <button onClick={() => { markCompleted(t.id); setActive(null); }} style={{ marginBottom: "16px", padding: "8px 16px", borderRadius: "10px", fontSize: "13px", cursor: "pointer", border: `0.5px solid ${C.border}`, background: "transparent", color: C.muted }}>← Volver</button>
        <div style={{ background: C.surface, border: `0.5px solid ${C.border}`, borderRadius: "14px", padding: "16px", marginBottom: "14px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "8px" }}>
            <span style={{ fontSize: "24px" }}>{t.icon}</span>
            <div><div style={{ fontSize: "16px", fontWeight: "600", color: C.ink }}>{t.title}</div><div style={{ fontSize: "12px", color: C.faint }}>{t.subtitle}</div></div>
          </div>
          <span style={{ background: `${t.levelColor}20`, color: t.levelColor, fontSize: "11px", fontWeight: "600", padding: "3px 9px", borderRadius: "8px" }}>{t.level}</span>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4px", marginBottom: "6px" }}>
          <div style={{ background: `${C.red}15`, borderRadius: "8px", padding: "6px", textAlign: "center", fontSize: "11px", fontWeight: "700", color: C.red }}>🇵🇾 Espanol</div>
          <div style={{ background: `${C.blue}15`, borderRadius: "8px", padding: "6px", textAlign: "center", fontSize: "11px", fontWeight: "700", color: C.blue }}>🇺🇸 English</div>
        </div>
        {t.segments.map((seg, si) => {
          const key = `${t.id}-${si}`; const done = progress[key];
          return (
            <div key={si} style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4px", marginBottom: "6px" }}>
              <div style={{ background: done ? C.softGreen : C.surface, border: `0.5px solid ${done ? C.green : C.border}`, borderRadius: "10px", padding: "10px" }}>
                <div style={{ fontSize: "13px", color: C.ink, lineHeight: 1.65, marginBottom: "8px" }}>{seg.es}</div>
                <button onClick={() => { speakES(seg.es, 0.78); markProgress(key); }} style={{ background: "none", border: `0.5px solid ${C.red}`, borderRadius: "9px", padding: "4px 10px", fontSize: "11px", color: C.red, cursor: "pointer" }}>🔊</button>
              </div>
              <div style={{ background: `${C.blue}06`, border: `0.5px solid ${C.border}`, borderRadius: "10px", padding: "10px" }}>
                <div style={{ fontSize: "12px", color: C.faint, lineHeight: 1.65 }}>{seg.en}</div>
              </div>
            </div>
          );
        })}
        <button onClick={() => { markCompleted(t.id); setActive(null); }} style={{ width: "100%", marginTop: "14px", background: C.green, border: "none", borderRadius: "10px", padding: "12px", color: C.onDark, fontSize: "14px", fontWeight: "600", cursor: "pointer" }}>✅ Marcar como Completado</button>
      </div>
    );
  }
  return (
    <div style={{ padding: "1.5rem 0" }}>
      <div style={{ display: "flex", gap: "6px", marginBottom: "14px", overflowX: "auto", paddingBottom: "4px" }}>
        {cats.map(c => (<button key={c} onClick={() => setCat(c)} style={{ flexShrink: 0, padding: "6px 14px", borderRadius: "16px", fontSize: "12px", cursor: "pointer", border: `0.5px solid ${cat === c ? C.blue : C.border}`, background: cat === c ? C.blue : "transparent", color: cat === c ? C.onDark : C.muted, fontWeight: cat === c ? "600" : "400" }}>{c === "all" ? "Todos" : c}</button>))}
      </div>
      {filtered.map(t => (
        <button key={t.id} onClick={() => setActive(t.id)} style={{ width: "100%", background: C.surface, border: `0.5px solid ${completed[t.id] ? C.green : C.border}`, borderRadius: "14px", padding: "14px", marginBottom: "10px", cursor: "pointer", textAlign: "left", borderLeft: `4px solid ${completed[t.id] ? C.green : C.border}` }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div style={{ display: "flex", gap: "12px", alignItems: "flex-start", flex: 1 }}>
              <span style={{ fontSize: "24px" }}>{t.icon}</span>
              <div>
                <div style={{ fontSize: "14px", fontWeight: "600", color: C.ink }}>{t.title}</div>
                <div style={{ fontSize: "12px", color: C.faint }}>{t.subtitle}</div>
                <div style={{ marginTop: "5px", display: "flex", gap: "6px" }}>
                  <span style={{ background: `${t.levelColor}20`, color: t.levelColor, fontSize: "11px", padding: "2px 8px", borderRadius: "8px", fontWeight: "600" }}>{t.level}</span>
                  <span style={{ background: `${C.blue}15`, color: C.blue, fontSize: "11px", padding: "2px 8px", borderRadius: "8px" }}>{t.category}</span>
                </div>
              </div>
            </div>
            {completed[t.id] && <span style={{ fontSize: "18px" }}>✅</span>}
          </div>
        </button>
      ))}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
//  VOCAB VIEW
// ══════════════════════════════════════════════════════════════════════════════
function VocabView({ vocabData, saveVocabData }) {
  const [activeCat, setActiveCat] = useState("numbers");
  const [mode, setMode] = useState("cards");
  const [cardIdx, setCardIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [quiz, setQuiz] = useState(null);
  const cat = VOCAB_CATS.find(c => c.id === activeCat);
  const heard = vocabData.heard || {};
  const markHeard = (id) => { const h = { ...heard }; h[id] = (h[id] || 0) + 1; saveVocabData({ ...vocabData, heard: h }); };
  const nextCard = () => { markHeard(`${activeCat}-${cardIdx}`); setCardIdx((cardIdx + 1) % cat.words.length); setFlipped(false); };
  const startQuiz = () => {
    const shuffled = [...cat.words].sort(() => Math.random() - 0.5).slice(0, 8);
    const makeOpts = (q) => [...cat.words.filter(w => w.es !== q.es).sort(() => Math.random() - 0.5).slice(0, 3), q].sort(() => Math.random() - 0.5);
    setQuiz({ questions: shuffled, idx: 0, score: 0, selected: null, opts: makeOpts(shuffled[0]) }); setMode("quiz");
  };
  if (mode === "quiz" && quiz) {
    const { questions, idx, score, selected, opts } = quiz;
    if (idx >= questions.length) return (
      <div style={{ padding: "40px 0", textAlign: "center" }}>
        <div style={{ fontSize: "64px", marginBottom: "16px" }}>🎉</div>
        <div style={{ fontSize: "22px", fontWeight: "600", color: C.ink }}>{score}/{questions.length} correctas</div>
        <div style={{ fontSize: "14px", color: C.faint, margin: "8px 0 24px" }}>en {cat.label}</div>
        <button onClick={() => setMode("cards")} style={{ background: C.red, border: "none", borderRadius: "10px", padding: "12px 28px", color: C.onDark, fontSize: "15px", cursor: "pointer", fontWeight: "600" }}>← Volver</button>
      </div>
    );
    const q = questions[idx];
    return (
      <div style={{ padding: "1.5rem 0" }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "16px" }}>
          <button onClick={() => setMode("cards")} style={{ padding: "8px 16px", borderRadius: "10px", fontSize: "13px", cursor: "pointer", border: `0.5px solid ${C.border}`, background: "transparent", color: C.muted }}>← Volver</button>
          <div style={{ fontSize: "14px", fontWeight: "600", color: C.muted }}>{idx + 1}/{questions.length} · {score} ✅</div>
        </div>
        <div style={{ background: C.surface, border: `0.5px solid ${C.border}`, borderRadius: "18px", padding: "28px 20px", textAlign: "center", marginBottom: "16px" }}>
          <div style={{ fontSize: "13px", color: C.faint, marginBottom: "8px" }}>Que significa?</div>
          <div style={{ fontSize: "28px", fontWeight: "600", color: C.ink }}>{q.es}</div>
        </div>
        {opts.map((opt, oi) => {
          let bg = "transparent", border = `0.5px solid ${C.border}`, color = C.ink;
          if (selected !== null) { if (opt.es === q.es) { bg = C.softGreen; border = `0.5px solid ${C.green}`; color = C.green; } else if (oi === selected) { bg = C.softRed; border = `0.5px solid ${C.red}`; color = C.red; } }
          return (<button key={oi} disabled={selected !== null} onClick={() => {
            const correct = opt.es === q.es; const newScore = correct ? score + 1 : score; const nextIdx = idx + 1;
            const nextQ = questions[nextIdx]; const nextOpts = nextQ ? [...cat.words.filter(w => w.es !== nextQ.es).sort(() => Math.random() - 0.5).slice(0, 3), nextQ].sort(() => Math.random() - 0.5) : [];
            setQuiz({ ...quiz, selected: oi, score: newScore }); setTimeout(() => setQuiz({ questions, idx: nextIdx, score: newScore, selected: null, opts: nextOpts }), 800);
          }} style={{ width: "100%", background: bg, border, color, borderRadius: "12px", padding: "14px", marginBottom: "8px", cursor: selected !== null ? "default" : "pointer", fontSize: "14px", textAlign: "left", transition: "all 0.2s" }}>{opt.en}</button>);
        })}
      </div>
    );
  }
  return (
    <div style={{ padding: "1.5rem 0" }}>
      <div style={{ display: "flex", gap: "6px", marginBottom: "14px", overflowX: "auto", paddingBottom: "4px" }}>
        {VOCAB_CATS.map(c => (<button key={c.id} onClick={() => { setActiveCat(c.id); setCardIdx(0); setFlipped(false); }} style={{ flexShrink: 0, padding: "6px 12px", borderRadius: "16px", fontSize: "12px", cursor: "pointer", border: `0.5px solid ${activeCat === c.id ? c.color : C.border}`, background: activeCat === c.id ? c.color : "transparent", color: activeCat === c.id ? C.onDark : C.muted, whiteSpace: "nowrap" }}>{c.icon} {c.label}</button>))}
      </div>
      <div onClick={() => { setFlipped(!flipped); if (!flipped) { speakES(cat.words[cardIdx].es, 0.82); markHeard(`${activeCat}-${cardIdx}`); } }}
        style={{ background: C.surface, border: `1.5px solid ${flipped ? cat.color : C.border}`, borderRadius: "20px", padding: "32px 20px", textAlign: "center", boxShadow: "0 4px 20px rgba(0,0,0,0.08)", marginBottom: "14px", cursor: "pointer", minHeight: "140px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        {!flipped
          ? (<div><div style={{ fontSize: "32px", fontWeight: "600", color: C.ink, marginBottom: "8px" }}>{cat.words[cardIdx].es}</div><div style={{ fontSize: "13px", color: C.faint }}>Toca para ver en ingles 🔊</div></div>)
          : (<div><div style={{ fontSize: "28px", fontWeight: "600", color: cat.color, marginBottom: "4px" }}>{cat.words[cardIdx].en}</div><div style={{ fontSize: "20px", color: C.faint }}>{cat.words[cardIdx].es}</div></div>)}
        <div style={{ fontSize: "12px", color: C.faint, marginTop: "12px" }}>{cardIdx + 1} / {cat.words.length}</div>
      </div>
      <div style={{ display: "flex", gap: "8px", marginBottom: "12px" }}>
        <button onClick={() => { setCardIdx(Math.max(0, cardIdx - 1)); setFlipped(false); }} style={{ flex: 1, background: "transparent", border: `0.5px solid ${C.border}`, borderRadius: "10px", padding: "10px", cursor: "pointer", fontSize: "13px", color: C.muted }}>← Anterior</button>
        <button onClick={nextCard} style={{ flex: 1, background: cat.color, border: "none", borderRadius: "10px", padding: "10px", cursor: "pointer", fontSize: "13px", color: C.onDark, fontWeight: "600" }}>Siguiente →</button>
      </div>
      <button onClick={startQuiz} style={{ width: "100%", background: "transparent", border: `0.5px solid ${C.border}`, borderRadius: "10px", padding: "12px", cursor: "pointer", fontSize: "13px", color: C.muted }}>Quiz de {cat.label} →</button>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
//  SPEAKING LAB VIEW
// ══════════════════════════════════════════════════════════════════════════════
function SpeakingLabView({ speakingData, saveSpeakingData }) {
  const [activeLevel, setActiveLevel] = useState("sounds");
  const [micEx, setMicEx] = useState(null);
  const level = SPEAK_LEVELS.find(l => l.id === activeLevel);
  const scores = speakingData.scores || {};
  function ExMic({ ex }) {
    const mic = useLetterMic(ex.pt);
    const isMicOpen = micEx === ex.id;
    if (!isMicOpen) return (
      <div style={{ display: "flex", gap: "8px", alignItems: "center", marginTop: "8px" }}>
        <button onClick={() => { speakES(ex.pt, 0.78); const s = { ...scores }; s[ex.id] = (s[ex.id] || 0); saveSpeakingData({ ...speakingData, scores: s }); }}
          style={{ background: "rgba(255,255,255,0.15)", border: "none", borderRadius: "9px", padding: "8px 13px", color: C.onDark, fontSize: "13px", cursor: "pointer" }}>🔊 Escuchar</button>
        <button onClick={() => setMicEx(ex.id)} style={{ background: "rgba(255,255,255,0.14)", border: "none", borderRadius: "9px", padding: "8px 13px", color: C.onDark, fontSize: "13px", cursor: "pointer" }}>🎤 Practicar</button>
        {scores[ex.id] > 0 && <span style={{ fontSize: "11px", color: C.gold }}>practicada ×{scores[ex.id]}</span>}
      </div>
    );
    return (
      <div style={{ marginTop: "8px" }}>
        <MicResult {...mic} onStart={() => { mic.start(); const s = { ...scores }; s[ex.id] = (s[ex.id] || 0) + 1; saveSpeakingData({ ...speakingData, scores: s }); }} color={level.color} />
        <button onClick={() => { mic.reset(); setMicEx(null); }} style={{ marginTop: "7px", background: "transparent", border: "none", color: "rgba(248,242,228,0.45)", fontSize: "11px", cursor: "pointer" }}>✕ Cerrar mic</button>
      </div>
    );
  }
  return (
    <div style={{ padding: "1.5rem 0" }}>
      <div style={{ display: "flex", gap: "8px", marginBottom: "16px", overflowX: "auto", paddingBottom: "4px" }}>
        {SPEAK_LEVELS.map(l => (<button key={l.id} onClick={() => { setActiveLevel(l.id); setMicEx(null); }} style={{ flexShrink: 0, padding: "8px 16px", borderRadius: "20px", fontSize: "13px", cursor: "pointer", border: `1.5px solid ${activeLevel === l.id ? l.color : C.border}`, background: activeLevel === l.id ? l.color : "transparent", color: activeLevel === l.id ? C.onDark : C.muted, fontWeight: activeLevel === l.id ? "600" : "400", whiteSpace: "nowrap" }}>{l.label}: {l.sublabel}</button>))}
      </div>
      <div style={{ background: C.softBlue, borderLeft: `3px solid ${level.color}`, borderRadius: "10px", padding: "9px 13px", marginBottom: "16px", fontSize: "12px", color: level.color }}>{level.note}</div>
      {level.exercises.map(ex => (
        <div key={ex.id} style={{ background: `linear-gradient(135deg, ${level.color}, ${level.color}CC)`, borderRadius: "16px", padding: "16px 18px", marginBottom: "10px", position: "relative" }}>
          <ParPat size={80} opacity={0.07} />
          <div style={{ fontSize: "16px", fontWeight: "500", color: C.onDark, marginBottom: "4px" }}>{ex.pt}</div>
          <div style={{ fontSize: "12px", color: "rgba(248,242,228,0.65)", marginBottom: "8px" }}>{ex.hint}</div>
          <ExMic ex={ex} />
        </div>
      ))}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
//  SCRIPTURE VIEW
// ══════════════════════════════════════════════════════════════════════════════
function ScriptureView({ scriptureData, saveScriptureData }) {
  const [book, setBook] = useState("bom");
  const [activeRef, setActiveRef] = useState(null);
  const [filterBkmk, setFilterBkmk] = useState(false);
  const [noteVal, setNoteVal] = useState("");
  const [playing, setPlaying] = useState(null);
  const activeBook = SCRIPTURE_BOOKS.find(b => b.id === book);
  const bookmarks = scriptureData.bookmarks || {}; const notes = scriptureData.notes || {}; const heard = scriptureData.heard || {};
  const toggleBookmark = (ref) => { const b = { ...bookmarks }; b[ref] = !b[ref]; saveScriptureData({ ...scriptureData, bookmarks: b }); };
  const saveNote = (ref, val) => { const n = { ...notes }; n[ref] = val; saveScriptureData({ ...scriptureData, notes: n }); };
  const logHeard = (ref) => { const h = { ...heard }; h[ref] = (h[ref] || 0) + 1; saveScriptureData({ ...scriptureData, heard: h }); };
  const playVerses = (chap) => {
    const txt = chap.verses.map(v => v.es).join(" "); setPlaying(chap.ref);
    speakES(txt, 0.76); logHeard(chap.ref);
    setTimeout(() => setPlaying(null), Math.max(3000, txt.length * 90));
  };
  const totalChapters = SCRIPTURE_BOOKS.reduce((a, b) => a + b.chapters.length, 0);
  const heardCount = Object.keys(heard).length; const bookmarkCount = Object.values(bookmarks).filter(Boolean).length;
  const chapters = filterBkmk ? activeBook.chapters.filter(c => bookmarks[c.ref]) : activeBook.chapters;
  return (
    <div style={{ padding: "1.5rem 0" }}>
      <div style={{ background: C.surface, border: `0.5px solid ${C.border}`, borderRadius: "12px", padding: "12px 16px", marginBottom: "14px", display: "flex", gap: "20px", alignItems: "center" }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}><span style={{ fontSize: "12px", color: C.muted }}>Pasajes estudiados</span><span style={{ fontSize: "12px", fontWeight: "500", color: C.green }}>{heardCount}/{totalChapters}</span></div>
          <div style={{ height: "6px", background: C.border, borderRadius: "3px", overflow: "hidden" }}><div style={{ width: `${(heardCount / totalChapters) * 100}%`, height: "100%", background: C.green, borderRadius: "3px" }} /></div>
        </div>
        <button onClick={() => setFilterBkmk(!filterBkmk)} style={{ padding: "6px 12px", borderRadius: "9px", fontSize: "12px", cursor: "pointer", border: `0.5px solid ${filterBkmk ? C.gold : C.border}`, background: filterBkmk ? C.softGold : "transparent", color: filterBkmk ? C.gold : C.muted }}>🔖 Marcados ({bookmarkCount})</button>
      </div>
      <div style={{ display: "flex", gap: "5px", flexWrap: "wrap", marginBottom: "16px" }}>
        {SCRIPTURE_BOOKS.map(b => (<button key={b.id} onClick={() => { setBook(b.id); setActiveRef(null); }} style={{ flex: "1 1 auto", minWidth: "80px", padding: "9px 7px", borderRadius: "11px", fontSize: "11px", cursor: "pointer", border: book === b.id ? "none" : `0.5px solid ${C.border}`, background: book === b.id ? b.color : "transparent", color: book === b.id ? C.onDark : C.muted, fontWeight: book === b.id ? "500" : "400", textAlign: "center" }}>
          <div style={{ fontSize: "18px", marginBottom: "2px" }}>{b.icon}</div><div style={{ fontSize: "11px", lineHeight: 1.3 }}>{b.label}</div>
        </button>))}
      </div>
      <div style={{ background: C.softBlue, borderLeft: `3px solid ${C.blue}`, borderRadius: "10px", padding: "9px 13px", marginBottom: "14px", fontSize: "12px", color: C.blue }}>
        <strong>Como usar:</strong> 🔊 escucha cada pasaje en espanol · 🔖 marca versiculos clave · 📝 agrega notas de estudio personal · Todo guardado automaticamente.
      </div>
      {chapters.length === 0 && <div style={{ textAlign: "center", padding: "30px", color: C.faint, fontSize: "13px" }}>No hay escrituras marcadas en este libro todavia.</div>}
      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        {chapters.map(chap => {
          const isOpen = activeRef === chap.ref; const isBkmk = !!bookmarks[chap.ref]; const isPlaying = playing === chap.ref;
          const wasHeard = (heard[chap.ref] || 0) > 0; const hasNote = !!(notes[chap.ref]);
          return (
            <div key={chap.ref} style={{ background: isBkmk ? C.softGold : C.surface, border: `0.5px solid ${isOpen ? activeBook.color : isBkmk ? C.gold : C.border}`, borderRadius: "14px", overflow: "hidden", borderLeft: `4px solid ${isBkmk ? C.gold : wasHeard ? activeBook.color : C.border}` }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 16px", cursor: "pointer" }} onClick={() => { setActiveRef(isOpen ? null : chap.ref); setNoteVal(notes[chap.ref] || ""); }}>
                <div>
                  <div style={{ fontSize: "16px", color: activeBook.color, marginBottom: "2px", fontWeight: "600" }}>{chap.ref}</div>
                  <div style={{ fontSize: "12px", color: C.faint, display: "flex", gap: "8px", alignItems: "center" }}>
                    <span>{chap.topic}</span>
                    {wasHeard && <span style={{ color: activeBook.color }}>· oida ×{heard[chap.ref]}</span>}
                    {hasNote && <span style={{ color: C.gold }}>· 📝</span>}
                  </div>
                </div>
                <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                  {isBkmk && <span style={{ fontSize: "14px" }}>🔖</span>}
                  <span style={{ fontSize: "12px", color: C.faint }}>{isOpen ? "▲" : "▼"}</span>
                </div>
              </div>
              {isOpen && (
                <div style={{ borderTop: `0.5px solid ${C.border}`, padding: "14px 16px" }}>
                  <div style={{ display: "flex", gap: "8px", marginBottom: "12px" }}>
                    <button onClick={() => playVerses(chap)} style={{ flex: 1, background: isPlaying ? C.red : activeBook.color, border: "none", borderRadius: "9px", padding: "9px", color: C.onDark, fontSize: "13px", cursor: "pointer" }}>{isPlaying ? "🔊 Reproduciendo..." : "🔊 Escuchar en espanol"}</button>
                    <button onClick={() => toggleBookmark(chap.ref)} style={{ padding: "9px 14px", borderRadius: "9px", fontSize: "13px", cursor: "pointer", border: `0.5px solid ${isBkmk ? C.gold : C.border}`, background: isBkmk ? C.softGold : "transparent", color: isBkmk ? C.gold : C.muted }}>{isBkmk ? "🔖" : "🏷️"}</button>
                  </div>
                  {chap.verses.map((v, vi) => (
                    <div key={vi} style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", marginBottom: "10px" }}>
                      <div>
                        <div style={{ fontSize: "10px", color: C.red, fontWeight: "600", marginBottom: "4px", textTransform: "uppercase" }}>Espanol</div>
                        <div style={{ fontSize: "13px", color: C.ink, lineHeight: 1.7 }}>{v.es}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: "10px", color: C.blue, fontWeight: "600", marginBottom: "4px", textTransform: "uppercase" }}>English</div>
                        <div style={{ fontSize: "12px", color: C.faint, lineHeight: 1.7 }}>{v.en}</div>
                      </div>
                    </div>
                  ))}
                  <div style={{ marginTop: "10px" }}>
                    <div style={{ fontSize: "11px", color: C.faint, marginBottom: "5px" }}>📝 Notas de estudio</div>
                    <textarea value={noteVal} onChange={e => setNoteVal(e.target.value)} onBlur={() => saveNote(chap.ref, noteVal)}
                      placeholder="Escribe tus pensamientos y revelaciones personales aqui..."
                      style={{ width: "100%", minHeight: "70px", border: `0.5px solid ${C.border}`, borderRadius: "8px", padding: "8px", fontSize: "13px", color: C.ink, resize: "vertical", boxSizing: "border-box", background: C.bg, fontFamily: "inherit" }} />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
//  AI CONVERSATION VIEW
// ══════════════════════════════════════════════════════════════════════════════
function ApiKeyPrompt({ onSave }) {
  const [val, setVal] = useState("");
  return (
    <div style={{ background: C.surface, border: `0.5px solid ${C.border}`, borderRadius: "16px", padding: "24px", marginBottom: "16px", borderLeft: `4px solid ${C.gold}` }}>
      <div style={{ fontSize: "13px", fontWeight: "500", color: C.ink, marginBottom: "8px" }}>🔑 Se necesita una clave API de Anthropic para la Conversacion con IA</div>
      <p style={{ fontSize: "12px", color: C.muted, lineHeight: 1.65, marginBottom: "14px" }}>La pestana de IA usa Claude. Ingresa tu clave de Anthropic para activarla. Obtennela en <a href="https://console.anthropic.com" target="_blank" style={{ color: C.blue }}>console.anthropic.com</a>. Tu clave se guarda solo en este dispositivo.</p>
      <div style={{ display: "flex", gap: "8px" }}>
        <input type="password" value={val} onChange={e => setVal(e.target.value)} placeholder="sk-ant-api03-..."
          style={{ flex: 1, padding: "9px 12px", background: C.bg, border: `0.5px solid ${C.border}`, borderRadius: "9px", fontSize: "13px", color: C.ink, fontFamily: "monospace" }} />
        <button onClick={() => { if (val.startsWith("sk-")) onSave(val); }} disabled={!val.startsWith("sk-")}
          style={{ background: val.startsWith("sk-") ? C.green : C.border, border: "none", borderRadius: "9px", padding: "9px 16px", color: C.onDark, fontSize: "13px", cursor: val.startsWith("sk-") ? "pointer" : "default" }}>Guardar</button>
      </div>
    </div>
  );
}

function AIConversationView({ convData, saveConvData, apiKey, onClearKey }) {
  const [persona, setPersona] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const endRef = useRef(null);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, feedback]);
  const startConvo = (p) => { setPersona(p); setMessages([{ role: "assistant", content: p.opening }]); setFeedback(null); };
  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    const userMsg = input.trim(); setInput(""); setLoading(true); setFeedback(null);
    const newMsgs = [...messages, { role: "user", content: userMsg }]; setMessages(newMsgs);
    const sys = `You are roleplaying as ${persona.name}, age ${persona.age}, ${persona.description}. Personality: ${persona.personality}\n\nElder Sam Nilsson is a young LDS missionary learning Spanish, preparing for the Paraguay Asuncion North Mission. He is practicing missionary conversations.\n\nRULES:\n1. ALWAYS respond in Spanish as ${persona.name}. Stay fully in character. Be warm, realistic, and natural.\n2. Keep your Spanish response to 2-4 sentences.\n3. After your Spanish response, add exactly "---FEEDBACK---" on its own line, then give 2-3 specific English grammar tips about Sam's Spanish. Note what was correct, what could improve, and suggest better phrasing where helpful. Be encouraging.`;
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", { method: "POST", headers: { "Content-Type": "application/json", "x-api-key": apiKey, "anthropic-version": "2023-06-01", "anthropic-dangerous-direct-browser-access": "true" }, body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: 600, system: sys, messages: newMsgs.map(m => ({ role: m.role, content: m.content })) }) });
      const data = await res.json();
      const full = data.content?.[0]?.text || "Lo siento, hubo un error.";
      const [reply, fb] = full.split("---FEEDBACK---");
      setMessages([...newMsgs, { role: "assistant", content: reply.trim() }]); setFeedback(fb?.trim() || null);
      saveConvData({ ...convData, sessions: (convData.sessions || 0), totalMessages: (convData.totalMessages || 0) + 2 });
    } catch { setMessages([...newMsgs, { role: "assistant", content: "Lo siento, hubo un error de conexion. Por favor verifique su clave API." }]); }
    setLoading(false);
  };
  if (!persona) return (
    <div style={{ padding: "1.5rem 0" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
        <div style={{ fontSize: "15px", fontWeight: "600", color: C.ink }}>Elige tu Investigador Paraguayo</div>
        <button onClick={onClearKey} style={{ padding: "4px 10px", borderRadius: "8px", fontSize: "11px", cursor: "pointer", border: `0.5px solid ${C.border}`, background: "transparent", color: C.faint }}>Cambiar clave</button>
      </div>
      {AI_PERSONAS.map(p => (
        <button key={p.id} onClick={() => startConvo(p)} style={{ width: "100%", background: C.surface, border: `0.5px solid ${C.border}`, borderRadius: "14px", padding: "14px", marginBottom: "10px", cursor: "pointer", textAlign: "left", borderLeft: `4px solid ${p.color}` }}>
          <div style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
            <span style={{ fontSize: "28px" }}>{p.icon}</span>
            <div>
              <div style={{ fontSize: "15px", fontWeight: "600", color: C.ink }}>{p.name}, {p.age}</div>
              <div style={{ fontSize: "12px", color: C.faint }}>{p.description}</div>
              <div style={{ fontSize: "11px", background: `${p.color}20`, color: p.color, padding: "2px 8px", borderRadius: "8px", marginTop: "5px", display: "inline-block", fontWeight: "600" }}>{p.scenarioLabel}</div>
            </div>
          </div>
          <div style={{ fontSize: "12px", color: C.muted, marginTop: "8px", fontStyle: "italic", borderTop: `0.5px solid ${C.border}`, paddingTop: "8px" }}>"{p.opening.substring(0, 80)}..."</div>
        </button>
      ))}
    </div>
  );
  return (
    <div style={{ display: "flex", flexDirection: "column", height: "calc(100vh - 120px)" }}>
      <div style={{ padding: "10px 0", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: `0.5px solid ${C.border}`, marginBottom: "10px" }}>
        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          <span style={{ fontSize: "24px" }}>{persona.icon}</span>
          <div><div style={{ fontSize: "14px", fontWeight: "600", color: C.ink }}>{persona.name}</div><div style={{ fontSize: "11px", color: C.faint }}>{persona.description}</div></div>
        </div>
        <button onClick={() => { setPersona(null); setMessages([]); }} style={{ padding: "4px 10px", borderRadius: "8px", fontSize: "12px", cursor: "pointer", border: `0.5px solid ${C.border}`, background: "transparent", color: C.muted }}>Cambiar</button>
      </div>
      <div style={{ flex: 1, overflowY: "auto", paddingBottom: "10px" }}>
        {messages.map((m, i) => (<div key={i} style={{ marginBottom: "8px", display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start" }}><div style={{ maxWidth: "80%", background: m.role === "user" ? C.red : C.surface, color: m.role === "user" ? C.onDark : C.ink, borderRadius: "12px", padding: "10px 14px", fontSize: "13px", lineHeight: 1.6, border: m.role === "user" ? "none" : `0.5px solid ${C.border}` }}>{m.content}</div></div>))}
        {loading && <div style={{ textAlign: "center", color: C.faint, fontSize: "14px", padding: "8px" }}>escribiendo...</div>}
        {feedback && (<div style={{ background: C.softBlue, border: `0.5px solid ${C.blue}`, borderRadius: "12px", padding: "12px", marginTop: "6px" }}><div style={{ fontSize: "11px", color: C.blue, fontWeight: "700", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.08em" }}>Grammar Feedback (English)</div><div style={{ fontSize: "13px", color: C.ink, lineHeight: 1.65, whiteSpace: "pre-wrap" }}>{feedback}</div></div>)}
        <div ref={endRef} />
      </div>
      <div style={{ paddingTop: "10px", borderTop: `0.5px solid ${C.border}`, display: "flex", gap: "8px" }}>
        <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && !e.shiftKey && sendMessage()}
          placeholder="Escribe en espanol..." style={{ flex: 1, padding: "10px 14px", border: `0.5px solid ${C.border}`, borderRadius: "10px", fontSize: "14px", outline: "none", fontFamily: "inherit", background: C.bg, color: C.ink }} />
        <button onClick={sendMessage} disabled={loading || !input.trim()} style={{ background: loading ? C.border : C.red, color: C.onDark, border: "none", borderRadius: "10px", padding: "10px 18px", cursor: "pointer", fontSize: "13px", fontWeight: "600", width: "48px" }}>{loading ? "⏳" : "→"}</button>
      </div>
    </div>
  );
}


// ══════════════════════════════════════════════════════════════════════════════
//  AZURE SETTINGS PANEL
// ══════════════════════════════════════════════════════════════════════════════
function AzureSettingsPanel({ onClose }) {
  const [key, setKey]         = useLS("sn-azure-key", "");
  const [region, setRegion]   = useLS("sn-azure-region", "eastus");
  const [testState, setTestState] = useState("idle");
  const [localKey, setLocalKey]   = useState(key || "");
  const [localRegion, setLocalRegion] = useState(region || "eastus");
  const REGIONS = ["eastus","eastus2","westus","westus2","westeurope","northeurope",
                   "australiaeast","canadacentral","centralindia","japaneast","uksouth"];
  const handleSave  = () => { setKey(localKey.trim()); setRegion(localRegion); onClose(); };
  const handleClear = () => { setKey(""); setLocalKey(""); setTestState("idle"); };
  const handleTest  = async () => {
    if (!localKey.trim()) return;
    setTestState("testing");
    try {
      const ssml = `<speak version='1.0' xml:lang='es-MX'><voice name='es-MX-JorgeNeural'>Hola, Elder Nilsson!</voice></speak>`;
      const res = await fetch(`https://${localRegion}.tts.speech.microsoft.com/cognitiveservices/v1`, {
        method: "POST",
        headers: { "Ocp-Apim-Subscription-Key": localKey.trim(), "Content-Type": "application/ssml+xml", "X-Microsoft-OutputFormat": "audio-16khz-128kbitrate-mono-mp3", "User-Agent": "ElderNilssonApp" },
        body: ssml,
      });
      if (!res.ok) throw new Error(res.status);
      const blob = await res.blob();
      new Audio(URL.createObjectURL(blob)).play();
      setTestState("ok");
    } catch { setTestState("fail"); }
  };
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: "16px" }}>
      <div style={{ background: C.bg, borderRadius: "20px", padding: "24px", width: "100%", maxWidth: "420px", boxShadow: "0 8px 32px rgba(0,0,0,0.25)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px" }}>
          <div>
            <div style={{ fontSize: "18px", color: C.ink }}>🔊 Configuracion de Voz Azure</div>
            <div style={{ fontSize: "12px", color: C.muted, marginTop: "2px" }}>es-MX-JorgeNeural — Espanol Latinoamericano</div>
          </div>
          <button onClick={onClose} style={{ background: "transparent", border: "none", fontSize: "20px", cursor: "pointer", color: C.faint }}>✕</button>
        </div>
        {key ? (
          <div style={{ background: C.softGreen, border: `0.5px solid ${C.green}`, borderRadius: "10px", padding: "10px 14px", marginBottom: "16px", fontSize: "13px", color: C.green, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span>✅ Voz Azure activa — Jorge Neural</span>
            <button onClick={handleClear} style={{ background: "transparent", border: `0.5px solid ${C.green}`, borderRadius: "7px", padding: "3px 9px", fontSize: "11px", color: C.green, cursor: "pointer" }}>Eliminar</button>
          </div>
        ) : (
          <div style={{ background: C.softGold, border: `0.5px solid ${C.border}`, borderRadius: "10px", padding: "10px 14px", marginBottom: "16px", fontSize: "12px", color: C.muted, lineHeight: 1.6 }}>
            Sin clave Azure — usando voz del navegador. Ingresa tu clave para activar la voz natural Jorge Neural en espanol.
          </div>
        )}
        <div style={{ marginBottom: "12px" }}>
          <div style={{ fontSize: "12px", fontWeight: "500", color: C.muted, marginBottom: "5px" }}>Clave Azure Speech API</div>
          <input type="password" value={localKey} onChange={e => setLocalKey(e.target.value)} placeholder="Pega tu Azure KEY 1 aqui..."
            style={{ width: "100%", padding: "10px 12px", background: C.surface, border: `0.5px solid ${C.border}`, borderRadius: "9px", fontSize: "13px", color: C.ink, fontFamily: "monospace", boxSizing: "border-box" }} />
          <div style={{ fontSize: "11px", color: C.faint, marginTop: "4px" }}>Ubicada en: Portal Azure → Tu recurso de Voz → Claves y Punto de conexion → KEY 1</div>
        </div>
        <div style={{ marginBottom: "18px" }}>
          <div style={{ fontSize: "12px", fontWeight: "500", color: C.muted, marginBottom: "5px" }}>Region Azure</div>
          <select value={localRegion} onChange={e => setLocalRegion(e.target.value)} style={{ width: "100%", padding: "9px 12px", background: C.surface, border: `0.5px solid ${C.border}`, borderRadius: "9px", fontSize: "13px", color: C.ink, boxSizing: "border-box" }}>
            {REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>
        {testState === "ok"      && <div style={{ fontSize: "13px", color: C.green,  marginBottom: "12px", textAlign: "center" }}>Prueba exitosa — Jorge dijo "Hola, Elder Nilsson!"</div>}
        {testState === "fail"    && <div style={{ fontSize: "13px", color: C.red,    marginBottom: "12px", textAlign: "center" }}>Error — verifica tu clave y region</div>}
        {testState === "testing" && <div style={{ fontSize: "13px", color: C.muted,  marginBottom: "12px", textAlign: "center" }}>Probando voz...</div>}
        <div style={{ display: "flex", gap: "8px" }}>
          <button onClick={handleTest} disabled={!localKey.trim() || testState === "testing"} style={{ flex: 1, padding: "10px", borderRadius: "10px", fontSize: "13px", cursor: "pointer", border: `0.5px solid ${C.border}`, background: C.surface, color: C.muted }}>🔊 Probar voz</button>
          <button onClick={handleSave} disabled={!localKey.trim()} style={{ flex: 2, padding: "10px", borderRadius: "10px", fontSize: "13px", cursor: "pointer", border: "none", background: localKey.trim() ? C.green : C.border, color: C.onDark, fontWeight: "500" }}>Guardar y activar</button>
        </div>
        <div style={{ marginTop: "14px", padding: "10px 12px", background: C.surface, borderRadius: "9px", fontSize: "11px", color: C.faint, lineHeight: 1.7 }}>
          🔒 Tu clave se guarda solo en este dispositivo en localStorage. Nunca se envia a ninguna parte excepto directamente a Microsoft Azure para generar audio.
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
//  CERTIFICATE
// ══════════════════════════════════════════════════════════════════════════════
function Certificate({ score, streak }) {
  const today = new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
  return (
    <div id="cert-print" style={{ background: "#F7F3EE", border: `3px solid ${C.gold}`, borderRadius: "16px", padding: "36px 32px", textAlign: "center", position: "relative", overflow: "hidden", marginTop: "12px" }}>
      <div style={{ position: "absolute", inset: "6px", border: `1px solid ${C.border}`, borderRadius: "12px", pointerEvents: "none" }} />
      {/* Paraguay flag strip top */}
      <div style={{ display: "flex", height: "6px", borderRadius: "4px", overflow: "hidden", marginBottom: "24px" }}>
        <div style={{ flex: 1, background: C.red }} /><div style={{ flex: 1, background: C.white, border: `0.5px solid ${C.border}` }} /><div style={{ flex: 1, background: C.blue }} />
      </div>
      <div style={{ width: "60px", height: "60px", borderRadius: "50%", background: C.gold, border: `3px solid ${C.red}`, margin: "0 auto 16px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "26px" }}>🇵🇾</div>
      <div style={{ fontSize: "11px", letterSpacing: "0.3em", textTransform: "uppercase", color: C.muted, marginBottom: "8px" }}>Certificado de Preparacion para la Mision</div>
      <div style={{ fontSize: "28px", color: C.red, marginBottom: "6px", fontWeight: "400" }}>Elder Sam Nilsson</div>
      <div style={{ fontSize: "13px", color: C.muted, marginBottom: "20px" }}>Mision Asuncion Paraguay Norte · MTC</div>
      <div style={{ background: C.red, borderRadius: "12px", padding: "16px 24px", marginBottom: "20px", display: "inline-block" }}>
        <div style={{ fontSize: "42px", color: C.gold, lineHeight: 1 }}>{score}%</div>
        <div style={{ fontSize: "12px", color: "rgba(248,242,228,0.75)", marginTop: "2px" }}>Preparacion Misionera</div>
      </div>
      <div style={{ fontSize: "15px", color: C.blue, marginBottom: "6px", fontStyle: "italic" }}>
        "Seguid adelante con firmeza en Cristo"
      </div>
      <div style={{ fontSize: "12px", color: C.faint, marginBottom: "20px" }}>2 Nefi 31:20</div>
      <div style={{ fontSize: "12px", color: C.muted, borderTop: `0.5px solid ${C.border}`, paddingTop: "14px", display: "flex", justifyContent: "space-between" }}>
        <span>Racha: {streak.current || 0} dias</span>
        <span>{today}</span>
        <span>MTC: Sep 23, 2026</span>
      </div>
      {/* Paraguay flag strip bottom */}
      <div style={{ display: "flex", height: "6px", borderRadius: "4px", overflow: "hidden", marginTop: "20px" }}>
        <div style={{ flex: 1, background: C.red }} /><div style={{ flex: 1, background: C.white, border: `0.5px solid ${C.border}` }} /><div style={{ flex: 1, background: C.blue }} />
      </div>
    </div>
  );
}


// ══════════════════════════════════════════════════════════════════════════════
//  TABS
// ══════════════════════════════════════════════════════════════════════════════
const TABS = [
  { id:"countdown",  icon:"⏱",  es:"Cuenta Regresiva",  en:"Countdown",    note:"Inicio de mision · Mission begins" },
  { id:"path",       icon:"🗺",  es:"Mi Camino",         en:"My Path",      note:"Preparacion · Readiness & plan" },
  { id:"alphabet",   icon:"🔡",  es:"Alfabeto",          en:"Alphabet",     note:"Pronunciacion · Pronunciation" },
  { id:"phrases",    icon:"🙏",  es:"Frases",            en:"Phrases",      note:"Vocabulario · Mission vocabulary" },
  { id:"culture",    icon:"🏛",  es:"Cultura",           en:"Culture",      note:"Paraguay · People & customs" },
  { id:"reader",     icon:"📖",  es:"Lectura",           en:"Reader",       note:"Textos paralelos · Parallel texts" },
  { id:"vocab",      icon:"📚",  es:"Vocabulario",       en:"Vocabulary",   note:"Tarjetas y quiz · Flashcards & quiz" },
  { id:"speaking",   icon:"🎤",  es:"Hablar",            en:"Speaking",     note:"Practica de voz · Voice practice" },
  { id:"scripture",  icon:"📜",  es:"Escrituras",        en:"Scriptures",   note:"Estudio · Study & bookmarks" },
  { id:"ai",         icon:"🤖",  es:"Conversacion",      en:"Conversation", note:"Investigador IA · AI investigator" },
];

// ══════════════════════════════════════════════════════════════════════════════
//  MAIN APP
// ══════════════════════════════════════════════════════════════════════════════
export default function App() {
  const [tab, setTab] = useState("countdown");
  const streak = useStreak();
  const [alphaData,    saveAlphaData]    = useLS("sn-alpha",    { plays:{} });
  const [phraseData,   savePhraseData]   = useLS("sn-phrases",  { plays:{}, scores:{}, mastered:{} });
  const [cultureData,  saveCultureData]  = useLS("sn-culture",  { read:{}, vocab:{} });
  const [readerData,   saveReaderData]   = useLS("sn-reader",   { progress:{}, completed:{} });
  const [vocabData,    saveVocabData]    = useLS("sn-vocab",    { heard:{}, correct:{} });
  const [speakingData, saveSpeakingData] = useLS("sn-speaking", { scores:{}, sessions:0 });
  const [scriptureData,saveScriptureData]= useLS("sn-scripture",{ bookmarks:{}, notes:{}, heard:{} });
  const [convData,     saveConvData]     = useLS("sn-conv",     { sessions:0, totalMessages:0 });
  const [apiKey,       saveApiKey]       = useLS("sn-api-key",  "");
  const [showCert,  setShowCert]  = useState(false);
  const [showAzure, setShowAzure] = useState(false);
  const [azureKey]                = useLS("sn-azure-key", "");

  useEffect(() => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.getVoices();
      window.speechSynthesis.onvoiceschanged = () => window.speechSynthesis.getVoices();
    }
  }, []);

  const r = calcReadiness(alphaData, phraseData, vocabData, cultureData, readerData, speakingData);
  const missionReady = r.total >= 80;

  return (
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: "'Segoe UI',system-ui,-apple-system,sans-serif" }}>

      {/* ── HEADER ── */}
      <div style={{ position: "relative", overflow: "hidden" }}>
        {/* Paraguay flag split: red left 40%, white 5%, blue right 55% */}
        <div style={{ display: "flex", height: "100%" }}>
          <div style={{ flex: "0 0 38%", background: C.red }} />
          <div style={{ flex: "0 0 4%",  background: "#E8E0D0" }} />
          <div style={{ flex: "0 0 58%", background: C.blue }} />
        </div>
        {/* Subtle crosshatch overlay */}
        <div style={{ position: "absolute", inset: 0, backgroundImage: `repeating-linear-gradient(45deg,rgba(255,255,255,0.03) 0,rgba(255,255,255,0.03) 1px,transparent 1px,transparent 22px),repeating-linear-gradient(-45deg,rgba(255,255,255,0.03) 0,rgba(255,255,255,0.03) 1px,transparent 1px,transparent 22px)`, backgroundSize: "22px 22px" }} />
        {/* Paraguay star/crest at divider */}
        <div style={{ position: "absolute", top: "50%", left: "42%", transform: "translate(-50%,-50%)", width: "44px", height: "44px", borderRadius: "50%", background: C.gold, border: "3px solid rgba(255,255,255,0.25)", zIndex: 2, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px" }}>⭐</div>

        <div style={{ position: "relative", zIndex: 3, padding: "16px 14px 0", maxWidth: "720px", margin: "0 auto" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "3px" }}>
            <div>
              <div style={{ fontSize: "10px", letterSpacing: "0.2em", color: "rgba(248,242,228,0.65)", textTransform: "uppercase", marginBottom: "2px" }}>🇵🇾 Mision Asuncion Paraguay Norte</div>
              <h1 style={{ fontSize: "20px", fontWeight: "400", color: C.onDark, marginBottom: "1px", textShadow: "0 1px 3px rgba(0,0,0,0.3)" }}>Elder Sam Nilsson</h1>
              <div style={{ fontSize: "10px", color: "rgba(248,242,228,0.45)", marginBottom: "12px" }}>Espanol Latinoamericano · Todos los modulos</div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "5px", alignItems: "flex-end" }}>
              <StreakBadge streak={streak} />
              <button onClick={() => setShowAzure(!showAzure)}
                style={{ background: azureKey ? "rgba(45,106,79,0.25)" : "rgba(255,255,255,0.12)", border: `0.5px solid ${azureKey ? C.green : "rgba(255,255,255,0.25)"}`, borderRadius: "10px", padding: "4px 10px", fontSize: "11px", fontWeight: "500", cursor: "pointer", color: azureKey ? C.green : "rgba(248,242,228,0.8)" }}>
                {azureKey ? "🔊 Jorge Neural" : "🔊 Configurar voz"}
              </button>
              <button onClick={() => setShowCert(!showCert)}
                style={{ background: missionReady ? "rgba(45,106,79,0.25)" : "rgba(200,165,81,0.18)", border: `0.5px solid ${missionReady ? C.green : C.gold}`, borderRadius: "10px", padding: "4px 10px", fontSize: "11px", fontWeight: "500", cursor: "pointer", color: missionReady ? C.green : C.gold }}>
                {missionReady ? "🏆 " + r.total + "% · Certificado" : "🎯 " + r.total + "% listo"}
              </button>
            </div>
          </div>

          {showAzure && <AzureSettingsPanel onClose={() => setShowAzure(false)} />}
          {showCert && missionReady && <Certificate score={r.total} streak={streak} />}
          {showCert && missionReady && (
            <div style={{ padding: "8px 0", textAlign: "center" }}>
              <button onClick={() => window.print()} style={{ background: C.red, border: "none", borderRadius: "9px", padding: "8px 20px", color: C.onDark, fontSize: "12px", cursor: "pointer", marginRight: "8px" }}>🖨 Imprimir certificado</button>
              <button onClick={() => setShowCert(false)} style={{ background: "transparent", border: `0.5px solid ${C.border}`, borderRadius: "9px", padding: "8px 14px", color: C.muted, fontSize: "12px", cursor: "pointer" }}>Cerrar</button>
            </div>
          )}
          {showCert && !missionReady && (
            <div style={{ background: "rgba(0,0,0,0.3)", borderRadius: "12px", padding: "12px", marginBottom: "8px", textAlign: "center", fontSize: "12px", color: "rgba(248,242,228,0.75)" }}>
              Alcanza 80% de preparacion para desbloquear tu certificado. Actualmente {r.total}% — {80 - r.total} puntos mas!
            </div>
          )}

          {/* ── TAB BAR — large bilingual cards ── */}
          <div style={{ display: "flex", gap: "5px", overflowX: "auto", paddingBottom: "6px", scrollbarWidth: "none", msOverflowStyle: "none", marginTop: "10px", WebkitOverflowScrolling: "touch" }}>
            {TABS.map(t => {
              const active = tab === t.id;
              return (
                <button key={t.id} onClick={() => { setTab(t.id); setShowCert(false); }}
                  style={{ flexShrink: 0, width: "96px", background: active ? C.bg : "rgba(0,0,0,0.45)", border: active ? `2px solid ${C.gold}` : "1px solid rgba(255,255,255,0.25)", borderRadius: "12px 12px 0 0", borderBottom: active ? "2px solid " + C.bg : "1px solid rgba(255,255,255,0.25)", padding: "10px 6px 8px", cursor: "pointer", textAlign: "center", transition: "all 0.15s", boxShadow: active ? "0 -2px 8px rgba(0,0,0,0.2)" : "none" }}>
                  <div style={{ fontSize: "20px", lineHeight: 1, marginBottom: "5px" }}>{t.icon}</div>
                  {/* Spanish label */}
                  <div style={{ fontSize: "11px", fontWeight: "600", lineHeight: 1.2, marginBottom: "3px", color: active ? C.red : "#FFFFFF", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{t.es}</div>
                  {/* English label */}
                  <div style={{ fontSize: "10px", fontWeight: "400", lineHeight: 1.2, marginBottom: "4px", color: active ? C.muted : "rgba(255,255,255,0.75)", whiteSpace: "nowrap" }}>{t.en}</div>
                  {/* Active indicator bar */}
                  {active && <div style={{ width: "18px", height: "3px", borderRadius: "2px", background: C.gold, margin: "0 auto" }} />}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── CONTENT ── */}
      <div style={{ padding: "0 14px", maxWidth: "720px", margin: "0 auto" }}>
        {tab === "countdown"  && <CountdownView    streak={streak} alphaData={alphaData} phraseData={phraseData} cultureData={cultureData} readerData={readerData} />}
        {tab === "path"       && <LearningPathView streak={streak} alphaData={alphaData} phraseData={phraseData} vocabData={vocabData} cultureData={cultureData} readerData={readerData} speakingData={speakingData} setTab={setTab} />}
        {tab === "alphabet"   && <AlphabetView     alphaData={alphaData} saveAlphaData={saveAlphaData} />}
        {tab === "phrases"    && <PhrasesView      phraseData={phraseData} savePhraseData={savePhraseData} />}
        {tab === "culture"    && <CultureView      cultureData={cultureData} saveCultureData={saveCultureData} />}
        {tab === "reader"     && <ReaderView       readerData={readerData} saveReaderData={saveReaderData} />}
        {tab === "vocab"      && <VocabView        vocabData={vocabData} saveVocabData={saveVocabData} />}
        {tab === "speaking"   && <SpeakingLabView  speakingData={speakingData} saveSpeakingData={saveSpeakingData} />}
        {tab === "scripture"  && <ScriptureView    scriptureData={scriptureData} saveScriptureData={saveScriptureData} />}
        {tab === "ai"         && (
          !apiKey
            ? <ApiKeyPrompt onSave={saveApiKey} />
            : <AIConversationView convData={convData} saveConvData={saveConvData} apiKey={apiKey} onClearKey={() => saveApiKey("")} />
        )}
      </div>

      {/* ── FOOTER ── */}
      <div style={{ margin: "36px auto 0", maxWidth: "720px", padding: "14px 16px", borderTop: `0.5px solid ${C.border}` }}>
        <div style={{ display: "flex", gap: "9px", alignItems: "center", marginBottom: "5px" }}>
          <FlagStrip width={34} height={6} />
          <span style={{ fontSize: "11px", color: C.faint }}>Elder Nilsson's Paraguay Mission App 🇵🇾</span>
        </div>
        <div style={{ fontSize: "11px", color: C.faint, lineHeight: 1.7 }}>
          10 modulos · Todo el progreso guardado en localStorage · Racha diaria · Puntuacion de preparacion ·
          🔊 Voz del navegador por defecto — Azure Jorge Neural opcional ·
          🎤 Microfono requerido para el Laboratorio de Habla ·
          🤖 Conversacion IA con Claude (requiere clave API)
        </div>
      </div>
    </div>
  );
}
