import {useEffect,useState} from 'react'
export function useLoad(fn,deps=[]){const [d,setD]=useState(null),[err,setErr]=useState(''),[n,setN]=useState(0)
  useEffect(()=>{let ok=true;fn().then(r=>ok&&setD(r)).catch(e=>ok&&setErr(e.message));return()=>{ok=false}},[...deps,n])
  return {d,err,reload:()=>setN(x=>x+1)}}
