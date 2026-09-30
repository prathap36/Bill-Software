import {useState} from 'react'
import {supabase,q} from '../lib/supabase'
import {useLoad} from '../lib/hooks'
import {fmt,dt,cap,sum,netSales} from '../lib/format'
import {Button,Card,Tag,Modal,Table,Th,Td,PageHead,Empty,gate,statusTone} from '../components/ui'
import FormModal from '../components/FormModal'
export default function Customers(){const {d,err,reload}=useLoad(async()=>({c:await q(supabase.from('customers').select('*').order('name')),b:await q(supabase.from('bills').select('id,invoice_no,customer_phone,total,refunded_amount,status,created_at').order('created_at',{ascending:false}))}))
  const [add,setAdd]=useState(false),[sel,setSel]=useState(null)
  const g=gate(d,err);if(g)return g
  const st=c=>{const all=d.b.filter(x=>x.customer_phone===c.phone),ok=all.filter(x=>x.status!=='cancelled');return{all,n:ok.length,tot:sum(ok,netSales),last:ok[0]?.created_at}}
  return <><PageHead title="Customers" sub={`${d.c.length} saved customers`} action={<Button variant="primary" onClick={()=>setAdd(true)}>Add customer</Button>}/>
    <Card><Table><thead><tr><Th>Name</Th><Th>Phone</Th><Th right>Bills</Th><Th right>Total purchases</Th><Th>Last visit</Th></tr></thead><tbody>
      {d.c.map(c=>{const s=st(c);return <tr key={c.id} className="cursor-pointer" onClick={()=>setSel(c)}><Td><b>{c.name}</b></Td><Td>{c.phone}</Td><Td right>{s.n}</Td><Td right>{fmt(s.tot)}</Td><Td>{s.last?dt(s.last):'—'}</Td></tr>})}</tbody></Table>
      {!d.c.length&&<Empty>No customers yet. They are saved automatically when a bill has a phone number.</Empty>}</Card>
    {add&&<FormModal title="Add customer" fields={[['name','Customer name'],['phone','Phone number','tel']]} onSave={async v=>{await q(supabase.from('customers').insert(v));reload()}} onClose={()=>setAdd(false)}/>}
    <Modal open={!!sel} onClose={()=>setSel(null)}>{sel&&(()=>{const s=st(sel);return <><h2 className="text-lg font-bold m-0">{sel.name}</h2><div className="text-mut">{sel.phone} · {fmt(s.tot)} lifetime purchases</div>
      <Table><thead><tr><Th>Bill</Th><Th>Date</Th><Th right>Amount</Th><Th>Status</Th></tr></thead><tbody>{s.all.map(x=><tr key={x.id}><Td>{x.invoice_no}</Td><Td>{dt(x.created_at)}</Td><Td right>{fmt(x.total)}</Td><Td><Tag tone={statusTone(x.status)}>{cap(x.status)}</Tag></Td></tr>)}</tbody></Table>
      {!s.all.length&&<Empty>No purchases yet.</Empty>}<Button className="w-full mt-4" onClick={()=>setSel(null)}>Close</Button></>})()}</Modal></>}
