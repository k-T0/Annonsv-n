// --- helpers ---
const $ = sel => document.querySelector(sel);
const $$ = sel => document.querySelectorAll(sel);

function toast(msg) {
  const el = $("#toast");
  el.textContent = msg;
  el.classList.add("show");
  clearTimeout(el._t);
  el._t = setTimeout(() => el.classList.remove("show"), 2200);
}

// Strip emojis + markdown-like chars
function cleanText(s='') {
  return s
    // remove emojis & symbols (broad but safe for SE marketplaces)
    .replace(/([\u2700-\u27BF]|[\uE000-\uF8FF]|[\uD800-\uDBFF][\uDC00-\uDFFF]|[\u2600-\u26FF]|[\u2190-\u21FF]|[\u2300-\u23FF]|[\u25A0-\u25FF]|[\u2800-\u28FF])/g, '')
    // remove markdown chars
    .replace(/[*_~`>#]/g, '')
    .replace(/[^\S\r\n]+/g, ' ') // collapse weird spaces
    .trim();
}

// --- draft (manual + autosave) ---
const DRAFT_KEY = "avp_current_draft";

function readForm() {
  return {
    title: $("#title").value || "",
    price: $("#price").value || "",
    condition: $("#condition").value || "",
    description: $("#description").value || "",
    tags: $("#tags").value || "",
    marketplaceProgress: JSON.parse(localStorage.getItem("avp_market_progress")||"{}")
  };
}

function writeForm(d) {
  $("#title").value = d.title || "";
  $("#price").value = d.price || "";
  $("#condition").value = d.condition || "";
  $("#description").value = d.description || "";
  $("#tags").value = d.tags || "";
}

function saveDraft(manual=false){
  const data = readForm();
  localStorage.setItem(DRAFT_KEY, JSON.stringify(data));
  if(manual) toast("Utkast sparat.");
  localStorage.setItem("avp_last_draft_id", Date.now().toString());
}

function loadDraft(){
  const raw = localStorage.getItem(DRAFT_KEY);
  if(!raw) return;
  try { writeForm(JSON.parse(raw)); } catch {}
}

// autosave
let dirty=false;
$$("input, textarea, select").forEach(el=>{
  el.addEventListener("input", ()=>{ dirty=true; });
});
setInterval(()=>{
  if(dirty){
    saveDraft(false);
    toast("Utkast sparad automatiskt");
    dirty=false;
  }
}, 30000);

// --- clear all ---
$("#clearBtn").addEventListener("click", ()=>{
  if(confirm("Är du säker på att du vill rensa allt? Osparade ändringar försvinner.")){
    $("#title").value="";
    $("#price").value="";
    $("#condition").value="";
    $("#description").value="";
    $("#tags").value="";
    localStorage.removeItem(DRAFT_KEY);
    toast("Allt rensat.");
  }
});

// --- copy raw per marketplace (plain text only) ---
function copyFor(market){
  const t = $("#title").value.trim();
  const p = $("#price").value.trim();
  const c = $("#condition").options[$("#condition").selectedIndex]?.text || "";
  const d = cleanText($("#description").value);
  const tags = cleanText($("#tags").value);

  let out = "";
  switch(market){
    case "tradera":
      out = `${t}\n\n${d}\n\nPris: ${p} SEK\nSkick: ${c}${tags?`\nTaggar: ${tags}`:''}`; break;
    case "blocket":
      out = `${t} - ${p} kr\n\n${d}\n\nSkick: ${c}${tags?`\nTaggar: ${tags}`:''}`; break;
    case "facebook":
      out = `${t}\n${p} kr\n\n${d}${tags?`\nTaggar: ${tags}`:''}`; break;
    case "ebay":
      out = `${t} [${c}]\n\n${d}\n\nPrice: ${p} SEK${tags?`\nTags: ${tags}`:''}`; break;
    default:
      out = `${t}\n\n${d}`;
  }

  navigator.clipboard.writeText(out).then(()=> toast(`Kopierat för ${market}.`));
}

// buttons
$$(".market-buttons button").forEach(b=>{
  b.addEventListener("click", ()=> copyFor(b.dataset.market));
});

// inline copy buttons
$$(".icon").forEach(btn=>{
  btn.addEventListener("click", ()=>{
    const id = btn.getAttribute("data-copy");
    const el = document.getElementById(id);
    const val = id === "description" ? cleanText(el.value) : (el.value || "");
    navigator.clipboard.writeText(val).then(()=> toast("Kopierat."));
  });
});

// --- AI generation ---
async function generateDescription(style) {
    const title = document.getElementById("title").value;
    const price = document.getElementById("price").value;
    const condition = document.getElementById("condition").value;

    const status = document.getElementById("status");
    status.textContent = "Generating AI description...";
    
    try {
        const res = await fetch("/api/generate-description", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ style, title, condition, price })
        });

        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const data = await res.json();
        if (data.description) {
            document.getElementById("description").value = data.description;
            status.textContent = "Description generated successfully.";
        } else {
            throw new Error("No description returned.");
        }

    } catch (err) {
        console.error(err);
        status.textContent = "Error generating description. Please try again.";
    }

    setTimeout(() => status.textContent = "", 4000);
}

// init
window.addEventListener("DOMContentLoaded", ()=>{
  // fresh start but offer restore
  const hasAuto = localStorage.getItem(DRAFT_KEY);
  if(hasAuto){
    if(confirm("Hittade ett utkast. Vill du återställa det?")){
      loadDraft();
    } else {
      localStorage.removeItem(DRAFT_KEY);
    }
  }
});
