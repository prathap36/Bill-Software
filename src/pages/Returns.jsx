import {useState} from 'react'
import {supabase,q} from '../lib/supabase'
import {useLoad} from '../lib/hooks'
import {fmt,dt} from '../lib/format'
import {Button,Card,Modal,Table,Th,Td,PageHead,Empty,gate} from '../components/ui'
import ReturnForm from '../components/ReturnForm'
export default function Returns(){const {d,err,reload}=useLoad(async()=>({r:await q(supabase.from('returns').select('*,bills(invoice_no),return_items(qty,bill_items(name))').order('created_at',{ascending:false})),b:await q(supabase.from('bills').select('*,bill_items(*)').in('status',['paid','part-returned']).order('created_at',{ascending:false}).limit(200))}))
  const [open,setOpen]=useState(false),[sel,setSel]=useState('')
  const g=gate(d,err);if(g)return g
  const bill=d.b.find(b=>b.id===sel),shut=()=>{setOpen(false);setSel('')}
  return <><PageHead title="Returns" sub={`${d.r.length} processed`} action={<Button variant="primary" onClick={()=>setOpen(true)}>Process return</Button>}/>
    <Card><Table><thead><tr><Th>Date</Th><Th>Bill</Th><Th>Items returned</Th><Th>Refund via</Th><Th right>Refund</Th></tr></thead><tbody>
      {d.r.map(r=><tr key={r.id}><Td>{dt(r.created_at)}</Td><Td>{r.bills?.invoice_no}</Td><Td>{r.return_items.map(i=>`${i.bill_items?.name} × ${i.qty}`).join(', ')}</Td><Td>{r.refund_method}</Td><Td right>{fmt(r.refund_amount)}</Td></tr>)}</tbody></Table>
      {!d.r.length&&<Empty>No returns yet. Choose Process return to refund items from a bill.</Empty>}</Card>
    <Modal open={open} onClose={shut}>{bill?<ReturnForm bill={bill} onBack={()=>setSel('')} onDone={()=>{shut();reload()}}/>:<><h2 className="text-lg font-bold m-0 mb-3">Choose a bill</h2>
      <label htmlFor="pb">Bill</label><select id="pb" value={sel} onChange={e=>setSel(e.target.value)}><option value="">Select a bill…</option>{d.b.map(b=><option key={b.id} value={b.id}>{b.invoice_no} · {b.customer_name} · {fmt(b.total)}</option>)}</select>
      <Button className="w-full mt-4" onClick={shut}>Cancel</Button></>}</Modal></>}
