import {useState} from 'react'
import {Modal,Button,toast} from './ui'
// fields: [key,label,type,options,optional]
export default function FormModal({title,fields,init={},onSave,onClose}){const [v,setV]=useState(init),[busy,setBusy]=useState(false)
  const submit=async e=>{e.preventDefault();const o={};fields.forEach(([k,,t])=>{let x=v[k]??'';o[k]=t==='number'?+x:x});setBusy(true)
    try{await onSave(o);onClose()}catch(err){toast(err.message)}setBusy(false)}
  return <Modal open onClose={onClose}><h2 className="text-lg font-bold m-0 mb-3">{title}</h2><form onSubmit={submit}>
    <div className="grid grid-cols-2 gap-x-2.5">{fields.map(([k,l,t,o,opt])=><div key={k} className={'mb-[11px] '+(t==='area'?'col-span-2':'')}><label htmlFor={'f_'+k}>{l}</label>
      {t==='select'?<select id={'f_'+k} value={v[k]??o[0]} onChange={e=>setV({...v,[k]:e.target.value})}>{o.map(x=><option key={x}>{x}</option>)}</select>
      :t==='area'?<textarea id={'f_'+k} rows="2" value={v[k]??''} onChange={e=>setV({...v,[k]:e.target.value})}/>
      :<input id={'f_'+k} type={t||'text'} step={t==='number'?'any':undefined} min={t==='number'?0:undefined} required={!opt} value={v[k]??''} onChange={e=>setV({...v,[k]:e.target.value})}/>}</div>)}</div>
    <div className="flex gap-2 mt-4"><Button type="button" className="flex-1" onClick={onClose}>Cancel</Button><Button variant="primary" type="submit" className="flex-1" disabled={busy}>Save</Button></div></form></Modal>}
