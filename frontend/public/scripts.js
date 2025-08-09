// AnnonsVän Pro – behavior (modular, commented for future changes)

const BACKEND = (document.querySelector('meta[name="backend"]')?.content || '').replace(/\/+$/, '');

function showNotification(text){
  const n=document.getElementById('notification');
  document.getElementById('notification-text').textContent=text;
  n.classList.add('show'); setTimeout(()=>n.classList.remove('show'),2200);
}

function stripMarkdownEmoji(s=''){
  s = s.replace(/(^|\s)#{1,6}\s*/g,'$1');
  s = s.replace(/[*_]{1,3}([^*_]+)[*_]{1,3}/g,'$1');
  s = s.replace(/`{1,3}[^`]*`{1,3}/g,'');
  s = s.replace(/^\s*[-*•]\s+/gm,'');
  s = s.replace(/\[(.*?)\]\((.*?)\)/g,'$1');
  try{ s = s.replace(/[\p{Extended_Pictographic}\p{Emoji_Presentation}]/gu,''); }catch{}
  s = s.replace(/[ \t]+\n/g,'\n').replace(/\n{3,}/g,'\n\n');
  return s.trim();
}
function cleanText(s){ return (s||'').toString().replace(/[^\n\r\t\u0020-\u007EåäöÅÄÖ.,;:!?()\-0-9A-Za-z]/g,''); }

const marketplaceState = {
  tradera:{ completed:false, url:'https://www.tradera.com/selling/new' },
  blocket:{ completed:false, url:'https://www.blocket.se/mina-annonser/lagg-in-annons' },
  facebook:{ completed:false, url:'https://www.facebook.com/marketplace/create/item' },
  ebay:{ completed:false, url:'https://www.ebay.com/sell' }
};

function getData(){
  const condSel = document.getElementById('condition');
  const condition = condSel?.options[condSel.selectedIndex]?.text || '';
  return {
    title: document.getElementById('title').value.trim(),
    price: document.getElementById('price').value.trim(),
    condition,
    description: document.getElementById('description').value,
    tags: document.getElementById('tags').value
  };
}
function setData(d={}){
  document.getElementById('title').value = d.title||'';
  document.getElementById('price').value = d.price||'';
  const condSel=document.getElementById('condition');
  if(condSel){
    let idx=0; for(let i=0;i<condSel.options.length;i++){ if(condSel.options[i].text=== (d.condition||'')){ idx=i; break; } }
    condSel.selectedIndex = idx;
  }
  document.getElementById('description').value = d.description||'';
  document.getElementById('tags').value = d.tags||'';
  renderTags((d.tags||'').split(',').map(t=>t.trim()));
}
function resetForm(){ setData({ title:'', price:'', condition:'', description:'', tags:'' }); }

async function callAI(payload){
  const res = await fetch(`${BACKEND}/generate-description`,{
    method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(payload)
  });
  if(!res.ok){ throw new Error(await res.text()); }
  return res.json();
}
async function handleGenerate(style, btn){
  const {title, price, condition} = getData();
  if(!title || !price || !condition){ showNotification('Fyll i titel, pris och skick först!'); return; }
  if(btn){ btn.dataset.old = btn.innerHTML; btn.disabled = true; btn.innerHTML='⏳ Genererar…'; }
  let description='';
  try{
    const data = await callAI({ style, title: cleanText(title), condition: cleanText(condition), price: cleanText(price) });
    description = (data.description||'').trim();
  }catch(err){
    description = `${title} i ${condition} skick. Pris: ${price} SEK.`;
    console.warn('AI backend misslyckades, fallback:', err);
    showNotification('Kunde inte nå AI. Använder lokal mall.');
  }
  description = cleanText(stripMarkdownEmoji(description));
  document.getElementById('description').value = description;
  showNotification(`Beskrivning genererad (${style})`);
  if(btn){ btn.disabled=false; btn.innerHTML = btn.dataset.old; }
}

function updateTags(tagString){ document.getElementById('tags').value = tagString; renderTags(tagString.split(',').map(t=>t.trim())); }
function renderTags(tags){
  const c=document.getElementById('tag-container'); c.innerHTML='';
  tags.forEach(tag=>{
    if(!tag) return;
    const el=document.createElement('div'); el.className='tag';
    el.innerHTML = `${tag.replace(/_/g,' ')} <span class="tag-delete" data-del="${tag}">×</span>`;
    c.appendChild(el);
  });
}
function removeTag(tag){
  const tags = document.getElementById('tags').value.split(',').map(t=>t.trim()).filter(t=>t!==tag);
  updateTags(tags.join(', '));
}
function generateTagsFromDescription(){
  const description = document.getElementById('description').value;
  if(!description){ showNotification('Skriv först en beskrivning'); return; }
  const words = description.toLowerCase().split(/\s+/);
  const common = new Set(['i','och','att','som','en','på','för','med','till','den','det','ett']);
  const count = {};
  words.forEach(w=>{ if(!common.has(w) && w.length>3){ count[w]=(count[w]||0)+1; } });
  const tags = Object.entries(count).sort((a,b)=>b[1]-a[1]).slice(0,5).map(([w])=>w.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g,''));
  updateTags(tags.filter(Boolean).join(', '));
  showNotification('Taggar genererade!');
}

function copy(text, msg){ navigator.clipboard.writeText(text).then(()=>showNotification(msg||'Kopierat!'), e=>showNotification('Kunde inte kopiera: '+e)); }

function buildFor(market){
  const { title, price, condition, description, tags } = getData();
  const desc = cleanText(stripMarkdownEmoji(description));
  if(!title || !price || !condition || !desc){ showNotification('Fyll i titel, pris, skick och beskrivning först.'); return ''; }
  switch(market){
    case 'tradera': return `${title}\n\n${desc}\n\nSkick: ${condition}\nUtgångspris: ${price} SEK\nTaggar: ${tags}`;
    case 'blocket': return `${title} – ${price} SEK\n\n${desc}\n\nSkick: ${condition}\nTaggar: ${tags}`;
    case 'facebook': return `${title}\n${price} SEK\n\n${desc}\n\nTaggar: ${tags}`;
    case 'ebay': return `${title} [${condition}]\n\n${desc}\n\nPrice: ${price} SEK\nTags: ${tags}`;
    default: return `${title}\n${desc}\nPris: ${price} SEK\nSkick: ${condition}\n${tags}`;
  }
}

const LS = { CURRENT:'avp.currentDraft', DRAFTS:'adDrafts' };
function autoSave(){
  const d = getData();
  const has = d.title || d.price || d.description || d.tags || (d.condition && d.condition!=='Välj skick...');
  if(!has) return;
  try{ localStorage.setItem(LS.CURRENT, JSON.stringify({ ...d, ts: Date.now() })); }catch{}
}
function manualSave(){
  const d = getData();
  if(!d.title || !d.price || !d.condition){ showNotification('Titel, pris och skick krävs för att spara.'); return; }
  let drafts = JSON.parse(localStorage.getItem(LS.DRAFTS)||'[]');
  const id = Date.now(); drafts.unshift({ id, ...d, date:new Date().toISOString() });
  drafts = drafts.slice(0,10);
  localStorage.setItem(LS.DRAFTS, JSON.stringify(drafts));
  renderPreviousAds(); showNotification('Annons sparad som utkast!');
}
function loadDraft(id){
  const drafts = JSON.parse(localStorage.getItem(LS.DRAFTS)||'[]');
  const d = drafts.find(x=>x.id===id); if(!d) return;
  setData(d); showNotification('Utkast laddat!');
}
function deleteDraft(id){
  let drafts = JSON.parse(localStorage.getItem(LS.DRAFTS)||'[]');
  drafts = drafts.filter(x=>x.id!==id); localStorage.setItem(LS.DRAFTS, JSON.stringify(drafts));
  renderPreviousAds(); showNotification('Utkast borttaget');
}
function renderPreviousAds(){
  const c=document.getElementById('previous-ads-list'); const drafts=JSON.parse(localStorage.getItem(LS.DRAFTS)||'[]'); c.innerHTML='';
  if(drafts.length===0){ c.innerHTML='<p>Inga tidigare utkast hittades.</p>'; return; }
  drafts.forEach(d=>{
    const dt=new Date(d.date); const dateStr = dt.toLocaleDateString('sv-SE',{year:'numeric',month:'short',day:'numeric',hour:'2-digit',minute:'2-digit'});
    const el=document.createElement('div'); el.className='ad-item';
    el.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:center;">
        <div>
          <h4>${d.title||'Okänd titel'}</h4>
          <p>${(d.description||'').substring(0,60)}${(d.description||'').length>60?'...':''}</p>
        </div>
        <div class="ad-actions">
          <div class="ad-action-btn" title="Ladda utkast" data-load="${d.id}"><i class="fas fa-download"></i></div>
          <div class="ad-action-btn delete" title="Ta bort utkast" data-del="${d.id}"><i class="fas fa-trash"></i></div>
        </div>
      </div>
      <div class="ad-date">${dateStr}</div>`;
    c.appendChild(el);
  });
}

function clearAll(){
  if(!confirm('Rensa alla fält? Sparade utkast påverkas inte.')) return;
  resetForm(); try{ localStorage.removeItem(LS.CURRENT); }catch{}
  showNotification('Formuläret rensat');
}

function startPublishing(){ document.getElementById('step-start').classList.remove('active'); document.getElementById('step-marketplace').classList.add('active'); showNotification('Välj en marknadsplats att börja med'); }
function updateMarketplaceUI(market){ const status=document.getElementById(`${market}-status`); const btn=document.querySelector(`.marketplace-item[data-market="${market}"] .complete-btn`); if(marketplaceState[market].completed){ status.className='site-status-icon status-completed'; btn.classList.add('completed'); }else{ status.className='site-status-icon status-not-started'; btn.classList.remove('completed'); }}
function updateProgress(){ const done=Object.values(marketplaceState).filter(m=>m.completed).length; const total=Object.keys(marketplaceState).length; const pct=Math.round((done/total)*100); document.getElementById('progress-bar').style.width=`${pct}%`; const t=document.getElementById('progress-text'); t.textContent=`${pct}% slutfört`; t.style.display='block'; }

document.addEventListener('click', (e)=>{
  const ai = e.target.closest('.ai-btn'); if(ai){ handleGenerate(ai.dataset.style, ai); return; }

  const copyBtn = e.target.closest('.copy-btn');
  if(copyBtn){
    const target = copyBtn.getAttribute('data-copy'); let text='';
    if(target==='title') text = document.getElementById('title').value;
    if(target==='price') text = document.getElementById('price').value + ' SEK';
    if(target==='description') text = cleanText(stripMarkdownEmoji(document.getElementById('description').value));
    if(target==='tags') text = document.getElementById('tags').value;
    if(!text) return showNotification('Fyll i fältet först!'); copy(text); return;
  }

  const open = e.target.closest('[data-open]'); if(open){ const m=open.getAttribute('data-open'); marketplaceState[m].completed=false; updateMarketplaceUI(m); const payload=buildFor(m); if(payload) copy(payload, `Innehåll för ${m} kopierat!`); window.open(marketplaceState[m].url,'_blank'); return; }
  const complete = e.target.closest('[data-complete]'); if(complete){ const m=complete.getAttribute('data-complete'); marketplaceState[m].completed = !marketplaceState[m].completed; updateMarketplaceUI(m); updateProgress(); return; }

  const delTag = e.target.closest('[data-del]'); if(delTag && delTag.hasAttribute('data-del') && delTag.classList.contains('tag-delete')){ removeTag(delTag.getAttribute('data-del')); return; }

  const load = e.target.closest('[data-load]'); if(load){ loadDraft(parseInt(load.getAttribute('data-load'))); return; }
  const del = e.target.closest('[data-del]'); if(del && del.classList.contains('ad-action-btn')){ deleteDraft(parseInt(del.getAttribute('data-del'))); return; }

  if(e.target.id==='save-draft'){ manualSave(); return; }
  if(e.target.id==='clear-all'){ clearAll(); return; }
  if(e.target.id==='copy-all'){ const d=getData(); const txt = `Titel: ${d.title}\nBeskrivning:\n${cleanText(stripMarkdownEmoji(d.description))}\nPris: ${d.price} SEK\nSkick: ${d.condition}\nTaggar: ${d.tags}`; copy(txt, 'All annonsinformation kopierad!'); return; }
  if(e.target.id==='start-pub'){ startPublishing(); return; }
  if(e.target.id==='back-btn'){ document.getElementById('step-marketplace').classList.remove('active'); document.getElementById('step-start').classList.add('active'); return; }
  if(e.target.id==='ai-tags'){ generateTagsFromDescription(); return; }
});

document.addEventListener('input', (e)=>{
  if(e.target.id==='tags'){ renderTags(e.target.value.split(',').map(t=>t.trim())); }
});

document.addEventListener('change', (e)=>{
  if(e.target.id==='photos'){
    const pc=document.getElementById('photo-preview-container'); pc.innerHTML='';
    const files=e.target.files; const max=Math.min(files.length,5);
    for(let i=0;i<max;i++){
      const file=files[i]; if(!file.type.match('image.*')) continue;
      const reader=new FileReader();
      reader.onload = (ev)=>{
        const w=document.createElement('div'); w.className='photo-preview-wrapper';
        const img=document.createElement('img'); img.src=ev.target.result;
        const rm=document.createElement('button'); rm.innerHTML='<i class="fas fa-times"></i>'; rm.onclick=()=>w.remove();
        w.appendChild(img); w.appendChild(rm); pc.appendChild(w);
      };
      reader.readAsDataURL(file);
    }
  }
});

document.addEventListener('DOMContentLoaded', ()=>{
  resetForm();
  renderPreviousAds();
  if(!BACKEND){ console.warn('Ingen BACKEND meta konfigurerad. AI använder fallback.'); }
  setInterval(autoSave, 120000);
});
