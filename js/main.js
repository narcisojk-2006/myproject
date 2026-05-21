/* ============================================================
   AquaServe — Main JavaScript (Firebase edition)
   ============================================================ */

// ── Navbar scroll effect ──
const navbar = document.getElementById('navbar');
if (navbar) {
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 20);
  });
}

// ── Mobile hamburger ──
const hamburger = document.getElementById('hamburger');
const navLinks  = document.getElementById('navLinks');
if (hamburger && navLinks) {
  hamburger.addEventListener('click', () => navLinks.classList.toggle('open'));
  document.addEventListener('click', (e) => {
    if (!hamburger.contains(e.target) && !navLinks.contains(e.target))
      navLinks.classList.remove('open');
  });
}

// ── Active nav link ──
(function () {
  const page = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a').forEach(link => {
    link.classList.toggle('active', link.getAttribute('href') === page);
  });
})();

// ── Scroll reveal ──
const revealStyle = document.createElement('style');
revealStyle.textContent = '.rev { opacity:0; transform:translateY(24px); transition:opacity .5s ease, transform .5s ease; } .rev.visible { opacity:1; transform:translateY(0); }';
document.head.appendChild(revealStyle);

const revealObs = new IntersectionObserver((entries) => {
  entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); revealObs.unobserve(e.target); } });
}, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

document.querySelectorAll('.step-card,.feature-card,.testimonial-card,.priority-card,.faq-item,.stat-card,.kpi-card,.worker-card').forEach((el, i) => {
  el.classList.add('rev');
  el.style.transitionDelay = `${(i % 6) * 0.07}s`;
  revealObs.observe(el);
});

// ── Toast ──
function showToast(message, type = 'default', duration = 4000) {
  let container = document.querySelector('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  const icons = { success: '✓', error: '✕', default: 'ℹ' };
  toast.innerHTML = `<span style="font-weight:700">${icons[type] || 'ℹ'}</span><span>${message}</span>`;
  container.appendChild(toast);
  setTimeout(() => {
    toast.style.transition = 'all .3s ease';
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(100%)';
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

// ── Upload drag & drop ──
document.querySelectorAll('.upload-area').forEach(area => {
  const input = area.querySelector('input[type="file"]');
  area.addEventListener('click', (e) => { if (e.target !== input) input?.click(); });
  area.addEventListener('dragover',  e => { e.preventDefault(); area.classList.add('dragover'); });
  area.addEventListener('dragleave', () => area.classList.remove('dragover'));
  area.addEventListener('drop', e => {
    e.preventDefault(); area.classList.remove('dragover');
    if (e.dataTransfer.files[0] && input) { handleFilePreview(area, e.dataTransfer.files[0]); }
  });
  input?.addEventListener('change', () => { if (input.files[0]) handleFilePreview(area, input.files[0]); });
});

function handleFilePreview(area, file) {
  area.querySelector('.file-preview')?.remove();
  const preview = document.createElement('div');
  preview.className = 'file-preview';
  preview.style.cssText = 'margin-top:12px;font-size:13px;color:#1677ff;font-weight:500;';
  preview.textContent = `📎 ${file.name}`;
  if (file.type.startsWith('image/')) {
    const img = document.createElement('img');
    img.style.cssText = 'max-height:80px;border-radius:8px;margin-top:8px;display:block;';
    img.src = URL.createObjectURL(file);
    preview.appendChild(img);
  }
  area.appendChild(preview);
}

// ── Smooth anchor scroll ──
document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', e => {
    const t = document.querySelector(link.getAttribute('href'));
    if (t) { e.preventDefault(); t.scrollIntoView({ behavior: 'smooth' }); }
  });
});

window.showToast = showToast;
