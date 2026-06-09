import { useState, useRef, useCallback, useEffect } from "react";

const STORAGE_KEY = "notaspese:expenses";

function loadExpenses(){
  try{ const raw=localStorage.getItem(STORAGE_KEY); return raw?JSON.parse(raw):[]; }catch(e){ return []; }
}
function persistExpenses(list){
  try{ localStorage.setItem(STORAGE_KEY,JSON.stringify(list)); }catch(e){}
}

const CAUSALI = ["Air/Auto Rental/Gas for Rental","Taxi / Tolls / Parking w/Tips","Travel Meals","Air","Lodging","Team Meals/Events","Travel/Metro","Dues/Memberships","Travel Train","Telephone"];
const CLIENTI_DEFAULT = ["SERIOPLAST","LTA","Bertazzoni North America","Jungle USA","Marinaro Law Group"];
const PARTECIPANTI_DEFAULT = ["Eldi"];
const CLIENTI_KEY = "notaspese:clienti";
const PARTECIPANTI_KEY = "notaspese:partecipanti";
function loadList(key,fallback){ try{ const raw=localStorage.getItem(key); return raw?JSON.parse(raw):fallback; }catch(e){ return fallback; } }
function saveList(key,list){ try{ localStorage.setItem(key,JSON.stringify(list)); }catch(e){} }

const initialForm = { data:"", luogo:"", causale:"", partecipanti:"Eldi", importo:"", valuta:"USD", note:"", cliente:"" };

function formatCurrency(val){ if(!val) return ""; const n=parseFloat(val); return isNaN(n)?val:n.toFixed(2); }
function slug(s){ return (s||"ricevuta").replace(/[^a-zA-Z0-9]+/g,"_").replace(/^_|_$/g,"").slice(0,30); }

function ReceiptIcon(){return(<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M4 4v16l2-1 2 1 2-1 2 1 2-1 2 1 2-1V4l-2 1-2-1-2 1-2-1-2 1-2-1z"/><line x1="8" y1="9" x2="16" y2="9"/><line x1="8" y1="13" x2="16" y2="13"/><line x1="8" y1="17" x2="12" y2="17"/></svg>);}
function CameraIcon(){return(<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>);}
function CheckIcon(){return(<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>);}
function TrashIcon(){return(<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>);}
function ExportIcon(){return(<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>);}
function SaveIcon(){return(<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>);}

function CropBox({src,crop,setCrop,C}){
  const ref=useRef(null);
  const drag=useRef(null);
  if(!crop) return null;
  const getPoint=(e)=>{ const t=e.touches?e.touches[0]:e; const r=ref.current.getBoundingClientRect(); return { x:Math.min(1,Math.max(0,(t.clientX-r.left)/r.width)), y:Math.min(1,Math.max(0,(t.clientY-r.top)/r.height)) }; };
  const onDown=(handle)=>(e)=>{ e.preventDefault(); e.stopPropagation(); drag.current={handle,start:getPoint(e),orig:{...crop}}; };
  const onMove=(e)=>{
    if(!drag.current) return;
    const p=getPoint(e); const o=drag.current.orig; const h=drag.current.handle;
    let {x,y,w,h:hh}=o;
    if(h==="move"){ const dx=p.x-drag.current.start.x, dy=p.y-drag.current.start.y; x=Math.min(Math.max(0,o.x+dx),1-o.w); y=Math.min(Math.max(0,o.y+dy),1-o.h); }
    else{
      let x1=o.x, y1=o.y, x2=o.x+o.w, y2=o.y+o.h;
      if(h.includes("w")) x1=Math.min(p.x,x2-0.08);
      if(h.includes("e")) x2=Math.max(p.x,x1+0.08);
      if(h.includes("n")) y1=Math.min(p.y,y2-0.08);
      if(h.includes("s")) y2=Math.max(p.y,y1+0.08);
      x=x1; y=y1; w=x2-x1; hh=y2-y1;
    }
    setCrop({x,y,w,h:hh});
  };
  const onUp=()=>{ drag.current=null; };
  const pct=(n)=>`${n*100}%`;
  const handle=(pos,cursor,h)=>(<div onMouseDown={onDown(h)} onTouchStart={onDown(h)} style={{position:"absolute",...pos,width:22,height:22,marginLeft:-11,marginTop:-11,borderRadius:"50%",background:C.gold,border:"2px solid #0f0f0f",cursor,touchAction:"none",zIndex:3}}/>);
  return (
    <div ref={ref} onMouseMove={onMove} onMouseUp={onUp} onMouseLeave={onUp} onTouchMove={onMove} onTouchEnd={onUp}
      style={{position:"relative",width:"100%",maxHeight:360,userSelect:"none",touchAction:"none",background:"#000",borderRadius:"10px",overflow:"hidden"}}>
      <img src={src} alt="" style={{width:"100%",display:"block",maxHeight:360,objectFit:"contain",pointerEvents:"none"}}/>
      <div onMouseDown={onDown("move")} onTouchStart={onDown("move")}
        style={{position:"absolute",left:pct(crop.x),top:pct(crop.y),width:pct(crop.w),height:pct(crop.h),border:`2px solid ${C.gold}`,boxShadow:"0 0 0 9999px rgba(0,0,0,0.5)",cursor:"move",touchAction:"none",boxSizing:"border-box"}}>
        {handle({left:0,top:0},"nwse-resize","nw")}
        {handle({left:"100%",top:0},"nesw-resize","ne")}
        {handle({left:0,top:"100%"},"nesw-resize","sw")}
        {handle({left:"100%",top:"100%"},"nwse-resize","se")}
      </div>
    </div>
  );
}

export default function ExpenseTracker(){
  const [form,setForm]=useState(initialForm);
  const [expenses,setExpenses]=useState([]);
  const [imagePreview,setImagePreview]=useState(null);
  const [imageDims,setImageDims]=useState(null);
  const [fullImg,setFullImg]=useState(null);
  const [crop,setCrop]=useState(null);
  const [cropping,setCropping]=useState(false);
  const [cropData,setCropData]=useState(null);
  const [saved,setSaved]=useState(false);
  const [pdfStatus,setPdfStatus]=useState(null);
  const [error,setError]=useState(null);
  const fileRef=useRef();

  const [loaded,setLoaded]=useState(false);
  const [clienti,setClienti]=useState(CLIENTI_DEFAULT);
  const [partecipantiList,setPartecipantiList]=useState(PARTECIPANTI_DEFAULT);
  useEffect(()=>{ setClienti(loadList(CLIENTI_KEY,CLIENTI_DEFAULT)); setPartecipantiList(loadList(PARTECIPANTI_KEY,PARTECIPANTI_DEFAULT)); },[]);
  const addCliente=()=>{ const v=(prompt("Nuovo cliente:")||"").trim(); if(!v) return; const next=clienti.includes(v)?clienti:[...clienti,v]; setClienti(next); saveList(CLIENTI_KEY,next); setForm(p=>({...p,cliente:v})); };
  const addPartecipante=()=>{ const v=(prompt("Nuovo partecipante:")||"").trim(); if(!v) return; const next=partecipantiList.includes(v)?partecipantiList:[...partecipantiList,v]; setPartecipantiList(next); saveList(PARTECIPANTI_KEY,next); setForm(p=>({...p,partecipanti:p.partecipanti?p.partecipanti+", "+v:v})); };
  useEffect(()=>{ setExpenses(loadExpenses()); setLoaded(true); },[]);
  useEffect(()=>{ if(loaded) persistExpenses(expenses); },[expenses,loaded]);

  const handleImage=useCallback(async(file)=>{
    if(!file) return;
    setError(null); setPdfStatus(null); setCrop(null);
    const dataUrl=await new Promise((res,rej)=>{ const r=new FileReader(); r.onload=()=>res(r.target.result); r.onerror=rej; r.readAsDataURL(file); });
    const img=new Image();
    img.onload=()=>{
      setImageDims({w:img.width,h:img.height});
      setImagePreview(dataUrl);
      setFullImg(dataUrl);
      setCrop({x:0,y:0,w:1,h:1});
      setCropping(true);
    };
    img.src=dataUrl;
  },[]);

  const handleDrop=useCallback((e)=>{ e.preventDefault(); const file=e.dataTransfer.files[0]; if(file&&file.type.startsWith("image/")) handleImage(file); },[handleImage]);

  const confirmCrop=useCallback(()=>{
    if(!fullImg||!crop||!imageDims) return;
    const img=new Image();
    img.onload=()=>{
      const sx=Math.round(crop.x*imageDims.w), sy=Math.round(crop.y*imageDims.h);
      const sw=Math.max(1,Math.round(crop.w*imageDims.w)), sh=Math.max(1,Math.round(crop.h*imageDims.h));
      const canvas=document.createElement("canvas"); canvas.width=sw; canvas.height=sh;
      const ctx=canvas.getContext("2d"); ctx.drawImage(img,sx,sy,sw,sh,0,0,sw,sh);
      const dataUrl=canvas.toDataURL("image/jpeg",0.9);
      setImagePreview(dataUrl);
      setCropData({ data:dataUrl.split(",")[1], w:sw, h:sh });
      setCropping(false);
    };
    img.src=fullImg;
  },[fullImg,crop,imageDims]);

  const buildPdf=useCallback(()=>{
    if(!cropData) return null;
    const bin=atob(cropData.data); const len=bin.length; const bytes=new Uint8Array(len);
    for(let i=0;i<len;i++) bytes[i]=bin.charCodeAt(i);
    const iw=cropData.w, ih=cropData.h;
    const pageW=595.28,pageH=841.89,margin=36;
    const maxW=pageW-margin*2,maxH=pageH-margin*2;
    let dw=iw,dh=ih;
    const scale=Math.min(maxW/dw,maxH/dh,1); dw*=scale; dh*=scale;
    const x=(pageW-dw)/2,y=(pageH-dh)/2;
    const enc=(s)=>new TextEncoder().encode(s);
    const parts=[]; const offsets=[]; let pos=0;
    const push=(chunk)=>{ const arr=typeof chunk==="string"?enc(chunk):chunk; parts.push(arr); pos+=arr.length; };
    push("%PDF-1.4\n");
    offsets[1]=pos; push("1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n");
    offsets[2]=pos; push("2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n");
    offsets[3]=pos; push(`3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pageW} ${pageH}] /Resources << /XObject << /Im0 5 0 R >> >> /Contents 4 0 R >>\nendobj\n`);
    const content=`q\n${dw.toFixed(2)} 0 0 ${dh.toFixed(2)} ${x.toFixed(2)} ${y.toFixed(2)} cm\n/Im0 Do\nQ\n`;
    offsets[4]=pos; push(`4 0 obj\n<< /Length ${enc(content).length} >>\nstream\n${content}endstream\nendobj\n`);
    offsets[5]=pos; push(`5 0 obj\n<< /Type /XObject /Subtype /Image /Width ${iw} /Height ${ih} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${len} >>\nstream\n`);
    push(bytes); push("\nendstream\nendobj\n");
    const xrefPos=pos; let xref=`xref\n0 6\n0000000000 65535 f \n`;
    for(let i=1;i<=5;i++) xref+=String(offsets[i]).padStart(10,"0")+" 00000 n \n";
    push(xref); push(`trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n${xrefPos}\n%%EOF`);
    return new Blob(parts,{type:"application/pdf"});
  },[cropData]);

  const pdfFilename=()=>{ const d=form.data||new Date().toISOString().slice(0,10); const amt=form.importo?"_"+formatCurrency(form.importo):""; const cli=form.cliente?"_"+slug(form.cliente):""; return `${d}_${slug(form.luogo)}${amt}${cli}.pdf`; };

  const savePdf=useCallback(async()=>{
    const blob=buildPdf();
    if(!blob){ setError("Nessuna foto da salvare."); return; }
    const file=new File([blob],pdfFilename(),{type:"application/pdf"});
    if(navigator.canShare&&navigator.canShare({files:[file]})){
      try{ await navigator.share({files:[file],title:pdfFilename()}); setPdfStatus("shared"); return; }catch(e){}
    }
    const url=URL.createObjectURL(blob); const a=document.createElement("a"); a.href=url; a.download=pdfFilename(); a.click(); URL.revokeObjectURL(url); setPdfStatus("downloaded");
  },[buildPdf,form]);

  const addExpense=()=>{
    if(!form.importo||!form.causale){ setError("Importo e causale sono obbligatori."); return; }
    setError(null);
    const newExp={...form, importo:formatCurrency(form.importo), id:Date.now(), receiptThumb:imagePreview, pdfName:imagePreview?pdfFilename():""};
    setExpenses(prev=>[newExp,...prev]);
    setForm(initialForm); setImagePreview(null); setFullImg(null); setCrop(null); setCropData(null); setCropping(false); setImageDims(null); setPdfStatus(null);
    setSaved(true); setTimeout(()=>setSaved(false),2000);
  };

  const removeExpense=(id)=>setExpenses(prev=>prev.filter(e=>e.id!==id));

  const clearAll=()=>{ if(expenses.length===0) return; if(confirm(`Eliminare tutte le ${expenses.length} spese salvate? Assicurati di aver esportato il CSV prima.`)){ setExpenses([]); } };

  const exportCSV=()=>{
    const cols=["Air/Auto Rental/Gas for Rental","Taxi / Tolls / Parking w/Tips","Travel Meals","Air","Lodging","Team Meals/Events","Travel/Metro","Dues/Memberships","Travel Train","Telephone"];
    const headers=["DATE","VENDOR","BUSINESS PURPOSE OF EXPENSE:","ATTENDEES: (Required for Meals & Entertianment)",...cols,"Total","Cliente","Ricevuta"];
    const rows=expenses.map(e=>{
      const amt=parseFloat(e.importo||0)||0;
      const catCells=cols.map(c=>c===e.causale?(amt?amt.toFixed(2):""):"");
      const base=[e.data,e.luogo,e.note||"",e.partecipanti];
      return [...base,...catCells,amt?amt.toFixed(2):"",e.cliente,e.pdfName].map(v=>`"${(String(v??"")).replace(/"/g,'""')}"`).join(",");
    });
    const csv=[headers.join(","),...rows].join("\n");
    const blob=new Blob(["\uFEFF"+csv],{type:"text/csv;charset=utf-8;"});
    const file=new File([blob],`LTA_nota_spese_${new Date().toISOString().slice(0,10)}.csv`,{type:"text/csv"});
    if(navigator.canShare&&navigator.canShare({files:[file]})){
      navigator.share({files:[file],title:"Nota Spese"}).catch(()=>{ const url=URL.createObjectURL(blob); const a=document.createElement("a"); a.href=url; a.download=file.name; a.click(); URL.revokeObjectURL(url); });
    }else{ const url=URL.createObjectURL(blob); const a=document.createElement("a"); a.href=url; a.download=file.name; a.click(); URL.revokeObjectURL(url); }
  };

  const totalByCurrency=expenses.reduce((acc,e)=>{ const cur=e.valuta||"USD"; acc[cur]=(acc[cur]||0)+parseFloat(e.importo||0); return acc; },{});
  const C={bg:"#0f0f0f",gold:"#c8a96e",text:"#f0ede8",line:"#1e1e1e",card:"#141414",input:"#1a1a1a",border:"#2a2a2a",dim:"#555",faint:"#3a3a3a",green:"#7dce82"};

  return(
    <div style={{minHeight:"100vh",background:C.bg,fontFamily:"'DM Sans','Helvetica Neue',sans-serif",color:C.text}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=DM+Mono:wght@400;500&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;}
        @keyframes fadeIn{from{opacity:0;transform:translateY(6px);}to{opacity:1;transform:translateY(0);}}
        input,select,textarea{outline:none;}
        input::placeholder,textarea::placeholder{color:#555;}
        ::-webkit-scrollbar{width:4px;}::-webkit-scrollbar-thumb{background:#333;border-radius:2px;}
        .fg input,.fg select,.fg textarea{width:100%;background:${C.input};border:1px solid ${C.border};border-radius:8px;padding:10px 12px;color:${C.text};font-size:14px;font-family:inherit;transition:border-color .15s;}
        .fg input:focus,.fg select:focus,.fg textarea:focus{border-color:${C.gold};}
        .fg select option{background:${C.input};}
        .fg label{display:block;font-size:11px;font-weight:500;letter-spacing:.08em;color:#666;text-transform:uppercase;margin-bottom:6px;}
        .row{animation:fadeIn .25s ease;}
      `}</style>

      <div style={{borderBottom:`1px solid ${C.line}`,padding:"20px 24px",paddingTop:"calc(env(safe-area-inset-top, 0px) + 20px)",display:"flex",alignItems:"center",gap:"12px",position:"sticky",top:0,background:C.bg,zIndex:10}}>
        <div style={{color:C.gold}}><ReceiptIcon/></div>
        <div><div style={{fontSize:"16px",fontWeight:600}}>Nota Spese</div><div style={{fontSize:"11px",color:C.dim,marginTop:"1px"}}>LTA US Advisors</div></div>
        {expenses.length>0&&(<button onClick={exportCSV} style={{marginLeft:"auto",display:"flex",alignItems:"center",gap:"7px",background:"transparent",border:`1px solid #2e2e2e`,borderRadius:"8px",padding:"8px 14px",color:C.gold,fontSize:"12px",fontWeight:500,cursor:"pointer",fontFamily:"inherit"}}><ExportIcon/> Esporta CSV</button>)}
      </div>

      <div style={{maxWidth:520,margin:"0 auto",padding:"24px 20px",paddingBottom:"calc(env(safe-area-inset-bottom, 0px) + 40px)"}}>
        {!cropping && (
        <div onDrop={handleDrop} onDragOver={e=>e.preventDefault()} onClick={()=>fileRef.current?.click()} style={{border:`1px dashed ${imagePreview?C.gold:C.border}`,borderRadius:"12px",padding:imagePreview?"0":"32px 20px",textAlign:"center",cursor:"pointer",background:C.card,overflow:"hidden",marginBottom:"16px",transition:"border-color .2s"}}>
          <input ref={fileRef} type="file" accept="image/*" style={{display:"none"}} onChange={e=>e.target.files[0]&&handleImage(e.target.files[0])}/>
          {imagePreview?(
            <div style={{position:"relative"}}>
              <img src={imagePreview} alt="receipt" style={{width:"100%",maxHeight:300,objectFit:"contain",display:"block",background:"#000"}}/>
            </div>
          ):(
            <><div style={{color:C.faint,marginBottom:"10px"}}><CameraIcon/></div><div style={{fontSize:"13px",color:C.dim,lineHeight:1.5}}>Tocca per scattare o scegliere la ricevuta<br/><span style={{fontSize:"11px",color:C.faint}}>foto, libreria o file</span></div></>
          )}
        </div>
        )}

        {cropping && fullImg && (
          <div style={{marginBottom:"16px"}}>
            <div style={{fontSize:"12px",color:C.gold,marginBottom:"8px",textAlign:"center"}}>Trascina gli angoli per ritagliare la ricevuta</div>
            <CropBox src={fullImg} crop={crop} setCrop={setCrop} C={C}/>
            <div style={{display:"flex",gap:"8px",marginTop:"10px"}}>
              <button onClick={()=>{setCrop({x:0,y:0,w:1,h:1});}} style={{flex:1,padding:"10px",borderRadius:"9px",background:"transparent",border:`1px solid ${C.border}`,color:C.dim,fontSize:"12px",cursor:"pointer",fontFamily:"inherit"}}>Tutta la foto</button>
              <button onClick={confirmCrop} style={{flex:2,padding:"10px",borderRadius:"9px",background:C.gold,border:"none",color:"#0f0f0f",fontSize:"13px",fontWeight:600,cursor:"pointer",fontFamily:"inherit"}}>Conferma ritaglio</button>
            </div>
          </div>
        )}

        {imagePreview && !cropping && (<button onClick={()=>{setCropping(true);}} style={{width:"100%",padding:"9px",borderRadius:"10px",background:"transparent",border:`1px solid ${C.border}`,color:C.dim,fontSize:"12px",cursor:"pointer",fontFamily:"inherit",marginBottom:"10px"}}>Ritaglia di nuovo</button>)}

        {imagePreview&&!cropping&&(<button onClick={savePdf} style={{width:"100%",padding:"11px",borderRadius:"10px",background:pdfStatus?"#1e3a20":"transparent",border:`1px solid ${pdfStatus?"#2e5a30":C.gold}`,color:pdfStatus?C.green:C.gold,fontSize:"13px",fontWeight:500,cursor:"pointer",fontFamily:"inherit",display:"flex",alignItems:"center",justifyContent:"center",gap:"8px",marginBottom:"20px"}}>{pdfStatus?<><CheckIcon/> PDF salvato</>:<><SaveIcon/> Salva PDF su Drive / File</>}</button>)}

        {error&&<div style={{background:"#1a0e0e",border:"1px solid #3a1e1e",borderRadius:"8px",padding:"10px 14px",marginBottom:"16px",fontSize:"12px",color:"#e07070"}}>{error}</div>}

        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"12px",marginBottom:"12px"}}>
          <div className="fg"><label>Data</label><input type="date" value={form.data} onChange={e=>setForm(p=>({...p,data:e.target.value}))}/></div>
          <div className="fg" style={{display:"grid",gridTemplateColumns:"1fr auto",gap:"6px"}}>
            <div><label>Importo</label><input type="number" step="0.01" placeholder="0.00" value={form.importo} onChange={e=>setForm(p=>({...p,importo:e.target.value}))}/></div>
            <div style={{paddingTop:"17px"}}><select value={form.valuta} onChange={e=>setForm(p=>({...p,valuta:e.target.value}))} style={{width:64}}><option>USD</option><option>EUR</option><option>GBP</option><option>CAD</option></select></div>
          </div>
        </div>

        <div className="fg" style={{marginBottom:"12px"}}><label>Luogo / Fornitore</label><input placeholder="es. Nobu Miami Beach" value={form.luogo} onChange={e=>setForm(p=>({...p,luogo:e.target.value}))}/></div>

        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"12px",marginBottom:"12px"}}>
          <div className="fg"><label>Causale</label><select value={form.causale} onChange={e=>setForm(p=>({...p,causale:e.target.value}))}><option value="">Seleziona...</option>{CAUSALI.map(c=><option key={c}>{c}</option>)}</select></div>
          <div className="fg"><label>Partecipanti</label><div style={{display:"flex",gap:"6px"}}><input style={{flex:1}} placeholder="Eldi" value={form.partecipanti} onChange={e=>setForm(p=>({...p,partecipanti:e.target.value}))}/><button type="button" onClick={addPartecipante} style={{flexShrink:0,padding:"0 12px",borderRadius:"8px",background:"transparent",border:`1px solid ${C.gold}`,color:C.gold,fontSize:"12px",fontWeight:600,cursor:"pointer",fontFamily:"inherit"}}>+ New</button></div></div>
        </div>

        <div className="fg" style={{marginBottom:"12px"}}><label>Cliente</label><div style={{display:"flex",gap:"6px"}}><select style={{flex:1}} value={form.cliente} onChange={e=>setForm(p=>({...p,cliente:e.target.value}))}><option value="">Seleziona...</option>{clienti.map(c=><option key={c}>{c}</option>)}</select><button type="button" onClick={addCliente} style={{flexShrink:0,padding:"0 12px",borderRadius:"8px",background:"transparent",border:`1px solid ${C.gold}`,color:C.gold,fontSize:"12px",fontWeight:600,cursor:"pointer",fontFamily:"inherit"}}>+ New</button></div></div>

        <div className="fg" style={{marginBottom:"16px"}}><label>Note</label><textarea rows={2} placeholder="Dettagli aggiuntivi..." value={form.note} style={{resize:"none"}} onChange={e=>setForm(p=>({...p,note:e.target.value}))}/></div>

        <button onClick={addExpense} style={{width:"100%",padding:"13px",borderRadius:"10px",background:saved?"#1e3a20":C.gold,color:saved?C.green:"#0f0f0f",border:"none",fontSize:"14px",fontWeight:600,cursor:"pointer",fontFamily:"inherit",display:"flex",alignItems:"center",justifyContent:"center",gap:"8px"}}>{saved?<><CheckIcon/> Aggiunta</>:"+ Aggiungi spesa"}</button>

        {expenses.length>0&&(
          <div style={{marginTop:"28px"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"12px"}}>
              <div style={{fontSize:"11px",color:C.dim,textTransform:"uppercase",letterSpacing:".08em",display:"flex",alignItems:"center",gap:"8px"}}>
                {expenses.length} {expenses.length===1?"spesa":"spese"}
                <span style={{color:C.faint,textTransform:"none",letterSpacing:0}}>· salvate sul dispositivo</span>
              </div>
              <div style={{display:"flex",gap:"12px"}}>{Object.entries(totalByCurrency).map(([cur,tot])=>(<div key={cur} style={{fontFamily:"'DM Mono',monospace",fontSize:"13px",color:C.gold}}>{cur} {tot.toFixed(2)}</div>))}</div>
            </div>
            <div style={{display:"flex",flexDirection:"column",gap:"8px"}}>
              {expenses.map(e=>(
                <div key={e.id} className="row" style={{background:C.card,border:`1px solid ${C.line}`,borderRadius:"10px",padding:"12px 14px",display:"flex",gap:"12px",alignItems:"flex-start"}}>
                  {e.receiptThumb&&<img src={e.receiptThumb} alt="" style={{width:36,height:36,borderRadius:6,objectFit:"cover",flexShrink:0}}/>}
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"baseline"}}>
                      <div style={{fontSize:"13px",fontWeight:500,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{e.luogo||"—"}</div>
                      <div style={{fontFamily:"'DM Mono',monospace",fontSize:"13px",color:C.gold,flexShrink:0,marginLeft:8}}>{e.valuta} {e.importo}</div>
                    </div>
                    <div style={{fontSize:"11px",color:C.dim,marginTop:"3px"}}>{[e.data,e.causale,e.cliente].filter(Boolean).join(" · ")}</div>
                  </div>
                  <button onClick={()=>removeExpense(e.id)} style={{background:"none",border:"none",color:C.faint,cursor:"pointer",padding:"2px",flexShrink:0}}><TrashIcon/></button>
                </div>
              ))}
            </div>
            <button onClick={clearAll} style={{marginTop:"16px",width:"100%",padding:"10px",borderRadius:"9px",background:"transparent",border:`1px solid #2a1a1a`,color:"#7a4a4a",fontSize:"12px",fontWeight:500,cursor:"pointer",fontFamily:"inherit"}}>Svuota lista (dopo l'export)</button>
          </div>
        )}
      </div>
    </div>
  );
}
