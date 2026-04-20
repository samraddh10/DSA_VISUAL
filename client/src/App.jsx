import { lazy, Suspense, useEffect } from 'react'
import { Routes, Route } from 'react-router-dom'
import Navbar from './components/layout/Navbar.jsx'
import Footer from './components/layout/Footer.jsx'
import ProtectedRoute from './components/auth/ProtectedRoute.jsx'
import useAuthStore from './stores/authStore.js'

const Home = lazy(() => import('./pages/Home.jsx'))
const SortingPage = lazy(() => import('./pages/SortingPage.jsx'))
const SearchingPage = lazy(() => import('./pages/SearchingPage.jsx'))
const LinkedListPage = lazy(() => import('./pages/LinkedListPage.jsx'))
const StackQueuePage = lazy(() => import('./pages/StackQueuePage.jsx'))
const TreePage = lazy(() => import('./pages/TreePage.jsx'))
const HeapPage = lazy(() => import('./pages/HeapPage.jsx'))
const GraphPage = lazy(() => import('./pages/GraphPage.jsx'))
const DPPage = lazy(() => import('./pages/DPPage.jsx'))
const ComparisonPage = lazy(() => import('./pages/ComparisonPage.jsx'))
const QuizPage = lazy(() => import('./pages/QuizPage.jsx'))
const LoginPage = lazy(() => import('./pages/LoginPage.jsx'))
const RegisterPage = lazy(() => import('./pages/RegisterPage.jsx'))
const ProfilePage = lazy(() => import('./pages/ProfilePage.jsx'))

function LoadingFallback() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="w-8 h-8 border-2 border-neon-purple border-t-transparent rounded-full animate-spin" />
    </div>
  )
}

export default function App() {
  const fetchMe = useAuthStore((s) => s.fetchMe)

  useEffect(() => {
    fetchMe()
  }, [fetchMe])

  return (
    <div className="min-h-screen bg-bg-primary flex flex-col">
      <Navbar />
      <main className="flex-1 pt-24">
        <Suspense fallback={<LoadingFallback />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/sorting" element={<SortingPage />} />
            <Route path="/searching" element={<SearchingPage />} />
            <Route path="/linked-list" element={<LinkedListPage />} />
            <Route path="/stack-queue" element={<StackQueuePage />} />
            <Route path="/trees" element={<TreePage />} />
            <Route path="/heaps" element={<HeapPage />} />
            <Route path="/graphs" element={<GraphPage />} />
            <Route path="/dp" element={<DPPage />} />
            <Route path="/compare" element={<ComparisonPage />} />
            <Route path="/quiz" element={<QuizPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              }
            />
          </Routes>
        </Suspense>
      </main>
      <Footer />
    </div>
  )
}
