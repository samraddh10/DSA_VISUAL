import { useMemo } from 'react'
import { motion } from 'framer-motion'

const NODE_R = 22
const SVG_W = 720
const SVG_H = 460

const NODE_COLORS = {
  default: { fill: 'rgba(255,255,255,0.05)', stroke: 'rgba(255,255,255,0.18)', glow: 'none' },
  current: { fill: 'rgba(251,191,36,0.35)', stroke: 'rgba(251,191,36,0.8)', glow: '0 0 18px rgba(251,191,36,0.5)' },
  visited: { fill: 'rgba(124,58,237,0.3)', stroke: 'rgba(167,139,250,0.7)', glow: '0 0 12px rgba(124,58,237,0.4)' },
  inMST: { fill: 'rgba(16,185,129,0.3)', stroke: 'rgba(52,211,153,0.7)', glow: '0 0 12px rgba(16,185,129,0.4)' },
  start: { fill: 'rgba(34,211,238,0.3)', stroke: 'rgba(34,211,238,0.8)', glow: '0 0 14px rgba(34,211,238,0.5)' },
  end: { fill: 'rgba(244,63,94,0.3)', stroke: 'rgba(244,63,94,0.8)', glow: '0 0 14px rgba(244,63,94,0.5)' },
  pathNode: { fill: 'rgba(167,139,250,0.35)', stroke: 'rgba(167,139,250,0.9)', glow: '0 0 16px rgba(167,139,250,0.55)' },
}

const EDGE_COLORS = {
  default: { stroke: 'rgba(255,255,255,0.15)', width: 1.5, dash: null },
  explored: { stroke: 'rgba(124,58,237,0.5)', width: 2, dash: null },
  considering: { stroke: 'rgba(251,191,36,0.85)', width: 3, dash: null },
  mst: { stroke: 'rgba(16,185,129,0.9)', width: 3, dash: null },
  path: { stroke: 'rgba(167,139,250,0.95)', width: 3.5, dash: null },
  rejected: { stroke: 'rgba(244,63,94,0.35)', width: 1.5, dash: '4 4' },
  candidate: { stroke: 'rgba(34,211,238,0.5)', width: 2, dash: '3 3' },
}

function edgeKey(a, b) {
  return a < b ? `${a}-${b}` : `${b}-${a}`
}

export default function GraphVisualizer({
  currentStep,
  nodes = [],
  edges = [],
  positions,
  weighted = false,
  startId = null,
  endId = null,
}) {
  const state = currentStep?.state || {}
  const highlights = currentStep?.highlights || []

  const visited = useMemo(() => new Set(state.visited || []), [state.visited])
  const inMST = useMemo(() => new Set(state.inMST || []), [state.inMST])
  const mstEdges = useMemo(() => new Set(state.mstEdges || []), [state.mstEdges])
  const exploredEdges = useMemo(() => new Set(state.exploredEdges || []), [state.exploredEdges])
  const relaxedEdges = useMemo(() => new Set(state.relaxedEdges || []), [state.relaxedEdges])
  const rejectedEdges = useMemo(() => new Set(state.rejectedEdges || []), [state.rejectedEdges])
  const pathEdges = useMemo(() => new Set(state.pathEdges || []), [state.pathEdges])
  const candidateEdges = useMemo(() => new Set(state.candidateEdges || []), [state.candidateEdges])
  const consideringKey = state.consideringKey ?? null
  const current = state.current ?? null
  const distances = state.distances || null

  if (!nodes.length) {
    return (
      <div className="relative h-[460px] bg-slate-950/50 rounded-lg border border-purple-500/20 overflow-hidden flex items-center justify-center">
        <div className="absolute inset-0 bg-gradient-to-t from-purple-900/10 to-transparent pointer-events-none" />
        <p className="text-text-muted text-sm font-mono relative z-10">
          No graph — generate one to begin
        </p>
      </div>
    )
  }

  function getNodeStyle(id) {
    if (highlights[0] === id && !visited.has(id) && !inMST.has(id)) return NODE_COLORS.current
    if (id === current) return NODE_COLORS.current
    if (endId != null && id === endId && pathEdges.size > 0) return NODE_COLORS.pathNode
    if (inMST.has(id)) return NODE_COLORS.inMST
    if (visited.has(id)) return NODE_COLORS.visited
    if (id === startId) return NODE_COLORS.start
    if (id === endId) return NODE_COLORS.end
    return NODE_COLORS.default
  }

  function getEdgeStyle(e) {
    const key = edgeKey(e.source, e.target)
    if (key === consideringKey) return EDGE_COLORS.considering
    if (pathEdges.has(key)) return EDGE_COLORS.path
    if (mstEdges.has(key)) return EDGE_COLORS.mst
    if (rejectedEdges.has(key)) return EDGE_COLORS.rejected
    if (candidateEdges.has(key)) return EDGE_COLORS.candidate
    if (relaxedEdges.has(key) || exploredEdges.has(key)) return EDGE_COLORS.explored
    return EDGE_COLORS.default
  }

  return (
    <div className="relative bg-slate-950/50 rounded-lg border border-purple-500/20 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-t from-purple-900/10 to-transparent pointer-events-none" />
      <div className="overflow-auto p-4" style={{ maxHeight: '480px' }}>
        <svg
          width={SVG_W}
          height={SVG_H}
          viewBox={`0 0 ${SVG_W} ${SVG_H}`}
          className="mx-auto block"
          style={{ minWidth: SVG_W }}
        >
          <defs>
            <filter id="graphGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="2.5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Edges */}
          {edges.map((e) => {
            const from = positions.get(e.source)
            const to = positions.get(e.target)
            if (!from || !to) return null

            const style = getEdgeStyle(e)
            const midX = (from.x + to.x) / 2
            const midY = (from.y + to.y) / 2

            const key = edgeKey(e.source, e.target)
            const isEmphasized =
              key === consideringKey ||
              pathEdges.has(key) ||
              mstEdges.has(key)

            return (
              <g key={`${e.source}-${e.target}`}>
                <motion.line
                  x1={from.x}
                  y1={from.y}
                  x2={to.x}
                  y2={to.y}
                  stroke={style.stroke}
                  strokeWidth={style.width}
                  strokeDasharray={style.dash || undefined}
                  filter={isEmphasized ? 'url(#graphGlow)' : undefined}
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 1 }}
                  transition={{ duration: 0.25 }}
                />
                {weighted && e.weight != null && (
                  <g>
                    <rect
                      x={midX - 11}
                      y={midY - 9}
                      width={22}
                      height={18}
                      rx={4}
                      fill="rgba(15,15,35,0.9)"
                      stroke="rgba(124,58,237,0.4)"
                      strokeWidth={1}
                    />
                    <text
                      x={midX}
                      y={midY + 1}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fill="rgb(226,232,240)"
                      style={{ fontSize: '11px', fontFamily: "'JetBrains Mono', monospace", fontWeight: 600 }}
                    >
                      {e.weight}
                    </text>
                  </g>
                )}
              </g>
            )
          })}

          {/* Nodes */}
          {nodes.map((n) => {
            const pos = positions.get(n.id)
            if (!pos) return null
            const style = getNodeStyle(n.id)
            const label = n.label ?? String(n.id)
            const dist = distances?.[n.id]

            return (
              <motion.g
                key={n.id}
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.25 }}
              >
                <motion.circle
                  cx={pos.x}
                  cy={pos.y}
                  r={NODE_R}
                  animate={{ fill: style.fill, stroke: style.stroke }}
                  strokeWidth={2.5}
                  transition={{ duration: 0.2 }}
                  style={{ filter: style.glow !== 'none' ? `drop-shadow(${style.glow})` : 'none' }}
                />
                <text
                  x={pos.x}
                  y={pos.y + 1}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="fill-text-primary font-bold"
                  style={{ fontSize: '14px', fontFamily: "'JetBrains Mono', monospace" }}
                >
                  {label}
                </text>
                {distances && dist !== undefined && (
                  <text
                    x={pos.x}
                    y={pos.y - NODE_R - 6}
                    textAnchor="middle"
                    fill="rgb(167,139,250)"
                    style={{ fontSize: '10px', fontFamily: "'JetBrains Mono', monospace", fontWeight: 600 }}
                  >
                    {dist === null ? '∞' : dist}
                  </text>
                )}
              </motion.g>
            )
          })}
        </svg>
      </div>

      {/* Frontier strip */}
      {(state.queue || state.stack || state.visitOrder) && (
        <div className="px-4 pb-3 pt-1 border-t border-purple-500/10 space-y-1.5">
          {state.queue && state.queue.length > 0 && (
            <FrontierRow label="Queue" items={state.queue} nodes={nodes} color="cyan" />
          )}
          {state.stack && state.stack.length > 0 && (
            <FrontierRow label="Stack" items={state.stack} nodes={nodes} color="amber" />
          )}
          {state.visitOrder && state.visitOrder.length > 0 && (
            <FrontierRow label="Visited" items={state.visitOrder} nodes={nodes} color="purple" />
          )}
        </div>
      )}
    </div>
  )
}

function FrontierRow({ label, items, nodes, color }) {
  const palette = {
    cyan: { bg: 'bg-cyan-600/20', border: 'border-cyan-500/30', text: 'text-cyan-200', tag: 'text-cyan-300' },
    amber: { bg: 'bg-amber-600/20', border: 'border-amber-500/30', text: 'text-amber-200', tag: 'text-amber-300' },
    purple: { bg: 'bg-purple-600/20', border: 'border-purple-500/30', text: 'text-purple-200', tag: 'text-purple-300' },
  }[color] || {}

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span className={`text-xs font-medium ${palette.tag}`}>{label}:</span>
      {items.map((id, i) => {
        const n = nodes.find((x) => x.id === id)
        return (
          <span
            key={`${label}-${i}`}
            className={`px-2 py-0.5 rounded text-xs font-mono ${palette.bg} border ${palette.border} ${palette.text}`}
          >
            {n?.label ?? id}
          </span>
        )
      })}
    </div>
  )
}
