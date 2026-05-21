/* ============================================================
   AquaServe — Staff Dashboard JS
   Login: Demo accounts only (no Firebase Auth required)
   Data:  Firestore for reports (real-time)
   ============================================================ */
import { db } from './firebase-config.js';
import {
  collection, query, orderBy, onSnapshot, doc, updateDoc
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// ── DEMO ACCOUNTS (no Firebase Auth needed) ───────────────────
const DEMO_ACCOUNTS = [
  { id: 'EMP-001', password: 'admin123', name: 'Admin User',     role: 'Administrator'    },
  { id: 'EMP-002', password: 'staff123', name: 'Maria Santos',   role: 'Field Supervisor' },
  { id: 'EMP-003', password: 'staff123', name: 'Juan dela Cruz', role: 'Billing Officer'  },
];

const WORKERS = [
  { initials:'RC', name:'Ramon Castro',   role:'Plumber – Zone A',    status:'available' },
  { initials:'ML', name:'Maria Lim',      role:'Inspector – Zone B',  status:'busy'      },
  { initials:'JR', name:'Jose Reyes',     role:'Plumber – Zone C',    status:'available' },
  { initials:'AV', name:'Ana Villanueva', role:'Technician – Zone A', status:'available' },
  { initials:'BT', name:'Ben Torres',     role:'Plumber – Zone B',    status:'off-duty'  },
  { initials:'CC', name:'Carlo Cruz',     role:'Inspector – Zone C',  status:'busy'      },
];

const ISSUE_LABELS = {
  'major-leak':'Major Leak','leak':'Leak','low-pressure':'Low Pressure',
  'no-water':'No Water','contamination':'Contamination','meter':'Meter Issue',
  'billing':'Billing','other':'Other',
};

let unsubscribeReports = null;
let currentFilter      = 'all';
let allReports         = [];

// ── LOGIN (local check only — no Firebase Auth) ───────────────
function staffLogin() {
  const empId   = document.getElementById('empId').value.trim().toUpperCase();
  const empPass = document.getElementById('empPass').value.trim();

  if (!empId || !empPass) {
    window.showToast('Please enter your Employee ID and password.', 'error');
    return;
  }

  const btn = document.querySelector('.login-box .btn-primary');
  btn.textContent = 'Signing in…';
  btn.disabled    = true;

  setTimeout(() => {
    const match = DEMO_ACCOUNTS.find(a => a.id === empId && a.password === empPass);

    if (match) {
      showDashboard(match.name, match.role);
      window.showToast(`Welcome, ${match.name}! 👋`, 'success');
    } else {
      window.showToast('Incorrect Employee ID or password.', 'error');
      document.getElementById('empPass').value = '';
      document.getElementById('empPass').focus();
    }

    btn.textContent = 'Sign In →';
    btn.disabled    = false;
  }, 600);
}

function showDashboard(name, role) {
  document.getElementById('staffLogin').style.display = 'none';
  document.getElementById('dashLayout').classList.add('active');
  document.getElementById('staffName').textContent = name;
  startRealtimeListener();
}

function staffLogout() {
  if (unsubscribeReports) { unsubscribeReports(); unsubscribeReports = null; }
  allReports    = [];
  currentFilter = 'all';
  document.getElementById('staffLogin').style.display = 'flex';
  document.getElementById('dashLayout').classList.remove('active');
  document.getElementById('empId').value   = '';
  document.getElementById('empPass').value = '';
  document.querySelectorAll('.dash-section').forEach(s  => s.classList.remove('active'));
  document.querySelectorAll('.dash-nav-item').forEach(n => n.classList.remove('active'));
  document.getElementById('sec-overview')?.classList.add('active');
  document.querySelector('.dash-nav-item')?.classList.add('active');
}

// ── FIRESTORE REAL-TIME LISTENER ─────────────────────────────
function startRealtimeListener() {
  const today = new Date();
  const dateEl = document.getElementById('dashDate');
  if (dateEl) dateEl.textContent = `Today is ${today.toLocaleDateString('en-PH', { weekday:'long', year:'numeric', month:'long', day:'numeric' })}`;

  try {
    const q = query(collection(db, 'reports'), orderBy('createdAt', 'desc'));
    unsubscribeReports = onSnapshot(q, (snap) => {
      allReports = snap.docs.map(d => ({ docId: d.id, ...d.data() }));
      updateKPIs();
      updateBreakdowns();
      if (document.getElementById('sec-requests')?.classList.contains('active')) {
        renderRequests(currentFilter);
      }
    }, (err) => {
      console.error('Firestore error:', err);
      window.showToast('Could not load live reports. Check Firestore rules.', 'error');
    });
  } catch (err) {
    console.error(err);
  }
}

function updateKPIs() {
  const pending  = allReports.filter(r => r.status === 'pending').length;
  const ongoing  = allReports.filter(r => r.status === 'ongoing').length;
  const resolved = allReports.filter(r => r.status === 'resolved').length;
  document.getElementById('kpiTotal').textContent    = allReports.length;
  document.getElementById('kpiPending').textContent  = pending;
  document.getElementById('kpiOngoing').textContent  = ongoing;
  document.getElementById('kpiResolved').textContent = resolved;
}

function updateBreakdowns() {
  const issueCounts = {};
  allReports.forEach(r => { issueCounts[r.issueType] = (issueCounts[r.issueType] || 0) + 1; });
  const issueBox = document.getElementById('issueBreakdown');
  if (issueBox) {
    issueBox.innerHTML = Object.keys(issueCounts).length
      ? Object.entries(issueCounts).map(([k, v]) => `
          <div style="display:flex;justify-content:space-between;align-items:center;padding:8px 0;border-bottom:1px solid var(--gray-100);font-size:13px;">
            <span>${ISSUE_LABELS[k] || k}</span><strong>${v}</strong>
          </div>`).join('')
      : '<p style="color:var(--gray-400);font-size:13px;">No reports yet.</p>';
  }

  const priCounts = { critical:0, high:0, medium:0, low:0 };
  allReports.forEach(r => { if (priCounts[r.priority] !== undefined) priCounts[r.priority]++; });
  const priColors = { critical:'#ff4d4f', high:'#fa8c16', medium:'#faad14', low:'#52c41a' };
  const priBox = document.getElementById('priorityBreakdown');
  if (priBox) {
    priBox.innerHTML = allReports.length
      ? Object.entries(priCounts).map(([k, v]) => {
          const pct = Math.round((v / allReports.length) * 100);
          return `<div style="margin-bottom:12px;">
            <div style="display:flex;justify-content:space-between;font-size:12px;margin-bottom:4px;">
              <span style="text-transform:capitalize;font-weight:500;">${k}</span>
              <span>${v} (${pct}%)</span>
            </div>
            <div style="height:6px;background:var(--gray-200);border-radius:3px;">
              <div style="height:100%;width:${pct}%;background:${priColors[k]};border-radius:3px;transition:width .5s;"></div>
            </div></div>`;
        }).join('')
      : '<p style="color:var(--gray-400);font-size:13px;">No reports yet.</p>';
  }
}

function switchTab(tab, el) {
  document.querySelectorAll('.dash-section').forEach(s  => s.classList.remove('active'));
  document.querySelectorAll('.dash-nav-item').forEach(n => n.classList.remove('active'));
  document.getElementById(`sec-${tab}`)?.classList.add('active');
  el.classList.add('active');
  if (tab === 'requests') renderRequests(currentFilter);
  if (tab === 'workers')  renderWorkers();
  if (tab === 'reports')  renderReports();
}

function filterRequests(filter, el) {
  currentFilter = filter;
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  el.classList.add('active');
  renderRequests(filter);
}

function renderRequests(filter) {
  const filtered = filter === 'all' ? allReports : allReports.filter(r => r.status === filter);
  const tbody    = document.getElementById('requestsTable');
  if (!tbody) return;
  if (!filtered.length) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;color:var(--gray-400);padding:32px;">No ${filter === 'all' ? '' : filter} requests.</td></tr>`;
    return;
  }
  const priLabels = { critical:'🔴 Critical', high:'🟠 High', medium:'🟡 Medium', low:'🟢 Low' };
  tbody.innerHTML = filtered.map(r => {
    const date = r.createdAt?.toDate?.()?.toLocaleDateString('en-PH') || '—';
    return `<tr>
      <td style="font-weight:600;font-size:12px;color:var(--blue-600);">${r.id}</td>
      <td>${r.name}</td>
      <td>${ISSUE_LABELS[r.issueType] || r.issueType}</td>
      <td style="font-size:12px;">${priLabels[r.priority] || r.priority}</td>
      <td style="font-size:12px;color:var(--gray-500);">${date}</td>
      <td><span class="badge badge-${r.status}">${r.status}</span></td>
      <td style="white-space:nowrap;">
        ${r.status === 'pending'  ? `<button class="action-btn assign"  onclick="updateStatus('${r.docId}','ongoing')">Assign</button>`  : ''}
        ${r.status === 'ongoing'  ? `<button class="action-btn resolve" onclick="updateStatus('${r.docId}','resolved')">Resolve</button>` : ''}
        ${r.status === 'resolved' ? '<span style="font-size:12px;color:var(--gray-400);">Done ✓</span>' : ''}
      </td>
    </tr>`;
  }).join('');
}

async function updateStatus(docId, newStatus) {
  try {
    await updateDoc(doc(db, 'reports', docId), { status: newStatus });
    window.showToast(`Request marked as ${newStatus}.`, 'success');
  } catch (err) {
    console.error(err);
    window.showToast('Failed to update. Check Firestore rules.', 'error');
  }
}

function renderWorkers() {
  const grid = document.getElementById('workersGrid');
  if (!grid) return;
  const statusColors = { available:'#52c41a', busy:'#1677ff', 'off-duty':'#bdbdbd' };
  const statusLabels = { available:'Available', busy:'On Duty', 'off-duty':'Off Duty' };
  grid.innerHTML = WORKERS.map(w => `
    <div class="worker-card">
      <div class="worker-header">
        <div class="worker-avatar">${w.initials}</div>
        <div><div class="worker-name">${w.name}</div><div class="worker-role">${w.role}</div></div>
      </div>
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:14px;">
        <span style="width:8px;height:8px;border-radius:50%;background:${statusColors[w.status]};display:inline-block;"></span>
        <span style="font-size:12px;color:var(--gray-600);">${statusLabels[w.status]}</span>
      </div>
      <button class="btn btn-ghost btn-sm" style="width:100%;justify-content:center;"
        onclick="window.showToast('Dispatch feature coming soon.','default')">Dispatch →</button>
    </div>`).join('');
}

function renderReports() {
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const vals   = [4,7,5,9,12,8,15,11,6,10,14,9];
  const maxVal = Math.max(...vals);
  const chart  = document.getElementById('monthlyChart');
  if (chart) chart.innerHTML = vals.map((v, i) => `
    <div class="chart-bar-wrap">
      <div class="chart-bar" style="height:${Math.max((v/maxVal)*70,4)}px;"></div>
      <div class="chart-bar-label">${months[i]}</div>
    </div>`).join('');

  const resolved = allReports.filter(r => r.status === 'resolved').length;
  const rate     = allReports.length ? Math.round((resolved / allReports.length) * 100) : 0;
  const metrics  = document.getElementById('metricsBox');
  if (metrics) metrics.innerHTML = `
    <div style="display:flex;flex-direction:column;gap:14px;font-size:14px;">
      <div style="display:flex;justify-content:space-between;padding-bottom:12px;border-bottom:1px solid var(--gray-100);">
        <span style="color:var(--gray-600);">Total Reports (Live)</span><strong>${allReports.length}</strong>
      </div>
      <div style="display:flex;justify-content:space-between;padding-bottom:12px;border-bottom:1px solid var(--gray-100);">
        <span style="color:var(--gray-600);">Resolution Rate</span>
        <strong style="color:var(--green-600);">${rate}%</strong>
      </div>
      <div style="display:flex;justify-content:space-between;padding-bottom:12px;border-bottom:1px solid var(--gray-100);">
        <span style="color:var(--gray-600);">Avg. Response Time</span><strong>~3.2 hrs</strong>
      </div>
      <div style="display:flex;justify-content:space-between;">
        <span style="color:var(--gray-600);">Customer Satisfaction</span>
        <strong style="color:var(--blue-600);">4.7 / 5.0 ★</strong>
      </div>
    </div>`;
}

window.staffLogin     = staffLogin;
window.staffLogout    = staffLogout;
window.switchTab      = switchTab;
window.filterRequests = filterRequests;
window.updateStatus   = updateStatus;