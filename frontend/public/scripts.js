// ======== CONFIG ========
const BACKEND =
  (document.querySelector('meta[name="backend"]')?.content || '').replace(/\/+$/, ''); // strip trailing slash

// ======== UI HOOKS ========
function notify(msg) {
  let n = document.getElementById('notification');
  let t = document.getElementById('notification-text');
  if (!n || !t) return alert(msg);
  t.textContent = msg;
  n.classList.add('show');
  setTimeout(() => n.classList.remove('show'), 3000);
}

function cleanText(s) {
  return (s || '').toString().replace(/[^\n\r\t\u0020-\u007EåäöÅÄÖ.,;:!?()\-0-9A-Za-z]/g, '');
}

// ======== AI GENERATION ========
async function generateDescription(style) {
  try {
    const title = document.getElementById('title').value.trim();
    const price = document.getElementById('price').value.trim();
    const condSel = document.getElementById('condition');
    const condition = condSel.options[condSel.selectedIndex]?.text || '';

    if (!title || !price || !condition) {
      notify('Fyll i titel, pris och skick först!');
      return;
    }

    // Button state
    const btn = event.currentTarget;
    const oldHtml = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Genererar…';

    // Call backend proxy
    const r = await fetch(`${BACKEND}/generate-description`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        style,
        title: cleanText(title),
        condition: cleanText(condition),
        price: cleanText(price)
      })
    });

    if (!r.ok) {
      const txt = await r.text().catch(() => '');
      console.error('API 500:', txt);
      notify('Kunde inte nå AI. Använder lokal mall.');
      // Fallback
      document.getElementById('description').value =
        `${title} i ${condition} skick. Pris: ${price} SEK.`;
      return;
    }

    const data = await r.json();
    document.getElementById('description').value = (data.description || '').trim();
    notify(`Beskrivning genererad (${style})`);
  } catch (e) {
    console.error(e);
    notify('Något gick fel – använde lokal mall.');
  } finally {
    if (event?.currentTarget) {
      event.currentTarget.disabled = false;
      event.currentTarget.innerHTML = '<i class="fas fa-robot"></i> AI';
    }
  }
}

// ======== COPY BUTTONS ========
function copyToClipboard(text, msg) {
  navigator.clipboard.writeText(text).then(
    () => notify(msg || 'Kopierat!'),
    err => notify('Kunde inte kopiera: ' + err)
  );
}

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.copy-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-copy');
      let text = '';
      if (id === 'title') text = document.getElementById('title').value;
      if (id === 'description') text = document.getElementById('description').value;
      if (id === 'price') text = document.getElementById('price').value + ' SEK';
      if (id === 'tags') text = document.getElementById('tags').value;
      if (!text) return notify('Fyll i fältet först!');
      copyToClipboard(text);
    });
  });
});

// Expose for inline onclick handlers in HTML
window.generateDescription = generateDescription;
