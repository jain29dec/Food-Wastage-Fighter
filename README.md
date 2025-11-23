# gniot - Local Backend for Frontend Demo
<!--  README.md-->

This workspace now includes a minimal Express backend to support the frontend in this repo (`index_1.html` + `script_1.js`). It provides in-memory listings, basic auth (token generated on register/login), and endpoints for claims and listing management.

Quick start (Windows PowerShell):

1. Open PowerShell in this project folder:

```powershell
cd "C:\Users\shalu\OneDrive\Desktop\gniot"
```

2. Install dependencies:

```powershell
npm install
```

3. Start the server:

```powershell
npm start
```

The server will run at http://localhost:3000 and serve `index_1.html`. The front-end can point to the API by defining `API_BASE_URL` in a small script tag before including `script_1.js`, e.g.:

```html
<script>const API_BASE_URL = 'http://localhost:3000';</script>
<script src="script_1.js"></script>
```

Auth notes:
- POST /auth/register with { name, email, password, type } returns { token, user }
- POST /auth/login with { email } returns { token, user } (for convenience it will auto-create a user if not found)

Endpoints:
- GET /listings
- POST /listings (requires business user token)
- DELETE /listings/:id (requires token; businesses can only delete their own listings)
- POST /claims (requires token)

This is an in-memory demo server; data will reset when the server restarts.
