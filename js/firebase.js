/**
 * Firebase + EmailJS Form Handler — Sri Thirumalai Enterprises
 *
 * Approach (100% Free — no billing required):
 *   1. Saves lead to Firebase Firestore (free Spark plan)
 *   2. Sends email notification via EmailJS (free 200/month)
 *
 * SETUP: See FIREBASE_SETUP.md for step-by-step instructions.
 */

import { initializeApp } from 'https://www.gstatic.com/firebasejs/11.3.1/firebase-app.js';
import { getFirestore, collection, addDoc, serverTimestamp } from 'https://www.gstatic.com/firebasejs/11.3.1/firebase-firestore.js';
import emailjs from 'https://cdn.jsdelivr.net/npm/@emailjs/browser@4/+esm';

// ─── 1. FIREBASE CONFIG ───────────────────────────────────────────────────────
const firebaseConfig = {
    apiKey: "AIzaSyBq0qWGIGD_tAMGuVCdV72Uu5lMXONtb3A",
    authDomain: "srithirumalai-cc94e.firebaseapp.com",
    projectId: "srithirumalai-cc94e",
    storageBucket: "srithirumalai-cc94e.firebasestorage.app",
    messagingSenderId: "262228677853",
    appId: "1:262228677853:web:6de783b955b7f40bf1b734",
    measurementId: "G-W08JYPDENF"
};

// ─── 2. EMAILJS CONFIG ────────────────────────────────────────────────────────
// Get these from https://www.emailjs.com → Account → API Keys & Services
const EMAILJS_PUBLIC_KEY = 'ulNIflmqALX99wwcT';   // e.g. "user_abc123XYZ"
const EMAILJS_SERVICE_ID = 'service_h0zym3s';            // e.g. "service_gmail"
const EMAILJS_TEMPLATE_ID = 'template_bqwus11';           // Contact Us template

// ─── 3. EMAIL RECIPIENT ───────────────────────────────────────────────────────
const OWNER_EMAIL = 'adhishraj265@gmail.com';

// ─────────────────────────────────────────────────────────────────────────────

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
emailjs.init({ publicKey: EMAILJS_PUBLIC_KEY });

const serviceLabels = {
    fencing: 'Fencing Solutions',
    landscaping: 'Landscape & Garden',
    pool: 'Swimming Pool / Water Features',
    other: 'Other'
};

// ─── Form submit handler ──────────────────────────────────────────────────────
const contactForm = document.querySelector('.contact-form');

if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const submitBtn = contactForm.querySelector('button[type="submit"]');
        const originalHTML = submitBtn.innerHTML;

        // Loading state
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i>&nbsp; Sending…';

        const name = document.getElementById('name').value.trim();
        const email = document.getElementById('email').value.trim();
        const phone = document.getElementById('phone').value.trim();
        const service = document.getElementById('service').value;
        const message = document.getElementById('message').value.trim();
        const serviceLabel = serviceLabels[service] || service;

        // ── Run Firestore save + EmailJS send IN PARALLEL ────────────────────
        const [fsResult, ejResult] = await Promise.allSettled([

            // Task 1: Save lead to Firestore
            addDoc(collection(db, 'leads'), {
                name, email, phone, service, serviceLabel, message,
                submittedAt: serverTimestamp(),
                source: 'website-contact-form'
            }),

            // Task 2: Send email via EmailJS (runs at the same time as Task 1)
            emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, {
                to_email: OWNER_EMAIL,
                reply_to: email,
                from_name: name,
                from_email: email,
                phone: phone,
                service_type: serviceLabel,
                message: message
            })
        ]);

        // ── Log results ───────────────────────────────────────────────────────
        if (fsResult.status === 'fulfilled') {
            console.log('✅ Firestore: lead saved.');
        } else {
            console.error('❌ Firestore error:', fsResult.reason?.code, fsResult.reason?.message);
        }

        if (ejResult.status === 'fulfilled') {
            console.log('✅ EmailJS: sent.', ejResult.value?.status, ejResult.value?.text);
        } else {
            console.error('❌ EmailJS error — status:', ejResult.reason?.status, '| text:', ejResult.reason?.text);
        }

        // ── Show result to user ───────────────────────────────────────────────
        const bothFailed = fsResult.status === 'rejected' && ejResult.status === 'rejected';
        if (bothFailed) {
            showToast('error', 'Something went wrong. Please call us directly.');
        } else {
            // GA4: fire conversion event
            if (typeof gtag === 'function') {
                gtag('event', 'form_submission', {
                    event_category: 'conversion',
                    event_label: serviceLabel
                });
            }
            showToast('success', 'Message sent! We\'ll reach you within 24 hours.');
            contactForm.reset();
        }

        submitBtn.disabled = false;
        submitBtn.innerHTML = originalHTML;
    });
}

// ─── Toast helper ─────────────────────────────────────────────────────────────
function showToast(type, msg) {
    const toast = document.getElementById('toast-notification');
    const toastMsg = document.getElementById('toast-message');
    if (!toast || !toastMsg) return;

    toastMsg.textContent = msg;
    toast.className = `toast-notification toast-${type} show`;

    clearTimeout(toast._hideTimer);
    toast._hideTimer = setTimeout(() => toast.classList.remove('show'), 5000);
}
