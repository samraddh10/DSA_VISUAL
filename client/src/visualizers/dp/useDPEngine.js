import { useMemo } from 'react'
import usePlayback from '../../engine/usePlayback.js'
import useWorkerSteps from '../../engine/useWorkerSteps.js'
import fibonacci, { fibonacciMeta } from './algorithms/fibonacci.js'
import knapsack, { knapsackMeta } from './algorithms/knapsack.js'
import lcs, { lcsMeta } from './algorithms/lcs.js'

export const DP_ALGORITHMS = {
  fibonacci: { fn: fibonacci, meta: fibonacciMeta, kind: 'fibonacci' },
  knapsack: { fn: knapsack, meta: knapsackMeta, kind: 'knapsack' },
  lcs: { fn: lcs, meta: lcsMeta, kind: 'lcs' },
}

export default function useDPEngine(algorithmId, input) {
  const algo = DP_ALGORITHMS[algorithmId]

  const args = useMemo(() => {
    if (!algo) return null
    if (algo.kind === 'fibonacci') return [input?.n ?? 0]
    if (algo.kind === 'knapsack') return [input?.items ?? [], input?.capacity ?? 0]
    if (algo.kind === 'lcs') return [input?.str1 ?? '', input?.str2 ?? '']
    return null
  }, [algo, input])

  const cost = useMemo(() => {
    if (!algo) return 0
    if (algo.kind === 'fibonacci') return (input?.n ?? 0) * 2
    if (algo.kind === 'knapsack')
      return (input?.items?.length ?? 0) * ((input?.capacity ?? 0) + 1) * 2
    if (algo.kind === 'lcs')
      return (input?.str1?.length ?? 0) * (input?.str2?.length ?? 0) * 2
    return 0
  }, [algo, input])

  const { steps, loading } = useWorkerSteps(algorithmId, args || [], {
    syncFn: () => {
      if (!algo || !args) return []
      return algo.fn(...args)
    },
    cost,
    threshold: 200,
  })

  const playback = usePlayback(steps)

  const cellsComputed = useMemo(() => {
    let count = 0
    for (let i = 0; i <= playback.currentIndex && i < steps.length; i++) {
      if (steps[i].type === 'set' || steps[i].type === 'insert') count++
    }
    return count
  }, [steps, playback.currentIndex])

  return { ...playback, stats: { cellsComputed }, loading }
}
