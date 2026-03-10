import { useState } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { useAuth } from './context/AuthContext'
import Navbar from './components/layout/Navbar'
import LeftSidebar from './components/layout/LeftSidebar'
import LandingPage from './pages/LandingPage'
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import WritePage from './pages/WritePage'
import PostPage from './pages/PostPage'
import ProfilePage from './pages/ProfilePage'
import SearchPage from './pages/SearchPage'
import BookmarksPage from './pages/BookmarksPage'
import EditPostPage from './pages/EditPostPage'
import EditProfilePage from './pages/EditProfilePage'
import NotificationsPage from './pages/NotificationsPage'

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <div />
  if (!user) return <Navigate to="/login" replace />
  return children
}

export default function App() {
  const { user } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // Landing page = no sidebars, special navbar
  const isLanding = !user

  return (
    <>
      <Navbar onMenuToggle={() => setSidebarOpen(true)} isLanding={isLanding} />
      <div className={`flex min-h-[calc(100vh-64px)]`}>
        {!isLanding && (
          <LeftSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        )}
        <div className="flex-1 min-w-0">
      <Routes>
        <Route path="/" element={user ? <HomePage /> : <LandingPage />} />
        <Route
          path="/login"
          element={user ? <Navigate to="/" /> : <LoginPage />}
        />
        <Route
          path="/register"
          element={user ? <Navigate to="/" /> : <RegisterPage />}
        />
        <Route
          path="/write"
          element={
            <ProtectedRoute>
              <WritePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/edit/:slug"
          element={
            <ProtectedRoute>
              <EditPostPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <EditProfilePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/bookmarks"
          element={
            <ProtectedRoute>
              <BookmarksPage />
            </ProtectedRoute>
          }
        />
        <Route path="/search" element={<SearchPage />} />
        <Route
          path="/notifications"
          element={
            <ProtectedRoute>
              <NotificationsPage />
            </ProtectedRoute>
          }
        />
        <Route path="/post/:slug" element={<PostPage />} />
        <Route path="/:username" element={<ProfilePage />} />
      </Routes>
        </div>
      </div>
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            fontFamily: "'DM Sans', system-ui, sans-serif",
            fontSize: '14px',
            background: '#1a1a1a',
            color: '#faf9f6',
            borderRadius: '4px',
          },
        }}
      />
    </>
  )
}
