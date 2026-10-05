"use client";
import { useMemo, useState } from "react";

type View = "inicio" | "configurar" | "agenda" | "pacientes";
type Period = { id:string; name:string; start:string; end:string };
type DayRule = { day:string; enabled:boolean; duration:number; interval:number; periods:Period[] };

const DAYS=["Segunda","Terça","Quarta","Quinta","Sexta","Sábado","Domingo"];
const initialRules:DayRule[]=DAYS.map((day,i)=>({
  day, enabled:i<5, duration:50, interval:10,
  periods:i<5?[{id:day+"-1",name:i===2?"Tarde":"Manhã",start:i===2?"13:00":"08:00",end:i===2?"19:00":"12:00"}]:[]
}));
const toMin=(v:string)=>{const [h,m]=v.split(":").map(Number);return h*60+m};
const toTime=(n:number)=>String(Math.floor(n/60)).padStart(2,"0")+":"+String(n%60).padStart(2,"0");

export default function Home(){
  const [view,setView]=useState<View>("configurar");
  const [rules,setRules]=useState(initialRules);
  const [blocked,setBlocked]=useState<string[]>(["Segunda-10:00"]);
  const [patients,setPatients]=useState([{name:"Paciente exemplo",phone:"(48) 99999-0000",payer:"Próprio paciente",status:"Ativo"}]);

  const slots=useMemo(()=>rules.flatMap(r=>r.enabled?r.periods.flatMap(p=>{
    const times:string[]=[]; const step=r.duration+r.interval;
    for(let t=toMin(p.start);t+r.duration<=toMin(p.end);t+=step) times.push(toTime(t));
    return times.map(time=>({day:r.day,time,duration:r.duration}));
  }):[]),[rules]);

  return <div className="shell">
    <aside className="sidebar">
      <div className="brand">Psi Gestão Fácil</div>
      <div className="nav">
        {([["inicio","Início"],["configurar","Configurar Agenda"],["agenda","Minha Agenda"],["pacientes","Pacientes"]] as [View,string][]).map(([k,l])=>
          <button key={k} className={view===k?"active":""} onClick={()=>setView(k)}>{l}</button>)}
      </div>
    </aside>
    <main className="main">
      <div className="top">
        <div><h1 style={{margin:0}}>{({inicio:"Visão geral",configurar:"Configurar Agenda",agenda:"Minha Agenda",pacientes:"Pacientes"})[view]}</h1>
        <div className="muted">{view==="configurar"?"Crie sua rotina semanal uma vez.":view==="agenda"?"Horários gerados pela sua configuração semanal.":"Protótipo V0.2"}</div></div>
        {view==="agenda"&&<button className="btn" onClick={()=>alert("Fluxo de agendamento será conectado ao cadastro do paciente.")}>+ Agendar paciente</button>}
      </div>
      {view==="inicio"&&<Dashboard slots={slots.length} patients={patients.length}/>}
      {view==="configurar"&&<Builder rules={rules} setRules={setRules}/>}
      {view==="agenda"&&<Agenda slots={slots} blocked={blocked} setBlocked={setBlocked}/>}
      {view==="pacientes"&&<Patients patients={patients} setPatients={setPatients}/>}
    </main>
  </div>
}

function Dashboard({slots,patients}:{slots:number;patients:number}){
 return <><div className="grid"><div className="card"><div className="muted">Pacientes ativos</div><h2>{patients}</h2></div><div className="card"><div className="muted">Horários semanais gerados</div><h2>{slots}</h2></div><div className="card"><div className="muted">Próxima etapa</div><h2>Agenda real</h2></div></div><div className="card section"><h3>Nova lógica</h3><p className="muted">Configurar Agenda define a rotina semanal. Minha Agenda mostra os horários resultantes e permite exceções sem destruir a configuração.</p></div></>
}

function Builder({rules,setRules}:{rules:DayRule[];setRules:(r:DayRule[])=>void}){
 const patch=(i:number,p:Partial<DayRule>)=>setRules(rules.map((r,x)=>x===i?{...r,...p}:r));
 const patchPeriod=(i:number,j:number,p:Partial<Period>)=>patch(i,{periods:rules[i].periods.map((q,x)=>x===j?{...q,...p}:q)});
 return <div>
  <div className="info"><strong>Você não precisa criar horário por horário.</strong><span>Escolha os dias, períodos, duração e intervalo. O sistema monta os horários automaticamente.</span></div>
  <div className="day-list">{rules.map((r,i)=><div className={"card day-card "+(!r.enabled?"off":"")} key={r.day}>
    <div className="day-head"><label className="switchline"><input type="checkbox" checked={r.enabled} onChange={e=>patch(i,{enabled:e.target.checked})}/><strong>{r.day}</strong></label><span className="muted">{r.enabled?(r.periods.length?r.periods.length+" período(s)":"Sem período"):"Não atende"}</span></div>
    {r.enabled&&<>
      <div className="settings">
        <label>Duração da sessão<select className="input" value={r.duration} onChange={e=>patch(i,{duration:Number(e.target.value)})}><option value={30}>30 minutos</option><option value={50}>50 minutos</option><option value={60}>1 hora</option></select></label>
        <label>Intervalo<select className="input" value={r.interval} onChange={e=>patch(i,{interval:Number(e.target.value)})}><option value={0}>Sem intervalo</option><option value={10}>10 minutos</option><option value={15}>15 minutos</option><option value={30}>30 minutos</option></select></label>
      </div>
      <div className="periods">{r.periods.map((p,j)=><div className="period" key={p.id}>
        <input className="input period-name" value={p.name} onChange={e=>patchPeriod(i,j,{name:e.target.value})}/>
        <input className="input" type="time" value={p.start} onChange={e=>patchPeriod(i,j,{start:e.target.value})}/>
        <span>até</span>
        <input className="input" type="time" value={p.end} onChange={e=>patchPeriod(i,j,{end:e.target.value})}/>
        <button className="icon-btn" title="Excluir período" onClick={()=>patch(i,{periods:r.periods.filter((_,x)=>x!==j)})}>×</button>
      </div>)}</div>
      <button className="link-btn" onClick={()=>patch(i,{periods:[...r.periods,{id:String(Date.now()),name:"Novo período",start:"13:00",end:"18:00"}]})}>+ Adicionar período (manhã, tarde ou noite)</button>
    </>}
  </div>)}</div>
 </div>
}

function Agenda({slots,blocked,setBlocked}:{slots:{day:string;time:string;duration:number}[];blocked:string[];setBlocked:(x:string[])=>void}){
 const [day,setDay]=useState("Segunda"); const shown=slots.filter(s=>s.day===day);
 return <div>
  <div className="day-tabs">{DAYS.map(d=><button key={d} className={day===d?"selected":""} onClick={()=>setDay(d)}>{d.slice(0,3)}</button>)}</div>
  <div className="card"><div className="agenda-head"><div><h3>{day}</h3><div className="muted">Clique em um horário para bloquear ou liberar somente este horário.</div></div><span className="pill">{shown.length} horários</span></div>
   <div className="slot-grid">{shown.length?shown.map(s=>{const key=s.day+"-"+s.time;const b=blocked.includes(key);return <button key={key} className={"slot "+(b?"blocked":"")} onClick={()=>setBlocked(b?blocked.filter(x=>x!==key):[...blocked,key])}><strong>{s.time}</strong><span>{b?"🔒 Bloqueado":"Disponível"}</span><small>{s.duration} min</small></button>}):<div className="empty">Nenhum atendimento configurado para este dia. Use <strong>Configurar Agenda</strong>.</div>}</div>
  </div>
 </div>
}

function Patients({patients,setPatients}:{patients:any[];setPatients:(p:any[])=>void}){
 const [name,setName]=useState(""); const [phone,setPhone]=useState(""); const [same,setSame]=useState(true); const [fiscal,setFiscal]=useState("");
 const save=()=>{if(!name.trim())return;setPatients([...patients,{name,phone,payer:same?"Próprio paciente":fiscal||"Outro tomador",status:"Ativo"}]);setName("");setPhone("");setFiscal("")};
 return <div className="two"><div className="card"><h3>Novo paciente</h3><div className="form-stack"><input className="input" placeholder="Nome completo" value={name} onChange={e=>setName(e.target.value)}/><input className="input" placeholder="Telefone" value={phone} onChange={e=>setPhone(e.target.value)}/><label><input type="checkbox" checked={same} onChange={e=>setSame(e.target.checked)}/> Nota fiscal para o próprio paciente</label>{!same&&<input className="input" placeholder="Nome / razão social do tomador" value={fiscal} onChange={e=>setFiscal(e.target.value)}/>}<button className="btn" onClick={save}>Salvar paciente</button></div></div><div className="card"><h3>Pacientes cadastrados</h3>{patients.map((p,i)=><div className="patient" key={i}><div><strong>{p.name}</strong><div className="muted">{p.phone}</div></div><span className="pill">{p.status}</span></div>)}</div></div>
}
