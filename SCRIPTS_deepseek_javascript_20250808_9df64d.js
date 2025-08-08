// ========== AUTO-SAVE SYSTEM ========== 
let formChanged = false;

// Track form changes
document.querySelectorAll('input, textarea, select').forEach(element => {
  element.addEventListener('input', () => formChanged = true);
});

// Auto-save every 30 seconds
setInterval(() => {
  if (formChanged) {
    saveDraft();
    showNotification('Utkast sparad automatiskt');
    formChanged = false;
  }
}, 30000);

function saveDraft() {
  const adData = {
    title: document.getElementById('title').value,
    price: document.getElementById('price').value,
    condition: document.getElementById('condition').value,
    description: document.getElementById('description').value,
    tags: document.getElementById('tags').value,
    marketplaceProgress: {...marketplaceState}
  };
  
  localStorage.setItem('currentDraft', JSON.stringify(adData));
}

// Load draft on page load
document.addEventListener('DOMContentLoaded', () => {
  const savedDraft = localStorage.getItem('currentDraft');
  if (savedDraft) {
    const draft = JSON.parse(savedDraft);
    document.getElementById('title').value = draft.title || '';
    document.getElementById('price').value = draft.price || '';
    document.getElementById('condition').value = draft.condition || '';
    document.getElementById('description').value = draft.description || '';
    document.getElementById('tags').value = draft.tags || '';
    
    // Update marketplace progress
    Object.keys(draft.markplaceProgress || {}).forEach(market => {
      marketplaceState[market].completed = draft.marketplaceProgress[market].completed;
      updateMarketplaceUI(market);
    });
    
    renderTags((draft.tags || '').split(',').map(t => t.trim()));
  }
});

// ========== CLEAR ALL FUNCTIONALITY ========== 
function clearAll() {
  if (confirm("Är du säker på att du vill rensa allt? Osparade ändringar kommer att förloras.")) {
    // Reset form fields
    document.getElementById('title').value = '';
    document.getElementById('description').value = '';
    document.getElementById('price').value = '';
    document.getElementById('tags').value = '';
    document.getElementById('condition').selectedIndex = 0;
    document.getElementById('photo-preview-container').innerHTML = '';
    
    // Reset marketplace progress
    Object.keys(marketplaceState).forEach(market => {
      marketplaceState[market].completed = false;
      updateMarketplaceUI(market);
    });
    
    // Clear current draft
    localStorage.removeItem('currentDraft');
    formChanged = false;
    
    showNotification('Allt har rensats');
  }
}

// Add clear button to UI
const clearButton = document.createElement('button');
clearButton.className = 'btn secondary';
clearButton.innerHTML = '<i class="fas fa-trash"></i> Rensa Allt';
clearButton.onclick = clearAll;
document.querySelector('.btn-group').prepend(clearButton);

// ========== MARKETPLACE FORMATTING ========== 
function formatForMarketplace(marketplace) {
  const title = document.getElementById('title').value;
  const description = document.getElementById('description').value;
  
  // Clean description text
  const cleanDescription = description
    .replace(/\*\*/g, '') // Remove bold
    .replace(/\*/g, '')   // Remove italics
    .replace(/[^\w\s.,-:;()åäöÅÄÖ]/g, '') // Remove emojis/special chars
    .trim();
  
  // Platform-specific formats
  switch(marketplace) {
    case 'tradera':
      return `${title}\n\n${cleanDescription}`;
      
    case 'blocket':
      return `${title}\n${cleanDescription}`;
      
    case 'facebook':
      return `${title}\n${cleanDescription}`;
      
    case 'ebay':
      return `${title} - ${cleanDescription}`;
      
    default:
      return `${title}\n${cleanDescription}`;
  }
}

// Update existing openMarketplace function
function openMarketplace(marketplace) {
  // ... existing code ...
  
  // Copy formatted content
  const content = formatForMarketplace(marketplace);
  copyToClipboard(content, `Innehåll för ${marketplace} kopierat!`);
  
  // ... existing code ...
}

// ========== GEMINI API INTEGRATION ========== 
async function generateDescription(style) {
  const title = document.getElementById('title').value;
  const price = document.getElementById('price').value;
  const condition = document.getElementById('condition').value;
  
  if (!title || !price || !condition) {
    showNotification('Fyll i titel, pris och skick först!');
    return;
  }
  
  try {
    // Show loading state
    const generateBtn = event.target;
    const originalHTML = generateBtn.innerHTML;
    generateBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Genererar...';
    generateBtn.disabled = true;
    
    // Call backend API
    const response = await fetch('/generate-description', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        style, 
        title, 
        condition: document.querySelector(`#condition option[value="${condition}"]`).text,
        price 
      })
    });
    
    const data = await response.json();
    
    // Update description field
    document.getElementById("description").value = data.description;
    showNotification(`Beskrivning genererad (${style})`);
    formChanged = true;
    
  } catch (error) {
    console.error("API Error:", error);
    // Fallback to local templates
    const conditionText = document.querySelector(`#condition option[value="${condition}"]`).text;
    const description = generateWithLocalAI(style, title, price, conditionText);
    document.getElementById("description").value = description;
    showNotification("Generering misslyckades. Använde lokal mall.");
  } finally {
    // Reset button state
    generateBtn.innerHTML = originalHTML;
    generateBtn.disabled = false;
  }
}