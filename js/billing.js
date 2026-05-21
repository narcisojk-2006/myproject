/* ============================================================
   AquaServe — Billing JS  (Firebase / Firestore)
   ============================================================ */
import { db } from './firebase-config.js';
import {
  collection, addDoc, query, where, getDocs,
  orderBy, serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

let selectedMethod = 'GCash';
let billData = {};

async function loginBilling() {
  const account = document.getElementById('accountNum').value.trim();
  const last    = document.getElementById('lastName').value.trim();
  if (!account || !last) { window.showToast('Please enter both fields.', 'error'); return; }

  const btn = document.querySelector('.login-card .btn');
  btn.textContent = 'Loading…'; btn.disabled = true;

  try {
    const consumption       = Math.floor(Math.random() * 30) + 8;
    const consumptionCharge = +(consumption * 28.5).toFixed(2);
    const subtotal          = 85 + consumptionCharge + 12 + 25;
    const vat               = +(subtotal * 0.12).toFixed(2);
    const total             = +(subtotal + vat).toFixed(2);

    const today       = new Date();
    const due         = new Date(today); due.setDate(due.getDate() + 15);
    const periodStart = new Date(today.getFullYear(), today.getMonth() - 1, 1);

    billData = { account, last, consumption, consumptionCharge, vat, total, due, periodStart };

    document.getElementById('welcomeName').textContent      = last;
    document.getElementById('displayAccount').textContent   = account;
    document.getElementById('currentBalance').textContent   = total.toFixed(2);
    document.getElementById('dueDate').textContent          = due.toLocaleDateString('en-PH', { month:'short', day:'numeric', year:'numeric' });
    document.getElementById('consumption').textContent      = consumption;
    document.getElementById('billPeriod').textContent       = periodStart.toLocaleDateString('en-PH', { month:'long', year:'numeric' });
    document.getElementById('billConsumption').textContent  = consumption;
    document.getElementById('consumptionCharge').textContent= consumptionCharge.toFixed(2);
    document.getElementById('vatAmount').textContent        = vat.toFixed(2);
    document.getElementById('totalDue').textContent         = total.toFixed(2);
    document.getElementById('modalAmount').textContent      = total.toFixed(2);

    // Load history from Firestore
    const q    = query(collection(db, 'payments'), where('account', '==', account), orderBy('createdAt', 'desc'));
    const snap = await getDocs(q);
    const history = snap.docs.map(d => d.data());
    renderHistory(history);

    document.getElementById('loginSection').style.display = 'none';
    document.getElementById('billingDashboard').classList.add('active');
  } catch (err) {
    console.error(err);
    window.showToast('Could not load billing data. Check Firestore index.', 'error');
  } finally {
    btn.textContent = 'View My Bill →'; btn.disabled = false;
  }
}

function logoutBilling() {
  document.getElementById('loginSection').style.display = 'block';
  document.getElementById('billingDashboard').classList.remove('active');
  document.getElementById('accountNum').value = '';
  document.getElementById('lastName').value   = '';
  billData = {};
}

function renderHistory(history) {
  const tbody = document.getElementById('historyTable');
  if (!history.length) {
    tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;color:var(--gray-400);padding:24px;">No payment history yet.</td></tr>`;
    return;
  }
  tbody.innerHTML = history.map(p => {
    const date = p.createdAt?.toDate?.()?.toLocaleDateString('en-PH') || p.date || '—';
    return `<tr>
      <td>${date}</td>
      <td>${p.period}</td>
      <td>₱${p.amount}</td>
      <td>${p.method}</td>
      <td><span class="badge badge-resolved">Paid</span></td>
    </tr>`;
  }).join('');
}

function openPayModal()  { document.getElementById('payModal').classList.add('open'); }
function closePayModal() { document.getElementById('payModal').classList.remove('open'); }
document.getElementById('payModal')?.addEventListener('click', (e) => {
  if (e.target === e.currentTarget) closePayModal();
});

function selectMethod(el, method) {
  document.querySelectorAll('.pay-method').forEach(m => m.classList.remove('selected'));
  el.classList.add('selected');
  selectedMethod = method;
}

async function confirmPayment() {
  const ref = document.getElementById('refNum').value.trim();
  if (!ref) { window.showToast('Enter a reference or account number.', 'error'); return; }

  const confirmBtn = document.querySelector('#payModal .btn-primary');
  confirmBtn.textContent = 'Processing…'; confirmBtn.disabled = true;

  try {
    const payment = {
      account:   billData.account,
      period:    billData.periodStart?.toLocaleDateString('en-PH', { month:'long', year:'numeric' }) || '—',
      amount:    billData.total?.toFixed(2) || '0.00',
      method:    selectedMethod,
      ref,
      createdAt: serverTimestamp(),
    };

    await addDoc(collection(db, 'payments'), payment);

    closePayModal();

    // Reload history
    const q    = query(collection(db, 'payments'), where('account', '==', billData.account), orderBy('createdAt', 'desc'));
    const snap = await getDocs(q);
    renderHistory(snap.docs.map(d => d.data()));

    document.getElementById('currentBalance').textContent = '0.00';
    document.getElementById('billStatus').textContent     = 'Paid';
    document.getElementById('billStatus').className       = 'badge badge-resolved';

    window.showToast(`Payment of ₱${payment.amount} via ${selectedMethod} confirmed! 🎉`, 'success', 5000);
  } catch (err) {
    console.error(err);
    window.showToast('Payment failed. Please try again.', 'error');
  } finally {
    confirmBtn.textContent = 'Confirm Payment'; confirmBtn.disabled = false;
  }
}

function printReceipt() { window.showToast('Generating bill PDF… (demo)', 'default'); }

window.loginBilling    = loginBilling;
window.logoutBilling   = logoutBilling;
window.openPayModal    = openPayModal;
window.closePayModal   = closePayModal;
window.selectMethod    = selectMethod;
window.confirmPayment  = confirmPayment;
window.printReceipt    = printReceipt;
