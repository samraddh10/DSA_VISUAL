import { useState, useMemo, useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import { Shuffle, Trophy, Swords } from 'lucide-react'
import bubbleSort, { bubbleSortMeta } from '../visualizers/sorting/algorithms/bubbleSort.js'
import selectionSort, { selectionSortMeta } from '../visualizers/sorting/algorithms/selectionSort.js'
import insertionSort, { insertionSortMeta } from '../visualizers/sorting/algorithms/insertionSort.js'
import mergeSort, { mergeSortMeta } from '../visualizers/sorting/algorithms/mergeSort.js'
import quickSort, { quickSortMeta } from '../visualizers/sorting/algorithms/quickSort.js'
import heapSort, { heapSortMeta } from '../visualizers/sorting/algorithms/heapSort.js'
import SortingVisualizer from '../visualizers/sorting/SortingVisualizer.jsx'
import PlaybackBar from '../components/controls/PlaybackBar.jsx'
import ShareButton from '../components/ui/ShareButton.jsx'
import usePlayback from '../engine/usePlayback.js'
import { decodeShareState } from '../lib/shareLink.js'

const algorithms = [
  { ...bubbleSortMeta, fn: bubbleSort },
  { ...selectionSortMeta, fn: selectionSort },
  { ...insertionSortMeta, fn: insertionSort },
  { ...mergeSortMeta, fn: mergeSort },
  { ...quickSortMeta, fn: quickSort },
  { ...heapSortMeta, fn: heapSort },
]

function randomArray(size) {
  return Array.from({ length: size }, () => Math.floor(Math.random() * 95) + 5)
}

export default function ComparisonPage() {
  const location = useLocation()
  const [initial] = useState(() => decodeShareState(location.search))

  const [selectedAlgoA, setSelectedAlgoA] = useState(
    () => (initial.alg && algorithms.find((a) => a.id === initial.alg)) || algorithms[0]
  )
  const [selectedAlgoB, setSelectedAlgoB] = useState(
    () => (initial.algB && algorithms.find((a) => a.id === initial.algB)) || algorithms[1]
  )
  const [inputArray, setInputArray] = useState(() =>
    initial.data && initial.data.length > 0 ? initial.data : randomArray(15)
  )
  const [arraySize, setArraySize] = useState(() =>
    initial.data && initial.data.length > 0 ? initial.data.length : 15
  )
  const initialStep = initial.step

  const stepsA = useMemo(() => selectedAlgoA.fn(inputArray), [selectedAlgoA, inputArray])
  const stepsB = useMemo(() => selectedAlgoB.fn(inputArray), [selectedAlgoB, inputArray])

  const combinedSteps = useMemo(() => {
    const max = Math.max(stepsA.length, stepsB.length, 1)
    return Array.from({ length: max }, (_, i) => ({ index: i }))
  }, [stepsA, stepsB])

  const {
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
    goToStep,
    reset,
    setSpeed,
  } = usePlayback(combinedSteps)

  const stepRestoredRef = useRef(false)
  useEffect(() => {
    if (stepRestoredRef.current) return
    if (initialStep !== undefined && initialStep > 0 && totalSteps > 0) {
      goToStep(initialStep)
      stepRestoredRef.current = true
    }
  }, [totalSteps, initialStep, goToStep])

  const stepA = stepsA[Math.min(currentIndex, stepsA.length - 1)] || null
  const stepB = stepsB[Math.min(currentIndex, stepsB.length - 1)] || null

  function regenerate() {
    setInputArray(randomArray(arraySize))
  }

  function handleSizeChange(newSize) {
    setArraySize(newSize)
    setInputArray(randomArray(newSize))
  }

  const totalA = stepsA.length
  const totalB = stepsB.length
  const finishedA = isAtEnd || currentIndex >= totalA - 1
  const finishedB = isAtEnd || currentIndex >= totalB - 1
  const bothFinished = finishedA && finishedB
  const winner =
    bothFinished && totalA !== totalB ? (totalA < totalB ? 'A' : 'B') : null

  return (
    <div className="min-h-[calc(100vh-80px)] bg-gradient-to-br from-slate-950 via-purple-950/20 to-slate-950 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent flex items-center gap-3">
              <Swords className="w-8 h-8 text-purple-400" />
              Compare Algorithms
            </h1>
            <p className="text-slate-400 mt-2">
              Race two sorting algorithms side-by-side on the same input.
            </p>
          </div>
          <ShareButton
            state={{
              alg: selectedAlgoA.id,
              algB: selectedAlgoB.id,
              data: inputArray,
              step: currentIndex,
            }}
          />
        </div>

        {/* Controls */}
        <div className="bg-slate-900/50 backdrop-blur-sm border border-purple-500/20 rounded-xl p-5 space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-purple-300 uppercase tracking-wider mb-2 block">
                Algorithm A
              </label>
              <select
                value={selectedAlgoA.id}
                onChange={(e) =>
                  setSelectedAlgoA(algorithms.find((a) => a.id === e.target.value))
                }
                className="w-full bg-slate-950/60 border border-purple-500/30 rounded-lg px-3 py-2 text-sm text-purple-100 cursor-pointer focus:outline-none focus:border-purple-400"
              >
                {algorithms.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-pink-300 uppercase tracking-wider mb-2 block">
                Algorithm B
              </label>
              <select
                value={selectedAlgoB.id}
                onChange={(e) =>
                  setSelectedAlgoB(algorithms.find((a) => a.id === e.target.value))
                }
                className="w-full bg-slate-950/60 border border-pink-500/30 rounded-lg px-3 py-2 text-sm text-pink-100 cursor-pointer focus:outline-none focus:border-pink-400"
              >
                {algorithms.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <div className="flex-1 min-w-[200px]">
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-medium text-slate-300 uppercase tracking-wider">
                  Array Size
                </label>
                <span className="text-xs font-mono text-purple-300">{arraySize}</span>
              </div>
              <input
                type="range"
                min="5"
                max="30"
                value={arraySize}
                onChange={(e) => handleSizeChange(parseInt(e.target.value, 10))}
                className="w-full accent-purple-500 cursor-pointer"
              />
            </div>
            <button
              onClick={regenerate}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-purple-200 bg-slate-900/50 border border-purple-500/30 hover:bg-slate-800/60 hover:border-purple-400/50 transition-colors duration-200 cursor-pointer"
            >
              <Shuffle className="w-4 h-4" />
              <span>Random</span>
            </button>
          </div>
        </div>

        {/* Winner banner */}
        {winner && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`rounded-xl p-4 border flex items-center gap-3 ${
              winner === 'A'
                ? 'bg-purple-500/10 border-purple-400/40 text-purple-100'
                : 'bg-pink-500/10 border-pink-400/40 text-pink-100'
            }`}
          >
            <Trophy className="w-6 h-6 text-amber-400" />
            <div>
              <div className="font-semibold">
                {winner === 'A' ? selectedAlgoA.name : selectedAlgoB.name} wins
              </div>
              <div className="text-xs text-slate-300">
                {winner === 'A' ? totalA : totalB} steps vs{' '}
                {winner === 'A' ? totalB : totalA} steps
              </div>
            </div>
          </motion.div>
        )}

        {/* Dual visualizers */}
        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-slate-900/50 backdrop-blur-sm border border-purple-500/30 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs text-purple-300 uppercase tracking-wider">
                  Algorithm A
                </div>
                <div className="font-semibold text-purple-100">{selectedAlgoA.name}</div>
              </div>
              <div className="text-right text-xs font-mono text-slate-400">
                <div>
                  Step {Math.min(currentIndex, totalA - 1)} / {totalA - 1}
                </div>
                <div>{selectedAlgoA.timeComplexity}</div>
              </div>
            </div>
            <SortingVisualizer currentStep={stepA} inputArray={inputArray} />
          </div>

          <div className="bg-slate-900/50 backdrop-blur-sm border border-pink-500/30 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs text-pink-300 uppercase tracking-wider">
                  Algorithm B
                </div>
                <div className="font-semibold text-pink-100">{selectedAlgoB.name}</div>
              </div>
              <div className="text-right text-xs font-mono text-slate-400">
                <div>
                  Step {Math.min(currentIndex, totalB - 1)} / {totalB - 1}
                </div>
                <div>{selectedAlgoB.timeComplexity}</div>
              </div>
            </div>
            <SortingVisualizer currentStep={stepB} inputArray={inputArray} />
          </div>
        </div>

        {/* Unified playback */}
        <PlaybackBar
          isPlaying={isPlaying}
          isAtStart={isAtStart}
          isAtEnd={isAtEnd}
          speed={speed}
          progress={progress}
          currentIndex={currentIndex}
          totalSteps={totalSteps}
          onTogglePlay={togglePlay}
          onStepForward={stepForward}
          onStepBackward={stepBackward}
          onReset={reset}
          onSpeedChange={setSpeed}
          onSeek={goToStep}
        />
      </div>
    </div>
  )
}
