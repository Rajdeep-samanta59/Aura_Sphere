Deploying AuraSphere to Vercel (GitHub integration)

This document lists the minimal steps and environment variables required to deploy the Client (Vite) and Server (Express) with Vercel using GitHub integration.

Recommended approach: Create two Vercel projects (Client & Server).

1) Frontend (Client)
- Git Root / Project Root: `Client`
- Build command: `npm run build`
- Output directory: `dist`
- Important env (Project > Settings > Environment Variables):
  - VITE_API_URL = https://<your-backend-domain>

2) Backend (Server)
- Git Root / Project Root: `Server`
- Vercel will use `Server/vercel.json` to deploy this Express app as serverless functions.
- Add the following Environment Variables in the Vercel Project settings (do not commit these to git):
  - MONGODB_URI
  - JWT_SECRET
  - SESSION_SECRET (optional; only if you set USE_SESSION=true)
  - USE_SESSION (set to `false` in serverless deployments; `true` only if you configure a persistent session store)
  - FRONTEND_URL = https://<your-frontend-domain>
  - GOOGLE_CLIENT_ID
  - GOOGLE_CLIENT_SECRET
  - GITHUB_CLIENT_ID
  - GITHUB_CLIENT_SECRET
  - CLOUDINARY_CLOUD_NAME (or CLOUDNAME)
  - CLOUDINARY_API_KEY (or API_KEY)
  - CLOUDINARY_API_SECRET (or API_SECRET)

3) OAuth provider settings (after backend domain is known)
- Google: add redirect URI `https://<backend>/api/auth/google/callback`
- GitHub: add callback URL `https://<backend>/api/auth/github/callback`
- Ensure the backend `FRONTEND_URL` env var points to your frontend domain so the server redirects correctly after OAuth.

4) Notes & tips
- Sessions & serverless: default in-memory `express-session` will not work on Vercel. Keep `USE_SESSION=false` or use a persistent store like `connect-mongo`.
- For near real-time leaderboard, client polling is enabled every 15s in the dashboard. If you need instant updates, implement websockets or server-sent events on a non-serverless host.
- Test local flow with the same env values (use a staging DB) before switching DNS or updating production OAuth redirect URIs.

If you want, I can also add a small `vercel.json` for a combined deploy (monorepo routes), but two separate projects is simpler and more maintainable.
