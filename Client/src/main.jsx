import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import Landing from './component/Landing.jsx'
import ErrorPage from './component/ErrorPage.jsx'
import { Route, RouterProvider, createBrowserRouter, createRoutesFromElements } from 'react-router-dom'
import './index.css'
import GoalsPage from './component/GoalsPage.jsx'
import LoginPage from './component/LoginPage.jsx'
import Leaderboard from './component/Leaderboard.jsx'
import Dashboard from './component/Dashboard.jsx'
import Assignment from './component/Assignment.jsx'
import AuthCallback from './component/AuthCallback.jsx';
const router = createBrowserRouter(
  createRoutesFromElements(
    <>
      <Route path="/" element={<Landing />} errorElement={<ErrorPage />} />
      <Route path="/register" element={<LoginPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/home" element={<Dashboard />} />
      <Route path="/goals" element={<GoalsPage />} />
      <Route path="/leaderboard" element={<Leaderboard />} />
      <Route path="/assignments" element={<Assignment />} />
      <Route path="/auth/callback" element={<AuthCallback />} />
      {/* Catch-all route to render friendly error page for unknown paths */}
      <Route path="*" element={<ErrorPage />} />
    </>
  )
)
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
