// scripts.js
const API_BASE = 'https://annonsv-n.onrender.com';

async function generateDescription(style, e) {
    try {
        if (e && e.preventDefault) e.preventDefault();

        const titleEl = document.getElementById('title');
        const priceEl = document.getElementById('price');
        const condEl  = document.getElementById('condition');
        const descEl  = document.getElementById('description');

        const title = titleEl?.value?.trim();
        const price = priceEl?.value?.trim();
        const condValue = condEl?.value;
        const condText  = condEl?.options[condEl.selectedIndex]?.text;

        if (!title || !price || !condValue) {
            showNotification('Fyll i titel, pris och skick först!');
            return;
        }

        console.log('[AI] Sending request to backend…', { style, title, price, condText });
        showNotification('Genererar beskrivning…');

        const res = await fetch(`${API_BASE}/generate-description`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                style,
                title,
                condition: condText,
                price
            })
        });

        console.log('[AI] Response status:', res.status);
        if (!res.ok) {
            const text = await res.text();
            console.error('[AI] Non-OK response:', res.status, text);
            throw new Error(`Backend svarade ${res.status}: ${text}`);
        }

        const data = await res.json();
        console.log('[AI] Parsed data:', data);

        const generated = data?.description || data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!generated) {
            throw new Error('Tomt svar från AI (saknar description).');
        }

        descEl.value = generated;
        showNotification(`Beskrivning genererad (${style})`);
    } catch (err) {
        console.error('[AI] Error:', err);
        showNotification('AI-generering misslyckades. Kolla konsolen (F12).');
    }
}

// Example notification function placeholder
function showNotification(msg) {
    const status = document.getElementById("status");
    if (status) {
        status.textContent = msg;
    } else {
        alert(msg);
    }
}
