"use client";
import { useMemo, useState } from "react";

type View="inicio"|"configurar"|"agenda"|"pacientes";
type Period={id:number,label:string,start:string,end:string};
type DayRule={day:string,enabled:boolean,duration:number,interval:number,periods:Period[]};
type AgendaItem={day:string,time:string,status:"available"|"blocked"|"booked",patient?:string};

const dayNames=["Segunda","Terça","Quarta","Quinta","Sexta","Sábado","Domingo"];
const initialRules:DayRule[]=dayNames.map((day,i)=>({
  day,enabled:i<5,duration:50,interval:10,
  periods:i<5?[{id:1,label:"Manhã",start:"08:00",end:"12:00"},{id:2,label:"Tarde",start:"13:30",end:"18:00"}]:[]
}));

const toMin=(v:string)=>{const [h,m]=v.split(":").map(Number);return h*60+m};
const toTime=(m:number)=>String(Math.floor(m/60)).padStart(2,"0")+":"+String(m%60).padStart(2,"0");

export default function Home(){
 const [view,setView]=useState<View>("inicio");
 const [rules,setRules]=useState<DayRule[]>(initialRules);
 const [exceptions,setExceptions]=useState<Record<string,"blocked"|"available">>({});
 const [patients,setPatients]=useState([{name:"Paciente exemplo",phone:"(48) 99999-0000",payer:"Próprio paciente",status:"Ativo"}]);
 const agenda=useMemo(()=>generateAgenda(rules,exceptions),[rules,exceptions]);
 const activeDays=rules.filter(r=>r.enabled).length;
 return <div className="shell">
  <aside className="sidebar"><div className="brand">Psi Gestão Fácil</div><div className="nav">
   {([["inicio","Início"],["configurar","Configurar agenda"],["agenda","Minha agenda"],["pacientes","Pacientes"]] as [View,string][]).map(([k,l])=><button key={k} className={view===k?"active":""} onClick={()=>setView(k)}>{l}</button>)}
  </div></aside>
  <main className="main"><div className="top"><div><h1>{({inicio:"Visão geral",configurar:"Configurar agenda",agenda:"Minha agenda",pacientes:"Pacientes"})[view]}</h1><div className="muted">Protótipo V0.2 • configuração semanal + agenda real</div></div></div>
   {view==="inicio"&&<Dashboard activeDays={activeDays} slots={agenda.filter(x=>x.status==="available").length} patients={patients.length}/>}
   {view==="configurar"&&<ScheduleBuilder rules={rules} setRules={setRules}/>}
   {view==="agenda"&&<MyAgenda agenda={agenda} exceptions={exceptions} setExceptions={setExceptions}/>}
   {view==="pacientes"&&<Patients patients={patients} setPatients={setPatients}/>}
  </main>
 </div>
}

function Dashboard({activeDays,slots,patients}:{activeDays:number,slots:number,patients:number}){return <>
 <div className="grid"><div className="card metric"><span>Dias configurados</span><strong>{activeDays}</strong></div><div className="card metric"><span>Horários disponíveis</span><strong>{slots}</strong></div><div className="card metric"><span>Pacientes ativos</span><strong>{patients}</strong></div></div>
 <div className="card section"><h3>Como funciona</h3><div className="flow"><b>1. Configure sua semana</b><span>→</span><b>2. O sistema cria os horários</b><span>→</span><b>3. Use Minha Agenda para pacientes e bloqueios</b></div></div>
 </>}

function ScheduleBuilder({rules,setRules}:{rules:DayRule[],setRules:(v:DayRule[])=>void}){
 const update=(i:number,patch:Partial<DayRule>)=>{const n=[...rules];n[i]={...n[i],...patch};setRules(n)};
 const updPeriod=(di:number,pi:number,patch:Partial<Period>)=>{const periods=[...rules[di].periods];periods[pi]={...periods[pi],...patch};update(di,{periods})};
 const addPeriod=(i:number)=>update(i,{enabled:true,periods:[...rules[i].periods,{id:Date.now(),label:"Novo período",start:"18:00",end:"21:00"}]});
 return <div className="stack">
  <div className="card intro"><h3>Defina sua rotina uma única vez</h3><p className="muted">Escolha os dias, períodos e duração. Os horários individuais serão criados automaticamente.</p></div>
  {rules.map((r,i)=><div className={"dayCard "+(!r.enabled?"off":"")} key={r.day}>
   <div className="dayHead"><label className="dayToggle"><input type="checkbox" checked={r.enabled} onChange={e=>update(i,{enabled:e.target.checked})}/><strong>{r.day}</strong></label>
    <span className="muted">{r.enabled?"Atendimento ativo":"Não atende"}</span></div>
   {r.enabled&&<><div className="settings"><label>Duração da sessão<select className="input" value={r.duration} onChange={e=>update(i,{duration:+e.target.value})}><option value="30">30 min</option><option value="50">50 min</option><option value="60">1 hora</option></select></label>
    <label>Intervalo<select className="input" value={r.interval} onChange={e=>update(i,{interval:+e.target.value})}><option value="0">Sem intervalo</option><option value="10">10 min</option><option value="15">15 min</option><option value="30">30 min</option></select></label></div>
    <div className="periods">{r.periods.map((p,pi)=><div className="period" key={p.id}><input className="input periodName" value={p.label} onChange={e=>updPeriod(i,pi,{label:e.target.value})}/><input className="input" type="time" value={p.start} onChange={e=>updPeriod(i,pi,{start:e.target.value})}/><span>até</span><input className="input" type="time" value={p.end} onChange={e=>updPeriod(i,pi,{end:e.target.value})}/><button className="iconBtn" onClick={()=>update(i,{periods:r.periods.filter((_,x)=>x!==pi)})}>Excluir</button></div>)}</div>
    <button className="btn secondary" onClick={()=>addPeriod(i)}>+ Adicionar período</button></>}
  </div>)}
 </div>
}

function generateAgenda(rules:DayRule[],exceptions:Record<string,"blocked"|"available">):AgendaItem[]{
 const out:AgendaItem[]=[];
 rules.filter(r=>r.enabled).forEach(r=>r.periods.forEach(p=>{let t=toMin(p.start),end=toMin(p.end);const step=r.duration+r.interval;while(t+r.duration<=end){const time=toTime(t);const key=r.day+"-"+time;out.push({day:r.day,time,status:exceptions[key]||"available"});t+=step}}));
 if(out.length>2){out[1]={...out[1],status:"booked",patient:"Maria Silva"}}
 return out;
}

function MyAgenda({agenda,exceptions,setExceptions}:{agenda:AgendaItem[],exceptions:Record<string,"blocked"|"available">,setExceptions:(v:Record<string,"blocked"|"available">)=>void}){
 const [day,setDay]=useState("Segunda"); const items=agenda.filter(a=>a.day===day);
 const toggle=(a:AgendaItem)=>{if(a.status==="booked")return;const key=a.day+"-"+a.time;setExceptions({...exceptions,[key]:a.status==="blocked"?"available":"blocked"})};
 return <div className="card"><div className="agendaTop"><div><h3>Agenda da semana</h3><p className="muted">Bloquear um horário aqui altera somente esta ocorrência no protótipo.</p></div><select className="input" value={day} onChange={e=>setDay(e.target.value)}>{dayNames.map(d=><option key={d}>{d}</option>)}</select></div>
  <div className="legend"><span>🟢 Disponível</span><span>🔵 Paciente agendado</span><span>🔒 Bloqueado</span></div>
  <div className="slots">{items.length?items.map(a=><div className={"slot "+a.status} key={a.time}><div className="slotTime">{a.time}</div><div className="slotBody"><strong>{a.status==="booked"?a.patient:a.status==="blocked"?"Horário bloqueado":"Disponível"}</strong><small>{a.status==="available"?"Livre para agendamento":a.status==="booked"?"Atendimento confirmado":"Não receber agendamentos"}</small></div>{a.status!=="booked"&&<button className="btn secondary" onClick={()=>toggle(a)}>{a.status==="blocked"?"Liberar":"Bloquear"}</button>}</div>):<div className="empty">Nenhum horário configurado para {day}. Vá em <b>Configurar agenda</b>.</div>}</div>
 </div>
}

function Patients({patients,setPatients}:{patients:any[],setPatients:any}){
 const [name,setName]=useState("");const [phone,setPhone]=useState("");const [same,setSame]=useState(true);const [fiscal,setFiscal]=useState("");
 const save=()=>{if(!name)return;setPatients([...patients,{name,phone,payer:same?"Próprio paciente":fiscal||"Outro tomador",status:"Ativo"}]);setName("");setPhone("");setFiscal("")};
 return <div className="two"><div className="card"><h3>Novo paciente</h3><div className="form"><input className="input" placeholder="Nome completo" value={name} onChange={e=>setName(e.target.value)}/><input className="input" placeholder="Telefone" value={phone} onChange={e=>setPhone(e.target.value)}/><label><input type="checkbox" checked={same} onChange={e=>setSame(e.target.checked)}/> Nota fiscal para o próprio paciente</label>{!same&&<input className="input" placeholder="Nome / razão social do tomador" value={fiscal} onChange={e=>setFiscal(e.target.value)}/>}<button className="btn" onClick={save}>Salvar paciente</button></div></div>
 <div className="card"><h3>Pacientes cadastrados</h3>{patients.map((p,i)=><div className="patient" key={i}><strong>{p.name}</strong><span>{p.phone}</span><small>Tomador fiscal: {p.payer}</small></div>)}</div></div>
}
