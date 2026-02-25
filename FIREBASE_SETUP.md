# 🔥 Firebase + EmailJS Setup Guide — Sri Thirumalai Enterprises

**No billing required** — this setup uses Firebase free (Spark) plan + EmailJS free tier.

| Service | What it does | Cost |
|---|---|---|
| Firebase Firestore | Saves every lead permanently | Free (Spark plan) |
| EmailJS | Sends email to your inbox | Free (200 emails/month) |

---

## PART 1 — Firebase Firestore (Save Leads)

### Step 1 — Enable Firestore

1. Go to [https://console.firebase.google.com](https://console.firebase.google.com) → select project `srithirumalai-cc94e`
2. Left menu → **Firestore Database** → **Create database**
3. Choose **"Start in production mode"** → region: `asia-south1` (India) → **Enable**

### Step 2 — Publish Security Rules

1. Firestore → **Rules** tab
2. Replace everything with the contents of `firestore.rules` in this project
3. Click **Publish**

✅ Firestore is ready. Every form submission is now saved to the `leads` collection.

---

## PART 2 — EmailJS (Send Email Notifications)

### Step 3 — Create EmailJS Account

1. Go to [https://www.emailjs.com](https://www.emailjs.com) → **Sign Up** (free)
2. Use your Gmail: `adhishraj265@gmail.com`

### Step 4 — Connect Gmail as Email Service

1. Dashboard → **Email Services** → **Add New Service**
2. Choose **Gmail** → click **Connect Account** → sign in with `adhishraj265@gmail.com`
3. Name it `service_gmail` (or any name — copy the **Service ID** shown)
4. Click **Create Service**

### Step 5 — Create Email Template

1. Dashboard → **Email Templates** → **Create New Template**
2. Set it up like this:

   **To email:** `{{to_email}}`
   **From name:** `{{from_name}}`
   **Reply To:** `{{reply_to}}`
   **Subject:**
   ```
   🔔 New Inquiry: {{service_type}} — {{from_name}}
   ```
   **Body (HTML):**
   ```html
   <div style="font-family:Arial,sans-serif;max-width:600px;">
     <div style="background:#1a3c34;padding:24px;border-radius:8px 8px 0 0;">
       <h2 style="color:#c9a36f;margin:0;">New Inquiry — Sri Thirumalai Enterprises</h2>
     </div>
     <div style="padding:24px;border:1px solid #eee;border-top:none;border-radius:0 0 8px 8px;">
       <p><strong>Name:</strong> {{from_name}}</p>
       <p><strong>Email:</strong> <a href="mailto:{{from_email}}">{{from_email}}</a></p>
       <p><strong>Phone:</strong> <a href="tel:{{phone}}">{{phone}}</a></p>
       <p><strong>Interested In:</strong> {{service_type}}</p>
       <p><strong>Message:</strong><br>{{message}}</p>
       <hr>
       <p style="color:#888;font-size:12px;">Submitted via Sri Thirumalai Enterprises website</p>
     </div>
   </div>
   ```

3. Click **Save** → copy the **Template ID** shown

### Step 6 — Get Your Public Key

1. Dashboard → top-right avatar → **Account**
2. Copy your **Public Key** (looks like `user_abc123XYZ`)

### Step 7 — Update firebase.js

Open `js/firebase.js` and replace these 3 placeholder values:

```js
const EMAILJS_PUBLIC_KEY  = 'PASTE_YOUR_PUBLIC_KEY_HERE';
const EMAILJS_SERVICE_ID  = 'PASTE_YOUR_SERVICE_ID_HERE';
const EMAILJS_TEMPLATE_ID = 'PASTE_YOUR_TEMPLATE_ID_HERE';
```

---

## PART 3 — Test

1. Open the website and fill in the contact form
2. Click **Send Message**
3. Check:
   - ✅ Button shows spinner → then success toast appears
   - ✅ Firebase Console → Firestore → `leads` collection → new document saved
   - ✅ `adhishraj265@gmail.com` inbox → formatted email received

---

## How Data is Stored in Firestore

Each submission creates a document in `leads/`:

```json
{
  "name": "Ramesh Kumar",
  "email": "ramesh@gmail.com",
  "phone": "+91 94430 12345",
  "service": "fencing",
  "serviceLabel": "Fencing Solutions",
  "message": "Need chain link fencing for my 5-acre farm.",
  "submittedAt": "2026-02-25T15:30:00Z",
  "source": "website-contact-form"
}
```

---

## Troubleshooting

| Problem | Fix |
|---|---|
| Toast shows error | Open browser DevTools (F12) → Console — check the error message |
| `permission-denied` from Firestore | Re-publish rules from `firestore.rules` in Firebase Console |
| Email not received | Check EmailJS Dashboard → **Email Logs** for delivery status |
| Gmail not sending | Re-connect Gmail service in EmailJS dashboard |
| Over 200 emails/month limit | Upgrade EmailJS to Personal plan ($9/month) |
