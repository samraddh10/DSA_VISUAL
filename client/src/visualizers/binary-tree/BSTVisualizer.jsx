import { useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { STEP_TYPES } from '../../engine/types.js'
import computeTreeLayout from '../../lib/treeLayout.js'

const NODE_W = 52
const NODE_H = 52
const H_GAP = 20
const V_GAP = 60
const PADDING = 32

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
  compare: {
    bg: 'rgba(251, 191, 36, 0.2)',
    border: 'rgba(251, 191, 36, 0.6)',
    glow: '0 0 15px rgba(251, 191, 36, 0.3)',
  },
}

function flattenTree(node) {
  if (!node) return []
  return [node, ...flattenTree(node.left), ...flattenTree(node.right)]
}

function getEdges(node) {
  if (!node) return []
  const edges = []
  if (node.left) {
    edges.push({ from: node.id, to: node.left.id })
    edges.push(...getEdges(node.left))
  }
  if (node.right) {
    edges.push({ from: node.id, to: node.right.id })
    edges.push(...getEdges(node.right))
  }
  return edges
}

export default function BSTVisualizer({ currentStep }) {
  const root = currentStep?.state?.root || null
  const highlightedNodes = currentStep?.state?.highlightedNodes || []
  const insertedNode = currentStep?.state?.insertedNode
  const removedNode = currentStep?.state?.removedNode
  const foundNode = currentStep?.state?.foundNode
  const stepType = currentStep?.type
  const traversalResult = currentStep?.state?.traversalResult

  const positions = useMemo(
    () => computeTreeLayout(root, NODE_W, NODE_H, H_GAP, V_GAP),
    [root]
  )

  const nodes = useMemo(() => flattenTree(root), [root])
  const edges = useMemo(() => getEdges(root), [root])

  if (!root) {
    return (
      <div className="relative h-64 bg-slate-950/50 rounded-lg border border-purple-500/20 p-6 overflow-hidden flex items-center justify-center">
        <div className="absolute inset-0 bg-gradient-to-t from-purple-900/10 to-transparent pointer-events-none" />
        <p className="text-text-muted text-sm font-mono relative z-10">
          Empty tree — insert a value to begin
        </p>
      </div>
    )
  }

  // Compute bounding box
  let maxX = 0
  let maxY = 0
  for (const pos of positions.values()) {
    maxX = Math.max(maxX, pos.x)
    maxY = Math.max(maxY, pos.y)
  }

  const svgW = maxX + NODE_W + PADDING * 2
  const svgH = maxY + NODE_H + PADDING * 2

  function getNodeStyle(id) {
    if (removedNode === id) return NODE_COLORS.remove
    if (insertedNode === id) return NODE_COLORS.insert
    if (foundNode === id) return NODE_COLORS.found
    if (highlightedNodes.includes(id) && stepType === STEP_TYPES.FOUND) return NODE_COLORS.found
    if (highlightedNodes.includes(id) && stepType === STEP_TYPES.COMPARE) return NODE_COLORS.compare
    if (highlightedNodes.includes(id)) return NODE_COLORS.highlight
    return NODE_COLORS.default
  }

  return (
    <div className="relative bg-slate-950/50 rounded-lg border border-purple-500/20 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-t from-purple-900/10 to-transparent pointer-events-none" />
      <div className="overflow-auto p-4" style={{ maxHeight: '400px' }}>
        <svg
          width={svgW}
          height={svgH}
          viewBox={`0 0 ${svgW} ${svgH}`}
          className="mx-auto block"
          style={{ minWidth: svgW }}
        >
          {/* Edge glow filter */}
          <defs>
            <filter id="edgeGlow" x="-20%" y="-20%" width="140%" height="140%">
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

            const isHighlighted =
              highlightedNodes.includes(edge.to) || highlightedNodes.includes(edge.from)

            return (
              <motion.line
                key={`${edge.from}-${edge.to}`}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke={isHighlighted ? 'rgba(167, 139, 250, 0.7)' : 'rgba(255, 255, 255, 0.15)'}
                strokeWidth={isHighlighted ? 2.5 : 1.5}
                filter={isHighlighted ? 'url(#edgeGlow)' : undefined}
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ duration: 0.3 }}
              />
            )
          })}

          {/* Nodes */}
          <AnimatePresence>
            {nodes.map((node) => {
              const pos = positions.get(node.id)
              if (!pos) return null

              const style = getNodeStyle(node.id)
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
                  {/* Node background */}
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

                  {/* Value text */}
                  <text
                    x={cx + NODE_W / 2}
                    y={cy + NODE_H / 2 + 1}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    className="fill-text-primary text-sm font-bold font-mono"
                    style={{ fontSize: '14px', fontFamily: "'JetBrains Mono', monospace" }}
                  >
                    {node.value}
                  </text>
                </motion.g>
              )
            })}
          </AnimatePresence>
        </svg>
      </div>

      {/* Traversal result strip */}
      {traversalResult && traversalResult.length > 0 && (
        <div className="px-4 pb-3 pt-1 border-t border-purple-500/10">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-purple-300 font-medium">Result:</span>
            {traversalResult.map((v, i) => (
              <span
                key={i}
                className="px-2 py-0.5 rounded bg-purple-600/20 border border-purple-500/30 text-purple-200 text-xs font-mono"
              >
                {v}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
