import {fmt} from '../lib/format'
export const ProgressRing=({pct,color})=>{const p=Math.max(0,Math.min(100,pct))
  return <svg viewBox="0 0 36 36" width="66" role="img" aria-label={p+'%'}>
    <circle r="15" cx="18" cy="18" fill="none" stroke="var(--line)" strokeWidth="4"/>
    <circle r="15" cx="18" cy="18" fill="none" stroke={color} strokeWidth="4" strokeLinecap="round" pathLength="100" strokeDasharray={`${p} 100`} transform="rotate(-90 18 18)"/>
    <text x="18" y="21" fontSize="8" fontWeight="700" textAnchor="middle" fill="var(--ink)">{p}%</text></svg>}
export const BarChart=({data,h=190})=>{const w=560,m=Math.max(...data.map(x=>x.v),1),bw=w/data.length
  return <svg viewBox={`0 0 ${w} ${h+22}`} width="100%" role="img" aria-label="Sales bar chart">{data.map((x,i)=>{const bh=x.v/m*h
    return <g key={i}><rect x={i*bw+bw*.15} y={h-bh} width={bw*.7} height={bh} rx="6" fill="var(--brand)"><title>{x.l}: {fmt(x.v)}</title></rect>
      {i%Math.ceil(data.length/7)===0&&<text x={i*bw+bw/2} y={h+15} fontSize="10" textAnchor="middle" fill="var(--mut)">{x.l}</text>}</g>})}</svg>}
export const TrendChart=({sales,profit,h=170})=>{const w=560,m=Math.max(...sales,...profit,1)
  const pt=s=>s.map((v,i)=>`${i*w/(s.length-1)},${h-v/m*h+4}`).join(' ')
  return <svg viewBox={`0 0 ${w} ${h+8}`} width="100%" role="img" aria-label="Sales and profit trend">
    <polygon points={`0,${h+4} ${pt(sales)} ${w},${h+4}`} fill="var(--pur)" opacity=".12"/>
    <polyline points={pt(sales)} fill="none" stroke="var(--pur)" strokeWidth="3" strokeLinejoin="round"/>
    <polyline points={pt(profit)} fill="none" stroke="var(--brand)" strokeWidth="2.5" strokeLinejoin="round"/></svg>}
export const Donut=({parts})=>{const t=parts.reduce((a,x)=>a+x.v,0)||1;let off=0
  return <svg viewBox="0 0 36 36" width="120" role="img" aria-label="Payment split">{parts.map((p,i)=>{const pc=p.v/t*100,e=<circle key={i} r="15.9" cx="18" cy="18" fill="none" stroke={p.c} strokeWidth="6" strokeDasharray={`${pc} ${100-pc}`} strokeDashoffset={-off} transform="rotate(-90 18 18)"/>;off+=pc;return e})}</svg>}
