"use client";

import Link from 'next/link';
import {useMemo,useState} from 'react';

export type AdminApplicationRow={
  id:string;name:string;business:string|null;email:string|null;category:string;tier:string;
  status:string;submittedAt:string;updatedAt:string|null;
};

const readable=(value:string)=>value.replaceAll('_',' ').replace(/\b\w/g,letter=>letter.toUpperCase());
const pageSize=12;

export function AdminApplicationTable({rows}:{rows:AdminApplicationRow[]}){
  const [query,setQuery]=useState(''),[category,setCategory]=useState('all'),[status,setStatus]=useState('all'),[tier,setTier]=useState('all'),[page,setPage]=useState(0),[newestFirst,setNewestFirst]=useState(true);
  const categories=useMemo(()=>[...new Set(rows.map(row=>row.category))].sort(),[rows]);
  const tiers=useMemo(()=>[...new Set(rows.map(row=>row.tier))].sort(),[rows]);
  const filtered=useMemo(()=>{
    const needle=query.trim().toLocaleLowerCase();
    return rows.filter(row=>(category==='all'||row.category===category)&&(status==='all'||row.status===status)&&(tier==='all'||row.tier===tier)&&(!needle||[row.name,row.business,row.email,row.id].some(value=>value?.toLocaleLowerCase().includes(needle)))).sort((a,b)=>newestFirst?b.submittedAt.localeCompare(a.submittedAt):a.submittedAt.localeCompare(b.submittedAt));
  },[rows,query,category,status,tier,newestFirst]);
  const pageCount=Math.max(1,Math.ceil(filtered.length/pageSize)),visible=filtered.slice(page*pageSize,(page+1)*pageSize);
  function update<T extends (value:string)=>void>(setter:T){return (value:string)=>{setter(value);setPage(0)}}
  return <section className="admin-register" id="admin-application-register" aria-labelledby="admin-register-title">
    <header className="admin-register__heading"><div><span className="admin-eyebrow">Applicant register · latest {rows.length}</span><h2 id="admin-register-title">Founder applications</h2><p>Search actual submissions, then open a secured review workspace for full evidence and audited actions.</p></div><span className="admin-register__count">{filtered.length} shown</span></header>
    <div className="admin-register__filters">
      <label className="admin-register__search">Search applications<input type="search" value={query} onChange={event=>update(setQuery)(event.target.value)} placeholder="Name, business, email or reference"/></label>
      <label>Category<select value={category} onChange={event=>update(setCategory)(event.target.value)}><option value="all">All categories</option>{categories.map(value=><option key={value} value={value}>{value}</option>)}</select></label>
      <label>Status<select value={status} onChange={event=>update(setStatus)(event.target.value)}><option value="all">All statuses</option>{[...new Set(rows.map(row=>row.status))].sort().map(value=><option key={value} value={value}>{readable(value)}</option>)}</select></label>
      <label>Tier<select value={tier} onChange={event=>update(setTier)(event.target.value)}><option value="all">All tiers</option>{tiers.map(value=><option key={value} value={value}>{value}</option>)}</select></label>
      <button className="admin-sort" type="button" onClick={()=>setNewestFirst(value=>!value)} aria-label={`Sort ${newestFirst?'oldest':'newest'} first`}>{newestFirst?'Newest first':'Oldest first'}</button>
    </div>
    <div className="admin-table-wrap"><table className="admin-table"><thead><tr><th scope="col">Applicant</th><th scope="col">Category & tier</th><th scope="col">Submitted</th><th scope="col">Status</th><th scope="col"><span className="sr-only">Open</span></th></tr></thead>
      <tbody>{visible.map(row=><tr key={row.id}><td><strong>{row.name}</strong>{row.business&&<span>{row.business}</span>}{row.email&&<small>{row.email}</small>}</td><td>{row.category}<span>{row.tier}</span></td><td><time dateTime={row.submittedAt}>{new Date(row.submittedAt).toLocaleDateString('en',{dateStyle:'medium'})}</time>{row.updatedAt&&<small>Updated {new Date(row.updatedAt).toLocaleDateString('en',{dateStyle:'medium'})}</small>}</td><td><span className={`status-pill status-${row.status}`}>{readable(row.status)}</span></td><td><Link className="admin-open-link" href={`/founding-admin/applications/${row.id}`}>Review <span aria-hidden="true">→</span></Link></td></tr>)}</tbody>
    </table>{visible.length===0&&<div className="admin-empty">No applications match these filters. Adjust the search or filters to continue.</div>}</div>
    <footer className="admin-register__footer"><span>Page {page+1} of {pageCount}</span><div><button type="button" className="admin-sort" onClick={()=>setPage(value=>Math.max(0,value-1))} disabled={page===0}>Previous</button><button type="button" className="admin-sort" onClick={()=>setPage(value=>Math.min(pageCount-1,value+1))} disabled={page>=pageCount-1}>Next</button></div></footer>
  </section>;
}
