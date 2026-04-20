import { useState, useMemo, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  RotateCcw,
  Network,
  Code2,
  Shuffle,
} from 'lucide-react'
import { Highlight, themes } from 'prism-react-renderer'
import GraphVisualizer from '../visualizers/graph/GraphVisualizer.jsx'
import useGraphEngine, { GRAPH_ALGORITHMS } from '../visualizers/graph/useGraphEngine.js'
import { PLAYBACK_SPEEDS } from '../engine/types.js'
import computeGraphLayout, { generateRandomGraph } from '../lib/graphLayout.js'

const ALGO_IDS = ['bfs', 'dfs', 'dijkstra', 'kruskal', 'prim']

export default function GraphPage() {
  const [algorithmId, setAlgorithmId] = useState('bfs')
  const [nodeCount, setNodeCount] = useState(7)
  const [graph, setGraph] = useState(() =>
    generateRandomGraph(7, { weighted: false })
  )
  const [startId, setStartId] = useState(0)
  const [endId, setEndId] = useState(6)
  const [selectedLang, setSelectedLang] = useState('javascript')

  const algo = GRAPH_ALGORITHMS[algorithmId]

  const positions = useMemo(
    () =>
      computeGraphLayout(graph.nodes, graph.edges, {
        width: 720,
        height: 460,
      }),
    [graph]
  )

  const engine = useGraphEngine(
    algorithmId,
    graph.nodes,
    graph.edges,
    algo.needsStart ? startId : null,
    algo.needsEnd ? endId : null
  )

  const {
    currentStep,
    currentIndex,
    totalSteps,
    isPlaying,
    isAtStart,
    isAtEnd,
    speed,
    progress,
    togglePlay,
    stepForward,
    stepBackward,
    reset,
    setSpeed,
    goToStep,
    stats,
  } = engine

  const regenerate = useCallback(
    (count = nodeCount, weighted = algo.weighted) => {
      const g = generateRandomGraph(count, { weighted })
      setGraph(g)
      setStartId(g.nodes[0].id)
      setEndId(g.nodes[g.nodes.length - 1].id)
    },
    [algo.weighted, nodeCount]
  )

  // Switching to/from weighted algos: regenerate graph if weight requirement doesn't match
  useEffect(() => {
    const hasWeights = graph.edges.every((e) => e.weight != null)
    if (algo.weighted && !hasWeights) regenerate(nodeCount, true)
    if (!algo.weighted && hasWeights) {
      // keep weights but mark not-weighted rendering; weights in edges are fine
    }
  }, [algorithmId]) // eslint-disable-line react-hooks/exhaustive-deps

  const languages = [
    { id: 'javascript', label: 'JS', prism: 'javascript' },
    { id: 'cpp', label: 'C++', prism: 'cpp' },
    { id: 'c', label: 'C', prism: 'c' },
    { id: 'python', label: 'Python', prism: 'python' },
    { id: 'java', label: 'Java', prism: 'java' },
  ]

  const codeArray = algo.meta.code[selectedLang] || algo.meta.code.javascript
  const codeString = useMemo(
    () => (Array.isArray(codeArray) ? codeArray.join('\n') : codeArray),
    [codeArray]
  )
  const prismLang = languages.find((l) => l.id === selectedLang)?.prism || 'javascript'

  const displayStep = currentStep || {
    state: {
      visited: [],
      queue: [],
      stack: [],
      visitOrder: [],
      exploredEdges: [],
      relaxedEdges: [],
      mstEdges: [],
      rejectedEdges: [],
      candidateEdges: [],
      pathEdges: [],
      inMST: [],
      distances: null,
      consideringKey: null,
      current: null,
      totalWeight: 0,
    },
    highlights: [],
    type: null,
  }

  return (
    <div className="min-h-screen w-full relative overflow-hidden -mt-24 pt-24">
      <div
        className="absolute inset-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage:
            'linear-gradient(rgba(139,92,246,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(139,92,246,0.1) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />

      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl animate-pulse" />
        <div
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-600/10 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: '2s' }}
        />
      </div>

      <div className="relative z-10 p-6 space-y-6 max-w-[1400px] mx-auto">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
            <Network className="w-10 h-10 text-cyan-400" />
            Graph Visualizer
          </h1>
          <p className="text-purple-300">
            Traverse and analyze graphs with BFS, DFS, Dijkstra, Kruskal & Prim
          </p>
        </div>

        {/* Algorithm tabs */}
        <div className="bg-slate-900/50 border border-purple-500/20 backdrop-blur-sm rounded-xl p-1.5 inline-flex gap-1 flex-wrap">
          {ALGO_IDS.map((id) => (
            <button
              key={id}
              onClick={() => setAlgorithmId(id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer
                ${
                  algorithmId === id
                    ? 'bg-purple-600/30 text-purple-200 shadow-lg shadow-purple-900/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                }`}
            >
              {GRAPH_ALGORITHMS[id].meta.name}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Visualization card */}
            <div className="bg-slate-900/40 border border-purple-500/20 backdrop-blur-md rounded-2xl shadow-2xl shadow-purple-900/20 overflow-hidden">
              <div className="flex items-center justify-between px-6 py-3 border-b border-purple-500/20 flex-wrap gap-y-2">
                <span className="text-purple-200 font-semibold">Visualization</span>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-2 py-0.5 rounded-md text-xs font-mono bg-purple-950/50 border border-purple-500/30 text-purple-300">
                    Time: {algo.meta.timeComplexity}
                  </span>
                  <span className="px-2 py-0.5 rounded-md text-xs font-mono bg-cyan-950/50 border border-cyan-500/30 text-cyan-300">
                    Space: {algo.meta.spaceComplexity}
                  </span>
                  {algo.isMST && stats.totalWeight !== null && (
                    <span className="px-2 py-0.5 rounded-md text-xs font-mono bg-green-950/50 border border-green-500/30 text-green-300">
                      MST weight: {stats.totalWeight}
                    </span>
                  )}
                </div>
              </div>

              <div className="p-6 space-y-4">
                <div className="h-6 flex items-center">
                  <AnimatePresence mode="wait">
                    {currentStep?.description && (
                      <motion.p
                        key={currentStep.description}
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="text-sm text-slate-400 font-mono"
                      >
                        {currentStep.description}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>

                <GraphVisualizer
                  currentStep={displayStep}
                  nodes={graph.nodes}
                  edges={graph.edges}
                  positions={positions}
                  weighted={algo.weighted}
                  startId={algo.needsStart ? startId : null}
                  endId={algo.needsEnd ? endId : null}
                />

                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
                    <LegendDot color="rgb(34,211,238)" label="Start" />
                    {algo.needsEnd && <LegendDot color="rgb(244,63,94)" label="Target" />}
                    <LegendDot color="rgb(251,191,36)" label="Current" />
                    <LegendDot color="rgb(124,58,237)" label="Visited" />
                    {algo.isMST && <LegendDot color="rgb(16,185,129)" label="In MST" />}
                    {algo.needsEnd && <LegendDot color="rgb(167,139,250)" label="Path" />}
                  </div>
                  <div className="text-xs text-slate-500 flex gap-3">
                    <span>
                      Nodes:{' '}
                      <span className="text-purple-400 font-bold font-mono">{graph.nodes.length}</span>
                    </span>
                    <span>
                      Edges:{' '}
                      <span className="text-purple-400 font-bold font-mono">{graph.edges.length}</span>
                    </span>
                    {!algo.isMST && (
                      <span>
                        Visited:{' '}
                        <span className="text-cyan-400 font-bold font-mono">{stats.nodesVisited}</span>
                      </span>
                    )}
                  </div>
                </div>

                {totalSteps > 0 && (
                  <div className="flex items-center gap-3 pt-2">
                    <span className="text-xs font-mono text-slate-500 w-8 text-right">
                      {currentIndex}
                    </span>
                    <div
                      className="flex-1 h-1.5 bg-white/10 rounded-full cursor-pointer relative"
                      onClick={(e) => {
                        const rect = e.currentTarget.getBoundingClientRect()
                        const pct = (e.clientX - rect.left) / rect.width
                        goToStep(Math.round(pct * (totalSteps - 1)))
                      }}
                    >
                      <div
                        className="absolute top-0 left-0 h-full bg-gradient-to-r from-purple-500 to-cyan-500 rounded-full transition-all duration-100"
                        style={{ width: `${progress * 100}%` }}
                      />
                    </div>
                    <span className="text-xs font-mono text-slate-500 w-8">
                      {totalSteps > 0 ? totalSteps - 1 : 0}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Controls card */}
            <div className="bg-slate-900/40 border border-purple-500/20 backdrop-blur-md rounded-2xl shadow-2xl shadow-purple-900/20 overflow-hidden">
              <div className="px-6 py-4 border-b border-purple-500/20">
                <span className="text-purple-200 font-semibold">Controls</span>
              </div>
              <div className="p-5 space-y-4">
                {/* Graph generation + start/end */}
                <div className="flex flex-wrap items-end gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-xs text-purple-300 font-medium">Nodes</label>
                    <input
                      type="number"
                      min={3}
                      max={12}
                      value={nodeCount}
                      onChange={(e) => setNodeCount(Math.max(3, Math.min(12, Number(e.target.value) || 3)))}
                      disabled={isPlaying}
                      className="w-20 bg-slate-950/50 border border-purple-500/30 rounded-lg px-3 py-2 text-sm text-purple-200 focus:outline-none focus:border-purple-500 disabled:opacity-50 transition-colors"
                    />
                  </div>

                  <button
                    onClick={() => regenerate()}
                    disabled={isPlaying}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-neon-purple/10 border border-neon-purple/30 text-neon-purple-light hover:bg-neon-purple/20 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer text-sm font-medium transition-colors"
                  >
                    <Shuffle className="w-3.5 h-3.5" /> Generate Random
                  </button>

                  {algo.needsStart && (
                    <div className="flex flex-col gap-1">
                      <label className="text-xs text-purple-300 font-medium">Start</label>
                      <select
                        value={startId}
                        onChange={(e) => setStartId(Number(e.target.value))}
                        disabled={isPlaying}
                        className="bg-slate-950/50 border border-purple-500/30 rounded-lg px-3 py-2 text-sm text-purple-200 focus:outline-none focus:border-purple-500 disabled:opacity-50 transition-colors"
                      >
                        {graph.nodes.map((n) => (
                          <option key={n.id} value={n.id}>
                            {n.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {algo.needsEnd && (
                    <div className="flex flex-col gap-1">
                      <label className="text-xs text-purple-300 font-medium">Target</label>
                      <select
                        value={endId}
                        onChange={(e) => setEndId(Number(e.target.value))}
                        disabled={isPlaying}
                        className="bg-slate-950/50 border border-purple-500/30 rounded-lg px-3 py-2 text-sm text-purple-200 focus:outline-none focus:border-purple-500 disabled:opacity-50 transition-colors"
                      >
                        {graph.nodes.map((n) => (
                          <option key={n.id} value={n.id}>
                            {n.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>

                {/* Speed selector */}
                <div className="space-y-2">
                  <label className="text-sm text-purple-300 font-medium">Speed</label>
                  <div className="flex items-center gap-1">
                    {PLAYBACK_SPEEDS.map((s) => (
                      <button
                        key={s}
                        onClick={() => setSpeed(s)}
                        className={`flex-1 px-1 py-1 rounded text-xs font-mono cursor-pointer transition-colors
                          ${
                            speed === s
                              ? 'bg-purple-600/30 text-purple-200 border border-purple-500/40'
                              : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'
                          }`}
                      >
                        {s}x
                      </button>
                    ))}
                  </div>
                </div>

                {/* Playback buttons */}
                <div className="flex items-center pt-1 relative">
                  <button
                    onClick={reset}
                    className="w-9 h-9 flex items-center justify-center rounded-lg bg-purple-950/50 border border-purple-500/30 text-purple-300 hover:bg-purple-900/50 backdrop-blur-sm cursor-pointer transition-colors"
                    aria-label="Reset"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                  <div className="flex-1 flex items-center justify-center gap-2">
                    <button
                      onClick={stepBackward}
                      disabled={isAtStart || totalSteps === 0}
                      className="w-9 h-9 flex items-center justify-center rounded-lg bg-purple-950/50 border border-purple-500/30 text-purple-300 hover:bg-purple-900/50 backdrop-blur-sm disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
                      aria-label="Step backward"
                    >
                      <SkipBack className="w-3.5 h-3.5" />
                    </button>
                    <motion.button
                      onClick={togglePlay}
                      disabled={totalSteps === 0}
                      className="w-11 h-11 flex items-center justify-center rounded-xl bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700 text-white shadow-lg shadow-purple-900/50 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      aria-label={isPlaying ? 'Pause' : 'Play'}
                    >
                      <AnimatePresence mode="wait">
                        <motion.div
                          key={isPlaying ? 'pause' : 'play'}
                          initial={{ opacity: 0, scale: 0.5 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.5 }}
                          transition={{ duration: 0.15 }}
                        >
                          {isPlaying ? (
                            <Pause className="w-5 h-5" />
                          ) : (
                            <Play className="w-5 h-5 ml-0.5" />
                          )}
                        </motion.div>
                      </AnimatePresence>
                    </motion.button>
                    <button
                      onClick={stepForward}
                      disabled={isAtEnd || totalSteps === 0}
                      className="w-9 h-9 flex items-center justify-center rounded-lg bg-purple-950/50 border border-purple-500/30 text-purple-300 hover:bg-purple-900/50 backdrop-blur-sm disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
                      aria-label="Step forward"
                    >
                      <SkipForward className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Code */}
          <div className="lg:col-span-1 flex">
            <div className="bg-slate-900/40 border border-purple-500/20 backdrop-blur-md rounded-2xl shadow-2xl shadow-purple-900/20 overflow-hidden flex flex-col w-full">
              <div className="flex items-center justify-between px-4 py-3 border-b border-purple-500/20 shrink-0">
                <div className="flex items-center gap-2">
                  <Code2 className="w-5 h-5 text-purple-300" />
                  <span className="text-purple-200 font-semibold text-sm">Code</span>
                </div>
                <div className="flex items-center gap-1 bg-slate-950/50 rounded-lg p-1">
                  {languages.map((lang) => (
                    <button
                      key={lang.id}
                      onClick={() => setSelectedLang(lang.id)}
                      className={`px-2.5 py-1 rounded-md text-xs font-medium cursor-pointer transition-all duration-200
                        ${
                          selectedLang === lang.id
                            ? 'bg-purple-600/30 text-purple-200 shadow-sm'
                            : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'
                        }`}
                    >
                      {lang.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="p-4 min-h-0 flex-1">
                <Highlight theme={themes.nightOwl} code={codeString} language={prismLang}>
                  {({ tokens, getLineProps, getTokenProps }) => (
                    <pre className="bg-slate-950/80 rounded-lg p-4 border border-purple-500/20 overflow-x-auto text-sm font-mono leading-relaxed h-full overflow-y-auto">
                      {tokens.map((line, i) => {
                        const lineProps = getLineProps({ line, key: i })
                        const isActive = i === (currentStep?.codeLine ?? -1)
                        return (
                          <div
                            key={i}
                            {...lineProps}
                            className={`px-3 py-0.5 -mx-3 rounded transition-colors duration-150
                              ${isActive ? 'bg-purple-500/20 border-l-2 border-purple-400' : 'border-l-2 border-transparent'}`}
                          >
                            <span
                              className={`inline-block w-7 text-right mr-4 select-none text-xs
                                ${isActive ? 'text-purple-400' : 'text-slate-600'}`}
                            >
                              {i + 1}
                            </span>
                            {line.map((token, key) => (
                              <span key={key} {...getTokenProps({ token, key })} />
                            ))}
                          </div>
                        )
                      })}
                    </pre>
                  )}
                </Highlight>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function LegendDot({ color, label }) {
  return (
    <div className="flex items-center gap-1.5">
      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
      <span>{label}</span>
    </div>
  )
}
