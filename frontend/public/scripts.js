// Core config
const BACKEND = (document.querySelector('meta[name="backend"]')?.content || '').replace(/\/+$/, '');

// Notify
function showNotification(text){
  const n=document.getElementById('notification');
  document.getElementById('notification-text').textContent=text;
  n.classList.add('show'); setTimeout(()=>n.classList.remove('show'), 2000);
}

// Sanitize
function stripMarkdownEmoji(s=''){
  s = s.replace(/(^|\s)#{1,6}\s*/g,'$1')
       .replace(/[*_]{1,3}([^*_]+)[*_]{1,3}/g,'$1')
       .replace(/`{1,3}[^`]*`{1,3}/g,'')
       .replace(/^\s*[-*•]\s+/gm,'· ');
  try{ s = s.replace(/[\p{Extended_Pictographic}\p{Emoji_Presentation}]/gu,''); }catch{}
  s = s.replace(/[ \t]+\n/g,'\n').replace(/\n{3,}/g,'\n\n');
  return s.trim();
}
function cleanText(s){ return (s||'').toString().replace(/[^\n\r\t\u0020-\u007EåäöÅÄÖ.,;:!?()\-\w]/g,''); }

// Marketplace state
const marketplaceState = {
  tradera:{ completed:false, url:'https://www.tradera.com/selling/new' },
  blocket:{ completed:false, url:'https://www.blocket.se/mina-annonser/lagg-in-annons' },
  facebook:{ completed:false, url:'https://www.facebook.com/marketplace/create/item' },
  ebay:{ completed:false, url:'https://www.ebay.com/sell' }
};

// Helpers
function getData(){
  const condSel = document.getElementById('condition');
  const condition = condSel?.options[condSel.selectedIndex]?.text || '';
  return {
    title: document.getElementById('title').value.trim(),
    price: document.getElementById('price').value.trim(),
    condition,
    notes: document.getElementById('notes')?.value || '',
    city: document.getElementById('city')?.value || '',
    tags: document.getElementById('tags')?.value || '',
    lang: document.querySelector('#lang-switch .lang.active')?.dataset.lang || 'sv'
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
  document.getElementById('notes').value = d.notes||'';
  document.getElementById('city').value = d.city||localStorage.getItem('avp.defaultCity')||'';
}
function resetForm(){ setData({ title:'', price:'', condition:'', description:'', tags:'', notes:'', city:'' }); }
function copy(text, msg){ navigator.clipboard.writeText(text).then(()=>showNotification(msg||'kopierat!')); }

// AI call
async function callAI(payload){
  const res = await fetch(`${BACKEND}/generate-description`,{
    method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(payload)
  });
  if(!res.ok) throw new Error(await res.text());
  return res.json();
}
async function handleGenerate(style, btn){
  const { title, price, condition, notes, city, lang } = getData();
  if(!title || !price || !condition){ showNotification('fyll i titel, pris och skick först'); return; }
  if(btn){ btn.dataset.old = btn.innerHTML; btn.disabled = true; btn.innerHTML = '⏳ genererar…'; }
  let description = '';
  try{
    const data = await callAI({ style, title: cleanText(title), condition: cleanText(condition), price: cleanText(price), notes, city, lang });
    description = cleanText(stripMarkdownEmoji((data.description||'').trim()));
  }catch(e){
    console.warn('AI failed, using fallback', e);
    description = `${title} i ${condition} skick. Pris: ${price} SEK.`;
    showNotification('kunde inte nå AI (fallback)');
  }
  document.getElementById('description').value = description;
  showNotification(`beskrivning genererad (${style})`);
  if(btn){ btn.disabled = false; btn.innerHTML = btn.dataset.old; }
}

// Language toggle
document.addEventListener('click', (e)=>{
  const btn = e.target.closest('#lang-switch .lang'); if(!btn) return;
  document.querySelectorAll('#lang-switch .lang').forEach(b=>b.classList.remove('active'));
  btn.classList.add('active');
  showNotification(`språk: ${btn.dataset.lang}`);
});

// Tag rendering
function renderTags(tags){
  const c=document.getElementById('tag-container'); if(!c) return; c.innerHTML='';
  tags.forEach(t=>{ if(!t) return; const el=document.createElement('span'); el.className='tag'; el.textContent = t; c.appendChild(el); });
}
document.addEventListener('input', (e)=>{
  if(e.target.id==='tags'){ renderTags(e.target.value.split(',').map(t=>t.trim())); }
});

// Copy buttons
document.addEventListener('click', (e)=>{
  const ai = e.target.closest('.ai-btn'); if(ai){ handleGenerate(ai.dataset.style, ai); return; }
  const copyBtn = e.target.closest('.copy-btn');
  if(copyBtn){
    const target = copyBtn.getAttribute('data-copy'); let text = '';
    if(target==='title') text = document.getElementById('title').value;
    if(target==='price') text = document.getElementById('price').value + ' SEK';
    if(target==='description') text = cleanText(stripMarkdownEmoji(document.getElementById('description').value));
    if(target==='tags') text = document.getElementById('tags').value;
    if(!text) return showNotification('fältet är tomt');
    copy(text, 'kopierat');
  }
});

// Marketplace helpers
function buildFor(market){
  const { title, price, condition, description, tags } = {
    ...getData(), description: document.getElementById('description').value
  };
  const desc = cleanText(stripMarkdownEmoji(description));
  if(!title || !price || !condition || !desc){ showNotification('fyll i titel, pris, skick, beskrivning'); return ''; }
  switch(market){
    case 'tradera': return `${title}\n\n${desc}\n\nSkick: ${condition}\nUtgångspris: ${price} SEK\nTaggar: ${tags}`;
    case 'blocket': return `${title} – ${price} SEK\n\n${desc}\n\nSkick: ${condition}\nTaggar: ${tags}`;
    case 'facebook': return `${title}\n${price} SEK\n\n${desc}`;
    case 'ebay': return `${title} [${condition}]\n\n${desc}\n\nPrice: ${price} SEK\nTags: ${tags}`;
    default: return `${title}\n${desc}\nPris: ${price} SEK\nSkick: ${condition}\n${tags}`;
  }
}
function updateMarketplaceUI(market){ const status=document.getElementById(`${market}-status`); const btn=document.querySelector(`.marketplace-item[data-market="${market}"] .complete-btn`); const done=btn?.classList.toggle('completed'); status?.classList.toggle('status-completed', !!done); updateProgress(); }
function updateProgress(){ const done = Array.from(document.querySelectorAll('.complete-btn.completed')).length; const total = 4; const pct = Math.round(done/total*100); document.getElementById('progress-bar').style.width = `${pct}%`; document.getElementById('progress-text').textContent = `${pct}% klart`; }

document.addEventListener('click', (e)=>{
  const open = e.target.closest('[data-open]'); if(open){ const m=open.getAttribute('data-open'); const payload=buildFor(m); if(payload) navigator.clipboard.writeText(payload).then(()=>showNotification(`format för ${m} kopierat`)); window.open({tradera:'https://www.tradera.com/selling/new', blocket:'https://www.blocket.se/mina-annonser/lagg-in-annons', facebook:'https://www.facebook.com/marketplace/create/item', ebay:'https://www.ebay.com/sell'}[m], '_blank'); return; }
  const complete = e.target.closest('[data-complete]'); if(complete){ updateMarketplaceUI(complete.getAttribute('data-complete')); return; }

  if(e.target.id==='start-pub'){ document.getElementById('step-start').classList.remove('active'); document.getElementById('step-marketplace').classList.add('active'); return; }
  if(e.target.id==='back-btn'){ document.getElementById('step-marketplace').classList.remove('active'); document.getElementById('step-start').classList.add('active'); return; }
  if(e.target.id==='clear-all'){ if(!confirm('Rensa alla fält? Sparade utkast påverkas inte.')) return; resetForm(); showNotification('rensat'); return; }
  if(e.target.id==='save-draft'){ const d=getData(); if(!d.title||!d.price||!d.condition) return showNotification('titel, pris, skick krävs'); const drafts=JSON.parse(localStorage.getItem('adDrafts')||'[]'); drafts.unshift({ id:Date.now(), ...d, date:new Date().toISOString(), description: document.getElementById('description').value }); localStorage.setItem('adDrafts', JSON.stringify(drafts.slice(0,10))); showNotification('utkast sparat'); return; }
  if(e.target.id==='copy-all'){ const d=getData(); const desc=cleanText(stripMarkdownEmoji(document.getElementById('description').value)); const txt = `Titel: ${d.title}\nBeskrivning:\n${desc}\nPris: ${d.price} SEK\nSkick: ${d.condition}\nStad/ort: ${d.city}\nTaggar: ${d.tags}`; copy(txt, 'allt kopierat'); return; }
});

// Autosave every 2 minutes (silent)
setInterval(()=>{
  const d = getData();
  const has = d.title || d.price || d.description || d.tags || (d.condition && d.condition!=='Välj skick...');
  if(!has) return;
  localStorage.setItem('avp.currentDraft', JSON.stringify({ ...d, description: document.getElementById('description').value, ts: Date.now() }));
}, 120000);

// Startup

// Geolocation -> auto-fill "Stad eller ort"
async function reverseGeocode(lat, lon){
  const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`;
  const res = await fetch(url, { headers: { 'Accept': 'application/json' }});
  if(!res.ok) throw new Error('reverse geocode failed');
  const data = await res.json();
  const a = data.address || {};
  // Prefer city -> town -> municipality -> village
  return a.city || a.town || a.municipality || a.village || a.county || '';
}
function autoFillCity(){
  if(!navigator.geolocation) return;
  const field = document.getElementById('city');
  if(!field || field.value) return; // don't override user input
  navigator.geolocation.getCurrentPosition(async (pos)=>{
    try{
      const name = await reverseGeocode(pos.coords.latitude, pos.coords.longitude);
      if(name && !field.value){
        field.value = name;
        localStorage.setItem('avp.defaultCity', name);
        showNotification(`stad/ort föreslagen: ${name}`);
      }
    }catch(e){ console.warn('geolocation reverse failed', e); }
  }, (err)=>{ console.warn('geolocation denied', err); }, { enableHighAccuracy:false, maximumAge:600000, timeout:8000 });
}


document.addEventListener('DOMContentLoaded', ()=>{
  resetForm();
  autoFillCity();
  // default city memory
  const savedCity = localStorage.getItem('avp.defaultCity');
  if(savedCity) document.getElementById('city').value = savedCity;
  document.getElementById('city').addEventListener('change', ()=> localStorage.setItem('avp.defaultCity', document.getElementById('city').value.trim()));
});
