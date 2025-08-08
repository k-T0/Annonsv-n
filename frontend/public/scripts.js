// ===== STEP 1: AI buttons call backend, show spinner, handle errors =====

// Read backend base URL from <meta name="annonsvan-backend">
function getBackendBase() {
  const meta = document.querySelector('meta[name="annonsvan-backend"]');
  const url = meta?.getAttribute('content')?.trim() || '';
  // No trailing slash allowed
  return url.replace(/\/+$/, '');
}

const BACKEND = getBackendBase();

// Small toast
function toast(msg, ok = true) {
  const el = document.getElementById('toast');
  if (!el) return;
  el.textContent = msg;
  el.style.background = ok ? '#333' : '#c0392b';
  el.classList.add('show');
  window.clearTimeout(el._timer);
  el._timer = setTimeout(() => el.classList.remove('show'), 2500);
}

// Strip markdown + emojis -> plain text for marketplaces
function toPlainText(str) {
  if (!str) return '';
  // remove markdown **bold**, *italic*, headings, links
  let s = str
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\*(.*?)\*/g, '$1')
    .replace(/#+\s?(.*)/g, '$1')
    .replace(/\[(.*?)\]\((.*?)\)/g, '$1');

  // remove emojis / non-basic chars (keep ÅÄÖ åäö)
  s = s.replace(/[^\n\r\t A-Za-z0-9.,:;!?()\-_'’"åäöÅÄÖ]/g, '');

  // collapse extra spaces
  s = s.replace(/[ \t]+/g, ' ').replace(/\n{3,}/g, '\n\n').trim();
  return s;
}

// Fallback generator if API fails
function localTemplate(style, title, price, conditionText) {
  switch (style) {
    case 'minimal':
      return `${title} i ${conditionText} skick. Fungerar bra. Pris: ${price} SEK.`;
    case 'simple':
      return `Säljer ${title} i ${conditionText} skick.\n\nFungerar som den ska och är väl omhändertagen.\n\nPris: ${price} SEK.`;
    case 'detailed':
      return `${title} — ${conditionText}\n\nVälskött produkt med stabil prestanda. Levereras rengjord och redo att användas.\n\nPris: ${price} SEK.`;
    default:
      return `${title} i ${conditionText} skick. Pris: ${price} SEK.`;
  }
}

// Wire AI buttons
function initAI() {
  const buttons = Array.from(document.querySelectorAll('.ai-btn'));
  buttons.forEach(btn => {
    btn.addEventListener('click', async (ev) => {
      const style = btn.getAttribute('data-style');
      const title = document.getElementById('title').value.trim();
      const price = document.getElementById('price').value.trim();
      const conditionSel = document.getElementById('condition');
      const conditionVal = conditionSel.value;
      const conditionText = conditionSel.options[conditionSel.selectedIndex]?.text || '';

      // field validation
      if (!title || !price || !conditionVal) {
        toast('Fyll i titel, pris och skick först!', false);
        return;
      }

      // UI state
      buttons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const original = btn.innerHTML;
      btn.disabled = true;
      btn.innerHTML = `<span class="spinner"></span>Genererar…`;

      try {
        if (!BACKEND) throw new Error('Ingen backend-URL hittad i <meta name="annonsvan-backend">');

        // Abort after 25s
        const ac = new AbortController();
        const t = setTimeout(() => ac.abort(), 25000);

        const res = await fetch(`${BACKEND}/generate-description`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            style,
            title,
            condition: conditionText,
            price
          }),
          signal: ac.signal
        });

        clearTimeout(t);

        if (!res.ok) {
          const text = await res.text().catch(() => '');
          throw new Error(`API ${res.status}: ${text || 'Fel vid generering'}`);
        }

        const data = await res.json().catch(() => ({}));
        const raw = data?.description || data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
        const clean = toPlainText(raw || localTemplate(style, title, price, conditionText));

        document.getElementById('description').value = clean;
        toast(`Beskrivning genererad (${style})`);
      } catch (err) {
        // fallback
        const fallback = localTemplate(style, title, price, conditionText);
        document.getElementById('description').value = fallback;
        console.error(err);
        toast('Kunde inte nå AI. Använder lokal mall.', false);
      } finally {
        btn.innerHTML = original;
        btn.disabled = false;
      }
    });
  });
}

document.addEventListener('DOMContentLoaded', () => {
  initAI();
  // OPTIONAL: small example prefill so the button works instantly
  if (!document.getElementById('title').value) {
    document.getElementById('title').value = 'ASUS Radeon RX 7600XT 16GB';
  }
  if (!document.getElementById('price').value) {
    document.getElementById('price').value = '2850';
  }
  if (!document.getElementById('condition').value) {
    document.getElementById('condition').value = 'good';
  }
});
