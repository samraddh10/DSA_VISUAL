import { motion, AnimatePresence } from 'framer-motion'

const ITEM_COLORS = {
  default: {
    bg: 'rgba(255, 255, 255, 0.05)',
    border: 'rgba(255, 255, 255, 0.12)',
    glow: 'none',
  },
  highlight: {
    bg: 'rgba(124, 58, 237, 0.25)',
    border: 'rgba(167, 139, 250, 0.6)',
    glow: '0 0 15px rgba(124, 58, 237, 0.4)',
  },
  insert: {
    bg: 'rgba(16, 185, 129, 0.25)',
    border: 'rgba(52, 211, 153, 0.6)',
    glow: '0 0 15px rgba(16, 185, 129, 0.4)',
  },
  remove: {
    bg: 'rgba(244, 63, 94, 0.25)',
    border: 'rgba(251, 113, 133, 0.6)',
    glow: '0 0 15px rgba(244, 63, 94, 0.4)',
  },
}

export default function StackQueueVisualizer({ currentStep, mode }) {
  const items = currentStep?.state?.items || []
  const highlights = currentStep?.highlights || []
  const newItemId = currentStep?.state?.newItem
  const removedItemId = currentStep?.state?.removedItem

  function getItemStyle(id) {
    if (removedItemId === id) return ITEM_COLORS.remove
    if (newItemId === id) return ITEM_COLORS.insert
    if (highlights.includes(id)) return ITEM_COLORS.highlight
    return ITEM_COLORS.default
  }

  if (items.length === 0) {
    return (
      <div className="relative h-64 bg-slate-950/50 rounded-lg border border-purple-500/20 p-6 overflow-hidden flex items-center justify-center">
        <div className="absolute inset-0 bg-gradient-to-t from-purple-900/10 to-transparent pointer-events-none" />
        <p className="text-text-muted text-sm font-mono relative z-10">
          Empty {mode} — add an element to begin
        </p>
      </div>
    )
  }

  if (mode === 'stack') {
    // Vertical stack — top is visually at the top
    const displayItems = [...items].reverse()

    return (
      <div className="relative min-h-64 bg-slate-950/50 rounded-lg border border-purple-500/20 p-6 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-purple-900/10 to-transparent pointer-events-none" />

        <div className="relative flex flex-col items-center gap-1.5 py-2">
          <span className="text-[11px] font-mono font-bold text-neon-purple-light mb-1">TOP</span>
          <AnimatePresence mode="popLayout">
            {displayItems.map((item) => {
              const style = getItemStyle(item.id)
              return (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, scale: 0.8, y: -20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.8, y: -20 }}
                  transition={{ duration: 0.2, ease: 'easeOut' }}
                  className="w-36 h-12 flex items-center justify-center rounded-lg border-2 font-mono text-sm font-medium"
                  style={{
                    backgroundColor: style.bg,
                    borderColor: style.border,
                    boxShadow: style.glow,
                  }}
                >
                  <span className="text-text-primary">{item.value}</span>
                </motion.div>
              )
            })}
          </AnimatePresence>
          <span className="text-[11px] font-mono text-text-muted mt-1">BOTTOM</span>
        </div>
      </div>
    )
  }

  // Queue — horizontal, front on left, rear on right
  return (
    <div className="relative h-40 bg-slate-950/50 rounded-lg border border-purple-500/20 p-6 overflow-hidden flex items-center">
      <div className="absolute inset-0 bg-gradient-to-t from-purple-900/10 to-transparent pointer-events-none" />

      <div className="relative w-full overflow-x-auto">
        <div className="flex items-center justify-center gap-2 min-w-fit mx-auto px-2">
          <span className="text-[11px] font-mono font-bold text-neon-purple-light mr-1 shrink-0">
            FRONT
          </span>
          <AnimatePresence mode="popLayout">
            {items.map((item) => {
              const style = getItemStyle(item.id)
              return (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, scale: 0.8, x: 20 }}
                  animate={{ opacity: 1, scale: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.8, x: -20 }}
                  transition={{ duration: 0.2, ease: 'easeOut' }}
                  className="w-14 h-14 flex items-center justify-center rounded-lg border-2 font-mono text-sm font-medium shrink-0"
                  style={{
                    backgroundColor: style.bg,
                    borderColor: style.border,
                    boxShadow: style.glow,
                  }}
                >
                  <span className="text-text-primary">{item.value}</span>
                </motion.div>
              )
            })}
          </AnimatePresence>
          <span className="text-[11px] font-mono font-bold text-neon-purple-light ml-1 shrink-0">
            REAR
          </span>
        </div>
      </div>
    </div>
  )
}
