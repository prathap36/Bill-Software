import {useState} from 'react'
import {supabase,q} from '../lib/supabase'
import {useLoad} from '../lib/hooks'
import {fmt,sum,dayKey} from '../lib/format'
import {Button,Card,Tag,Table,Th,Td,PageHead,Empty,gate,toast} from '../components/ui'
import FormModal from '../components/FormModal'
const F=[['name','Expense name'],['category','Category','select',['Rent','Salary','Electricity','Transport','Maintenance','Internet','Other']],['amount','Amount','number'],['expense_date','Date','date'],['payment_method','Payment method','select',['Cash','Card','UPI / QR']],['notes','Notes','area',null,true]]
export default function Expenses(){const {d,err,reload}=useLoad(()=>q(supabase.from('expenses').select('*').order('expense_date',{ascending:false}).order('created_at',{ascending:false}))),[ed,setEd]=useState(null)
  const g=gate(d,err);if(g)return g
  const save=async v=>{await q(ed.id?supabase.from('expenses').update(v).eq('id',ed.id):supabase.from('expenses').insert(v));reload();toast('Expense saved')}
  const del=async e=>{if(!confirm('Delete this expense?'))return;try{await q(supabase.from('expenses').delete().eq('id',e.id));reload()}catch(x){toast(x.message)}}
  return <><PageHead title="Expenses" sub={`${fmt(sum(d,e=>+e.amount))} recorded`} action={<Button variant="primary" onClick={()=>setEd({expense_date:dayKey(new Date())})}>Add expense</Button>}/>
    <Card><Table><thead><tr><Th>Date</Th><Th>Expense</Th><Th>Category</Th><Th>Paid by</Th><Th right>Amount</Th><Th/></tr></thead><tbody>
      {d.map(e=><tr key={e.id}><Td>{e.expense_date}</Td><Td><b>{e.name}</b><div className="text-mut text-xs">{e.notes}</div></Td><Td><Tag>{e.category}</Tag></Td><Td>{e.payment_method}</Td><Td right>{fmt(e.amount)}</Td>
        <Td right className="whitespace-nowrap"><Button size="sm" onClick={()=>setEd(e)}>Edit</Button> <Button size="sm" variant="danger" onClick={()=>del(e)}>Delete</Button></Td></tr>)}</tbody></Table>
      {!d.length&&<Empty>No expenses yet. Choose Add expense to record one.</Empty>}</Card>
    {ed&&<FormModal title={ed.id?'Edit expense':'Add expense'} fields={F} init={ed} onSave={save} onClose={()=>setEd(null)}/>}</>}
