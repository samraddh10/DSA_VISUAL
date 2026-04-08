import { useMemo } from 'react'
import usePlayback from '../../engine/usePlayback.js'
import { STEP_TYPES } from '../../engine/types.js'
import linearSearch from './algorithms/linearSearch.js'
import binarySearch from './algorithms/binarySearch.js'

const algorithmMap = {
  'linear-search': linearSearch,
  'binary-search': binarySearch,
}

function computeStats(steps, currentIndex) {
  let comparisons = 0
  let eliminations = 0

  for (let i = 0; i <= currentIndex && i < steps.length; i++) {
    const step = steps[i]
    if (step.type === STEP_TYPES.COMPARE) comparisons++
    if (step.type === STEP_TYPES.SEARCH && i > 0) eliminations++
  }

  return { comparisons, eliminations }
}

export default function useSearchEngine(algorithmId, inputArray, target) {
  const steps = useMemo(() => {
    if (!inputArray || inputArray.length === 0 || target === null || target === undefined)
      return []
    const fn = algorithmMap[algorithmId]
    if (!fn) return []
    return fn(inputArray, target)
  }, [algorithmId, inputArray, target])

  const playback = usePlayback(steps)

  const stats = useMemo(
    () => computeStats(steps, playback.currentIndex),
    [steps, playback.currentIndex]
  )

  return { ...playback, stats }
}
