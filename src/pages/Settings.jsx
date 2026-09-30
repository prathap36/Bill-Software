import {useState} from 'react'
import {supabase,q} from '../lib/supabase'
import {useLoad} from '../lib/hooks'
import {setCurrency} from '../lib/format'
import {Button,Card,Modal,PageHead,gate,toast} from '../components/ui'

function SettingsField({k,label,type='text',value,onChange}){
  return <div className="mb-[11px]"><label htmlFor={'s_'+k}>{label}</label><input id={'s_'+k} type={type} value={value??''} onChange={onChange}/></div>
}

export default function Settings(){const {d,err}=useLoad(()=>q(supabase.from('settings').select('*').eq('id',1).single())),[v,setV]=useState(null),[m,setM]=useState(''),[pw,setPw]=useState('')
  const g=gate(d,err);if(g)return g
  const s=v||d,set=k=>e=>setV({...s,[k]:e.target.value})
  const logo=e=>{const f=e.target.files[0];if(!f)return;if(f.size>300000)return toast('Choose an image under 300 KB');const r=new FileReader();r.onload=()=>setV({...s,logo_url:r.result});r.readAsDataURL(f)}
  const save=async()=>{try{const {business_name,address,phone,logo_url,invoice_prefix,footer_note,currency}=s;await q(supabase.from('settings').update({business_name,address,phone,logo_url,invoice_prefix,footer_note,currency,gst_percent:+s.gst_percent||0}).eq('id',1));setCurrency(currency);toast('Settings saved')}catch(e){toast(e.message)}}
  const chpw=async e=>{e.preventDefault();const {error}=await supabase.auth.updateUser({password:pw});if(error)return toast(error.message);toast('Password changed');setM('');setPw('')}
  return <><PageHead title="Settings" sub="Business details appear on every invoice"/>
    <div className="grid min-[900px]:grid-cols-2 gap-3.5"><Card><h2 className="text-[15px] font-bold m-0 mb-3">Business</h2>
      <div className="flex gap-3.5 items-center mb-3.5">{s.logo_url?<img src={s.logo_url} alt="Logo" className="w-16 h-16 rounded-[14px] object-cover"/>:<div className="w-16 h-16 rounded-[14px] bg-acc text-[#3A2700] grid place-items-center text-[26px] font-extrabold">{s.business_name[0]}</div>}
        <label className="border border-line rounded-full px-[18px] py-[9px] font-semibold text-ink cursor-pointer m-0">Upload logo<input type="file" accept="image/*" className="sr-only" onChange={logo}/></label></div>
      <SettingsField k="business_name" label="Business name" value={s.business_name} onChange={set('business_name')}/><SettingsField k="address" label="Address" value={s.address} onChange={set('address')}/><SettingsField k="phone" label="Phone number" value={s.phone} onChange={set('phone')}/></Card>
    <Card><h2 className="text-[15px] font-bold m-0 mb-3">Invoice, tax and currency</h2><SettingsField k="invoice_prefix" label="Invoice prefix" value={s.invoice_prefix} onChange={set('invoice_prefix')}/><SettingsField k="gst_percent" label="GST % (0 turns tax off)" type="number" value={s.gst_percent} onChange={set('gst_percent')}/><SettingsField k="footer_note" label="Invoice footer note" value={s.footer_note} onChange={set('footer_note')}/>
      <div className="mb-[11px]"><label htmlFor="s_cur">Currency</label><select id="s_cur" value={s.currency} onChange={set('currency')}><option>INR (₹)</option><option>USD ($)</option></select></div>
      <div className="mb-[11px]"><label>Account</label><div className="grid grid-cols-2 gap-2.5"><Button onClick={()=>setM('pw')}>Change password</Button><Button onClick={()=>setM('users')}>Manage users</Button></div></div>
      <Button variant="primary" onClick={save}>Save changes</Button></Card></div>
    <Modal open={m==='pw'} onClose={()=>setM('')}><h2 className="text-lg font-bold m-0 mb-3">Change password</h2><form onSubmit={chpw}><label htmlFor="np">New password</label><input id="np" type="password" minLength={6} required value={pw} onChange={e=>setPw(e.target.value)}/>
      <div className="flex gap-2 mt-4"><Button type="button" className="flex-1" onClick={()=>setM('')}>Cancel</Button><Button variant="primary" type="submit" className="flex-1">Save changes</Button></div></form></Modal>
    <Modal open={m==='users'} onClose={()=>setM('')}><h2 className="text-lg font-bold m-0 mb-2">Manage users</h2><p className="text-mut m-0">Users are managed in Supabase so passwords stay safe. Open your project, go to Authentication, then Users, and choose Add user. Anyone you add can sign in here.</p><Button className="w-full mt-4" onClick={()=>setM('')}>Close</Button></Modal></>}
