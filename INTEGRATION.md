# AD Property Rental — Frontend ↔ Backend integration

The backend (`PropertyRental-Server`) is used **unchanged**. This frontend calls it directly from the browser with a JWT bearer token.

## 1. Configure the API URL

Create `.env` in the frontend root (optional — defaults to `http://localhost:5000`):

```
VITE_API_URL=http://localhost:5000
```

All requests go through `src/lib/api.ts`.

## 2. Run both apps

```bash
# backend (needs SQL Server running + its own .env with DB, JWT_SECRET, Cloudinary, Stripe keys)
cd PropertyRental-Server-main
npm install
node server.js            # listens on PORT or 5000

# frontend
bun install
bun run dev               # http://localhost:8080
```

Database: run `database/schema.sql` (and optionally `seed.sql`) on SQL Server first.

## 3. Things the frontend cannot fix automatically (backend unchanged)

1. **CORS is not enabled.** `cors` is in the backend's package.json but not used in `server.js`, so browsers block every request from the frontend's origin. Add, right after `const app = express();`:
   ```js
   app.use(require("cors")({ origin: ["http://localhost:8080"] }));
   ```
   (Include your hosted site URL in the list if you use one.)
2. **Hosted preview cannot reach `localhost`.** The hosted preview runs on the internet; it cannot call a server on your computer. Run the frontend locally, or expose the backend publicly (e.g. a tunnel) and set `VITE_API_URL` to that address.
3. **Renter inquiries route is shadowed.** `GET /properties/renter/inquiries` is declared *after* `GET /properties/:id`, so Express matches `:id = "renter"` and returns "Invalid property ID". The renter "Inquiries" screen shows that error until the route is moved above `/:id`.
4. **Stripe redirects** go to `http://localhost:5000/payment/success|cancelled` (backend HTML pages), not back to this frontend. The webhook (`stripe listen --forward-to localhost:5000/payments/webhook`) must be running for payments to be marked paid.
5. **Admin role**: signup accepts any role; there is no admin creation flow. Create admins directly in the `Users` table.
6. Not available in the backend, so not shown: forgot/reset password, favorites, reviews, notifications, categories, property approval, admin edit/delete actions.
