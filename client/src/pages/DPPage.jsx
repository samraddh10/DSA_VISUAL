import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  RotateCcw,
  Grid3x3,
  Code2,
  Plus,
  Trash2,
} from 'lucide-react'
import { Highlight, themes } from 'prism-react-renderer'
import DPVisualizer from '../visualizers/dp/DPVisualizer.jsx'
import useDPEngine, { DP_ALGORITHMS } from '../visualizers/dp/useDPEngine.js'
import { PLAYBACK_SPEEDS } from '../engine/types.js'

const ALGO_IDS = ['fibonacci', 'knapsack', 'lcs']

const DEFAULT_ITEMS = [
  { weight: 2, value: 3 },
  { weight: 3, value: 4 },
  { weight: 4, value: 5 },
  { weight: 5, value: 6 },
]

export default function DPPage() {
  const [algorithmId, setAlgorithmId] = useState('fibonacci')
  const [fibN, setFibN] = useState(8)
  const [items, setItems] = useState(DEFAULT_ITEMS)
  const [capacity, setCapacity] = useState(8)
  const [str1, setStr1] = useState('ABCBDAB')
  const [str2, setStr2] = useState('BDCAB')
  const [selectedLang, setSelectedLang] = useState('javascript')

  const algo = DP_ALGORITHMS[algorithmId]

  const input = useMemo(() => {
    if (algorithmId === 'fibonacci') return { n: fibN }
    if (algorithmId === 'knapsack') return { items, capacity }
    if (algorithmId === 'lcs') return { str1, str2 }
    return null
  }, [algorithmId, fibN, items, capacity, str1, str2])

  const engine = useDPEngine(algorithmId, input)

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
      table: null,
      currentCell: null,
      dependencies: [],
      dims: [],
      answer: null,
    },
    highlights: [],
    type: null,
  }

  const addItem = () => {
    setItems([...items, { weight: 1, value: 1 }])
  }
  const removeItem = (idx) => {
    setItems(items.filter((_, i) => i !== idx))
  }
  const updateItem = (idx, field, value) => {
    const v = Math.max(1, Math.min(20, Number(value) || 1))
    setItems(items.map((it, i) => (i === idx ? { ...it, [field]: v } : it)))
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
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-rose-600/10 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: '2s' }}
        />
      </div>

      <div className="relative z-10 p-6 space-y-6 max-w-[1400px] mx-auto">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
            <Grid3x3 className="w-10 h-10 text-rose-400" />
            Dynamic Programming
          </h1>
          <p className="text-purple-300">
            Watch classic DP tables fill bottom-up — Fibonacci, 0/1 Knapsack, LCS
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
              {DP_ALGORITHMS[id].meta.name}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Visualization */}
            <div className="bg-slate-900/40 border border-purple-500/20 backdrop-blur-md rounded-2xl shadow-2xl shadow-purple-900/20 overflow-hidden">
              <div className="flex items-center justify-between px-6 py-3 border-b border-purple-500/20 flex-wrap gap-y-2">
                <span className="text-purple-200 font-semibold">DP Table</span>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-2 py-0.5 rounded-md text-xs font-mono bg-purple-950/50 border border-purple-500/30 text-purple-300">
                    Time: {algo.meta.timeComplexity}
                  </span>
                  <span className="px-2 py-0.5 rounded-md text-xs font-mono bg-cyan-950/50 border border-cyan-500/30 text-cyan-300">
                    Space: {algo.meta.spaceComplexity}
                  </span>
                  <span className="px-2 py-0.5 rounded-md text-xs font-mono bg-amber-950/50 border border-amber-500/30 text-amber-300">
                    Cells: {stats.cellsComputed}
                  </span>
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

                <DPVisualizer currentStep={displayStep} />

                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
                  <LegendDot color="rgb(251,191,36)" label="Current" />
                  <LegendDot color="rgb(34,211,238)" label="Dependency" />
                  <LegendDot color="rgb(124,58,237)" label="Filled" />
                  <LegendDot color="rgb(74,222,128)" label="Path" />
                  <LegendDot color="rgb(244,63,94)" label="Result" />
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
                        className="absolute top-0 left-0 h-full bg-gradient-to-r from-purple-500 to-rose-500 rounded-full transition-all duration-100"
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

            {/* Input panel */}
            <div className="bg-slate-900/40 border border-purple-500/20 backdrop-blur-md rounded-2xl shadow-2xl shadow-purple-900/20 overflow-hidden">
              <div className="px-6 py-4 border-b border-purple-500/20">
                <span className="text-purple-200 font-semibold">Input</span>
              </div>
              <div className="p-5 space-y-4">
                {algorithmId === 'fibonacci' && (
                  <div className="flex items-center gap-4">
                    <label className="text-sm text-purple-300 font-medium">n =</label>
                    <input
                      type="range"
                      min={0}
                      max={15}
                      value={fibN}
                      onChange={(e) => setFibN(Number(e.target.value))}
                      disabled={isPlaying}
                      className="flex-1 accent-purple-500 disabled:opacity-50"
                    />
                    <span className="w-10 text-center text-purple-200 font-mono font-semibold">
                      {fibN}
                    </span>
                  </div>
                )}

                {algorithmId === 'knapsack' && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-4">
                      <label className="text-sm text-purple-300 font-medium">Capacity W =</label>
                      <input
                        type="range"
                        min={1}
                        max={15}
                        value={capacity}
                        onChange={(e) => setCapacity(Number(e.target.value))}
                        disabled={isPlaying}
                        className="flex-1 accent-purple-500 disabled:opacity-50"
                      />
                      <span className="w-10 text-center text-purple-200 font-mono font-semibold">
                        {capacity}
                      </span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-sm text-purple-300 font-medium">
                          Items ({items.length})
                        </label>
                        <button
                          onClick={addItem}
                          disabled={isPlaying || items.length >= 6}
                          className="flex items-center gap-1 px-2 py-1 rounded bg-neon-green/10 border border-neon-green/30 text-neon-green text-xs hover:bg-neon-green/20 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                        >
                          <Plus className="w-3 h-3" /> Add
                        </button>
                      </div>
                      <div className="space-y-1.5">
                        {items.map((it, i) => (
                          <div key={i} className="flex items-center gap-2">
                            <span className="text-xs text-slate-500 font-mono w-6">#{i + 1}</span>
                            <label className="text-xs text-slate-400">w</label>
                            <input
                              type="number"
                              min={1}
                              max={20}
                              value={it.weight}
                              onChange={(e) => updateItem(i, 'weight', e.target.value)}
                              disabled={isPlaying}
                              className="w-16 bg-slate-950/50 border border-purple-500/30 rounded px-2 py-1 text-xs text-purple-200 focus:outline-none focus:border-purple-500 disabled:opacity-50"
                            />
                            <label className="text-xs text-slate-400">v</label>
                            <input
                              type="number"
                              min={1}
                              max={20}
                              value={it.value}
                              onChange={(e) => updateItem(i, 'value', e.target.value)}
                              disabled={isPlaying}
                              className="w-16 bg-slate-950/50 border border-purple-500/30 rounded px-2 py-1 text-xs text-purple-200 focus:outline-none focus:border-purple-500 disabled:opacity-50"
                            />
                            <button
                              onClick={() => removeItem(i)}
                              disabled={isPlaying || items.length <= 1}
                              className="ml-auto p-1 rounded text-rose-400 hover:bg-rose-500/10 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                              aria-label="Remove item"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {algorithmId === 'lcs' && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <label className="text-sm text-purple-300 font-medium w-20">String A</label>
                      <input
                        type="text"
                        maxLength={10}
                        value={str1}
                        onChange={(e) => setStr1(e.target.value.toUpperCase())}
                        disabled={isPlaying}
                        className="flex-1 bg-slate-950/50 border border-purple-500/30 rounded-lg px-3 py-2 text-sm text-purple-200 font-mono focus:outline-none focus:border-purple-500 disabled:opacity-50"
                      />
                    </div>
                    <div className="flex items-center gap-3">
                      <label className="text-sm text-purple-300 font-medium w-20">String B</label>
                      <input
                        type="text"
                        maxLength={10}
                        value={str2}
                        onChange={(e) => setStr2(e.target.value.toUpperCase())}
                        disabled={isPlaying}
                        className="flex-1 bg-slate-950/50 border border-purple-500/30 rounded-lg px-3 py-2 text-sm text-purple-200 font-mono focus:outline-none focus:border-purple-500 disabled:opacity-50"
                      />
                    </div>
                  </div>
                )}

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
                <div className="flex items-center pt-1">
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
                      className="w-11 h-11 flex items-center justify-center rounded-xl bg-gradient-to-r from-purple-600 to-rose-600 hover:from-purple-700 hover:to-rose-700 text-white shadow-lg shadow-purple-900/50 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
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
