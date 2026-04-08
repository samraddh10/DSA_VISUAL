import { Heart } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="border-t border-border-glass mt-auto">
      <div className="max-w-6xl mx-auto px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-sm text-text-muted">
          DSA Visual — Interactive Algorithm Visualizer
        </p>
        <p className="text-sm text-text-muted flex items-center gap-1">
          Built with <Heart className="w-3.5 h-3.5 text-neon-rose" /> for students
        </p>
      </div>
    </footer>
  )
}
