import { useState, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  RotateCcw,
  Triangle,
  Code2,
  Plus,
  Minus,
  Eye,
  Shuffle,
} from 'lucide-react'
import { Highlight, themes } from 'prism-react-renderer'
import HeapVisualizer from '../visualizers/heap/HeapVisualizer.jsx'
import {
  heapInsert,
  heapExtract,
  heapPeek,
  heapify,
  heapMeta,
} from '../visualizers/heap/heapOps.js'
import usePlayback from '../engine/usePlayback.js'
import { PLAYBACK_SPEEDS } from '../engine/types.js'

function buildInitialHeap(mode) {
  let arr = []
  for (const v of [40, 20, 60, 10, 30, 50, 70]) {
    const result = heapInsert(arr, v, mode)
    arr = result.array
  }
  return arr
}

export default function HeapPage() {
  const [mode, setMode] = useState('max')
  const [heapArray, setHeapArray] = useState(() => buildInitialHeap('max'))
  const [steps, setSteps] = useState([])
  const [valueInput, setValueInput] = useState('')
  const [selectedLang, setSelectedLang] = useState('javascript')

  const playback = usePlayback(steps)
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
  } = playback

  const handleInsert = () => {
    const v = parseInt(valueInput.trim(), 10)
    if (isNaN(v)) return
    const result = heapInsert(heapArray, v, mode)
    setSteps(result.steps)
    setHeapArray(result.array)
    setValueInput('')
  }

  const handleExtract = () => {
    const result = heapExtract(heapArray, mode)
    setSteps(result.steps)
    setHeapArray(result.array)
  }

  const handlePeek = () => {
    const result = heapPeek(heapArray, mode)
    setSteps(result.steps)
  }

  const handleHeapify = () => {
    // Generate random unsorted array
    const random = Array.from({ length: 7 }, () => Math.floor(Math.random() * 90) + 10)
    const result = heapify(random, mode)
    setSteps(result.steps)
    setHeapArray(result.array)
  }

  const handleModeSwitch = (newMode) => {
    setMode(newMode)
    setHeapArray(buildInitialHeap(newMode))
    setSteps([])
  }

  const handleReset = () => {
    setHeapArray(buildInitialHeap(mode))
    setSteps([])
  }

  const languages = [
    { id: 'javascript', label: 'JS', prism: 'javascript' },
    { id: 'cpp', label: 'C++', prism: 'cpp' },
    { id: 'c', label: 'C', prism: 'c' },
    { id: 'python', label: 'Python', prism: 'python' },
    { id: 'java', label: 'Java', prism: 'java' },
  ]

  const codeArray = heapMeta.code[selectedLang] || heapMeta.code.javascript
  const codeString = useMemo(
    () => (Array.isArray(codeArray) ? codeArray.join('\n') : codeArray),
    [codeArray]
  )
  const prismLang = languages.find((l) => l.id === selectedLang)?.prism || 'javascript'

  const displayStep = currentStep || {
    state: { array: heapArray, activeIndices: [], swappingIndices: [] },
    highlights: [],
    type: null,
  }

  return (
    <div className="min-h-screen w-full relative overflow-hidden -mt-24 pt-24">
      {/* Grid pattern background */}
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
            <Triangle className="w-10 h-10 text-cyan-400" />
            Heap Visualizer
          </h1>
          <p className="text-purple-300">
            Visualize heap operations with tree and array views
          </p>
        </div>

        {/* Mode tabs */}
        <div className="bg-slate-900/50 border border-purple-500/20 backdrop-blur-sm rounded-xl p-1.5 inline-flex gap-1">
          {['max', 'min'].map((m) => (
            <button
              key={m}
              onClick={() => handleModeSwitch(m)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer
                ${
                  mode === m
                    ? 'bg-purple-600/30 text-purple-200 shadow-lg shadow-purple-900/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                }`}
            >
              {m === 'max' ? 'Max-Heap' : 'Min-Heap'}
            </button>
          ))}
        </div>

        {/* Main grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Visualization card */}
            <div className="bg-slate-900/40 border border-purple-500/20 backdrop-blur-md rounded-2xl shadow-2xl shadow-purple-900/20 overflow-hidden">
              <div className="flex items-center justify-between px-6 py-3 border-b border-purple-500/20 flex-wrap gap-y-2">
                <span className="text-purple-200 font-semibold">Visualization</span>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-2 py-0.5 rounded-md text-xs font-mono bg-green-950/50 border border-green-500/30 text-green-300">
                    Insert: O(log n)
                  </span>
                  <span className="px-2 py-0.5 rounded-md text-xs font-mono bg-red-950/50 border border-red-500/30 text-red-300">
                    Extract: O(log n)
                  </span>
                  <span className="px-2 py-0.5 rounded-md text-xs font-mono bg-cyan-950/50 border border-cyan-500/30 text-cyan-300">
                    Peek: O(1)
                  </span>
                  <span className="px-2 py-0.5 rounded-md text-xs font-mono bg-purple-950/50 border border-purple-500/30 text-purple-300">
                    Heapify: O(n)
                  </span>
                  <span className="w-px h-4 bg-purple-500/30" />
                  <span className="px-2 py-0.5 rounded-md text-xs font-mono bg-yellow-950/50 border border-yellow-500/30 text-yellow-300">
                    {mode === 'max' ? 'Max-Heap' : 'Min-Heap'}
                  </span>
                </div>
              </div>

              <div className="p-6 space-y-4">
                {/* Step description */}
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

                {/* Heap vis */}
                <HeapVisualizer currentStep={displayStep} mode={mode} />

                {/* Legend + Size */}
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
                    <LegendDot color="rgb(34,211,238)" label="Comparing" />
                    <LegendDot color="rgb(16,185,129)" label="Inserted" />
                    <LegendDot color="rgb(251,191,36)" label="Swapping" />
                    <LegendDot color="rgb(244,63,94)" label="Removed" />
                  </div>
                  <span className="text-xs text-slate-500">
                    Size:{' '}
                    <span className="text-purple-400 font-bold font-mono">{heapArray.length}</span>
                  </span>
                </div>

                {/* Progress bar */}
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
                <span className="text-purple-200 font-semibold">Operations</span>
              </div>
              <div className="p-5 space-y-4">
                {/* Value input + operation buttons */}
                <div className="flex gap-2 flex-wrap">
                  <input
                    type="text"
                    value={valueInput}
                    onChange={(e) => setValueInput(e.target.value)}
                    placeholder="Value"
                    disabled={isPlaying}
                    onKeyDown={(e) => e.key === 'Enter' && handleInsert()}
                    className="w-24 bg-slate-950/50 border border-purple-500/30 rounded-lg px-3 py-2 text-sm text-purple-200 placeholder:text-slate-600 focus:outline-none focus:border-purple-500 disabled:opacity-50 transition-colors"
                  />
                  <button
                    onClick={handleInsert}
                    disabled={isPlaying}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-neon-green/10 border border-neon-green/30 text-neon-green hover:bg-neon-green/20 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer text-sm font-medium transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" /> Insert
                  </button>
                  <button
                    onClick={handleExtract}
                    disabled={isPlaying}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-neon-rose/10 border border-neon-rose/30 text-neon-rose hover:bg-neon-rose/20 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer text-sm font-medium transition-colors"
                  >
                    <Minus className="w-3.5 h-3.5" /> Extract {mode === 'max' ? 'Max' : 'Min'}
                  </button>
                  <button
                    onClick={handlePeek}
                    disabled={isPlaying}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-neon-cyan/10 border border-neon-cyan/30 text-neon-cyan hover:bg-neon-cyan/20 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer text-sm font-medium transition-colors"
                  >
                    <Eye className="w-3.5 h-3.5" /> Peek
                  </button>
                  <button
                    onClick={handleHeapify}
                    disabled={isPlaying}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-neon-purple/10 border border-neon-purple/30 text-neon-purple-light hover:bg-neon-purple/20 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer text-sm font-medium transition-colors"
                  >
                    <Shuffle className="w-3.5 h-3.5" /> Heapify Random
                  </button>
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
                    onClick={handleReset}
                    className="w-9 h-9 flex items-center justify-center rounded-lg bg-purple-950/50 border border-purple-500/30 text-purple-300 hover:bg-purple-900/50 backdrop-blur-sm cursor-pointer transition-colors"
                    aria-label="Reset heap"
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

          {/* Right column: Code */}
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
