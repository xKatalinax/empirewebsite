# Staff Portal Setup Guide

This adds three pages to your site:

- **login.html** — where staff sign in
- **admin.html** — where admins create/manage staff accounts (only admins can open this)
- **staff-guide.html** — the gated guide page every staff account can see once logged in

It uses **Firebase** (free) to handle real accounts and logins, since your site is hosted as static files on GitHub Pages with no server of its own. Firebase is Google's service for exactly this — login pages with no server to maintain.

Total setup time: about 15–20 minutes, once.

## 1. Create a Firebase project

1. Go to [console.firebase.google.com](https://console.firebase.google.com) and sign in with any Google account.
2. Click **Add project**, name it something like `empire-rp-staff`, and finish the wizard (you can decline Google Analytics).

## 2. Turn on Email/Password login

1. In your new project, go to **Build → Authentication** in the left sidebar.
2. Click **Get started**, then under **Sign-in method**, enable **Email/Password**.

## 3. Create the database

1. Go to **Build → Firestore Database**.
2. Click **Create database**, choose a location close to your players, and start in **Production mode**.

## 4. Set the security rules

1. In Firestore, go to the **Rules** tab.
2. Replace everything with this and click **Publish**:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    function isAdmin() {
      return request.auth != null &&
        exists(/databases/$(database)/documents/users/$(request.auth.uid)) &&
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin' &&
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.status == 'active';
    }

    match /users/{userId} {
      allow get: if request.auth != null && (request.auth.uid == userId || isAdmin());
      allow list: if isAdmin();
      allow create, update, delete: if isAdmin();
    }
  }
}
```

This means: anyone can read their *own* account record (so the Staff Guide knows their name/role), only admins can see the full staff list, and only admins can create, edit, or disable accounts.

## 5. Get your config keys and paste them in

1. Go to **Project settings** (gear icon, top left) → **General** tab.
2. Under "Your apps," click the **Web** icon (`</>`) to register a web app. Name it anything (e.g. "Empire Site").
3. Firebase shows you a `firebaseConfig` object. Copy the six values.
4. Open **firebase-config.js** (included with this delivery) and paste your values in:

```js
const firebaseConfig = {
  apiKey: "...",
  authDomain: "...",
  projectId: "...",
  storageBucket: "...",
  messagingSenderId: "...",
  appId: "..."
};
```

## 6. Create your first admin account

The admin portal lets admins create *other* accounts, but you need one admin to start with. Create it directly in Firebase:

1. **Authentication → Users → Add user.** Enter your email and a password, click **Add user**.
2. Copy the **User UID** shown next to the new user.
3. **Firestore Database → Start collection.** Collection ID: `users`.
4. **Document ID:** paste the User UID you copied. Add these fields:
   - `name` (string) — your name
   - `email` (string) — same email you used above
   - `role` (string) — `admin`
   - `status` (string) — `active`
5. Click **Save**.

That's your bootstrap admin. Every account created after this can be made through the admin portal itself.

## 7. Add the files to your site and deploy

1. Drop `login.html`, `admin.html`, `staff-guide.html`, and `firebase-config.js` (with your keys filled in) into the same folder as your other `.html` files (alongside `index.html`).
2. Commit and push to your GitHub repo like normal — GitHub Pages will publish them automatically at, e.g., `empireroleplay.net/login.html`.
3. A "Staff Login" link has been added to the footer of your existing pages so staff can find it.

## 8. Test it

1. Visit `yoursite.com/login.html` and sign in with the bootstrap admin you created in step 6.
2. You should land on the Admin Portal. Try creating a staff account — the new person gets an email to set their own password.
3. Log in as that staff account (after they set a password) — they should land on the Staff Guide.

## Notes & limits (read this)

- **Disabling vs. deleting:** the admin portal can disable an account (blocks them from logging in) and remove them from the visible staff list, but it can't fully delete their underlying login credentials — that requires Firebase's server-side Admin SDK, which needs a small cloud function and is a bigger lift. If you ever need to fully erase someone's login (not just block access), you can do it manually any time in **Authentication → Users** in the Firebase console — find them and delete. Disabling through the portal is enough for day-to-day staff turnover.
- **Free tier:** Firebase's free Spark plan covers Authentication and Firestore use at this scale (a staff team) with plenty of room to spare — you won't hit a bill for this.
- **Password resets:** "Resend Email" on the admin portal re-sends the same password-setup email Firebase sends on account creation, useful if someone's link expired.
