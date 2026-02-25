/**
 * Admin Dashboard — Sri Thirumalai Enterprises
 * Firebase Auth + Firestore reads + Chart.js visualisations
 */

import { initializeApp } from 'https://www.gstatic.com/firebasejs/11.3.1/firebase-app.js';
import {
    getAuth, signInWithEmailAndPassword, signOut,
    onAuthStateChanged
} from 'https://www.gstatic.com/firebasejs/11.3.1/firebase-auth.js';
import {
    getFirestore, collection, getDocs,
    query, orderBy
} from 'https://www.gstatic.com/firebasejs/11.3.1/firebase-firestore.js';

// ─── Firebase config (same project) ───────────────────────────────────────────
const firebaseConfig = {
    apiKey: "AIzaSyBq0qWGIGD_tAMGuVCdV72Uu5lMXONtb3A",
    authDomain: "srithirumalai-cc94e.firebaseapp.com",
    projectId: "srithirumalai-cc94e",
    storageBucket: "srithirumalai-cc94e.firebasestorage.app",
    messagingSenderId: "262228677853",
    appId: "1:262228677853:web:6de783b955b7f40bf1b734",
    measurementId: "G-W08JYPDENF"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// ─── DOM refs ──────────────────────────────────────────────────────────────────
const loginScreen = document.getElementById('login-screen');
const dashboard = document.getElementById('dashboard');
const loginError = document.getElementById('login-error');
const loginBtn = document.getElementById('login-btn');

// ─── Auth state ───────────────────────────────────────────────────────────────
onAuthStateChanged(auth, user => {
    if (user) {
        loginScreen.classList.add('hidden');
        dashboard.classList.remove('hidden');
        setupMobileSidebar();
        loadDashboard();
    } else {
        loginScreen.classList.remove('hidden');
        dashboard.classList.add('hidden');
    }
});

// ─── Mobile sidebar toggle ────────────────────────────────────────────────────
function setupMobileSidebar() {
    const sidebar = document.querySelector('.sidebar');
    const backdrop = document.getElementById('sidebar-backdrop');
    const hamburger = document.getElementById('hamburger-btn');

    function openSidebar() {
        sidebar.classList.add('open');
        backdrop.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function closeSidebar() {
        sidebar.classList.remove('open');
        backdrop.classList.remove('active');
        document.body.style.overflow = '';
    }

    if (hamburger) hamburger.addEventListener('click', openSidebar);
    if (backdrop) backdrop.addEventListener('click', closeSidebar);

    // Close sidebar when any nav link is tapped on mobile
    document.querySelectorAll('.sidebar-nav a, .logout-btn').forEach(el => {
        el.addEventListener('click', closeSidebar);
    });
}

// ─── Login ────────────────────────────────────────────────────────────────────
document.getElementById('login-form').addEventListener('submit', async e => {
    e.preventDefault();
    loginError.textContent = '';
    loginBtn.disabled = true;
    loginBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i>';

    const email = document.getElementById('admin-email').value.trim();
    const password = document.getElementById('admin-password').value;

    try {
        await signInWithEmailAndPassword(auth, email, password);
    } catch (err) {
        loginError.textContent = err.code === 'auth/invalid-credential'
            ? 'Incorrect email or password.'
            : err.message;
        loginBtn.disabled = false;
        loginBtn.innerHTML = '<span>Sign In</span>';
    }
});

// ─── Logout ───────────────────────────────────────────────────────────────────
document.getElementById('logout-btn').addEventListener('click', () => signOut(auth));

// ─── Load dashboard data ──────────────────────────────────────────────────────
let serviceChartInst = null;
let timelineChartInst = null;

async function loadDashboard() {
    try {
        const q = query(collection(db, 'leads'), orderBy('submittedAt', 'desc'));
        const snap = await getDocs(q);
        const leads = snap.docs.map(d => ({ id: d.id, ...d.data() }));

        populateStats(leads);
        renderServiceChart(leads);
        renderTimelineChart(leads);
        renderTable(leads);

        document.getElementById('last-refresh').textContent =
            'Updated ' + new Date().toLocaleTimeString('en-IN');

    } catch (err) {
        console.error('Dashboard load error:', err);
        document.getElementById('leads-tbody').innerHTML =
            `<tr><td colspan="6" class="loading-row" style="color:#e74c3c;">
                ⚠️ Error: ${err.code || err.message}. Check Firestore rules allow auth reads.
             </td></tr>`;
    }
}

// ─── Stats cards ──────────────────────────────────────────────────────────────
function populateStats(leads) {
    const now = new Date();

    const today = leads.filter(l => {
        const d = l.submittedAt?.toDate();
        return d && d.toDateString() === now.toDateString();
    }).length;

    const month = leads.filter(l => {
        const d = l.submittedAt?.toDate();
        return d && d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    }).length;

    const counts = {};
    leads.forEach(l => {
        const k = l.serviceLabel || l.service || 'Other';
        counts[k] = (counts[k] || 0) + 1;
    });
    const top = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];

    document.getElementById('stat-total').textContent = leads.length;
    document.getElementById('stat-month').textContent = month;
    document.getElementById('stat-today').textContent = today;
    // Show first word only so it never wraps on small stat card
    document.getElementById('stat-top').textContent = top
        ? top[0].split(' ')[0]
        : '—';
}

// ─── Service doughnut chart ───────────────────────────────────────────────────
function renderServiceChart(leads) {
    const counts = {};
    leads.forEach(l => {
        const k = l.serviceLabel || l.service || 'Other';
        counts[k] = (counts[k] || 0) + 1;
    });

    const labels = Object.keys(counts);
    const data = Object.values(counts);

    if (!labels.length) {
        document.getElementById('no-service-data').style.display = 'block';
        return;
    }

    if (serviceChartInst) serviceChartInst.destroy();

    const ctx = document.getElementById('serviceChart').getContext('2d');
    serviceChartInst = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels,
            datasets: [{
                data,
                backgroundColor: ['#1a3c34', '#c9a36f', '#6b8e23', '#2c584e', '#8e6b23'],
                borderWidth: 2,
                borderColor: '#fff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: { font: { size: 11 }, padding: 10, boxWidth: 12 }
                }
            },
            cutout: '68%'
        }
    });
}

// ─── Last 7 days bar chart ────────────────────────────────────────────────────
function renderTimelineChart(leads) {
    const labels = [];
    const data = [];

    for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        d.setHours(0, 0, 0, 0);

        labels.push(d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric' }));
        data.push(leads.filter(l => {
            const ld = l.submittedAt?.toDate();
            if (!ld) return false;
            ld.setHours(0, 0, 0, 0);
            return ld.getTime() === d.getTime();
        }).length);
    }

    if (timelineChartInst) timelineChartInst.destroy();

    const ctx = document.getElementById('timelineChart').getContext('2d');
    timelineChartInst = new Chart(ctx, {
        type: 'bar',
        data: {
            labels,
            datasets: [{
                label: 'Leads',
                data,
                backgroundColor: 'rgba(201,163,111,0.85)',
                borderRadius: 6,
                borderSkipped: false
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: { stepSize: 1, font: { size: 11 } },
                    grid: { color: '#f0f0f0' }
                },
                x: {
                    grid: { display: false },
                    ticks: { font: { size: 10 } }
                }
            }
        }
    });
}

// ─── Leads table ──────────────────────────────────────────────────────────────
function renderTable(leads) {
    const tbody = document.getElementById('leads-tbody');

    if (!leads.length) {
        tbody.innerHTML = '<tr><td colspan="6" class="loading-row">No leads yet. Form submissions will appear here.</td></tr>';
        return;
    }

    tbody.innerHTML = leads.map(l => {
        const raw = l.submittedAt?.toDate();
        const date = raw
            ? raw.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
            : '—';

        const phone = l.phone
            ? `<a href="tel:${l.phone}">${l.phone}</a>`
            : '—';
        const email = l.email
            ? `<a href="mailto:${l.email}">${l.email}</a>`
            : '—';
        const msg = (l.message || '—').slice(0, 80) + (l.message?.length > 80 ? '…' : '');

        return `<tr>
            <td style="white-space:nowrap;color:#6b7a8d;">${date}</td>
            <td><strong>${l.name || '—'}</strong></td>
            <td>${phone}</td>
            <td>${email}</td>
            <td><span class="service-badge">${l.serviceLabel || l.service || '—'}</span></td>
            <td class="msg-cell" title="${l.message || ''}">${msg}</td>
        </tr>`;
    }).join('');
}

// ─── Search / filter table ────────────────────────────────────────────────────
document.getElementById('search-leads').addEventListener('input', function () {
    const term = this.value.toLowerCase();
    document.querySelectorAll('#leads-tbody tr').forEach(row => {
        row.style.display = row.textContent.toLowerCase().includes(term) ? '' : 'none';
    });
});
