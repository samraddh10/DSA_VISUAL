import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  RotateCcw,
  Search,
  Code2,
  Shuffle,
  Pencil,
  Target,
} from 'lucide-react'
import { Highlight, themes } from 'prism-react-renderer'
import SearchVisualizer from '../visualizers/searching/SearchVisualizer.jsx'
import useSearchEngine from '../visualizers/searching/useSearchEngine.js'
import { PLAYBACK_SPEEDS } from '../engine/types.js'

import { linearSearchMeta } from '../visualizers/searching/algorithms/linearSearch.js'
import { binarySearchMeta } from '../visualizers/searching/algorithms/binarySearch.js'

const algorithms = [linearSearchMeta, binarySearchMeta]

function generateSortedArray(size) {
  const arr = []
  let val = Math.floor(Math.random() * 5) + 1
  for (let i = 0; i < size; i++) {
    arr.push(val)
    val += Math.floor(Math.random() * 8) + 1
  }
  return arr
}

function generateRandomArray(size) {
  return Array.from({ length: size }, () => Math.floor(Math.random() * 99) + 1)
}

export default function SearchingPage() {
  const [selectedAlgo, setSelectedAlgo] = useState(algorithms[0])
  const [selectedLang, setSelectedLang] = useState('javascript')
  const [arraySize, setArraySize] = useState(15)
  const [inputArray, setInputArray] = useState([])
  const [target, setTarget] = useState(null)
  const [customValue, setCustomValue] = useState('')
  const [targetInput, setTargetInput] = useState('')

  // Generate initial array + pick random target
  useEffect(() => {
    regenerate()
  }, [])

  function regenerate() {
    const arr =
      selectedAlgo.id === 'binary-search'
        ? generateSortedArray(arraySize)
        : generateRandomArray(arraySize)
    setInputArray(arr)
    setTarget(arr[Math.floor(Math.random() * arr.length)])
  }

  // Regenerate when algo or size changes
  useEffect(() => {
    regenerate()
  }, [selectedAlgo.id, arraySize])

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
  } = useSearchEngine(selectedAlgo.id, inputArray, target)

  const handleCustomSubmit = (e) => {
    e.preventDefault()
    const arr = customValue
      .split(',')
      .map((s) => parseInt(s.trim(), 10))
      .filter((n) => !isNaN(n) && n > 0 && n <= 999)
    if (arr.length >= 2) {
      if (selectedAlgo.id === 'binary-search') arr.sort((a, b) => a - b)
      setInputArray(arr)
      setTarget(arr[Math.floor(Math.random() * arr.length)])
      setCustomValue('')
    }
  }

  const handleTargetSubmit = (e) => {
    e.preventDefault()
    const t = parseInt(targetInput.trim(), 10)
    if (!isNaN(t)) {
      setTarget(t)
      setTargetInput('')
    }
  }

  const languages = [
    { id: 'javascript', label: 'JS', prism: 'javascript' },
    { id: 'cpp', label: 'C++', prism: 'cpp' },
    { id: 'c', label: 'C', prism: 'c' },
    { id: 'python', label: 'Python', prism: 'python' },
    { id: 'java', label: 'Java', prism: 'java' },
  ]

  const codeArray = selectedAlgo.code[selectedLang] || selectedAlgo.code.javascript
  const codeString = useMemo(
    () => (Array.isArray(codeArray) ? codeArray.join('\n') : codeArray),
    [codeArray]
  )
  const prismLang = languages.find((l) => l.id === selectedLang)?.prism || 'javascript'

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

      {/* Glowing orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl animate-pulse" />
        <div
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-600/10 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: '2s' }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 p-6 space-y-6 max-w-[1400px] mx-auto">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
            <Search className="w-10 h-10 text-cyan-400" />
            Searching Algorithm Visualizer
          </h1>
          <p className="text-purple-300">
            Visualize how search algorithms locate elements step by step
          </p>
        </div>

        {/* Algorithm tabs */}
        <div className="bg-slate-900/50 border border-purple-500/20 backdrop-blur-sm rounded-xl p-1.5 inline-flex flex-wrap gap-1">
          {algorithms.map((algo) => (
            <button
              key={algo.id}
              onClick={() => setSelectedAlgo(algo)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer
                ${
                  selectedAlgo.id === algo.id
                    ? 'bg-purple-600/30 text-purple-200 shadow-lg shadow-purple-900/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                }`}
            >
              {algo.name}
            </button>
          ))}
        </div>

        {/* Main grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left column: Visualizer + Controls */}
          <div className="lg:col-span-2 space-y-6">
            {/* Visualization card */}
            <div className="bg-slate-900/40 border border-purple-500/20 backdrop-blur-md rounded-2xl shadow-2xl shadow-purple-900/20 overflow-hidden">
              <div className="flex items-center justify-between px-6 py-3 border-b border-purple-500/20 flex-wrap gap-y-2">
                <span className="text-purple-200 font-semibold">Visualization</span>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-2 py-0.5 rounded-md text-xs font-mono bg-cyan-950/50 border border-cyan-500/30 text-cyan-300">
                    Time: {selectedAlgo.timeComplexity}
                  </span>
                  <span className="px-2 py-0.5 rounded-md text-xs font-mono bg-purple-950/50 border border-purple-500/30 text-purple-300">
                    Space: {selectedAlgo.spaceComplexity}
                  </span>
                  <span className="w-px h-4 bg-purple-500/30" />
                  <span className="px-2 py-0.5 rounded-md text-xs font-mono bg-green-950/50 border border-green-500/30 text-green-300">
                    Best: {selectedAlgo.bestCase}
                  </span>
                  <span className="px-2 py-0.5 rounded-md text-xs font-mono bg-red-950/50 border border-red-500/30 text-red-300">
                    Worst: {selectedAlgo.worstCase}
                  </span>
                </div>
              </div>

              <div className="p-6 space-y-4">
                {/* Target badge */}
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-neon-rose/10 border border-neon-rose/30">
                    <Target className="w-4 h-4 text-neon-rose" />
                    <span className="text-sm font-mono text-neon-rose font-medium">
                      Target: {target ?? '—'}
                    </span>
                  </div>
                  {selectedAlgo.id === 'binary-search' && (
                    <span className="text-xs text-text-muted font-mono">
                      (array auto-sorted for binary search)
                    </span>
                  )}
                </div>

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

                {/* Array visualization */}
                <SearchVisualizer currentStep={currentStep} inputArray={inputArray} />

                {/* Legend + Statistics */}
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
                    <LegendDot color="rgb(124,58,237)" label="Checking" />
                    <LegendDot color="rgb(16,185,129)" label="Found" />
                    <LegendDot color="rgba(124,58,237,0.3)" label="Search Range" />
                    <LegendDot color="rgba(255,255,255,0.08)" label="Eliminated" />
                  </div>
                  <div className="flex items-center gap-5 text-xs">
                    <span className="text-slate-500">
                      Comparisons:{' '}
                      <span className="text-cyan-400 font-bold font-mono">
                        {stats.comparisons}
                      </span>
                    </span>
                    <span className="text-slate-500">
                      Step:{' '}
                      <span className="text-purple-400 font-bold font-mono">
                        {currentIndex}/{totalSteps > 0 ? totalSteps - 1 : 0}
                      </span>
                    </span>
                  </div>
                </div>

                {/* Progress bar */}
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
              </div>
            </div>

            {/* Controls card */}
            <div className="bg-slate-900/40 border border-purple-500/20 backdrop-blur-md rounded-2xl shadow-2xl shadow-purple-900/20 overflow-hidden">
              <div className="px-6 py-4 border-b border-purple-500/20">
                <span className="text-purple-200 font-semibold">Controls</span>
              </div>
              <div className="p-5 space-y-4">
                {/* Array size */}
                <div className="space-y-2">
                  <label className="text-sm text-purple-300 font-medium">
                    Array Size: {arraySize}
                  </label>
                  <div className="relative w-full h-2 bg-white/10 rounded-full">
                    <div
                      className="absolute top-0 left-0 h-full bg-gradient-to-r from-purple-500 to-cyan-500 rounded-full"
                      style={{ width: `${((arraySize - 5) / 25) * 100}%` }}
                    />
                    <input
                      type="range"
                      min={5}
                      max={30}
                      value={arraySize}
                      onChange={(e) => setArraySize(Number(e.target.value))}
                      className="absolute inset-0 w-full opacity-0 cursor-pointer"
                    />
                    <div
                      className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full border-2 border-purple-500 shadow pointer-events-none"
                      style={{ left: `calc(${((arraySize - 5) / 25) * 100}% - 8px)` }}
                    />
                  </div>
                </div>

                {/* Generate + Target */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <button
                    onClick={regenerate}
                    disabled={isPlaying}
                    className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700 text-white font-medium shadow-lg shadow-purple-900/50 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-all text-sm"
                  >
                    <Shuffle className="w-4 h-4" />
                    New Array
                  </button>
                  <form onSubmit={handleTargetSubmit} className="flex gap-2">
                    <div className="flex-1 relative">
                      <Target className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
                      <input
                        type="text"
                        value={targetInput}
                        onChange={(e) => setTargetInput(e.target.value)}
                        placeholder="Target value"
                        disabled={isPlaying}
                        className="w-full bg-slate-950/50 border border-purple-500/30 rounded-lg pl-9 pr-3 py-2 text-sm text-purple-200 placeholder:text-slate-600 focus:outline-none focus:border-purple-500 disabled:opacity-50 transition-colors"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={isPlaying}
                      className="px-3 py-2 rounded-lg bg-purple-950/50 border border-purple-500/30 text-purple-300 hover:bg-purple-900/50 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer text-sm font-medium transition-colors"
                    >
                      Set
                    </button>
                  </form>
                </div>

                {/* Custom array input */}
                <form onSubmit={handleCustomSubmit} className="flex gap-2">
                  <div className="flex-1 relative">
                    <Pencil className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
                    <input
                      type="text"
                      value={customValue}
                      onChange={(e) => setCustomValue(e.target.value)}
                      placeholder="Custom array: 10, 25, 37, 48, 62"
                      disabled={isPlaying}
                      className="w-full bg-slate-950/50 border border-purple-500/30 rounded-lg pl-9 pr-3 py-2 text-sm text-purple-200 placeholder:text-slate-600 focus:outline-none focus:border-purple-500 disabled:opacity-50 transition-colors"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={isPlaying}
                    className="px-3 py-2 rounded-lg bg-purple-950/50 border border-purple-500/30 text-purple-300 hover:bg-purple-900/50 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer text-sm font-medium transition-colors"
                  >
                    Set
                  </button>
                </form>

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
                    disabled={isAtStart}
                    className="w-9 h-9 flex items-center justify-center rounded-lg bg-purple-950/50 border border-purple-500/30 text-purple-300 hover:bg-purple-900/50 backdrop-blur-sm disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
                    aria-label="Reset"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                  <div className="flex-1 flex items-center justify-center gap-2">
                    <button
                      onClick={stepBackward}
                      disabled={isAtStart}
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
                      disabled={isAtEnd}
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
