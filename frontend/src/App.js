import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";


const STYLES = `
  @keyframes arrowFly { 0%{transform:translateY(-50%) translateX(-400px)} 100%{transform:translateY(-50%) translateX(calc(100vw + 500px))} }
  @keyframes logoPulse { 0%,100%{filter:drop-shadow(0 0 8px rgba(196,181,253,0.25))} 50%{filter:drop-shadow(0 0 28px rgba(196,181,253,0.6))} }
  @keyframes orbFloat { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-15px)} }
  @keyframes ambientPulse { 0%,100%{opacity:0.7;transform:scale(1)} 50%{opacity:1;transform:scale(1.08)} }
  @keyframes ringOrbit1 { from{transform:rotateX(75deg) rotateZ(0deg)} to{transform:rotateX(75deg) rotateZ(360deg)} }
  @keyframes ringOrbit2 { from{transform:rotateX(75deg) rotateZ(60deg)} to{transform:rotateX(75deg) rotateZ(420deg)} }
  @keyframes ringOrbit3 { from{transform:rotateX(60deg) rotateZ(120deg)} to{transform:rotateX(60deg) rotateZ(480deg)} }
  @keyframes ringOrbitV { from{transform:rotateY(80deg) rotateZ(0deg)} to{transform:rotateY(80deg) rotateZ(360deg)} }
  @keyframes bar1 { 0%,100%{height:10px} 50%{height:32px} }
  @keyframes bar2 { 0%,100%{height:10px} 50%{height:52px} }
  @keyframes bar3 { 0%,100%{height:10px} 50%{height:68px} }
  @keyframes bar4 { 0%,100%{height:10px} 50%{height:80px} }
  @keyframes fadeIn { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
  @keyframes fp0 { 0%,100%{transform:translate(0,0)} 50%{transform:translate(-15px,-20px)} }
  @keyframes fp1 { 0%,100%{transform:translate(0,0)} 50%{transform:translate(12px,-25px)} }
  @keyframes fp2 { 0%,100%{transform:translate(0,0)} 50%{transform:translate(-20px,12px)} }
  @keyframes fp3 { 0%,100%{transform:translate(0,0)} 50%{transform:translate(18px,22px)} }
  @keyframes fp4 { 0%,100%{transform:translate(0,0)} 50%{transform:translate(-12px,-18px)} }
  @keyframes fp5 { 0%,100%{transform:translate(0,0)} 50%{transform:translate(22px,-12px)} }
  @keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
  ::-webkit-scrollbar{width:4px} ::-webkit-scrollbar-track{background:transparent} ::-webkit-scrollbar-thumb{background:rgba(124,58,237,0.3);border-radius:2px}
`;

// ── LOGO ───────────────────────────────────────────────────────────────────────
function MahaLogo({ size = 36 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
      <defs>
        <radialGradient id="coreGrad" cx="40%" cy="35%" r="60%">
          <stop offset="0%" stopColor="#e9d5ff"/>
          <stop offset="50%" stopColor="#a78bfa"/>
          <stop offset="100%" stopColor="#4c1d95"/>
        </radialGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="1.5" result="blur"/>
          <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>
      <circle cx="20" cy="20" r="19" fill="#a78bfa" opacity="0.1"/>
      <ellipse cx="20" cy="20" rx="18" ry="6" stroke="#c4b5fd" strokeWidth="0.7" opacity="0.5" transform="rotate(-35 20 20)" fill="none"/>
      <ellipse cx="20" cy="20" rx="18" ry="6" stroke="#818cf8" strokeWidth="0.6" opacity="0.35" transform="rotate(35 20 20)" fill="none"/>
      <circle cx="20" cy="20" r="10" fill="url(#coreGrad)" filter="url(#glow)"/>
      <ellipse cx="17" cy="16" rx="3.5" ry="2" fill="white" opacity="0.25" transform="rotate(-20 17 16)"/>
      <rect x="14" y="18" width="2" height="4" rx="1" fill="white" opacity="0.9"/>
      <rect x="17.5" y="16" width="2" height="8" rx="1" fill="white" opacity="0.95"/>
      <rect x="21" y="17.5" width="2" height="5" rx="1" fill="white" opacity="0.9"/>
      <rect x="24.5" y="19" width="2" height="2" rx="1" fill="white" opacity="0.8"/>
      <circle cx="20" cy="2.5" r="1.5" fill="#c4b5fd"/>
      <circle cx="37.5" cy="20" r="1.2" fill="#a78bfa" opacity="0.8"/>
      <circle cx="2.5" cy="20" r="1.2" fill="#818cf8" opacity="0.7"/>
      <circle cx="20" cy="37.5" r="1.5" fill="#c4b5fd"/>
    </svg>
  );
}

// ── FUTURISTIC ORB ─────────────────────────────────────────────────────────────
function FuturisticOrb({ size = 200, active = false }) {
  const rings = [
    { w: 280, anim: "ringOrbit1", dur: "6s", color: "rgba(124,58,237,0.8)" },
    { w: 260, anim: "ringOrbit2", dur: "9s", color: "rgba(96,165,250,0.6)" },
    { w: 300, anim: "ringOrbit3", dur: "12s", color: "rgba(167,139,250,0.35)" },
    { w: 240, anim: "ringOrbitV", dur: "8s", color: "rgba(167,139,250,0.3)" },
  ];
  const particles = [
    { top:"10%",left:"5%",color:"#a78bfa",size:6,anim:"fp0",dur:"3s" },
    { top:"75%",left:"88%",color:"#60a5fa",size:4,anim:"fp1",dur:"4s" },
    { top:"8%",left:"82%",color:"#f9a8d4",size:5,anim:"fp2",dur:"5s" },
    { top:"80%",left:"8%",color:"#a78bfa",size:4,anim:"fp3",dur:"3.5s" },
    { top:"45%",left:"95%",color:"#60a5fa",size:6,anim:"fp4",dur:"4.5s" },
    { top:"50%",left:"2%",color:"#f9a8d4",size:4,anim:"fp5",dur:"3.8s" },
  ];
  return (
    <div style={{ position:"relative",width:`${size+120}px`,height:`${size+120}px`,margin:"0 auto",perspective:"800px" }}>
      <div style={{ position:"absolute",inset:0,background:"radial-gradient(circle, rgba(124,58,237,0.2) 0%, rgba(59,130,246,0.1) 40%, transparent 70%)",filter:"blur(30px)",animation:"ambientPulse 3s ease-in-out infinite" }}/>
      {rings.map((r,i)=>(
        <div key={i} style={{ position:"absolute",top:"50%",left:"50%",width:`${r.w}px`,height:`${r.w}px`,marginTop:`-${r.w/2}px`,marginLeft:`-${r.w/2}px`,borderRadius:"50%",border:`1.5px solid ${r.color}`,animation:`${r.anim} ${r.dur} linear infinite` }}/>
      ))}
      <div style={{ position:"absolute",top:"50%",left:"50%",width:`${size}px`,height:`${size}px`,marginTop:`-${size/2}px`,marginLeft:`-${size/2}px`,borderRadius:"50%",background:active?"radial-gradient(circle at 35% 30%, rgba(255,255,255,0.7) 0%, rgba(134,239,172,0.9) 15%, rgba(22,163,74,0.85) 45%, rgba(5,46,22,0.9) 100%)":"radial-gradient(circle at 35% 30%, rgba(255,255,255,0.7) 0%, rgba(196,181,253,0.9) 15%, rgba(124,58,237,0.85) 45%, rgba(30,27,75,0.9) 70%, rgba(5,5,20,0.95) 100%)",boxShadow:active?"0 0 60px 20px rgba(22,163,74,0.6),inset 0 0 40px rgba(255,255,255,0.2)":"0 0 60px 20px rgba(124,58,237,0.6),inset 0 0 40px rgba(255,255,255,0.15),inset -15px -15px 40px rgba(0,0,0,0.5)",animation:"orbFloat 4s ease-in-out infinite",display:"flex",alignItems:"center",justifyContent:"center",gap:"5px" }}>
        <div style={{ position:"absolute",inset:0,borderRadius:"50%",background:"radial-gradient(circle at 30% 25%, rgba(255,255,255,0.3) 0%, transparent 50%)",pointerEvents:"none" }}/>
        {["bar1","bar2","bar3","bar4","bar3","bar2","bar1"].map((anim,i)=>(
          <div key={i} style={{ width:"5px",borderRadius:"4px",background:"linear-gradient(to top, rgba(255,255,255,0.4), rgba(255,255,255,1))",animation:`${anim} ${0.7+i*0.1}s ease-in-out infinite`,animationDelay:`${i*0.08}s`,boxShadow:"0 0 8px rgba(255,255,255,0.9)",zIndex:1 }}/>
        ))}
      </div>
      {particles.map((p,i)=>(
        <div key={i} style={{ position:"absolute",width:`${p.size}px`,height:`${p.size}px`,borderRadius:"50%",background:p.color,boxShadow:`0 0 10px ${p.color}`,top:p.top,left:p.left,animation:`${p.anim} ${p.dur} ease-in-out infinite` }}/>
      ))}
    </div>
  );
}

// ── LOADING SCREEN ─────────────────────────────────────────────────────────────
function LoadingScreen({ onComplete }) {
  const [lettersShown, setLettersShown] = useState(0);
  const [phase, setPhase] = useState("black");
  const letters = [
    {char:"M",purple:true},{char:"a",purple:false},{char:"h",purple:false},
    {char:"a",purple:false},{char:".",purple:true},{char:"a",purple:true},{char:"i",purple:true}
  ];
  useEffect(() => {
    const timers = [
      setTimeout(()=>setPhase("shooting"),400),
      setTimeout(()=>setLettersShown(1),620),
      setTimeout(()=>setLettersShown(2),750),
      setTimeout(()=>setLettersShown(3),880),
      setTimeout(()=>setLettersShown(4),1010),
      setTimeout(()=>setLettersShown(5),1120),
      setTimeout(()=>setLettersShown(6),1220),
      setTimeout(()=>setLettersShown(7),1310),
      setTimeout(()=>setPhase("pulse"),1700),
      setTimeout(()=>setPhase("fadeout"),2700),
      setTimeout(()=>onComplete(),3300),
    ];
    return ()=>timers.forEach(clearTimeout);
  },[]);
  return (
    <div style={{ position:"fixed",inset:0,background:"#000",display:"flex",alignItems:"center",justifyContent:"center",zIndex:9999,opacity:phase==="fadeout"?0:1,transition:phase==="fadeout"?"opacity 0.65s ease":"none" }}>
      <style>{STYLES}{`
        @keyframes arrowFlyLoad { 0%{transform:translateY(-50%) translateX(-400px)} 100%{transform:translateY(-50%) translateX(calc(100vw + 500px))} }
        @keyframes logoPulseLoad { 0%,100%{filter:drop-shadow(0 0 8px rgba(196,181,253,0.25))} 50%{filter:drop-shadow(0 0 28px rgba(196,181,253,0.6))} }
      `}</style>
      {phase==="shooting"&&(
        <div style={{ position:"fixed",top:"50%",left:0,display:"flex",alignItems:"center",animation:"arrowFlyLoad 1.6s cubic-bezier(0.25,0.46,0.45,0.94) forwards",filter:"drop-shadow(0 0 10px rgba(196,181,253,0.9))",pointerEvents:"none",zIndex:10 }}>
          <div style={{ width:"200px",height:"1.5px",background:"linear-gradient(to right, transparent, rgba(196,181,253,0.1), rgba(196,181,253,0.4), rgba(196,181,253,0.8), #c4b5fd)" }}/>
          <div style={{ width:"10px",height:"1.5px",background:"#fff",boxShadow:"0 0 8px #fff, 0 0 16px #c4b5fd" }}/>
          <div style={{ width:0,height:0,borderTop:"5px solid transparent",borderBottom:"5px solid transparent",borderLeft:"12px solid #e9d5ff" }}/>
        </div>
      )}
      <div style={{ display:"flex",alignItems:"baseline",fontSize:"clamp(48px,8vw,88px)",fontWeight:"800",fontFamily:"'Inter',-apple-system,sans-serif",letterSpacing:"-3px",animation:phase==="pulse"?"logoPulseLoad 1.4s ease-in-out infinite":"none" }}>
        {letters.map((l,i)=>(
          <span key={i} style={{ color:l.purple?"#c4b5fd":"#ffffff",opacity:i<lettersShown?1:0,transform:i<lettersShown?"translateY(0) scale(1)":"translateY(10px) scale(0.94)",filter:i<lettersShown?"blur(0)":"blur(4px)",transition:"opacity 0.18s ease, transform 0.2s ease, filter 0.18s ease",display:"inline-block" }}>
            {l.char}
          </span>
        ))}
      </div>
    </div>
  );
}

// ── MAIN APP ───────────────────────────────────────────────────────────────────
function App() {
  const [loading, setLoading] = useState(true);
  const [screen, setScreen] = useState("landing");
  const [user, setUser] = useState(null);

  useEffect(()=>{
    const saved = localStorage.getItem("mahaUser");
    if(saved){ setUser(JSON.parse(saved)); setScreen("app"); }
  },[]);

  const handleLogin = (u) => { setUser(u); setScreen("app"); };
  const handleLogout = () => { localStorage.removeItem("mahaUser"); setUser(null); setScreen("landing"); };

  if(loading) return <LoadingScreen onComplete={()=>setLoading(false)}/>;
  if(screen==="app"&&user) return <MainApp user={user} onLogout={handleLogout}/>;
  if(screen==="call") return <FreeCall onBack={()=>setScreen("landing")}/>;
  if(screen==="signup") return <SignUp onBack={()=>setScreen("landing")} onSuccess={handleLogin}/>;
  if(screen==="signin") return <SignIn onBack={()=>setScreen("landing")} onSuccess={handleLogin}/>;
  return <Landing onCall={()=>setScreen("call")} onSignUp={()=>setScreen("signup")} onSignIn={()=>setScreen("signin")}/>;
}

// ── MAIN APP INTERFACE ─────────────────────────────────────────────────────────
function MainApp({ user, onLogout }) {
  const [conversations, setConversations] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);
  const [orbMode, setOrbMode] = useState("idle");
  const [selectedLang, setSelectedLang] = useState("English");
  const [view, setView] = useState("chat");
  const messagesEndRef = useRef(null);

  useEffect(()=>{
    const saved = JSON.parse(localStorage.getItem("mahaHistory")||"[]");
    setConversations(saved);
    if(saved.length>0){ setActiveId(saved[0].id); setMessages(saved[0].messages); }
  },[]);

  useEffect(()=>{ messagesEndRef.current?.scrollIntoView({behavior:"smooth"}); },[messages]);

  const saveConversation = (id, msgs, title) => {
    const updated = conversations.filter(c=>c.id!==id);
    const conv = {id, title:title||"New Chat", messages:msgs, updatedAt:Date.now()};
    const newList = [conv,...updated];
    setConversations(newList);
    localStorage.setItem("mahaHistory",JSON.stringify(newList));
  };

  const newChat = () => {
    const id = Date.now().toString();
    setActiveId(id); setMessages([]);
  };

  const loadConversation = (conv) => {
    setActiveId(conv.id); setMessages(conv.messages);
  };

  const deleteConversation = (id, e) => {
    e.stopPropagation();
    const updated = conversations.filter(c=>c.id!==id);
    setConversations(updated);
    localStorage.setItem("mahaHistory",JSON.stringify(updated));
    if(activeId===id){ setActiveId(null); setMessages([]); }
  };

  const speakText = (text) => {
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "en-IN"; u.rate = 0.95; u.pitch = 1.1;
    setOrbMode("speaking");
    u.onend = ()=>setOrbMode("idle");
    const v = window.speechSynthesis.getVoices().find(v=>/zira|female|heera/i.test(v.name));
    if(v) u.voice = v;
    window.speechSynthesis.speak(u);
  };

  const sendMessage = async (text) => {
    if(!text?.trim()) return;
    const userMsg = {id:Date.now(), text, sender:"user"};
    const newMsgs = [...messages, userMsg];
    setMessages(newMsgs); setInput(""); setLoading(true); setOrbMode("thinking");
    try {
      const res = await fetch("https://maha-ai-4qbe.onrender.com/chat",{
        method:"POST", headers:{"Content-Type":"application/json"},
        body:JSON.stringify({message:text, language:selectedLang, persona:"Maha", userName:user?.name})
      });
      const data = await res.json();
      const aiMsg = {id:Date.now()+1, text:data.reply, sender:"ai"};
      const finalMsgs = [...newMsgs, aiMsg];
      setMessages(finalMsgs);
      speakText(data.reply);
      const convId = activeId || Date.now().toString();
      if(!activeId) setActiveId(convId);
      saveConversation(convId, finalMsgs, text.slice(0,40));
    } catch {
      setMessages(p=>[...p,{id:Date.now()+1, text:"Connection error! Make sure Flask is running.", sender:"ai"}]);
      setOrbMode("idle");
    }
    setLoading(false);
  };

  const startListening = () => {
    const SR = window.SpeechRecognition||window.webkitSpeechRecognition;
    if(!SR){ alert("Use Chrome for voice!"); return; }
    const rec = new SR();
    rec.lang = selectedLang==="Telugu"?"te-IN":selectedLang==="Hindi"?"hi-IN":selectedLang==="Tamil"?"ta-IN":"en-IN";
    rec.onstart = ()=>{ setListening(true); setOrbMode("listening"); };
    rec.onresult = e=>{ const t=e.results[0][0].transcript; setListening(false); setOrbMode("thinking"); sendMessage(t); };
    rec.onerror = ()=>{ setListening(false); setOrbMode("idle"); };
    rec.onend = ()=>setListening(false);
    rec.start();
  };

  const orbColors = {
    idle:{ bg:"radial-gradient(circle at 35% 30%, #ddd6fe, #7c3aed 50%, #1e1b4b)", shadow:"0 0 60px 20px rgba(124,58,237,0.6)" },
    listening:{ bg:"radial-gradient(circle at 35% 30%, #bbf7d0, #16a34a 50%, #052e16)", shadow:"0 0 60px 25px rgba(22,163,74,0.65)" },
    thinking:{ bg:"radial-gradient(circle at 35% 30%, #fef08a, #d97706 50%, #451a03)", shadow:"0 0 60px 25px rgba(217,119,6,0.65)" },
    speaking:{ bg:"radial-gradient(circle at 35% 30%, #f9a8d4, #ec4899 50%, #500724)", shadow:"0 0 70px 30px rgba(236,72,153,0.75)" },
  };

  return (
    <div style={{ display:"flex",height:"100vh",background:"#000",color:"#fff",fontFamily:"'Inter',sans-serif",overflow:"hidden" }}>
      <style>{STYLES}</style>

      {/* ── SIDEBAR ── */}
      <div style={{ width:"260px",background:"rgba(255,255,255,0.025)",borderRight:"1px solid rgba(255,255,255,0.06)",display:"flex",flexDirection:"column",flexShrink:0 }}>

        {/* Logo + New Chat */}
        <div style={{ padding:"20px 16px",borderBottom:"1px solid rgba(255,255,255,0.06)" }}>
          <div style={{ display:"flex",alignItems:"center",gap:"10px",marginBottom:"16px" }}>
            <MahaLogo size={32}/>
            <span style={{ fontSize:"18px",fontWeight:"800",letterSpacing:"-1px" }}>Maha<span style={{ color:"#a78bfa" }}>.ai</span></span>
          </div>
          <button onClick={newChat} style={{ width:"100%",padding:"11px",background:"linear-gradient(135deg,#7c3aed,#4f46e5)",border:"none",borderRadius:"10px",color:"#fff",fontSize:"13px",fontWeight:"600",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:"8px" }}>
            ✏️ New Chat
          </button>
        </div>

        {/* Chat / Voice toggle */}
        <div style={{ padding:"12px 16px",display:"flex",gap:"6px",borderBottom:"1px solid rgba(255,255,255,0.06)" }}>
          {[{k:"chat",icon:"💬",label:"Chat"},{k:"voice",icon:"🎙️",label:"Voice"}].map(v=>(
            <button key={v.k} onClick={()=>setView(v.k)} style={{ flex:1,padding:"8px",background:view===v.k?"rgba(124,58,237,0.3)":"rgba(255,255,255,0.04)",border:`1px solid ${view===v.k?"rgba(124,58,237,0.5)":"rgba(255,255,255,0.08)"}`,borderRadius:"8px",color:view===v.k?"#c4b5fd":"rgba(255,255,255,0.45)",fontSize:"12px",fontWeight:"600",cursor:"pointer",transition:"all 0.2s" }}>
              {v.icon} {v.label}
            </button>
          ))}
        </div>

        {/* History */}
        <div style={{ flex:1,overflowY:"auto",padding:"12px 8px" }}>
          <div style={{ fontSize:"10px",color:"rgba(255,255,255,0.25)",letterSpacing:"2px",padding:"0 8px 10px",textTransform:"uppercase" }}>Conversations</div>
          {conversations.length===0&&(
            <div style={{ padding:"30px 8px",color:"rgba(255,255,255,0.2)",fontSize:"13px",textAlign:"center",lineHeight:"1.6" }}>
              No conversations yet.<br/>Start a new chat!
            </div>
          )}
          {conversations.map(conv=>(
            <div key={conv.id} onClick={()=>loadConversation(conv)} style={{ padding:"10px",borderRadius:"8px",cursor:"pointer",marginBottom:"2px",display:"flex",alignItems:"center",justifyContent:"space-between",background:activeId===conv.id?"rgba(124,58,237,0.18)":"transparent",border:`1px solid ${activeId===conv.id?"rgba(124,58,237,0.3)":"transparent"}`,transition:"all 0.2s" }}
              onMouseEnter={e=>{ if(activeId!==conv.id) e.currentTarget.style.background="rgba(255,255,255,0.04)"; }}
              onMouseLeave={e=>{ if(activeId!==conv.id) e.currentTarget.style.background="transparent"; }}>
              <div style={{ flex:1,minWidth:0 }}>
                <div style={{ fontSize:"13px",color:"rgba(255,255,255,0.85)",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis" }}>{conv.title||"New Chat"}</div>
                <div style={{ fontSize:"11px",color:"rgba(255,255,255,0.28)",marginTop:"2px" }}>{conv.messages?.length||0} messages</div>
              </div>
              <button onClick={e=>deleteConversation(conv.id,e)} style={{ background:"transparent",border:"none",color:"rgba(255,255,255,0.25)",cursor:"pointer",padding:"4px 6px",borderRadius:"4px",fontSize:"13px",transition:"all 0.2s",flexShrink:0 }}
                onMouseEnter={e=>e.currentTarget.style.color="#ef4444"}
                onMouseLeave={e=>e.currentTarget.style.color="rgba(255,255,255,0.25)"}>
                🗑️
              </button>
            </div>
          ))}
        </div>

        {/* Profile + Logout */}
        <div style={{ padding:"12px",borderTop:"1px solid rgba(255,255,255,0.06)" }}>
          <div style={{ display:"flex",alignItems:"center",gap:"10px",padding:"10px",borderRadius:"10px",background:"rgba(255,255,255,0.04)",marginBottom:"8px" }}>
            <div style={{ width:"34px",height:"34px",borderRadius:"50%",background:"linear-gradient(135deg,#7c3aed,#4f46e5)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"15px",fontWeight:"700",flexShrink:0 }}>
              {user?.name?.[0]?.toUpperCase()||"M"}
            </div>
            <div style={{ flex:1,minWidth:0 }}>
              <div style={{ fontSize:"13px",fontWeight:"600",color:"#fff",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis" }}>{user?.name||"User"}</div>
              <div style={{ fontSize:"11px",color:"rgba(255,255,255,0.35)",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis" }}>{user?.email||""}</div>
            </div>
          </div>
          <button onClick={onLogout} style={{ width:"100%",padding:"9px",background:"rgba(239,68,68,0.08)",border:"1px solid rgba(239,68,68,0.2)",borderRadius:"8px",color:"#f87171",fontSize:"13px",cursor:"pointer",transition:"all 0.2s" }}
            onMouseEnter={e=>e.currentTarget.style.background="rgba(239,68,68,0.15)"}
            onMouseLeave={e=>e.currentTarget.style.background="rgba(239,68,68,0.08)"}>
            Sign Out
          </button>
        </div>
      </div>

      {/* ── MAIN CONTENT ── */}
      <div style={{ flex:1,display:"flex",flexDirection:"column",overflow:"hidden",background:"radial-gradient(ellipse at top right, rgba(124,58,237,0.06) 0%, transparent 50%)" }}>

        {/* Header */}
        <div style={{ padding:"14px 24px",borderBottom:"1px solid rgba(255,255,255,0.06)",display:"flex",alignItems:"center",justifyContent:"space-between",background:"rgba(0,0,0,0.4)",backdropFilter:"blur(20px)" }}>
          <div>
            <div style={{ fontSize:"15px",fontWeight:"600",color:"#fff" }}>
              {conversations.find(c=>c.id===activeId)?.title||"New Conversation"}
            </div>
            <div style={{ fontSize:"11px",color:"rgba(255,255,255,0.3)",marginTop:"2px" }}>
              {orbMode==="idle"?"● Maha is ready":orbMode==="listening"?"🎤 Listening...":orbMode==="thinking"?"💭 Thinking...":"🔊 Speaking..."}
            </div>
          </div>
          <select value={selectedLang} onChange={e=>setSelectedLang(e.target.value)} style={{ padding:"8px 12px",background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:"8px",color:"#fff",fontSize:"13px",cursor:"pointer",outline:"none" }}>
            {["English","Telugu","Hindi","Tamil","Kannada","Malayalam","Marathi","Bengali","Gujarati","Punjabi"].map(l=>(
              <option key={l} value={l} style={{ background:"#1a1a2e" }}>{l}</option>
            ))}
          </select>
        </div>

        {/* ── CHAT VIEW ── */}
        {view==="chat"&&(
          <>
            <div style={{ flex:1,overflowY:"auto",padding:"24px",display:"flex",flexDirection:"column",gap:"14px" }}>
              {messages.length===0&&(
                <div style={{ textAlign:"center",marginTop:"60px",animation:"fadeIn 0.6s ease" }}>
                  <MahaLogo size={56}/>
                  <div style={{ fontSize:"22px",fontWeight:"700",color:"#fff",marginTop:"20px",marginBottom:"8px" }}>Hello, {user?.name||"Friend"}! 👋</div>
                  <div style={{ color:"rgba(255,255,255,0.4)",fontSize:"15px",marginBottom:"32px" }}>How can Maha help you today?</div>
                  <div style={{ display:"flex",gap:"10px",justifyContent:"center",flexWrap:"wrap" }}>
                    {["Tell me about yourself","Nenu ela unnanu?","Aap kaise hain?","Help me practice speaking"].map(s=>(
                      <button key={s} onClick={()=>sendMessage(s)} style={{ padding:"10px 18px",background:"rgba(124,58,237,0.1)",border:"1px solid rgba(124,58,237,0.25)",borderRadius:"20px",color:"#c4b5fd",fontSize:"13px",cursor:"pointer",transition:"all 0.2s" }}
                        onMouseEnter={e=>e.currentTarget.style.background="rgba(124,58,237,0.2)"}
                        onMouseLeave={e=>e.currentTarget.style.background="rgba(124,58,237,0.1)"}>
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {messages.map(msg=>(
                <div key={msg.id} style={{ display:"flex",justifyContent:msg.sender==="user"?"flex-end":"flex-start",alignItems:"flex-end",gap:"8px" }}>
                  {msg.sender==="ai"&&(
                    <div style={{ width:"28px",height:"28px",borderRadius:"50%",background:"linear-gradient(135deg,#7c3aed,#4f46e5)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,marginBottom:"2px" }}>
                      <MahaLogo size={20}/>
                    </div>
                  )}
                  <div style={{ maxWidth:"70%",padding:"12px 16px",borderRadius:"18px",fontSize:"14px",lineHeight:"1.6",background:msg.sender==="user"?"linear-gradient(135deg,#7c3aed,#4f46e5)":"rgba(255,255,255,0.07)",color:"rgba(255,255,255,0.92)",borderBottomRightRadius:msg.sender==="user"?"4px":"18px",borderBottomLeftRadius:msg.sender==="ai"?"4px":"18px",border:msg.sender==="ai"?"1px solid rgba(255,255,255,0.06)":"none" }}>
                    {msg.text}
                  </div>
                </div>
              ))}
              {loading&&(
                <div style={{ display:"flex",alignItems:"center",gap:"8px" }}>
                  <div style={{ width:"28px",height:"28px",borderRadius:"50%",background:"linear-gradient(135deg,#7c3aed,#4f46e5)",display:"flex",alignItems:"center",justifyContent:"center" }}><MahaLogo size={20}/></div>
                  <div style={{ padding:"12px 16px",borderRadius:"18px",borderBottomLeftRadius:"4px",background:"rgba(255,255,255,0.07)",color:"rgba(255,255,255,0.35)",fontSize:"14px",border:"1px solid rgba(255,255,255,0.05)" }}>
                    Maha is thinking...
                  </div>
                </div>
              )}
              <div ref={messagesEndRef}/>
            </div>

            {/* Chat Input */}
            <div style={{ padding:"16px 24px",borderTop:"1px solid rgba(255,255,255,0.06)",background:"rgba(0,0,0,0.5)",backdropFilter:"blur(20px)",display:"flex",gap:"10px",alignItems:"center" }}>
              <input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&!e.shiftKey&&sendMessage(input)} placeholder={`Message Maha in ${selectedLang}...`} style={{ flex:1,padding:"13px 16px",background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:"12px",color:"#fff",fontSize:"14px",outline:"none" }}/>
              <button onClick={startListening} style={{ padding:"13px 16px",borderRadius:"12px",border:"none",cursor:"pointer",background:listening?"#ef4444":"rgba(255,255,255,0.07)",color:"#fff",fontSize:"18px",transition:"all 0.2s" }}>
                {listening?"🔴":"🎤"}
              </button>
              <button onClick={()=>sendMessage(input)} disabled={loading||!input.trim()} style={{ padding:"13px 22px",borderRadius:"12px",border:"none",cursor:"pointer",background:"linear-gradient(135deg,#7c3aed,#4f46e5)",color:"#fff",fontWeight:"700",fontSize:"14px",opacity:loading||!input.trim()?0.5:1,transition:"opacity 0.2s" }}>
                Send
              </button>
            </div>
          </>
        )}

        {/* ── VOICE VIEW ── */}
        {view==="voice"&&(
          <div style={{ flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"40px",background:"radial-gradient(ellipse at center, rgba(124,58,237,0.08) 0%, transparent 60%)" }}>
            <div style={{ fontSize:"13px",color:"rgba(255,255,255,0.4)",letterSpacing:"3px",marginBottom:"30px",textTransform:"uppercase" }}>
              {orbMode==="idle"?"Tap orb to speak":orbMode==="listening"?"🎤 Listening...":orbMode==="thinking"?"💭 Maha is thinking...":"🔊 Maha is speaking..."}
            </div>

            {/* Small orb for voice */}
            <div style={{ cursor:"pointer",position:"relative" }} onClick={orbMode==="idle"?startListening:undefined}>
              <div style={{ position:"absolute",inset:"-60px",background:"radial-gradient(circle, rgba(124,58,237,0.15) 0%, transparent 70%)",filter:"blur(20px)",animation:"ambientPulse 3s ease-in-out infinite" }}/>
              <div style={{ width:"180px",height:"180px",borderRadius:"50%",background:orbColors[orbMode].bg,boxShadow:orbColors[orbMode].shadow,animation:"orbFloat 4s ease-in-out infinite",display:"flex",alignItems:"center",justifyContent:"center",gap:"5px",position:"relative" }}>
                <div style={{ position:"absolute",inset:0,borderRadius:"50%",background:"radial-gradient(circle at 30% 25%, rgba(255,255,255,0.3) 0%, transparent 50%)" }}/>
                {["bar1","bar2","bar3","bar4","bar3","bar2","bar1"].map((anim,i)=>(
                  <div key={i} style={{ width:"5px",borderRadius:"4px",background:"linear-gradient(to top, rgba(255,255,255,0.4), rgba(255,255,255,1))",animation:`${anim} ${0.7+i*0.1}s ease-in-out infinite`,animationDelay:`${i*0.08}s`,boxShadow:"0 0 8px rgba(255,255,255,0.9)",zIndex:1 }}/>
                ))}
              </div>
            </div>

            <div style={{ marginTop:"32px",fontSize:"14px",color:"rgba(255,255,255,0.35)" }}>
              {orbMode==="idle"?"Tap the orb to start speaking":""}
            </div>

            {/* Last message */}
            {messages.length>0&&(
              <div style={{ marginTop:"32px",maxWidth:"500px",width:"100%",padding:"20px",background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:"16px",textAlign:"center",animation:"fadeIn 0.4s ease" }}>
                <div style={{ fontSize:"11px",color:"rgba(255,255,255,0.25)",marginBottom:"10px",letterSpacing:"2px" }}>LAST MESSAGE</div>
                <div style={{ fontSize:"15px",color:"rgba(255,255,255,0.8)",lineHeight:"1.6" }}>
                  {messages[messages.length-1]?.text}
                </div>
              </div>
            )}

            {/* Voice input */}
            <div style={{ marginTop:"24px",display:"flex",gap:"12px",alignItems:"center" }}>
              <button onClick={startListening} disabled={listening||orbMode!=="idle"} style={{ padding:"14px 32px",background:listening?"rgba(239,68,68,0.2)":"linear-gradient(135deg,#7c3aed,#4f46e5)",border:"none",borderRadius:"12px",color:"#fff",fontSize:"15px",fontWeight:"700",cursor:"pointer",opacity:orbMode!=="idle"&&!listening?0.5:1 }}>
                {listening?"🔴 Listening...":"🎤 Speak to Maha"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── LANDING ────────────────────────────────────────────────────────────────────
function Landing({ onCall, onSignUp, onSignIn }) {
  return (
    <div style={{ background:"#000",minHeight:"100vh",color:"#fff",fontFamily:"'Inter',sans-serif",animation:"fadeIn 0.8s ease" }}>
      <style>{STYLES}</style>
      <header style={{ padding:"20px 60px",display:"flex",alignItems:"center",justifyContent:"space-between",borderBottom:"1px solid rgba(255,255,255,0.06)",position:"sticky",top:0,zIndex:100,background:"rgba(0,0,0,0.85)",backdropFilter:"blur(20px)" }}>
        <div style={{ display:"flex",alignItems:"center",gap:"10px" }}>
          <MahaLogo size={36}/>
          <span style={{ fontSize:"22px",fontWeight:"800",letterSpacing:"-1px" }}>Maha<span style={{ color:"#a78bfa" }}>.ai</span></span>
        </div>
        <div style={{ display:"flex",gap:"12px" }}>
          <button onClick={onSignIn} style={{ padding:"10px 20px",background:"transparent",border:"1px solid rgba(255,255,255,0.2)",borderRadius:"8px",color:"#fff",fontSize:"14px",cursor:"pointer" }}>Sign In</button>
          <button onClick={onSignUp} style={{ padding:"10px 20px",background:"linear-gradient(135deg,#7c3aed,#4f46e5)",border:"none",borderRadius:"8px",color:"#fff",fontSize:"14px",cursor:"pointer",fontWeight:"600" }}>Sign Up</button>
        </div>
      </header>

      <section style={{ textAlign:"center",padding:"100px 20px 60px",background:"radial-gradient(ellipse at center top, rgba(124,58,237,0.12) 0%, transparent 60%)" }}>
        <div style={{ display:"inline-block",padding:"6px 16px",background:"rgba(124,58,237,0.15)",border:"1px solid rgba(124,58,237,0.3)",borderRadius:"20px",fontSize:"12px",color:"#a78bfa",letterSpacing:"2px",marginBottom:"24px" }}>
          🚀 AI VOICE PLATFORM FOR INDIA
        </div>
        <h1 style={{ fontSize:"clamp(48px,8vw,80px)",fontWeight:"900",lineHeight:"1.1",marginBottom:"16px",background:"linear-gradient(135deg, #fff 30%, #a78bfa 70%)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",letterSpacing:"-2px" }}>
          Maha.ai
        </h1>
        <p style={{ fontSize:"24px",color:"rgba(255,255,255,0.6)",marginBottom:"16px",fontWeight:"300" }}>Your Universe, Your AI</p>
        <p style={{ fontSize:"16px",color:"rgba(255,255,255,0.4)",marginBottom:"48px",maxWidth:"500px",margin:"0 auto 48px" }}>
          Talk naturally with an AI that understands your language. Telugu, Hindi, Tamil and more.
        </p>
        <div style={{ display:"flex",gap:"16px",justifyContent:"center",flexWrap:"wrap",marginBottom:"70px" }}>
          <button onClick={onCall} style={{ padding:"18px 40px",background:"linear-gradient(135deg,#7c3aed,#4f46e5)",border:"none",borderRadius:"12px",color:"#fff",fontSize:"16px",fontWeight:"700",cursor:"pointer",boxShadow:"0 0 40px rgba(124,58,237,0.4)" }}>
            🎤 Start Free Call
          </button>
          <button onClick={onSignUp} style={{ padding:"18px 40px",background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.15)",borderRadius:"12px",color:"#fff",fontSize:"16px",fontWeight:"600",cursor:"pointer" }}>
            Sign Up Free →
          </button>
        </div>
        <FuturisticOrb size={180}/>
      </section>

      <section style={{ padding:"80px 60px",background:"rgba(255,255,255,0.02)" }}>
        <h2 style={{ textAlign:"center",fontSize:"36px",fontWeight:"700",marginBottom:"12px" }}>Why Maha.ai?</h2>
        <p style={{ textAlign:"center",color:"rgba(255,255,255,0.4)",marginBottom:"60px" }}>Built for India. Powered by AI.</p>
        <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fit, minmax(280px, 1fr))",gap:"20px",maxWidth:"1000px",margin:"0 auto" }}>
          {[
            {icon:"🎤",title:"Real-Time Voice",desc:"Talk naturally — the AI hears you and responds instantly like a real conversation."},
            {icon:"🗣️",title:"10 Indian Languages",desc:"Telugu, Hindi, Tamil, Kannada, Malayalam, Marathi, Bengali, Gujarati, Punjabi, English."},
            {icon:"🧠",title:"Human-Like AI",desc:"Natural pronunciation, native accents, emotional responses. Not robotic — real."},
            {icon:"⚡",title:"Fast Response",desc:"Sub-second AI responses. No waiting, no lag. Just natural conversation flow."},
            {icon:"🔒",title:"Private & Secure",desc:"Your conversations are private. Secure authentication. Your data stays yours."},
            {icon:"🌐",title:"Works Everywhere",desc:"Mobile, tablet, desktop. Any device, any browser, anywhere in India."},
          ].map(f=>(
            <div key={f.title} style={{ padding:"28px",background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.07)",borderRadius:"16px",transition:"all 0.3s" }}
              onMouseEnter={e=>{ e.currentTarget.style.background="rgba(124,58,237,0.08)"; e.currentTarget.style.borderColor="rgba(124,58,237,0.3)"; }}
              onMouseLeave={e=>{ e.currentTarget.style.background="rgba(255,255,255,0.03)"; e.currentTarget.style.borderColor="rgba(255,255,255,0.07)"; }}>
              <div style={{ fontSize:"36px",marginBottom:"16px" }}>{f.icon}</div>
              <div style={{ fontSize:"16px",fontWeight:"600",marginBottom:"8px" }}>{f.title}</div>
              <div style={{ fontSize:"14px",color:"rgba(255,255,255,0.5)",lineHeight:"1.6" }}>{f.desc}</div>
            </div>
          ))}
        </div>
      </section>

      <section style={{ padding:"80px 60px",textAlign:"center",background:"radial-gradient(ellipse at center, rgba(124,58,237,0.12) 0%, transparent 60%)" }}>
        <h2 style={{ fontSize:"42px",fontWeight:"800",marginBottom:"16px" }}>Ready to Talk?</h2>
        <p style={{ color:"rgba(255,255,255,0.5)",marginBottom:"40px" }}>No signup needed. Start your free 2-minute voice call right now.</p>
        <button onClick={onCall} style={{ padding:"20px 60px",background:"linear-gradient(135deg,#7c3aed,#4f46e5)",border:"none",borderRadius:"14px",color:"#fff",fontSize:"18px",fontWeight:"800",cursor:"pointer",boxShadow:"0 0 60px rgba(124,58,237,0.5)" }}>
          🎤 Start Free Call Now
        </button>
        <p style={{ color:"rgba(255,255,255,0.25)",marginTop:"16px",fontSize:"13px" }}>2 minutes free · No credit card · No signup</p>
      </section>

      <footer style={{ padding:"40px 60px",borderTop:"1px solid rgba(255,255,255,0.06)",display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:"16px" }}>
        <div style={{ display:"flex",alignItems:"center",gap:"10px" }}>
          <MahaLogo size={28}/>
          <span style={{ fontWeight:"700",fontSize:"18px",letterSpacing:"-1px" }}>Maha<span style={{ color:"#a78bfa" }}>.ai</span></span>
        </div>
        <div style={{ color:"rgba(255,255,255,0.3)",fontSize:"13px" }}>© 2026 Maha.ai · Your Universe, Your AI</div>
        <div style={{ display:"flex",gap:"24px" }}>
          {["Privacy","Terms","Contact"].map(item=>(
            <a key={item} href="#" style={{ color:"rgba(255,255,255,0.3)",fontSize:"13px",textDecoration:"none" }}>{item}</a>
          ))}
        </div>
      </footer>
    </div>
  );
}

// ── FREE CALL ──────────────────────────────────────────────────────────────────
function FreeCall({ onBack }) {
  const [phase, setPhase] = useState("start");
  const [orbMode, setOrbMode] = useState("idle");
  const [timeLeft, setTimeLeft] = useState(120);
  const [statusText, setStatusText] = useState("Tap to start your free call");
  const socketRef = useRef(null);
  const recognitionRef = useRef(null);
  const isSpeakingRef = useRef(false);
  const silenceTimerRef = useRef(null);
  const finalTranscriptRef = useRef("");
  const timerRef = useRef(null);
  const isActiveRef = useRef(false);

  const orbColors = {
    idle:     { bg: "radial-gradient(circle at 35% 30%, #ddd6fe, #7c3aed 50%, #1e1b4b)", shadow: "0 0 80px 30px rgba(124,58,237,0.6)" },
    listening:{ bg: "radial-gradient(circle at 35% 30%, #bbf7d0, #16a34a 50%, #052e16)", shadow: "0 0 80px 30px rgba(22,163,74,0.7)" },
    thinking: { bg: "radial-gradient(circle at 35% 30%, #fef08a, #d97706 50%, #451a03)", shadow: "0 0 80px 30px rgba(217,119,6,0.7)" },
    speaking: { bg: "radial-gradient(circle at 35% 30%, #f9a8d4, #ec4899 50%, #500724)", shadow: "0 0 80px 30px rgba(236,72,153,0.8)" },
  };

  const speakText = (text, onDone) => {
  window.speechSynthesis.cancel();
  setTimeout(() => {
    const u = new SpeechSynthesisUtterance(text);
    u.rate = 0.88;
    u.pitch = 1.1;
    u.volume = 1;
    isSpeakingRef.current = true;
    setOrbMode("speaking");
    setStatusText("Maha is speaking...");
    u.onend = () => {
      isSpeakingRef.current = false;
      if (onDone) onDone();
    };
    u.onerror = () => {
      isSpeakingRef.current = false;
      if (onDone) onDone();
    };
    const voices = window.speechSynthesis.getVoices();
    const voice = voices.find(v =>
      v.lang.includes("en-IN") ||
      v.name.toLowerCase().includes("zira") ||
      v.name.toLowerCase().includes("heera")
    );
    if (voice) u.voice = voice;
    window.speechSynthesis.speak(u);
    const timeout = Math.max(text.length * 70, 3000);
    setTimeout(() => {
      if (isSpeakingRef.current) {
        isSpeakingRef.current = false;
        window.speechSynthesis.cancel();
        if (onDone) onDone();
      }
    }, timeout);
  }, 200);
};

  const stopSpeaking = () => {
    if (isSpeakingRef.current) {
      window.speechSynthesis.cancel();
      isSpeakingRef.current = false;
    }
  };

  const startContinuousListening = () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return;
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch(e) {}
    }

    const rec = new SR();
    rec.continuous = true;
    rec.interimResults = true;
    rec.lang = "en-IN";
    finalTranscriptRef.current = "";

    rec.onresult = (e) => {
      if (isSpeakingRef.current) {
        stopSpeaking();
        setOrbMode("listening");
        setStatusText("Listening...");
      }
      let final = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        if (e.results[i].isFinal) final += e.results[i][0].transcript + " ";
      }
      if (final.trim()) {
        finalTranscriptRef.current += final;
        clearTimeout(silenceTimerRef.current);
        silenceTimerRef.current = setTimeout(() => {
          const msg = finalTranscriptRef.current.trim();
          if (msg && socketRef.current && isActiveRef.current) {
            finalTranscriptRef.current = "";
            setOrbMode("thinking");
            setStatusText("Thinking...");
            socketRef.current.emit("voice_message", { text: msg });
          }
        }, 1300);
      }
    };

    rec.onerror = (e) => {
      if (e.error !== "no-speech" && e.error !== "aborted") {
        setTimeout(() => {
          if (isActiveRef.current) startContinuousListening();
        }, 500);
      }
    };

    rec.onend = () => {
      if (isActiveRef.current && !isSpeakingRef.current) {
        setTimeout(() => {
          if (isActiveRef.current) startContinuousListening();
        }, 300);
      }
    };

    try { rec.start(); recognitionRef.current = rec; } catch(e) {}
  };

  const startCall = () => {
    if (phase !== "start") return;
    setPhase("connecting");
    setStatusText("Connecting to Maha...");
    setOrbMode("thinking");

   const sock = io("https://maha-ai-4qbe.onrender.com", { transports: ["websocket", "polling"] });
    socketRef.current = sock;

    sock.on("connect", () => {
      setPhase("active");
      isActiveRef.current = true;
      timerRef.current = setInterval(() => {
        setTimeLeft(t => {
          if (t <= 1) { clearInterval(timerRef.current); endCall(); return 0; }
          return t - 1;
        });
      }, 1000);
      sock.emit("start_call", { userName: "Friend" });
    });

    sock.on("ai_response", (data) => {
  if (data.audio) {
    // Play Sarvam/ElevenLabs audio
    setOrbMode("speaking");
    setStatusText("Maha is speaking...");
    const audioData = atob(data.audio);
    const arrayBuffer = new ArrayBuffer(audioData.length);
    const uint8Array = new Uint8Array(arrayBuffer);
    for (let i = 0; i < audioData.length; i++) {
      uint8Array[i] = audioData.charCodeAt(i);
    }
    const blob = new Blob([uint8Array], { type: "audio/wav" });
    const url = URL.createObjectURL(blob);
    const audio = new Audio(url);
    isSpeakingRef.current = true;
    audio.onended = () => {
      URL.revokeObjectURL(url);
      isSpeakingRef.current = false;
      if (isActiveRef.current) {
        setOrbMode("listening");
        setStatusText("Listening...");
        startContinuousListening();
      }
    };
    audio.play().catch(() => {
      // Fallback to browser TTS
      speakText(data.text, () => {
        if (isActiveRef.current) startContinuousListening();
      });
    });
  } else if (data.text) {
    speakText(data.text, () => {
      if (isActiveRef.current) startContinuousListening();
    });
  }
});
    sock.on("status", (data) => {
      if (data.state !== "speaking") setStatusText(data.message);
    });

    sock.on("connect_error", () => {
      setStatusText("Connection failed. Is Flask running?");
      setPhase("start");
      setOrbMode("idle");
    });
  };

  const endCall = () => {
    isActiveRef.current = false;
    stopSpeaking();
    clearTimeout(silenceTimerRef.current);
    clearInterval(timerRef.current);
    if (recognitionRef.current) { try { recognitionRef.current.stop(); } catch(e) {} }
    if (socketRef.current) socketRef.current.disconnect();
    setPhase("ended");
    setOrbMode("idle");
  };

  useEffect(() => {
    return () => {
      isActiveRef.current = false;
      stopSpeaking();
      clearInterval(timerRef.current);
      if (recognitionRef.current) { try { recognitionRef.current.stop(); } catch(e) {} }
      if (socketRef.current) socketRef.current.disconnect();
    };
  }, []);

  const mins = Math.floor(timeLeft / 60);
  const secs = timeLeft % 60;

  return (
    <div style={{ minHeight: "100vh", background: "#000008", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "#fff", fontFamily: "'Inter', sans-serif", position: "relative", overflow: "hidden" }}>
      <style>{STYLES}</style>

      {/* Background glow */}
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(ellipse at center, ${orbMode === "listening" ? "rgba(22,163,74,0.08)" : orbMode === "thinking" ? "rgba(217,119,6,0.08)" : orbMode === "speaking" ? "rgba(236,72,153,0.08)" : "rgba(124,58,237,0.08)"} 0%, transparent 70%)`, transition: "background 0.5s ease", pointerEvents: "none" }} />

      {/* Back button */}
      <button onClick={() => { endCall(); onBack(); }} style={{ position: "absolute", top: "24px", left: "24px", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", color: "rgba(255,255,255,0.5)", cursor: "pointer", fontSize: "13px", padding: "8px 14px" }}>← Back</button>

      {/* Timer */}
      {phase === "active" && (
        <div style={{ position: "absolute", top: "24px", right: "24px", fontSize: "18px", fontWeight: "200", color: timeLeft < 30 ? "#ef4444" : "rgba(255,255,255,0.4)", fontVariantNumeric: "tabular-nums" }}>
          {mins}:{secs.toString().padStart(2, "0")}
        </div>
      )}

      {/* Ended */}
      {phase === "ended" && (
        <div style={{ textAlign: "center", animation: "fadeIn 0.5s ease", zIndex: 2 }}>
          <div style={{ fontSize: "52px", marginBottom: "20px" }}>📞</div>
          <h2 style={{ fontSize: "26px", fontWeight: "700", marginBottom: "10px" }}>Call Ended</h2>
          <p style={{ color: "rgba(255,255,255,0.4)", marginBottom: "40px", fontSize: "14px" }}>Your free trial has ended. Sign up to continue!</p>
          <div style={{ display: "flex", gap: "14px", justifyContent: "center" }}>
            <button style={{ padding: "14px 36px", background: "linear-gradient(135deg,#7c3aed,#4f46e5)", border: "none", borderRadius: "10px", color: "#fff", fontSize: "15px", fontWeight: "700", cursor: "pointer" }}>Sign Up Free</button>
            <button onClick={onBack} style={{ padding: "14px 36px", background: "transparent", border: "1px solid rgba(255,255,255,0.15)", borderRadius: "10px", color: "#fff", fontSize: "15px", cursor: "pointer" }}>Go Back</button>
          </div>
        </div>
      )}

      {/* Active call + Start */}
      {phase !== "ended" && (
        <div style={{ textAlign: "center", zIndex: 2 }}>

          {/* Logo */}
          <div style={{ marginBottom: "32px" }}>
            <div style={{ fontSize: "13px", color: "rgba(255,255,255,0.3)", letterSpacing: "4px", textTransform: "uppercase" }}>
              {phase === "start" ? "FREE TRIAL CALL" : phase === "connecting" ? "CONNECTING..." : "LIVE CALL"}
            </div>
          </div>

          {/* ORB */}
          <div style={{ position: "relative", width: "240px", height: "240px", margin: "0 auto 40px", cursor: phase === "start" ? "pointer" : "default" }} onClick={phase === "start" ? startCall : undefined}>

            {/* Pulse rings */}
            {(phase === "active") && [1,2,3].map(i => (
              <div key={i} style={{ position: "absolute", top: "50%", left: "50%", width: "240px", height: "240px", borderRadius: "50%", border: `1px solid ${orbMode === "listening" ? "rgba(22,163,74,0.4)" : orbMode === "speaking" ? "rgba(236,72,153,0.4)" : "rgba(124,58,237,0.3)"}`, animation: `pulse ${1.5+i*0.4}s ease-out infinite`, animationDelay: `${i*0.3}s` }} />
            ))}

            {/* Main orb */}
            <div style={{ width: "240px", height: "240px", borderRadius: "50%", background: orbColors[orbMode].bg, boxShadow: orbColors[orbMode].shadow, display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", animation: "orbFloat 4s ease-in-out infinite", position: "relative", transition: "background 0.4s ease, box-shadow 0.4s ease" }}>
              <div style={{ position: "absolute", inset: 0, borderRadius: "50%", background: "radial-gradient(circle at 30% 25%, rgba(255,255,255,0.3) 0%, transparent 50%)" }} />
              {["bar1","bar2","bar3","bar4","bar3","bar2","bar1"].map((anim, i) => (
                <div key={i} style={{ width: "5px", borderRadius: "4px", background: "linear-gradient(to top, rgba(255,255,255,0.4), rgba(255,255,255,1))", animation: `${anim} ${(phase === "active" && orbMode !== "idle") ? 0.4+i*0.04 : 0.7+i*0.1}s ease-in-out infinite`, animationDelay: `${i*0.08}s`, zIndex: 1 }} />
              ))}
            </div>
          </div>

          {/* Status */}
          <div style={{ fontSize: "14px", color: "rgba(255,255,255,0.5)", letterSpacing: "2px", textTransform: "uppercase", marginBottom: "32px", minHeight: "20px", transition: "all 0.3s" }}>
            {statusText}
          </div>

          {/* Start button */}
          {phase === "start" && (
            <div>
              <button onClick={startCall} style={{ padding: "18px 56px", background: "linear-gradient(135deg,#7c3aed,#4f46e5)", border: "none", borderRadius: "50px", color: "#fff", fontSize: "16px", fontWeight: "700", cursor: "pointer", boxShadow: "0 0 40px rgba(124,58,237,0.5)", letterSpacing: "1px" }}>
                📞 Start Free Call
              </button>
              <p style={{ color: "rgba(255,255,255,0.2)", fontSize: "12px", marginTop: "14px" }}>2 minutes free · No signup · Real AI voice</p>
            </div>
          )}

          {/* End call button */}
          {phase === "active" && (
            <button onClick={endCall} style={{ padding: "14px 40px", background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.4)", borderRadius: "50px", color: "#f87171", fontSize: "14px", cursor: "pointer", transition: "all 0.2s" }}
              onMouseEnter={e => e.currentTarget.style.background = "rgba(239,68,68,0.3)"}
              onMouseLeave={e => e.currentTarget.style.background = "rgba(239,68,68,0.15)"}>
              📵 End Call
            </button>
          )}

          {/* Color legend */}
          {phase === "active" && (
            <div style={{ display: "flex", gap: "20px", justifyContent: "center", marginTop: "32px" }}>
              {[{ color: "#a78bfa", label: "Idle" }, { color: "#4ade80", label: "Listening" }, { color: "#fbbf24", label: "Thinking" }, { color: "#f472b6", label: "Speaking" }].map(s => (
                <div key={s.label} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: s.color, boxShadow: `0 0 6px ${s.color}` }} />
                  <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.25)" }}>{s.label}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
// ── SIGN UP ──────────────────────────────────────────────────────────────────
function SignUp({ onBack, onSuccess }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = () => {
    if (!name || !email || !password) { alert("Fill all fields!"); return; }
    const user = { name, email };
    localStorage.setItem("mahaUser", JSON.stringify(user));
    onSuccess(user);
  };

  return (
    <div style={{ minHeight:"100vh", background:"#000", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"'Inter',sans-serif" }}>
      <style>{STYLES}</style>
      <div style={{ width:"100%", maxWidth:"400px", padding:"40px", background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:"20px" }}>
        <div style={{ display:"flex", alignItems:"center", gap:"10px", marginBottom:"32px" }}>
          <MahaLogo size={32}/>
          <span style={{ fontSize:"20px", fontWeight:"800", color:"#fff", letterSpacing:"-1px" }}>Maha<span style={{ color:"#a78bfa" }}>.ai</span></span>
        </div>
        <h2 style={{ color:"#fff", fontSize:"24px", fontWeight:"700", marginBottom:"8px" }}>Create account</h2>
        <p style={{ color:"rgba(255,255,255,0.4)", fontSize:"14px", marginBottom:"28px" }}>Join Maha.ai for free</p>
        {[
          { label:"Your Name", value:name, set:setName, placeholder:"Enter your name", type:"text" },
          { label:"Email", value:email, set:setEmail, placeholder:"Enter your email", type:"email" },
          { label:"Password", value:password, set:setPassword, placeholder:"Create a password", type:"password" },
        ].map(f => (
          <div key={f.label} style={{ marginBottom:"16px" }}>
            <div style={{ color:"rgba(255,255,255,0.5)", fontSize:"12px", marginBottom:"6px" }}>{f.label}</div>
            <input type={f.type} value={f.value} onChange={e=>f.set(e.target.value)} placeholder={f.placeholder}
              style={{ width:"100%", padding:"12px 14px", background:"rgba(255,255,255,0.06)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:"10px", color:"#fff", fontSize:"14px", outline:"none", boxSizing:"border-box" }}/>
          </div>
        ))}
        <button onClick={handleSubmit} style={{ width:"100%", padding:"13px", background:"linear-gradient(135deg,#7c3aed,#4f46e5)", border:"none", borderRadius:"10px", color:"#fff", fontSize:"15px", fontWeight:"700", cursor:"pointer", marginTop:"8px" }}>
          Create Account
        </button>
        <div style={{ textAlign:"center", marginTop:"20px", color:"rgba(255,255,255,0.3)", fontSize:"13px" }}>
          Already have an account?{" "}
          <span onClick={onBack} style={{ color:"#a78bfa", cursor:"pointer" }}>Sign In</span>
        </div>
        <button onClick={onBack} style={{ width:"100%", padding:"10px", background:"transparent", border:"none", color:"rgba(255,255,255,0.25)", fontSize:"13px", cursor:"pointer", marginTop:"12px" }}>← Back</button>
      </div>
    </div>
  );
}

// ── SIGN IN ──────────────────────────────────────────────────────────────────
function SignIn({ onBack, onSuccess }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = () => {
    if (!email || !password) { alert("Fill all fields!"); return; }
    const user = { name: email.split("@")[0], email };
    localStorage.setItem("mahaUser", JSON.stringify(user));
    onSuccess(user);
  };

  return (
    <div style={{ minHeight:"100vh", background:"#000", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"'Inter',sans-serif" }}>
      <style>{STYLES}</style>
      <div style={{ width:"100%", maxWidth:"400px", padding:"40px", background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:"20px" }}>
        <div style={{ display:"flex", alignItems:"center", gap:"10px", marginBottom:"32px" }}>
          <MahaLogo size={32}/>
          <span style={{ fontSize:"20px", fontWeight:"800", color:"#fff", letterSpacing:"-1px" }}>Maha<span style={{ color:"#a78bfa" }}>.ai</span></span>
        </div>
        <h2 style={{ color:"#fff", fontSize:"24px", fontWeight:"700", marginBottom:"8px" }}>Welcome back</h2>
        <p style={{ color:"rgba(255,255,255,0.4)", fontSize:"14px", marginBottom:"28px" }}>Sign in to Maha.ai</p>
        {[
          { label:"Email", value:email, set:setEmail, placeholder:"Enter your email", type:"email" },
          { label:"Password", value:password, set:setPassword, placeholder:"Enter your password", type:"password" },
        ].map(f => (
          <div key={f.label} style={{ marginBottom:"16px" }}>
            <div style={{ color:"rgba(255,255,255,0.5)", fontSize:"12px", marginBottom:"6px" }}>{f.label}</div>
            <input type={f.type} value={f.value} onChange={e=>f.set(e.target.value)} placeholder={f.placeholder}
              style={{ width:"100%", padding:"12px 14px", background:"rgba(255,255,255,0.06)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:"10px", color:"#fff", fontSize:"14px", outline:"none", boxSizing:"border-box" }}/>
          </div>
        ))}
        <button onClick={handleSubmit} style={{ width:"100%", padding:"13px", background:"linear-gradient(135deg,#7c3aed,#4f46e5)", border:"none", borderRadius:"10px", color:"#fff", fontSize:"15px", fontWeight:"700", cursor:"pointer", marginTop:"8px" }}>
          Sign In
        </button>
        <button onClick={onBack} style={{ width:"100%", padding:"10px", background:"transparent", border:"none", color:"rgba(255,255,255,0.25)", fontSize:"13px", cursor:"pointer", marginTop:"12px" }}>← Back</button>
      </div>
    </div>
  );
}
export default App;