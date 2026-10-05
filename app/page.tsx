"use client";
import { useMemo, useState } from "react";

type View = "inicio"|"disponibilidade"|"agenda"|"pacientes";

const days = ["Segunda","Terça","Quarta","Quinta","Sexta"];

export default function Home(){
  const [view,setView]=useState<View>("inicio");
  const [slots,setSlots]=useState([
    {day:"Segunda",start:"08:00",end:"12:00",active:true},
    {day:"Segunda",start:"14:00",end:"18:00",active:true},
    {day:"Quarta",start:"13:00",end:"19:00",active:true},
    {day:"Sexta",start:"08:00",end:"12:00",active:true},
  ]);
  const [patients,setPatients]=useState([
    {name:"Paciente exemplo",phone:"(48) 99999-0000",payer:"Próprio paciente",status:"Ativo"}
  ]);

  const availableCount=useMemo(()=>slots.filter(s=>s.active).length,[slots]);

  return <div className="shell">
    <aside className="sidebar">
      <div className="brand">Psi Gestão Fácil</div>
      <div className="nav">
        {([["inicio","Início"],["disponibilidade","Disponibilidade"],["agenda","Agenda"],["pacientes","Pacientes"]] as [View,string][]).map(([k,label])=>
          <button key={k} className={view===k?"active":""} onClick={()=>setView(k)}>{label}</button>
        )}
      </div>
    </aside>
    <main className="main">
      <div className="top">
        <div><h1 style={{margin:0}}>{title(view)}</h1><div className="muted">Protótipo V0.1 • Psicóloga piloto</div></div>
        <button className="btn" onClick={()=>alert("Fluxo de novo agendamento entra na próxima etapa.")}>+ Novo agendamento</button>
      </div>
      {view==="inicio" && <Dashboard availableCount={availableCount} patients={patients.length}/>}
      {view==="disponibilidade" && <Availability slots={slots} setSlots={setSlots}/>}
      {view==="agenda" && <Agenda slots={slots}/>}
      {view==="pacientes" && <Patients patients={patients} setPatients={setPatients}/>}
    </main>
  </div>
}

function title(v:View){return ({inicio:"Visão geral",disponibilidade:"Disponibilidade",agenda:"Agenda",pacientes:"Pacientes"})[v]}

function Dashboard({availableCount,patients}:{availableCount:number,patients:number}){
  return <>
    <div className="grid">
      <div className="card"><div className="muted">Pacientes ativos</div><h2>{patients}</h2></div>
      <div className="card"><div className="muted">Blocos de disponibilidade</div><h2>{availableCount}</h2></div>
      <div className="card"><div className="muted">Próxima etapa</div><h2>Agenda inteligente</h2></div>
    </div>
    <div className="card section">
      <h3>O que estamos validando primeiro</h3>
      <p className="muted">A psicóloga define quando atende. A agenda nasce da disponibilidade. O cadastro do paciente mantém separado quem é atendido e quem recebe a nota fiscal.</p>
    </div>
  </>
}

function Availability({slots,setSlots}:{slots:any[],setSlots:any}){
  const add=()=>setSlots([...slots,{day:"Terça",start:"08:00",end:"12:00",active:true}]);
  return <div className="card">
    <div className="row" style={{justifyContent:"space-between"}}><div><h3>Horários de atendimento</h3><div className="muted">Defina dias e faixas de horário.</div></div><button className="btn" onClick={add}>+ Adicionar faixa</button></div>
    <table className="table"><thead><tr><th>Dia</th><th>Início</th><th>Fim</th><th>Status</th><th></th></tr></thead>
      <tbody>{slots.map((s,i)=><tr key={i}><td>
        <select className="input" value={s.day} onChange={e=>{const n=[...slots];n[i]={...n[i],day:e.target.value};setSlots(n)}}>{days.map(d=><option key={d}>{d}</option>)}</select>
      </td><td><input className="input" type="time" value={s.start} onChange={e=>{const n=[...slots];n[i]={...n[i],start:e.target.value};setSlots(n)}}/></td>
      <td><input className="input" type="time" value={s.end} onChange={e=>{const n=[...slots];n[i]={...n[i],end:e.target.value};setSlots(n)}}/></td>
      <td><span className="pill">{s.active?"Disponível":"Bloqueado"}</span></td>
      <td><button className="btn secondary" onClick={()=>setSlots(slots.filter((_,idx)=>idx!==i))}>Remover</button></td></tr>)}</tbody>
    </table>
  </div>
}

function Agenda({slots}:{slots:any[]}){
  return <div className="card"><h3>Prévia da agenda</h3><p className="muted">Nesta primeira etapa mostramos como a disponibilidade alimentará os horários futuros.</p>
    <table className="table"><thead><tr><th>Dia</th><th>Faixa</th><th>Situação</th></tr></thead><tbody>
      {slots.filter(s=>s.active).map((s,i)=><tr key={i}><td>{s.day}</td><td>{s.start}–{s.end}</td><td><span className="pill">Aberta para agendamento</span></td></tr>)}
    </tbody></table>
  </div>
}

function Patients({patients,setPatients}:{patients:any[],setPatients:any}){
  const [name,setName]=useState(""); const [phone,setPhone]=useState(""); const [fiscalSame,setFiscalSame]=useState(true); const [fiscalName,setFiscalName]=useState("");
  const save=()=>{if(!name)return;setPatients([...patients,{name,phone,payer:fiscalSame?"Próprio paciente":fiscalName||"Outro tomador",status:"Ativo"}]);setName("");setPhone("");setFiscalName("")};
  return <div className="two">
    <div className="card">
      <h3>Novo paciente</h3>
      <div className="row"><input className="input" placeholder="Nome completo" value={name} onChange={e=>setName(e.target.value)}/><input className="input" placeholder="Telefone" value={phone} onChange={e=>setPhone(e.target.value)}/></div>
      <div className="section"><label><input type="checkbox" checked={fiscalSame} onChange={e=>setFiscalSame(e.target.checked)}/> Nota fiscal para o próprio paciente</label></div>
      {!fiscalSame && <div className="section"><input className="input" placeholder="Nome / razão social do tomador" value={fiscalName} onChange={e=>setFiscalName(e.target.value)}/></div>}
      <div className="section"><button className="btn" onClick={save}>Salvar paciente</button></div>
    </div>
    <div className="card"><h3>Pacientes cadastrados</h3><table className="table"><thead><tr><th>Paciente</th><th>Tomador fiscal</th><th>Status</th></tr></thead><tbody>{patients.map((p,i)=><tr key={i}><td>{p.name}<div className="muted">{p.phone}</div></td><td>{p.payer}</td><td><span className="pill">{p.status}</span></td></tr>)}</tbody></table></div>
  </div>
}
