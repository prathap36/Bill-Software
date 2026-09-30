import {useState} from 'react'
import {supabase,q} from '../lib/supabase'
import {fmt} from '../lib/format'
import {Button,toast} from './ui'
export default function ReturnForm({bill,onBack,onDone}){const [qty,setQty]=useState({}),[m,setM]=useState('Cash'),[busy,setBusy]=useState(false)
  const f=bill.subtotal>0?bill.total/bill.subtotal:1,est=bill.bill_items.reduce((a,i)=>a+(+qty[i.id]||0)*i.selling_price*f,0)
  const go=async()=>{const items=bill.bill_items.map(i=>({bill_item_id:i.id,qty:+qty[i.id]||0})).filter(x=>x.qty>0)
    if(!items.length)return toast('Enter a quantity to return');setBusy(true)
    try{await q(supabase.rpc('process_return',{p_bill_id:bill.id,p_items:items,p_method:m}));toast('Refund recorded, stock restored');onDone()}catch(e){toast(e.message)}setBusy(false)}
  return <div><h2 className="text-lg font-bold m-0">Return items from {bill.invoice_no}</h2><div className="text-mut">Returned quantities go back into stock.</div>
    <table className="w-full my-2.5"><tbody>{bill.bill_items.map(i=><tr key={i.id} className="border-b border-line"><td className="py-2">{i.name}<div className="text-mut text-xs">{i.qty-i.returned_qty} available to return</div></td>
      <td className="w-[90px]"><input type="number" min="0" max={i.qty-i.returned_qty} value={qty[i.id]||''} placeholder="0" aria-label={'Quantity of '+i.name} onChange={e=>setQty({...qty,[i.id]:e.target.value})}/></td></tr>)}</tbody></table>
    <label htmlFor="rm">Refund method</label><select id="rm" value={m} onChange={e=>setM(e.target.value)}><option>Cash</option><option>Card</option><option>UPI / QR</option></select>
    <div className="flex gap-2 mt-4"><Button className="flex-1" onClick={onBack}>Back</Button><Button variant="primary" className="flex-1" disabled={busy} onClick={go}>Refund {fmt(est)}</Button></div></div>}
