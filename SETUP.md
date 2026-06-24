# Setup

Install the new dependencies this implementation needs:

```bash
npm install react-router-dom axios
npm install -D tailwindcss postcss autoprefixer
```

Make sure `src/main.tsx` imports `./index.css`, and that `vite.config.ts` already supports React + TS (unchanged).

Set the API base URL in a `.env` file at the project root:

```
VITE_API_URL=http://localhost:5000/api
```

Files included:
- `src/api/api.ts` — typed Axios instance, auth + products endpoints, interceptors
- `src/contexts/AuthContext.tsx` — auth state, login/logout, token persistence
- `src/router/AppRouter.tsx` — route definitions
- `src/components/ProtectedRoute.tsx` — route guard
- `src/layouts/AdminLayout.tsx`, `src/components/Sidebar.tsx`, `src/components/Header.tsx`
- `src/pages/Login.tsx`, `src/pages/Dashboard.tsx`, `src/pages/Products.tsx`
- `src/App.tsx`, `src/index.css`
- `tailwind.config.js`, `postcss.config.js`
