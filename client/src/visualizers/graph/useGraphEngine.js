import { useMemo } from 'react'
import usePlayback from '../../engine/usePlayback.js'
import useWorkerSteps from '../../engine/useWorkerSteps.js'
import { STEP_TYPES } from '../../engine/types.js'
import bfs, { bfsMeta } from './algorithms/bfs.js'
import dfs, { dfsMeta } from './algorithms/dfs.js'
import dijkstra, { dijkstraMeta } from './algorithms/dijkstra.js'
import kruskal, { kruskalMeta } from './algorithms/kruskal.js'
import prim, { primMeta } from './algorithms/prim.js'

export const GRAPH_ALGORITHMS = {
  bfs: { fn: bfs, meta: bfsMeta, needsStart: true, weighted: false, isMST: false },
  dfs: { fn: dfs, meta: dfsMeta, needsStart: true, weighted: false, isMST: false },
  dijkstra: { fn: dijkstra, meta: dijkstraMeta, needsStart: true, needsEnd: true, weighted: true, isMST: false },
  kruskal: { fn: kruskal, meta: kruskalMeta, needsStart: false, weighted: true, isMST: true },
  prim: { fn: prim, meta: primMeta, needsStart: true, weighted: true, isMST: true },
}

function computeStats(steps, currentIndex) {
  let nodesVisited = 0
  let edgesExplored = 0

  for (let i = 0; i <= currentIndex && i < steps.length; i++) {
    const step = steps[i]
    if (step.type === STEP_TYPES.VISIT) nodesVisited++
    if (
      step.type === STEP_TYPES.COMPARE ||
      step.type === STEP_TYPES.SET ||
      step.type === STEP_TYPES.INSERT ||
      step.type === STEP_TYPES.DELETE
    ) {
      edgesExplored++
    }
  }

  const lastState = steps[Math.min(currentIndex, steps.length - 1)]?.state || {}
  const totalWeight = lastState.totalWeight ?? null

  return { nodesVisited, edgesExplored, totalWeight }
}

export default function useGraphEngine(algorithmId, nodes, edges, startId, endId) {
  const algo = GRAPH_ALGORITHMS[algorithmId]

  const args = useMemo(() => {
    if (!nodes || nodes.length === 0 || !algo) return null
    if (algo.isMST) return [nodes, edges]
    if (algo.needsEnd) return [nodes, edges, startId, endId]
    return [nodes, edges, startId]
  }, [algo, nodes, edges, startId, endId])

  const cost = useMemo(() => {
    if (!nodes) return 0
    const V = nodes.length
    const E = edges?.length ?? 0
    return V * E + V * V
  }, [nodes, edges])

  const { steps, loading } = useWorkerSteps(algorithmId, args || [], {
    syncFn: () => {
      if (!args || !algo) return []
      return algo.fn(...args)
    },
    cost,
    threshold: 120,
  })

  const playback = usePlayback(steps)

  const stats = useMemo(
    () => computeStats(steps, playback.currentIndex),
    [steps, playback.currentIndex]
  )

  return { ...playback, stats, loading }
}
