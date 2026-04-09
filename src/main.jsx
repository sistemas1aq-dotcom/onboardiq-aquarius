import React, { useState } from 'react'
import ReactDOM from 'react-dom/client'
import AdminApp from './AdminApp.jsx'
import PortalApp from './PortalApp.jsx'

const C = { navy:"#0a1f3d", blue1:"#0d4f8b", blue2:"#1a7ec5", cyan:"#3ec6e0", white:"#fff", g400:"#94a3b8" };

function RootApp() {
  const [app, setApp] = useState(null);
  if (app === "admin") return <AdminApp onBack={() => setApp(null)} />;
  if (app === "portal") return <PortalApp onBack={() => setApp(null)} />;

  return (
    <div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",background:`linear-gradient(135deg,${C.navy} 0%,${C.blue1} 50%,${C.blue2} 100%)`,fontFamily:"'DM Sans',sans-serif",position:"relative",overflow:"hidden"}}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet"/>
      <div style={{position:"absolute",top:0,left:0,right:0,bottom:0,opacity:0.06}}>
        {Array.from({length:20}).map((_,i)=><div key={i} style={{position:"absolute",width:2+Math.random()*220,height:2+Math.random()*220,borderRadius:"50%",border:"1px solid rgba(255,255,255,0.3)",top:`${Math.random()*100}%`,left:`${Math.random()*100}%`}}/>)}
      </div>
      <div style={{textAlign:"center",position:"relative",zIndex:1}}>
        <svg width={80} height={80} viewBox="0 0 100 100">
          <defs><linearGradient id="lg0" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor={C.cyan}/><stop offset="100%" stopColor={C.blue1}/></linearGradient></defs>
          <circle cx="50" cy="50" r="45" fill="url(#lg0)" opacity="0.15"/>
          <circle cx="50" cy="50" r="35" fill="none" stroke="url(#lg0)" strokeWidth="2"/>
          <path d="M30 35 L50 25 L70 35 L75 55 L60 70 L40 70 L25 55 Z" fill="none" stroke={C.blue2} strokeWidth="1.5"/>
          <circle cx="50" cy="50" r="4" fill={C.cyan}/><circle cx="50" cy="25" r="3" fill={C.blue2}/><circle cx="70" cy="35" r="3" fill={C.blue2}/>
        </svg>
        <h1 style={{color:C.white,fontSize:28,fontWeight:800,letterSpacing:3,margin:"20px 0 4px"}}>AQUARIUS CONSULTING</h1>
        <p style={{color:C.cyan,fontSize:13,letterSpacing:4,margin:"0 0 8px"}}>SISTEMA DE GESTIÓN DE RRHH</p>
        <p style={{color:"rgba(255,255,255,0.4)",fontSize:11,margin:"0 0 40px"}}>Versión 3.0 — Abril 2026 · 4 Perfiles: Admin · Evaluador · Postulante · Trabajador</p>
        <div style={{display:"flex",gap:20,justifyContent:"center"}}>
          {[{key:"admin",icon:"🛡️",title:"Panel Administrativo",desc:"Admin, Evaluador\nGestión, IA, Legajo, Reportes"},
            {key:"portal",icon:"👤",title:"Portal Postulante / Trabajador",desc:"Ficha, Evaluaciones, Docs\nFirmas, Bancario, Pensionario"}
          ].map(b=>(
            <button key={b.key} onClick={()=>setApp(b.key)} style={{
              background:"rgba(255,255,255,0.08)",border:"2px solid rgba(255,255,255,0.15)",
              borderRadius:20,padding:"32px 40px",cursor:"pointer",color:C.white,
              display:"flex",flexDirection:"column",alignItems:"center",gap:12,width:240,
              transition:"all 0.3s",backdropFilter:"blur(10px)",
            }}
            onMouseEnter={e=>{e.currentTarget.style.background="rgba(255,255,255,0.15)";e.currentTarget.style.transform="translateY(-4px)"}}
            onMouseLeave={e=>{e.currentTarget.style.background="rgba(255,255,255,0.08)";e.currentTarget.style.transform="translateY(0)"}}>
              <span style={{fontSize:40}}>{b.icon}</span>
              <span style={{fontSize:16,fontWeight:700}}>{b.title}</span>
              <span style={{fontSize:11,opacity:0.6,lineHeight:1.4,whiteSpace:"pre-line"}}>{b.desc}</span>
            </button>
          ))}
        </div>
        <p style={{color:"rgba(255,255,255,0.3)",fontSize:10,marginTop:40}}>Demo interactiva · Los datos no se guardan · Aquarius Consulting SAC</p>
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<RootApp/>)
