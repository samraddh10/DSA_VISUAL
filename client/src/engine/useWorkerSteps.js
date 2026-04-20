import { useEffect, useRef, useState } from 'react'
import StepWorker from './stepWorker.js?worker'

let workerSingleton = null
let nextId = 1

function getWorker() {
  if (!workerSingleton) workerSingleton = new StepWorker()
  return workerSingleton
}

/**
 * Offload step generation to a Web Worker when the input size exceeds `threshold`.
 * Falls back to synchronous computation for small inputs to avoid worker round-trip overhead.
 *
 * @param {string} type - Algorithm registry key (e.g. 'knapsack', 'dijkstra')
 * @param {Array} args - Args array forwarded to the algorithm
 * @param {Object} opts
 * @param {() => import('./types.js').AnimationStep[]} opts.syncFn - Synchronous step generator (fallback)
 * @param {number} opts.cost - Approximate work size (e.g. n*m). Compared against threshold.
 * @param {number} [opts.threshold=1500] - Offload to worker when cost >= threshold.
 * @returns {{ steps: import('./types.js').AnimationStep[], loading: boolean }}
 */
export default function useWorkerSteps(type, args, { syncFn, cost, threshold = 1500 }) {
  const [steps, setSteps] = useState(() => (cost < threshold ? syncFn() : []))
  const [loading, setLoading] = useState(cost >= threshold)
  const pendingIdRef = useRef(null)

  useEffect(() => {
    if (cost < threshold) {
      setSteps(syncFn())
      setLoading(false)
      return
    }

    const worker = getWorker()
    const id = nextId++
    pendingIdRef.current = id
    setLoading(true)

    const handler = (e) => {
      if (e.data?.id !== id) return
      if (pendingIdRef.current !== id) return
      setSteps(e.data.steps || [])
      setLoading(false)
      worker.removeEventListener('message', handler)
    }

    worker.addEventListener('message', handler)
    worker.postMessage({ id, type, args })

    return () => {
      pendingIdRef.current = null
      worker.removeEventListener('message', handler)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type, cost, threshold, ...(Array.isArray(args) ? flattenKey(args) : [])])

  return { steps, loading }
}

function flattenKey(args) {
  try {
    return [JSON.stringify(args)]
  } catch {
    return [args.length]
  }
}
