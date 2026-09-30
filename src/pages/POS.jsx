import {useState} from 'react'
import {supabase,q} from '../lib/supabase'
import {useLoad} from '../lib/hooks'
import {fmt} from '../lib/format'
import {Button,Modal,Tag,PageHead,Empty,gate,toast} from '../components/ui'
import Invoice from '../components/Invoice'
const mask='conic-gradient(from -45deg at bottom,#0000,#000 1deg 89deg,#0000 90deg) 50%/14px 100%'
export default function POS(){const {d,err,reload}=useLoad(async()=>({p:await q(supabase.from('products').select('*').order('name')),s:await q(supabase.from('settings').select('*').eq('id',1).single())}))
  const [cart,setCart]=useState({}),[cat,setCat]=useState('All'),[sq,setSq]=useState(''),[dtp,setDtp]=useState('percent'),[dv,setDv]=useState(''),[pay,setPay]=useState('Cash'),[cn,setCn]=useState(''),[cp,setCp]=useState(''),[confirmOpen,setConfirmOpen]=useState(false),[done,setDone]=useState(null),[busy,setBusy]=useState(false)
  const g=gate(d,err);if(g)return g
  const {p,s}=d,byId=Object.fromEntries(p.map(x=>[x.id,x])),ids=Object.keys(cart)
  const sub=ids.reduce((a,id)=>a+byId[id].selling_price*cart[id],0),v=+dv||0,disc=Math.min(sub,dtp==='percent'?sub*v/100:v),tax=(sub-disc)*s.gst_percent/100,total=sub-disc+tax
  const add=(id,n=1)=>{const x=byId[id],c=(cart[id]||0)+n;if(c>x.stock)return toast(`Only ${x.stock} ${x.unit} in stock`);const o={...cart};c<1?delete o[id]:o[id]=c;setCart(o)}
  const askToComplete=()=>{if(!ids.length)return toast('Add at least one product');setConfirmOpen(true)}
  const complete=async()=>{setConfirmOpen(false);setBusy(true)
    try{const b=await q(supabase.rpc('complete_sale',{p_name:cn,p_phone:cp,p_discount_type:dtp,p_discount_value:v,p_payment:pay,p_items:ids.map(id=>({product_id:id,qty:cart[id]}))}))
      const items=await q(supabase.from('bill_items').select('*').eq('bill_id',b.id));setDone({...b,bill_items:items});setCart({});setCn('');setCp('');setDv('');reload()}catch(e){toast(e.message)}setBusy(false)}
  const list=p.filter(x=>(cat==='All'||x.category===cat)&&(x.name+x.sku+(x.barcode||'')).toLowerCase().includes(sq.toLowerCase()))
  const seg=(on)=>'border rounded-lg py-2 px-1 font-semibold '+(on?'border-brand bg-b2 text-brand shadow-[inset_0_0_0_1px_var(--brand)]':'border-line bg-surf')
  return <><PageHead title="New bill" sub="Pick products, set quantity, then take payment"/>
    <div className="grid min-[1100px]:grid-cols-[1fr_390px] gap-[18px] items-start"><section className="min-w-0">
      <input placeholder="Search by name, SKU or barcode" aria-label="Search products" value={sq} onChange={e=>setSq(e.target.value)}/>
      <div className="flex gap-1.5 flex-wrap mt-2.5">{['All',...new Set(p.map(x=>x.category))].map(c=><button key={c} onClick={()=>setCat(c)} className={'border rounded-full px-3 py-1 '+(cat===c?'bg-brand text-white border-brand':'bg-surf border-line')}>{c}</button>)}</div>
      <div className="grid grid-cols-[repeat(auto-fill,minmax(150px,1fr))] gap-2.5 mt-3">{list.map(x=>{const left=x.stock-(cart[x.id]||0)
        return <button key={x.id} disabled={left<1} onClick={()=>add(x.id)} className="text-left bg-surf border border-line rounded-2xl p-3.5 flex flex-col gap-[3px] hover:enabled:border-brand disabled:opacity-50 disabled:cursor-not-allowed"><span>{x.name}</span><b className="text-base">{fmt(x.selling_price)}</b><Tag tone={x.stock<=x.low_stock_level?'bad':'default'} className="self-start">{left} {x.unit} in stock</Tag></button>})}
        {!list.length&&<Empty>No products match. Add products on the Products screen.</Empty>}</div></section>
    <section className="bg-surf border border-line rounded-t-xl p-4 pb-[26px] min-[1100px]:sticky min-[1100px]:top-4 min-[1100px]:max-h-[calc(100vh-40px)] overflow-auto" style={{WebkitMask:mask,mask}}>
      <h2 className="text-[15px] font-bold m-0 mb-3">Current bill</h2>
      {ids.length?ids.map(id=><div key={id} className="grid grid-cols-[1fr_auto_74px] gap-2 items-center py-2 border-b border-dashed border-line"><div>{byId[id].name}<div className="text-mut text-xs">{fmt(byId[id].selling_price)} × {cart[id]}</div></div>
        <div className="flex items-center border border-line rounded-lg"><button className="w-[26px] h-[26px] font-extrabold" aria-label="Decrease" onClick={()=>add(id,-1)}>−</button><span className="min-w-6 text-center">{cart[id]}</span><button className="w-[26px] h-[26px] font-extrabold" aria-label="Increase" onClick={()=>add(id,1)}>+</button></div>
        <div className="text-right"><b>{fmt(byId[id].selling_price*cart[id])}</b><button className="block ml-auto text-xs text-bad" onClick={()=>add(id,-cart[id])}>Remove</button></div></div>):<Empty>Tap a product to add it to the bill.</Empty>}
      <div className="grid grid-cols-2 gap-2.5 mt-3"><div><label htmlFor="cn">Customer name</label><input id="cn" placeholder="Walk-in" value={cn} onChange={e=>setCn(e.target.value)}/></div><div><label htmlFor="cp">Phone number</label><input id="cp" inputMode="tel" placeholder="98xxx xxxxx" value={cp} onChange={e=>setCp(e.target.value)}/></div></div>
      <div className="grid grid-cols-2 gap-2.5 mt-3"><div><label>Discount</label><div className="grid grid-cols-2 gap-1.5"><button className={seg(dtp==='percent')} onClick={()=>setDtp('percent')}>%</button><button className={seg(dtp==='fixed')} onClick={()=>setDtp('fixed')}>{fmt(0)[0]} fixed</button></div></div><div><label htmlFor="dv">Value</label><input id="dv" type="number" min="0" value={dv} placeholder="0" onChange={e=>setDv(e.target.value)}/></div></div>
      <label className="mt-3">Payment method</label><div className="grid grid-cols-3 gap-1.5">{['Cash','Card','UPI / QR'].map(m=><button key={m} className={seg(pay===m)} onClick={()=>setPay(m)}>{m}</button>)}</div>
      <div className="my-3.5 [&>div]:flex [&>div]:justify-between [&>div]:py-[3px]"><div><span className="text-mut">Subtotal</span><span>{fmt(sub)}</span></div><div><span className="text-mut">Discount</span><span>−{fmt(disc)}</span></div>
        {tax>0&&<div><span className="text-mut">GST {s.gst_percent}%</span><span>{fmt(tax)}</span></div>}<div className="!text-[22px] font-extrabold border-t-2 border-ink mt-1.5 !pt-[9px]"><span>Total</span><span>{fmt(total)}</span></div></div>
      <Button variant="primary" size="lg" disabled={busy} onClick={askToComplete}>Complete sale</Button></section></div>
    <Modal open={confirmOpen} onClose={()=>!busy&&setConfirmOpen(false)}><h2 className="text-lg font-bold m-0 mb-2">Confirm sale</h2><p className="text-mut mt-0">Are you sure you want to complete this sale? The bill will be generated, stock will be updated, and the sale will be saved.</p><div className="flex gap-2 mt-4"><Button className="flex-1" disabled={busy} onClick={()=>setConfirmOpen(false)}>Cancel</Button><Button variant="primary" className="flex-1" disabled={busy} onClick={complete}>Confirm sale</Button></div></Modal>
    <Modal open={!!done} onClose={()=>setDone(null)}>{done&&<><Invoice b={done} s={s}/><Button className="w-full mt-2" onClick={()=>setDone(null)}>New bill</Button></>}</Modal></>}
