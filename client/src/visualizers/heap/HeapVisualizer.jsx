import { useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { STEP_TYPES } from '../../engine/types.js'
import computeTreeLayout from '../../lib/treeLayout.js'

const NODE_W = 48
const NODE_H = 48
const H_GAP = 16
const V_GAP = 52
const PADDING = 24

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
  swap: {
    bg: 'rgba(251, 191, 36, 0.2)',
    border: 'rgba(251, 191, 36, 0.6)',
    glow: '0 0 15px rgba(251, 191, 36, 0.3)',
  },
  remove: {
    bg: 'rgba(244, 63, 94, 0.25)',
    border: 'rgba(251, 113, 133, 0.6)',
    glow: '0 0 15px rgba(244, 63, 94, 0.4)',
  },
  compare: {
    bg: 'rgba(34, 211, 238, 0.2)',
    border: 'rgba(34, 211, 238, 0.6)',
    glow: '0 0 15px rgba(34, 211, 238, 0.3)',
  },
  found: {
    bg: 'rgba(34, 211, 238, 0.25)',
    border: 'rgba(34, 211, 238, 0.6)',
    glow: '0 0 15px rgba(34, 211, 238, 0.4)',
  },
}

// Build tree structure from array indices
function arrayToTreeNodes(arr) {
  if (arr.length === 0) return { root: null, allNodes: [] }

  const nodes = arr.map((val, i) => ({
    id: i,
    value: val,
    left: null,
    right: null,
  }))

  for (let i = 0; i < nodes.length; i++) {
    const leftIdx = 2 * i + 1
    const rightIdx = 2 * i + 2
    if (leftIdx < nodes.length) nodes[i].left = nodes[leftIdx]
    if (rightIdx < nodes.length) nodes[i].right = nodes[rightIdx]
  }

  return { root: nodes[0], allNodes: nodes }
}

function getEdges(arr) {
  const edges = []
  for (let i = 0; i < arr.length; i++) {
    const left = 2 * i + 1
    const right = 2 * i + 2
    if (left < arr.length) edges.push({ from: i, to: left })
    if (right < arr.length) edges.push({ from: i, to: right })
  }
  return edges
}

export default function HeapVisualizer({ currentStep, mode }) {
  const array = currentStep?.state?.array || []
  const activeIndices = currentStep?.state?.activeIndices || []
  const swappingIndices = currentStep?.state?.swappingIndices || []
  const stepType = currentStep?.type

  const { root, allNodes } = useMemo(() => arrayToTreeNodes(array), [array])
  const positions = useMemo(
    () => computeTreeLayout(root, NODE_W, NODE_H, H_GAP, V_GAP),
    [root]
  )
  const edges = useMemo(() => getEdges(array), [array])

  function getStyle(idx) {
    if (swappingIndices.includes(idx)) return NODE_COLORS.swap
    if (activeIndices.includes(idx) && stepType === STEP_TYPES.INSERT) return NODE_COLORS.insert
    if (activeIndices.includes(idx) && stepType === STEP_TYPES.DELETE) return NODE_COLORS.remove
    if (activeIndices.includes(idx) && stepType === STEP_TYPES.FOUND) return NODE_COLORS.found
    if (activeIndices.includes(idx) && stepType === STEP_TYPES.COMPARE) return NODE_COLORS.compare
    if (activeIndices.includes(idx)) return NODE_COLORS.highlight
    return NODE_COLORS.default
  }

  if (array.length === 0) {
    return (
      <div className="space-y-3">
        <div className="relative h-48 bg-slate-950/50 rounded-lg border border-purple-500/20 p-6 overflow-hidden flex items-center justify-center">
          <div className="absolute inset-0 bg-gradient-to-t from-purple-900/10 to-transparent pointer-events-none" />
          <p className="text-text-muted text-sm font-mono relative z-10">
            Empty heap — insert a value to begin
          </p>
        </div>
        {/* Empty array strip */}
        <div className="bg-slate-950/50 rounded-lg border border-purple-500/20 px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="text-xs text-purple-300 font-medium">Array:</span>
            <span className="text-xs text-text-muted font-mono">[ ]</span>
          </div>
        </div>
      </div>
    )
  }

  // Compute bounding box for tree view
  let maxX = 0
  let maxY = 0
  for (const pos of positions.values()) {
    maxX = Math.max(maxX, pos.x)
    maxY = Math.max(maxY, pos.y)
  }

  const svgW = maxX + NODE_W + PADDING * 2
  const svgH = maxY + NODE_H + PADDING * 2

  return (
    <div className="space-y-3">
      {/* Tree visualization */}
      <div className="relative bg-slate-950/50 rounded-lg border border-purple-500/20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-purple-900/10 to-transparent pointer-events-none" />
        <div className="overflow-auto p-2" style={{ maxHeight: '340px' }}>
          <svg
            width={svgW}
            height={svgH}
            viewBox={`0 0 ${svgW} ${svgH}`}
            className="mx-auto block"
            style={{ minWidth: svgW }}
          >
            <defs>
              <filter id="heapEdgeGlow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur in="SourceGraphic" stdDeviation="2" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* Edges */}
            {edges.map((edge) => {
              const from = positions.get(edge.from)
              const to = positions.get(edge.to)
              if (!from || !to) return null

              const x1 = from.x + PADDING + NODE_W / 2
              const y1 = from.y + PADDING + NODE_H
              const x2 = to.x + PADDING + NODE_W / 2
              const y2 = to.y + PADDING

              const isActive = activeIndices.includes(edge.from) || activeIndices.includes(edge.to)

              return (
                <motion.line
                  key={`${edge.from}-${edge.to}`}
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke={isActive ? 'rgba(167, 139, 250, 0.7)' : 'rgba(255, 255, 255, 0.15)'}
                  strokeWidth={isActive ? 2.5 : 1.5}
                  filter={isActive ? 'url(#heapEdgeGlow)' : undefined}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                />
              )
            })}

            {/* Nodes */}
            <AnimatePresence>
              {allNodes.map((node) => {
                const pos = positions.get(node.id)
                if (!pos) return null

                const style = getStyle(node.id)
                const cx = pos.x + PADDING
                const cy = pos.y + PADDING

                return (
                  <motion.g
                    key={node.id}
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.5 }}
                    transition={{ duration: 0.25, ease: 'easeOut' }}
                  >
                    <motion.rect
                      x={cx}
                      y={cy}
                      width={NODE_W}
                      height={NODE_H}
                      rx={12}
                      ry={12}
                      animate={{
                        fill: style.bg,
                        stroke: style.border,
                      }}
                      strokeWidth={2}
                      transition={{ duration: 0.2 }}
                      style={{ filter: style.glow !== 'none' ? `drop-shadow(${style.glow})` : 'none' }}
                    />
                    <text
                      x={cx + NODE_W / 2}
                      y={cy + NODE_H / 2 + 1}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      className="fill-text-primary text-sm font-bold"
                      style={{ fontSize: '13px', fontFamily: "'JetBrains Mono', monospace" }}
                    >
                      {node.value}
                    </text>
                    {/* Index label */}
                    <text
                      x={cx + NODE_W / 2}
                      y={cy - 6}
                      textAnchor="middle"
                      className="fill-text-muted"
                      style={{ fontSize: '9px', fontFamily: "'JetBrains Mono', monospace" }}
                    >
                      [{node.id}]
                    </text>
                  </motion.g>
                )
              })}
            </AnimatePresence>
          </svg>
        </div>
      </div>

      {/* Array representation */}
      <div className="bg-slate-950/50 rounded-lg border border-purple-500/20 px-4 py-3">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-purple-300 font-medium shrink-0">Array:</span>
          <div className="flex gap-1 flex-wrap">
            {array.map((val, i) => {
              const style = getStyle(i)
              return (
                <motion.div
                  key={i}
                  layout
                  className="flex flex-col items-center"
                >
                  <motion.div
                    className="w-10 h-10 flex items-center justify-center rounded-lg border-2 font-mono text-xs font-bold"
                    animate={{
                      backgroundColor: style.bg,
                      borderColor: style.border,
                    }}
                    style={{ boxShadow: style.glow }}
                    transition={{ duration: 0.2 }}
                  >
                    <span className="text-text-primary">{val}</span>
                  </motion.div>
                  <span className="text-[9px] text-text-muted font-mono mt-0.5">{i}</span>
                </motion.div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
