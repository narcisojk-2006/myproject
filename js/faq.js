/* ============================================================
   AquaServe — FAQ JS  (static — no Firebase needed)
   ============================================================ */
const faqs = [
  { cat:'pressure', q:'Why is my water pressure low?', a:`Low water pressure can be caused by several factors:<ul><li>High demand during peak hours (early morning / evening)</li><li>A partially closed main valve at your property</li><li>Clogged aerators or showerheads</li><li>A leak in your internal plumbing</li><li>Distribution issues in your area</li></ul><strong>Fix:</strong> Check if your main valve is fully open and clean your faucet aerators. If the problem persists, submit a service request.` },
  { cat:'pressure', q:'My water pressure is fine in the morning but drops at night — why?', a:`This is usually caused by high water usage in your neighborhood during evening hours. If the drop is severe or consistent, contact us — it may indicate a network issue.` },
  { cat:'pressure', q:'How do I check if my pressure is within acceptable levels?', a:`Normal residential water pressure ranges from 40 to 80 PSI. You can purchase a simple pressure gauge and attach it to an outdoor hose bib. If pressure falls below 30 PSI consistently, file a service report.` },
  { cat:'leak', q:'I see water pooling on the street — what should I do?', a:`Street water pooling may indicate a main line leak — a high-priority emergency. Please:<ul><li>Do NOT attempt to dig or repair it yourself</li><li>Keep children and vehicles away from the area</li><li>Call our emergency hotline: (032) 123-4567</li><li>Or submit a Critical priority report</li></ul>` },
  { cat:'leak', q:'How do I check if I have a hidden leak inside my home?', a:`Turn off all fixtures, read your water meter, wait 1–2 hours without using water, then read again. If it changed, you likely have a hidden leak. Common spots: toilet flappers, under-sink pipes, irrigation systems.` },
  { cat:'leak', q:'My toilet keeps running — is that a leak?', a:`Yes — a running toilet can waste up to 200 liters per day. Add food coloring to your tank; if it appears in the bowl without flushing, the flapper needs replacing (a simple ₱100 DIY fix).` },
  { cat:'supply', q:'Why is there no water in my area?', a:`Water supply interruptions may be due to:<ul><li>Scheduled maintenance or pipe replacement</li><li>Emergency repair of a burst main</li><li>Power outages affecting pumping stations</li><li>High consumption exceeding reservoir capacity</li></ul>` },
  { cat:'supply', q:'How long will the water interruption last?', a:`Minor valve replacements typically take 2–4 hours. Major pipe bursts may take 8–24 hours. Track your Request ID for real-time updates.` },
  { cat:'supply', q:'What should I do to prepare for a scheduled interruption?', a:`Store at least 20–30 liters of water per household member in clean containers. Fill bathtubs for toilet flushing. We notify affected areas at least 24 hours in advance.` },
  { cat:'billing', q:'Why is my bill higher than usual this month?', a:`Higher bills are commonly caused by:<ul><li>A hidden leak</li><li>Increased household members or usage</li><li>Irrigation or refilling a pool</li><li>Meter misread</li></ul>` },
  { cat:'billing', q:'How is my water bill calculated?', a:`Your bill consists of:<ul><li><strong>Basic Charge:</strong> ₱85/month</li><li><strong>Consumption Charge:</strong> ₱28.50 per m³</li><li><strong>Environmental Fee:</strong> ₱12/month</li><li><strong>Maintenance Fee:</strong> ₱25/month</li><li><strong>VAT (12%)</strong> on total</li></ul>` },
  { cat:'billing', q:'What happens if I miss my payment due date?', a:`A late payment surcharge of 2% is applied after the due date. After 30 days unpaid, a disconnection notice may be issued. Contact our billing office to arrange a payment extension.` },
  { cat:'billing', q:'How do I dispute a billing error?', a:`Submit a billing concern through the Report Issue page. Include your account number, the disputed amount, and supporting details. Our team responds within 3–5 business days.` },
  { cat:'meter', q:'How do I read my water meter?', a:`Read the numbers left to right, ignoring red-colored digits. The reading is in cubic meters (m³). To calculate monthly usage, subtract last month's reading from this month's. Normal household: 8–20 m³/month.` },
  { cat:'meter', q:'I think my meter is running too fast — what should I do?', a:`Turn off all fixtures and watch the meter for 10–15 minutes. If the dial is moving, you have a leak — not a faulty meter. If you've ruled out leaks, request an official meter test through the Report Issue page.` },
  { cat:'quality', q:'Why does my tap water look cloudy or milky?', a:`Cloudy water is usually caused by tiny air bubbles — harmless. Fill a glass and wait; if it clears from the bottom up, it's just air. If color persists (brown, yellow), stop using it and report immediately.` },
  { cat:'quality', q:'My water smells like chlorine — is it safe?', a:`Yes. Chlorine is a regulated disinfectant and is safe at normal levels. If the smell is unusually strong or accompanied by odd taste, report it so we can check chlorine levels in your area.` },
  { cat:'quality', q:'There is brown or rust-colored water from my tap — what should I do?', a:`<strong>Do not drink or cook with this water.</strong> Run the cold tap 2–3 minutes. If it clears, the issue is likely in your internal pipes. If it doesn't, report it as a water quality issue immediately.` },
];

let activeCategory = 'all';
let searchQuery    = '';

function renderFAQs() {
  const grid     = document.getElementById('faqGrid');
  const filtered = faqs.filter(f =>
    (activeCategory === 'all' || f.cat === activeCategory) &&
    (f.q.toLowerCase().includes(searchQuery) || f.a.toLowerCase().includes(searchQuery))
  );
  if (!filtered.length) {
    grid.innerHTML = `<div class="no-results">😕 No results found for "<strong>${searchQuery || activeCategory}</strong>"<br/><small style="margin-top:8px;display:block;">Try a different search term or category.</small></div>`;
    return;
  }
  grid.innerHTML = filtered.map((f, i) => `
    <div class="faq-item" data-index="${i}">
      <div class="faq-question" onclick="toggleFAQ(this)">
        <span>${f.q}</span>
        <span class="faq-toggle">+</span>
      </div>
      <div class="faq-answer"><div class="faq-answer-inner">${f.a}</div></div>
    </div>`).join('');
}

function toggleFAQ(el) {
  const item   = el.closest('.faq-item');
  const isOpen = item.classList.contains('open');
  document.querySelectorAll('.faq-item.open').forEach(i => i.classList.remove('open'));
  if (!isOpen) item.classList.add('open');
}

document.querySelectorAll('.cat-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.cat-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    activeCategory = btn.dataset.cat;
    renderFAQs();
  });
});

document.getElementById('faqSearch')?.addEventListener('input', (e) => {
  searchQuery = e.target.value.toLowerCase();
  renderFAQs();
});

window.toggleFAQ = toggleFAQ;
renderFAQs();
