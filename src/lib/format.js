export let sym='₹'
export const setCurrency=c=>{const m=/[(](.*)[)]/.exec(c||'');sym=m?m[1]:'₹'}
export const fmt=n=>sym+Math.round(Number(n)||0).toLocaleString('en-IN')
export const dt=x=>new Date(x).toLocaleString('en-IN',{dateStyle:'medium',timeStyle:'short'})
export const cap=s=>s[0].toUpperCase()+s.slice(1)
export const dayKey=d=>new Date(d).toLocaleDateString('en-CA')
export const daysAgo=n=>{const d=new Date();d.setDate(d.getDate()-n);return dayKey(d)}
export const sum=(a,f)=>a.reduce((x,y)=>x+f(y),0)
// Cancelled bills are never passed in. Sales are net of refunds; profit = net sales - purchase cost of kept items.
export const netSales=b=>Number(b.total)-Number(b.refunded_amount)
export const costOf=b=>sum(b.bill_items,i=>(i.qty-i.returned_qty)*Number(i.purchase_price))
export const profitOf=b=>netSales(b)-costOf(b)
