import {useState} from 'react'
import {NavLink,useNavigate} from 'react-router-dom'
import {supabase} from '../lib/supabase'
import {Button,cx,Toaster} from './ui'
const ICON={pos:'M6 2h12v20l-3-2-3 2-3-2-3 2zM9 7h6M9 11h6',dash:'M3 13h8V3H3zM13 21h8V11h-8zM3 21h8v-6H3zM13 3v6h8V3z',prod:'M21 8l-9-5-9 5v8l9 5 9-5zM3 8l9 5 9-5M12 13v8',cust:'M16 20v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 10a4 4 0 1 0 0-8 4 4 0 0 0 0 8M22 20v-2a4 4 0 0 0-3-3.9',exp:'M12 2v20M17 6H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6',bills:'M4 3h16v18H4zM8 8h8M8 12h8M8 16h5',ret:'M3 12a9 9 0 1 0 3-6.7L3 8M3 3v5h5',rep:'M18 20V10M12 20V4M6 20v-6',set:'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z'}
export const Icon=({k})=><svg viewBox="0 0 24 24" className="w-[18px] h-[18px] fill-none stroke-current stroke-[1.8] flex-none" strokeLinecap="round" strokeLinejoin="round"><path d={ICON[k]}/></svg>
export const NAV=[['/','dash','Dashboard'],['/products','prod','Products'],['/customers','cust','Customers'],['/expenses','exp','Expenses'],['/bills','bills','Bill history'],['/returns','ret','Returns'],['/reports','rep','Reports'],['/settings','set','Settings']]
const item='flex gap-[11px] items-center px-3 py-2.5 rounded-input text-left whitespace-nowrap max-md:w-auto md:w-full'
export function Sidebar(){const [up,setUp]=useState(false)
  return <aside className="bg-surf text-mut border-r border-line p-[22px_14px] md:sticky md:top-4 md:h-[calc(100vh-32px)] flex md:flex-col gap-0.5 max-md:flex-row max-md:overflow-x-auto max-md:p-2 max-md:border-r-0">
    <div className="max-md:hidden flex gap-2.5 items-center text-ink font-extrabold text-xl px-2 pb-[26px] pt-1"><i className="w-[30px] h-[30px] rounded-lg bg-brand text-white grid place-items-center not-italic">L</i>Ledgerly</div>
    <NavLink to="/pos" className={cx(item,'bg-brand text-white font-bold md:mb-3 rounded-full justify-center')}><Icon k="pos"/>New bill</NavLink>
    {NAV.map(([to,k,l])=><NavLink key={to} to={to} end={to==='/'} className={({isActive})=>cx(item,'hover:bg-f',isActive&&'!bg-b2 !text-brand font-bold')}><Icon k={k}/>{l}</NavLink>)}
    <div className="flex-1 max-md:hidden"/>
    <div className="max-md:hidden bg-surf border border-line rounded-[18px] p-3.5 text-center shadow-soft text-xs text-ink mt-2">
      <svg viewBox="0 0 64 64" width="60" className="mx-auto"><path d="M32 4c9 8 12 20 8 34H24C20 24 23 12 32 4z" fill="#7A5AF0"/><circle cx="32" cy="22" r="5" fill="#fff"/><path d="M24 38l-9 8 3-14zM40 38l9 8-3-14z" fill="#F5B027"/><path d="M28 40h8l-4 14z" fill="#FF7A45"/></svg>
      <div>New update available,<br/>click to update</div>
      <Button variant="primary" size="sm" className="w-full mt-2" onClick={()=>setUp(true)}>{up?'You are up to date':'Update!'}</Button></div>
  </aside>}
export function TopBar({user}){const nav=useNavigate(),name=(user.email||'').split('@')[0]
  return <div className="flex items-center gap-4 mb-[22px]">
    <label className="flex-1 flex items-center gap-2 bg-f rounded-full px-4 max-w-[400px] !mb-0"><svg viewBox="0 0 24 24" className="w-[18px] h-[18px] fill-none stroke-mut stroke-[1.8]" strokeLinecap="round"><circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/></svg>
      <input className="!border-0 !bg-transparent !px-0" placeholder="Search bills, customers, phone" aria-label="Search" onKeyDown={e=>e.key==='Enter'&&nav('/bills?q='+encodeURIComponent(e.target.value))}/></label>
    <span className="ml-auto grid place-items-center w-[38px] h-[38px] rounded-full bg-f" aria-label="Notifications"><svg viewBox="0 0 24 24" className="w-[18px] h-[18px] fill-none stroke-mut stroke-[1.8]" strokeLinecap="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9M10 21a2 2 0 0 0 4 0"/></svg></span>
    <div className="flex gap-2.5 items-center text-xs leading-tight"><i className="w-9 h-9 rounded-full bg-gradient-to-br from-brand to-pur text-white grid place-items-center not-italic font-bold uppercase">{name[0]}</i>
      <div className="max-md:hidden"><b className="capitalize">{name}</b><div className="text-mut">{user.email}</div></div></div>
    <Button size="sm" onClick={()=>supabase.auth.signOut()}>Sign out</Button></div>}
export const Shell=({user,children})=>(
  <div className="m-4 rounded-shell bg-surf shadow-shell overflow-clip grid md:grid-cols-[220px_1fr] min-h-[calc(100vh-32px)] max-md:m-0 max-md:rounded-none">
    <Sidebar/><main className="px-[26px] pt-[22px] pb-10 min-w-0 max-md:p-4"><TopBar user={user}/>{children}</main><Toaster/></div>)
