import { motion, AnimatePresence } from 'framer-motion'
import { STEP_TYPES } from '../../engine/types.js'

const NODE_COLORS = {
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
  found: {
    bg: 'rgba(34, 211, 238, 0.25)',
    border: 'rgba(34, 211, 238, 0.6)',
    glow: '0 0 15px rgba(34, 211, 238, 0.4)',
  },
}

export default function LinkedListVisualizer({ currentStep, listType }) {
  const nodes = currentStep?.state?.nodes || []
  const headId = currentStep?.state?.headId
  const highlights = currentStep?.highlights || []
  const newNodeId = currentStep?.state?.newNode
  const removedNodeId = currentStep?.state?.removedNode
  const stepType = currentStep?.type

  // Build ordered list from head
  const map = new Map(nodes.map((n) => [n.id, n]))
  const ordered = []
  let cur = headId
  while (cur !== null && cur !== undefined) {
    const node = map.get(cur)
    if (!node) break
    ordered.push(node)
    cur = node.next
  }

  if (ordered.length === 0) {
    return (
      <div className="relative h-44 bg-slate-950/50 rounded-lg border border-purple-500/20 p-6 overflow-hidden flex items-center justify-center">
        <div className="absolute inset-0 bg-gradient-to-t from-purple-900/10 to-transparent pointer-events-none" />
        <p className="text-text-muted text-sm font-mono relative z-10">
          Empty list — insert a node to begin
        </p>
      </div>
    )
  }

  function getNodeStyle(id) {
    if (removedNodeId === id) return NODE_COLORS.remove
    if (newNodeId === id) return NODE_COLORS.insert
    if (highlights.includes(id) && stepType === STEP_TYPES.FOUND) return NODE_COLORS.found
    if (highlights.includes(id)) return NODE_COLORS.highlight
    return NODE_COLORS.default
  }

  return (
    <div className="relative h-44 bg-slate-950/50 rounded-lg border border-purple-500/20 p-6 overflow-hidden flex items-center">
      <div className="absolute inset-0 bg-gradient-to-t from-purple-900/10 to-transparent pointer-events-none" />

      <div className="relative w-full overflow-x-auto">
        <div className="flex items-center min-w-fit mx-auto px-2 gap-0">
          <AnimatePresence mode="popLayout">
            {ordered.map((node, i) => {
              const style = getNodeStyle(node.id)

              return (
                <motion.div
                  key={node.id}
                  layout
                  initial={{ opacity: 0, scale: 0.7, x: -20 }}
                  animate={{ opacity: 1, scale: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.7, x: -20 }}
                  transition={{ duration: 0.25, ease: 'easeOut' }}
                  className="flex items-center shrink-0"
                >
                  <div className="flex flex-col items-center gap-1">
                    {/* Head label */}
                    <span className="h-4 text-[10px] font-mono font-bold text-neon-purple-light">
                      {i === 0 ? 'HEAD' : ''}
                    </span>

                    {/* Node box */}
                    <motion.div
                      className="w-16 h-16 flex flex-col items-center justify-center rounded-xl border-2 font-mono relative"
                      animate={{
                        backgroundColor: style.bg,
                        borderColor: style.border,
                        boxShadow: style.glow,
                      }}
                      transition={{ duration: 0.2 }}
                    >
                      <span className="text-sm font-bold text-text-primary">{node.value}</span>
                      <span className="text-[9px] text-text-muted mt-0.5">id:{node.id}</span>
                    </motion.div>

                    {/* Position label */}
                    <span className="h-4 text-[9px] font-mono text-text-muted">pos {i}</span>
                  </div>

                  {/* Arrow to next node */}
                  {i < ordered.length - 1 ? (
                    <div className="flex flex-col items-center justify-center mx-1 w-10">
                      {/* Forward arrow */}
                      <div className="flex items-center">
                        <div className="w-7 h-0.5 bg-neon-purple-light" />
                        <div className="w-0 h-0 border-t-[5px] border-t-transparent border-b-[5px] border-b-transparent border-l-[7px] border-l-neon-purple-light" />
                      </div>
                      {/* Backward arrow for doubly */}
                      {listType === 'doubly' && (
                        <div className="flex items-center mt-1">
                          <div className="w-0 h-0 border-t-[4px] border-t-transparent border-b-[4px] border-b-transparent border-r-[6px] border-r-neon-purple/50" />
                          <div className="w-7 h-0.5 bg-neon-purple/50 border-dashed" style={{ backgroundImage: 'repeating-linear-gradient(90deg, rgba(124,58,237,0.5) 0px, rgba(124,58,237,0.5) 4px, transparent 4px, transparent 8px)' , background: 'none', borderTop: '1.5px dashed rgba(124,58,237,0.5)', height: 0 }} />
                        </div>
                      )}
                    </div>
                  ) : (
                    /* Null pointer from last node */
                    <div className="flex items-center mx-2">
                      <div className="w-5 h-0.5 bg-text-muted/30" />
                      <span className="text-[10px] font-mono text-text-muted ml-1">null</span>
                    </div>
                  )}
                </motion.div>
              )
            })}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
