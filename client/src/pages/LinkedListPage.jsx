import { useState, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  RotateCcw,
  Link2,
  Code2,
  Plus,
  Trash2,
  Search,
  ArrowRight,
} from 'lucide-react'
import { Highlight, themes } from 'prism-react-renderer'
import LinkedListVisualizer from '../visualizers/linked-list/LinkedListVisualizer.jsx'
import {
  insertAtHead,
  insertAtTail,
  insertAtPosition,
  deleteHead,
  deleteTail,
  searchList,
  traverseList,
  resetIdCounter,
  linkedListMeta,
} from '../visualizers/linked-list/linkedListOps.js'
import usePlayback from '../engine/usePlayback.js'
import { PLAYBACK_SPEEDS } from '../engine/types.js'

function buildInitialList(type) {
  resetIdCounter()
  const values = [10, 20, 30, 40]
  let nodes = []
  let headId = null
  for (const v of values) {
    const result = insertAtTail(nodes, headId, v, type)
    nodes = result.nodes
    headId = result.headId
  }
  return { nodes, headId }
}

export default function LinkedListPage() {
  const [listType, setListType] = useState('singly')
  const [listNodes, setListNodes] = useState(() => buildInitialList('singly'))
  const [steps, setSteps] = useState([])
  const [valueInput, setValueInput] = useState('')
  const [posInput, setPosInput] = useState('')
  const [searchInput, setSearchInput] = useState('')
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

  // When steps finish playing, apply final state
  const lastStep = steps.length > 0 ? steps[steps.length - 1] : null

  const applyResult = useCallback(
    (result) => {
      setSteps(result.steps)
      if (result.nodes) {
        // Defer state update to after animation completes
        const finalStep = result.steps[result.steps.length - 1]
        if (finalStep?.state) {
          setListNodes({ nodes: result.nodes, headId: result.headId })
        }
      }
    },
    []
  )

  const handleInsertHead = () => {
    const v = parseInt(valueInput.trim(), 10)
    if (isNaN(v)) return
    const result = insertAtHead(listNodes.nodes, listNodes.headId, v, listType)
    applyResult(result)
    setValueInput('')
  }

  const handleInsertTail = () => {
    const v = parseInt(valueInput.trim(), 10)
    if (isNaN(v)) return
    const result = insertAtTail(listNodes.nodes, listNodes.headId, v, listType)
    applyResult(result)
    setValueInput('')
  }

  const handleInsertAt = () => {
    const v = parseInt(valueInput.trim(), 10)
    const p = parseInt(posInput.trim(), 10)
    if (isNaN(v) || isNaN(p)) return
    const result = insertAtPosition(listNodes.nodes, listNodes.headId, v, p, listType)
    applyResult(result)
    setValueInput('')
    setPosInput('')
  }

  const handleDeleteHead = () => {
    const result = deleteHead(listNodes.nodes, listNodes.headId, listType)
    applyResult(result)
  }

  const handleDeleteTail = () => {
    const result = deleteTail(listNodes.nodes, listNodes.headId, listType)
    applyResult(result)
  }

  const handleSearch = () => {
    const v = parseInt(searchInput.trim(), 10)
    if (isNaN(v)) return
    const result = searchList(listNodes.nodes, listNodes.headId, v)
    setSteps(result.steps)
    setSearchInput('')
  }

  const handleTraverse = () => {
    const result = traverseList(listNodes.nodes, listNodes.headId)
    setSteps(result.steps)
  }

  const handleReset = () => {
    const init = buildInitialList(listType)
    setListNodes(init)
    setSteps([])
  }

  const handleTypeSwitch = (type) => {
    setListType(type)
    resetIdCounter()
    const init = buildInitialList(type)
    setListNodes(init)
    setSteps([])
  }

  const languages = [
    { id: 'javascript', label: 'JS', prism: 'javascript' },
    { id: 'cpp', label: 'C++', prism: 'cpp' },
    { id: 'c', label: 'C', prism: 'c' },
    { id: 'python', label: 'Python', prism: 'python' },
    { id: 'java', label: 'Java', prism: 'java' },
  ]

  const codeArray = linkedListMeta.code[selectedLang] || linkedListMeta.code.javascript
  const codeString = useMemo(
    () => (Array.isArray(codeArray) ? codeArray.join('\n') : codeArray),
    [codeArray]
  )
  const prismLang = languages.find((l) => l.id === selectedLang)?.prism || 'javascript'

  // Display step or current list state
  const displayStep = currentStep || {
    state: { nodes: listNodes.nodes, headId: listNodes.headId, newNode: null, removedNode: null },
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
            <Link2 className="w-10 h-10 text-cyan-400" />
            Linked List Visualizer
          </h1>
          <p className="text-purple-300">
            Visualize singly and doubly linked list operations step by step
          </p>
        </div>

        {/* Type tabs */}
        <div className="bg-slate-900/50 border border-purple-500/20 backdrop-blur-sm rounded-xl p-1.5 inline-flex gap-1">
          {['singly', 'doubly'].map((t) => (
            <button
              key={t}
              onClick={() => handleTypeSwitch(t)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer capitalize
                ${
                  listType === t
                    ? 'bg-purple-600/30 text-purple-200 shadow-lg shadow-purple-900/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                }`}
            >
              {t} Linked List
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
                  <span className="px-2 py-0.5 rounded-md text-xs font-mono bg-cyan-950/50 border border-cyan-500/30 text-cyan-300">
                    Access: O(n)
                  </span>
                  <span className="px-2 py-0.5 rounded-md text-xs font-mono bg-green-950/50 border border-green-500/30 text-green-300">
                    Insert Head: O(1)
                  </span>
                  <span className="px-2 py-0.5 rounded-md text-xs font-mono bg-purple-950/50 border border-purple-500/30 text-purple-300">
                    Insert Tail: O(n)
                  </span>
                  <span className="px-2 py-0.5 rounded-md text-xs font-mono bg-red-950/50 border border-red-500/30 text-red-300">
                    Delete: O(n)
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

                {/* Linked list vis */}
                <LinkedListVisualizer currentStep={displayStep} listType={listType} />

                {/* Legend */}
                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
                  <LegendDot color="rgb(124,58,237)" label="Visiting" />
                  <LegendDot color="rgb(16,185,129)" label="Inserted" />
                  <LegendDot color="rgb(244,63,94)" label="Removed" />
                  <LegendDot color="rgb(34,211,238)" label="Found" />
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
                {/* Insert controls */}
                <div className="space-y-2">
                  <label className="text-sm text-purple-300 font-medium">Insert</label>
                  <div className="flex gap-2 flex-wrap">
                    <input
                      type="text"
                      value={valueInput}
                      onChange={(e) => setValueInput(e.target.value)}
                      placeholder="Value"
                      disabled={isPlaying}
                      className="w-24 bg-slate-950/50 border border-purple-500/30 rounded-lg px-3 py-2 text-sm text-purple-200 placeholder:text-slate-600 focus:outline-none focus:border-purple-500 disabled:opacity-50 transition-colors"
                    />
                    <input
                      type="text"
                      value={posInput}
                      onChange={(e) => setPosInput(e.target.value)}
                      placeholder="Pos"
                      disabled={isPlaying}
                      className="w-20 bg-slate-950/50 border border-purple-500/30 rounded-lg px-3 py-2 text-sm text-purple-200 placeholder:text-slate-600 focus:outline-none focus:border-purple-500 disabled:opacity-50 transition-colors"
                    />
                    <button
                      onClick={handleInsertHead}
                      disabled={isPlaying}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-neon-green/10 border border-neon-green/30 text-neon-green hover:bg-neon-green/20 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer text-sm font-medium transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" /> Head
                    </button>
                    <button
                      onClick={handleInsertTail}
                      disabled={isPlaying}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-neon-green/10 border border-neon-green/30 text-neon-green hover:bg-neon-green/20 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer text-sm font-medium transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" /> Tail
                    </button>
                    <button
                      onClick={handleInsertAt}
                      disabled={isPlaying}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-neon-green/10 border border-neon-green/30 text-neon-green hover:bg-neon-green/20 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer text-sm font-medium transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" /> At Pos
                    </button>
                  </div>
                </div>

                {/* Delete controls */}
                <div className="space-y-2">
                  <label className="text-sm text-purple-300 font-medium">Delete</label>
                  <div className="flex gap-2">
                    <button
                      onClick={handleDeleteHead}
                      disabled={isPlaying}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-neon-rose/10 border border-neon-rose/30 text-neon-rose hover:bg-neon-rose/20 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer text-sm font-medium transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Head
                    </button>
                    <button
                      onClick={handleDeleteTail}
                      disabled={isPlaying}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-neon-rose/10 border border-neon-rose/30 text-neon-rose hover:bg-neon-rose/20 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer text-sm font-medium transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Tail
                    </button>
                  </div>
                </div>

                {/* Search + Traverse */}
                <div className="space-y-2">
                  <label className="text-sm text-purple-300 font-medium">Search & Traverse</label>
                  <div className="flex gap-2 flex-wrap">
                    <input
                      type="text"
                      value={searchInput}
                      onChange={(e) => setSearchInput(e.target.value)}
                      placeholder="Search value"
                      disabled={isPlaying}
                      className="w-28 bg-slate-950/50 border border-purple-500/30 rounded-lg px-3 py-2 text-sm text-purple-200 placeholder:text-slate-600 focus:outline-none focus:border-purple-500 disabled:opacity-50 transition-colors"
                    />
                    <button
                      onClick={handleSearch}
                      disabled={isPlaying}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-neon-cyan/10 border border-neon-cyan/30 text-neon-cyan hover:bg-neon-cyan/20 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer text-sm font-medium transition-colors"
                    >
                      <Search className="w-3.5 h-3.5" /> Search
                    </button>
                    <button
                      onClick={handleTraverse}
                      disabled={isPlaying}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-neon-purple/10 border border-neon-purple/30 text-neon-purple-light hover:bg-neon-purple/20 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer text-sm font-medium transition-colors"
                    >
                      <ArrowRight className="w-3.5 h-3.5" /> Traverse
                    </button>
                  </div>
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
                    aria-label="Reset list"
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
