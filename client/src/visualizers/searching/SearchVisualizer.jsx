import { motion } from 'framer-motion'
import { STEP_TYPES } from '../../engine/types.js'

const CELL_COLORS = {
  default: {
    bg: 'rgba(255, 255, 255, 0.05)',
    border: 'rgba(255, 255, 255, 0.1)',
    glow: 'none',
  },
  active: {
    bg: 'rgba(124, 58, 237, 0.3)',
    border: 'rgba(167, 139, 250, 0.6)',
    glow: '0 0 15px rgba(124, 58, 237, 0.4)',
  },
  range: {
    bg: 'rgba(124, 58, 237, 0.08)',
    border: 'rgba(124, 58, 237, 0.25)',
    glow: 'none',
  },
  found: {
    bg: 'rgba(16, 185, 129, 0.3)',
    border: 'rgba(52, 211, 153, 0.6)',
    glow: '0 0 20px rgba(16, 185, 129, 0.5)',
  },
  eliminated: {
    bg: 'rgba(255, 255, 255, 0.02)',
    border: 'rgba(255, 255, 255, 0.05)',
    glow: 'none',
  },
}

export default function SearchVisualizer({ currentStep, inputArray }) {
  const array = currentStep?.state?.array || inputArray || []
  const { current, low, high, mid, found } = currentStep?.state || {}
  const highlights = currentStep?.highlights || []
  const stepType = currentStep?.type || null

  function getCellStyle(index) {
    if (found !== undefined && found === index) return CELL_COLORS.found
    if (highlights.includes(index)) return CELL_COLORS.active
    // Binary search: dim cells outside active range
    if (low !== undefined && high !== undefined) {
      if (index >= low && index <= high) return CELL_COLORS.range
      return CELL_COLORS.eliminated
    }
    // Linear search: dim cells already checked
    if (current !== undefined && current >= 0 && index < current && stepType !== STEP_TYPES.FOUND) {
      return CELL_COLORS.eliminated
    }
    return CELL_COLORS.default
  }

  function getPointerLabel(index) {
    const labels = []
    if (low !== undefined && index === low) labels.push('L')
    if (high !== undefined && index === high) labels.push('H')
    if (mid !== undefined && index === mid) labels.push('M')
    if (current !== undefined && current >= 0 && index === current && mid === undefined)
      labels.push('\u2192')
    return labels.join(' ')
  }

  if (array.length === 0) return null

  return (
    <div className="relative h-52 bg-slate-950/50 rounded-lg border border-purple-500/20 p-6 overflow-hidden flex items-center">
      <div className="absolute inset-0 bg-gradient-to-t from-purple-900/10 to-transparent pointer-events-none" />

      <div className="relative w-full overflow-x-auto">
        <div className="flex items-center justify-center gap-1.5 min-w-fit mx-auto px-2">
          {array.map((value, index) => {
            const style = getCellStyle(index)
            const label = getPointerLabel(index)

            return (
              <div key={index} className="flex flex-col items-center gap-1">
                {/* Pointer label above */}
                <span className="h-5 text-[11px] font-mono font-bold text-neon-purple-light">
                  {label}
                </span>

                {/* Cell */}
                <motion.div
                  className="w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center rounded-lg border-2 font-mono text-sm font-medium"
                  animate={{
                    backgroundColor: style.bg,
                    borderColor: style.border,
                    boxShadow: style.glow,
                    scale: highlights.includes(index) || found === index ? 1.08 : 1,
                  }}
                  transition={{ duration: 0.15, ease: 'easeOut' }}
                >
                  <span
                    className={
                      found === index
                        ? 'text-neon-green font-bold'
                        : highlights.includes(index)
                          ? 'text-neon-purple-light font-bold'
                          : style === CELL_COLORS.eliminated
                            ? 'text-text-muted'
                            : 'text-text-primary'
                    }
                  >
                    {value}
                  </span>
                </motion.div>

                {/* Index below */}
                <span className="text-[10px] font-mono text-text-muted">{index}</span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
