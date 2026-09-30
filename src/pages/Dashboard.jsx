import {useEffect,useState} from 'react'
import {Link} from 'react-router-dom'
import {supabase} from '../lib/supabase'
import {fmt,dayKey,daysAgo,sum,netSales,costOf,profitOf} from '../lib/format'
import {Button,Card,Tag,Tabs} from '../components/ui'
import {ProgressRing,BarChart,TrendChart,Donut} from '../components/charts'
function group(bills,n,step){const out=[];for(let i=n-1;i>=0;i--){let f,l
  if(step==='d'){const k=daysAgo(i);f=b=>b.day===k;l=k.slice(5)}
  else if(step==='w'){const hi=daysAgo(i*7),lo=daysAgo(i*7+7);f=b=>b.day<=hi&&b.day>lo;l='W-'+i}
  else{const d=new Date();d.setMonth(d.getMonth()-i);const k=dayKey(d).slice(0,7);f=b=>b.day.slice(0,7)===k;l=d.toLocaleString('en',{month:'short'})}
  const z=bills.filter(f);out.push({l,v:sum(z,netSales),p:sum(z,profitOf)})}return out}
const RingTile=({k,v,pct,color,cap})=><Card className="flex justify-between items-center gap-2"><div><div className="text-xs text-mut">{k}</div><div className="text-2xl font-extrabold tracking-tight tabular-nums">{v}</div><div className="text-xs text-mut">{cap}</div></div><ProgressRing pct={pct} color={color}/></Card>
const Stat=({k,v})=><Card><div className="text-xs text-mut">{k}</div><div className="text-[19px] font-extrabold tracking-tight tabular-nums">{v}</div></Card>
const Row=({a,b})=><div className="grid grid-cols-[1fr_auto] gap-2.5 items-center my-2 text-[13px]">{a}{b}</div>
export default function Dashboard(){const [d,setD]=useState(null),[err,setErr]=useState(''),[tab,setTab]=useState('d')
  useEffect(()=>{(async()=>{
    // Cancelled bills are excluded here, so they never touch sales or profit.
    const [b,e,p,c]=await Promise.all([supabase.from('bills').select('*,bill_items(*)').neq('status','cancelled'),supabase.from('expenses').select('amount'),supabase.from('products').select('*'),supabase.from('customers').select('*',{count:'exact',head:true})])
    const bad=[b,e,p,c].find(x=>x.error);if(bad)return setErr(bad.error.message)
    setD({bills:b.data.map(x=>({...x,day:dayKey(x.created_at)})),exp:sum(e.data,x=>Number(x.amount)),prods:p.data,customers:c.count})})()},[])
  if(err)return <Card className="text-bad" role="alert">Could not load data: {err}</Card>
  if(!d)return <div className="text-mut">Loading…</div>
  const {bills,exp,prods}=d,today=sum(bills.filter(b=>b.day===daysAgo(0)),netSales),total=sum(bills,netSales),gp=sum(bills,profitOf),net=gp-exp
  const trend=group(bills,30,'d'),avg=sum(trend,x=>x.v)/30||1,chart=tab==='d'?group(bills,14,'d'):tab==='w'?group(bills,8,'w'):group(bills,4,'m')
  const low=prods.filter(p=>p.stock<=p.low_stock_level),col=['var(--brand)','var(--acc)','var(--pur)']
  const pay=['Cash','Card','UPI / QR'].map(m=>({m,v:sum(bills.filter(b=>b.payment_method===m),netSales)})),pt=sum(pay,x=>x.v)||1
  const tp={};bills.forEach(b=>b.bill_items.forEach(i=>tp[i.name]=(tp[i.name]||0)+(i.qty-i.returned_qty)*Number(i.selling_price)))
  const top=Object.entries(tp).sort((a,c)=>c[1]-a[1]).slice(0,5)
  const cs={};bills.filter(b=>b.customer_phone).forEach(b=>{const x=cs[b.customer_phone]||(cs[b.customer_phone]={name:b.customer_name,phone:b.customer_phone,v:0});x.v+=netSales(b)})
  const tc=Object.values(cs).sort((a,c)=>c.v-a.v)[0]
  return <div className="grid min-[1100px]:grid-cols-[minmax(0,1fr)_330px] gap-[26px]"><div className="min-w-0">
    <div className="mb-[22px]"><h1 className="text-[clamp(28px,4vw,40px)] leading-[1.1] tracking-[-1px] font-extrabold m-0 mb-2.5">Start managing<br/>your business!</h1>
      <p className="text-mut max-w-[430px] mt-0 mb-4">Create bills, track stock and see your profit at a glance.</p>
      <Link to="/pos"><Button variant="primary">Add new bill</Button></Link></div>
    <div className="grid grid-cols-2 gap-3.5">
      <RingTile k="Today's sales" v={fmt(today)} pct={Math.round(today/avg*100)} color="var(--pur)" cap="vs 30-day daily avg"/>
      <RingTile k="Gross profit" v={fmt(gp)} pct={Math.round(gp/Math.max(1,total)*100)} color="var(--brand)" cap="margin on sales"/>
      <RingTile k="Net profit" v={<span className={net<0?'text-bad':'text-ok'}>{fmt(net)}</span>} pct={Math.round(net/Math.max(1,gp)*100)} color="var(--ok)" cap="after expenses"/>
      <RingTile k="Total expenses" v={fmt(exp)} pct={Math.round(exp/Math.max(1,total)*100)} color="var(--acc)" cap="of total sales"/></div>
    <div className="grid grid-cols-2 min-[1100px]:grid-cols-3 gap-3.5 mt-3.5">
      <Stat k="Total sales" v={fmt(total)}/><Stat k="Bills" v={bills.length}/><Stat k="Items sold" v={sum(bills,b=>sum(b.bill_items,i=>i.qty-i.returned_qty))}/>
      <Stat k="Products" v={prods.length}/><Stat k="Customers" v={d.customers}/><Stat k="Low stock" v={<span className="text-bad">{low.length}</span>}/></div>
    <Card className="mt-3.5"><div className="flex justify-between items-center gap-2.5 mb-3 flex-wrap"><h2 className="text-[15px] font-bold m-0">Sales</h2>
      <Tabs tabs={[['d','Daily'],['w','Weekly'],['m','Monthly']]} value={tab} onChange={setTab}/></div><BarChart data={chart}/></Card>
    <div className="grid grid-cols-2 max-[1100px]:grid-cols-1 gap-3.5 mt-3.5">
      <Card><h2 className="text-[15px] font-bold m-0 mb-3">Payment methods</h2><div className="flex gap-4 items-center"><Donut parts={pay.map((p,i)=>({v:p.v,c:col[i]}))}/>
        <div>{pay.map((p,i)=><div key={p.m}><span style={{color:col[i]}}>●</span> {p.m} <b>{Math.round(p.v/pt*100)}%</b></div>)}</div></div></Card>
      <Card><h2 className="text-[15px] font-bold m-0 mb-3">Top-selling products</h2>
        {top[0]?<><div className="bg-brand text-white rounded-[18px] p-4 mb-3 shadow-[0_10px_0_-4px_#1F6FF255]"><div className="text-xs opacity-85">Best seller</div><b className="text-lg">{top[0][0]}</b><div>{fmt(top[0][1])} in sales</div></div>
          {top.map(([n,v])=><div key={n} className="grid grid-cols-[120px_1fr_70px] gap-2.5 items-center my-2 text-[13px]"><span>{n}</span><div className="h-1.5 rounded-full bg-line overflow-hidden"><b className="block h-full bg-brand" style={{width:v/top[0][1]*100+'%'}}/></div><span className="text-right tabular-nums">{fmt(v)}</span></div>)}</>
        :<div className="text-center text-mut p-[26px]">No sales yet. Create your first bill.</div>}</Card></div></div>
    <div className="grid gap-3.5 content-start min-[1100px]:border-l border-line min-[1100px]:pl-[26px]">
      <Card><h2 className="text-[15px] font-bold m-0 mb-3">Top customer</h2>{tc?<div className="bg-brand text-white rounded-[18px] p-[22px_16px] flex flex-col items-center gap-1 text-center shadow-[0_10px_0_-4px_#1F6FF255]">
        <svg viewBox="0 0 64 64" width="76"><circle cx="32" cy="32" r="31" fill="#fff" opacity=".25"/><circle cx="32" cy="27" r="11" fill="#FFD6B8"/><path d="M20 25c0-13 24-13 24 0-5-5-19-5-24 0z" fill="#7A3E2B"/><path d="M12 60c2-15 38-15 40 0z" fill="#F5B027"/></svg>
        <b className="text-[17px]">{tc.name}</b><div className="opacity-85">{tc.phone}</div><div className="text-[13px]">{fmt(tc.v)} total purchases</div></div>:<div className="text-center text-mut">No customers with purchases yet.</div>}</Card>
      <Card><h2 className="text-[15px] font-bold m-0 mb-3">Statistics</h2><TrendChart sales={trend.map(x=>x.v)} profit={trend.map(x=>x.p)}/>
        <div className="text-xs text-mut"><span className="text-pur">■</span> Sales &nbsp;<span className="text-brand">■</span> Profit</div></Card>
      <Card><div className="flex justify-between items-center gap-2.5 mb-3"><h2 className="text-[15px] font-bold m-0">Low-stock alerts</h2><Tag tone="bad">{low.length} items</Tag></div>
        {low.length?low.map(p=><Row key={p.id} a={<span>{p.name}<br/><span className="text-mut text-xs">{p.sku}</span></span>} b={<Tag tone={p.stock<6?'bad':'warn'}>{p.stock} {p.unit} left</Tag>}/>):<div className="text-center text-mut p-[26px]">All products are well stocked.</div>}</Card></div></div>}
