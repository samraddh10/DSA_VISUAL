import { lazy, Suspense } from 'react'
import { Routes, Route } from 'react-router-dom'
import Navbar from './components/layout/Navbar.jsx'
import Footer from './components/layout/Footer.jsx'

const Home = lazy(() => import('./pages/Home.jsx'))
const SortingPage = lazy(() => import('./pages/SortingPage.jsx'))
const SearchingPage = lazy(() => import('./pages/SearchingPage.jsx'))
const LinkedListPage = lazy(() => import('./pages/LinkedListPage.jsx'))
const StackQueuePage = lazy(() => import('./pages/StackQueuePage.jsx'))
const TreePage = lazy(() => import('./pages/TreePage.jsx'))
const HeapPage = lazy(() => import('./pages/HeapPage.jsx'))

function LoadingFallback() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="w-8 h-8 border-2 border-neon-purple border-t-transparent rounded-full animate-spin" />
    </div>
  )
}

export default function App() {
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
          </Routes>
        </Suspense>
      </main>
      <Footer />
    </div>
  )
}
