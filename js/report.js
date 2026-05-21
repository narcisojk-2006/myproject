/* ============================================================
   AquaServe — Report Issue JS  (Firebase / Firestore)
   ============================================================ */
import { db } from './firebase-config.js';
import {
  collection, addDoc, query, where, getDocs, serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

function generateRequestId() {
  const year = new Date().getFullYear();
  const num  = String(Math.floor(Math.random() * 90000) + 10000);
  return `AQ-${year}-${num}`;
}

const form = document.getElementById('reportForm');
if (form) {
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const fields = ['fullName', 'contact', 'address', 'issueType', 'description'];
    let valid = true;
    fields.forEach(id => {
      const el = document.getElementById(id);
      if (el && !el.value.trim()) {
        el.style.borderColor = '#ff4d4f';
        el.addEventListener('input', () => (el.style.borderColor = ''), { once: true });
        valid = false;
      }
    });

    const priority = document.querySelector('input[name="priority"]:checked');
    if (!priority) { valid = false; window.showToast('Please select a priority level.', 'error'); }
    if (!valid)    { window.showToast('Please fill in all required fields.', 'error'); return; }

    const submitBtn = form.querySelector('.submit-btn');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Submitting…';

    try {
      const requestId = generateRequestId();
      const report = {
        id:          requestId,
        name:        document.getElementById('fullName').value.trim(),
        contact:     document.getElementById('contact').value.trim(),
        address:     document.getElementById('address').value.trim(),
        issueType:   document.getElementById('issueType').value,
        priority:    priority.value,
        description: document.getElementById('description').value.trim(),
        status:      'pending',
        createdAt:   serverTimestamp(),
      };

      await addDoc(collection(db, 'reports'), report);

      document.getElementById('generatedId').textContent = requestId;
      document.getElementById('successModal').classList.add('open');
      form.reset();
      window.showToast('Report submitted successfully!', 'success');
    } catch (err) {
      console.error('Firestore error:', err);
      window.showToast('Failed to submit report. Please try again.', 'error');
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Submit Issue Report →';
    }
  });
}

function closeModal() {
  document.getElementById('successModal').classList.remove('open');
}
document.getElementById('successModal')?.addEventListener('click', (e) => {
  if (e.target === e.currentTarget) closeModal();
});

async function trackRequest() {
  const input  = document.getElementById('trackId');
  const result = document.getElementById('trackResult');
  const id     = input.value.trim().toUpperCase();
  if (!id) { window.showToast('Enter a Request ID first.', 'error'); return; }

  result.innerHTML = '<p style="font-size:13px;color:var(--gray-500);padding:12px;text-align:center;">Searching…</p>';

  try {
    const q    = query(collection(db, 'reports'), where('id', '==', id));
    const snap = await getDocs(q);

    if (!snap.empty) {
      const found = snap.docs[0].data();
      const statusColors = { pending: '#faad14', ongoing: '#1677ff', resolved: '#52c41a' };
      const color = statusColors[found.status] || '#888';
      const date  = found.createdAt?.toDate?.()?.toLocaleDateString() || '—';
      result.innerHTML = `
        <div style="padding:16px;border-radius:10px;border:1.5px solid ${color};background:${color}18;">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
            <strong style="font-size:13px;">${found.id}</strong>
            <span class="badge badge-${found.status}">${found.status}</span>
          </div>
          <p style="font-size:13px;color:var(--gray-700);margin-bottom:4px;">📍 ${found.address}</p>
          <p style="font-size:13px;color:var(--gray-600);">🗓 ${date}</p>
        </div>`;
    } else {
      result.innerHTML = `<p style="font-size:13px;color:var(--gray-500);padding:12px;text-align:center;">No request found for <strong>${id}</strong></p>`;
    }
  } catch (err) {
    console.error(err);
    result.innerHTML = `<p style="font-size:13px;color:var(--coral-600);padding:12px;">Error fetching data. Check your connection.</p>`;
  }
}

window.closeModal    = closeModal;
window.trackRequest  = trackRequest;
