import {useEffect,useState} from 'react'
import {BrowserRouter,Routes,Route} from 'react-router-dom'
import {supabase} from './lib/supabase'
import {setCurrency} from './lib/format'
import {Shell} from './components/Layout'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import POS from './pages/POS'
import Products from './pages/Products'
import Customers from './pages/Customers'
import Expenses from './pages/Expenses'
import Bills from './pages/Bills'
import Returns from './pages/Returns'
import Reports from './pages/Reports'
import Settings from './pages/Settings'
export default function App(){const [session,setSession]=useState(undefined),[ready,setReady]=useState(false)
  useEffect(()=>{supabase.auth.getSession().then(({data})=>setSession(data.session))
    const {data:{subscription}}=supabase.auth.onAuthStateChange((_e,s)=>setSession(s));return()=>subscription.unsubscribe()},[])
  const uid=session?.user.id
  useEffect(()=>{if(!uid){setReady(false);return}supabase.from('settings').select('currency').eq('id',1).single().then(({data})=>{if(data)setCurrency(data.currency);setReady(true)})},[uid])
  if(session===undefined)return null
  if(!session)return <Login/>
  if(!ready)return null
  return <BrowserRouter><Shell user={session.user}><Routes>
    <Route path="/" element={<Dashboard/>}/><Route path="/pos" element={<POS/>}/><Route path="/products" element={<Products/>}/><Route path="/customers" element={<Customers/>}/>
    <Route path="/expenses" element={<Expenses/>}/><Route path="/bills" element={<Bills/>}/><Route path="/returns" element={<Returns/>}/><Route path="/reports" element={<Reports/>}/><Route path="/settings" element={<Settings/>}/>
  </Routes></Shell></BrowserRouter>}
