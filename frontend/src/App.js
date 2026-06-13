import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";

const BACKEND = "https://maha-ai-4qbe.onrender.com";

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
  @keyframes pulseRing { 0%{transform:scale(1);opacity:0.6} 100%{transform:scale(1.8);opacity:0} }
  ::-webkit-scrollbar{width:4px} ::-webkit-scrollbar-track{background:transparent} ::-webkit-scrollbar-thumb{background:rgba(124,58,237,0.3);border-radius:2px}
`;

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
  if(screen==="call") return <FreeCall onBack={()=>setScreen("landing")} onSignUp={()=>setScreen("signup")}/>;
  if(screen==="signup") return <SignUp onBack={()=>setScreen("landing")} onSuccess={handleLogin}/>;
  if(screen==="signin") return <SignIn onBack={()=>setScreen("landing")} onSuccess={handleLogin}/>;
  return <Landing onCall={()=>setScreen("call")} onSignUp={()=>setScreen("signup")} onSignIn={()=>setScreen("signin")}/>;
}

function MainApp({ user, onLogout }) {
  const [conversations, setConversations] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);
  const [orbMode, setOrbMode] = useState("idle");
  const [selectedLang, setSelectedLang] = useState("Telugu");
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

  const newChat = () => { const id = Date.now().toString(); setActiveId(id); setMessages([]); };
  const loadConversation = (conv) => { setActiveId(conv.id); setMessages(conv.messages); };
  const deleteConversation = (id, e) => {
    e.stopPropagation();
    const updated = conversations.filter(c=>c.id!==id);
    setConversations(updated);
    localStorage.setItem("mahaHistory",JSON.stringify(updated));
    if(activeId===id){ setActiveId(null); setMessages([]); }
  };

  const sendMessage = async (text) => {
    if(!text?.trim()) return;
    const userMsg = {id:Date.now(), text, sender:"user"};
    const newMsgs = [...messages, userMsg];
    setMessages(newMsgs); setInput(""); setLoading(true); setOrbMode("thinking");
    try {
      const res = await fetch(`${BACKEND}/chat`,{
        method:"POST", headers:{"Content-Type":"application/json"},
        body:JSON.stringify({
          message:text,
          language:selectedLang,
          persona:"Maha",
          userName:user?.name,
          history:messages.map(m=>({role:m.sender==="user"?"user":"assistant", content:m.text}))
        })
      });
      const data = await res.json();
      const aiMsg = {id:Date.now()+1, text:data.reply, sender:"ai"};
      const finalMsgs = [...newMsgs, aiMsg];
      setMessages(finalMsgs);
      setOrbMode("idle");
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
    rec.lang = selectedLang==="Telugu"?"te-IN":selectedLang==="Hindi"?"hi-IN":selectedLang==="Tamil"?"ta-IN":selectedLang==="Kannada"?"kn-IN":selectedLang==="Malayalam"?"ml-IN":"en-IN";
    rec.onstart = ()=>{ setListening(true); setOrbMode("listening"); };
    rec.onresult = e=>{ const t=e.results[0][0].transcript; setListening(false); setOrbMode("thinking"); sendMessage(t); };
    rec.onerror = ()=>{ setListening(false); setOrbMode("idle"); };
    rec.onend = ()=>{ setListening(false); setOrbMode("idle"); };
    rec.start();
  };

  return (
    <div style={{ display:"flex",height:"100vh",background:"#000",color:"#fff",fontFamily:"'Inter',sans-serif",overflow:"hidden" }}>
      <style>{STYLES}</style>
      <div style={{ width:"260px",background:"rgba(255,255,255,0.025)",borderRight:"1px solid rgba(255,255,255,0.06)",display:"flex",flexDirection:"column",flexShrink:0 }}>
        <div style={{ padding:"20px 16px",borderBottom:"1px solid rgba(255,255,255,0.06)" }}>
          <div style={{ display:"flex",alignItems:"center",gap:"10px",marginBottom:"16px" }}>
            <MahaLogo size={32}/>
            <span style={{ fontSize:"18px",fontWeight:"800",letterSpacing:"-1px" }}>Maha<span style={{ color:"#a78bfa" }}>.ai</span></span>
          </div>
          <button onClick={newChat} style={{ width:"100%",padding:"11px",background:"linear-gradient(135deg,#7c3aed,#4f46e5)",border:"none",borderRadius:"10px",color:"#fff",fontSize:"13px",fontWeight:"600",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:"8px" }}>
            ✏️ New Chat
          </button>
        </div>

        {/* Chat / Free Call toggle */}
        <div style={{ padding:"12px 16px",display:"flex",gap:"6px",borderBottom:"1px solid rgba(255,255,255,0.06)" }}>
          {[{k:"chat",icon:"💬",label:"Chat"},{k:"voice",icon:"📞",label:"Free Call"}].map(v=>(
            <button key={v.k} onClick={()=>setView(v.k)} style={{ flex:1,padding:"8px",background:view===v.k?"rgba(124,58,237,0.3)":"rgba(255,255,255,0.04)",border:`1px solid ${view===v.k?"rgba(124,58,237,0.5)":"rgba(255,255,255,0.08)"}`,borderRadius:"8px",color:view===v.k?"#c4b5fd":"rgba(255,255,255,0.45)",fontSize:"12px",fontWeight:"600",cursor:"pointer",transition:"all 0.2s" }}>
              {v.icon} {v.label}
            </button>
          ))}
        </div>

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
                onMouseLeave={e=>e.currentTarget.style.color="rgba(255,255,255,0.25)"}>🗑️</button>
            </div>
          ))}
        </div>

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
            onMouseLeave={e=>e.currentTarget.style.background="rgba(239,68,68,0.08)"}>Sign Out</button>
        </div>
      </div>

      <div style={{ flex:1,display:"flex",flexDirection:"column",overflow:"hidden",background:"radial-gradient(ellipse at top right, rgba(124,58,237,0.06) 0%, transparent 50%)" }}>
        <div style={{ padding:"14px 24px",borderBottom:"1px solid rgba(255,255,255,0.06)",display:"flex",alignItems:"center",justifyContent:"space-between",background:"rgba(0,0,0,0.4)",backdropFilter:"blur(20px)" }}>
          <div>
            <div style={{ fontSize:"15px",fontWeight:"600",color:"#fff" }}>
              {view==="voice"?"Free Call":conversations.find(c=>c.id===activeId)?.title||"New Conversation"}
            </div>
            <div style={{ fontSize:"11px",color:"rgba(255,255,255,0.3)",marginTop:"2px" }}>
              {orbMode==="idle"?"● Maha is ready":orbMode==="listening"?"🎤 Listening...":orbMode==="thinking"?"💭 Thinking...":"🔊 Speaking..."}
            </div>
          </div>
          {view==="chat"&&(
            <select value={selectedLang} onChange={e=>setSelectedLang(e.target.value)} style={{ padding:"8px 12px",background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:"8px",color:"#fff",fontSize:"13px",cursor:"pointer",outline:"none" }}>
              {["Telugu","English","Hindi","Tamil","Kannada","Malayalam","Marathi","Bengali","Gujarati","Punjabi"].map(l=>(
                <option key={l} value={l} style={{ background:"#1a1a2e" }}>{l}</option>
              ))}
            </select>
          )}
        </div>

        {/* CHAT VIEW */}
        {view==="chat"&&(
          <>
            <div style={{ flex:1,overflowY:"auto",padding:"24px",display:"flex",flexDirection:"column",gap:"14px" }}>
              {messages.length===0&&(
                <div style={{ textAlign:"center",marginTop:"60px",animation:"fadeIn 0.6s ease" }}>
                  <MahaLogo size={56}/>
                  <div style={{ fontSize:"22px",fontWeight:"700",color:"#fff",marginTop:"20px",marginBottom:"8px" }}>Hello, {user?.name||"Friend"}! 👋</div>
                  <div style={{ color:"rgba(255,255,255,0.4)",fontSize:"15px",marginBottom:"32px" }}>How can Maha help you today?</div>
                  <div style={{ display:"flex",gap:"10px",justifyContent:"center",flexWrap:"wrap" }}>
                    {["Ela unnanu?","Tell me about yourself","Oka recipe chepu","Naa kosam emi cheyagalavu?"].map(s=>(
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

        {/* FREE CALL VIEW - replaces Voice tab */}
        {view==="voice"&&(
          <FreeCall onBack={()=>setView("chat")} onSignUp={()=>{}} embedded={true}/>
        )}
      </div>
    </div>
  );
}

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
        <p style={{ color:"rgba(255,255,255,0.5)",marginBottom:"40px" }}>No signup needed. Start your free voice call right now.</p>
        <button onClick={onCall} style={{ padding:"20px 60px",background:"linear-gradient(135deg,#7c3aed,#4f46e5)",border:"none",borderRadius:"14px",color:"#fff",fontSize:"18px",fontWeight:"800",cursor:"pointer",boxShadow:"0 0 60px rgba(124,58,237,0.5)" }}>
          🎤 Start Free Call Now
        </button>
        <p style={{ color:"rgba(255,255,255,0.25)",marginTop:"16px",fontSize:"13px" }}>No time limit · No credit card · No signup needed</p>
      </section>

      <footer style={{ padding:"40px 60px",borderTop:"1px solid rgba(255,255,255,0.06)",display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:"16px" }}>
        <div style={{ display:"flex",alignItems:"center",gap:"10px" }}>
          <MahaLogo size={28}/>
          <span style={{ fontWeight:"700",fontSize:"18px",letterSpacing:"-1px" }}>Maha<span style={{ color:"#a78bfa" }}>.ai</span></span>
        </div>
        <div style={{ color:"rgba(255,255,255,0.3)",fontSize:"13px" }}>© 2026 Maha.ai · Your Universe, Your AI</div>
        <div style={{ display:"flex",gap:"24px" }}>
          {["Privacy","Terms","Contact"].map(item=>(
            <a key={item} href="/" style={{ color:"rgba(255,255,255,0.3)",fontSize:"13px",textDecoration:"none" }}>{item}</a>
          ))}
        </div>
      </footer>
    </div>
  );
}

// FREE CALL - No time limit, works on landing and inside app
function FreeCall({ onBack, onSignUp, embedded = false }) {
  const [phase, setPhase] = useState("start");
  const [orbMode, setOrbMode] = useState("idle");
  const [statusText, setStatusText] = useState("Tap to start your call");
  const [errorText, setErrorText] = useState("");
  const socketRef = useRef(null);
  const recognitionRef = useRef(null);
  const isSpeakingRef = useRef(false);
  const silenceTimerRef = useRef(null);
  const finalTranscriptRef = useRef("");
  const isActiveRef = useRef(false);
  const audioRef = useRef(null);

  const orbColors = {
    idle:     { bg: "radial-gradient(circle at 35% 30%, #ddd6fe, #7c3aed 50%, #1e1b4b)", shadow: "0 0 80px 30px rgba(124,58,237,0.6)" },
    listening:{ bg: "radial-gradient(circle at 35% 30%, #bbf7d0, #16a34a 50%, #052e16)", shadow: "0 0 80px 30px rgba(22,163,74,0.7)" },
    thinking: { bg: "radial-gradient(circle at 35% 30%, #fef08a, #d97706 50%, #451a03)", shadow: "0 0 80px 30px rgba(217,119,6,0.7)" },
    speaking: { bg: "radial-gradient(circle at 35% 30%, #f9a8d4, #ec4899 50%, #500724)", shadow: "0 0 80px 30px rgba(236,72,153,0.8)" },
  };

  const stopSpeaking = () => {
    window.speechSynthesis?.cancel();
    if(audioRef.current){ audioRef.current.pause(); audioRef.current = null; }
    isSpeakingRef.current = false;
  };

  const speakText = (text, onDone) => {
    window.speechSynthesis?.cancel();
    setTimeout(() => {
      const u = new SpeechSynthesisUtterance(text);
      u.rate = 0.88; u.pitch = 1.1; u.volume = 1;
      isSpeakingRef.current = true;
      setOrbMode("speaking");
      setStatusText("Maha is speaking...");
      u.onend = () => { isSpeakingRef.current = false; onDone?.(); };
      u.onerror = () => { isSpeakingRef.current = false; onDone?.(); };
      const voices = window.speechSynthesis?.getVoices() || [];
      const voice = voices.find(v => v.lang.includes("te-IN")) || voices.find(v => v.lang.includes("en-IN")) || voices[0];
      if(voice) u.voice = voice;
      window.speechSynthesis?.speak(u);
      setTimeout(() => {
        if(isSpeakingRef.current){ window.speechSynthesis?.cancel(); isSpeakingRef.current = false; onDone?.(); }
      }, Math.max(text.length * 80, 4000));
    }, 150);
  };

  const playSarvamAudio = (b64, text, onDone) => {
    try {
      const bytes = atob(b64);
      const buf = new ArrayBuffer(bytes.length);
      const view = new Uint8Array(buf);
      for(let i=0;i<bytes.length;i++) view[i]=bytes.charCodeAt(i);
      const blob = new Blob([buf], {type:"audio/wav"});
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      audioRef.current = audio;
      isSpeakingRef.current = true;
      audio.onended = () => { URL.revokeObjectURL(url); audioRef.current=null; isSpeakingRef.current=false; onDone?.(); };
      audio.onerror = () => { URL.revokeObjectURL(url); audioRef.current=null; isSpeakingRef.current=false; speakText(text, onDone); };
      audio.play().catch(() => speakText(text, onDone));
    } catch(e) { speakText(text, onDone); }
  };

  const startContinuousListening = () => {
    if(!isActiveRef.current) return;
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if(!SR){ setErrorText("Use Chrome for voice!"); return; }
    try{ recognitionRef.current?.abort(); }catch(e){}
    const rec = new SR();
    rec.lang = "te-IN";
    rec.continuous = true;
    rec.interimResults = true;
    finalTranscriptRef.current = "";
    rec.onstart = () => { setOrbMode("listening"); setStatusText("Listening..."); };
    rec.onresult = (e) => {
      if(isSpeakingRef.current){ stopSpeaking(); setOrbMode("listening"); setStatusText("Listening..."); }
      let final = "";
      for(let i=e.resultIndex;i<e.results.length;i++){
        if(e.results[i].isFinal) final += e.results[i][0].transcript + " ";
      }
      if(final.trim()){
        finalTranscriptRef.current += final;
        clearTimeout(silenceTimerRef.current);
        silenceTimerRef.current = setTimeout(() => {
          const msg = finalTranscriptRef.current.trim();
          if(msg && socketRef.current?.connected && isActiveRef.current){
            finalTranscriptRef.current = "";
            setOrbMode("thinking");
            setStatusText("Maha is thinking...");
            socketRef.current.emit("voice_message", { text: msg, lang: "te" });
          }
        }, 1000);
      }
    };
    rec.onerror = (e) => {
      if(e.error !== "no-speech" && e.error !== "aborted")
        setTimeout(()=>{ if(isActiveRef.current) startContinuousListening(); }, 600);
    };
    rec.onend = () => {
      if(isActiveRef.current && !isSpeakingRef.current)
        setTimeout(()=>{ if(isActiveRef.current) startContinuousListening(); }, 300);
    };
    try{ rec.start(); recognitionRef.current = rec; }catch(e){}
  };

  const startCall = () => {
    if(phase !== "start") return;
    setPhase("connecting");
    setOrbMode("thinking");
    setStatusText("Connecting to Maha...");
    setErrorText("");

    const sock = io(BACKEND, { transports: ["polling"], reconnection: false, timeout: 8000 });
    socketRef.current = sock;

    sock.on("connect", () => {
      isActiveRef.current = true;
      setPhase("active");
      setStatusText("Connected!");
      sock.emit("start_call", { userName: "Friend", lang: "te" });
    });

    sock.on("ai_response", (data) => {
      if(!isActiveRef.current) return;
      const afterSpoken = () => {
        if(isActiveRef.current){ setOrbMode("listening"); startContinuousListening(); }
      };
      setOrbMode("speaking");
      setStatusText("Maha is speaking...");
      if(data.audio) playSarvamAudio(data.audio, data.text || "", afterSpoken);
      else if(data.text) speakText(data.text, afterSpoken);
    });

    sock.on("connect_error", () => {
      setPhase("start"); setOrbMode("idle");
      setStatusText("Tap to start your call");
      setErrorText("⚠️ Cannot connect. Make sure Flask is running on port 5000.");
    });

    sock.on("disconnect", () => {
      if(isActiveRef.current){ setErrorText("Connection lost."); endCall(); }
    });
  };

  const endCall = () => {
    isActiveRef.current = false;
    stopSpeaking();
    clearTimeout(silenceTimerRef.current);
    try{ recognitionRef.current?.abort(); }catch(e){}
    socketRef.current?.disconnect();
    setPhase("ended");
    setOrbMode("idle");
  };

  useEffect(() => {
    return () => {
      isActiveRef.current = false;
      stopSpeaking();
      try{ recognitionRef.current?.abort(); }catch(e){}
      socketRef.current?.disconnect();
    };
  }, []);

  const containerStyle = embedded
    ? { flex:1, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", background:"#000008", color:"#fff", fontFamily:"'Inter',sans-serif", position:"relative", overflow:"hidden", padding:"20px" }
    : { minHeight:"100vh", background:"#000008", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", color:"#fff", fontFamily:"'Inter',sans-serif", position:"relative", overflow:"hidden" };

  return (
    <div style={containerStyle}>
      <style>{STYLES}</style>
      <div style={{ position:"absolute",inset:0,pointerEvents:"none",background:
        orbMode==="listening"?"radial-gradient(ellipse at center, rgba(22,163,74,0.09) 0%, transparent 65%)":
        orbMode==="thinking"?"radial-gradient(ellipse at center, rgba(217,119,6,0.09) 0%, transparent 65%)":
        orbMode==="speaking"?"radial-gradient(ellipse at center, rgba(236,72,153,0.09) 0%, transparent 65%)":
        "radial-gradient(ellipse at center, rgba(124,58,237,0.08) 0%, transparent 65%)",transition:"background 0.6s ease"
      }}/>

      {!embedded && (
        <button onClick={()=>{ endCall(); onBack(); }} style={{ position:"absolute",top:24,left:24,background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:8,color:"rgba(255,255,255,.5)",cursor:"pointer",fontSize:13,padding:"8px 14px" }}>← Back</button>
      )}

      {phase==="ended" && (
        <div style={{ textAlign:"center",animation:"fadeIn .5s ease",zIndex:2 }}>
          <div style={{ fontSize:52,marginBottom:20 }}>📞</div>
          <h2 style={{ fontSize:26,fontWeight:700,marginBottom:10 }}>Call Ended</h2>
          <p style={{ color:"rgba(255,255,255,.4)",marginBottom:32,fontSize:14,lineHeight:1.6 }}>
            Hope Maha was helpful!
          </p>
          <div style={{ display:"flex",gap:14,justifyContent:"center",flexWrap:"wrap" }}>
            <button onClick={()=>{ setPhase("start"); setOrbMode("idle"); setStatusText("Tap to start your call"); setErrorText(""); }}
              style={{ padding:"14px 36px",background:"linear-gradient(135deg,#7c3aed,#4f46e5)",border:"none",borderRadius:10,color:"#fff",fontSize:15,fontWeight:700,cursor:"pointer" }}>
              📞 Call Again
            </button>
            {!embedded && (
              <button onClick={onBack} style={{ padding:"14px 36px",background:"transparent",border:"1px solid rgba(255,255,255,.15)",borderRadius:10,color:"#fff",fontSize:15,cursor:"pointer" }}>Go Back</button>
            )}
          </div>
        </div>
      )}

      {phase !== "ended" && (
        <div style={{ textAlign:"center",zIndex:2,width:"100%",maxWidth:520,padding:"0 24px" }}>
          <div style={{ fontSize:12,color:"rgba(255,255,255,.25)",letterSpacing:"4px",textTransform:"uppercase",marginBottom:24 }}>
            {phase==="start"?"VOICE CALL":phase==="connecting"?"CONNECTING...":"LIVE CALL"}
          </div>

          <div style={{ position:"relative",width:220,height:220,margin:"0 auto 32px",cursor:phase==="start"?"pointer":"default" }}
            onClick={phase==="start"?startCall:undefined}>
            {phase==="active"&&[1,2,3].map(i=>(
              <div key={i} style={{ position:"absolute",top:"50%",left:"50%",width:220,height:220,marginTop:-110,marginLeft:-110,borderRadius:"50%",
                border:`1.5px solid ${orbMode==="listening"?"rgba(22,163,74,.4)":orbMode==="speaking"?"rgba(236,72,153,.4)":"rgba(124,58,237,.3)"}`,
                animation:`pulseRing ${1.2+i*0.5}s ease-out infinite`,animationDelay:`${i*0.35}s`
              }}/>
            ))}
            <div style={{ width:220,height:220,borderRadius:"50%",background:orbColors[orbMode].bg,boxShadow:orbColors[orbMode].shadow,
              display:"flex",alignItems:"center",justifyContent:"center",gap:5,animation:"orbFloat 4s ease-in-out infinite",
              position:"relative",transition:"background .5s ease, box-shadow .5s ease" }}>
              <div style={{ position:"absolute",inset:0,borderRadius:"50%",background:"radial-gradient(circle at 30% 25%, rgba(255,255,255,.28) 0%, transparent 50%)",pointerEvents:"none" }}/>
              {["bar1","bar2","bar3","bar4","bar3","bar2","bar1"].map((anim,i)=>(
                <div key={i} style={{ width:5,borderRadius:4,background:"linear-gradient(to top, rgba(255,255,255,.4), rgba(255,255,255,1))",
                  animation:`${anim} ${phase==="active"&&orbMode!=="idle"?0.38+i*0.04:0.75+i*0.1}s ease-in-out infinite`,
                  animationDelay:`${i*0.07}s`,boxShadow:"0 0 8px rgba(255,255,255,.85)",zIndex:1
                }}/>
              ))}
              {phase==="start"&&<div style={{ position:"absolute",bottom:-36,left:"50%",transform:"translateX(-50%)",fontSize:11,color:"rgba(255,255,255,.35)",whiteSpace:"nowrap" }}>Tap to start</div>}
            </div>
          </div>

          <div style={{ fontSize:13,color:"rgba(255,255,255,.55)",letterSpacing:2,textTransform:"uppercase",minHeight:20,marginBottom:8,transition:"all .3s" }}>
            {statusText}
          </div>

          {errorText&&(
            <div style={{ fontSize:12,color:"#f87171",background:"rgba(239,68,68,.1)",border:"1px solid rgba(239,68,68,.25)",borderRadius:8,padding:"8px 14px",margin:"0 auto 12px",maxWidth:360,lineHeight:1.5,animation:"fadeIn .3s ease" }}>
              {errorText}
            </div>
          )}

          {phase==="start"&&(
            <div style={{ marginTop:20 }}>
              <button onClick={startCall} style={{ padding:"16px 48px",background:"linear-gradient(135deg,#7c3aed,#4f46e5)",border:"none",borderRadius:50,color:"#fff",fontSize:15,fontWeight:700,cursor:"pointer",boxShadow:"0 0 40px rgba(124,58,237,.5)",letterSpacing:1 }}>
                📞 Start Call
              </button>
              <p style={{ color:"rgba(255,255,255,.2)",fontSize:11,marginTop:10 }}>No time limit · Speaks Telugu & more</p>
            </div>
          )}

          {phase==="active"&&(
            <button onClick={endCall} style={{ marginTop:12,padding:"12px 36px",background:"rgba(239,68,68,.15)",border:"1px solid rgba(239,68,68,.35)",borderRadius:50,color:"#f87171",fontSize:13,cursor:"pointer",transition:"all .2s" }}
              onMouseEnter={e=>e.currentTarget.style.background="rgba(239,68,68,.28)"}
              onMouseLeave={e=>e.currentTarget.style.background="rgba(239,68,68,.15)"}>
              📵 End Call
            </button>
          )}

          {phase==="active"&&(
            <div style={{ display:"flex",gap:16,justifyContent:"center",marginTop:24,flexWrap:"wrap" }}>
              {[{c:"#a78bfa",l:"Idle"},{c:"#4ade80",l:"Listening"},{c:"#fbbf24",l:"Thinking"},{c:"#f472b6",l:"Speaking"}].map(s=>(
                <div key={s.l} style={{ display:"flex",alignItems:"center",gap:5 }}>
                  <div style={{ width:7,height:7,borderRadius:"50%",background:s.c,boxShadow:`0 0 6px ${s.c}` }}/>
                  <span style={{ fontSize:10,color:"rgba(255,255,255,.28)" }}>{s.l}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

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
    <div style={{ minHeight:"100vh",background:"#000",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Inter',sans-serif" }}>
      <style>{STYLES}</style>
      <div style={{ width:"100%",maxWidth:"400px",padding:"40px",background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:"20px" }}>
        <div style={{ display:"flex",alignItems:"center",gap:"10px",marginBottom:"32px" }}>
          <MahaLogo size={32}/>
          <span style={{ fontSize:"20px",fontWeight:"800",color:"#fff",letterSpacing:"-1px" }}>Maha<span style={{ color:"#a78bfa" }}>.ai</span></span>
        </div>
        <h2 style={{ color:"#fff",fontSize:"24px",fontWeight:"700",marginBottom:"8px" }}>Create account</h2>
        <p style={{ color:"rgba(255,255,255,0.4)",fontSize:"14px",marginBottom:"28px" }}>Join Maha.ai for free</p>
        {[
          { label:"Your Name",value:name,set:setName,placeholder:"Enter your name",type:"text" },
          { label:"Email",value:email,set:setEmail,placeholder:"Enter your email",type:"email" },
          { label:"Password",value:password,set:setPassword,placeholder:"Create a password",type:"password" },
        ].map(f=>(
          <div key={f.label} style={{ marginBottom:"16px" }}>
            <div style={{ color:"rgba(255,255,255,0.5)",fontSize:"12px",marginBottom:"6px" }}>{f.label}</div>
            <input type={f.type} value={f.value} onChange={e=>f.set(e.target.value)} placeholder={f.placeholder}
              style={{ width:"100%",padding:"12px 14px",background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:"10px",color:"#fff",fontSize:"14px",outline:"none",boxSizing:"border-box" }}/>
          </div>
        ))}
        <button onClick={handleSubmit} style={{ width:"100%",padding:"13px",background:"linear-gradient(135deg,#7c3aed,#4f46e5)",border:"none",borderRadius:"10px",color:"#fff",fontSize:"15px",fontWeight:"700",cursor:"pointer",marginTop:"8px" }}>
          Create Account
        </button>
        <div style={{ textAlign:"center",marginTop:"20px",color:"rgba(255,255,255,0.3)",fontSize:"13px" }}>
          Already have an account?{" "}
          <span onClick={onBack} style={{ color:"#a78bfa",cursor:"pointer" }}>Sign In</span>
        </div>
        <button onClick={onBack} style={{ width:"100%",padding:"10px",background:"transparent",border:"none",color:"rgba(255,255,255,0.25)",fontSize:"13px",cursor:"pointer",marginTop:"12px" }}>← Back</button>
      </div>
    </div>
  );
}

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
    <div style={{ minHeight:"100vh",background:"#000",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Inter',sans-serif" }}>
      <style>{STYLES}</style>
      <div style={{ width:"100%",maxWidth:"400px",padding:"40px",background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:"20px" }}>
        <div style={{ display:"flex",alignItems:"center",gap:"10px",marginBottom:"32px" }}>
          <MahaLogo size={32}/>
          <span style={{ fontSize:"20px",fontWeight:"800",color:"#fff",letterSpacing:"-1px" }}>Maha<span style={{ color:"#a78bfa" }}>.ai</span></span>
        </div>
        <h2 style={{ color:"#fff",fontSize:"24px",fontWeight:"700",marginBottom:"8px" }}>Welcome back</h2>
        <p style={{ color:"rgba(255,255,255,0.4)",fontSize:"14px",marginBottom:"28px" }}>Sign in to Maha.ai</p>
        {[
          { label:"Email",value:email,set:setEmail,placeholder:"Enter your email",type:"email" },
          { label:"Password",value:password,set:setPassword,placeholder:"Enter your password",type:"password" },
        ].map(f=>(
          <div key={f.label} style={{ marginBottom:"16px" }}>
            <div style={{ color:"rgba(255,255,255,0.5)",fontSize:"12px",marginBottom:"6px" }}>{f.label}</div>
            <input type={f.type} value={f.value} onChange={e=>f.set(e.target.value)} placeholder={f.placeholder}
              style={{ width:"100%",padding:"12px 14px",background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:"10px",color:"#fff",fontSize:"14px",outline:"none",boxSizing:"border-box" }}/>
          </div>
        ))}
        <button onClick={handleSubmit} style={{ width:"100%",padding:"13px",background:"linear-gradient(135deg,#7c3aed,#4f46e5)",border:"none",borderRadius:"10px",color:"#fff",fontSize:"15px",fontWeight:"700",cursor:"pointer",marginTop:"8px" }}>
          Sign In
        </button>
        <button onClick={onBack} style={{ width:"100%",padding:"10px",background:"transparent",border:"none",color:"rgba(255,255,255,0.25)",fontSize:"13px",cursor:"pointer",marginTop:"12px" }}>← Back</button>
      </div>
    </div>
  );
}

export default App;