// Config
const BACKEND = (document.querySelector('meta[name="backend"]')?.content || '').replace(/\/+$/, '');

// Toast
function toast(msg){ const el=document.getElementById('toast'); document.getElementById('toast-text').textContent=msg; el.classList.add('show'); setTimeout(()=>el.classList.remove('show'),1800); }

// Sanitize
function stripMarkdownEmoji(s=''){
  s=s.replace(/(^|\s)#{1,6}\s*/g,'$1')
     .replace(/[*_]{1,3}([^*_]+)[*_]{1,3}/g,'$1')
     .replace(/`{1,3}[^`]*`{1,3}/g,'')
     .replace(/^\s*[-*•]\s+/gm,'· ');
  try{ s=s.replace(/[\p{Extended_Pictographic}\p{Emoji_Presentation}]/gu,''); }catch{}
  s=s.replace(/[ \t]+\n/g,'\n').replace(/\n{3,}/g,'\n\n');
  return s.trim();
}
function cleanText(s){ return (s||'').toString().replace(/[^\n\r\t\u0020-\u007EåäöÅÄÖ.,;:!?()\-\w]/g,''); }

// Data helpers
function getData(){
  const condSel=document.getElementById('condition');
  const condition=condSel?.options[condSel.selectedIndex]?.text||'';
  return {
    title: document.getElementById('title').value.trim(),
    price: document.getElementById('price').value.trim(),
    condition,
    notes: document.getElementById('notes').value,
    city: document.getElementById('city').value,
    tags: document.getElementById('tags').value,
    description: document.getElementById('description').value
  };
}
function setData(d={}){
  document.getElementById('title').value = d.title||'';
  document.getElementById('price').value = d.price||'';
  const sel=document.getElementById('condition');
  if(sel){ let idx=0; for(let i=0;i<sel.options.length;i++){ if(sel.options[i].text=== (d.condition||'')){ idx=i; break;} } sel.selectedIndex=idx; }
  document.getElementById('notes').value = d.notes||'';
  document.getElementById('city').value = d.city||'';
  document.getElementById('tags').value = d.tags||'';
  document.getElementById('description').value = d.description||'';
  renderTags((d.tags||'').split(',').map(t=>t.trim()));
}

// AI
async function callAI(payload){
  const res=await fetch(`${BACKEND}/generate-description`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)});
  if(!res.ok) throw new Error(await res.text());
  return res.json();
}
async function handleGenerate(style, btn){
  const { title, price, condition, notes, city } = getData();
  if(!title || !price || !condition){ toast('fyll i titel, pris och skick'); return; }
  const old=btn.textContent; btn.disabled=true; btn.textContent='⏳ genererar…';
  try{
    const data = await callAI({ style, title: cleanText(title), condition: cleanText(condition), price: cleanText(price), notes, city });
    const desc = cleanText(stripMarkdownEmoji((data.description||'').trim()));
    document.getElementById('description').value = desc;
    toast(`beskrivning (${style}) klar`);
  }catch(e){ console.warn(e); toast('kunde inte nå ai'); }
  finally{ btn.disabled=false; btn.textContent=old; }
}

// Tags
function renderTags(tags){ const c=document.getElementById('tag-container'); c.innerHTML=''; tags.filter(Boolean).forEach(t=>{ const el=document.createElement('span'); el.className='tag'; el.innerHTML=`${t} <span class="x" data-del="${t}">×</span>`; c.appendChild(el); }); }
function updateTags(str){ document.getElementById('tags').value=str; renderTags(str.split(',').map(t=>t.trim())); }
document.addEventListener('input', (e)=>{ if(e.target.id==='tags'){ renderTags(e.target.value.split(',').map(t=>t.trim())); } });
document.addEventListener('click', (e)=>{ const x=e.target.closest('.x'); if(x){ const t = x.getAttribute('data-del'); const arr=document.getElementById('tags').value.split(',').map(s=>s.trim()).filter(v=>v&&v!==t); updateTags(arr.join(', ')); } });

// Copy
function copyText(text){ navigator.clipboard.writeText(text).then(()=>toast('kopierat')); }
document.addEventListener('click', (e)=>{
  const b=e.target.closest('[data-copy]'); if(!b) return;
  const type=b.getAttribute('data-copy');
  let text=''; if(type==='title') text=document.getElementById('title').value;
  if(type==='price') text=document.getElementById('price').value+' SEK';
  if(type==='tags') text=document.getElementById('tags').value;
  if(type==='description') text=cleanText(stripMarkdownEmoji(document.getElementById('description').value));
  if(!text) return toast('inget att kopiera');
  copyText(text);
});

// Marketplace
const marketplace={
  tradera:{ url:'https://www.tradera.com/selling/new', done:false },
  blocket:{ url:'https://www.blocket.se/mina-annonser/lagg-in-annons', done:false },
  facebook:{ url:'https://www.facebook.com/marketplace/create/item', done:false },
  ebay:{ url:'https://www.ebay.com/sell', done:false }
};
function buildFor(market){
  const d=getData(); const desc=cleanText(stripMarkdownEmoji(d.description));
  if(!d.title || !d.price || !d.condition || !desc){ toast('fyll i titel, pris, skick, beskrivning'); return ''; }
  switch(market){
    case 'tradera': return `${d.title}\n\n${desc}\n\nSkick: ${d.condition}\nUtgångspris: ${d.price} SEK\nTaggar: ${d.tags}`;
    case 'blocket': return `${d.title} – ${d.price} SEK\n\n${desc}\n\nSkick: ${d.condition}\nTaggar: ${d.tags}`;
    case 'facebook': return `${d.title}\n${d.price} SEK\n\n${desc}`;
    case 'ebay': return `${d.title} [${d.condition}]\n\n${desc}\n\nPrice: ${d.price} SEK\nTags: ${d.tags}`;
    default: return '';
  }
}
function updateProgress(){
  const done=Object.values(marketplace).filter(x=>x.done).length;
  const pct=Math.round(done/4*100);
  document.getElementById('progress-bar').style.width=`${pct}%`;
  document.getElementById('progress-text').textContent=`${pct}% klart`;
}

// Click handlers for publish & general buttons
document.addEventListener('click', (e)=>{
  if(e.target.classList.contains('ai')){ handleGenerate(e.target.getAttribute('data-style'), e.target); return; }

  const open=e.target.closest('[data-open]');
  if(open){ const m=open.getAttribute('data-open'); const payload=buildFor(m); if(!payload) return;
    navigator.clipboard.writeText(payload).then(()=>toast(`format för ${m} kopierat`));
    window.open(marketplace[m].url,'_blank'); return;
  }
  const complete=e.target.closest('[data-complete]');
  if(complete){ const m=complete.getAttribute('data-complete'); marketplace[m].done=!marketplace[m].done; document.getElementById(`${m}-status`).classList.toggle('done', marketplace[m].done); updateProgress(); return; }

  if(e.target.id==='copy-all'){ const d=getData(); const txt=`titel: ${d.title}\nbeskrivning:\n${cleanText(stripMarkdownEmoji(d.description))}\npris: ${d.price} SEK\nskick: ${d.condition}\nstad/ort: ${d.city}\ntaggar: ${d.tags}`; copyText(txt); return; }
  if(e.target.id==='clear-all'){ if(!confirm('rensa alla fält? sparade utkast påverkas inte.')) return; resetForm(); images=[]; renderGallery(); Object.keys(marketplace).forEach(k=>{ marketplace[k].done=false; document.getElementById(`${k}-status`).classList.remove('done'); }); updateProgress(); toast('rensat'); return; }
  if(e.target.id==='save-draft'){ saveDraft(); return; }
});

// ---------- Image handling (append, not override); thumbnails saved in drafts ----------
let images = []; // {id, name, data}
const gallery = document.getElementById('gallery');
const fileInput = document.getElementById('photos');
const drop = document.getElementById('drop');

drop.addEventListener('dragover', (e)=>{ e.preventDefault(); drop.classList.add('hover'); });
drop.addEventListener('dragleave', ()=> drop.classList.remove('hover'));
drop.addEventListener('drop', (e)=>{ e.preventDefault(); drop.classList.remove('hover'); handleFiles(e.dataTransfer.files); });
fileInput.addEventListener('change', (e)=> handleFiles(e.target.files));

function handleFiles(fileList){
  const files = Array.from(fileList||[]).slice(0,10 - images.length);
  if(files.length===0) return;
  files.forEach(f=> compressToThumb(f).then(data=>{
    images.push({ id: Date.now()+Math.random(), name: f.name, data });
    renderGallery();
  }));
}

function compressToThumb(file, max=1200, quality=0.8){
  return new Promise((resolve,reject)=>{
    const reader=new FileReader();
    reader.onload=()=>{
      const img=new Image();
      img.onload=()=>{
        let { width, height } = img;
        const scale = Math.min(1, max/Math.max(width,height));
        width = Math.round(width*scale); height = Math.round(height*scale);
        const canvas=document.createElement('canvas'); canvas.width=width; canvas.height=height;
        const ctx=canvas.getContext('2d'); ctx.drawImage(img,0,0,width,height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.onerror=reject;
      img.src=reader.result;
    };
    reader.onerror=reject;
    reader.readAsDataURL(file);
  });
}

function renderGallery(){
  gallery.innerHTML='';
  images.forEach((imgObj, idx)=>{
    const div=document.createElement('div'); div.className='thumb';
    div.innerHTML=`<img src="${imgObj.data}" alt="bild ${idx+1}"><div class="toolbar">
      <button class="tool" data-move-left="${imgObj.id}" title="flytta vänster"><i class="fa-solid fa-chevron-left"></i></button>
      <button class="tool" data-move-right="${imgObj.id}" title="flytta höger"><i class="fa-solid fa-chevron-right"></i></button>
      <button class="tool" data-remove="${imgObj.id}" title="ta bort"><i class="fa-solid fa-x"></i></button>
    </div>`;
    gallery.appendChild(div);
  });
}

document.addEventListener('click', (e)=>{
  const rm=e.target.closest('[data-remove]'); if(rm){ const id=+rm.getAttribute('data-remove'); images=images.filter(x=>x.id!==id); renderGallery(); return; }
  const ml=e.target.closest('[data-move-left]'); if(ml){ const id=+ml.getAttribute('data-move-left'); const i=images.findIndex(x=>x.id===id); if(i>0){ const t=images[i-1]; images[i-1]=images[i]; images[i]=t; renderGallery(); } return; }
  const mr=e.target.closest('[data-move-right]'); if(mr){ const id=+mr.getAttribute('data-move-right'); const i=images.findIndex(x=>x.id===id); if(i>=0 && i<images.length-1){ const t=images[i+1]; images[i+1]=images[i]; images[i]=t; renderGallery(); } return; }
});

// ---------- Drafts (includes thumbnails) ----------
const LS={ DRAFTS:'adDrafts' };

function saveDraft(){
  const d=getData();
  if(!d.title || !d.price || !d.condition) return toast('titel, pris, skick krävs');
  let drafts = JSON.parse(localStorage.getItem(LS.DRAFTS)||'[]');
  const id = Date.now();
  drafts.unshift({ id, ...d, images, date: new Date().toISOString() });
  drafts = drafts.slice(0,10);
  localStorage.setItem(LS.DRAFTS, JSON.stringify(drafts));
  renderDrafts(); toast('annons sparad som utkast');
}

function renderDrafts(){
  const list=document.getElementById('previous-ads-list'); list.innerHTML='';
  const drafts=JSON.parse(localStorage.getItem(LS.DRAFTS)||'[]');
  if(drafts.length===0){ list.innerHTML='<div class="previous-meta">inga utkast än</div>'; return; }
  drafts.forEach(d=>{
    const div=document.createElement('div'); div.className='previous-item';
    const date=new Date(d.date).toLocaleString('sv-SE',{hour:'2-digit',minute:'2-digit',year:'numeric',month:'short',day:'2-digit'});
    div.innerHTML = `<div>
        <div><strong>${d.title||'utan titel'}</strong></div>
        <div class="previous-meta">${date} • ${d.city||'utan stad'}</div>
      </div>
      <div>
        <button class="chip" data-load="${d.id}" title="ladda"><i class="fa-solid fa-download"></i></button>
        <button class="chip" data-del="${d.id}" title="ta bort"><i class="fa-solid fa-trash"></i></button>
      </div>`;
    list.appendChild(div);
  });
}

document.addEventListener('click', (e)=>{
  const load=e.target.closest('[data-load]'); if(load){ const id=+load.getAttribute('data-load'); const drafts=JSON.parse(localStorage.getItem(LS.DRAFTS)||'[]'); const d=drafts.find(x=>x.id===id); if(d){ setData(d); images=d.images||[]; renderGallery(); toast('utkast laddat'); } return; }
  const del=e.target.closest('[data-del]'); if(del){ const id=+del.getAttribute('data-del'); let drafts=JSON.parse(localStorage.getItem(LS.DRAFTS)||'[]'); drafts=drafts.filter(x=>x.id!==id); localStorage.setItem(LS.DRAFTS, JSON.stringify(drafts)); renderDrafts(); toast('utkast borttaget'); return; }
});

// ---------- Clear & Reset ----------
function resetForm(){ setData({ title:'', price:'', condition:'', notes:'', city:'', tags:'', description:'' }); }
updateProgress();
renderDrafts();
renderGallery();

// Autosave each 2 min (text only)
setInterval(()=>{
  const d=getData();
  const has = d.title || d.price || d.description || d.tags || (d.condition && d.condition!=='välj skick…');
  if(!has) return;
  localStorage.setItem('avp.currentDraft', JSON.stringify({ ...d, ts: Date.now() }));
}, 120000);
