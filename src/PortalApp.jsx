import { useState, useRef } from "react";
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from "recharts";

/* ═══════════════════════════════════════════════════════════════
   AQUARIUS CONSULTING SAC — PORTAL DEL POSTULANTE
   Versión Corregida — Datos Bancarios + Pensionario + IA
   ═══════════════════════════════════════════════════════════════ */

const C={navy:"#0a1f3d",blue1:"#0d4f8b",blue2:"#1a7ec5",cyan:"#3ec6e0",light:"#e8f4f8",white:"#fff",g50:"#f8fafc",g100:"#f1f5f9",g200:"#e2e8f0",g300:"#cbd5e1",g400:"#94a3b8",g500:"#64748b",g700:"#334155",green:"#10b981",yellow:"#f59e0b",red:"#ef4444",purple:"#8b5cf6",orange:"#f97316"};

const BANCOS=["Banco de Crédito del Perú (BCP)","BBVA Perú","Interbank","Scotiabank Perú","Banco de la Nación","Banco Pichincha","Banco Falabella","Banco Ripley","Banco GNB Perú","Banco Santander Perú","BanBif","MiBanco","Compartamos Banco","Banco BTG Pactual Perú","Banco de Comercio","Banco Alfin"];
const FINANCIERAS=["Financiera Oh!","Financiera Proempresa","Financiera Credinka","Financiera Confianza","Financiera Efectiva","Financiera Qapaq","Financiera Surgir","Kori Financiera"];
const CAJAS=["Caja Arequipa","Caja Huancayo","Caja Cusco","Caja Piura","Caja Sullana","Caja Trujillo","Caja Tacna"];
const TODAS_ENT=[...BANCOS,...FINANCIERAS,...CAJAS].sort();
const AFP_LIST=["AFP Integra","AFP Prima","AFP Habitat","AFP Profuturo"];

const st={
  btn:{padding:"10px 20px",borderRadius:10,border:"none",fontSize:13,fontWeight:600,cursor:"pointer",transition:"all 0.2s"},
  bS:{padding:"6px 12px",borderRadius:8,border:"none",fontSize:12,fontWeight:500,cursor:"pointer"},
  cd:{background:C.white,borderRadius:16,padding:24,boxShadow:"0 1px 4px rgba(0,0,0,0.06)",border:`1px solid ${C.g100}`},
  inp:{width:"100%",padding:"10px 14px",borderRadius:10,border:`1.5px solid ${C.g200}`,fontSize:14,outline:"none",boxSizing:"border-box"},
  sel:{width:"100%",padding:"10px 14px",borderRadius:10,border:`1.5px solid ${C.g200}`,fontSize:14,outline:"none",boxSizing:"border-box",background:C.white},
  lab:{fontSize:11,fontWeight:700,color:C.g400,marginBottom:4,display:"block",textTransform:"uppercase",letterSpacing:"0.6px"},
};

const Logo=({sz=36})=>(
  <svg width={sz} height={sz} viewBox="0 0 100 100">
    <defs><linearGradient id="plg" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor={C.cyan}/><stop offset="100%" stopColor={C.blue1}/></linearGradient></defs>
    <circle cx="50" cy="50" r="45" fill="url(#plg)" opacity="0.15"/>
    <circle cx="50" cy="50" r="35" fill="none" stroke="url(#plg)" strokeWidth="2"/>
    <path d="M30 35 L50 25 L70 35 L75 55 L60 70 L40 70 L25 55 Z" fill="none" stroke={C.blue2} strokeWidth="1.5"/>
    <circle cx="50" cy="50" r="4" fill={C.cyan}/>
  </svg>
);

const F=({label:l,type="text",placeholder="",options,span=1,required,value,onChange})=>(
  <div style={{gridColumn:`span ${span}`}}>
    <label style={st.lab}>{l} {required&&<span style={{color:C.red}}>*</span>}</label>
    {type==="select" ? (
      <select style={st.sel} value={value||""} onChange={onChange}>
        <option value="">Seleccionar...</option>
        {options?.map(o=>typeof o==="string"?<option key={o} value={o}>{o}</option>:<option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    ) : type==="textarea" ? (
      <textarea style={{...st.inp,minHeight:70,resize:"vertical"}} placeholder={placeholder} value={value} onChange={onChange}/>
    ) : type==="file" ? (
      <input type="file" style={{...st.inp,padding:8}} onChange={onChange}/>
    ) : (
      <input type={type} style={st.inp} placeholder={placeholder} value={value} onChange={onChange}/>
    )}
  </div>
);

const Ring=({val,sz=80,sw=8,col=C.blue2})=>{
  const r=(sz-sw)/2, ci=2*Math.PI*r, of=ci-(val/100)*ci;
  return (
    <svg width={sz} height={sz} style={{transform:"rotate(-90deg)"}}>
      <circle cx={sz/2} cy={sz/2} r={r} fill="none" stroke={C.g100} strokeWidth={sw}/>
      <circle cx={sz/2} cy={sz/2} r={r} fill="none" stroke={col} strokeWidth={sw} strokeDasharray={ci} strokeDashoffset={of} strokeLinecap="round" style={{transition:"stroke-dashoffset 0.8s"}}/>
      <text x={sz/2} y={sz/2+6} textAnchor="middle" fill={C.navy} fontSize={sz>60?20:14} fontWeight="800" style={{transform:"rotate(90deg)",transformOrigin:"center"}}>{val}%</text>
    </svg>
  );
};

const PBar=({val,h=6})=>(
  <div style={{width:"100%",height:h,borderRadius:h,background:C.g200,overflow:"hidden"}}>
    <div style={{width:`${val}%`,height:"100%",borderRadius:h,background:val>=80?C.green:val>=50?C.yellow:C.red,transition:"width 0.6s"}}/>
  </div>
);

const SPad=({onSave,h=110})=>{
  const ref=useRef(null);
  const[dr,setDr]=useState(false);
  const[has,setHas]=useState(false);
  const gc=(e)=>{const r2=ref.current.getBoundingClientRect();const cx=e.touches?e.touches[0].clientX:e.clientX;const cy=e.touches?e.touches[0].clientY:e.clientY;return{x:cx-r2.left,y:cy-r2.top}};
  return (
    <div>
      <canvas ref={ref} width={380} height={h}
        style={{border:`1.5px dashed ${C.g300}`,borderRadius:10,cursor:"crosshair",width:"100%",height:h,touchAction:"none",background:C.g50}}
        onMouseDown={e=>{e.preventDefault();const ctx=ref.current.getContext("2d");const{x,y}=gc(e);ctx.beginPath();ctx.moveTo(x,y);setDr(true)}}
        onMouseMove={e=>{if(!dr)return;e.preventDefault();const ctx=ref.current.getContext("2d");const{x,y}=gc(e);ctx.lineTo(x,y);ctx.strokeStyle=C.navy;ctx.lineWidth=2;ctx.lineCap="round";ctx.stroke();setHas(true)}}
        onMouseUp={()=>setDr(false)} onMouseLeave={()=>setDr(false)}
        onTouchStart={e=>{e.preventDefault();const ctx=ref.current.getContext("2d");const{x,y}=gc(e);ctx.beginPath();ctx.moveTo(x,y);setDr(true)}}
        onTouchMove={e=>{if(!dr)return;e.preventDefault();const ctx=ref.current.getContext("2d");const{x,y}=gc(e);ctx.lineTo(x,y);ctx.strokeStyle=C.navy;ctx.lineWidth=2;ctx.lineCap="round";ctx.stroke();setHas(true)}}
        onTouchEnd={()=>setDr(false)}
      />
      <div style={{display:"flex",gap:8,marginTop:8}}>
        <button onClick={()=>{ref.current.getContext("2d").clearRect(0,0,380,h);setHas(false)}} style={{...st.bS,background:C.g100,color:C.g500}}>Limpiar</button>
        <button onClick={()=>has&&onSave?.(ref.current.toDataURL())} style={{...st.bS,background:C.green,color:C.white,opacity:has?1:0.4}}>Firmar</button>
      </div>
    </div>
  );
};

const Cal=({events,onSelect})=>{
  const[mes,setMes]=useState(new Date(2026,3,1));
  const dm=new Date(mes.getFullYear(),mes.getMonth()+1,0).getDate();
  const pd=new Date(mes.getFullYear(),mes.getMonth(),1).getDay();
  const dias=Array.from({length:42},(_,i)=>{const d=i-pd+1;return d>0&&d<=dm?d:null});
  const tiene=(d)=>events?.find(e=>{const dt=new Date(e.fecha);return dt.getDate()===d&&dt.getMonth()===mes.getMonth()});
  const ms=["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];
  const ct={tecnica:C.blue2,psicologica:C.purple,entrevista:C.green};
  return (
    <div style={st.cd}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
        <button onClick={()=>setMes(new Date(mes.getFullYear(),mes.getMonth()-1,1))} style={{...st.bS,background:C.g100}}>◀</button>
        <span style={{fontSize:16,fontWeight:700,color:C.navy}}>{ms[mes.getMonth()]} {mes.getFullYear()}</span>
        <button onClick={()=>setMes(new Date(mes.getFullYear(),mes.getMonth()+1,1))} style={{...st.bS,background:C.g100}}>▶</button>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:2,textAlign:"center"}}>
        {"Do,Lu,Ma,Mi,Ju,Vi,Sá".split(",").map(d=><div key={d} style={{fontSize:10,fontWeight:700,color:C.g400,padding:5}}>{d}</div>)}
        {dias.map((d,i)=>{const ev=d?tiene(d):null;return (
          <div key={i} onClick={()=>ev&&onSelect?.(ev)} style={{padding:7,borderRadius:10,fontSize:13,fontWeight:500,color:!d?"transparent":ev?C.white:C.g700,background:ev?ct[ev.tipo]||C.blue2:"transparent",cursor:ev?"pointer":"default"}}>{d||""}</div>
        )})}
      </div>
    </div>
  );
};

const Sec=({icon,title,sub})=>(
  <div style={{gridColumn:"span 4",borderBottom:`2px solid ${C.g100}`,paddingBottom:8,marginBottom:4}}>
    <div style={{fontSize:16,fontWeight:700,color:C.navy}}>{icon} {title}</div>
    {sub&&<div style={{fontSize:12,color:C.g400,marginTop:2}}>{sub}</div>}
  </div>
);

const PREGUNTAS=[
  {id:1,q:"¿Cuál es la fórmula del WACC?",opts:["a) Costo deuda + Costo equity","b) Wd*Kd*(1-T) + We*Ke","c) EBITDA / Ventas","d) Activo / Pasivo"],correct:1},
  {id:2,q:"El VAN positivo indica que:",opts:["a) Destruye valor","b) Es indiferente","c) Genera valor sobre tasa requerida","d) Ninguna"],correct:2},
  {id:3,q:"¿Qué estado financiero muestra la liquidez?",opts:["a) Estado de Resultados","b) Balance General","c) Flujo de Efectivo","d) Cambios en Patrimonio"],correct:2},
  {id:4,q:"La TIR es la tasa que hace el VAN igual a:",opts:["a) 1","b) -1","c) 0","d) Infinito"],correct:2},
  {id:5,q:"¿Cuál NO es un ratio de liquidez?",opts:["a) Razón corriente","b) Prueba ácida","c) ROE","d) Capital de trabajo"],correct:2},
];

// ═══════════════════════════════════════════════════════════════
// MAIN APP
// ═══════════════════════════════════════════════════════════════
export default function App({ onBack }) {
  const [loggedIn, setLoggedIn] = useState(false);
  const [page, setPage] = useState("inicio");
  const [aprobado, setAprobado] = useState(false);
  const [firmas, setFirmas] = useState({});
  const [resp, setResp] = useState({});
  const [evalEnv, setEvalEnv] = useState(false);
  const [selEv, setSelEv] = useState(null);
  const [acept, setAcept] = useState({});

  const entrevistas = [
    {fecha:"2026-04-05",tipo:"tecnica",hora:"10:00 AM",lugar:"Virtual — Google Meet",evaluador:"Ing. Carlos Medina",duracion:"45 min"},
    {fecha:"2026-04-08",tipo:"psicologica",hora:"2:00 PM",lugar:"Oficina Central — Sala 3B",evaluador:"Lic. María Segovia",duracion:"60 min"},
    {fecha:"2026-04-15",tipo:"entrevista",hora:"11:00 AM",lugar:"Virtual — Zoom",evaluador:"Gerente RRHH",duracion:"30 min"},
  ];

  const docs = [
    {n:"DNI",req:true,s:"ok"},{n:"CV",req:true,s:"ok"},
    {n:"Foto Pasaporte (4x4cm)",req:true,s:"pending"},{n:"Certificados Estudio",req:true,s:"ok"},
    {n:"Constancias Laborales",req:true,s:"ok"},{n:"Licencia Conducir",req:false,s:"na"},
    {n:"Antecedentes Policiales",req:false,s:"pending"},{n:"Antecedentes Penales",req:false,s:"pending"},
    {n:"Certificado Médico",req:false,s:"pending"},{n:"Cert. Capacitación",req:false,s:"ok"},
  ];

  const dU = docs.filter(d=>d.s==="ok").length;
  const fN = Object.keys(firmas).length;
  const rN = Object.keys(resp).length;
  const avance = Math.round(((dU/docs.length)*30 + (fN/8)*30 + (rN>0?20:0) + 20));
  const bloq = ["firmas","derechohabientes","bancario","pensionario","docsfirmados","capacitaciones"];

  const navBase = [
    {id:"inicio",icon:"🏠",l:"Inicio"},{id:"ficha",icon:"📋",l:"Mi Ficha"},
    {id:"evaluaciones",icon:"📊",l:"Evaluaciones"},{id:"documentos",icon:"📁",l:"Documentos"},
    {id:"entrevistas",icon:"📅",l:"Entrevistas"},
  ];
  const navApr = [
    {id:"firmas",icon:"✍️",l:"Firma Digital"},{id:"derechohabientes",icon:"👨‍👩‍👧",l:"Derechohabientes"},
    {id:"bancario",icon:"🏦",l:"Datos Bancarios"},{id:"pensionario",icon:"🏛️",l:"Rég. Pensionario"},
    {id:"docsfirmados",icon:"📄",l:"Docs. Digitales"},{id:"capacitaciones",icon:"📚",l:"Capacitaciones"},
  ];
  const navItems = aprobado ? [...navBase,...navApr] : navBase;

  // ─── LOGIN ───
  if (!loggedIn) return (
    <div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",background:`linear-gradient(135deg,${C.navy},${C.blue2})`,fontFamily:"'DM Sans',sans-serif"}}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet"/>
      <div style={{background:"rgba(255,255,255,0.97)",borderRadius:28,padding:"48px 44px",width:400,boxShadow:"0 24px 60px rgba(0,0,0,0.25)"}}>
        <div style={{textAlign:"center",marginBottom:28}}>
          <Logo sz={56}/>
          <h1 style={{fontSize:18,fontWeight:800,color:C.navy,margin:"14px 0 2px",letterSpacing:2}}>AQUARIUS CONSULTING</h1>
          <p style={{fontSize:11,color:C.g400,letterSpacing:3,margin:0}}>PORTAL DEL POSTULANTE</p>
        </div>
        <div style={{display:"grid",gap:14}}>
          <div><label style={st.lab}>DNI</label><input style={st.inp} placeholder="Ingrese su DNI" defaultValue="45678912"/></div>
          <div><label style={st.lab}>Contraseña</label><input type="password" style={st.inp} defaultValue="abc123"/></div>
          <button onClick={()=>setLoggedIn(true)} style={{...st.btn,background:`linear-gradient(135deg,${C.blue2},${C.navy})`,color:C.white,padding:14,fontSize:15,width:"100%",borderRadius:12}}>
            Ingresar
          </button>
        </div>
        {onBack && <button onClick={onBack} style={{...st.bS,background:C.g100,color:C.g500,width:"100%",marginTop:12}}>← Volver al Inicio</button>}
      </div>
    </div>
  );

  // ═══════════════════════════════════════════════════════════════
  // DATOS BANCARIOS — CORREGIDO
  // ═══════════════════════════════════════════════════════════════
  const PBanco = () => {
    const [tieneSueldo, setTieneSueldo] = useState("");
    const [bancoSueldo, setBancoSueldo] = useState("");
    const [monedaSueldo, setMonedaSueldo] = useState("");
    const [nroCuenta, setNroCuenta] = useState("");
    const [cci, setCci] = useState("");
    const [bancoApertura, setBancoApertura] = useState("");
    const [monedaApertura, setMonedaApertura] = useState("");

    const [tieneCTS, setTieneCTS] = useState("");
    const [bancoCTS, setBancoCTS] = useState("");
    const [monedaCTS, setMonedaCTS] = useState("");
    const [nroCTS, setNroCTS] = useState("");
    const [cciCTS, setCciCTS] = useState("");
    const [bancoAperturaCTS, setBancoAperturaCTS] = useState("");
    const [monedaAperturaCTS, setMonedaAperturaCTS] = useState("");

    return (
      <div>
        <h1 style={{fontSize:22,fontWeight:800,color:C.navy,margin:"0 0 16px"}}>🏦 Datos Bancarios</h1>

        {/* CUENTA SUELDO */}
        <div style={{...st.cd, marginBottom:16}}>
          <div style={{fontSize:16,fontWeight:700,color:C.navy,marginBottom:16,borderBottom:`2px solid ${C.g100}`,paddingBottom:8}}>💳 Cuenta de Haberes (Sueldo)</div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:14}}>
            <F label="¿Cuenta con cuenta de haberes?" type="select" required
              options={["Sí, tengo cuenta","No, necesito que la empresa abra una"]}
              value={tieneSueldo} onChange={e=>setTieneSueldo(e.target.value)} span={3}/>

            {tieneSueldo === "Sí, tengo cuenta" && (<>
              <F label="Banco / Entidad Financiera" type="select" required options={TODAS_ENT}
                value={bancoSueldo} onChange={e=>setBancoSueldo(e.target.value)}/>
              <F label="Moneda de la cuenta" type="select" required options={["Soles (PEN)","Dólares (USD)"]}
                value={monedaSueldo} onChange={e=>setMonedaSueldo(e.target.value)}/>
              <div/>
              <F label="Número de Cuenta" required placeholder="Ej: 191-123456789-0-12"
                value={nroCuenta} onChange={e=>setNroCuenta(e.target.value)}/>
              <F label="Código CCI (20 dígitos)" required placeholder="Ej: 00219100123456789012"
                value={cci} onChange={e=>setCci(e.target.value)}/>
              <F label="Adjuntar constancia de cuenta" type="file"/>
            </>)}

            {tieneSueldo === "No, necesito que la empresa abra una" && (<>
              <F label="Banco de preferencia para apertura" type="select" required options={TODAS_ENT}
                value={bancoApertura} onChange={e=>setBancoApertura(e.target.value)}/>
              <F label="Moneda preferida" type="select" required options={["Soles (PEN)","Dólares (USD)"]}
                value={monedaApertura} onChange={e=>setMonedaApertura(e.target.value)}/>
              <div/>
              <div style={{gridColumn:"span 3",padding:14,background:"#fef3c7",borderRadius:12,border:`1px solid ${C.yellow}30`}}>
                <div style={{display:"flex",alignItems:"flex-start",gap:10}}>
                  <input type="checkbox" style={{accentColor:C.blue2,marginTop:3}}/>
                  <div style={{fontSize:12,color:C.g700,lineHeight:1.6}}>
                    <strong>Autorización de Apertura:</strong> Autorizo expresamente a Aquarius Consulting SAC a gestionar
                    la apertura de una cuenta de haberes a mi nombre en <strong>{bancoApertura || "(seleccione banco)"}</strong> en
                    moneda <strong>{monedaApertura || "(seleccione)"}</strong>, para el depósito de mis remuneraciones.
                  </div>
                </div>
              </div>
            </>)}
          </div>
        </div>

        {/* CUENTA CTS */}
        <div style={st.cd}>
          <div style={{fontSize:16,fontWeight:700,color:C.navy,marginBottom:16,borderBottom:`2px solid ${C.g100}`,paddingBottom:8}}>🏧 Cuenta CTS (Compensación por Tiempo de Servicios)</div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:14}}>
            <F label="¿Cuenta con cuenta CTS?" type="select" required
              options={["Sí, tengo cuenta CTS","No, autorizo apertura por la empresa"]}
              value={tieneCTS} onChange={e=>setTieneCTS(e.target.value)} span={3}/>

            {tieneCTS === "Sí, tengo cuenta CTS" && (<>
              <F label="Banco / Entidad Financiera CTS" type="select" required options={TODAS_ENT}
                value={bancoCTS} onChange={e=>setBancoCTS(e.target.value)}/>
              <F label="Moneda de la cuenta CTS" type="select" required options={["Soles (PEN)","Dólares (USD)"]}
                value={monedaCTS} onChange={e=>setMonedaCTS(e.target.value)}/>
              <div/>
              <F label="Número de Cuenta CTS" required placeholder="Ej: 191-987654321-0-99"
                value={nroCTS} onChange={e=>setNroCTS(e.target.value)}/>
              <F label="Código CCI CTS (20 dígitos)" required placeholder="Ej: 00219100987654321099"
                value={cciCTS} onChange={e=>setCciCTS(e.target.value)}/>
              <F label="Adjuntar constancia de cuenta CTS" type="file"/>
            </>)}

            {tieneCTS === "No, autorizo apertura por la empresa" && (<>
              <F label="Banco de preferencia para CTS" type="select" required options={TODAS_ENT}
                value={bancoAperturaCTS} onChange={e=>setBancoAperturaCTS(e.target.value)}/>
              <F label="Moneda para cálculo de CTS" type="select" required options={["Soles (PEN)","Dólares (USD)"]}
                value={monedaAperturaCTS} onChange={e=>setMonedaAperturaCTS(e.target.value)}/>
              <div/>
              <div style={{gridColumn:"span 3",padding:14,background:"#fef3c7",borderRadius:12,border:`1px solid ${C.yellow}30`}}>
                <div style={{display:"flex",alignItems:"flex-start",gap:10}}>
                  <input type="checkbox" style={{accentColor:C.blue2,marginTop:3}}/>
                  <div style={{fontSize:12,color:C.g700,lineHeight:1.6}}>
                    <strong>Autorización de Apertura CTS:</strong> Autorizo a Aquarius Consulting SAC a gestionar la apertura
                    de una cuenta CTS a mi nombre en <strong>{bancoAperturaCTS || "(seleccione)"}</strong>,
                    moneda <strong>{monedaAperturaCTS || "(seleccione)"}</strong>,
                    conforme al TUO del D.L. N° 650 — Ley de CTS.
                  </div>
                </div>
              </div>
            </>)}
          </div>
        </div>

        <div style={{display:"flex",justifyContent:"flex-end",marginTop:16}}>
          <button style={{...st.btn,background:C.blue2,color:C.white}}>Guardar Datos Bancarios</button>
        </div>
      </div>
    );
  };

  // ═══════════════════════════════════════════════════════════════
  // RÉGIMEN PENSIONARIO — CORREGIDO
  // ═══════════════════════════════════════════════════════════════
  const PPension = () => {
    const [primerTrabajo, setPrimerTrabajo] = useState("");
    const [regimen, setRegimen] = useState("");
    const [afpElegida, setAfpElegida] = useState("");
    const [cuspp, setCuspp] = useState("");
    const [comision, setComision] = useState("");

    return (
      <div>
        <h1 style={{fontSize:22,fontWeight:800,color:C.navy,margin:"0 0 16px"}}>🏛️ Régimen Pensionario</h1>
        <div style={st.cd}>
          <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:14}}>

            <F label="¿Es su primer trabajo formal?" type="select" required
              options={["Sí, es mi primer trabajo","No, ya estoy afiliado a un régimen"]}
              value={primerTrabajo} onChange={e=>{setPrimerTrabajo(e.target.value);setRegimen("");setAfpElegida("");}}
              span={2}/>

            {/* YA AFILIADO */}
            {primerTrabajo === "No, ya estoy afiliado a un régimen" && (<>
              <F label="¿A qué régimen está afiliado?" type="select" required
                options={["ONP (Sistema Nacional de Pensiones)","AFP Integra","AFP Prima","AFP Habitat","AFP Profuturo"]}
                value={regimen} onChange={e=>setRegimen(e.target.value)} span={2}/>

              {regimen === "ONP (Sistema Nacional de Pensiones)" && (
                <F label="Número de asegurado ONP" required placeholder="Ej: 12345678"/>
              )}

              {regimen && regimen !== "ONP (Sistema Nacional de Pensiones)" && (<>
                <F label="CUSPP (Código Único SPP)" required placeholder="Ej: 612345CMRLI0"
                  value={cuspp} onChange={e=>setCuspp(e.target.value)}/>
                <F label="Tipo de Comisión" type="select" required options={["Comisión por Flujo","Comisión Mixta"]}
                  value={comision} onChange={e=>setComision(e.target.value)}/>
                <F label="Adjuntar boleta o constancia AFP" type="file" span={2}/>
              </>)}
            </>)}

            {/* PRIMER TRABAJO */}
            {primerTrabajo === "Sí, es mi primer trabajo" && (<>
              <div style={{gridColumn:"span 2",padding:16,background:C.light,borderRadius:12,border:`1px solid ${C.cyan}30`}}>
                <div style={{fontSize:14,fontWeight:700,color:C.blue1,marginBottom:10}}>ℹ️ Conozca las opciones de régimen pensionario</div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
                  <div style={{padding:14,background:C.white,borderRadius:10}}>
                    <div style={{fontSize:14,fontWeight:700,color:C.navy,marginBottom:6}}>ONP — Sistema Nacional de Pensiones</div>
                    <div style={{fontSize:12,color:C.g500,lineHeight:1.6}}>
                      • Aporte obligatorio: <strong>13%</strong> de la remuneración<br/>
                      • Requisito pensión: mínimo <strong>20 años</strong> de aportes<br/>
                      • Administrado por el <strong>Estado peruano</strong><br/>
                      • Pensión fija mensual al jubilarse
                    </div>
                  </div>
                  <div style={{padding:14,background:C.white,borderRadius:10}}>
                    <div style={{fontSize:14,fontWeight:700,color:C.navy,marginBottom:6}}>AFP — Sistema Privado de Pensiones</div>
                    <div style={{fontSize:12,color:C.g500,lineHeight:1.6}}>
                      • Aporte: <strong>~13%</strong> (10% ahorro + comisión)<br/>
                      • Cuenta <strong>individual</strong> de capitalización<br/>
                      • Administradoras: Integra, Prima, Habitat, Profuturo<br/>
                      • Rentabilidad variable según mercado
                    </div>
                  </div>
                </div>
              </div>

              <F label="Elijo afiliarme a:" type="select" required
                options={["ONP (Sistema Nacional de Pensiones)","AFP Integra","AFP Prima","AFP Habitat","AFP Profuturo"]}
                value={afpElegida} onChange={e=>setAfpElegida(e.target.value)} span={2}/>

              {afpElegida && afpElegida !== "ONP (Sistema Nacional de Pensiones)" && (
                <F label="Tipo de Comisión AFP" type="select" required options={["Comisión por Flujo","Comisión Mixta"]}
                  value={comision} onChange={e=>setComision(e.target.value)}/>
              )}

              <div style={{gridColumn:"span 2",padding:16,background:"#fef3c7",borderRadius:12,border:`1px solid ${C.yellow}30`}}>
                <div style={{display:"flex",alignItems:"flex-start",gap:10}}>
                  <input type="checkbox" style={{accentColor:C.blue2,marginTop:3}}/>
                  <div style={{fontSize:12,color:C.g700,lineHeight:1.6}}>
                    <strong>Autorización de Inscripción:</strong> Declaro que es mi primer empleo formal y autorizo expresamente
                    a Aquarius Consulting SAC a realizar mi inscripción en el régimen pensionario seleccionado:
                    <strong> {afpElegida || "(seleccione arriba)"}</strong>.
                    {afpElegida && afpElegida !== "ONP (Sistema Nacional de Pensiones)" && comision && (
                      <> Tipo de comisión: <strong>{comision}</strong>.</>
                    )}
                    {" "}Esta elección es libre y voluntaria, habiendo sido informado/a de las características de cada sistema.
                  </div>
                </div>
              </div>
            </>)}
          </div>

          <div style={{display:"flex",justifyContent:"flex-end",marginTop:20,paddingTop:16,borderTop:`1px solid ${C.g100}`}}>
            <button style={{...st.btn,background:C.blue2,color:C.white}}>Guardar Régimen Pensionario</button>
          </div>
        </div>
      </div>
    );
  };

  // ═══════════════════════════════════════════════════════════════
  // REMAINING PAGES (unchanged logic, cleaner format)
  // ═══════════════════════════════════════════════════════════════

  const PInicio = () => (
    <div>
      <div style={{background:`linear-gradient(135deg,${C.navy},${C.blue1})`,borderRadius:20,padding:"28px 32px",color:C.white,marginBottom:24}}>
        <h1 style={{fontSize:22,fontWeight:800,margin:0}}>¡Hola, Carlos! 👋</h1>
        <p style={{fontSize:14,color:C.cyan,margin:"4px 0 0"}}>Puesto: <strong>Analista Financiero</strong></p>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:16,marginBottom:24}}>
        <div style={{...st.cd,textAlign:"center",padding:18}}><Ring val={avance} sz={70} sw={7}/><div style={{fontSize:12,fontWeight:600,color:C.g400,marginTop:6}}>Avance</div></div>
        <div style={{...st.cd,padding:18}}><div style={{fontSize:26,fontWeight:800,color:C.navy}}>{dU}/{docs.length}</div><div style={{fontSize:12,color:C.g400}}>Documentos</div><PBar val={dU/docs.length*100}/></div>
        <div style={{...st.cd,padding:18}}><div style={{fontSize:26,fontWeight:800,color:C.navy}}>{fN}/8</div><div style={{fontSize:12,color:C.g400}}>Firmas</div><PBar val={fN/8*100}/></div>
        <div style={{...st.cd,padding:18}}><div style={{fontSize:26,fontWeight:800,color:C.blue2}}>3</div><div style={{fontSize:12,color:C.g400}}>Citas</div><button onClick={()=>setPage("entrevistas")} style={{...st.bS,background:`${C.blue2}12`,color:C.blue2,marginTop:6,width:"100%"}}>Ver</button></div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
        <div style={st.cd}>
          <div style={{fontSize:15,fontWeight:700,color:C.navy,marginBottom:14}}>📅 Próxima Cita</div>
          <div style={{background:`${C.blue2}08`,borderRadius:14,padding:16,border:`1px solid ${C.cyan}30`}}>
            <div style={{fontSize:16,fontWeight:700,color:C.navy}}>Evaluación Técnica</div>
            {[["📅","05 Abril 2026"],["🕐","10:00 AM"],["📍","Virtual — Google Meet"],["👤","Ing. Carlos Medina"]].map(([i,t])=>(
              <div key={t} style={{display:"flex",alignItems:"center",gap:8,fontSize:13,color:C.g500,marginTop:6}}><span>{i}</span>{t}</div>
            ))}
            <button style={{...st.btn,background:C.green,color:C.white,width:"100%",marginTop:12}}>✓ Confirmar</button>
          </div>
        </div>
        <div style={st.cd}>
          <div style={{fontSize:15,fontWeight:700,color:C.navy,marginBottom:14}}>⚡ Pendientes</div>
          {[{i:"📸",t:"Subir foto pasaporte",p:"documentos",c:C.red},{i:"📊",t:"Completar evaluación",p:"evaluaciones",c:C.yellow},{i:"📋",t:"Revisar ficha",p:"ficha",c:C.blue2}].map((a,idx)=>(
            <div key={idx} onClick={()=>setPage(a.p)} style={{display:"flex",alignItems:"center",gap:12,padding:"10px 14px",background:C.g50,borderRadius:10,cursor:"pointer",borderLeft:`3px solid ${a.c}`,marginBottom:8}}>
              <span style={{fontSize:18}}>{a.i}</span><span style={{fontSize:13,color:C.g700,flex:1}}>{a.t}</span><span style={{color:C.g300}}>→</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const PFicha = () => {
    const [tab, setTab] = useState("personal");
    const tabs = [{id:"personal",l:"Datos Personales"},{id:"tallas",l:"Tallas EPP"},{id:"direccion",l:"Dirección"},{id:"emergencia",l:"Emergencia"},{id:"formacion",l:"Formación"},{id:"experiencia",l:"Experiencia"},{id:"referencias",l:"Referencias"},{id:"salud",l:"Salud"}];
    return (
      <div>
        <h1 style={{fontSize:22,fontWeight:800,color:C.navy,margin:"0 0 16px"}}>📋 Mi Ficha Personal</h1>
        <div style={{display:"flex",gap:3,marginBottom:16,flexWrap:"wrap",background:C.g50,padding:4,borderRadius:12}}>
          {tabs.map(t=><button key={t.id} onClick={()=>setTab(t.id)} style={{...st.bS,background:tab===t.id?C.white:"transparent",color:tab===t.id?C.blue2:C.g400,boxShadow:tab===t.id?"0 1px 3px rgba(0,0,0,0.08)":"none",fontWeight:tab===t.id?700:400,fontSize:11}}>{t.l}</button>)}
        </div>
        <div style={st.cd}>
          {tab==="personal"&&<div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:14}}><Sec icon="📋" title="DATOS PERSONALES"/><F label="Apellido Paterno" required/><F label="Apellido Materno" required/><F label="Nombres" required/><F label="Tipo Doc." type="select" required options={["DNI","CE","Pasaporte"]}/><F label="Nro. Documento" required/><F label="Fecha Nacimiento" type="date" required/><F label="Lugar Nacimiento"/><F label="Nacionalidad"/><F label="Estado Civil" type="select" options={["Soltero/a","Casado/a","Divorciado/a","Viudo/a","Conviviente"]}/><F label="Género" type="select" options={["Masculino","Femenino","Otro"]}/><F label="Teléfono"/><F label="Email" type="email"/><F label="Grupo Sanguíneo" type="select" options={["O+","O-","A+","A-","B+","B-","AB+","AB-"]}/><F label="¿Licencia?" type="select" options={["Sí","No"]}/><F label="Categoría" type="select" options={["N/A","AI","AII-a","AII-b","AIII-a","AIII-b","AIII-c"]}/></div>}
          {tab==="tallas"&&<div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:14}}><Sec icon="👔" title="TALLAS UNIFORME / EPP"/><F label="Camisa / Polo" type="select" required options={["XS","S","M","L","XL","XXL"]}/><F label="Pantalón" type="select" required options={["28","30","32","34","36","38","40","42","44"]}/><F label="Botas / Calzado" type="select" required options={["35","36","37","38","39","40","41","42","43","44","45","46"]}/><F label="Chaleco" type="select" options={["XS","S","M","L","XL","XXL"]}/></div>}
          {tab==="direccion"&&<div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:14}}><Sec icon="📍" title="DIRECCIÓN DOMICILIO"/><F label="Tipo de vía" type="select" required options={["Avenida","Jirón","Calle","Pasaje","Alameda","Malecón","Carretera"]}/><F label="Nombre de la vía" required/><F label="Número" required/><F label="Interior / Dpto."/><F label="Urbanización"/><F label="Mz / Lote"/><F label="Distrito" type="select" required options={["Miraflores","San Isidro","San Borja","Surco","La Molina","Jesús María","Lince","Magdalena","San Miguel","Barranco","Chorrillos","Lima","Rímac","SJL","Ate","Los Olivos","Comas","Callao","Otro"]}/><F label="Provincia" required/><F label="Departamento" type="select" required options={["Lima","Arequipa","Cusco","Piura","Callao","Junín","Lambayeque","Otro"]}/><F label="Referencia" required span={3}/><F label="Cómo llegar" type="textarea" span={3}/><F label="Verificación domiciliaria" type="file"/><F label="Recibo servicios" type="file"/><div/></div>}
          {tab==="emergencia"&&<div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:14}}><Sec icon="🚨" title="CONTACTO EMERGENCIA"/><F label="Nombre completo" required/><F label="Parentesco" type="select" required options={["Padre","Madre","Esposo/a","Conviviente","Hermano/a","Hijo/a","Otro"]}/><F label="Teléfono celular" required/><F label="Teléfono fijo"/><F label="Dirección" span={2}/></div>}
          {tab==="formacion"&&<div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:14}}><Sec icon="🎓" title="FORMACIÓN ACADÉMICA"/>{[1,2,3].map(n=><div key={n} style={{gridColumn:"span 3",padding:14,background:C.g50,borderRadius:12,display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12}}><div style={{gridColumn:"span 3",fontSize:13,fontWeight:600,color:C.blue2}}>Estudio {n}</div><F label="Nivel" type="select" options={["Secundaria","Técnico","Universitario","Postgrado","Maestría","Doctorado"]}/><F label="Institución"/><F label="Especialidad"/><F label="Desde" type="date"/><F label="Hasta" type="date"/><F label="Estado" type="select" options={["En curso","Completo","Incompleto","Trunco"]}/></div>)}<F label="Idiomas" span={3}/><F label="Software" span={3}/></div>}
          {tab==="experiencia"&&<div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:14}}><Sec icon="💼" title="EXPERIENCIA LABORAL"/>{[1,2,3].map(n=><div key={n} style={{gridColumn:"span 3",padding:14,background:C.g50,borderRadius:12,display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12}}><div style={{gridColumn:"span 3",fontSize:13,fontWeight:600,color:C.blue2}}>Experiencia {n}</div><F label="Empresa" required/><F label="Rubro"/><F label="Cargo" required/><F label="Desde" type="date"/><F label="Hasta" type="date"/><F label="Motivo Retiro" type="select" options={["Renuncia","Fin contrato","Mutuo acuerdo","Reducción","Otro"]}/><F label="Sueldo (S/)"/><F label="Nombre Jefe Directo" required/><F label="Teléfono Jefe" required/><F label="Funciones" type="textarea" span={3}/></div>)}</div>}
          {tab==="referencias"&&<div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:14}}><Sec icon="📞" title="REFERENCIAS LABORALES"/>{[1,2,3].map(n=><div key={n} style={{gridColumn:"span 4",padding:14,background:C.g50,borderRadius:12,display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12}}><div style={{gridColumn:"span 4",fontSize:13,fontWeight:600,color:C.blue2}}>Ref. {n}</div><F label="Empresa" required/><F label="Contacto" required/><F label="Cargo"/><F label="Teléfono" required/><F label="Email" type="email" span={2}/><F label="Relación" type="select" options={["Jefe directo","Compañero","Subordinado","Cliente","Otro"]} span={2}/></div>)}</div>}
          {tab==="salud"&&<div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:14}}><Sec icon="🏥" title="DECLARACIÓN DE SALUD"/><F label="¿Enfermedad crónica?" type="select" options={["No","Sí"]}/><F label="Especifique"/><F label="¿Medicación?" type="select" options={["No","Sí"]}/><F label="Especifique"/><F label="¿Alergias?" type="select" options={["No","Sí"]}/><F label="Especifique"/><F label="¿Operaciones?" type="select" options={["No","Sí"]}/><F label="Especifique"/><F label="¿Discapacidad?" type="select" options={["No","Sí"]}/><F label="Tipo"/><F label="EPS" type="select" options={["Ninguna","Rímac","Pacífico","Mapfre","La Positiva","Otra"]}/><F label="Nro. EPS"/></div>}
          <div style={{display:"flex",justifyContent:"flex-end",marginTop:20,paddingTop:16,borderTop:`1px solid ${C.g100}`}}><button style={{...st.btn,background:C.blue2,color:C.white}}>Guardar →</button></div>
        </div>
      </div>
    );
  };

  const PEval = () => {
    if (evalEnv) return (<div style={{...st.cd,textAlign:"center",padding:"48px 32px",maxWidth:500,margin:"0 auto"}}><div style={{fontSize:48,marginBottom:16}}>✅</div><div style={{fontSize:20,fontWeight:800,color:C.navy}}>Evaluación Enviada</div><div style={{fontSize:14,color:C.g500,marginTop:8}}>RRHH revisará sus resultados.</div></div>);
    return (
      <div>
        <h1 style={{fontSize:22,fontWeight:800,color:C.navy,margin:"0 0 4px"}}>📊 Evaluación Técnica</h1>
        <p style={{color:C.g400,fontSize:13,margin:"0 0 16px"}}>Analista Financiero — {PREGUNTAS.length} preguntas</p>
        <div style={{...st.cd,marginBottom:16,padding:"12px 18px",background:C.light,border:`1px solid ${C.cyan}30`,display:"flex",justifyContent:"space-between"}}>
          <span style={{fontSize:12,color:C.blue1}}><strong>Instrucciones:</strong> Seleccione una respuesta por pregunta.</span>
          <span style={{fontSize:13,fontWeight:700,color:C.navy}}>{rN}/{PREGUNTAS.length}</span>
        </div>
        {PREGUNTAS.map((p,idx)=>(
          <div key={p.id} style={{...st.cd,marginBottom:14,borderLeft:`4px solid ${resp[p.id]!==undefined?C.green:C.g200}`}}>
            <div style={{fontSize:14,fontWeight:700,color:C.navy,marginBottom:10}}>Pregunta {idx+1}</div>
            <div style={{fontSize:15,color:C.g700,marginBottom:12}}>{p.q}</div>
            {p.opts.map((opt,j)=>(
              <label key={j} onClick={()=>setResp({...resp,[p.id]:j})} style={{display:"flex",alignItems:"center",gap:12,padding:"11px 16px",borderRadius:10,cursor:"pointer",background:resp[p.id]===j?`${C.blue2}10`:C.g50,border:`2px solid ${resp[p.id]===j?C.blue2:"transparent"}`,marginBottom:6}}>
                <div style={{width:20,height:20,borderRadius:"50%",border:`2px solid ${resp[p.id]===j?C.blue2:C.g300}`,background:resp[p.id]===j?C.blue2:"transparent",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                  {resp[p.id]===j&&<div style={{width:7,height:7,borderRadius:"50%",background:C.white}}/>}
                </div>
                <span style={{fontSize:13,color:resp[p.id]===j?C.navy:C.g500,fontWeight:resp[p.id]===j?600:400}}>{opt}</span>
              </label>
            ))}
          </div>
        ))}
        <div style={{...st.cd,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <span style={{fontSize:13,color:C.g400}}>{rN===PREGUNTAS.length?"✅ Todas respondidas":`⚠️ Faltan ${PREGUNTAS.length-rN}`}</span>
          <button onClick={()=>{if(rN===PREGUNTAS.length)setEvalEnv(true)}} style={{...st.btn,background:rN===PREGUNTAS.length?C.green:C.g200,color:rN===PREGUNTAS.length?C.white:C.g400,cursor:rN===PREGUNTAS.length?"pointer":"not-allowed"}}>Enviar →</button>
        </div>
      </div>
    );
  };

  const PDocs = () => (
    <div>
      <h1 style={{fontSize:22,fontWeight:800,color:C.navy,margin:"0 0 16px"}}>📁 Documentos</h1>
      <div style={{...st.cd,marginBottom:16,display:"flex",alignItems:"center",gap:16,padding:"14px 20px",background:C.light,border:`1px solid ${C.cyan}30`}}>
        <Ring val={Math.round(dU/docs.length*100)} sz={60} sw={6}/>
        <div><div style={{fontSize:15,fontWeight:700,color:C.navy}}>{dU}/{docs.length} subidos</div><div style={{fontSize:12,color:C.g400}}>Obligatorios: 4/5</div></div>
      </div>
      <div style={{display:"grid",gap:10}}>
        {docs.map((d,i)=>(
          <div key={i} style={{...st.cd,padding:"14px 18px",display:"flex",alignItems:"center",gap:14,borderLeft:`4px solid ${d.s==="ok"?C.green:d.s==="pending"?C.yellow:C.g200}`}}>
            <span style={{fontSize:20}}>{d.s==="ok"?"✅":d.s==="pending"?"📄":"➖"}</span>
            <div style={{flex:1}}><div style={{fontSize:13,fontWeight:600,color:C.g700}}>{d.n} {d.req&&<span style={{color:C.red}}>*</span>}</div><div style={{fontSize:11,color:d.s==="ok"?C.green:C.g400}}>{d.s==="ok"?"Subido":d.s==="pending"?"Pendiente":"N/A"}</div></div>
            {d.s==="pending"&&<label style={{...st.bS,background:`${C.blue2}12`,color:C.blue2,cursor:"pointer"}}><input type="file" style={{display:"none"}}/>📤 Subir</label>}
          </div>
        ))}
      </div>
    </div>
  );

  const PEntrev = () => (
    <div>
      <h1 style={{fontSize:22,fontWeight:800,color:C.navy,margin:"0 0 16px"}}>📅 Entrevistas</h1>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
        <Cal events={entrevistas} onSelect={setSelEv}/>
        <div>
          {selEv ? (
            <div style={{...st.cd,borderTop:`4px solid ${selEv.tipo==="tecnica"?C.blue2:selEv.tipo==="psicologica"?C.purple:C.green}`}}>
              <div style={{fontSize:16,fontWeight:700,color:C.navy,marginBottom:12}}>{selEv.tipo==="tecnica"?"📋 Eval. Técnica":selEv.tipo==="psicologica"?"🧠 Eval. Psicológica":"🎤 Entrevista"}</div>
              {[["📅",new Date(selEv.fecha).toLocaleDateString("es-PE",{weekday:"long",day:"numeric",month:"long",year:"numeric"})],["🕐",`${selEv.hora} (${selEv.duracion})`],["📍",selEv.lugar],["👤",selEv.evaluador]].map(([i,v])=>(
                <div key={i+v} style={{display:"flex",justifyContent:"space-between",padding:"8px 12px",background:C.g50,borderRadius:8,marginBottom:6}}><span style={{fontSize:12,color:C.g400}}>{i}</span><span style={{fontSize:13,fontWeight:600,color:C.g700}}>{v}</span></div>
              ))}
              <button style={{...st.btn,background:C.green,color:C.white,width:"100%",marginTop:12}}>✓ Confirmar</button>
            </div>
          ) : (
            <div style={{...st.cd,textAlign:"center",padding:"40px 20px",color:C.g400}}><div style={{fontSize:40,marginBottom:12}}>📅</div><div style={{fontSize:14,fontWeight:600}}>Seleccione una fecha</div></div>
          )}
          <div style={{...st.cd,marginTop:16}}>
            <div style={{fontSize:14,fontWeight:700,color:C.navy,marginBottom:10}}>Todas las citas</div>
            {entrevistas.map((e,i)=>(
              <div key={i} onClick={()=>setSelEv(e)} style={{display:"flex",alignItems:"center",gap:12,padding:"10px 14px",background:C.g50,borderRadius:10,marginBottom:6,cursor:"pointer",borderLeft:`3px solid ${e.tipo==="tecnica"?C.blue2:e.tipo==="psicologica"?C.purple:C.green}`}}>
                <div style={{flex:1}}><div style={{fontSize:13,fontWeight:600,color:C.g700}}>{e.tipo==="tecnica"?"Eval. Técnica":e.tipo==="psicologica"?"Eval. Psicológica":"Entrevista"}</div><div style={{fontSize:11,color:C.g400}}>{new Date(e.fecha).toLocaleDateString("es-PE")} · {e.hora}</div></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const PFirmas = () => {
    const df = ["Ficha de Postulante","Declaración Jurada","Autorización Verificación","Convenio Confidencialidad","Reglamento Interno","Acta Inducción","Régimen Pensionario","Autorización Descuentos"];
    return (
      <div>
        <h1 style={{fontSize:22,fontWeight:800,color:C.navy,margin:"0 0 16px"}}>✍️ Firma Digital</h1>
        <div style={{...st.cd,marginBottom:16,padding:14,background:C.light,border:`1px solid ${C.cyan}30`,fontSize:13,color:C.blue1,fontWeight:600}}>🔐 Validez legal — Ley N° 27269. Se registra IP, fecha/hora y hash.</div>
        <div style={{display:"grid",gap:12}}>
          {df.map((d,i)=>(
            <div key={i} style={{...st.cd,borderLeft:`4px solid ${firmas[i]?C.green:C.yellow}`}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:firmas[i]?0:10}}>
                <div><div style={{fontSize:14,fontWeight:600,color:C.g700}}>{d}</div><div style={{fontSize:11,color:C.g400}}>Doc {i+1}/8</div></div>
                {firmas[i] ? <span style={{padding:"4px 12px",borderRadius:16,background:"#dcfce7",color:C.green,fontSize:11,fontWeight:600}}>✅ Firmado</span> : <span style={{padding:"4px 12px",borderRadius:16,background:"#fef3c7",color:C.yellow,fontSize:11,fontWeight:600}}>⏳</span>}
              </div>
              {!firmas[i] && <>
                <div style={{padding:8,background:C.g50,borderRadius:8,marginBottom:8,fontSize:11,color:C.g500,maxHeight:50,overflow:"auto"}}>Declaro bajo juramento que la información es veraz...</div>
                <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}><input type="checkbox" style={{accentColor:C.blue2}}/><span style={{fontSize:11,color:C.g500}}>Acepto validez firma digital</span></div>
                <SPad onSave={()=>setFirmas(p=>({...p,[i]:true}))}/>
              </>}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const PDerecho = () => {
    const [fm, setFm] = useState([1]);
    return (
      <div>
        <h1 style={{fontSize:22,fontWeight:800,color:C.navy,margin:"0 0 16px"}}>👨‍👩‍👧‍👦 Derechohabientes</h1>
        <div style={{...st.cd,marginBottom:16,padding:14,background:C.light,border:`1px solid ${C.cyan}30`,fontSize:12,color:C.blue1}}>ℹ️ Cónyuge/conviviente, hijos menores 18 (o 28 si estudian), padres dependientes mayores 60.</div>
        {fm.map((_,i)=>(
          <div key={i} style={{...st.cd,marginBottom:12}}>
            <div style={{fontSize:14,fontWeight:700,color:C.blue2,marginBottom:10}}>Familiar {i+1}</div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12}}>
              <F label="Parentesco" type="select" required options={["Cónyuge","Conviviente","Hijo/a","Padre","Madre"]}/>
              <F label="Nombres" required/><F label="DNI" required/><F label="Fecha Nac." type="date" required/>
              <F label="Sexo" type="select" options={["M","F"]}/><F label="Ocupación"/><F label="¿Incluir EPS?" type="select" options={["Sí","No"]}/><F label="DNI familiar" type="file"/>
            </div>
          </div>
        ))}
        <button onClick={()=>setFm([...fm,fm.length+1])} style={{...st.btn,background:C.g100,color:C.blue2,width:"100%"}}>➕ Agregar</button>
      </div>
    );
  };

  const PDocsDig = () => {
    const items = [{id:"boletas",t:"Boletas Virtuales",d:"PDF por email — D.L. N° 1310"},{id:"contratos",t:"Contratos Digitales",d:"Firma electrónica — Ley N° 27269"},{id:"memorandums",t:"Memorándums Virtuales",d:"Notificación electrónica"},{id:"formularios",t:"Formularios Digitales",d:"Vacaciones, permisos por sistema"},{id:"convenios",t:"Convenios Digitales",d:"Confidencialidad, no competencia"},{id:"liquidaciones",t:"Liquidaciones Digitales",d:"Liquidaciones y constancias"}];
    return (
      <div>
        <h1 style={{fontSize:22,fontWeight:800,color:C.navy,margin:"0 0 16px"}}>📄 Documentos Digitales</h1>
        <div style={{display:"grid",gap:10}}>
          {items.map(it=>(
            <div key={it.id} style={{...st.cd,borderLeft:`4px solid ${acept[it.id]?C.green:C.yellow}`}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
                <div style={{flex:1}}><div style={{fontSize:14,fontWeight:700,color:C.navy,marginBottom:4}}>{it.t}</div><div style={{fontSize:12,color:C.g500,marginBottom:8}}>{it.d}</div></div>
                {acept[it.id]&&<span style={{padding:"4px 12px",borderRadius:16,background:"#dcfce7",color:C.green,fontSize:11,fontWeight:600}}>✅</span>}
              </div>
              {!acept[it.id]&&<div style={{display:"flex",alignItems:"center",gap:8,padding:"8px 12px",background:C.g50,borderRadius:8}}><input type="checkbox" onChange={e=>{if(e.target.checked)setAcept(p=>({...p,[it.id]:true}))}} style={{accentColor:C.blue2}}/><span style={{fontSize:12,color:C.g700}}>Acepto</span></div>}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const PCap = () => (
    <div>
      <h1 style={{fontSize:22,fontWeight:800,color:C.navy,margin:"0 0 16px"}}>📚 Capacitaciones</h1>
      {[{n:"Seguridad y Salud en el Trabajo",f:"10/04/2026"},{n:"Código de Ética",f:"12/04/2026"},{n:"Manejo de Residuos",f:"15/04/2026"}].map((c,i)=>(
        <div key={i} style={{...st.cd,marginBottom:12,display:"flex",alignItems:"center",gap:16}}>
          <span style={{fontSize:28}}>📖</span>
          <div style={{flex:1}}><div style={{fontSize:14,fontWeight:600,color:C.g700}}>{c.n}</div><div style={{fontSize:12,color:C.g400}}>Vence: {c.f}</div><PBar val={0}/></div>
          <label style={{...st.bS,background:`${C.blue2}12`,color:C.blue2,cursor:"pointer"}}><input type="file" style={{display:"none"}}/>📤 Certificado</label>
        </div>
      ))}
    </div>
  );

  const PBlock = () => (
    <div style={{...st.cd,textAlign:"center",padding:"60px 32px",maxWidth:500,margin:"40px auto"}}>
      <div style={{fontSize:48,marginBottom:16}}>🔒</div>
      <div style={{fontSize:20,fontWeight:800,color:C.navy,marginBottom:8}}>Módulo No Disponible</div>
      <div style={{fontSize:14,color:C.g500,lineHeight:1.6,marginBottom:20}}>Se habilitará cuando sea <strong>aprobado</strong>.</div>
      <div style={{display:"flex",gap:8,justifyContent:"center"}}>
        <button onClick={()=>setPage("ficha")} style={{...st.btn,background:C.blue2,color:C.white}}>📋 Mi Ficha</button>
        <button onClick={()=>setPage("evaluaciones")} style={{...st.btn,background:C.g100,color:C.g500}}>📊 Evaluaciones</button>
      </div>
    </div>
  );

  // ═══════════════════════════════════════════════════════════════
  // ROUTING
  // ═══════════════════════════════════════════════════════════════
  const pm = {
    inicio: <PInicio/>, ficha: <PFicha/>, evaluaciones: <PEval/>,
    documentos: <PDocs/>, entrevistas: <PEntrev/>, firmas: <PFirmas/>,
    derechohabientes: <PDerecho/>, bancario: <PBanco/>, pensionario: <PPension/>,
    docsfirmados: <PDocsDig/>, capacitaciones: <PCap/>, bloqueado: <PBlock/>,
  };

  const navTo = (p) => {
    if (!aprobado && bloq.includes(p)) { setPage("bloqueado"); }
    else { setPage(p); }
  };

  return (
    <div style={{minHeight:"100vh",background:C.g50,fontFamily:"'DM Sans','Segoe UI',sans-serif"}}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet"/>

      {/* Header */}
      <div style={{background:C.white,borderBottom:`1px solid ${C.g100}`,padding:"0 32px",display:"flex",alignItems:"center",justifyContent:"space-between",height:60,position:"sticky",top:0,zIndex:100}}>
        <div style={{display:"flex",alignItems:"center",gap:12}}>
          <Logo sz={32}/>
          <div><div style={{fontSize:14,fontWeight:700,color:C.navy,letterSpacing:1}}>AQUARIUS</div><div style={{fontSize:9,color:C.g400,letterSpacing:2}}>PORTAL POSTULANTE</div></div>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:14}}>
          {!aprobado && <span style={{padding:"4px 12px",borderRadius:20,background:"#fef3c7",color:C.yellow,fontSize:11,fontWeight:600}}>⏳ En Evaluación</span>}
          {aprobado && <span style={{padding:"4px 12px",borderRadius:20,background:"#dcfce7",color:C.green,fontSize:11,fontWeight:600}}>✅ Aprobado</span>}
          <div style={{display:"flex",alignItems:"center",gap:8}}>
            <div style={{width:32,height:32,borderRadius:"50%",background:`linear-gradient(135deg,${C.blue2},${C.cyan})`,display:"flex",alignItems:"center",justifyContent:"center",color:C.white,fontSize:12,fontWeight:700}}>CM</div>
            <div><div style={{fontSize:13,fontWeight:600,color:C.g700}}>Carlos Mendoza</div><div style={{fontSize:10,color:C.g400}}>Postulante</div></div>
          </div>
          <button onClick={()=>{setLoggedIn(false);setAprobado(false)}} style={{...st.bS,background:`${C.red}10`,color:C.red}}>Salir</button>
          {onBack && <button onClick={onBack} style={{...st.bS,background:`${C.blue2}10`,color:C.blue2}}>← Inicio</button>}
        </div>
      </div>

      {/* Status Banner */}
      <div style={{padding:"7px 32px",background:aprobado?"#dcfce7":"#fef3c7",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <span style={{fontSize:12,color:aprobado?C.green:C.yellow,fontWeight:600}}>
          {aprobado ? "✅ Aprobado — Todos los módulos habilitados" : "⏳ Complete ficha, evaluaciones y documentos"}
        </span>
        <button onClick={()=>setAprobado(!aprobado)} style={{...st.bS,background:C.white,color:C.g500,fontSize:10}}>
          Demo: {aprobado ? "Pendiente" : "Aprobado"}
        </button>
      </div>

      {/* Navigation */}
      <div style={{background:C.white,borderBottom:`1px solid ${C.g100}`,padding:"0 32px",display:"flex",gap:2,overflowX:"auto"}}>
        {navItems.map(n=>(
          <button key={n.id} onClick={()=>navTo(n.id)} style={{
            padding:"12px 16px",background:"none",border:"none",cursor:"pointer",fontSize:12,
            fontWeight:page===n.id?700:400,color:page===n.id?C.blue2:C.g400,
            borderBottom:page===n.id?`3px solid ${C.blue2}`:"3px solid transparent",
            display:"flex",alignItems:"center",gap:5,whiteSpace:"nowrap",
          }}><span>{n.icon}</span>{n.l}</button>
        ))}
      </div>

      {/* Content */}
      <div style={{maxWidth:1100,margin:"0 auto",padding:"24px 32px"}}>
        {pm[page] || pm.inicio}
      </div>
    </div>
  );
}
