import {useEffect,useState} from 'react'
export const cx=(...a)=>a.filter(Boolean).join(' ')
const V={primary:'bg-brand text-white border-brand',secondary:'bg-surf border-line',danger:'bg-surf border-line text-bad'}
export const Button=({variant='secondary',size,className,...p})=>(
  <button className={cx('border rounded-full font-semibold',V[variant],size==='sm'?'px-2.5 py-1 text-xs':size==='lg'?'w-full py-3.5 text-[15px] font-extrabold':'px-[18px] py-[9px]',className)} {...p}/>)
export const Card=({className,...p})=><div className={cx('bg-surf border border-line rounded-card p-5',className)} {...p}/>
const T={default:'bg-b2 text-brand',bad:'bg-[#C8402F22] text-bad',ok:'bg-[#1E8E5A22] text-ok',warn:'bg-[#F0A20233] text-[#9A6700]'}
export const Tag=({tone='default',className,...p})=><span className={cx('inline-block px-[9px] py-0.5 rounded-full text-xs font-bold',T[tone],className)} {...p}/>
export const Tabs=({tabs,value,onChange})=>(
  <div className="flex gap-1 bg-f p-[3px] rounded-[9px]">{tabs.map(([k,l])=>(
    <button key={k} onClick={()=>onChange(k)} className={cx('border-0 px-3 py-[5px] rounded-[7px] font-semibold',value===k?'bg-surf text-ink shadow-[0_1px_2px_#0002]':'bg-transparent text-mut')}>{l}</button>))}</div>)
export const Table=({children})=><div className="overflow-x-auto"><table className="w-full border-collapse [&_tr:hover_td]:bg-b2">{children}</table></div>
export const Th=({right,className,...p})=><th className={cx('text-left text-xs text-mut font-semibold px-2.5 py-2 border-b border-line whitespace-nowrap',right&&'!text-right',className)} {...p}/>
export const Td=({right,className,...p})=><td className={cx('p-2.5 border-b border-line align-middle tabular-nums',right&&'text-right',className)} {...p}/>
export const Modal=({open,onClose,children})=>{
  useEffect(()=>{if(!open)return;const h=e=>e.key==='Escape'&&onClose();addEventListener('keydown',h);return()=>removeEventListener('keydown',h)},[open,onClose])
  if(!open)return null
  return <div className="fixed inset-0 bg-[#0009] grid place-items-center p-4 z-50" onClick={e=>e.target===e.currentTarget&&onClose()}>
    <div role="dialog" aria-modal="true" className="bg-surf rounded-[14px] p-[22px] w-[min(560px,100%)] max-h-[90vh] overflow-auto">{children}</div></div>}
export const PageHead=({title,sub,action})=>(
  <div className="flex justify-between items-center gap-3 mb-[18px] flex-wrap"><div><h1 className="text-2xl font-extrabold tracking-tight m-0">{title}</h1><div className="text-mut">{sub}</div></div><div>{action}</div></div>)
export const toast=m=>window.dispatchEvent(new CustomEvent('toast',{detail:m}))
export const Toaster=()=>{const [m,setM]=useState('');useEffect(()=>{let t;const h=e=>{setM(e.detail);clearTimeout(t);t=setTimeout(()=>setM(''),2600)};addEventListener('toast',h);return()=>removeEventListener('toast',h)},[])
  return m?<div role="status" className="fixed left-1/2 -translate-x-1/2 bottom-5 bg-ink text-bg px-[18px] py-2.5 rounded-[9px] z-[60]">{m}</div>:null}
export const gate=(d,err)=>err?<Card className="text-bad" role="alert">Could not load data: {err}</Card>:!d?<div className="text-mut">Loading…</div>:null
export const Empty=({children})=><div className="text-center text-mut p-[26px]">{children}</div>
export const statusTone=s=>s==='paid'?'ok':s==='cancelled'?'bad':'warn'
