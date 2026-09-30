import {fmt,dt,cap,sum} from '../lib/format'
import {Button,Tag,statusTone,toast} from './ui'
export default function Invoice({b,s}){
  const share=async()=>{const t=`${s.business_name} – ${b.invoice_no}: ${fmt(b.total)} paid by ${b.payment_method}. ${s.footer_note||''}`
    try{navigator.share?await navigator.share({text:t}):(await navigator.clipboard.writeText(t),toast('Bill summary copied'))}catch{toast('Sharing is not available here')}}
  return <div className="print-area text-[13px]"><div className="text-center border-b-2 border-dashed border-line pb-3 mb-2.5">
    {s.logo_url&&<img src={s.logo_url} alt="" className="h-12 mx-auto mb-1.5 rounded-lg"/>}<h3 className="m-0 text-base font-bold">{s.business_name}</h3><div className="text-mut">{s.address}<br/>{s.phone}</div></div>
    <div className="flex justify-between"><div><b>{b.invoice_no}</b><br/><span className="text-mut">{dt(b.created_at)}</span></div><div className="text-right">{b.customer_name}<br/><span className="text-mut">{b.customer_phone||'—'}</span></div></div>
    <table className="w-full my-2.5"><thead><tr className="text-xs text-mut"><th className="text-left py-1">Item</th><th className="text-right">Qty</th><th className="text-right">Rate</th><th className="text-right">Amount</th></tr></thead><tbody>
      {b.bill_items.map(i=><tr key={i.id} className="border-t border-line"><td className="py-1.5">{i.name}{i.returned_qty>0&&<> <Tag tone="warn">{i.returned_qty} returned</Tag></>}</td><td className="text-right">{i.qty}</td><td className="text-right">{fmt(i.selling_price)}</td><td className="text-right">{fmt(i.qty*i.selling_price)}</td></tr>)}</tbody></table>
    <div className="[&>div]:flex [&>div]:justify-between [&>div]:py-[3px]"><div><span>Subtotal</span><span>{fmt(b.subtotal)}</span></div>
      <div><span>Discount {b.discount_amount>0&&(b.discount_type==='percent'?b.discount_value+'%':'')}</span><span>−{fmt(b.discount_amount)}</span></div>
      {b.tax>0&&<div><span>GST</span><span>{fmt(b.tax)}</span></div>}
      {b.refunded_amount>0&&<div><span>Refunded</span><span>−{fmt(b.refunded_amount)}</span></div>}
      <div className="!text-[22px] font-extrabold border-t-2 border-ink mt-1.5 !pt-[9px]"><span>Total</span><span>{fmt(b.total)}</span></div></div>
    <div className="text-mut mt-2">Paid by {b.payment_method} · <Tag tone={statusTone(b.status)}>{cap(b.status)}</Tag></div>
    <p className="text-center text-mut">{s.footer_note}</p>
    <div className="no-print flex gap-2 mt-4 flex-wrap [&>button]:flex-1"><Button onClick={()=>print()}>Print</Button><Button onClick={()=>print()}>Download PDF</Button><Button onClick={share}>Share</Button></div></div>}
