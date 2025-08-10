(function(){
  const body=document.body;
  const quickBtn=document.getElementById('quick-sell'); const proBtn=document.getElementById('pro-mode');
  quickBtn.addEventListener('click',()=>setMode('quick')); proBtn.addEventListener('click',()=>setMode('pro'));
  function setMode(m){const isPro=m==='pro'; body.classList.toggle('mode-pro',isPro); quickBtn.classList.toggle('active',!isPro); proBtn.classList.toggle('active',isPro); renderPreviewThumbs(); recalc(); }

  // Elements
  const title=doc('title'), price=doc('price'), condition=doc('condition'), city=doc('city'), tags=doc('tags'), notes=doc('notes'), description=doc('description');
  const preview=doc('preview'), previewPhotos=doc('preview-photos'), gallery=doc('gallery'), toast=doc('toast');
  const confettiCanvas = doc('confetti');
  const BACKEND=(document.querySelector('meta[name="backend"]')?.content||'').replace(/\/+$/,'');

  // Track current draft id if loaded
  let currentDraftId = null;

  // Copy chips
  qsa('[data-copy]').forEach(b=>b.addEventListener('click',()=>{
    const id=b.getAttribute('data-copy'); const el=doc(id);
    const t=id==='price'?(el.value?el.value+' SEK':''):(el.value||'');
    if(t){navigator.clipboard.writeText(t).then(()=>toastMsg('Kopierat'));}
  }));

  // Tags / chips
  const chipBox=doc('tag-chips');
  function renderChips(){
    chipBox.innerHTML='';
    (tags.value||'').split(',').map(t=>t.trim()).filter(Boolean).forEach(tag=>{
      const s=document.createElement('span');
      s.className='tag-chip'; s.innerHTML=`${esc(tag)} <span class="x" data-x="${esc(tag)}">×</span>`;
      chipBox.appendChild(s);
    });
  }
  tags&&tags.addEventListener('input',renderChips);
  chipBox.addEventListener('click',e=>{
    const x=e.target.getAttribute('data-x'); if(!x) return;
    const arr=(tags.value||'').split(',').map(t=>t.trim()).filter(Boolean).filter(t=>t!==x);
    tags.value=arr.join(', '); renderChips();
  });
  on('gen-tags','click',()=>{
    const source=(title.value+' '+description.value).toLowerCase();
    const words=source.split(/[^a-z0-9åäö]+/i);
    const common=new Set(['i','och','att','som','en','på','för','med','till','den','det','eller','har','är','som']);
    const c={}; words.forEach(w=>{if(w&&w.length>2&&!common.has(w)) c[w]=(c[w]||0)+1;});
    const top=Object.entries(c).sort((a,b)=>b[1]-a[1]).slice(0,5).map(([w])=>w);
    const merged=new Set((tags.value||'').split(',').map(t=>t.trim()).filter(Boolean).concat(top));
    tags.value=Array.from(merged).join(', '); renderChips(); toastMsg('Taggar genererade');
  }); renderChips();

  // AI generation wired to backend (fallback to simple patterns)
  qsa('.btn.ai').forEach(btn=>btn.addEventListener('click',()=>{
    const style=btn.dataset.style; generateAI(style, btn);
  }));
  on('improve','click',()=>{description.value=(description.value||'')+' Levereras rengjord och testad.'; updatePreview(); recalc();});
  on('summarize','click',()=>{const s=(description.value||'').split(/[.?!]/).map(t=>t.trim()).filter(Boolean); description.value=s.slice(0,2).join('. ')+(s.length>2?' …':''); updatePreview(); recalc();});

  async function generateAI(style, btn){
    const { value: t } = title, p = price.value, c = condition.value, n = notes?.value||'', k = city?.value||'';
    if(!t || !p || !c){ toastMsg('Fyll i titel, pris och skick'); return; }
    const old=btn.textContent; btn.disabled=true; btn.textContent='⏳ Genererar…';
    try{
      if(BACKEND){
        const res=await fetch(`${BACKEND}/generate-description`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({style,title:t,price:p,condition:c,notes:n,city:k})});
        if(res.ok){ const data=await res.json(); description.value = sanitize(data.description||''); }
        else { description.value = fallbackAI(style); }
      }else{
        description.value = fallbackAI(style);
      }
    }catch(e){ description.value=fallbackAI(style); }
    finally{ btn.disabled=false; btn.textContent=old; updatePreview(); recalc(); }
  }
  function sanitize(s=''){
    return s.replace(/(^|\s)#{1,6}\s*/g,'$1')
      .replace(/[*_]{1,3}([^*_]+)[*_]{1,3}/g,'$1')
      .replace(/`{1,3}[^`]*`{1,3}/g,'')
      .replace(/^\s*[-*•]\s+/gm,'· ')
      .replace(/[ \t]+\n/g,'\n')
      .replace(/\n{3,}/g,'\n\n')
      .trim();
  }
  function fallbackAI(m){
    const b=title.value||'Produkten';
    if(m==='minimal')return `${b} i bra skick. Fungerar som det ska.`;
    if(m==='simple') return `${b} i mycket gott skick. Prisvänlig och stabil. Passar dig som vill ha kvalitet utan krångel.`;
    return `${b} i utmärkt skick med pålitlig prestanda. Levereras med tillbehör. Hör av dig vid frågor eller bud.`;
  }

  // Images: append, compress (max 1200, q=0.8), drag-reorder in gallery, set-as-cover, lightbox rotate
  let thumbs=[]; // {id,src,rotation}
  const fileInput=doc('photos'), drop=doc('drop');
  fileInput.addEventListener('change', e=>handleFiles(e.target.files));
  drop.addEventListener('dragover', e=>{e.preventDefault();});
  drop.addEventListener('drop', e=>{e.preventDefault(); handleFiles(e.dataTransfer.files);});

  function handleFiles(fileList){
    const incoming=Array.from(fileList||[]).slice(0, Math.max(0, 10 - thumbs.length));
    if(!incoming.length) return;
    Promise.all(incoming.map(f=>compressToThumb(f,1200,0.8))).then(datas=>{
      datas.forEach(data=>{ if(data) thumbs.push({src:data, rotation:0, id:Date.now()+Math.random()}); });
      renderGallery(); renderPreviewThumbs(); updatePreview(); recalc(); persistThumbsIfDraft();
    });
  }
  function compressToThumb(file, max=1200, quality=0.8){
    return new Promise((resolve)=>{
      if(!file || !file.type || !file.type.startsWith('image/')) return resolve(null);
      const reader=new FileReader();
      reader.onload=()=>{
        const img=new Image();
        img.onload=()=>{
          let { width, height } = img;
          const scale = Math.min(1, max/Math.max(width,height));
          width = Math.round(width*scale); height = Math.round(height*scale);
          const canvas=document.createElement('canvas'); canvas.width=width; canvas.height=height;
          const ctx=canvas.getContext('2d'); ctx.drawImage(img,0,0,width,height);
          const data=canvas.toDataURL('image/jpeg', quality);
          resolve(data);
        };
        img.onerror=()=>resolve(null);
        img.src=reader.result;
      };
      reader.onerror=()=>resolve(null);
      reader.readAsDataURL(file);
    });
  }

  function renderGallery(){
    gallery.innerHTML='';
    thumbs.forEach((t,idx)=>{
      const w=document.createElement('div'); w.className='thumb'; w.setAttribute('draggable','true'); if(idx===0) w.classList.add('is-hero');
      w.dataset.id = String(t.id);
      w.innerHTML=`
        <img data-id="${t.id}" style="transform: rotate(${t.rotation}deg)" src="${t.src}"/>
        ${idx===0?'<div class="badge-hero">Omslag</div>':''}
        <button class="cover-btn" data-cover="${t.id}" title="Sätt som omslag">Sätt som omslag</button>
        <div class="tools">
          <div class="tool" data-rot="${t.id}" title="Rotera">⟳</div>
          <div class="tool" data-view="${t.id}" title="Visa">🔍</div>
          <div class="tool" data-del="${t.id}" title="Ta bort">✕</div>
        </div>`;
      gallery.appendChild(w);
    });
  }

  // Drag to reorder (gallery)
  let dragId=null;
  gallery.addEventListener('dragstart', e=>{
    const thumb=e.target.closest('.thumb'); if(!thumb) return;
    dragId = thumb.dataset.id; thumb.classList.add('dragging');
    e.dataTransfer.effectAllowed='move';
  });
  gallery.addEventListener('dragend', e=>{
    const thumb=e.target.closest('.thumb'); if(thumb) thumb.classList.remove('dragging');
  });
  gallery.addEventListener('dragover', e=>{
    e.preventDefault();
    const over=e.target.closest('.thumb'); if(!over) return;
    const overId=over.dataset.id; if(!dragId || dragId===overId) return;
    const fromIdx=thumbs.findIndex(t=>String(t.id)===String(dragId));
    const toIdx=thumbs.findIndex(t=>String(t.id)===String(overId));
    if(fromIdx<0 || toIdx<0) return;
    const item=thumbs.splice(fromIdx,1)[0];
    thumbs.splice(toIdx,0,item);
    renderGallery(); renderPreviewThumbs(); updatePreview(); recalc(); persistThumbsIfDraft();
  });

  // Click tools: rotate, view, delete, set cover
  gallery.addEventListener('click', e=>{
    const rot=e.target.getAttribute('data-rot');
    const view=e.target.getAttribute('data-view');
    const del=e.target.getAttribute('data-del');
    const cov=e.target.getAttribute('data-cover');
    if(rot){ const t=thumbs.find(x=>String(x.id)===rot); if(t){ t.rotation=(t.rotation+90)%360; renderGallery(); renderPreviewThumbs(); updatePreview(); recalc(); persistThumbsIfDraft(); } }
    if(view){ openLB(view); }
    if(del){ thumbs=thumbs.filter(x=>String(x.id)!==del); renderGallery(); renderPreviewThumbs(); updatePreview(); recalc(); persistThumbsIfDraft(); }
    if(cov){ const i=thumbs.findIndex(x=>String(x.id)===cov); if(i>0){ const [it]=thumbs.splice(i,1); thumbs.unshift(it); renderGallery(); renderPreviewThumbs(); updatePreview(); recalc(); persistThumbsIfDraft(); } }
  });

  // Lightbox
  const lb=doc('lightbox'), lbImg=doc('lightbox-image'); const lbPrev=doc('lb-prev'), lbNext=doc('lb-next'), lbRotate=doc('lb-rotate'), lbClose=doc('lb-close');
  qsa('[data-lightbox-close]').forEach(n=>n.addEventListener('click',closeLB)); lbClose.addEventListener('click',closeLB);
  let lbIndex=0;
  function openLB(id){ lbIndex=Math.max(0, thumbs.findIndex(t=>String(t.id)===id)); if(lbIndex<0)return; renderLB(); lb.classList.add('show');}
  function renderLB(){ if(!thumbs.length) return; const t=thumbs[lbIndex]; lbImg.src=t.src; lbImg.style.transform=`rotate(${t.rotation}deg)`; }
  function closeLB(){ lb.classList.remove('show'); }
  lbPrev.addEventListener('click',()=>{ if(!thumbs.length) return; lbIndex=(lbIndex-1+thumbs.length)%thumbs.length; renderLB();});
  lbNext.addEventListener('click',()=>{ if(!thumbs.length) return; lbIndex=(lbIndex+1)%thumbs.length; renderLB();});
  lbRotate.addEventListener('click',()=>{ if(!thumbs.length) return; thumbs[lbIndex].rotation=(thumbs[lbIndex].rotation+90)%360; renderLB(); renderGallery(); renderPreviewThumbs(); persistThumbsIfDraft();});

  // Preview + Quality
  [title, price, condition, description].forEach(el=>el.addEventListener('input',()=>{ updatePreview(); recalc(); }));
  function updatePreview(){
    preview.querySelector('.ph-title').textContent=title.value||'Din titel visas här';
    const pris=price.value?`${price.value} kr`:'— kr'; const cond=condition.value||'—';
    preview.querySelector('.ph-price').textContent=`${pris} • Skick: ${cond}`;
    preview.querySelector('.ph-desc').textContent=description.value||'Beskrivning förhandsvisas här …';
  }
  function recalc(){
    let score=0; const sug=[];
    if(title.value.trim())score+=10; else sug.push('Lägg till titel (+10)');
    if(price.value)score+=20; else sug.push('Ange pris (+20)');
    if(condition.value)score+=15; else sug.push('Välj skick (+15)');
    if((description.value||'').length>40)score+=20; else sug.push('Lägg till beskrivning (+20)');
    const quickMode=!document.body.classList.contains('mode-pro');
    if((quickMode && thumbs.length>=1) || (!quickMode && thumbs.length>=3)) score+=15; else sug.push(quickMode ? 'Lägg till minst 1 bild (+15)' : 'Lägg till minst 3 bilder (+15)');
    if(document.body.classList.contains('mode-pro')){
      if((notes&&notes.value.trim())||(city&&city.value.trim())||(tags&&tags.value.trim()))score+=20;
      else sug.push('Fyll i anmärkning/ort/taggar (+20)');
    }
    score=Math.min(100,score);
    byId('q-score').textContent=String(score);
    byId('q-suggestions').innerHTML=sug.map(s=>`<li>${esc(s)}</li>`).join('');
    deriveStatusFromFields();
  }

  // Marketplace state + progress + sold
  const state=loadMarkets(); updateAll(); updateProgress();
  qsa('[data-open]').forEach(btn=>btn.addEventListener('click',()=>{
    const m=btn.getAttribute('data-open'); const txt=formatFor(m);
    navigator.clipboard.writeText(String(txt).replace(/\r?\n/g,'\n')).then(()=>toastMsg(`Innehåll kopierat (${m})`));
    const url={tradera:'https://www.tradera.com/selling/new',blocket:'https://www.blocket.se/mina-annonser/lagg-in-annons',facebook:'https://www.facebook.com/marketplace/create/item',ebay:'https://www.ebay.com/sell'};
    window.open(url[m],'_blank');
  }));
  qsa('[data-complete]').forEach(btn=>btn.addEventListener('click',()=>{
    const m=btn.getAttribute('data-complete'); if(soldFlag) return;
    state[m]=!state[m]; saveMarkets(); updateAll(); updateProgress(); deriveStatusFromFields(); persistMarketsIfDraft();
  }));

  function updateAll(){ Object.keys(state).forEach(m=>{ byId(`${m}-status`).classList.toggle('completed', !!state[m]); const b=qs(`.complete-btn[data-complete="${m}"]`); if(b){ b.classList.toggle('completed', !!state[m]); b.setAttribute('aria-pressed', String(!!state[m])); } }); }
  function updateProgress(){ if(soldFlag){ byId('progress-text').textContent='Färdig 🎉'; return; } const done=Object.values(state).filter(Boolean).length; const total=Object.keys(state).length; byId('progress-text').textContent=Math.round((done/total)*100)+'% slutfört'; }
  function formatFor(m){
    const condText=condition.value||'';
    if(m==='tradera')return `${title.value}\n\n${description.value}\n\nSkick: ${condText}\nUtgångspris: ${price.value} SEK\nTaggar: ${tags.value}`;
    if(m==='blocket')return `${title.value} - ${price.value} SEK\n\n${description.value}\n\nSkick: ${condText}\nTaggar: ${tags.value}`;
    if(m==='facebook')return `${title.value}
${price.value} SEK

${description.value}${(typeof city!=='undefined' && city && city.value)?`

Hämtas i ${city.value}`:''}`;
    if(m==='ebay')return `${title.value} [${condText}]\n\n${description.value}\n\nPrice: ${price.value} SEK\nTags: ${tags.value}`;
    return `${title.value}\n${description.value}`;
  }
  function loadMarkets(){ try{return JSON.parse(localStorage.getItem('avp3.markets')||'{"tradera":false,"blocket":false,"facebook":false,"ebay":false}');}catch(e){return {"tradera":false,"blocket":false,"facebook":false,"ebay":false};} }
  function saveMarkets(){ localStorage.setItem('avp3.markets', JSON.stringify(state)); }

  // Status derivation
  let currentStatus='draft', soldFlag=false;
  function deriveStatusFromFields(){
    if(soldFlag){ currentStatus='sold'; return; }
    const hasReq = !!(title.value && price.value && condition.value && description.value && thumbs.length>=1);
    const anyPublished = Object.values(state).some(Boolean);
    if(anyPublished){ currentStatus='published'; }
    else if(hasReq){ currentStatus='ready'; }
    else { currentStatus='draft'; }
  }

  // Sold button -> confetti + lock
  on('mark-sold','click',()=>{
    soldFlag=true; currentStatus='sold'; confetti(); toastMsg('Markerad som såld 🎉');
    qsa('.complete-btn').forEach(b=>b.setAttribute('disabled','disabled'));
    // Do NOT auto-set per-site flags; preserve actual published state
    saveMarkets(); updateAll(); updateProgress(); persistMarketsIfDraft();
  });

  
  // Keyboard shortcuts: Ctrl/Cmd+1–4 to open; Ctrl/Cmd+Shift+1–4 to toggle Klar
  const MARKET_KEYS=['tradera','blocket','facebook','ebay'];
  window.addEventListener('keydown',(e)=>{
    const isCmd=e.metaKey||e.ctrlKey;
    if(!isCmd) return;
    const num=Number(e.key);
    if(![1,2,3,4].includes(num)) return;
    e.preventDefault();
    const key=MARKET_KEYS[num-1];
    if(e.shiftKey){
      if(soldFlag) return;
      state[key]=!state[key]; saveMarkets(); updateAll(); updateProgress(); deriveStatusFromFields(); persistMarketsIfDraft();
      const live=document.getElementById('aria-live'); if(live){ live.textContent=''; setTimeout(()=>{ live.textContent = key + ' ' + (state[key]?'klar':'inte klar'); }, 10); }
    } else {
      const urls={tradera:'https://www.tradera.com/selling/new',blocket:'https://www.blocket.se/mina-annonser/ny',facebook:'https://www.facebook.com/marketplace/create/item',ebay:'https://www.ebay.com/sl/sell'};
      const url=urls[key]; if(url) window.open(url,'_blank');
    }
  });

  // Confetti (tiny burst)
  function confetti(){
    const canvas=confettiCanvas; const ctx=canvas.getContext('2d');
    canvas.width=window.innerWidth; canvas.height=window.innerHeight; canvas.classList.add('show');
    const pieces=Array.from({length:120}).map(()=>({x:Math.random()*canvas.width,y:-20*Math.random(),vy:2+Math.random()*4,vx:(Math.random()-.5)*2,s:3+Math.random()*4,c:`hsl(${Math.floor(Math.random()*360)},85%,65%)`,a:1,rot:Math.random()*Math.PI*2}));
    let t=0; const maxT=90;
    function step(){ ctx.clearRect(0,0,canvas.width,canvas.height); pieces.forEach(p=>{ p.x+=p.vx; p.y+=p.vy; p.vy+=0.05; p.rot+=0.1; ctx.save(); ctx.translate(p.x,p.y); ctx.rotate(p.rot); ctx.globalAlpha=p.a; ctx.fillStyle=p.c; ctx.fillRect(-p.s/2,-p.s/2,p.s,p.s); ctx.restore(); }); t++; if(t<maxT) requestAnimationFrame(step); else { canvas.classList.remove('show'); ctx.clearRect(0,0,canvas.width,canvas.height);} }
    step();
  }

  // Drafts (hero + status tag + snippet) + live updates if editing a saved draft
  const draftList=byId('draft-list');
  on('save-draft','click',saveDraft);
  function saveDraft(){
    const id=Date.now();
    const d={
      id, title:title.value, price:price.value, condition:condition.value,
      city:city?.value||'', tags:tags.value, notes:notes?.value||'',
      description:description.value, thumbs, status:currentStatus, sold:soldFlag,
      markets:state, date:new Date().toISOString()
    };
    const arr=[d, ...loadDrafts()].slice(0,15);
    localStorage.setItem('avp3.drafts', JSON.stringify(arr));
    currentDraftId=id;
    renderDrafts(); toastMsg('Utkast sparat');
  }
  function loadDrafts(){ try{return JSON.parse(localStorage.getItem('avp3.drafts')||'[]');}catch(e){return[];} }
  function renderDrafts(){
    const drafts=loadDrafts();
    if(drafts.length===0){ draftList.innerHTML='<div class="draft-meta">Inga utkast ännu</div>'; return; }
    draftList.innerHTML='';
    drafts.forEach(d=>{
      const cover=d.thumbs && d.thumbs[0] ? d.thumbs[0].src : null;
      const wrap=document.createElement('div'); wrap.className='draft-item';
      wrap.innerHTML=`
        <div class="draft-cover">${cover?`<img src="${cover}" alt="Omslag">`:'<span style="color:#AEB8C7">—</span>'}</div>
        <div class="draft-main">
          <div class="title"><span>${esc(d.title||'Utkast')}</span> <span class="badge ${d.status||'draft'}">${labelForStatus(d.status)}</span></div>
          <div class="snippet">${esc((d.description||'').slice(0,100))}${(d.description||'').length>100?'…':''}</div>
          <div class="draft-meta">${new Date(d.date).toLocaleString('sv-SE')}</div>
        </div>
        <div class="draft-actions">
          <button class="pill" data-load="${d.id}">↺ Ladda</button>
          <button class="pill" data-del="${d.id}">Ta bort</button>
        </div>`;
      draftList.appendChild(wrap);
    });
  }
  draftList.addEventListener('click',e=>{
    const loadId=e.target.getAttribute('data-load'); const delId=e.target.getAttribute('data-del');
    if(loadId){ loadDraft(+loadId); }
    if(delId){ deleteDraft(+delId); }
  });
  function loadDraft(id){
    const d=loadDrafts().find(x=>x.id===id); if(!d)return;
    currentDraftId=id;
    title.value=d.title||''; price.value=d.price||''; condition.value=d.condition||'';
    city&&(city.value=d.city||''); tags.value=d.tags||''; notes&&(notes.value=d.notes||'');
    description.value=d.description||''; thumbs=d.thumbs||[];
    soldFlag=!!d.sold; currentStatus=d.status||'draft';
    Object.keys(state).forEach(k=> state[k] = !!(d.markets && d.markets[k]) );
    saveMarkets(); updateAll(); updateProgress();
    qsa('.complete-btn').forEach(b=> b.toggleAttribute('disabled', soldFlag) );
    renderChips(); renderGallery(); renderPreviewThumbs(); updatePreview(); recalc();
    toastMsg('Utkast laddat');
  }
  function deleteDraft(id){
    const arr=loadDrafts().filter(x=>x.id!==id);
    localStorage.setItem('avp3.drafts', JSON.stringify(arr));
    if(currentDraftId===id) currentDraftId=null;
    renderDrafts(); toastMsg('Utkast borttaget');
  }
  function labelForStatus(s){ return s==='ready'?'Redo': s==='published'?'Publicerad': s==='synkad'?'Synkad': s==='sold'?'Såld':'Utkast'; }

  // Persist helpers for live cover/reorder updates
  function persistThumbsIfDraft(){
    if(!currentDraftId) return;
    const arr=loadDrafts();
    const idx=arr.findIndex(d=>d.id===currentDraftId);
    if(idx>=0){ arr[idx].thumbs = thumbs; localStorage.setItem('avp3.drafts', JSON.stringify(arr)); renderDrafts(); }
  }
  function persistMarketsIfDraft(){
    if(!currentDraftId) return;
    const arr=loadDrafts();
    const idx=arr.findIndex(d=>d.id===currentDraftId);
    if(idx>=0){ arr[idx].markets = state; arr[idx].status=currentStatus; arr[idx].sold=soldFlag; localStorage.setItem('avp3.drafts', JSON.stringify(arr)); renderDrafts(); }
  }

  // Clear all
  on('clear-all','click',()=>{
    title.value=''; price.value=''; condition.value=''; city&&(city.value=''); tags.value=''; notes&&(notes.value=''); description.value='';
    thumbs=[]; renderGallery(); renderPreviewThumbs(); renderChips();
    Object.keys(state).forEach(k=>state[k]=false); saveMarkets(); updateAll(); updateProgress();
    soldFlag=false; currentStatus='draft'; qsa('.complete-btn').forEach(b=>b.removeAttribute('disabled'));
    updatePreview(); recalc(); toastMsg('Rensat'); byId('q-score').textContent='0'; byId('q-suggestions').innerHTML='';
  });

  // Seed a demo draft on first run (disabled by default)
  // seedDemo();
  function seedDemo(){
    const has=loadDrafts().length>0; if(has) { renderDrafts(); return; }
    const placeholder='data:image/svg+xml;base64,'+btoa(`<svg xmlns="http://www.w3.org/2000/svg" width="240" height="180"><rect width="100%" height="100%" fill="#e9eef9"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="Inter" font-size="16" fill="#6b7aa3">Bild</text></svg>`);
    const demo={
      id:Date.now()-12345,
      title:'ASUS Radeon RX 7600XT 16GB', price:'3900', condition:'Som nytt', city:'Stockholm',
      tags:'asus, radeon, 7600xt, 16gb', notes:'Originalkartong, kvitto finns.',
      description:'Stabil och tyst GPU i mycket gott skick. Använd sparsamt och fungerar perfekt. Levereras rengjord.',
      thumbs:[{id:1,src:placeholder,rotation:0}],
      status:'published', sold:false,
      markets:{tradera:true, blocket:false, facebook:true, ebay:false},
      date:new Date().toISOString()
    };
    const arr=[demo]; localStorage.setItem('avp3.drafts', JSON.stringify(arr));
    renderDrafts();
  }

  // Helpers
  function esc(s){return (s||'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));}
  function toastMsg(t){ toast.textContent=t; toast.classList.add('show'); setTimeout(()=>toast.classList.remove('show'),1800); }
  function doc(id){return document.getElementById(id)} function byId(id){return document.getElementById(id)} function qs(s){return document.querySelector(s)} function qsa(s){return Array.from(document.querySelectorAll(s))}
  function on(id,ev,fn){ const el=byId(id); el&&el.addEventListener(ev,fn); }
})();
