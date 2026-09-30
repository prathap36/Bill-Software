import {useState} from 'react'
import {supabase,q} from '../lib/supabase'
import {useLoad} from '../lib/hooks'
import {fmt,daysAgo,dayKey,dt,sum,netSales,costOf,profitOf} from '../lib/format'
import {Button,Card,Table,Th,Td,PageHead,Empty,gate} from '../components/ui'
const TYPES=['Sales','Expense','Profit','Stock','Customer','Payment']
export default function Reports(){const [type,setType]=useState('Sales'),[from,setFrom]=useState(daysAgo(29)),[to,setTo]=useState(daysAgo(0))
  const {d,err}=useLoad(async()=>{const a=new Date(from+'T00:00:00').toISOString(),z=new Date(to+'T23:59:59.999').toISOString()
    const [b,e,p]=await Promise.all([q(supabase.from('bills').select('*,bill_items(*)').neq('status','cancelled').gte('created_at',a).lte('created_at',z).order('created_at')),q(supabase.from('expenses').select('*').gte('expense_date',from).lte('expense_date',to).order('expense_date')),q(supabase.from('products').select('*').order('name'))]);return{b,e,p}},[from,to])
  const g=gate(d,err);if(g)return g
  const {b,e,p}=d;let h,r,m=[]  // m = money column indexes
  if(type==='Sales'){h=['Bill','Date','Customer','Payment','Amount'];r=b.map(x=>[x.invoice_no,dt(x.created_at),x.customer_name,x.payment_method,netSales(x)]);m=[4]}
  else if(type==='Expense'){h=['Date','Expense','Category','Amount'];r=e.map(x=>[x.expense_date,x.name,x.category,+x.amount]);m=[3]}
  else if(type==='Profit'){const days=[...new Set(b.map(x=>dayKey(x.created_at)))];h=['Date','Sales','Cost','Gross profit'];m=[1,2,3]
    r=days.map(k=>{const z=b.filter(x=>dayKey(x.created_at)===k);return[k,sum(z,netSales),sum(z,costOf),sum(z,profitOf)]}).concat([['Expenses','','',-sum(e,x=>+x.amount)],['Net profit','','',sum(b,profitOf)-sum(e,x=>+x.amount)]])}
  else if(type==='Stock'){h=['Product','SKU','Stock','Stock value (cost)'];r=p.map(x=>[x.name,x.sku,`${x.stock} ${x.unit}`,x.stock*x.purchase_price]);m=[3]}
  else if(type==='Customer'){const c={};b.filter(x=>x.customer_phone).forEach(x=>{const o=c[x.customer_phone]||(c[x.customer_phone]={n:x.customer_name,c:0,v:0});o.c++;o.v+=netSales(x)});h=['Customer','Phone','Bills','Purchases'];r=Object.entries(c).map(([ph,o])=>[o.n,ph,o.c,o.v]);m=[3]}
  else{h=['Payment method','Bills','Amount'];r=['Cash','Card','UPI / QR'].map(k=>{const z=b.filter(x=>x.payment_method===k);return[k,z.length,sum(z,netSales)]});m=[2]}
  const csv=()=>{const t=[h,...r].map(x=>x.map(c=>`"${String(c).replace(/"/g,'""')}"`).join(',')).join('\n'),a=document.createElement('a');a.href=URL.createObjectURL(new Blob([t],{type:'text/csv'}));a.download=`${type.toLowerCase()}-report-${from}-to-${to}.csv`;a.click()}
  return <><PageHead title="Reports" sub="Choose a report and date range"/>
    <Card><div className="grid grid-cols-2 min-[900px]:grid-cols-[1fr_1fr_1fr_auto_auto] gap-3.5 items-end mb-3.5 no-print">
      <div><label htmlFor="rs">Report</label><select id="rs" value={type} onChange={e=>setType(e.target.value)}>{TYPES.map(x=><option key={x} value={x}>{x} report</option>)}</select></div>
      <div><label htmlFor="r1">From</label><input id="r1" type="date" value={from} max={to} onChange={e=>setFrom(e.target.value)}/></div>
      <div><label htmlFor="r2">To</label><input id="r2" type="date" value={to} min={from} onChange={e=>setTo(e.target.value)}/></div>
      <Button variant="primary" onClick={csv}>Export CSV</Button><Button onClick={()=>print()}>Export PDF</Button></div>
      <div className="print-area"><h2 className="text-[15px] font-bold m-0 mb-2">{type} report · {from} to {to}</h2>
        <Table><thead><tr>{h.map((x,i)=><Th key={x} right={m.includes(i)}>{x}</Th>)}</tr></thead><tbody>{r.map((x,i)=><tr key={i}>{x.map((c,j)=><Td key={j} right={m.includes(j)}>{m.includes(j)&&c!==''?fmt(c):c}</Td>)}</tr>)}</tbody></Table>
        {!r.length&&<Empty>No records in this date range.</Empty>}</div></Card></>}
