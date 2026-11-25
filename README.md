# TripNest — Travel Agency Website (Repaired v2)

A React + Vite travel agency project for a college review/demo. It includes a public destination catalogue, user signup/login, booking requests, an admin dashboard, Local Storage persistence, and Vercel SPA routing.

## 1. Requirements

- Node.js 18 or newer (Node.js 20 LTS is recommended)
- npm (included with Node.js)
- VS Code or another code editor
- Internet connection for the remote travel photos and Google Fonts

The project uses pinned dependency versions to avoid unexpected breaking changes during installation.

## 2. Start the project on Windows

1. Extract `travel-agency-review-v2.zip`.
2. Open the extracted `travel-agency-review` folder in VS Code.
3. Open **Terminal → New Terminal**.
4. Check Node and npm:

```bash
node -v
npm -v
```

5. Install the project dependencies:

```bash
npm install
```

6. Start the development server:

```bash
npm run dev
```

7. Open the local URL shown in the terminal. Vite normally uses `http://localhost:5173`.

Stop the server with `Ctrl + C` in the terminal.

## 3. Demo login details

| Role | Email | Password |
|---|---|---|
| Admin | `admin@tripnest.demo` | `admin123` |
| User | `user@tripnest.demo` | `user123` |

New registrations automatically receive the **User** role. The Admin role is reserved for the demo administrator.

## 4. Features

### Public website
- Responsive TripNest home page
- Travel packages with destination, duration, category, description and price
- Catalogue updates when the admin adds, edits or deletes a package

### User module
- Signup and login
- Browse available journeys
- Submit a booking with travel date and 1–10 travellers
- Automatic total price calculation
- View booking history and status

### Admin module
- Dashboard summary cards
- Add, edit and delete tour packages
- View all customer booking requests
- Change booking status to Pending, Confirmed or Cancelled

### Persistence
The demo uses browser Local Storage. The app also has a temporary in-memory fallback if browser storage is blocked; in that case, data will not survive a page refresh.

The app uses these Local Storage keys:
- `tripnest_users_v1`
- `tripnest_session_v1`
- `tripnest_tours_v1`
- `tripnest_bookings_v1`

The repaired version keeps the same keys as the earlier project so existing demo data in the same browser origin can be reused when its format is valid.

## 5. Review demonstration flow

1. Open the home page and show the travel catalogue.
2. Log in with the demo user credentials.
3. Open **My dashboard** and select a journey.
4. Choose a travel date and number of travellers, then submit the booking request.
5. Show the new booking under **My bookings** with Pending status.
6. Log out and log in with the demo admin credentials.
7. Open **Admin panel** and add or edit a tour package.
8. Change the user's booking status to Confirmed or Cancelled.
9. Log back in as the user and show the updated status.
10. Refresh `/user` and `/admin` directly to demonstrate route handling.

## 6. Build before submission

Run:

```bash
npm run build
```

A successful build creates the `dist/` folder. To preview the production build locally:

```bash
npm run preview
```

## 7. Deploy to Vercel

1. Push the extracted project folder to a GitHub repository.
2. Sign in to Vercel and select **Add New → Project**.
3. Import the GitHub repository.
4. Use these settings:
   - Framework Preset: **Vite**
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`
5. Deploy the project.
6. Test signup, login, booking, admin updates and direct refresh of `/user` and `/admin`.

The included `vercel.json` rewrites app routes to `index.html`, which allows React Router routes to work after refresh.

## 8. Troubleshooting

### `npm` is not recognized
Install Node.js from the official Node.js website, close and reopen VS Code, then run `node -v` and `npm -v` again.

### `npm install` fails or gets stuck
Check your internet connection, then run:

```bash
npm cache verify
npm install
```

If the terminal reports a permission or script-policy error in PowerShell, open Command Prompt in VS Code and run the same npm commands there.

### Port 5173 is already in use
Vite will offer another available port in the terminal. Open the exact URL printed by Vite.

### Login does not accept the demo credentials
The browser may contain old or corrupted demo data. Open the website, press `F12`, go to **Application → Local Storage**, select the current site, delete keys beginning with `tripnest_`, and refresh the page. The demo accounts and starter tours will be created again.

### Direct `/user` or `/admin` refresh shows a 404 after deployment
Confirm that `vercel.json` is present in the deployed project root and redeploy.

## 9. Project structure

```text
travel-agency-review/
├── src/
│   ├── components/
│   │   ├── ProtectedRoute.jsx
│   │   └── SiteLayout.jsx
│   ├── context/
│   │   └── AuthContext.jsx
│   ├── lib/
│   │   └── storage.js
│   ├── pages/
│   │   ├── AdminDashboard.jsx
│   │   ├── Home.jsx
│   │   ├── Login.jsx
│   │   ├── Signup.jsx
│   │   └── UserDashboard.jsx
│   ├── App.jsx
│   ├── main.jsx
│   └── styles.css
├── index.html
├── package.json
├── vercel.json
├── vite.config.js
└── README.md
```

## 10. Important security note

This is a classroom demonstration because the assignment asks for Local Storage-based login. It is **not production authentication**. Browser storage can be inspected and changed, and demo passwords are stored in plain text. A real booking website needs a backend, database, server-side authorization and securely hashed passwords. Do not store real customer information in this project.
