import { useMemo } from 'react'
import usePlayback from '../../engine/usePlayback.js'
import { STEP_TYPES } from '../../engine/types.js'
import bubbleSort from './algorithms/bubbleSort.js'
import selectionSort from './algorithms/selectionSort.js'
import insertionSort from './algorithms/insertionSort.js'
import mergeSort from './algorithms/mergeSort.js'
import quickSort from './algorithms/quickSort.js'
import heapSort from './algorithms/heapSort.js'

const algorithmMap = {
  'bubble-sort': bubbleSort,
  'selection-sort': selectionSort,
  'insertion-sort': insertionSort,
  'merge-sort': mergeSort,
  'quick-sort': quickSort,
  'heap-sort': heapSort,
}

function computeStats(steps, currentIndex) {
  let comparisons = 0
  let swaps = 0
  let arrayAccesses = 0

  for (let i = 0; i <= currentIndex && i < steps.length; i++) {
    const step = steps[i]
    if (step.type === STEP_TYPES.COMPARE) {
      comparisons++
      arrayAccesses += 2
    }
    if (step.type === STEP_TYPES.SWAP) {
      swaps++
      arrayAccesses += 4
    }
    if (step.type === STEP_TYPES.SET || step.type === STEP_TYPES.MERGE) {
      arrayAccesses += 1
    }
  }

  return { comparisons, swaps, arrayAccesses }
}

export default function useSortingEngine(algorithmId, inputArray) {
  const steps = useMemo(() => {
    if (!inputArray || inputArray.length === 0) return []
    const fn = algorithmMap[algorithmId]
    if (!fn) return []
    return fn(inputArray)
  }, [algorithmId, inputArray])

  const playback = usePlayback(steps)

  const stats = useMemo(
    () => computeStats(steps, playback.currentIndex),
    [steps, playback.currentIndex]
  )

  return { ...playback, stats }
}
