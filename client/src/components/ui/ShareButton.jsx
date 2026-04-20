import { useState } from 'react'
import { useLocation } from 'react-router-dom'
import { Share2, Check } from 'lucide-react'
import { buildShareUrl, copyToClipboard } from '../../lib/shareLink.js'

export default function ShareButton({ state, label = 'Share' }) {
  const location = useLocation()
  const [copied, setCopied] = useState(false)

  async function handleShare() {
    const url = buildShareUrl(location.pathname, state)
    const ok = await copyToClipboard(url)
    if (ok) {
      setCopied(true)
      setTimeout(() => setCopied(false), 1600)
    }
  }

  return (
    <button
      type="button"
      onClick={handleShare}
      aria-label="Share visualization"
      className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-purple-200 bg-slate-900/50 border border-purple-500/30 hover:bg-slate-800/60 hover:border-purple-400/50 transition-colors duration-200 cursor-pointer"
    >
      {copied ? (
        <>
          <Check className="w-4 h-4 text-emerald-400" />
          <span>Copied!</span>
        </>
      ) : (
        <>
          <Share2 className="w-4 h-4" />
          <span>{label}</span>
        </>
      )}
    </button>
  )
}
