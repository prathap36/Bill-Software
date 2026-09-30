import {useEffect,useState} from 'react'
import {useSearchParams} from 'react-router-dom'
import {supabase,q} from '../lib/supabase'
import {useLoad} from '../lib/hooks'
import {fmt,dt,cap,dayKey} from '../lib/format'
import {Button,Card,Tag,Modal,Table,Th,Td,PageHead,Empty,gate,statusTone,toast} from '../components/ui'
import Invoice from '../components/Invoice'
import ReturnForm from '../components/ReturnForm'
export default function Bills(){const [sp]=useSearchParams(),[term,setTerm]=useState(sp.get('q')||''),[sel,setSel]=useState(null),[mode,setMode]=useState('view')
  useEffect(()=>setTerm(sp.get('q')||''),[sp])
  const {d,err,reload}=useLoad(async()=>({b:await q(supabase.from('bills').select('*,bill_items(*)').order('created_at',{ascending:false}).limit(500)),s:await q(supabase.from('settings').select('*').eq('id',1).single())}))
  const g=gate(d,err);if(g)return g
  const t=term.toLowerCase(),list=d.b.filter(b=>(b.invoice_no+b.customer_name+b.customer_phone+dayKey(b.created_at)+dt(b.created_at)).toLowerCase().includes(t)).slice(0,50)
  const bill=d.b.find(b=>b.id===sel),close=()=>{setSel(null);setMode('view')}
  const cancel=async()=>{if(!confirm(`Cancel ${bill.invoice_no}? Stock will be restored and the sale removed from reports.`))return
    try{await q(supabase.rpc('cancel_bill',{p_bill_id:bill.id}));toast('Bill cancelled, stock restored');close();reload()}catch(e){toast(e.message)}}
  return <><PageHead title="Bill history" sub={`${d.b.length} bills`}/>
    <Card><input className="mb-3" placeholder="Search by bill number, customer, phone or date (2026-09-30)" aria-label="Search bills" value={term} onChange={e=>setTerm(e.target.value)}/>
      <Table><thead><tr><Th>Bill</Th><Th>Date</Th><Th>Customer</Th><Th>Payment</Th><Th right>Total</Th><Th>Status</Th></tr></thead><tbody>
        {list.map(b=><tr key={b.id} className="cursor-pointer" onClick={()=>setSel(b.id)}><Td><b>{b.invoice_no}</b></Td><Td>{dt(b.created_at)}</Td><Td>{b.customer_name}<div className="text-mut text-xs">{b.customer_phone}</div></Td><Td>{b.payment_method}</Td><Td right>{fmt(b.total)}</Td><Td><Tag tone={statusTone(b.status)}>{cap(b.status)}</Tag></Td></tr>)}</tbody></Table>
      {!list.length&&<Empty>No bills match your search.</Empty>}</Card>
    <Modal open={!!bill} onClose={close}>{bill&&(mode==='return'?<ReturnForm bill={bill} onBack={()=>setMode('view')} onDone={()=>{close();reload()}}/>
      :<><Invoice b={bill} s={d.s}/>{bill.status!=='cancelled'&&<div className="no-print flex gap-2 mt-2 [&>button]:flex-1">{bill.status!=='returned'&&<Button onClick={()=>setMode('return')}>Return items</Button>}<Button variant="danger" onClick={cancel}>Cancel bill</Button></div>}</>)}</Modal></>}
