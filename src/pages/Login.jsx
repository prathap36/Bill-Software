import {useState} from 'react'
import {supabase} from '../lib/supabase'
import {Button,Card} from '../components/ui'
export default function Login(){const [email,setEmail]=useState(''),[pw,setPw]=useState(''),[err,setErr]=useState('')
  const submit=async e=>{e.preventDefault();setErr('');const {error}=await supabase.auth.signInWithPassword({email,password:pw});if(error)setErr(error.message)}
  return <div className="min-h-screen grid place-items-center p-4"><Card className="w-[min(380px,100%)] shadow-shell">
    <div className="flex gap-2.5 items-center font-extrabold text-xl mb-4"><i className="w-[30px] h-[30px] rounded-lg bg-brand text-white grid place-items-center not-italic">L</i>Ledgerly</div>
    <h1 className="text-2xl font-extrabold tracking-tight m-0 mb-1">Sign in</h1><p className="text-mut mt-0 mb-4">Use the account created in your Supabase project.</p>
    <form onSubmit={submit}><div className="mb-3"><label htmlFor="em">Email</label><input id="em" type="email" required value={email} onChange={e=>setEmail(e.target.value)}/></div>
    <div className="mb-3"><label htmlFor="pw">Password</label><input id="pw" type="password" required value={pw} onChange={e=>setPw(e.target.value)}/></div>
    {err&&<div className="text-bad text-xs mb-3" role="alert">{err}</div>}<Button variant="primary" size="lg" type="submit">Sign in</Button></form></Card></div>}
