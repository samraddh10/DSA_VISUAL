import { motion } from 'framer-motion'
import { STEP_TYPES } from '../../engine/types.js'

const BAR_GRADIENTS = {
  default: 'linear-gradient(to top, rgb(124, 58, 237), rgb(167, 139, 250))',
  [STEP_TYPES.COMPARE]: 'linear-gradient(to top, rgb(37, 99, 235), rgb(96, 165, 250))',
  [STEP_TYPES.SWAP]: 'linear-gradient(to top, rgb(225, 29, 72), rgb(251, 113, 133))',
  [STEP_TYPES.SET]: 'linear-gradient(to top, rgb(217, 119, 6), rgb(252, 211, 77))',
  [STEP_TYPES.PIVOT]: 'linear-gradient(to top, rgb(8, 145, 178), rgb(34, 211, 238))',
  [STEP_TYPES.MERGE]: 'linear-gradient(to top, rgb(5, 150, 105), rgb(52, 211, 153))',
  [STEP_TYPES.DONE]: 'linear-gradient(to top, rgb(5, 150, 105), rgb(52, 211, 153))',
}

const BAR_GLOWS = {
  default: '0 0 15px rgba(124, 58, 237, 0.4)',
  [STEP_TYPES.COMPARE]: '0 0 20px rgba(59, 130, 246, 0.5)',
  [STEP_TYPES.SWAP]: '0 0 20px rgba(244, 63, 94, 0.5)',
  [STEP_TYPES.SET]: '0 0 15px rgba(245, 158, 11, 0.4)',
  [STEP_TYPES.PIVOT]: '0 0 20px rgba(34, 211, 238, 0.5)',
  [STEP_TYPES.MERGE]: '0 0 15px rgba(16, 185, 129, 0.4)',
  [STEP_TYPES.DONE]: '0 0 15px rgba(16, 185, 129, 0.4)',
}

export default function SortingVisualizer({ currentStep, inputArray }) {
  const array = currentStep?.state?.array || inputArray || []
  const highlights = currentStep?.highlights || []
  const sorted = currentStep?.state?.sorted || []
  const stepType = currentStep?.type || null
  const maxVal = Math.max(...array, 1)

  return (
    <div className="relative h-80 bg-slate-950/50 rounded-lg border border-purple-500/20 p-6 overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-purple-900/10 to-transparent pointer-events-none" />

      {/* Bars */}
      <div className="relative h-full flex items-end justify-center gap-[2px]">
        {array.map((value, index) => {
          const heightPct = (value / maxVal) * 100
          const isHighlighted = highlights.includes(index)
          const isSorted = sorted.includes(index) || stepType === STEP_TYPES.DONE

          let gradient = BAR_GRADIENTS.default
          let glow = BAR_GLOWS.default
          if (isSorted) {
            gradient = BAR_GRADIENTS[STEP_TYPES.DONE]
            glow = BAR_GLOWS[STEP_TYPES.DONE]
          } else if (isHighlighted && stepType) {
            gradient = BAR_GRADIENTS[stepType] || BAR_GRADIENTS.default
            glow = BAR_GLOWS[stepType] || BAR_GLOWS.default
          }

          return (
            <motion.div
              key={index}
              className="flex-1 max-w-[40px] rounded-t-sm relative group"
              style={{
                background: gradient,
                boxShadow: isHighlighted || isSorted ? glow : 'none',
              }}
              animate={{ height: `${heightPct}%` }}
              transition={{ duration: 0.15, ease: 'easeOut' }}
            >
              {/* Hover overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-cyan-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-t-sm" />

              {/* Value label */}
              {(isHighlighted || array.length <= 25) && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="absolute -top-5 left-1/2 -translate-x-1/2 text-[10px] font-mono text-slate-400 whitespace-nowrap"
                >
                  {value}
                </motion.span>
              )}
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
