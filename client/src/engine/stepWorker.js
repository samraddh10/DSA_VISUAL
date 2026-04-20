import bfs from '../visualizers/graph/algorithms/bfs.js'
import dfs from '../visualizers/graph/algorithms/dfs.js'
import dijkstra from '../visualizers/graph/algorithms/dijkstra.js'
import kruskal from '../visualizers/graph/algorithms/kruskal.js'
import prim from '../visualizers/graph/algorithms/prim.js'
import fibonacci from '../visualizers/dp/algorithms/fibonacci.js'
import knapsack from '../visualizers/dp/algorithms/knapsack.js'
import lcs from '../visualizers/dp/algorithms/lcs.js'

const registry = {
  bfs,
  dfs,
  dijkstra,
  kruskal,
  prim,
  fibonacci,
  knapsack,
  lcs,
}

self.addEventListener('message', (e) => {
  const { id, type, args } = e.data || {}
  try {
    const fn = registry[type]
    if (!fn) {
      self.postMessage({ id, steps: [], error: `Unknown algorithm: ${type}` })
      return
    }
    const steps = fn(...(args || []))
    self.postMessage({ id, steps, error: null })
  } catch (err) {
    self.postMessage({ id, steps: [], error: err?.message ?? String(err) })
  }
})
