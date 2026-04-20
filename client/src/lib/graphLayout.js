import {
  forceSimulation,
  forceLink,
  forceManyBody,
  forceCenter,
  forceCollide,
} from 'd3-force'

/**
 * Compute a force-directed layout for a graph.
 *
 * @param {{id:number|string, label?:string}[]} nodes
 * @param {{source:number|string, target:number|string, weight?:number}[]} edges
 * @param {Object} opts
 * @param {number} opts.width   - SVG width
 * @param {number} opts.height  - SVG height
 * @param {number} opts.iterations - # simulation ticks (default 300)
 * @param {number} opts.linkDistance - desired edge length (default 110)
 * @param {number} opts.chargeStrength - repulsion (default -350)
 * @param {number} opts.nodeRadius - for collision (default 28)
 * @returns {Map<string|number, {x:number, y:number}>}
 */
export default function computeGraphLayout(
  nodes,
  edges,
  {
    width = 720,
    height = 460,
    iterations = 300,
    linkDistance = 110,
    chargeStrength = -350,
    nodeRadius = 28,
  } = {}
) {
  const positions = new Map()
  if (!nodes || nodes.length === 0) return positions

  const simNodes = nodes.map((n) => ({ id: n.id }))
  const simLinks = edges.map((e) => ({ source: e.source, target: e.target }))

  const sim = forceSimulation(simNodes)
    .force(
      'link',
      forceLink(simLinks)
        .id((d) => d.id)
        .distance(linkDistance)
        .strength(0.7)
    )
    .force('charge', forceManyBody().strength(chargeStrength))
    .force('center', forceCenter(width / 2, height / 2))
    .force('collide', forceCollide(nodeRadius + 4))
    .stop()

  for (let i = 0; i < iterations; i++) sim.tick()

  const padding = nodeRadius + 8
  for (const n of simNodes) {
    const x = Math.max(padding, Math.min(width - padding, n.x))
    const y = Math.max(padding, Math.min(height - padding, n.y))
    positions.set(n.id, { x, y })
  }

  return positions
}

/**
 * Build a random connected graph.
 *
 * @param {number} nodeCount
 * @param {Object} opts
 * @param {boolean} opts.weighted
 * @param {boolean} opts.directed
 * @param {number}  opts.extraEdgeRatio - fraction of extra edges beyond spanning tree
 * @returns {{nodes:{id:number,label:string}[], edges:{source:number,target:number,weight?:number}[]}}
 */
export function generateRandomGraph(
  nodeCount = 7,
  { weighted = false, directed = false, extraEdgeRatio = 0.5 } = {}
) {
  const nodes = Array.from({ length: nodeCount }, (_, i) => ({
    id: i,
    label: String.fromCharCode(65 + i),
  }))

  const edges = []
  const edgeSet = new Set()

  const addEdge = (a, b) => {
    if (a === b) return
    const key = directed ? `${a}->${b}` : a < b ? `${a}-${b}` : `${b}-${a}`
    if (edgeSet.has(key)) return
    edgeSet.add(key)
    const edge = { source: a, target: b }
    if (weighted) edge.weight = Math.floor(Math.random() * 9) + 1
    edges.push(edge)
  }

  const connected = [0]
  const remaining = Array.from({ length: nodeCount - 1 }, (_, i) => i + 1)
  while (remaining.length > 0) {
    const from = connected[Math.floor(Math.random() * connected.length)]
    const idx = Math.floor(Math.random() * remaining.length)
    const to = remaining.splice(idx, 1)[0]
    addEdge(from, to)
    connected.push(to)
  }

  const extra = Math.floor(nodeCount * extraEdgeRatio)
  for (let i = 0; i < extra; i++) {
    const a = Math.floor(Math.random() * nodeCount)
    const b = Math.floor(Math.random() * nodeCount)
    addEdge(a, b)
  }

  return { nodes, edges }
}
