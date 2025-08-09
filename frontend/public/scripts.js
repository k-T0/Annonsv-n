// ======== BOOT ========
console.log('AVP scripts loaded (MVP + fixes)');

// ======== CONFIG ========
const BACKEND = (document.querySelector('meta[name="backend"]')?.content || '').replace(/\/+$/, '');

// ======== UTIL ========
function notify(msg) {
  const n = document.getElementById('notification');
  const t = document.getElementById('notification-text');
  if (!n || !t) return alert(msg);
  t.textContent = msg;
  n.classList.add('show');
  setTimeout(() => n.classList.remove('show'), 2200);
}

// Remove markdown, emojis, and odd formatting; keep plain text suitable for marketplaces
function stripMarkdownEmoji(s = '') {
  // Markdown-ish
  s = s.replace(/(^|\s)#{1,6}\s*/g, '$1');       // headings
  s = s.replace(/[*_]{1,3}([^*_]+)[*_]{1,3}/g, '$1'); // bold/italic
  s = s.replace(/`{1,3}[^`]*`{1,3}/g, '');      // inline code
  s = s.replace(/^\s*[-*•]\s+/gm, '');          // bullets
  s = s.replace(/\[(.*?)\]\((.*?)\)/g, '$1');   // links
  // Emojis/symbols (Unicode property escapes)
  try { s = s.replace(/[\p{Extended_Pictographic}\p{Emoji_Presentation}]/gu, ''); } catch {}
  // Collapse spaces/newlines
  s = s.replace(/[ \t]+\n/g, '\n').replace(/\n{3,}/g, '\n\n');
  return s.trim();
}

// Keep only safe characters incl. Swedish letters + common punctuation
function cleanText(s) {
  return (s || '').toString().replace(/[^\n\r\t\u0020-\u007EåäöÅÄÖ.,;:!?()\-0-9A-Za-z]/g, '');
}

async function callAI({ style, title, condition, price }) {
  const res = await fetch(`${BACKEND}/generate-description`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ style, title, condition, price })
  });
  if (!res.ok) {
    const txt = await res.text().catch(() => '');
    throw new Error(`API ${res.status}: ${txt}`);
  }
  return res.json();
}

// ======== FORM HELPERS ========
function getFormData() {
  const condSel = document.getElementById('condition');
  const condition = condSel?.options?.[condSel.selectedIndex]?.text || '';
  return {
    title: document.getElementById('title').value.trim(),
    price: document.getElementById('price').value.trim(),
    condition,
    description: document.getElementById('description').value,
    tags: document.getElementById('tags').value
  };
}
function setFormData(data = {}) {
  document.getElementById('title').value = data.title || '';
  document.getElementById('price').value = data.price || '';
  const condSel = document.getElementById('condition');
  if (condSel) {
    // Try to match by visible text
    const txt = data.condition || '';
    let idx = 0;
    for (let i = 0; i < condSel.options.length; i++) {
      if (condSel.options[i].text === txt) { idx = i; break; }
    }
    condSel.selectedIndex = idx;
  }
  document.getElementById('description').value = data.description || '';
  document.getElementById('tags').value = data.tags || '';
}
function resetForm() {
  setFormData({ title: '', price: '', condition: '', description: '', tags: '' });
}

// ======== AI ACTION ========
async function handleGenerate(style, btnEl) {
  try {
    const { title, price, condition } = getFormData();
    if (!title || !price || !condition) {
      notify('Fyll i titel, pris och skick först!');
      return;
    }
    // Button state
    if (btnEl) {
      btnEl.dataset.old = btnEl.innerHTML;
      btnEl.disabled = true;
      btnEl.innerHTML = '⏳ Genererar…';
    }
    // Try backend
    let description = '';
    try {
      const data = await callAI({
        style,
        title: cleanText(title),
        condition: cleanText(condition),
        price: cleanText(price)
      });
      description = (data.description || '').trim();
    } catch (apiErr) {
      console.warn('AI proxy failed, falling back:', apiErr);
      description = `${title} i ${condition} skick. Pris: ${price} SEK.`; // local fallback
      notify('Kunde inte nå AI. Använder lokal mall.');
    }
    // Sanitize aggressively for marketplaces
    description = stripMarkdownEmoji(description);
    description = cleanText(description);
    document.getElementById('description').value = description;
    notify(`Beskrivning genererad (${style})`);
  } finally {
    if (btnEl) {
      btnEl.disabled = false;
      btnEl.innerHTML = btnEl.dataset.old || btnEl.innerHTML;
    }
  }
}

// ======== CLIPBOARD ========
function copyToClipboard(text, msg) {
  navigator.clipboard.writeText(text).then(
    () => notify(msg || 'Kopierat!'),
    err => notify('Kunde inte kopiera: ' + err)
  );
}

// ======== DRAFTS (localStorage) ========
const LS_KEYS = {
  CURRENT: 'avp.currentDraft',
  DRAFTS: 'avp.savedDrafts'
};

function autoSave() {
  const data = getFormData();
  const hasAny = data.title || data.price || data.description || data.tags || (data.condition && data.condition !== 'Välj skick');
  if (!hasAny) return;
  try {
    localStorage.setItem(LS_KEYS.CURRENT, JSON.stringify({ ...data, ts: Date.now() }));
    // Quiet autosave (no toast spam)
  } catch (e) {
    console.warn('Autosave failed', e);
  }
}

function manualSave() {
  const data = getFormData();
  if (!data.title || !data.price || !data.condition) {
    return notify('Titel, pris och skick krävs för att spara.');
  }
  const drafts = JSON.parse(localStorage.getItem(LS_KEYS.DRAFTS) || '[]');
  const id = Date.now();
  drafts.unshift({ id, ...data, ts: id });
  localStorage.setItem(LS_KEYS.DRAFTS, JSON.stringify(drafts));
  notify('Utkast sparat lokalt');
}

// ======== CLEAR ========
function clearAll() {
  if (!confirm('Rensa alla fält? Sparade utkast påverkas inte.')) return;
  resetForm();
  try { localStorage.removeItem(LS_KEYS.CURRENT); } catch {}
  notify('Formuläret rensat');
}

// ======== MARKETPLACE COPY FORMATS ========
function buildForMarket(market) {
  const { title, price, condition, description, tags } = getFormData();
  const desc = stripMarkdownEmoji(description);
  const tagline = (tags || '').trim();
  if (!title || !price || !condition || !desc) {
    notify('Fyll i titel, pris, skick och beskrivning först.');
    return '';
  }
  switch (market) {
    case 'tradera':
      return `${title}\n\n${desc}\n\nSkick: ${condition}\nUtgångspris: ${price} SEK\nTaggar: ${tagline}`;
    case 'blocket':
      return `${title} – ${price} SEK\n\n${desc}\n\nSkick: ${condition}\nTaggar: ${tagline}`;
    case 'facebook':
      return `${title}\n${price} SEK\n\n${desc}\n\nTaggar: ${tagline}`;
    case 'ebay':
      return `${title} [${condition}]\n\n${desc}\n\nPrice: ${price} SEK\nTags: ${tagline}`;
    default:
      return `${title}\n${desc}\nPris: ${price} SEK\nSkick: ${condition}\n${tagline}`;
  }
}

// ======== EVENTS ========
document.addEventListener('click', (e) => {
  const aiBtn = e.target.closest('.ai-btn');
  if (aiBtn) {
    const style = aiBtn.dataset.style || 'simple';
    handleGenerate(style, aiBtn);
    return;
  }

  const copyBtn = e.target.closest('.copy-btn');
  if (copyBtn) {
    const id = copyBtn.getAttribute('data-copy');
    let text = '';
    if (id === 'title') text = document.getElementById('title').value;
    if (id === 'description') text = stripMarkdownEmoji(document.getElementById('description').value);
    if (id === 'price') text = document.getElementById('price').value + ' SEK';
    if (id === 'tags') text = document.getElementById('tags').value;
    text = (id === 'description') ? cleanText(text) : text;
    if (!text) return notify('Fyll i fältet först!');
    copyToClipboard(text);
    return;
  }

  const marketBtn = e.target.closest('[data-market]');
  if (marketBtn) {
    const market = marketBtn.getAttribute('data-market');
    const payload = buildForMarket(market);
    if (payload) copyToClipboard(payload, `Format för ${market} kopierat`);
    return;
  }

  if (e.target.id === 'save-draft') {
    manualSave();
    return;
  }
  if (e.target.id === 'clear-all') {
    clearAll();
    return;
  }
});

// ======== STARTUP ========
document.addEventListener('DOMContentLoaded', () => {
  // Always start with a clean form unless the user chooses to load a draft later
  resetForm();

  // Sanity check backend URL
  if (!BACKEND) {
    console.warn('No BACKEND meta configured. AI will always fallback.');
  }

  // Autosave every 2 minutes
  setInterval(autoSave, 120000);
});
