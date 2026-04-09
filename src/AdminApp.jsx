import { useState, useEffect, useRef } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend, PieChart, Pie, Cell, LineChart, Line } from "recharts";

/* ═══════════════════════════════════════════════════════════════
   AQUARIUS CONSULTING SAC
   SISTEMA INTEGRAL DE GESTIÓN DE RRHH — ADMIN
   Versión Consolidada: Fases 1 + 2 + 3 + 4 + 5
   Todos los módulos integrados en una sola aplicación
   ═══════════════════════════════════════════════════════════════ */

// ─── Paleta corporativa ───
const C = {
  navy:"#0a1f3d",blue1:"#0d4f8b",blue2:"#1a7ec5",cyan:"#3ec6e0",
  light:"#e8f4f8",white:"#fff",g50:"#f8fafc",g100:"#f1f5f9",
  g200:"#e2e8f0",g300:"#cbd5e1",g400:"#94a3b8",g500:"#64748b",
  g700:"#334155",g900:"#0f172a",green:"#10b981",yellow:"#f59e0b",
  red:"#ef4444",orange:"#f97316",purple:"#8b5cf6",pink:"#ec4899",
};

// ─── Entidades financieras Perú 2026 (SBS) ───
const BANCOS=["Banco de Crédito del Perú (BCP)","BBVA Perú","Interbank","Scotiabank Perú","Banco de la Nación","Banco Pichincha","Banco Falabella","Banco Ripley","Banco GNB Perú","Banco Santander Perú","Banco de Comercio","Banco Alfin","Citibank del Perú","ICBC Perú Bank","Banco de China (Perú)","BanBif","MiBanco","Banco BTG Pactual Perú","Compartamos Banco","Banco BCI Perú"];
const FINANCIERAS=["Financiera Oh!","Financiera Proempresa","Financiera Credinka","Financiera Confianza","Financiera Efectiva","Financiera Qapaq","Financiera TFC","Financiera Surgir","Kori Financiera"];
const CAJAS=["Caja Arequipa","Caja Huancayo","Caja Cusco","Caja Piura","Caja Sullana","Caja Trujillo","Caja Tacna","Caja Ica","CMAC Maynas","CMAC Del Santa","CMAC Paita","Caja Los Andes","Caja Del Centro"];
const TODAS_ENTIDADES=[...BANCOS,...FINANCIERAS,...CAJAS].sort();
const AFP_LIST=["AFP Integra","AFP Prima","AFP Habitat","AFP Profuturo"];

// ─── Estilos compartidos ───
const sty={
  btn:{padding:"10px 20px",borderRadius:10,border:"none",fontSize:13,fontWeight:600,cursor:"pointer",transition:"all 0.2s"},
  btnSm:{padding:"6px 12px",borderRadius:8,border:"none",fontSize:12,fontWeight:500,cursor:"pointer"},
  card:{background:C.white,borderRadius:16,padding:24,boxShadow:"0 1px 4px rgba(0,0,0,0.06)",border:`1px solid ${C.g100}`},
  input:{width:"100%",padding:"10px 14px",borderRadius:10,border:`1.5px solid ${C.g200}`,fontSize:14,outline:"none",boxSizing:"border-box"},
  select:{width:"100%",padding:"10px 14px",borderRadius:10,border:`1.5px solid ${C.g200}`,fontSize:14,outline:"none",boxSizing:"border-box",background:C.white},
  label:{fontSize:11,fontWeight:700,color:C.g400,marginBottom:4,display:"block",textTransform:"uppercase",letterSpacing:"0.6px"},
};

// ─── Logo SVG ───
const Logo=({size=36})=>(<svg width={size} height={size} viewBox="0 0 100 100"><defs><linearGradient id="lg" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor={C.cyan}/><stop offset="50%" stopColor={C.blue2}/><stop offset="100%" stopColor={C.blue1}/></linearGradient></defs><circle cx="50" cy="50" r="45" fill="url(#lg)" opacity="0.15"/><circle cx="50" cy="50" r="35" fill="none" stroke="url(#lg)" strokeWidth="2"/><path d="M30 35 L50 25 L70 35 L75 55 L60 70 L40 70 L25 55 Z" fill="none" stroke={C.blue2} strokeWidth="1.5"/><circle cx="50" cy="50" r="4" fill={C.cyan}/><circle cx="50" cy="25" r="3" fill={C.blue2}/><circle cx="30" cy="35" r="3" fill={C.blue1}/><circle cx="70" cy="35" r="3" fill={C.blue2}/><circle cx="75" cy="55" r="3" fill={C.blue1}/><circle cx="25" cy="55" r="3" fill={C.blue1}/><circle cx="60" cy="70" r="3" fill={C.blue2}/><circle cx="40" cy="70" r="3" fill={C.blue1}/></svg>);

// ─── Componentes reutilizables ───
const Field=({label:l,type="text",placeholder="",options,span=1,required,disabled})=>(
  <div style={{gridColumn:`span ${span}`}}>
    <label style={sty.label}>{l} {required&&<span style={{color:C.red}}>*</span>}</label>
    {type==="select"?<select style={sty.select} disabled={disabled}><option value="">Seleccionar...</option>{options?.map(o=>typeof o==="string"?<option key={o}>{o}</option>:<option key={o.value} value={o.value}>{o.label}</option>)}</select>
    :type==="textarea"?<textarea style={{...sty.input,minHeight:70,resize:"vertical"}} placeholder={placeholder} disabled={disabled}/>
    :type==="file"?<input type="file" style={{...sty.input,padding:8}}/>
    :<input type={type} style={sty.input} placeholder={placeholder} disabled={disabled}/>}
  </div>
);
const SectionHead=({icon,title,sub})=>(<div style={{gridColumn:"span 4",borderBottom:`2px solid ${C.g100}`,paddingBottom:8,marginBottom:4}}><div style={{fontSize:16,fontWeight:700,color:C.navy}}>{icon} {title}</div>{sub&&<div style={{fontSize:12,color:C.g400,marginTop:2}}>{sub}</div>}</div>);
const StatusBadge=({estado})=>{const col=estado==="Trabajador"?C.green:estado==="Aprobado"?C.green:estado==="Rechazado"?C.red:C.yellow;const bg=estado==="Trabajador"?"#dcfce7":estado==="Aprobado"?"#dcfce7":estado==="Rechazado"?"#fee2e2":"#fef3c7";const label=estado==="Trabajador"?"👷 Trabajador":estado;return (<span style={{display:"inline-flex",alignItems:"center",gap:6,padding:"4px 12px",borderRadius:20,fontSize:12,fontWeight:600,background:bg,color:col}}><span style={{width:7,height:7,borderRadius:"50%",background:col}}/>{label}</span>);};
const RiskBadge=({r})=>{const col=r==="bajo"?C.green:r==="medio"?C.yellow:C.red;const bg=r==="bajo"?"#dcfce7":r==="medio"?"#fef3c7":"#fee2e2";return (<span style={{display:"inline-flex",alignItems:"center",gap:4,padding:"3px 10px",borderRadius:12,fontSize:11,fontWeight:600,background:bg,color:col}}>{r==="bajo"?"🟢":r==="medio"?"🟡":"🔴"} {r.charAt(0).toUpperCase()+r.slice(1)}</span>);};
const ProgressBar=({value,height=6,color})=>(<div style={{width:"100%",height,borderRadius:height,background:C.g200,overflow:"hidden"}}><div style={{width:`${value}%`,height:"100%",borderRadius:height,background:color||(value>=80?C.green:value>=50?C.yellow:C.red),transition:"width 0.6s"}}/></div>);
const KPICard=({title,value,subtitle,icon,color,trend})=>(<div style={{...sty.card,display:"flex",alignItems:"center",gap:16,padding:"20px 24px"}}><div style={{width:48,height:48,borderRadius:14,background:`${color}15`,display:"flex",alignItems:"center",justifyContent:"center",color,flexShrink:0,fontSize:20}}>{icon}</div><div style={{flex:1}}><div style={{fontSize:11,color:C.g400,fontWeight:600,textTransform:"uppercase",letterSpacing:"0.5px"}}>{title}</div><div style={{fontSize:28,fontWeight:800,color:C.navy,lineHeight:1.1,marginTop:2}}>{value}</div>{subtitle&&<div style={{fontSize:12,color:C.g400,marginTop:2}}>{subtitle}</div>}</div>{trend&&<div style={{fontSize:12,fontWeight:600,color:trend>0?C.green:C.red}}>{trend>0?"↑":"↓"} {Math.abs(trend)}%</div>}</div>);

// ─── Firma Digital Canvas ───
const SignaturePad=({onSave,title="Firma Digital"})=>{const ref=useRef(null);const[d,setD]=useState(false);const[h,setH]=useState(false);const gc=(e)=>{const r=ref.current.getBoundingClientRect();const cx=e.touches?e.touches[0].clientX:e.clientX;const cy=e.touches?e.touches[0].clientY:e.clientY;return{x:cx-r.left,y:cy-r.top}};const s=(e)=>{e.preventDefault();const ctx=ref.current.getContext("2d");const{x,y}=gc(e);ctx.beginPath();ctx.moveTo(x,y);setD(true)};const m=(e)=>{if(!d)return;e.preventDefault();const ctx=ref.current.getContext("2d");const{x,y}=gc(e);ctx.lineTo(x,y);ctx.strokeStyle=C.navy;ctx.lineWidth=2;ctx.lineCap="round";ctx.stroke();setH(true)};const en=()=>setD(false);const cl=()=>{ref.current.getContext("2d").clearRect(0,0,ref.current.width,ref.current.height);setH(false)};return(<div style={{border:`1px solid ${C.g200}`,borderRadius:12,padding:16,background:C.white}}><div style={{fontSize:14,fontWeight:600,color:C.navy,marginBottom:8}}>{title}</div><canvas ref={ref} width={400} height={140} style={{border:`1px dashed ${C.g300}`,borderRadius:8,cursor:"crosshair",width:"100%",height:140,touchAction:"none"}} onMouseDown={s} onMouseMove={m} onMouseUp={en} onMouseLeave={en} onTouchStart={s} onTouchMove={m} onTouchEnd={en}/><div style={{display:"flex",gap:8,marginTop:8}}><button onClick={cl} style={{...sty.btnSm,background:C.g100,color:C.g700}}>Limpiar</button><button onClick={()=>h&&onSave?.(ref.current.toDataURL())} style={{...sty.btnSm,background:C.blue2,color:C.white,opacity:h?1:0.5}}>Guardar Firma</button></div><div style={{fontSize:11,color:C.g400,marginTop:6}}>Al firmar, acepto los términos. Se registra IP, fecha/hora y hash del documento.</div></div>)};

// ─── Canvas de Dibujo (Evaluación Psicológica) ───
const DrawingCanvas=({onSave})=>{const ref=useRef(null);const[d,setD]=useState(false);const[color,setColor]=useState("#000");const[tool,setTool]=useState("pencil");const cols=["#000",C.navy,C.blue2,C.red,C.green,C.orange,C.purple];const gc=(e)=>{const r=ref.current.getBoundingClientRect();const sx=ref.current.width/r.width;const sy=ref.current.height/r.height;const cx=e.touches?e.touches[0].clientX:e.clientX;const cy=e.touches?e.touches[0].clientY:e.clientY;return{x:(cx-r.left)*sx,y:(cy-r.top)*sy}};useEffect(()=>{if(ref.current){const ctx=ref.current.getContext("2d");ctx.fillStyle="#FFF";ctx.fillRect(0,0,600,400)}},[]);return(<div style={{border:`1px solid ${C.g200}`,borderRadius:12,padding:16,background:C.white}}><div style={{fontSize:14,fontWeight:600,color:C.navy,marginBottom:12}}>🎨 Pizarra de Evaluación Psicológica</div><div style={{display:"flex",gap:8,marginBottom:8,flexWrap:"wrap",alignItems:"center"}}><button onClick={()=>setTool("pencil")} style={{...sty.btnSm,background:tool==="pencil"?C.blue2:C.g100,color:tool==="pencil"?C.white:C.g700}}>✏️ Lápiz</button><button onClick={()=>setTool("eraser")} style={{...sty.btnSm,background:tool==="eraser"?C.blue2:C.g100,color:tool==="eraser"?C.white:C.g700}}>🧹 Borrador</button><span style={{width:1,height:24,background:C.g200}}/>{cols.map(c=><button key={c} onClick={()=>{setColor(c);setTool("pencil")}} style={{width:22,height:22,borderRadius:"50%",background:c,border:color===c&&tool==="pencil"?`3px solid ${C.cyan}`:"2px solid #ddd",cursor:"pointer",padding:0}}/>)}</div><canvas ref={ref} width={600} height={400} style={{border:`1px solid ${C.g200}`,borderRadius:8,cursor:tool==="eraser"?"cell":"crosshair",width:"100%",height:280,touchAction:"none"}} onMouseDown={e=>{e.preventDefault();const ctx=ref.current.getContext("2d");const{x,y}=gc(e);ctx.beginPath();ctx.moveTo(x,y);setD(true)}} onMouseMove={e=>{if(!d)return;e.preventDefault();const ctx=ref.current.getContext("2d");const{x,y}=gc(e);ctx.lineTo(x,y);ctx.strokeStyle=tool==="eraser"?"#FFF":color;ctx.lineWidth=tool==="eraser"?20:3;ctx.lineCap="round";ctx.stroke()}} onMouseUp={()=>setD(false)} onMouseLeave={()=>setD(false)} onTouchStart={e=>{e.preventDefault();const ctx=ref.current.getContext("2d");const{x,y}=gc(e);ctx.beginPath();ctx.moveTo(x,y);setD(true)}} onTouchMove={e=>{if(!d)return;e.preventDefault();const ctx=ref.current.getContext("2d");const{x,y}=gc(e);ctx.lineTo(x,y);ctx.strokeStyle=tool==="eraser"?"#FFF":color;ctx.lineWidth=tool==="eraser"?20:3;ctx.lineCap="round";ctx.stroke()}} onTouchEnd={()=>setD(false)}/><div style={{display:"flex",gap:8,marginTop:8}}><button onClick={()=>{const ctx=ref.current.getContext("2d");ctx.fillStyle="#FFF";ctx.fillRect(0,0,600,400)}} style={{...sty.btnSm,background:C.g100,color:C.g700}}>Limpiar Todo</button><button onClick={()=>onSave?.(ref.current.toDataURL())} style={{...sty.btnSm,background:C.green,color:C.white}}>Guardar Dibujo</button></div></div>)};

// ─── Datos de ejemplo ───
const POSTULANTES=[
  {id:1,nombre:"Carlos Mendoza",dni:"45678912",puesto:"Analista Financiero",estado:"En Evaluación",avance:72,riesgo:"bajo",tecnico:85,psicologico:78,entrevista:0,fecha:"2026-03-15",email:"cmendoza@email.com"},
  {id:2,nombre:"María López",dni:"78912345",puesto:"Coordinadora RRHH",estado:"Trabajador",avance:100,riesgo:"bajo",tecnico:92,psicologico:88,entrevista:90,fecha:"2026-03-10",email:"mlopez@email.com"},
  {id:3,nombre:"Roberto García",dni:"12345678",puesto:"Desarrollador Senior",estado:"En Evaluación",avance:45,riesgo:"medio",tecnico:70,psicologico:65,entrevista:0,fecha:"2026-03-20",email:"rgarcia@email.com"},
  {id:4,nombre:"Ana Torres",dni:"65432198",puesto:"Analista Contable",estado:"Rechazado",avance:88,riesgo:"alto",tecnico:45,psicologico:52,entrevista:40,fecha:"2026-03-08",email:"atorres@email.com"},
  {id:5,nombre:"Luis Vargas",dni:"98765432",puesto:"Gerente de Proyectos",estado:"En Evaluación",avance:60,riesgo:"bajo",tecnico:88,psicologico:82,entrevista:0,fecha:"2026-03-22",email:"lvargas@email.com"},
  {id:6,nombre:"Patricia Ruiz",dni:"34567891",puesto:"Asistente Legal",estado:"Trabajador",avance:95,riesgo:"bajo",tecnico:90,psicologico:85,entrevista:88,fecha:"2026-03-05",email:"pruiz@email.com"},
  {id:7,nombre:"Jorge Castillo",dni:"56789012",puesto:"Ingeniero Civil",estado:"En Evaluación",avance:30,riesgo:"alto",tecnico:55,psicologico:48,entrevista:0,fecha:"2026-03-25",email:"jcastillo@email.com"},
  {id:8,nombre:"Diana Flores",dni:"89012345",puesto:"Diseñadora UX",estado:"Trabajador",avance:100,riesgo:"bajo",tecnico:95,psicologico:90,entrevista:92,fecha:"2026-02-28",email:"dflores@email.com"},
];
const MONTHLY=[{mes:"Ene",post:18,apr:8,rej:4},{mes:"Feb",post:25,apr:12,rej:6},{mes:"Mar",post:32,apr:15,rej:8}];
const CAPACITACIONES=[{id:1,nombre:"Seguridad y Salud en el Trabajo",fecha:"2026-04-10",cumplimiento:45},{id:2,nombre:"Código de Ética Corporativa",fecha:"2026-04-05",cumplimiento:100},{id:3,nombre:"Manejo de Residuos",fecha:"2026-04-15",cumplimiento:20}];

// ─── Sidebar Icons (SVG inline) ───
const Ico={
  dash:<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>,
  users:<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  file:<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>,
  clip:<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1"/><path d="M9 14l2 2 4-4"/></svg>,
  pen:<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>,
  upload:<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/><path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/></svg>,
  book:<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>,
  funnel:<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>,
  brain:<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2a7 7 0 0 1 7 7c0 2.38-1.19 4.47-3 5.74V17a2 2 0 0 1-2 2h-4a2 2 0 0 1-2-2v-2.26C6.19 13.47 5 11.38 5 9a7 7 0 0 1 7-7z"/></svg>,
  shield:<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
  settings:<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>,
};

// ═══════════════════════════════════════════════════════════════
// SIDEBAR NAVIGATION — Filtrado por rol
// ═══════════════════════════════════════════════════════════════
const Sidebar=({active,onNav,collapsed,rol})=>{
  const adminItems=[
    {id:"dashboard",icon:Ico.dash,label:"Dashboard"},
    {id:"postulantes",icon:Ico.users,label:"Gestión Postulantes"},
    {id:"evaluaciones",icon:Ico.clip,label:"Evaluaciones"},
    {id:"legajo",icon:Ico.file,label:"Legajo Trabajador"},
    {id:"embudo",icon:Ico.funnel,label:"Embudo"},
    {id:"ia",icon:Ico.brain,label:"IA Insights"},
    {id:"admin",icon:"👥",label:"Admin Usuarios",emoji:true},
    {id:"seguridad",icon:Ico.shield,label:"Seguridad y Roles"},
    {id:"config",icon:Ico.settings,label:"Configuración"},
  ];
  const evaluadorItems=[
    {id:"dashboard",icon:Ico.dash,label:"Dashboard"},
    {id:"postulantes",icon:Ico.users,label:"Mis Postulantes"},
    {id:"evaluaciones",icon:Ico.clip,label:"Evaluar"},
    {id:"legajo",icon:Ico.file,label:"Legajo Trabajador"},
  ];
  const postItems=[
    {id:"ficha",icon:Ico.file,label:"Mi Ficha"},
    {id:"evaluaciones",icon:Ico.clip,label:"Evaluaciones"},
    {id:"documentos",icon:Ico.upload,label:"Documentos"},
    {id:"entrevistas",icon:"📅",label:"Entrevistas",emoji:true},
  ];
  const trabajadorItems=[
    {id:"ficha",icon:Ico.file,label:"Mi Ficha"},
    {id:"evaluaciones",icon:Ico.clip,label:"Evaluaciones"},
    {id:"documentos",icon:Ico.upload,label:"Documentos"},
    {id:"entrevistas",icon:"📅",label:"Entrevistas",emoji:true},
    {id:"firmas",icon:Ico.pen,label:"Firma Digital"},
    {id:"derechohabientes",icon:"👨‍👩‍👧",label:"Derechohabientes",emoji:true},
    {id:"bancario",icon:"🏦",label:"Datos Bancarios",emoji:true},
    {id:"pensionario",icon:"🏛️",label:"Régimen Pensionario",emoji:true},
    {id:"docsfirmados",icon:"📄",label:"Docs. Digitales",emoji:true},
    {id:"capacitaciones",icon:Ico.book,label:"Capacitaciones"},
  ];
  const itemsMap = { admin:adminItems, evaluador:evaluadorItems, postulante:postItems, trabajador:trabajadorItems };
  const items = itemsMap[rol] || postItems;
  const rolLabel = { admin:"ADMINISTRADOR", evaluador:"EVALUADOR", postulante:"POSTULANTE", trabajador:"TRABAJADOR" };
  const rolColor = { admin:C.red, evaluador:C.blue2, postulante:C.cyan, trabajador:C.green };
  return(
    <div style={{width:collapsed?72:250,minHeight:"100vh",background:C.navy,display:"flex",flexDirection:"column",transition:"width 0.3s",position:"fixed",left:0,top:0,zIndex:100,overflow:"hidden"}}>
      <div style={{padding:collapsed?"20px 12px":"20px 20px",display:"flex",alignItems:"center",gap:12,borderBottom:"1px solid rgba(255,255,255,0.08)"}}>
        <Logo size={collapsed?36:40}/>{!collapsed&&<div><div style={{color:C.white,fontSize:15,fontWeight:700,letterSpacing:1}}>AQUARIUS</div><div style={{color:rolColor[rol]||C.g400,fontSize:9,letterSpacing:2,fontWeight:700}}>{rolLabel[rol]||"CONSULTING"}</div></div>}
      </div>
      <div style={{flex:1,padding:"8px",display:"flex",flexDirection:"column",gap:1,overflowY:"auto"}}>
        {items.map(it=>(
          <button key={it.id} onClick={()=>onNav(it.id)} style={{display:"flex",alignItems:"center",gap:12,padding:collapsed?"10px":"9px 16px",borderRadius:10,background:active===it.id?"rgba(62,198,224,0.15)":"transparent",color:active===it.id?C.cyan:"rgba(255,255,255,0.5)",border:"none",cursor:"pointer",fontSize:12,fontWeight:active===it.id?600:400,width:"100%",textAlign:"left",justifyContent:collapsed?"center":"flex-start",whiteSpace:"nowrap"}}>
            <span style={{flexShrink:0,fontSize:it.emoji?16:undefined}}>{it.emoji?it.icon:it.icon}</span>{!collapsed&&<span>{it.label}</span>}
          </button>
        ))}
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════
// DASHBOARD PAGE
// ═══════════════════════════════════════════════════════════════
const DashboardPage=({onNav})=>{
  const total=POSTULANTES.length,apr=POSTULANTES.filter(p=>p.estado==="Aprobado").length,eval_=POSTULANTES.filter(p=>p.estado==="En Evaluación").length;
  const avgT=Math.round(POSTULANTES.reduce((s,p)=>s+p.tecnico,0)/total),avgP=Math.round(POSTULANTES.reduce((s,p)=>s+p.psicologico,0)/total);
  const radarData=[{s:"Técnico",A:avgT},{s:"Psicológico",A:avgP},{s:"Entrevista",A:68},{s:"Documentación",A:75},{s:"Experiencia",A:82}];
  const pieData=[{name:"Aprobados",value:apr,color:C.green},{name:"En Eval.",value:eval_,color:C.yellow},{name:"Rechazados",value:1,color:C.red}];
  return(<div>
    <div style={{marginBottom:24}}><h1 style={{fontSize:24,fontWeight:800,color:C.navy,margin:0}}>Dashboard de Reclutamiento</h1><p style={{color:C.g400,fontSize:14,margin:"4px 0 0"}}>Resumen ejecutivo — Aquarius Consulting SAC</p></div>
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))",gap:16,marginBottom:24}}>
      <KPICard title="Total Postulantes" value={total} subtitle="Ciclo 2026" icon="👥" color={C.blue2} trend={12}/>
      <KPICard title="Aprobados" value={apr} subtitle={`${Math.round(apr/total*100)}% ratio`} icon="✅" color={C.green} trend={8}/>
      <KPICard title="En Evaluación" value={eval_} subtitle="Pendientes" icon="📋" color={C.yellow}/>
      <KPICard title="Promedio Técnico" value={`${avgT}%`} subtitle="Score general" icon="🧠" color={C.purple} trend={5}/>
    </div>
    <div style={{display:"grid",gridTemplateColumns:"2fr 1fr",gap:16,marginBottom:24}}>
      <div style={sty.card}><div style={{fontSize:15,fontWeight:700,color:C.navy,marginBottom:16}}>Tendencia Mensual</div><ResponsiveContainer width="100%" height={260}><BarChart data={MONTHLY}><CartesianGrid strokeDasharray="3 3" stroke={C.g100}/><XAxis dataKey="mes" tick={{fontSize:12,fill:C.g400}}/><YAxis tick={{fontSize:12,fill:C.g400}}/><Tooltip contentStyle={{borderRadius:10,border:"none",boxShadow:"0 4px 20px rgba(0,0,0,0.1)"}}/><Bar dataKey="post" fill={C.blue2} radius={[6,6,0,0]} name="Postulantes"/><Bar dataKey="apr" fill={C.green} radius={[6,6,0,0]} name="Aprobados"/><Bar dataKey="rej" fill={C.red} radius={[6,6,0,0]} name="Rechazados"/><Legend wrapperStyle={{fontSize:12}}/></BarChart></ResponsiveContainer></div>
      <div style={sty.card}><div style={{fontSize:15,fontWeight:700,color:C.navy,marginBottom:16}}>Distribución</div><ResponsiveContainer width="100%" height={260}><PieChart><Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} dataKey="value" stroke="none">{pieData.map((e,i)=><Cell key={i} fill={e.color}/>)}</Pie><Tooltip/><Legend wrapperStyle={{fontSize:12}}/></PieChart></ResponsiveContainer></div>
    </div>
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,marginBottom:24}}>
      <div style={sty.card}><div style={{fontSize:15,fontWeight:700,color:C.navy,marginBottom:16}}>Perfil Promedio</div><ResponsiveContainer width="100%" height={250}><RadarChart data={radarData}><PolarGrid stroke={C.g200}/><PolarAngleAxis dataKey="s" tick={{fontSize:11,fill:C.g500}}/><PolarRadiusAxis angle={30} domain={[0,100]}/><Radar dataKey="A" stroke={C.blue2} fill={C.blue2} fillOpacity={0.25} strokeWidth={2}/></RadarChart></ResponsiveContainer></div>
      <div style={sty.card}><div style={{fontSize:15,fontWeight:700,color:C.navy,marginBottom:16}}>Ranking de Postulantes</div>{POSTULANTES.sort((a,b)=>((b.tecnico+b.psicologico+b.entrevista)/3)-((a.tecnico+a.psicologico+a.entrevista)/3)).slice(0,5).map((p,i)=>{const sc=Math.round((p.tecnico+p.psicologico+p.entrevista)/3);return (<div key={p.id} style={{display:"flex",alignItems:"center",gap:12,marginBottom:10}}><span style={{width:28,height:28,borderRadius:"50%",background:i<3?[C.yellow,C.g300,"#cd7f32"][i]:C.g100,display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:700,color:i<3?C.white:C.g500}}>{i+1}</span><div style={{flex:1}}><div style={{fontSize:13,fontWeight:600,color:C.g700}}>{p.nombre}</div><div style={{fontSize:11,color:C.g400}}>{p.puesto}</div></div><div style={{fontSize:16,fontWeight:700,color:sc>=80?C.green:sc>=60?C.yellow:C.red}}>{sc}%</div></div>)})}</div>
    </div>
    <div style={sty.card}><div style={{fontSize:15,fontWeight:700,color:C.navy,marginBottom:16}}>Postulantes Recientes</div><div style={{overflowX:"auto"}}><table style={{width:"100%",borderCollapse:"collapse"}}><thead><tr style={{borderBottom:`2px solid ${C.g100}`}}>{["Postulante","Puesto","Avance","Riesgo","Estado","Acciones"].map(h=><th key={h} style={{textAlign:"left",padding:"10px 12px",fontSize:11,fontWeight:700,color:C.g400,textTransform:"uppercase"}}>{h}</th>)}</tr></thead><tbody>{POSTULANTES.slice(0,5).map(p=><tr key={p.id} style={{borderBottom:`1px solid ${C.g100}`}}><td style={{padding:12}}><div style={{display:"flex",alignItems:"center",gap:10}}><div style={{width:36,height:36,borderRadius:"50%",background:`linear-gradient(135deg,${C.blue2},${C.cyan})`,display:"flex",alignItems:"center",justifyContent:"center",color:C.white,fontSize:14,fontWeight:700}}>{p.nombre.split(" ").map(n=>n[0]).join("")}</div><div><div style={{fontSize:13,fontWeight:600,color:C.g700}}>{p.nombre}</div><div style={{fontSize:11,color:C.g400}}>DNI: {p.dni}</div></div></div></td><td style={{padding:12,fontSize:13,color:C.g500}}>{p.puesto}</td><td style={{padding:12,width:140}}><div style={{display:"flex",alignItems:"center",gap:8}}><ProgressBar value={p.avance}/><span style={{fontSize:12,fontWeight:600,color:C.g500}}>{p.avance}%</span></div></td><td style={{padding:12}}><RiskBadge r={p.riesgo}/></td><td style={{padding:12}}><StatusBadge estado={p.estado}/></td><td style={{padding:12}}><button onClick={()=>onNav("ficha")} style={{...sty.btnSm,background:C.g100,color:C.blue2}}>👁️ Ver</button></td></tr>)}</tbody></table></div></div>
  </div>);
};

// ═══════════════════════════════════════════════════════════════
// FICHA COMPLETA — 10 pestañas integradas
// ═══════════════════════════════════════════════════════════════
const FichaCompletaPage=()=>{
  const[tab,setTab]=useState("personal");
  const tabs=[{id:"personal",l:"Datos Personales"},{id:"tallas",l:"Tallas EPP"},{id:"direccion",l:"Dirección"},{id:"emergencia",l:"Emergencia"},{id:"formacion",l:"Formación"},{id:"experiencia",l:"Experiencia"},{id:"referencias",l:"Referencias Lab."},{id:"salud",l:"Salud"}];
  return(<div>
    <div style={{marginBottom:20}}><h1 style={{fontSize:24,fontWeight:800,color:C.navy,margin:0}}>Ficha Completa del Postulante</h1><p style={{color:C.g400,fontSize:14,margin:"4px 0 0"}}>Todas las secciones integradas — Aquarius Consulting SAC</p></div>
    <div style={{display:"flex",gap:3,marginBottom:16,flexWrap:"wrap",background:C.g50,padding:4,borderRadius:12}}>
      {tabs.map(t=><button key={t.id} onClick={()=>setTab(t.id)} style={{...sty.btnSm,background:tab===t.id?C.white:"transparent",color:tab===t.id?C.blue2:C.g400,boxShadow:tab===t.id?"0 1px 3px rgba(0,0,0,0.08)":"none",fontWeight:tab===t.id?700:400,fontSize:11,padding:"8px 12px"}}>{t.l}</button>)}
    </div>
    <div style={sty.card}>
      {tab==="personal"&&<div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:14}}>
        <SectionHead icon="📋" title="I. DATOS PERSONALES" sub="Información de identidad y contacto"/>
        <Field label="Apellido Paterno" required placeholder="García"/><Field label="Apellido Materno" required placeholder="López"/><Field label="Nombres" required placeholder="Juan Carlos"/>
        <Field label="Tipo de Documento" type="select" required options={["DNI","CE","Pasaporte"]}/><Field label="Número de Documento" required placeholder="45678912"/><Field label="Fecha de Nacimiento" type="date" required/>
        <Field label="Lugar de Nacimiento" placeholder="Ciudad"/><Field label="Nacionalidad" placeholder="Peruana"/><Field label="Estado Civil" type="select" options={["Soltero/a","Casado/a","Divorciado/a","Viudo/a","Conviviente"]}/>
        <Field label="Género" type="select" options={["Masculino","Femenino","Otro"]}/><Field label="Teléfono" placeholder="987 654 321"/><Field label="Email" type="email" placeholder="correo@email.com"/>
        <Field label="Grupo Sanguíneo" type="select" options={["O+","O-","A+","A-","B+","B-","AB+","AB-"]}/><Field label="¿Tiene Licencia?" type="select" options={["Sí","No"]}/><Field label="Categoría Licencia" type="select" options={["N/A","AI","AII-a","AII-b","AIII-a","AIII-b","AIII-c"]}/>
      </div>}
      
      {tab==="tallas"&&<div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:14}}>
        <SectionHead icon="👔" title="TALLAS DE UNIFORME / EPP" sub="Para dotación de uniforme y equipos de protección personal"/>
        <Field label="Talla de camisa / polo" type="select" required options={["XS","S","M","L","XL","XXL","XXXL"]}/>
        <Field label="Talla de pantalón" type="select" required options={["28","30","32","34","36","38","40","42","44"]}/>
        <Field label="Talla de botas / calzado" type="select" required options={["35","36","37","38","39","40","41","42","43","44","45","46"]}/>
        <Field label="Talla de chaleco / casaca" type="select" options={["XS","S","M","L","XL","XXL"]}/>
      </div>}
      
      {tab==="direccion"&&<div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:14}}>
        <SectionHead icon="📍" title="DIRECCIÓN DE DOMICILIO" sub="Dirección exacta con referencias de ubicación"/>
        <Field label="Tipo de vía" type="select" required options={["Avenida","Jirón","Calle","Pasaje","Alameda","Malecón","Prolongación","Carretera"]}/><Field label="Nombre de la vía" required placeholder="Ej: Javier Prado Este"/><Field label="Número" required placeholder="Ej: 2456"/>
        <Field label="Interior / Dpto. / Piso" placeholder="Ej: Dpto. 302"/><Field label="Urbanización / Asentamiento" placeholder="Ej: Urb. Santa Catalina"/><Field label="Manzana / Lote" placeholder="Ej: Mz. B Lt. 15"/>
        <Field label="Distrito" type="select" required options={["Miraflores","San Isidro","San Borja","Surco","La Molina","Jesús María","Lince","Magdalena","Pueblo Libre","San Miguel","Barranco","Chorrillos","Lima Cercado","Breña","Rímac","SJL","SJM","VMT","VES","Ate","Santa Anita","El Agustino","La Victoria","Los Olivos","SMP","Comas","Independencia","Callao","Ventanilla","Otro"]}/><Field label="Provincia" required placeholder="Lima"/><Field label="Departamento" type="select" required options={["Lima","Arequipa","Cusco","Trujillo","Piura","Callao","Junín","Lambayeque","Cajamarca","Ancash","Ica","Puno","Tacna","Loreto","Ucayali","Otro"]}/>
        <Field label="Referencia de ubicación" required placeholder="Ej: A 2 cuadras del parque central, frente a la bodega Don Pedro" span={3}/>
        <Field label="¿Cómo llegar? (Indicaciones)" type="textarea" placeholder="Ej: Tomar la Av. Javier Prado hasta el cruce con Av. Aviación..." span={3}/>
        <Field label="Verificación domiciliaria (carga la empresa)" type="file" span={2}/><Field label="Recibo de servicios (luz, agua, teléfono)" type="file"/>
      </div>}
      
      {tab==="emergencia"&&<div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:14}}>
        <SectionHead icon="🚨" title="CONTACTO DE EMERGENCIA" sub="Persona a contactar en caso de emergencia"/>
        <Field label="Nombre completo" required placeholder="Nombre del contacto"/><Field label="Parentesco" type="select" required options={["Padre","Madre","Esposo/a","Conviviente","Hermano/a","Hijo/a","Tío/a","Amigo/a","Otro"]}/><Field label="Teléfono celular" required placeholder="987 654 321"/>
        <Field label="Teléfono fijo (opcional)" placeholder="01-4567890"/><Field label="Dirección del contacto" placeholder="Dirección de referencia" span={2}/>
      </div>}
      
      {tab==="formacion"&&<div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:14}}>
        <SectionHead icon="🎓" title="II. FORMACIÓN ACADÉMICA" sub="Estudios y capacitaciones"/>
        {[1,2,3].map(n=><div key={n} style={{gridColumn:"span 3",padding:14,background:C.g50,borderRadius:12,display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12}}><div style={{gridColumn:"span 3",fontSize:13,fontWeight:600,color:C.blue2}}>Estudio {n}</div><Field label="Nivel" type="select" options={["Secundaria","Técnico","Universitario","Postgrado","Maestría","Doctorado"]}/><Field label="Institución" placeholder="Nombre"/><Field label="Especialidad" placeholder="Carrera"/><Field label="Desde" type="date"/><Field label="Hasta" type="date"/><Field label="Estado" type="select" options={["En curso","Completo","Incompleto","Trunco"]}/></div>)}
        <Field label="Idiomas" placeholder="Ej: Inglés - Avanzado" span={3}/><Field label="Programas/Software" placeholder="Ej: Excel Avanzado, SAP" span={3}/>
      </div>}
      
      {tab==="experiencia"&&<div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:14}}>
        <SectionHead icon="💼" title="III. EXPERIENCIA LABORAL" sub="Historial laboral con contactos de referencia"/>
        {[1,2,3].map(n=><div key={n} style={{gridColumn:"span 3",padding:14,background:C.g50,borderRadius:12,display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12}}><div style={{gridColumn:"span 3",fontSize:13,fontWeight:600,color:C.blue2}}>Experiencia {n}</div><Field label="Empresa" required placeholder="Nombre"/><Field label="Rubro" placeholder="Ej: Minería"/><Field label="Cargo" required placeholder="Ej: Analista Senior"/><Field label="Desde" type="date"/><Field label="Hasta" type="date"/><Field label="Motivo de Retiro" type="select" options={["Renuncia voluntaria","Fin de contrato","Mutuo acuerdo","Reducción personal","Otro"]}/><Field label="Sueldo (S/)" placeholder="5,000"/><Field label="Nombre del Jefe Directo" required placeholder="Nombre completo"/><Field label="Teléfono del Jefe (referencia)" required placeholder="987654321"/><Field label="Funciones principales" type="textarea" placeholder="Describa funciones..." span={3}/></div>)}
      </div>}
      
      {tab==="referencias"&&<div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:14}}>
        <SectionHead icon="📞" title="REFERENCIAS LABORALES" sub="Contactos para verificación de experiencia"/>
        {[1,2,3].map(n=><div key={n} style={{gridColumn:"span 4",padding:14,background:C.g50,borderRadius:12,display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12}}><div style={{gridColumn:"span 4",fontSize:13,fontWeight:600,color:C.blue2}}>Referencia {n}</div><Field label="Empresa" required placeholder="Empresa donde trabajaron"/><Field label="Nombre del contacto" required placeholder="Nombre completo"/><Field label="Cargo del contacto" placeholder="Ej: Gerente Finanzas"/><Field label="Teléfono / Celular" required placeholder="987654321"/><Field label="Email del contacto" type="email" placeholder="contacto@empresa.com" span={2}/><Field label="Relación profesional" type="select" options={["Jefe directo","Compañero","Subordinado","Cliente","Otro"]} span={2}/></div>)}
      </div>}
      
      {tab==="salud"&&<div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:14}}>
        <SectionHead icon="🏥" title="VI. DECLARACIÓN DE SALUD"/>
        <Field label="¿Enfermedad crónica?" type="select" options={["No","Sí"]}/><Field label="Especifique" placeholder="Detalle"/>
        <Field label="¿Medicación regular?" type="select" options={["No","Sí"]}/><Field label="Especifique medicación" placeholder="Detalle"/>
        <Field label="¿Alergias?" type="select" options={["No","Sí"]}/><Field label="Especifique alergias" placeholder="Detalle"/>
        <Field label="¿Operaciones?" type="select" options={["No","Sí"]}/><Field label="Especifique operación" placeholder="Detalle"/>
        <Field label="¿Discapacidad?" type="select" options={["No","Sí"]}/><Field label="Tipo de discapacidad" placeholder="Detalle"/>
        <Field label="EPS actual" type="select" options={["Ninguna","Rímac","Pacífico","Mapfre","La Positiva","Otra"]}/><Field label="Nro. de EPS" placeholder="Número"/>
      </div>}
      
      <div style={{display:"flex",justifyContent:"flex-end",gap:12,marginTop:24,paddingTop:16,borderTop:`1px solid ${C.g100}`}}>
        <button style={{...sty.btn,background:C.g100,color:C.g500}}>Cancelar</button>
        <button style={{...sty.btn,background:C.blue2,color:C.white}}>Guardar y Continuar →</button>
      </div>
    </div>
  </div>);
};

// ═══════════════════════════════════════════════════════════════
// EVALUACIONES — VISTA ADMIN (Crear pruebas, ver resultados)
// ═══════════════════════════════════════════════════════════════
const PUESTOS_PRUEBAS = {
  "Analista Financiero": [
    { id: 1, q: "¿Cuál es la fórmula del WACC?", opts: ["a) Costo deuda + Costo equity", "b) Wd×Kd×(1-T) + We×Ke", "c) EBITDA / Ventas", "d) Activo / Pasivo"], correct: 1 },
    { id: 2, q: "El VAN positivo indica que:", opts: ["a) El proyecto destruye valor", "b) El proyecto es indiferente", "c) El proyecto genera valor sobre la tasa requerida", "d) Ninguna"], correct: 2 },
    { id: 3, q: "¿Qué estado financiero muestra la liquidez?", opts: ["a) Estado de Resultados", "b) Balance General", "c) Estado de Flujo de Efectivo", "d) Estado de Cambios en el Patrimonio"], correct: 2 },
    { id: 4, q: "La TIR es la tasa que hace el VAN igual a:", opts: ["a) 1", "b) -1", "c) 0", "d) Infinito"], correct: 2 },
    { id: 5, q: "¿Cuál NO es un ratio de liquidez?", opts: ["a) Razón corriente", "b) Prueba ácida", "c) ROE", "d) Capital de trabajo"], correct: 2 },
  ],
  "Coordinadora RRHH": [
    { id: 1, q: "El contrato a plazo fijo tiene un máximo de:", opts: ["a) 3 años", "b) 5 años", "c) 1 año", "d) No tiene límite"], correct: 1 },
    { id: 2, q: "La CTS se deposita:", opts: ["a) Mensualmente", "b) Semestralmente (mayo y noviembre)", "c) Anualmente", "d) Trimestralmente"], correct: 1 },
    { id: 3, q: "¿Cuántos días de vacaciones corresponden por año?", opts: ["a) 15 días", "b) 30 días calendario", "c) 22 días hábiles", "d) 45 días"], correct: 1 },
  ],
};

const AdminEvaluacionesPage = () => {
  const [subTab, setSubTab] = useState("gestionar");
  const [puestoSel, setPuestoSel] = useState("");
  const [nuevaPregunta, setNuevaPregunta] = useState({ q: "", opts: ["", "", "", ""], correct: 0 });
  const [preguntas, setPreguntas] = useState([]);
  const [verResultados, setVerResultados] = useState(false);

  const resultadosDemo = [
    { nombre: "Carlos Mendoza", puesto: "Analista Financiero", fecha: "01/04/2026", correctas: 4, total: 5, puntaje: 80, estado: "Aprobado" },
    { nombre: "Roberto García", puesto: "Desarrollador Senior", fecha: "30/03/2026", correctas: 2, total: 5, puntaje: 40, estado: "Desaprobado" },
    { nombre: "Luis Vargas", puesto: "Gerente de Proyectos", fecha: "29/03/2026", correctas: 3, total: 5, puntaje: 60, estado: "En revisión" },
    { nombre: "María López", puesto: "Coordinadora RRHH", fecha: "28/03/2026", correctas: 3, total: 3, puntaje: 100, estado: "Aprobado" },
  ];

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: C.navy, margin: 0 }}>📋 Gestión de Evaluaciones</h1>
        <p style={{ color: C.g400, fontSize: 14, margin: "4px 0 0" }}>Cree pruebas técnicas por puesto y revise resultados</p>
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
        {[{ id: "gestionar", l: "📝 Gestionar Pruebas" }, { id: "resultados", l: "📊 Resultados" }, { id: "psicologica", l: "🧠 Eval. Psicológica" }, { id: "entrevista", l: "🎤 Entrevista" }].map(t => (
          <button key={t.id} onClick={() => setSubTab(t.id)} style={{ ...sty.btn, background: subTab === t.id ? C.blue2 : C.white, color: subTab === t.id ? C.white : C.g500, border: `1px solid ${subTab === t.id ? C.blue2 : C.g200}` }}>{t.l}</button>
        ))}
      </div>

      {subTab === "gestionar" && (
        <div>
          <div style={{ ...sty.card, marginBottom: 16 }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: C.navy, marginBottom: 16 }}>Subir / Crear Prueba Técnica por Puesto</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 16 }}>
              <Field label="Puesto" type="select" required options={["Analista Financiero", "Coordinadora RRHH", "Desarrollador Senior", "Ingeniero Civil", "Gerente de Proyectos", "Asistente Legal", "Diseñadora UX", "Analista Contable"]} value={puestoSel} onChange={e => { setPuestoSel(e.target.value); setPreguntas(PUESTOS_PRUEBAS[e.target.value] || []); }} />
              <div style={{ display: "flex", alignItems: "flex-end" }}>
                <label style={{ ...sty.btn, background: `${C.purple}12`, color: C.purple, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
                  <input type="file" accept=".xlsx,.csv" style={{ display: "none" }} />
                  📤 Cargar prueba desde Excel
                </label>
              </div>
            </div>

            {puestoSel && preguntas.length > 0 && (
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: C.blue2, marginBottom: 12 }}>
                  Prueba cargada para: {puestoSel} — {preguntas.length} preguntas
                </div>
                {preguntas.map((p, i) => (
                  <div key={p.id} style={{ padding: 14, background: C.g50, borderRadius: 12, marginBottom: 8, borderLeft: `3px solid ${C.blue2}` }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: C.navy }}>Pregunta {i + 1}: {p.q}</div>
                      <div style={{ display: "flex", gap: 4 }}>
                        <button style={{ ...sty.btnSm, background: C.g100, color: C.blue2 }}>✏️</button>
                        <button style={{ ...sty.btnSm, background: `${C.red}10`, color: C.red }}>🗑️</button>
                      </div>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, marginTop: 8 }}>
                      {p.opts.map((opt, j) => (
                        <div key={j} style={{ padding: "6px 10px", borderRadius: 8, fontSize: 12, background: j === p.correct ? "#dcfce7" : C.white, color: j === p.correct ? C.green : C.g500, border: `1px solid ${j === p.correct ? C.green : C.g200}` }}>
                          {opt} {j === p.correct && " ✓"}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div style={sty.card}>
            <div style={{ fontSize: 16, fontWeight: 700, color: C.navy, marginBottom: 16 }}>➕ Agregar Pregunta Manual</div>
            <div style={{ display: "grid", gap: 12 }}>
              <Field label="Pregunta" required placeholder="Escriba la pregunta..." value={nuevaPregunta.q} onChange={e => setNuevaPregunta({ ...nuevaPregunta, q: e.target.value })} />
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                {[0, 1, 2, 3].map(i => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <input type="radio" name="correct" checked={nuevaPregunta.correct === i} onChange={() => setNuevaPregunta({ ...nuevaPregunta, correct: i })} style={{ accentColor: C.green }} />
                    <input style={{ ...sty.input, flex: 1 }} placeholder={`Opción ${String.fromCharCode(97 + i)})`} value={nuevaPregunta.opts[i]} onChange={e => { const o = [...nuevaPregunta.opts]; o[i] = e.target.value; setNuevaPregunta({ ...nuevaPregunta, opts: o }); }} />
                  </div>
                ))}
              </div>
              <div style={{ fontSize: 11, color: C.g400 }}>🟢 Seleccione el radio de la respuesta correcta</div>
              <button onClick={() => { if (nuevaPregunta.q && nuevaPregunta.opts[0]) { setPreguntas([...preguntas, { ...nuevaPregunta, id: preguntas.length + 1 }]); setNuevaPregunta({ q: "", opts: ["", "", "", ""], correct: 0 }); } }} style={{ ...sty.btn, background: C.green, color: C.white, width: "fit-content" }}>
                ✓ Agregar Pregunta
              </button>
            </div>
          </div>
        </div>
      )}

      {subTab === "resultados" && (
        <div style={sty.card}>
          <div style={{ fontSize: 16, fontWeight: 700, color: C.navy, marginBottom: 16 }}>Resultados de Evaluaciones Técnicas</div>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: `2px solid ${C.g100}` }}>
                {["Postulante", "Puesto", "Fecha", "Correctas", "Puntaje", "Estado", "Acciones"].map(h => (
                  <th key={h} style={{ textAlign: "left", padding: "10px 12px", fontSize: 11, fontWeight: 700, color: C.g400, textTransform: "uppercase" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {resultadosDemo.map((r, i) => (
                <tr key={i} style={{ borderBottom: `1px solid ${C.g100}` }}>
                  <td style={{ padding: 12, fontSize: 13, fontWeight: 600, color: C.g700 }}>{r.nombre}</td>
                  <td style={{ padding: 12, fontSize: 13, color: C.g500 }}>{r.puesto}</td>
                  <td style={{ padding: 12, fontSize: 12, color: C.g400 }}>{r.fecha}</td>
                  <td style={{ padding: 12, fontSize: 13, fontWeight: 600, color: C.navy }}>{r.correctas}/{r.total}</td>
                  <td style={{ padding: 12 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <ProgressBar value={r.puntaje} />
                      <span style={{ fontSize: 13, fontWeight: 700, color: r.puntaje >= 70 ? C.green : r.puntaje >= 50 ? C.yellow : C.red }}>{r.puntaje}%</span>
                    </div>
                  </td>
                  <td style={{ padding: 12 }}>
                    <StatusBadge estado={r.estado === "Aprobado" ? "Aprobado" : r.estado === "Desaprobado" ? "Rechazado" : "En Evaluación"} />
                  </td>
                  <td style={{ padding: 12 }}>
                    <button style={{ ...sty.btnSm, background: C.g100, color: C.blue2 }}>👁️ Detalle</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {subTab === "psicologica" && (
        <div style={sty.card}>
          <div style={{ fontSize: 16, fontWeight: 700, color: C.navy, marginBottom: 20 }}>Evaluación Psicológica — Calificar</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            {"Trabajo en equipo,Liderazgo,Manejo de estrés,Comunicación asertiva,Resolución de conflictos,Adaptabilidad,Orientación a resultados,Inteligencia emocional".split(",").map(c => (
              <div key={c} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 16px", background: C.g50, borderRadius: 10 }}>
                <span style={{ fontSize: 13, color: C.g700 }}>{c}</span>
                <select style={{ padding: "6px 10px", borderRadius: 6, border: `1px solid ${C.g200}`, fontSize: 12 }}>
                  <option>Seleccionar</option>
                  <option>Excelente (5)</option><option>Bueno (4)</option><option>Regular (3)</option><option>Bajo (2)</option><option>Deficiente (1)</option>
                </select>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 16 }}>
            <label style={sty.label}>Conclusión Psicológica</label>
            <textarea style={{ ...sty.input, minHeight: 100 }} placeholder="Conclusión del evaluador..." />
          </div>
          <div style={{ marginTop: 16 }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: C.navy, marginBottom: 8 }}>🎨 Dibujo del Postulante</div>
            <DrawingCanvas />
          </div>
        </div>
      )}

      {subTab === "entrevista" && (
        <div style={sty.card}>
          <div style={{ fontSize: 16, fontWeight: 700, color: C.navy, marginBottom: 20 }}>Entrevista — Calificar Respuestas</div>
          {"¿Por qué desea trabajar en Aquarius?,Describa una situación difícil y cómo la resolvió,¿Cuáles son sus fortalezas y áreas de mejora?,¿Expectativas salariales?,¿Disponibilidad inmediata?".split(",").map((q, i) => (
            <div key={i} style={{ padding: 14, background: C.g50, borderRadius: 12, marginBottom: 12 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 8 }}>P{i + 1}: {q}</div>
              <textarea style={{ ...sty.input, minHeight: 60 }} placeholder="Registrar respuesta del postulante..." />
              <div style={{ display: "flex", gap: 6, marginTop: 6 }}>
                {[1, 2, 3, 4, 5].map(n => (
                  <button key={n} style={{ ...sty.btnSm, background: C.g100, minWidth: 32 }}>{"⭐".repeat(n)}</button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════
// EVALUACIONES — VISTA POSTULANTE (Responder prueba)
// ═══════════════════════════════════════════════════════════════
const PostulanteEvaluacionesPage = () => {
  const [respuestas, setRespuestas] = useState({});
  const [enviado, setEnviado] = useState(false);
  const preguntas = PUESTOS_PRUEBAS["Analista Financiero"] || [];
  const respondidas = Object.keys(respuestas).length;

  if (enviado) {
    return (
      <div>
        <div style={{ marginBottom: 20 }}>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: C.navy, margin: 0 }}>📋 Evaluación Técnica</h1>
        </div>
        <div style={{ ...sty.card, textAlign: "center", padding: "48px 32px" }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>✅</div>
          <div style={{ fontSize: 20, fontWeight: 800, color: C.navy, marginBottom: 8 }}>Evaluación Enviada</div>
          <div style={{ fontSize: 14, color: C.g500, maxWidth: 400, margin: "0 auto" }}>
            Sus respuestas han sido registradas exitosamente. El equipo de RRHH revisará sus resultados y le notificará el estado de su evaluación.
          </div>
          <div style={{ marginTop: 20, padding: 16, background: C.g50, borderRadius: 12, display: "inline-block" }}>
            <div style={{ fontSize: 13, color: C.g400 }}>Preguntas respondidas</div>
            <div style={{ fontSize: 28, fontWeight: 800, color: C.blue2 }}>{respondidas} / {preguntas.length}</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: C.navy, margin: 0 }}>📋 Evaluación Técnica</h1>
        <p style={{ color: C.g400, fontSize: 14, margin: "4px 0 0" }}>Puesto: Analista Financiero — {preguntas.length} preguntas de opción múltiple</p>
      </div>

      <div style={{ ...sty.card, marginBottom: 16, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 20px", background: C.light, border: `1px solid ${C.cyan}30` }}>
        <div style={{ fontSize: 13, color: C.blue1 }}>
          <strong>Instrucciones:</strong> Seleccione una sola respuesta por pregunta. Una vez enviada, no podrá modificar sus respuestas.
        </div>
        <div style={{ fontSize: 13, fontWeight: 700, color: C.navy }}>
          {respondidas}/{preguntas.length} respondidas
        </div>
      </div>

      <div style={{ display: "grid", gap: 16, marginBottom: 20 }}>
        {preguntas.map((p, idx) => (
          <div key={p.id} style={{ ...sty.card, borderLeft: `4px solid ${respuestas[p.id] !== undefined ? C.green : C.g200}` }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: C.navy, marginBottom: 12 }}>
              Pregunta {idx + 1} de {preguntas.length}
            </div>
            <div style={{ fontSize: 15, color: C.g700, marginBottom: 14, lineHeight: 1.5 }}>
              {p.q}
            </div>
            <div style={{ display: "grid", gap: 8 }}>
              {p.opts.map((opt, j) => (
                <label key={j} onClick={() => setRespuestas({ ...respuestas, [p.id]: j })} style={{
                  display: "flex", alignItems: "center", gap: 12,
                  padding: "12px 16px", borderRadius: 10, cursor: "pointer",
                  background: respuestas[p.id] === j ? `${C.blue2}10` : C.g50,
                  border: `2px solid ${respuestas[p.id] === j ? C.blue2 : "transparent"}`,
                  transition: "all 0.2s",
                }}>
                  <div style={{
                    width: 22, height: 22, borderRadius: "50%", flexShrink: 0,
                    border: `2px solid ${respuestas[p.id] === j ? C.blue2 : C.g300}`,
                    background: respuestas[p.id] === j ? C.blue2 : "transparent",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    {respuestas[p.id] === j && <div style={{ width: 8, height: 8, borderRadius: "50%", background: C.white }} />}
                  </div>
                  <span style={{ fontSize: 13, color: respuestas[p.id] === j ? C.navy : C.g500, fontWeight: respuestas[p.id] === j ? 600 : 400 }}>
                    {opt}
                  </span>
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div style={{ ...sty.card, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ fontSize: 13, color: C.g400 }}>
          {respondidas === preguntas.length
            ? "✅ Todas las preguntas respondidas"
            : `⚠️ Faltan ${preguntas.length - respondidas} pregunta(s) por responder`}
        </div>
        <button
          onClick={() => { if (respondidas === preguntas.length) setEnviado(true); }}
          style={{
            ...sty.btn,
            background: respondidas === preguntas.length ? C.green : C.g200,
            color: respondidas === preguntas.length ? C.white : C.g400,
            cursor: respondidas === preguntas.length ? "pointer" : "not-allowed",
          }}
        >
          Enviar Evaluación →
        </button>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════
// DERECHOHABIENTES PAGE (standalone)
// ═══════════════════════════════════════════════════════════════
const DerechohabientesPage=()=>{
  const[familiares,setFamiliares]=useState([1]);
  return (<div>
    <div style={{marginBottom:20}}><h1 style={{fontSize:24,fontWeight:800,color:C.navy,margin:0}}>👨‍👩‍👧‍👦 Gestión de Derechohabientes</h1><p style={{color:C.g400,fontSize:14,margin:"4px 0 0"}}>Matricule a sus familiares directos para beneficios de seguro y EPS</p></div>
    <div style={{...sty.card,marginBottom:16,padding:16,background:C.light,border:`1px solid ${C.cyan}30`}}>
      <div style={{fontSize:13,fontWeight:600,color:C.blue1}}>ℹ️ Derechohabientes válidos según ley peruana</div>
      <div style={{fontSize:12,color:C.g500,marginTop:4}}>Cónyuge o conviviente, hijos menores de 18 años (o hasta 28 si estudian a tiempo completo), y padres dependientes mayores de 60 años sin ingresos propios.</div>
    </div>
    {familiares.map((_, i) => (
      <div key={i} style={{...sty.card,marginBottom:12}}>
        <div style={{fontSize:14,fontWeight:700,color:C.blue2,marginBottom:12}}>Familiar {i+1}</div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12}}>
          <Field label="Parentesco" type="select" required options={["Cónyuge","Conviviente","Hijo/a","Padre","Madre"]}/>
          <Field label="Nombres y Apellidos" required placeholder="Nombre completo"/>
          <Field label="DNI" required placeholder="Nro. documento"/>
          <Field label="Fecha de Nacimiento" type="date" required/>
          <Field label="Sexo" type="select" options={["Masculino","Femenino"]}/>
          <Field label="Ocupación / Estudios" placeholder="Ej: Estudiante, Ama de casa"/>
          <Field label="¿Incluir en seguro/EPS?" type="select" required options={["Sí","No"]}/>
          <Field label="¿Tiene discapacidad?" type="select" options={["No","Sí"]}/>
          <Field label="Adjuntar DNI del familiar" type="file"/>
          <Field label="Acta de nacimiento / Matrimonio" type="file"/>
          <Field label="Constancia de estudios (hijos mayores de 18)" type="file"/>
          <Field label="Constancia de convivencia (si conviviente)" type="file"/>
        </div>
      </div>
    ))}
    <button onClick={()=>setFamiliares([...familiares, familiares.length+1])} style={{...sty.btn,background:C.g100,color:C.blue2,width:"100%",marginBottom:16}}>➕ Agregar otro familiar</button>
    <div style={{display:"flex",justifyContent:"flex-end"}}><button style={{...sty.btn,background:C.blue2,color:C.white}}>Guardar Derechohabientes</button></div>
  </div>);
};

// ═══════════════════════════════════════════════════════════════
// DATOS BANCARIOS PAGE (standalone)
// ═══════════════════════════════════════════════════════════════
const BancarioPage=()=>{
  const[tieneSueldo,setTieneSueldo]=useState("");
  const[tieneCTS,setTieneCTS]=useState("");
  const[autApertura,setAutApertura]=useState(false);
  const[autCTS,setAutCTS]=useState(false);
  return (<div>
    <div style={{marginBottom:20}}><h1 style={{fontSize:24,fontWeight:800,color:C.navy,margin:0}}>🏦 Datos Bancarios</h1><p style={{color:C.g400,fontSize:14,margin:"4px 0 0"}}>Cuenta de haberes (sueldo) y cuenta CTS — Entidades vigentes Perú 2026 (SBS)</p></div>
    
    <div style={{...sty.card,marginBottom:16}}>
      <div style={{fontSize:16,fontWeight:700,color:C.navy,marginBottom:16,borderBottom:`2px solid ${C.g100}`,paddingBottom:8}}>💳 Cuenta de Haberes (Sueldo)</div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:14}}>
        <Field label="¿Cuenta con cuenta de haberes?" type="select" required options={["Sí, tengo cuenta","No, necesito que la empresa abra una"]} value={tieneSueldo} onChange={e=>setTieneSueldo(e.target.value)}/>
        {tieneSueldo==="Sí, tengo cuenta"&&<>
          <Field label="Banco / Entidad Financiera" type="select" required options={TODAS_ENTIDADES}/>
          <Field label="Moneda" type="select" required options={["Soles (PEN)","Dólares (USD)"]}/>
          <Field label="Número de Cuenta" required placeholder="Ej: 191-123456789-0-12"/>
          <Field label="Código CCI (20 dígitos)" required placeholder="Ej: 00219100123456789012"/>
          <Field label="Adjuntar constancia de cuenta" type="file"/>
        </>}
        {tieneSueldo==="No, necesito que la empresa abra una"&&<>
          <Field label="Banco de preferencia" type="select" required options={BANCOS_PERU}/>
          <Field label="Moneda preferida" type="select" required options={["Soles (PEN)","Dólares (USD)"]}/>
        </>}
      </div>
      {tieneSueldo==="No, necesito que la empresa abra una"&&
        <div style={{marginTop:14,padding:14,background:"#fef3c7",borderRadius:10,border:`1px solid ${C.yellow}30`}}>
          <div style={{display:"flex",alignItems:"flex-start",gap:10}}>
            <input type="checkbox" checked={autApertura} onChange={e=>setAutApertura(e.target.checked)} style={{accentColor:C.blue2,marginTop:3}}/>
            <div style={{fontSize:12,color:C.g700}}>
              <strong>Autorización de Apertura de Cuenta:</strong> Autorizo expresamente a Aquarius Consulting SAC a gestionar la apertura de una cuenta de haberes a mi nombre en la entidad bancaria seleccionada, para el depósito de mis remuneraciones. Los datos serán compartidos con dicha entidad exclusivamente para este fin.
            </div>
          </div>
        </div>
      }
    </div>

    <div style={{...sty.card,marginBottom:16}}>
      <div style={{fontSize:16,fontWeight:700,color:C.navy,marginBottom:16,borderBottom:`2px solid ${C.g100}`,paddingBottom:8}}>🏧 Cuenta CTS (Compensación por Tiempo de Servicios)</div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:14}}>
        <Field label="¿Cuenta con cuenta CTS?" type="select" required options={["Sí, tengo cuenta CTS","No, autorizo apertura por la empresa"]} value={tieneCTS} onChange={e=>setTieneCTS(e.target.value)}/>
        <Field label="Moneda para cálculo de CTS" type="select" required options={["Soles (PEN)","Dólares (USD)"]}/>
        {tieneCTS==="Sí, tengo cuenta CTS"&&<>
          <Field label="Banco / Entidad Financiera CTS" type="select" required options={TODAS_ENTIDADES}/>
          <Field label="Número de Cuenta CTS" required placeholder="Ej: 191-987654321-0-99"/>
          <Field label="Código CCI CTS (20 dígitos)" required placeholder="Ej: 00219100987654321099"/>
          <Field label="Adjuntar constancia de cuenta CTS" type="file"/>
        </>}
        {tieneCTS==="No, autorizo apertura por la empresa"&&
          <Field label="Banco de preferencia para CTS" type="select" required options={[...BANCOS_PERU,...FINANCIERAS_PERU,...CAJAS_PERU]}/>
        }
      </div>
      {tieneCTS==="No, autorizo apertura por la empresa"&&
        <div style={{marginTop:14,padding:14,background:"#fef3c7",borderRadius:10,border:`1px solid ${C.yellow}30`}}>
          <div style={{display:"flex",alignItems:"flex-start",gap:10}}>
            <input type="checkbox" checked={autCTS} onChange={e=>setAutCTS(e.target.checked)} style={{accentColor:C.blue2,marginTop:3}}/>
            <div style={{fontSize:12,color:C.g700}}>
              <strong>Autorización de Apertura de Cuenta CTS:</strong> Autorizo a Aquarius Consulting SAC a gestionar la apertura de una cuenta CTS a mi nombre en la entidad financiera indicada, conforme al TUO del D.L. N° 650 — Ley de Compensación por Tiempo de Servicios.
            </div>
          </div>
        </div>
      }
    </div>
    <div style={{display:"flex",justifyContent:"flex-end"}}><button style={{...sty.btn,background:C.blue2,color:C.white}}>Guardar Datos Bancarios</button></div>
  </div>);
};

// ═══════════════════════════════════════════════════════════════
// RÉGIMEN PENSIONARIO PAGE (standalone)
// ═══════════════════════════════════════════════════════════════
const PensionarioPage=()=>{
  const[primerTrabajo,setPrimerTrabajo]=useState("");
  const[regimen,setRegimen]=useState("");
  const[autInscripcion,setAutInscripcion]=useState(false);
  return (<div>
    <div style={{marginBottom:20}}><h1 style={{fontSize:24,fontWeight:800,color:C.navy,margin:0}}>🏛️ Régimen Pensionario</h1><p style={{color:C.g400,fontSize:14,margin:"4px 0 0"}}>Elección de sistema previsional — AFP o ONP</p></div>
    
    <div style={sty.card}>
      <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:14}}>
        <Field label="¿Es su primer trabajo formal?" type="select" required options={["Sí, es mi primer trabajo","No, ya estoy afiliado a un régimen"]} value={primerTrabajo} onChange={e=>setPrimerTrabajo(e.target.value)} span={2}/>
        
        {primerTrabajo==="No, ya estoy afiliado a un régimen"&&<>
          <Field label="Régimen actual" type="select" required options={["ONP (Sistema Nacional de Pensiones)",...AFP_LIST]} value={regimen} onChange={e=>setRegimen(e.target.value)}/>
          {regimen&&regimen!=="ONP (Sistema Nacional de Pensiones)"&&<>
            <Field label="CUSPP (Código Único SPP)" required placeholder="Ej: 123456789012"/>
            <Field label="Tipo de Comisión AFP" type="select" required options={["Comisión por Flujo","Comisión Mixta"]}/>
            <Field label="Adjuntar boleta o constancia AFP" type="file"/>
          </>}
          {regimen==="ONP (Sistema Nacional de Pensiones)"&&
            <Field label="Número de asegurado ONP" placeholder="Ej: 12345678"/>
          }
        </>}
        
        {primerTrabajo==="Sí, es mi primer trabajo"&&<>
          <div style={{gridColumn:"span 2",padding:16,background:C.light,borderRadius:12,border:`1px solid ${C.cyan}30`}}>
            <div style={{fontSize:14,fontWeight:700,color:C.blue1,marginBottom:10}}>ℹ️ Información sobre sistemas de pensiones en Perú</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
              <div style={{padding:14,background:C.white,borderRadius:10}}>
                <div style={{fontSize:14,fontWeight:700,color:C.navy,marginBottom:6}}>ONP — Sistema Nacional de Pensiones</div>
                <div style={{fontSize:12,color:C.g500,lineHeight:1.6}}>
                  • Aporte obligatorio: <strong>13%</strong> de la remuneración<br/>
                  • Requisito pensión: mínimo <strong>20 años</strong> de aportes<br/>
                  • Administrado por el <strong>Estado peruano</strong><br/>
                  • Pensión fija mensual al jubilarse<br/>
                  • No se puede retirar el fondo antes de jubilarse
                </div>
              </div>
              <div style={{padding:14,background:C.white,borderRadius:10}}>
                <div style={{fontSize:14,fontWeight:700,color:C.navy,marginBottom:6}}>AFP — Sistema Privado de Pensiones</div>
                <div style={{fontSize:12,color:C.g500,lineHeight:1.6}}>
                  • Aporte: <strong>~13%</strong> (10% ahorro + comisión AFP)<br/>
                  • Cuenta <strong>individual</strong> de capitalización<br/>
                  • Administradoras: <strong>Integra, Prima, Habitat, Profuturo</strong><br/>
                  • Rentabilidad variable según mercado<br/>
                  • Retiros parciales en casos específicos (Ley vigente)
                </div>
              </div>
            </div>
          </div>
          <Field label="Elijo afiliarme a:" type="select" required options={["ONP (Sistema Nacional de Pensiones)",...AFP_LIST]} value={regimen} onChange={e=>setRegimen(e.target.value)} span={2}/>
          {regimen&&regimen!=="ONP (Sistema Nacional de Pensiones)"&&
            <Field label="Tipo de Comisión" type="select" required options={["Comisión por Flujo","Comisión Mixta"]}/>
          }
          <div style={{gridColumn:"span 2",padding:16,background:"#fef3c7",borderRadius:12,border:`1px solid ${C.yellow}30`}}>
            <div style={{display:"flex",alignItems:"flex-start",gap:10}}>
              <input type="checkbox" checked={autInscripcion} onChange={e=>setAutInscripcion(e.target.checked)} style={{accentColor:C.blue2,marginTop:3}}/>
              <div style={{fontSize:12,color:C.g700,lineHeight:1.6}}>
                <strong>Autorización de Inscripción en Régimen Pensionario:</strong> Declaro que es mi primer empleo formal y autorizo expresamente a Aquarius Consulting SAC a realizar mi inscripción en el régimen pensionario seleccionado: <strong>{regimen||"(seleccione arriba)"}</strong>. Esta elección es libre y voluntaria, habiendo sido informado/a de las características, beneficios, obligaciones y diferencias de cada sistema previsional disponible en el Perú.
              </div>
            </div>
          </div>
        </>}
      </div>
      <div style={{display:"flex",justifyContent:"flex-end",marginTop:20}}><button style={{...sty.btn,background:C.blue2,color:C.white}}>Guardar Régimen Pensionario</button></div>
    </div>
  </div>);
};

// ═══════════════════════════════════════════════════════════════
// DOCUMENTOS FIRMADOS DIGITALES
// ═══════════════════════════════════════════════════════════════
const DocsFirmadosPage=()=>{
  const[acc,setAcc]=useState({});
  const docs=[
    {id:"boletas",t:"Aceptación de Boletas de Remuneración Virtuales",d:"Acepto recibir boletas de pago en formato digital (PDF) conforme al D.L. N° 1310 y R.M. N° 242-2019-TR."},
    {id:"contratos",t:"Aceptación de Contratos en Formato Digital",d:"Autorizo la remisión de contratos, adendas y renovaciones en formato digital con firma electrónica (Ley N° 27269)."},
    {id:"memorandums",t:"Notificación de Memorándums Virtuales",d:"Acepto ser notificado de memorándums, comunicaciones internas y amonestaciones por medio electrónico."},
    {id:"formularios",t:"Formularios y Solicitudes Digitales",d:"Acepto que vacaciones, permisos, licencias y trámites se gestionen por el sistema digital de RRHH."},
    {id:"convenios",t:"Convenios y Acuerdos Digitales",d:"Autorizo suscripción de convenios de confidencialidad, no competencia y otros en formato digital."},
    {id:"liquidaciones",t:"Liquidaciones y Constancias Digitales",d:"Acepto recibir liquidaciones, certificados de trabajo y constancias en formato digital."},
  ];
  return(<div>
    <div style={{marginBottom:20}}><h1 style={{fontSize:24,fontWeight:800,color:C.navy,margin:0}}>Documentos Digitales — Aceptaciones</h1><p style={{color:C.g400,fontSize:14,margin:"4px 0 0"}}>Autorización para gestión documental 100% digital</p></div>
    <div style={{display:"grid",gap:12}}>
      {docs.map(doc=><div key={doc.id} style={{...sty.card,borderLeft:`4px solid ${acc[doc.id]?C.green:C.yellow}`}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
          <div style={{flex:1}}><div style={{fontSize:14,fontWeight:700,color:C.navy,marginBottom:6}}>{doc.t}</div><div style={{fontSize:12,color:C.g500,lineHeight:1.6,marginBottom:10}}>{doc.d}</div></div>
          {acc[doc.id]&&<span style={{padding:"4px 12px",borderRadius:16,background:"#dcfce7",color:C.green,fontSize:11,fontWeight:600,flexShrink:0}}>✅ Aceptado</span>}
        </div>
        {!acc[doc.id]&&<div style={{display:"flex",alignItems:"center",gap:10,padding:"10px 14px",background:C.g50,borderRadius:8}}><input type="checkbox" onChange={e=>{if(e.target.checked)setAcc(p=>({...p,[doc.id]:true}))}} style={{accentColor:C.blue2}}/><span style={{fontSize:12,color:C.g700}}>He leído, entiendo y acepto las condiciones.</span></div>}
      </div>)}
    </div>
    <div style={{marginTop:16,padding:14,background:C.g50,borderRadius:10,display:"flex",justifyContent:"space-between",alignItems:"center"}}><span style={{fontSize:13,fontWeight:600,color:C.navy}}>Progreso: {Object.keys(acc).length}/{docs.length}</span><div style={{height:6,width:200,borderRadius:3,background:C.g200}}><div style={{width:`${Object.keys(acc).length/docs.length*100}%`,height:"100%",borderRadius:3,background:Object.keys(acc).length===docs.length?C.green:C.blue2,transition:"width 0.4s"}}/></div></div>
  </div>);
};

// ═══════════════════════════════════════════════════════════════
// FIRMA DIGITAL PAGE (8 documentos)
// ═══════════════════════════════════════════════════════════════
const FirmasPage=()=>{
  const[firmado,setFirmado]=useState({});
  const docs=["Ficha de Postulante","Declaración Jurada de Veracidad","Autorización de Verificación de Datos","Convenio de Confidencialidad","Reglamento Interno de Trabajo","Acta de Inducción","Régimen Pensionario","Autorización de Descuentos"];
  return(<div>
    <div style={{marginBottom:20}}><h1 style={{fontSize:24,fontWeight:800,color:C.navy,margin:0}}>Firma Digital de Documentos</h1><p style={{color:C.g400,fontSize:14,margin:"4px 0 0"}}>Firma electrónica con validez legal — Ley N° 27269</p></div>
    <div style={{...sty.card,marginBottom:16,padding:16,background:C.light,border:`1px solid ${C.cyan}30`}}><div style={{fontSize:13,fontWeight:600,color:C.blue1}}>🔐 Cada firma registra: IP, fecha/hora UTC, usuario autenticado, hash SHA-512 del documento. Se genera PDF firmado.</div></div>
    <div style={{display:"grid",gap:14}}>
      {docs.map((doc,i)=><div key={i} style={sty.card}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:firmado[i]?0:12}}>
          <div><div style={{fontSize:15,fontWeight:700,color:C.navy}}>{doc}</div><div style={{fontSize:12,color:C.g400}}>Documento {i+1} de {docs.length}</div></div>
          {firmado[i]?<span style={{padding:"6px 14px",borderRadius:20,background:"#dcfce7",color:C.green,fontSize:12,fontWeight:600}}>✅ Firmado</span>:<span style={{padding:"6px 14px",borderRadius:20,background:"#fef3c7",color:C.yellow,fontSize:12,fontWeight:600}}>⏳ Pendiente</span>}
        </div>
        {!firmado[i]&&<><div style={{padding:10,background:C.g50,borderRadius:8,marginBottom:10,fontSize:12,color:C.g500,maxHeight:70,overflow:"auto"}}>Declaro bajo juramento que la información es veraz. Autorizo verificación de datos...</div><div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10}}><input type="checkbox" style={{accentColor:C.blue2}}/><span style={{fontSize:12,color:C.g500}}>Acepto que esta firma tiene la misma validez que mi firma manuscrita</span></div><SignaturePad title={`Firma: ${doc}`} onSave={()=>setFirmado(p=>({...p,[i]:true}))}/></>}
      </div>)}
    </div>
  </div>);
};

// ═══════════════════════════════════════════════════════════════
// ADMIN USUARIOS PAGE
// ═══════════════════════════════════════════════════════════════
const AdminPage=()=>{
  const[users]=useState([{id:1,n:"Admin RRHH",e:"admin@aquariusconsulting.pe",r:"admin_rrhh",a:true,u:"01/04/2026"},{id:2,n:"María Segovia",e:"msegovia@aquariusconsulting.pe",r:"evaluador",a:true,u:"31/03/2026"},{id:3,n:"Carlos Mendoza",e:"cmendoza@email.com",r:"postulante",a:true,u:"01/04/2026"},{id:4,n:"Roberto García",e:"rgarcia@email.com",r:"postulante",a:false,u:"25/03/2026"}]);
  const[showNew,setShowNew]=useState(false);
  const rc={admin_rrhh:C.red,evaluador:C.blue2,postulante:C.cyan,trabajador:C.green};
  const rl={admin_rrhh:"Administrador",evaluador:"Evaluador",postulante:"Postulante",trabajador:"Trabajador"};
  return(<div>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
      <div><h1 style={{fontSize:24,fontWeight:800,color:C.navy,margin:0}}>👥 Gestión de Usuarios y Accesos</h1><p style={{color:C.g400,fontSize:14,margin:"4px 0 0"}}>Cree y administre accesos al sistema</p></div>
      <button onClick={()=>setShowNew(!showNew)} style={{...sty.btn,background:C.blue2,color:C.white}}>➕ Nuevo Usuario</button>
    </div>
    {showNew&&<div style={{...sty.card,marginBottom:20,background:C.light,border:`1px solid ${C.cyan}30`}}>
      <div style={{fontSize:15,fontWeight:700,color:C.navy,marginBottom:14}}>Crear Nuevo Usuario</div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:14}}>
        <Field label="Nombre completo" required placeholder="Juan Pérez López"/>
        <Field label="Email" type="email" required placeholder="correo@email.com"/>
        <Field label="DNI" required placeholder="12345678"/>
        <Field label="Rol" type="select" required options={[{value:"postulante",label:"Postulante"},{value:"trabajador",label:"Trabajador"},{value:"evaluador",label:"Evaluador"},{value:"admin_rrhh",label:"Administrador"}]}/>
        <Field label="Puesto (si postulante)" placeholder="Ej: Analista Financiero"/>
        <div style={{display:"flex",alignItems:"flex-end",gap:8}}>
          <button style={{...sty.btn,background:C.green,color:C.white}}>✓ Crear y Enviar Credenciales</button>
        </div>
      </div>
      <div style={{fontSize:11,color:C.g400,marginTop:10}}>💡 Se genera contraseña temporal y se envía por email. El usuario debe cambiarla al primer ingreso.</div>
    </div>}
    <div style={sty.card}><table style={{width:"100%",borderCollapse:"collapse"}}><thead><tr style={{borderBottom:`2px solid ${C.g100}`}}>{"Usuario,Email,Rol,Estado,Último Acceso,Acciones".split(",").map(h=><th key={h} style={{textAlign:"left",padding:"10px 12px",fontSize:11,fontWeight:700,color:C.g400,textTransform:"uppercase"}}>{h}</th>)}</tr></thead><tbody>{users.map(u=><tr key={u.id} style={{borderBottom:`1px solid ${C.g100}`}}><td style={{padding:12}}><div style={{display:"flex",alignItems:"center",gap:10}}><div style={{width:34,height:34,borderRadius:"50%",background:`${rc[u.r]}20`,color:rc[u.r],display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,fontWeight:700}}>{u.n.split(" ").map(n=>n[0]).join("").slice(0,2)}</div><span style={{fontSize:13,fontWeight:600,color:C.g700}}>{u.n}</span></div></td><td style={{padding:12,fontSize:13,color:C.g500}}>{u.e}</td><td style={{padding:12}}><span style={{padding:"3px 10px",borderRadius:12,fontSize:11,fontWeight:600,background:`${rc[u.r]}15`,color:rc[u.r]}}>{rl[u.r]}</span></td><td style={{padding:12}}><span style={{fontSize:12,color:u.a?C.green:C.red,display:"flex",alignItems:"center",gap:4}}><span style={{width:7,height:7,borderRadius:"50%",background:u.a?C.green:C.red}}/>{u.a?"Activo":"Inactivo"}</span></td><td style={{padding:12,fontSize:12,color:C.g400}}>{u.u}</td><td style={{padding:12,display:"flex",gap:6}}><button style={{...sty.btnSm,background:C.g100,color:C.blue2}}>✏️</button><button style={{...sty.btnSm,background:C.g100,color:C.yellow}}>🔑</button><button style={{...sty.btnSm,background:`${C.red}10`,color:C.red}}>🚫</button></td></tr>)}</tbody></table></div>
  </div>);
};

// ═══════════════════════════════════════════════════════════════
// ═══════════════════════════════════════════════════════════════
// LEGAJO DEL TRABAJADOR — Búsqueda de aprobados
// ═══════════════════════════════════════════════════════════════
const LegajoPage = () => {
  const [buscar, setBuscar] = useState("");
  const [selTrab, setSelTrab] = useState(null);
  const trabajadores = POSTULANTES.filter(p => p.estado === "Aprobado" || p.estado === "Trabajador");
  const filtrados = trabajadores.filter(t => t.nombre.toLowerCase().includes(buscar.toLowerCase()) || t.dni.includes(buscar));
  const leg = {personal:{nombres:"María López Ríos",dni:"78912345",fechaNac:"15/06/1992",civil:"Soltera",telefono:"987654321",email:"mlopez@email.com",sangre:"O+"},tallas:{camisa:"M",pantalon:"30",botas:"38"},direccion:{dir:"Calle Las Palmeras 456, Dpto 201, Urb. San Antonio, Miraflores, Lima",ref:"Frente al parque Kennedy"},emergencia:{nombre:"Rosa Ríos",parentesco:"Madre",tel:"912345678"},bancario:{banco:"BBVA Perú",moneda:"Soles",cuenta:"0011-0234-0100456789",cci:"01123401004567890012"},cts:{banco:"Interbank",moneda:"Soles",cuenta:"898-3001234567",cci:"00389830012345670024"},pension:{regimen:"AFP Prima",cuspp:"612345PRMLI0",comision:"Mixta"},docs:["DNI","CV","Foto","Certificados","Constancias","Antecedentes","Cert. Médico"],firmas:["Ficha","Declaración Jurada","Confidencialidad","Reglamento","Inducción","Pensionario","Descuentos"],docsdig:["Boletas","Contratos","Memorándums","Formularios","Convenios","Liquidaciones"]};

  if (!selTrab) return (
    <div>
      <h1 style={{fontSize:24,fontWeight:800,color:C.navy,margin:"0 0 6px"}}>📂 Legajo del Trabajador</h1>
      <p style={{color:C.g400,fontSize:13,margin:"0 0 20px"}}>Busque trabajadores aprobados para ver su legajo completo</p>
      <div style={{...sty.card,marginBottom:20,display:"flex",gap:12,alignItems:"center"}}><input value={buscar} onChange={e=>setBuscar(e.target.value)} placeholder="Buscar por nombre o DNI..." style={{...sty.input,flex:1}}/><span style={{fontSize:13,color:C.g400}}>{filtrados.length} encontrado(s)</span></div>
      <div style={{display:"grid",gap:10}}>{filtrados.length===0&&<div style={{...sty.card,textAlign:"center",padding:30,color:C.g400}}>Sin resultados</div>}{filtrados.map(t=>(
        <div key={t.id} onClick={()=>setSelTrab(t)} style={{...sty.card,padding:"16px 24px",display:"flex",alignItems:"center",gap:16,cursor:"pointer",borderLeft:`4px solid ${C.green}`}}>
          <div style={{width:48,height:48,borderRadius:"50%",background:`linear-gradient(135deg,${C.green},${C.cyan})`,display:"flex",alignItems:"center",justifyContent:"center",color:C.white,fontSize:16,fontWeight:700}}>{t.nombre.split(" ").map(n=>n[0]).join("")}</div>
          <div style={{flex:1}}><div style={{fontSize:15,fontWeight:700,color:C.g700}}>{t.nombre}</div><div style={{fontSize:12,color:C.g400}}>{t.puesto} · DNI: {t.dni}</div></div>
          <span style={{padding:"4px 12px",borderRadius:20,background:"#dcfce7",color:C.green,fontSize:12,fontWeight:600}}>✅ Trabajador</span>
          <span style={{color:C.blue2,fontSize:14}}>Ver →</span>
        </div>
      ))}</div>
    </div>
  );

  return (
    <div>
      <button onClick={()=>setSelTrab(null)} style={{...sty.btn,background:C.g100,color:C.g500,marginBottom:16}}>← Volver</button>
      <div style={{...sty.card,marginBottom:16,background:`linear-gradient(135deg,${C.navy},${C.blue1})`,color:C.white,borderColor:"transparent"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div><div style={{fontSize:22,fontWeight:800}}>{selTrab.nombre}</div><div style={{fontSize:14,color:C.cyan}}>{selTrab.puesto} · DNI: {selTrab.dni}</div></div>
          <div style={{display:"flex",gap:8}}><button style={{...sty.btn,background:"rgba(255,255,255,0.15)",color:C.white}}>📄 PDF</button><button style={{...sty.btn,background:"rgba(255,255,255,0.15)",color:C.white}}>📊 Excel</button></div>
        </div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:16,marginBottom:16}}>
        {[["Técnico",selTrab.tecnico,C.blue2],["Psicológico",selTrab.psicologico,C.purple],["Entrevista",selTrab.entrevista,C.green]].map(([l,v,c])=>(
          <div key={l} style={{...sty.card,textAlign:"center",padding:16}}><div style={{fontSize:11,color:C.g400,fontWeight:600}}>{l}</div><div style={{fontSize:32,fontWeight:800,color:c}}>{v}%</div><ProgressBar value={v} height={6}/></div>
        ))}
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
        <div style={sty.card}><div style={{fontSize:15,fontWeight:700,color:C.navy,marginBottom:12}}>📋 Datos Personales</div>{Object.entries(leg.personal).map(([k,v])=>(<div key={k} style={{display:"flex",justifyContent:"space-between",padding:"6px 0",borderBottom:`1px solid ${C.g100}`,fontSize:13}}><span style={{color:C.g400}}>{k}</span><span style={{color:C.g700,fontWeight:500}}>{v}</span></div>))}</div>
        <div style={sty.card}><div style={{fontSize:15,fontWeight:700,color:C.navy,marginBottom:12}}>📍 Dirección + 🚨 Emergencia</div><div style={{fontSize:13,color:C.g700,marginBottom:4}}>{leg.direccion.dir}</div><div style={{fontSize:12,color:C.g400,marginBottom:12}}>Ref: {leg.direccion.ref}</div><div style={{borderTop:`1px solid ${C.g100}`,paddingTop:10}}>{Object.entries(leg.emergencia).map(([k,v])=>(<div key={k} style={{display:"flex",justifyContent:"space-between",padding:"4px 0",fontSize:13}}><span style={{color:C.g400}}>{k}</span><span style={{color:C.g700}}>{v}</span></div>))}</div></div>
        <div style={sty.card}><div style={{fontSize:15,fontWeight:700,color:C.navy,marginBottom:12}}>🏦 Bancario + CTS</div><div style={{padding:10,background:C.g50,borderRadius:10,marginBottom:8}}><div style={{fontSize:12,fontWeight:600,color:C.blue2,marginBottom:4}}>Cuenta Sueldo</div>{Object.entries(leg.bancario).map(([k,v])=>(<div key={k} style={{display:"flex",justifyContent:"space-between",fontSize:12,padding:"3px 0"}}><span style={{color:C.g400}}>{k}</span><span style={{color:C.g700,fontFamily:"monospace"}}>{v}</span></div>))}</div><div style={{padding:10,background:C.g50,borderRadius:10}}><div style={{fontSize:12,fontWeight:600,color:C.blue2,marginBottom:4}}>Cuenta CTS</div>{Object.entries(leg.cts).map(([k,v])=>(<div key={k} style={{display:"flex",justifyContent:"space-between",fontSize:12,padding:"3px 0"}}><span style={{color:C.g400}}>{k}</span><span style={{color:C.g700,fontFamily:"monospace"}}>{v}</span></div>))}</div></div>
        <div style={sty.card}><div style={{fontSize:15,fontWeight:700,color:C.navy,marginBottom:12}}>🏛️ Pensión + 👔 Tallas</div>{Object.entries(leg.pension).map(([k,v])=>(<div key={k} style={{display:"flex",justifyContent:"space-between",padding:"6px 0",borderBottom:`1px solid ${C.g100}`,fontSize:13}}><span style={{color:C.g400}}>{k}</span><span style={{color:C.g700,fontWeight:600}}>{v}</span></div>))}<div style={{marginTop:12,borderTop:`1px solid ${C.g100}`,paddingTop:10}}>{Object.entries(leg.tallas).map(([k,v])=>(<div key={k} style={{display:"flex",justifyContent:"space-between",padding:"4px 0",fontSize:13}}><span style={{color:C.g400}}>{k}</span><span style={{color:C.g700}}>{v}</span></div>))}</div></div>
        <div style={sty.card}><div style={{fontSize:15,fontWeight:700,color:C.navy,marginBottom:12}}>📁 Documentos ({leg.docs.length})</div>{leg.docs.map((d,i)=>(<div key={i} style={{display:"flex",alignItems:"center",gap:8,padding:"5px 0",borderBottom:`1px solid ${C.g100}`,fontSize:13}}><span style={{color:C.green}}>✅</span><span style={{flex:1,color:C.g700}}>{d}</span><button style={{...sty.btnSm,background:`${C.blue2}10`,color:C.blue2,fontSize:10}}>📥</button></div>))}</div>
        <div style={sty.card}><div style={{fontSize:15,fontWeight:700,color:C.navy,marginBottom:12}}>✍️ Firmas ({leg.firmas.length}) + 📄 Docs Digitales ({leg.docsdig.length})</div>{leg.firmas.map((f,i)=>(<div key={i} style={{display:"flex",alignItems:"center",gap:6,padding:"4px 0",fontSize:12,color:C.g500}}><span style={{color:C.green}}>✓</span>{f}</div>))}<div style={{borderTop:`1px solid ${C.g100}`,marginTop:8,paddingTop:8}}>{leg.docsdig.map((d,i)=>(<div key={i} style={{display:"flex",alignItems:"center",gap:6,padding:"3px 0",fontSize:12,color:C.g400}}><span style={{color:C.green}}>✓</span>{d}</div>))}</div></div>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════
// REMAINING PAGES (Embudo, IA, Capacitaciones, Seguridad, Config)
// ═══════════════════════════════════════════════════════════════
const EmbudoPage=()=>{const stages=[{n:"Postulación",c:120,col:C.cyan},{n:"Documentación",c:98,col:C.blue2},{n:"Eval. Técnica",c:78,col:C.blue1},{n:"Eval. Psicológica",c:62,col:C.purple},{n:"Entrevista",c:42,col:C.orange},{n:"Aprobado",c:28,col:C.green}];return(<div><h1 style={{fontSize:24,fontWeight:800,color:C.navy,margin:"0 0 20px"}}>Embudo de Reclutamiento</h1><div style={sty.card}><div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:4,padding:"20px 0"}}>{stages.map((s,i)=><div key={s.n} style={{width:`${30+(70*(stages.length-i)/stages.length)}%`}}><div style={{background:`linear-gradient(135deg,${s.col},${s.col}dd)`,padding:"14px 24px",borderRadius:10,display:"flex",justifyContent:"space-between",color:C.white}}><span style={{fontWeight:700,fontSize:14}}>{s.n}</span><span style={{fontSize:20,fontWeight:800}}>{s.c}</span></div>{i<stages.length-1&&<div style={{textAlign:"center",padding:"4px 0",fontSize:11,color:C.g400}}>↓ {Math.round(stages[i+1].c/s.c*100)}%</div>}</div>)}</div></div><div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:16,marginTop:16}}><KPICard title="Conversión Global" value="23.3%" icon="📊" color={C.green}/><KPICard title="Mayor Cuello de Botella" value="Eval→Entrev" subtitle="32% pérdida" icon="⚠️" color={C.red}/><KPICard title="Tiempo Promedio" value="12 días" icon="📅" color={C.blue2}/></div></div>)};

const IAPage=()=>{
  const[busqueda,setBusqueda]=useState("");
  const[buscando,setBuscando]=useState(false);
  const[resultados,setResultados]=useState(null);
  const[postSel,setPostSel]=useState("");

  const hacerBusqueda=()=>{
    setBuscando(true);
    setTimeout(()=>{
      setBuscando(false);
      setResultados({
        nombre:postSel||busqueda,
        linkedin:{encontrado:true,perfil:"linkedin.com/in/carlos-mendoza-pe",cargo:"Analista Financiero Senior",empresa:"Deloitte Perú",conexiones:480,resumen:"5+ años en análisis financiero, auditoría y consultoría. CFA Level II candidate."},
        noticias:[{titulo:"Deloitte reconoce a sus mejores analistas 2025",fuente:"Gestión",fecha:"Nov 2025",relevancia:"positiva"},{titulo:"Panel de expertos en Finanzas Corporativas — ESAN",fuente:"ESAN",fecha:"Sep 2025",relevancia:"positiva"}],
        redes:{twitter:false,facebook:true,instagram:false},
        riesgo:"bajo",
        score:87,
        observaciones:["Perfil profesional consistente con lo declarado en CV","Experiencia verificable en Deloitte Perú","Participación en eventos académicos relevantes","Sin antecedentes negativos en medios"],
        alertas:["Diferencia de 2 meses en fecha de salida declarada vs LinkedIn"],
      });
    },2000);
  };

  const ins=[
    {t:"warning",ti:"Inconsistencia detectada",d:"Roberto García declara 5 años como Senior pero en evaluación técnica responde a nivel básico. Diferencia de 35 puntos entre experiencia declarada y conocimiento demostrado.",p:"Roberto García",sev:"alta",acciones:["Solicitar certificados laborales","Verificar referencias","Programar entrevista técnica adicional"]},
    {t:"info",ti:"Documentos vencidos",d:"3 postulantes con documentación pendiente hace más de 5 días. María López (foto), Jorge Castillo (antecedentes), Ana Torres (certificado médico).",p:"Varios",sev:"media",acciones:["Enviar recordatorio automático","Establecer plazo límite"]},
    {t:"success",ti:"Candidato destacado",d:"Diana Flores obtiene >90% en todas las evaluaciones. Perfil excepcional para Diseñadora UX. Recomendación: acelerar proceso de aprobación.",p:"Diana Flores",sev:"baja",acciones:["Aprobar directamente","Priorizar onboarding"]},
    {t:"warning",ti:"Riesgo elevado",d:"Jorge Castillo: técnico 55%, psicológico 48%, documentos 30%. Múltiples banderas rojas en evaluación psicológica (manejo de estrés: deficiente).",p:"Jorge Castillo",sev:"alta",acciones:["Rechazar candidatura","Documentar razones"]},
  ];

  return (
    <div>
      <h1 style={{fontSize:24,fontWeight:800,color:C.navy,margin:"0 0 6px"}}>🧠 IA — Motor de Análisis Inteligente</h1>
      <p style={{color:C.g400,fontSize:13,margin:"0 0 20px"}}>Alertas automáticas, análisis de riesgo y búsqueda de referencias en línea</p>

      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:16,marginBottom:24}}>
        <KPICard title="Alertas Activas" value="4" icon="🔔" color={C.red}/>
        <KPICard title="Insights" value="12" subtitle="Últimos 7 días" icon="🧠" color={C.purple}/>
        <KPICard title="Precisión IA" value="94.2%" icon="🎯" color={C.green}/>
        <KPICard title="Búsquedas Web" value="28" subtitle="Referencias verificadas" icon="🔍" color={C.blue2}/>
      </div>

      {/* BÚSQUEDA WEB DE REFERENCIAS */}
      <div style={{...sty.card,marginBottom:20,borderTop:`4px solid ${C.purple}`}}>
        <div style={{fontSize:16,fontWeight:700,color:C.navy,marginBottom:4}}>🔍 Búsqueda de Referencias en Línea</div>
        <p style={{fontSize:12,color:C.g400,marginBottom:14}}>Busca información pública del postulante: LinkedIn, noticias, redes sociales, publicaciones académicas</p>
        <div style={{display:"grid",gridTemplateColumns:"200px 1fr auto",gap:12,alignItems:"end"}}>
          <div>
            <label style={sty.label}>Postulante</label>
            <select style={sty.select} value={postSel} onChange={e=>{setPostSel(e.target.value);setBusqueda(e.target.value);setResultados(null)}}>
              <option value="">Seleccionar...</option>
              {POSTULANTES.map(p=><option key={p.id} value={p.nombre}>{p.nombre}</option>)}
            </select>
          </div>
          <div>
            <label style={sty.label}>O buscar por nombre / empresa</label>
            <input style={sty.input} placeholder="Ej: Carlos Mendoza Deloitte Perú" value={busqueda} onChange={e=>setBusqueda(e.target.value)}/>
          </div>
          <button onClick={hacerBusqueda} disabled={!busqueda} style={{...sty.btn,background:busqueda?C.purple:C.g200,color:busqueda?C.white:C.g400,cursor:busqueda?"pointer":"not-allowed",height:42}}>
            {buscando?"⏳ Buscando...":"🔍 Buscar Referencias"}
          </button>
        </div>

        {buscando && (
          <div style={{textAlign:"center",padding:30}}>
            <div style={{fontSize:24,marginBottom:10}}>🔄</div>
            <div style={{fontSize:14,color:C.g500}}>Buscando en LinkedIn, Google News, redes sociales...</div>
          </div>
        )}

        {resultados && !buscando && (
          <div style={{marginTop:16,padding:16,background:C.g50,borderRadius:14}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
              <div style={{fontSize:16,fontWeight:700,color:C.navy}}>Resultados para: {resultados.nombre}</div>
              <div style={{display:"flex",alignItems:"center",gap:8}}>
                <span style={{fontSize:12,color:C.g400}}>Score de confianza:</span>
                <span style={{fontSize:18,fontWeight:800,color:resultados.score>=80?C.green:resultados.score>=60?C.yellow:C.red}}>{resultados.score}%</span>
              </div>
            </div>

            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
              {/* LinkedIn */}
              <div style={{padding:14,background:C.white,borderRadius:12,border:`1px solid ${C.g100}`}}>
                <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10}}>
                  <span style={{fontSize:18}}>💼</span>
                  <span style={{fontSize:14,fontWeight:700,color:C.navy}}>LinkedIn</span>
                  {resultados.linkedin.encontrado && <span style={{padding:"2px 8px",borderRadius:10,background:"#dcfce7",color:C.green,fontSize:10,fontWeight:600}}>Encontrado</span>}
                </div>
                <div style={{fontSize:13,color:C.g700,marginBottom:4}}><strong>{resultados.linkedin.cargo}</strong></div>
                <div style={{fontSize:12,color:C.g500}}>{resultados.linkedin.empresa}</div>
                <div style={{fontSize:11,color:C.g400,marginTop:6}}>{resultados.linkedin.conexiones} conexiones · {resultados.linkedin.resumen}</div>
              </div>

              {/* Noticias */}
              <div style={{padding:14,background:C.white,borderRadius:12,border:`1px solid ${C.g100}`}}>
                <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10}}>
                  <span style={{fontSize:18}}>📰</span>
                  <span style={{fontSize:14,fontWeight:700,color:C.navy}}>Noticias y Menciones</span>
                </div>
                {resultados.noticias.map((n,i)=>(
                  <div key={i} style={{padding:8,background:C.g50,borderRadius:8,marginBottom:6,borderLeft:`3px solid ${n.relevancia==="positiva"?C.green:C.yellow}`}}>
                    <div style={{fontSize:12,fontWeight:600,color:C.g700}}>{n.titulo}</div>
                    <div style={{fontSize:11,color:C.g400}}>{n.fuente} · {n.fecha}</div>
                  </div>
                ))}
              </div>

              {/* Observaciones IA */}
              <div style={{padding:14,background:C.white,borderRadius:12,border:`1px solid ${C.g100}`}}>
                <div style={{fontSize:14,fontWeight:700,color:C.green,marginBottom:8}}>✅ Observaciones Positivas</div>
                {resultados.observaciones.map((o,i)=>(
                  <div key={i} style={{fontSize:12,color:C.g500,marginBottom:4,display:"flex",gap:6}}>
                    <span style={{color:C.green}}>•</span>{o}
                  </div>
                ))}
              </div>

              {/* Alertas */}
              <div style={{padding:14,background:C.white,borderRadius:12,border:`1px solid ${C.g100}`}}>
                <div style={{fontSize:14,fontWeight:700,color:C.yellow,marginBottom:8}}>⚠️ Alertas</div>
                {resultados.alertas.map((a,i)=>(
                  <div key={i} style={{fontSize:12,color:C.g500,marginBottom:4,display:"flex",gap:6}}>
                    <span style={{color:C.yellow}}>•</span>{a}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ALERTAS AUTOMÁTICAS */}
      <div style={{fontSize:16,fontWeight:700,color:C.navy,marginBottom:12}}>⚡ Alertas e Insights Automáticos</div>
      <div style={{display:"grid",gap:12}}>
        {ins.map((n,i)=>(
          <div key={i} style={{...sty.card,padding:"16px 20px",borderLeft:`4px solid ${n.t==="warning"?C.yellow:n.t==="success"?C.green:C.blue2}`,display:"flex",gap:16}}>
            <span style={{fontSize:24,flexShrink:0}}>{n.t==="warning"?"⚠️":n.t==="success"?"✅":"ℹ️"}</span>
            <div style={{flex:1}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <span style={{fontSize:15,fontWeight:700,color:C.navy}}>{n.ti}</span>
                <span style={{fontSize:11,fontWeight:600,padding:"3px 10px",borderRadius:12,background:n.sev==="alta"?"#fee2e2":n.sev==="media"?"#fef3c7":"#dcfce7",color:n.sev==="alta"?C.red:n.sev==="media"?C.yellow:C.green}}>{n.sev}</span>
              </div>
              <div style={{fontSize:13,color:C.g500,marginTop:4}}>{n.d}</div>
              <div style={{fontSize:12,color:C.g400,marginTop:4}}>Postulante: <strong>{n.p}</strong></div>
              <div style={{display:"flex",gap:6,marginTop:8,flexWrap:"wrap"}}>
                {n.acciones.map((a,j)=>(
                  <button key={j} style={{...sty.btnSm,background:`${C.blue2}10`,color:C.blue2,fontSize:11}}>{a}</button>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const CapacitacionesPage=()=>(<div><h1 style={{fontSize:24,fontWeight:800,color:C.navy,margin:"0 0 20px"}}>Capacitaciones</h1><div style={{display:"grid",gap:16}}>{CAPACITACIONES.map(c=><div key={c.id} style={{...sty.card,display:"flex",alignItems:"center",gap:20}}><div style={{width:56,height:56,borderRadius:14,background:c.cumplimiento===100?`${C.green}15`:`${C.yellow}15`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:24}}>{c.cumplimiento===100?"✅":"📚"}</div><div style={{flex:1}}><div style={{fontSize:15,fontWeight:700,color:C.navy}}>{c.nombre}</div><div style={{fontSize:12,color:C.g400}}>📅 {c.fecha}</div><div style={{marginTop:8,display:"flex",alignItems:"center",gap:8}}><ProgressBar value={c.cumplimiento}/><span style={{fontSize:12,fontWeight:600,color:C.g500}}>{c.cumplimiento}%</span></div></div><button style={{...sty.btnSm,background:`${C.blue2}15`,color:C.blue2}}>📤 Subir Certificado</button></div>)}</div></div>);

const PostulantesPage=({onNav})=>{
  const[search,setSearch]=useState("");
  const[filter,setFilter]=useState("Todos");
  const[posts,setPosts]=useState(POSTULANTES);
  const[detalle,setDetalle]=useState(null);
  const filtered=posts.filter(p=>{const ms=p.nombre.toLowerCase().includes(search.toLowerCase())||p.dni.includes(search);const mf=filter==="Todos"||p.estado===filter;return ms&&mf});
  
  const cambiarEstado=(id,nuevoEstado)=>{
    setPosts(prev=>prev.map(p=>p.id===id?{...p,estado:nuevoEstado}:p));
    setDetalle(null);
  };

  return (<div>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:24}}>
      <div><h1 style={{fontSize:24,fontWeight:800,color:C.navy,margin:0}}>Gestión de Postulantes y Trabajadores</h1><p style={{color:C.g400,fontSize:14,margin:"4px 0 0"}}>{posts.length} registrados · {posts.filter(p=>p.estado==="Trabajador").length} trabajadores activos</p></div>
      <button onClick={()=>onNav("ficha")} style={{...sty.btn,background:C.blue2,color:C.white}}>➕ Nuevo Postulante</button>
    </div>
    
    <div style={{...sty.card,marginBottom:16,display:"flex",gap:12,alignItems:"center",flexWrap:"wrap"}}>
      <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Buscar por nombre o DNI..." style={{...sty.input,flex:1,minWidth:200}}/>
      {["Todos","En Evaluación","Trabajador","Rechazado"].map(f=>
        <button key={f} onClick={()=>setFilter(f)} style={{...sty.btn,background:filter===f?(f==="Trabajador"?C.green:C.blue2):C.g100,color:filter===f?C.white:C.g500}}>{f}</button>
      )}
    </div>

    {detalle && (
      <div style={{...sty.card,marginBottom:16,borderLeft:`4px solid ${detalle.estado==="Trabajador"?C.green:C.blue2}`,background:detalle.estado==="Trabajador"?"#f0fdf4":C.light}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
          <div>
            <div style={{display:"flex",alignItems:"center",gap:10}}>
              <div style={{fontSize:18,fontWeight:800,color:C.navy}}>{detalle.nombre}</div>
              {detalle.estado==="Trabajador"&&<span style={{padding:"3px 10px",borderRadius:12,background:"#dcfce7",color:C.green,fontSize:11,fontWeight:700}}>👷 TRABAJADOR</span>}
            </div>
            <div style={{fontSize:13,color:C.g400,marginTop:2}}>{detalle.puesto} · DNI: {detalle.dni} · {detalle.email}</div>
          </div>
          <div style={{display:"flex",gap:6}}>
            {detalle.estado==="Trabajador"&&<button onClick={()=>{setDetalle(null);onNav("legajo")}} style={{...sty.btn,background:C.green,color:C.white}}>📂 Ver Legajo Completo</button>}
            <button onClick={()=>setDetalle(null)} style={{...sty.btnSm,background:C.g200,color:C.g500}}>✕</button>
          </div>
        </div>
        
        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12,marginTop:16}}>
          <div style={{padding:12,background:C.white,borderRadius:10,textAlign:"center"}}>
            <div style={{fontSize:11,color:C.g400,fontWeight:600}}>TÉCNICO</div>
            <div style={{fontSize:24,fontWeight:800,color:detalle.tecnico>=70?C.green:detalle.tecnico>=50?C.yellow:C.red}}>{detalle.tecnico}%</div>
          </div>
          <div style={{padding:12,background:C.white,borderRadius:10,textAlign:"center"}}>
            <div style={{fontSize:11,color:C.g400,fontWeight:600}}>PSICOLÓGICO</div>
            <div style={{fontSize:24,fontWeight:800,color:detalle.psicologico>=70?C.green:detalle.psicologico>=50?C.yellow:C.red}}>{detalle.psicologico}%</div>
          </div>
          <div style={{padding:12,background:C.white,borderRadius:10,textAlign:"center"}}>
            <div style={{fontSize:11,color:C.g400,fontWeight:600}}>ENTREVISTA</div>
            <div style={{fontSize:24,fontWeight:800,color:detalle.entrevista>=70?C.green:detalle.entrevista>=50?C.yellow:detalle.entrevista>0?C.red:C.g300}}>{detalle.entrevista||"—"}%</div>
          </div>
          <div style={{padding:12,background:C.white,borderRadius:10,textAlign:"center"}}>
            <div style={{fontSize:11,color:C.g400,fontWeight:600}}>RIESGO</div>
            <div style={{marginTop:4}}><RiskBadge r={detalle.riesgo}/></div>
          </div>
        </div>

        {detalle.estado!=="Trabajador"&&<>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginTop:16}}>
            <div><label style={sty.label}>Observaciones del evaluador</label><textarea style={{...sty.input,minHeight:60}} placeholder="Agregar observaciones..."/></div>
            <div><label style={sty.label}>Recomendación</label><textarea style={{...sty.input,minHeight:60}} placeholder="Justificación de la decisión..."/></div>
          </div>
          <div style={{display:"flex",gap:12,marginTop:16,paddingTop:16,borderTop:`2px solid ${C.g200}`}}>
            <button onClick={()=>cambiarEstado(detalle.id,"Trabajador")} style={{...sty.btn,background:C.green,color:C.white,flex:1,padding:14,fontSize:15}}>
              ✅ APROBAR → Pasa a TRABAJADOR
            </button>
            <button onClick={()=>cambiarEstado(detalle.id,"Rechazado")} style={{...sty.btn,background:C.red,color:C.white,flex:1,padding:14,fontSize:15}}>
              ❌ RECHAZAR POSTULANTE
            </button>
            <button onClick={()=>cambiarEstado(detalle.id,"En Evaluación")} style={{...sty.btn,background:C.yellow,color:C.white,padding:14}}>
              ⏳ Evaluación Adicional
            </button>
          </div>
        </>}
        
        {detalle.estado==="Trabajador"&&(
          <div style={{marginTop:12,padding:14,background:"#dcfce7",borderRadius:12,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <div>
              <div style={{fontSize:14,fontWeight:700,color:C.green}}>✅ TRABAJADOR ACTIVO</div>
              <div style={{fontSize:12,color:"#166534",marginTop:2}}>Acceso completo habilitado: Firma Digital, Derechohabientes, Datos Bancarios, Régimen Pensionario, Docs. Digitales, Capacitaciones</div>
            </div>
            <button onClick={()=>{setDetalle(null);onNav("legajo")}} style={{...sty.btn,background:C.green,color:C.white,flexShrink:0}}>📂 Abrir Legajo</button>
          </div>
        )}
      </div>
    )}

    <div style={{display:"grid",gap:12}}>
      {filtered.map(p=>(
        <div key={p.id} style={{...sty.card,padding:"16px 24px",display:"flex",alignItems:"center",gap:16}}>
          <div style={{width:48,height:48,borderRadius:"50%",background:`linear-gradient(135deg,${C.blue2},${C.cyan})`,display:"flex",alignItems:"center",justifyContent:"center",color:C.white,fontSize:16,fontWeight:700,flexShrink:0}}>
            {p.nombre.split(" ").map(n=>n[0]).join("")}
          </div>
          <div style={{flex:1}}>
            <div style={{fontSize:15,fontWeight:700,color:C.g700}}>{p.nombre}</div>
            <div style={{fontSize:12,color:C.g400}}>{p.puesto} · DNI: {p.dni}</div>
          </div>
          <div style={{width:120}}>
            <div style={{fontSize:11,color:C.g400,marginBottom:4}}>Avance: {p.avance}%</div>
            <ProgressBar value={p.avance}/>
          </div>
          <div style={{display:"flex",gap:6,alignItems:"center"}}>
            <div style={{fontSize:11,textAlign:"center",width:40}}><div style={{fontWeight:700,color:C.blue2}}>{p.tecnico}</div><div style={{color:C.g400}}>TEC</div></div>
            <div style={{fontSize:11,textAlign:"center",width:40}}><div style={{fontWeight:700,color:C.purple}}>{p.psicologico}</div><div style={{color:C.g400}}>PSI</div></div>
            <div style={{fontSize:11,textAlign:"center",width:40}}><div style={{fontWeight:700,color:C.green}}>{p.entrevista||"—"}</div><div style={{color:C.g400}}>ENT</div></div>
          </div>
          <RiskBadge r={p.riesgo}/>
          <StatusBadge estado={p.estado}/>
          <button onClick={()=>setDetalle(p)} style={{...sty.btnSm,background:C.navy,color:C.white}}>Evaluar</button>
        </div>
      ))}
    </div>
  </div>);
};

const DocumentosPage=()=>{const docs=[{n:"DNI",r:true,s:"ok"},{n:"CV",r:true,s:"ok"},{n:"Foto Pasaporte (4x4cm)",r:true,s:"pending"},{n:"Certificados Estudio",r:true,s:"ok"},{n:"Constancias Laborales",r:true,s:"ok"},{n:"Licencia Conducir",r:false,s:"na"},{n:"Antecedentes Policiales",r:false,s:"pending"},{n:"Antecedentes Penales",r:false,s:"pending"},{n:"Certificado Médico",r:false,s:"pending"},{n:"RUC",r:false,s:"na"},{n:"Certificados Capacitación",r:false,s:"ok"},{n:"Otros",r:false,s:"na"}];const up=docs.filter(d=>d.s==="ok").length;return(<div><h1 style={{fontSize:24,fontWeight:800,color:C.navy,margin:"0 0 20px"}}>Carga de Documentos</h1><div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:16,marginBottom:20}}><KPICard title="Subidos" value={`${up}/${docs.length}`} icon="📤" color={C.blue2}/><KPICard title="Obligatorios" value="4/5" subtitle="⚠️ Falta foto" icon="📋" color={C.yellow}/><KPICard title="Completitud" value={`${Math.round(up/docs.length*100)}%`} icon="📊" color={C.purple}/></div><div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>{docs.map((d,i)=><div key={i} style={{...sty.card,padding:"14px 18px",display:"flex",alignItems:"center",gap:14,borderLeft:`4px solid ${d.s==="ok"?C.green:d.s==="pending"?C.yellow:C.g200}`}}><div style={{flex:1}}><div style={{fontSize:14,fontWeight:600,color:C.g700}}>{d.n} {d.r&&<span style={{color:C.red}}>*</span>}</div><div style={{fontSize:12,color:d.s==="ok"?C.green:C.g400}}>{d.s==="ok"?"✅ Subido":d.s==="pending"?"⏳ Pendiente":"— N/A"}</div></div>{d.s!=="ok"&&d.s!=="na"&&<button style={{...sty.btnSm,background:`${C.blue2}12`,color:C.blue2}}>📤 Subir</button>}</div>)}</div></div>)};

const SeguridadPage=()=>(<div><h1 style={{fontSize:24,fontWeight:800,color:C.navy,margin:"0 0 20px"}}>Seguridad y Roles</h1><div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>{[{r:"Administrador",d:"Control total del sistema",p:["Crear/editar postulantes","Evaluar y aprobar/rechazar","Gestionar usuarios y accesos","Crear pruebas por puesto","Generar reportes y legajos","IA Insights y búsqueda web","Configurar parámetros","Embudo de reclutamiento"],c:C.red,i:"🛡️"},{r:"Evaluador",d:"Evalúa y aprueba postulantes",p:["Ver postulantes asignados","Registrar evaluaciones","Aprobar → Trabajador","Ver legajo de trabajadores","Generar reportes de trabajadores"],c:C.blue2,i:"📋"},{r:"Postulante",d:"Completa su proceso de ingreso",p:["Completar ficha personal","Rendir evaluaciones","Subir documentos","Ver entrevistas programadas","NO tiene acceso a firmas ni bancario"],c:C.cyan,i:"👤"},{r:"Trabajador",d:"Postulante aprobado — acceso completo",p:["Todo lo del postulante","Firma digital de documentos","Registrar derechohabientes","Datos bancarios (sueldo + CTS)","Régimen pensionario (AFP/ONP)","Aceptar docs. digitales","Capacitaciones"],c:C.green,i:"👷"}].map(r=><div key={r.r} style={{...sty.card,borderTop:`4px solid ${r.c}`}}><div style={{display:"flex",alignItems:"center",gap:10,marginBottom:12}}><span style={{fontSize:24}}>{r.i}</span><div><div style={{fontSize:16,fontWeight:700,color:C.navy}}>{r.r}</div><div style={{fontSize:12,color:C.g400}}>{r.d}</div></div></div>{r.p.map(p=><div key={p} style={{display:"flex",alignItems:"center",gap:8,fontSize:13,color:C.g500,marginBottom:4}}>✓ {p}</div>)}</div>)}</div></div>);

const ConfigPage=()=>(<div><h1 style={{fontSize:24,fontWeight:800,color:C.navy,margin:"0 0 20px"}}>Configuración</h1><div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}><div style={sty.card}><div style={{fontSize:15,fontWeight:700,color:C.navy,marginBottom:16}}>Datos de la Empresa</div><div style={{display:"grid",gap:12}}><div><label style={sty.label}>Razón Social</label><input defaultValue="Aquarius Consulting SAC" style={sty.input}/></div><div><label style={sty.label}>RUC</label><input defaultValue="20XXXXXXXXX" style={sty.input}/></div><div><label style={sty.label}>Correo</label><input defaultValue="rrhh@aquariusconsulting.pe" style={sty.input}/></div></div></div><div style={sty.card}><div style={{fontSize:15,fontWeight:700,color:C.navy,marginBottom:16}}>Parámetros</div><div style={{display:"grid",gap:12}}><div><label style={sty.label}>Puntaje mín. técnico</label><input type="number" defaultValue="60" style={sty.input}/></div><div><label style={sty.label}>Puntaje mín. psicológico</label><input type="number" defaultValue="55" style={sty.input}/></div><div><label style={sty.label}>Días máx. proceso</label><input type="number" defaultValue="15" style={sty.input}/></div></div></div></div></div>);

// ═══════════════════════════════════════════════════════════════
// LOGIN + MAIN APP — 4 Perfiles: Admin, Evaluador, Postulante, Trabajador
// ═══════════════════════════════════════════════════════════════
export default function App({ onBack }){
  const[loggedIn,setLoggedIn]=useState(false);
  const[rol,setRol]=useState("admin");
  const[page,setPage]=useState("");
  const[collapsed,setCollapsed]=useState(false);

  useEffect(()=>{
    if(loggedIn && !page){
      setPage((rol==="postulante"||rol==="trabajador") ? "ficha" : "dashboard");
    }
  },[loggedIn,rol]);

  const rolesLogin = [
    { id:"admin", icon:"🛡️", label:"Administrador", desc:"Control total del sistema", color:C.navy },
    { id:"evaluador", icon:"📋", label:"Evaluador", desc:"Evalúa y aprueba postulantes", color:C.blue2 },
    { id:"postulante", icon:"👤", label:"Postulante", desc:"Completa proceso de ingreso", color:C.cyan },
    { id:"trabajador", icon:"👷", label:"Trabajador", desc:"Postulante aprobado", color:C.green },
  ];

  if(!loggedIn) return (
    <div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",background:`linear-gradient(135deg,${C.navy} 0%,${C.blue1} 50%,${C.blue2} 100%)`,position:"relative",overflow:"hidden",fontFamily:"'DM Sans',sans-serif"}}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet"/>
      <div style={{position:"absolute",top:0,left:0,right:0,bottom:0,opacity:0.08}}>{Array.from({length:15}).map((_,i)=><div key={i} style={{position:"absolute",width:2+Math.random()*200,height:2+Math.random()*200,borderRadius:"50%",border:"1px solid rgba(255,255,255,0.3)",top:`${Math.random()*100}%`,left:`${Math.random()*100}%`}}/>)}</div>
      <div style={{background:"rgba(255,255,255,0.97)",borderRadius:24,padding:48,width:520,boxShadow:"0 20px 60px rgba(0,0,0,0.3)",position:"relative"}}>
        <div style={{textAlign:"center",marginBottom:28}}><Logo size={64}/><h1 style={{fontSize:22,fontWeight:800,color:C.navy,margin:"16px 0 4px",letterSpacing:2}}>AQUARIUS CONSULTING</h1><p style={{fontSize:12,color:C.g400,letterSpacing:3,margin:0}}>SISTEMA INTEGRAL DE GESTIÓN RRHH</p></div>
        <div style={{display:"grid",gap:14}}>
          <div><label style={sty.label}>Seleccione su perfil</label>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
              {rolesLogin.map(r=>(
                <button key={r.id} onClick={()=>setRol(r.id)} style={{
                  ...sty.btn,padding:"14px 10px",background:rol===r.id?r.color:C.g50,
                  color:rol===r.id?C.white:C.g500,border:`2px solid ${rol===r.id?r.color:C.g200}`,
                  borderRadius:14,textAlign:"center",display:"flex",flexDirection:"column",alignItems:"center",gap:4,
                }}>
                  <span style={{fontSize:22}}>{r.icon}</span>
                  <span style={{fontSize:12,fontWeight:700}}>{r.label}</span>
                  <span style={{fontSize:9,opacity:0.7,lineHeight:1.2}}>{r.desc}</span>
                </button>
              ))}
            </div>
          </div>
          <div><label style={sty.label}>{(rol==="postulante"||rol==="trabajador")?"DNI":"Email corporativo"}</label><input style={sty.input} placeholder={(rol==="postulante"||rol==="trabajador")?"Ingrese su DNI":"usuario@aquariusconsulting.pe"}/></div>
          <div><label style={sty.label}>Contraseña</label><input type="password" style={sty.input} defaultValue="abc123"/></div>
          <button onClick={()=>{setLoggedIn(true);setPage((rol==="postulante"||rol==="trabajador")?"ficha":"dashboard")}} style={{
            ...sty.btn,background:`linear-gradient(135deg,${rolesLogin.find(r=>r.id===rol)?.color||C.blue2},${C.blue1})`,
            color:C.white,padding:14,fontSize:15,fontWeight:700,width:"100%",borderRadius:12
          }}>
            Ingresar como {rolesLogin.find(r=>r.id===rol)?.label}
          </button>
        </div>
        {onBack && <button onClick={onBack} style={{...sty.btnSm,background:C.g100,color:C.g500,width:"100%",marginTop:12}}>← Volver al Inicio</button>}
        <p style={{textAlign:"center",fontSize:11,color:C.g400,marginTop:14}}>¿Problemas? rrhh@aquariusconsulting.pe</p>
      </div>
    </div>
  );

  // ─── Pages por perfil ───
  const postPages={
    ficha:<FichaCompletaPage/>,
    evaluaciones:<PostulanteEvaluacionesPage/>,
    documentos:<DocumentosPage/>,
  };
  const trabajadorPages={
    ficha:<FichaCompletaPage/>,
    evaluaciones:<PostulanteEvaluacionesPage/>,
    documentos:<DocumentosPage/>,
    firmas:<FirmasPage/>,
    derechohabientes:<DerechohabientesPage/>,
    bancario:<BancarioPage/>,
    pensionario:<PensionarioPage/>,
    docsfirmados:<DocsFirmadosPage/>,
    capacitaciones:<CapacitacionesPage/>,
  };
  const adminPages={
    dashboard:<DashboardPage onNav={setPage}/>,
    postulantes:<PostulantesPage onNav={setPage}/>,
    evaluaciones:<AdminEvaluacionesPage/>,
    legajo:<LegajoPage/>,
    embudo:<EmbudoPage/>,
    ia:<IAPage/>,
    admin:<AdminPage/>,
    seguridad:<SeguridadPage/>,
    config:<ConfigPage/>,
  };
  const evaluadorPages={
    dashboard:<DashboardPage onNav={setPage}/>,
    postulantes:<PostulantesPage onNav={setPage}/>,
    evaluaciones:<AdminEvaluacionesPage/>,
    legajo:<LegajoPage/>,
  };
  const pagesMap = { admin:adminPages, evaluador:evaluadorPages, postulante:postPages, trabajador:trabajadorPages };
  const pages = pagesMap[rol] || postPages;
  const defaultPage = (rol==="postulante"||rol==="trabajador") ? "ficha" : "dashboard";
  const userNames = { admin:"Admin RRHH", evaluador:"María Segovia", postulante:"Carlos Mendoza", trabajador:"María López" };
  const userInits = { admin:"AR", evaluador:"MS", postulante:"CM", trabajador:"ML" };
  const userName = userNames[rol] || "Usuario";
  const userInitials = userInits[rol] || "U";
  const rolLabelsH = { admin:"Administrador", evaluador:"Evaluador", postulante:"Postulante", trabajador:"Trabajador" };
  const userSub = rolLabelsH[rol] || "Usuario";
  const rolGradients = { admin:`linear-gradient(135deg,${C.navy},${C.blue1})`, evaluador:`linear-gradient(135deg,${C.blue2},${C.blue1})`, postulante:`linear-gradient(135deg,${C.blue2},${C.cyan})`, trabajador:`linear-gradient(135deg,${C.green},${C.cyan})` };

  return (
    <div style={{display:"flex",minHeight:"100vh",background:C.g50,fontFamily:"'DM Sans','Segoe UI',sans-serif"}}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet"/>
      <Sidebar active={page} onNav={setPage} collapsed={collapsed} rol={rol}/>
      <div style={{flex:1,marginLeft:collapsed?72:250,transition:"margin-left 0.3s"}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"12px 32px",background:C.white,borderBottom:`1px solid ${C.g100}`,position:"sticky",top:0,zIndex:50}}>
          <div style={{display:"flex",alignItems:"center",gap:12}}>
            <button onClick={()=>setCollapsed(!collapsed)} style={{background:"none",border:"none",cursor:"pointer",padding:4,color:C.g400}}><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg></button>
            <span style={{fontSize:13,color:C.g400}}>{new Date().toLocaleDateString("es-PE",{weekday:"long",year:"numeric",month:"long",day:"numeric"})}</span>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:12}}>
            {rol==="postulante"&&<span style={{padding:"4px 12px",borderRadius:20,background:"#fef3c7",color:C.yellow,fontSize:11,fontWeight:600}}>⏳ En Evaluación</span>}
            {rol==="trabajador"&&<span style={{padding:"4px 12px",borderRadius:20,background:"#dcfce7",color:C.green,fontSize:11,fontWeight:600}}>👷 Trabajador Activo</span>}
            {(rol==="admin"||rol==="evaluador")&&<div style={{position:"relative"}}><span style={{fontSize:20,cursor:"pointer"}}>🔔</span><span style={{position:"absolute",top:-4,right:-4,width:16,height:16,borderRadius:"50%",background:C.red,color:C.white,fontSize:9,fontWeight:700,display:"flex",alignItems:"center",justifyContent:"center"}}>4</span></div>}
            <div style={{display:"flex",alignItems:"center",gap:10}}>
              <div style={{width:34,height:34,borderRadius:"50%",background:rolGradients[rol],display:"flex",alignItems:"center",justifyContent:"center",color:C.white,fontSize:13,fontWeight:700}}>{userInitials}</div>
              <div><div style={{fontSize:13,fontWeight:600,color:C.g700}}>{userName}</div><div style={{fontSize:11,color:C.g400}}>{userSub}</div></div>
            </div>
            <button onClick={()=>{setLoggedIn(false);setPage("");setRol("admin")}} style={{...sty.btnSm,background:`${C.red}10`,color:C.red}}>Salir</button>
            {onBack&&<button onClick={onBack} style={{...sty.btnSm,background:`${C.blue2}10`,color:C.blue2}}>← Inicio</button>}
          </div>
        </div>
        {rol==="postulante"&&(
          <div style={{padding:"8px 32px",background:"#fef3c7",fontSize:12,color:C.yellow,fontWeight:600}}>
            ⏳ Su postulación está en proceso. Complete su ficha, evaluaciones y documentos.
          </div>
        )}
        {rol==="trabajador"&&(
          <div style={{padding:"8px 32px",background:"#dcfce7",fontSize:12,color:C.green,fontWeight:600}}>
            👷 Bienvenido/a. Tiene acceso completo a todos los módulos. Complete su información para iniciar labores.
          </div>
        )}
        <div style={{padding:32}}>{pages[page]||pages[defaultPage]}</div>
      </div>
    </div>
  );
}
