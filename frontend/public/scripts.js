// ======== BOOT ========
console.log('AVP scripts loaded');

// ======== CONFIG ========
const BACKEND =
  (document.querySelector('meta[name="backend"]')?.content || '').replace(/\/+$/, '');

// ======== UTIL ========
function notify(msg) {
  const n = document.getElementById('notification');
  const t = document.getElementById('notification-text');
  if (!n || !t) return alert(msg);
  t.textContent = msg;
  n.classList.add('show');
  setTimeout(() => n.classList.remove('show'), 2500);
}

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

// ======== MAIN ACTIONS ========
async function handleGenerate(style, btnEl) {
  try {
    const title = document.getElementById('title').value.trim();
    const price = document.getElementById('price').value.trim();
    const condSel = document.getElementById('condition');
    const condition = condSel?.options?.[condSel.selectedIndex]?.text || '';

    if (!title || !price || !condition) {
      notify('Fyll i titel, pris och skick först!');
      return;
    }

    // Button state
    if (btnEl) {
      btnEl.dataset.old = btnEl.innerHTML;
      btnEl.disabled = true;
      btnEl.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Genererar…';
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
      // Fallback template
      description = `${title} i ${condition} skick. Pris: ${price} SEK.`;
      notify('Kunde inte nå AI. Använder lokal mall.');
    }

    document.getElementById('description').value = description;
    if (!description.includes('Använder lokal mall.')) notify(`Beskrivning genererad (${style})`);
  } finally {
    if (btnEl) {
      btnEl.disabled = false;
      btnEl.innerHTML = btnEl.dataset.old || btnEl.innerHTML;
    }
  }
}

function copyToClipboard(text, msg) {
  navigator.clipboard.writeText(text).then(
    () => notify(msg || 'Kopierat!'),
    err => notify('Kunde inte kopiera: ' + err)
  );
}

// ======== EVENT DELEGATION (no inline onclick needed) ========
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
    if (id === 'description') text = document.getElementById('description').value;
    if (id === 'price') text = document.getElementById('price').value + ' SEK';
    if (id === 'tags') text = document.getElementById('tags').value;
    if (!text) return notify('Fyll i fältet först!');
    copyToClipboard(text);
  }
});

// ======== STARTUP CHECKS ========
document.addEventListener('DOMContentLoaded', () => {
  // Quick sanity check the backend URL
  if (!BACKEND) {
    console.warn('No BACKEND meta configured. AI will always fallback.');
  } else {
    // optional: warm-up ping
    fetch(`${BACKEND}/health`).catch(() => {});
  }
});
