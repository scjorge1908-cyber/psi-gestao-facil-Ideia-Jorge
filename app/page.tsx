"use client";
import { useMemo, useState } from "react";

type View="inicio"|"configurar"|"agenda"|"pacientes";
type Period={id:string;name:string;start:string;end:string};
type DayRule={day:string;enabled:boolean;duration:number;interval:number;periods:Period[]};
type Frequency="unica"|"semanal"|"quinzenal"|"mensal";
type DemoAppointment={day:string;time:string;patient:string;frequency:Frequency;weekPattern?:0|1};
const DAYS=["Segunda","Terça","Quarta","Quinta","Sexta","Sábado","Domingo"];
const initialRules:DayRule[]=DAYS.map((day,i)=>({day,enabled:i<5,duration:60,interval:0,periods:i<5?[{id:day+"-1",name:"Manhã",start:"08:00",end:"12:00"}]:[]}));
const toMin=(v:string)=>{const[h,m]=v.split(":").map(Number);return h*60+m};
const toTime=(n:number)=>String(Math.floor(n/60)).padStart(2,"0")+":"+String(n%60).padStart(2,"0");

export default function Home(){
 const[view,setView]=useState<View>("inicio"); const[rules,setRules]=useState(initialRules); const[savedRules,setSavedRules]=useState(initialRules); const[saved,setSaved]=useState(false);
 const[blocked,setBlocked]=useState<string[]>(["Segunda-10:00"]);
 const[appointments,setAppointments]=useState<DemoAppointment[]>([{day:"Segunda",time:"09:00",patient:"Maria Silva",frequency:"semanal"},{day:"Segunda",time:"11:00",patient:"Ana Costa",frequency:"quinzenal",weekPattern:0}]);
 const[patients,setPatients]=useState([{name:"Paciente exemplo",phone:"(48) 99999-0000",payer:"Próprio paciente",status:"Ativo"}]);
 const slots=useMemo(()=>rules.flatMap(r=>r.enabled?r.periods.flatMap(p=>{const a:string[]=[];const step=Math.max(1,r.duration+r.interval);for(let t=toMin(p.start);t+r.duration<=toMin(p.end);t+=step)a.push(toTime(t));return a.map(time=>({day:r.day,time,duration:r.duration,interval:r.interval}))}):[]),[rules]);
 const title={inicio:"Início",configurar:"Configurar Agenda",agenda:"Minha Agenda",pacientes:"Pacientes"}[view];
 return <div className="app-shell"><header className="mobile-header"><div><span className="eyebrow">PSI GESTÃO FÁCIL</span><strong>{title}</strong></div><div className="avatar">PSI</div></header>
 <main className="content">
 {view==="inicio"&&<Dashboard slots={slots} patients={patients.length} appointments={appointments} onNav={setView}/>}
 {view==="configurar"&&<Builder rules={rules} setRules={setRules} onSave={()=>{setSavedRules(rules);setSaved(true);setTimeout(()=>setSaved(false),2200)}} saved={saved}/>}
 {view==="agenda"&&<Agenda slots={slots} blocked={blocked} setBlocked={setBlocked} appointments={appointments} setAppointments={setAppointments}/>}
 {view==="pacientes"&&<Patients patients={patients} setPatients={setPatients}/>}
 </main>
 <nav className="bottom-nav">{([["inicio","⌂","Início"],["agenda","▣","Agenda"],["configurar","⚙","Configurar"],["pacientes","♙","Pacientes"]] as [View,string,string][]).map(([k,icon,label])=><button key={k} className={view===k?"active":""} onClick={()=>setView(k)}><span>{icon}</span><small>{label}</small></button>)}</nav>
 </div>
}
function Dashboard({slots,patients,appointments,onNav}:{slots:{day:string;time:string;duration:number;interval:number}[];patients:number;appointments:DemoAppointment[];onNav:(v:View)=>void}){
 const jsDay=(new Date().getDay()+6)%7; let day=DAYS[jsDay]; let agenda=appointments.filter(a=>a.day===day);
 if(!agenda.length){for(let n=1;n<=7;n++){const d=DAYS[(jsDay+n)%7];const found=appointments.filter(a=>a.day===d);if(found.length){day=d;agenda=found;break}}}
 return <div className="screen"><section className="hello"><span className="open-badge">● Consultório aberto</span><h1>Olá, Psicóloga</h1><p>Organize seu dia de forma simples.</p></section>
 <section className="panel today-card"><div className="panel-title"><div><h2>{day===DAYS[jsDay]?"Agenda de hoje":"Próxima agenda"}</h2><p>{day} · {agenda.length} atendimento(s)</p></div><button className="mini-link" onClick={()=>onNav("agenda")}>Ver agenda</button></div>
 {agenda.length?agenda.sort((a,b)=>a.time.localeCompare(b.time)).map((a,i)=><div className="today-item" key={i}><b>{a.time}</b><div><strong>{a.patient}</strong><small>{a.frequency==="quinzenal"?"Quinzenal":a.frequency==="mensal"?"Mensal":a.frequency==="semanal"?"Semanal":"Único"}</small></div></div>):<div className="empty">Nenhum atendimento agendado.</div>}</section>
 <div className="kpis"><button className="kpi" onClick={()=>onNav("agenda")}><span>Disponibilidade</span><b>{slots.length}</b><small>horários semanais</small></button><button className="kpi" onClick={()=>onNav("pacientes")}><span>Pacientes</span><b>{patients}</b><small>ativos</small></button><div className="kpi"><span>Financeiro</span><b>—</b><small>próxima etapa</small></div><button className="kpi" onClick={()=>onNav("configurar")}><span>Configuração</span><b>Editar</b><small>rotina semanal</small></button></div></div>
}
function Builder({rules,setRules,onSave,saved}:{rules:DayRule[];setRules:(r:DayRule[])=>void;onSave:()=>void;saved:boolean}){
 const[selected,setSelected]=useState(0);const r=rules[selected];
 const patch=(p:Partial<DayRule>)=>setRules(rules.map((x,i)=>i===selected?{...x,...p}:x));
 const pp=(j:number,p:Partial<Period>)=>patch({periods:r.periods.map((q,i)=>i===j?{...q,...p}:q)});
 return <div className="screen"><div className="tip"><b>Cálculo automático ativo</b><span>Defina sua rotina. O sistema gera os horários sem você cadastrar vaga por vaga.</span></div>
 <h1>Rotina semanal & regras</h1><p className="muted">Escolha os dias, períodos, duração do atendimento e intervalo.</p>
 <div className="week">{DAYS.map((d,i)=><button key={d} onClick={()=>setSelected(i)} className={(selected===i?"selected ":"")+(rules[i].enabled?"enabled":"")}><b>{d.slice(0,3).toUpperCase()}</b><i>{rules[i].enabled?"●":"○"}</i></button>)}</div>
 <section className="panel"><div className="day-title"><div><h2>{r.day}</h2><p>{r.enabled?"Dia ativo para atendimentos":"Sem atendimento neste dia"}</p></div><label className="toggle"><input type="checkbox" checked={r.enabled} onChange={e=>patch({enabled:e.target.checked})}/><span/></label></div>
 {r.enabled&&<><div className="number-grid"><label>Tempo de atendimento <div className="number-field"><input type="number" min="10" step="1" value={r.duration} onChange={e=>patch({duration:Math.max(10,Number(e.target.value)||10)})}/><span>min</span></div><small>Padrão: 60 minutos</small></label><label>Intervalo entre atendimentos <div className="number-field"><input type="number" min="0" max="120" step="1" value={r.interval} onChange={e=>patch({interval:Math.max(0,Math.min(120,Number(e.target.value)||0))})}/><span>min</span></div><small>Pode usar 0, 2, 7, 15 minutos etc.</small></label></div>
 <h3>Períodos do dia</h3>{r.periods.map((p,j)=><div className="period" key={p.id}><input value={p.name} onChange={e=>pp(j,{name:e.target.value})}/><input type="time" value={p.start} onChange={e=>pp(j,{start:e.target.value})}/><span>até</span><input type="time" value={p.end} onChange={e=>pp(j,{end:e.target.value})}/><button onClick={()=>patch({periods:r.periods.filter((_,i)=>i!==j)})}>×</button></div>)}
 <button className="add" onClick={()=>patch({periods:[...r.periods,{id:String(Date.now()),name:"Novo período",start:"13:00",end:"18:00"}]})}>+ Adicionar período</button></>}<div className="save-area"><button className={"save-button "+(saved?"saved":"")} onClick={onSave}>{saved?"✓ Salvo com sucesso":"✓ Salvar configuração"}</button></div></section></div>
}
function Agenda({slots,blocked,setBlocked,appointments,setAppointments}:{slots:{day:string;time:string;duration:number;interval:number}[];blocked:string[];setBlocked:(v:string[])=>void;appointments:DemoAppointment[];setAppointments:(v:DemoAppointment[])=>void}){
 const[day,setDay]=useState("Segunda");const[frequency,setFrequency]=useState<Frequency>("semanal");const[week,setWeek]=useState<0|1>(0);const shown=slots.filter(s=>s.day===day);
 const label=(f:Frequency)=>f==="unica"?"Uma vez":f==="semanal"?"Semanal":f==="quinzenal"?"Quinzenal":"Mensal";
 const occupancy=(time:string)=>appointments.filter(a=>a.day===day&&a.time===time);
 return <div className="screen"><div className="tip"><b>Agenda inteligente de recorrência</b><span>O sistema mostra ocupação parcial e oportunidades de encaixe em semanas alternadas.</span></div><h1>Minha Agenda</h1>
 <div className="week agenda-week">{DAYS.map(d=><button key={d} className={day===d?"selected":""} onClick={()=>setDay(d)}><b>{d.slice(0,3).toUpperCase()}</b></button>)}</div>
 <section className="panel recurrence"><h2>Ao agendar, qual a frequência?</h2><div className="frequency">{(["unica","semanal","quinzenal","mensal"] as Frequency[]).map(f=><button key={f} className={frequency===f?"selected":""} onClick={()=>setFrequency(f)}>{label(f)}</button>)}</div>{frequency==="quinzenal"&&<div className="fortnight"><span>Alternância:</span><button className={week===0?"selected":""} onClick={()=>setWeek(0)}>Semanas A</button><button className={week===1?"selected":""} onClick={()=>setWeek(1)}>Semanas B</button></div>}</section>
 <section className="panel"><div className="panel-title"><div><h2>{day}</h2><p>{shown.length} horários gerados</p></div></div><div className="slots">{shown.length?shown.map(s=>{const k=s.day+"-"+s.time,b=blocked.includes(k),occ=occupancy(s.time);const fortnight=occ.find(a=>a.frequency==="quinzenal");const partial=!!fortnight&&!occ.some(a=>a.frequency==="semanal");return <div key={k} className={"slot smart-slot "+(b?"blocked ":"")+(partial?"partial":"")}><b>{s.time}</b>{b?<span>Bloqueado</span>:occ.length?<><span>{occ.map(a=>a.patient).join(", ")}</span><small>{occ.map(a=>label(a.frequency)).join(" · ")}</small>{partial&&<div className="opportunity">✨ Vaga complementar disponível<br/><strong>Outra semana quinzenal livre</strong></div>}</>:<><span>Disponível</span><small>{s.duration} min</small></>}<div className="slot-actions">{!b&&<button onClick={()=>setAppointments([...appointments,{day,time:s.time,patient:"Novo paciente",frequency,weekPattern:frequency==="quinzenal"?week:undefined}])}>Agendar</button>}<button onClick={()=>setBlocked(b?blocked.filter(x=>x!==k):[...blocked,k])}>{b?"Liberar":"Bloquear"}</button></div></div>}):<div className="empty">Nenhum período configurado para este dia.</div>}</div></section></div>
}
function Patients({patients,setPatients}:{patients:any[];setPatients:(p:any[])=>void}){
 const[name,setName]=useState("");const[phone,setPhone]=useState("");const[same,setSame]=useState(true);const[fiscal,setFiscal]=useState("");
 const save=()=>{if(!name.trim())return;setPatients([...patients,{name,phone,payer:same?"Próprio paciente":fiscal||"Outro tomador",status:"Ativo"}]);setName("");setPhone("");setFiscal("")};
 return <div className="screen"><h1>Pacientes</h1><p className="muted">Cadastro clínico e preparação dos dados fiscais.</p><section className="panel form"><h2>Novo paciente</h2><input placeholder="Nome completo" value={name} onChange={e=>setName(e.target.value)}/><input placeholder="Telefone" value={phone} onChange={e=>setPhone(e.target.value)}/><label className="check"><input type="checkbox" checked={same} onChange={e=>setSame(e.target.checked)}/> Nota fiscal será emitida para o próprio paciente</label>{!same&&<input placeholder="Nome / razão social do tomador" value={fiscal} onChange={e=>setFiscal(e.target.value)}/>}<button className="primary" onClick={save}>Salvar paciente</button></section><section className="panel"><h2>Pacientes cadastrados</h2>{patients.map((p,i)=><div className="patient" key={i}><div className="patient-avatar">{p.name.split(" ").map((x:string)=>x[0]).slice(0,2).join("")}</div><div><b>{p.name}</b><p>{p.phone||"Sem telefone"} · {p.payer}</p></div><span className="status">Ativo</span></div>)}</section></div>
}