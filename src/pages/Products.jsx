import {useState} from 'react'
import {supabase,q} from '../lib/supabase'
import {useLoad} from '../lib/hooks'
import {fmt} from '../lib/format'
import {Button,Card,Tag,Table,Th,Td,PageHead,Empty,gate,toast} from '../components/ui'
import FormModal from '../components/FormModal'
const F=[['name','Product name'],['sku','Product code / SKU'],['category','Category'],['unit','Unit'],['purchase_price','Purchase price','number'],['selling_price','Selling price','number'],['stock','Quantity in stock','number'],['low_stock_level','Low-stock level','number'],['barcode','Barcode (optional)','text',null,true]]
export default function Products(){const {d,err,reload}=useLoad(()=>q(supabase.from('products').select('*').order('name'))),[ed,setEd]=useState(null)
  const g=gate(d,err);if(g)return g
  const low=p=>p.stock<=p.low_stock_level
  const save=async v=>{const row={...v,barcode:v.barcode||null};await q(ed.id?supabase.from('products').update(row).eq('id',ed.id):supabase.from('products').insert(row));reload();toast('Product saved')}
  const del=async p=>{if(!confirm('Delete this product? Past bills keep their record.'))return;try{await q(supabase.from('products').delete().eq('id',p.id));reload()}catch(e){toast(e.message)}}
  return <><PageHead title="Products" sub={`${d.length} products · ${d.filter(low).length} low on stock`} action={<Button variant="primary" onClick={()=>setEd({stock:0,low_stock_level:10,unit:'pc'})}>Add product</Button>}/>
    <Card><Table><thead><tr><Th>Product</Th><Th>SKU</Th><Th>Category</Th><Th right>Buy</Th><Th right>Sell</Th><Th>Stock</Th><Th/></tr></thead><tbody>
      {d.map(p=><tr key={p.id}><Td><b>{p.name}</b></Td><Td className="text-mut">{p.sku}</Td><Td>{p.category}</Td><Td right>{fmt(p.purchase_price)}</Td><Td right>{fmt(p.selling_price)}</Td>
        <Td><div className="flex gap-2.5 items-center"><div className="h-1.5 rounded-full bg-line overflow-hidden min-w-[70px]"><b className={'block h-full '+(low(p)?'bg-bad':'bg-ok')} style={{width:Math.min(100,p.stock)+'%'}}/></div>{p.stock} {p.unit}{low(p)&&<Tag tone="bad">Low</Tag>}</div></Td>
        <Td right className="whitespace-nowrap"><Button size="sm" onClick={()=>setEd(p)}>Edit</Button> <Button size="sm" variant="danger" onClick={()=>del(p)}>Delete</Button></Td></tr>)}</tbody></Table>
      {!d.length&&<Empty>No products yet. Choose Add product to create your first one.</Empty>}</Card>
    {ed&&<FormModal title={ed.id?'Edit product':'Add product'} fields={F} init={ed} onSave={save} onClose={()=>setEd(null)}/>}</>}
