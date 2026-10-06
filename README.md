# CryptoX Premium Trading UI

A GitHub-ready, mobile-first crypto trading interface.

## Important
This repository is a front-end practice/simulation project. It does not implement real-money deposits, withdrawals, custody, or guaranteed investment returns.

## Files
- `index.html` — app shell
- `css/styles.css` — premium responsive UI
- `js/app.js` — market cards, 30-second practice trade engine, 5-slot-per-coin rule, history
- `README.md` — setup

## Run locally
Open `index.html` in a browser, or use VS Code Live Server.

## GitHub Pages
1. Create a new GitHub repository.
2. Upload `index.html`, `css/`, `js/`, and `README.md`.
3. Repository → Settings → Pages.
4. Choose `Deploy from a branch`.
5. Select `main` and `/ (root)`.
6. Save. GitHub will publish the site.

## Market API
The sample frontend tries CoinGecko's public simple-price endpoint. For production, route market requests through your own backend/serverless function and keep private API credentials server-side.

## Next production layer
- Backend API
- Authentication
- Database
- Server-side trade ledger
- WebSocket/live market feed
- Admin dashboard
- Audit logs
- Compliance and payment integration where legally appropriate
