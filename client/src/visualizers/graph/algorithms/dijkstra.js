import { STEP_TYPES } from '../../../engine/types.js'

function buildAdj(nodes, edges, directed = false) {
  const adj = new Map()
  for (const n of nodes) adj.set(n.id, [])
  for (const e of edges) {
    const w = e.weight ?? 1
    adj.get(e.source).push({ to: e.target, weight: w, edge: e })
    if (!directed) adj.get(e.target).push({ to: e.source, weight: w, edge: e })
  }
  return adj
}

function edgeKey(a, b) {
  return a < b ? `${a}-${b}` : `${b}-${a}`
}

function nodeLabel(nodes, id) {
  const n = nodes.find((x) => x.id === id)
  return n?.label ?? String(id)
}

function distMap(distances) {
  const out = {}
  for (const [k, v] of distances) out[k] = v === Infinity ? null : v
  return out
}

export default function dijkstra(nodes, edges, startId, endId = null) {
  const steps = []
  if (!nodes || nodes.length === 0 || startId == null) return steps

  const adj = buildAdj(nodes, edges)
  const distances = new Map()
  const previous = new Map()
  const unvisited = new Set()
  const visited = new Set()
  const relaxedEdges = new Set()

  for (const n of nodes) {
    distances.set(n.id, n.id === startId ? 0 : Infinity)
    previous.set(n.id, null)
    unvisited.add(n.id)
  }

  steps.push({
    highlights: [startId],
    type: STEP_TYPES.SET,
    codeLine: 1,
    description: `Initialize: distance to ${nodeLabel(nodes, startId)} = 0, others = ∞`,
    state: {
      distances: distMap(distances),
      visited: [],
      current: null,
      relaxedEdges: [],
      pathEdges: [],
    },
  })

  while (unvisited.size > 0) {
    let current = null
    let minDist = Infinity
    for (const id of unvisited) {
      const d = distances.get(id)
      if (d < minDist) {
        minDist = d
        current = id
      }
    }

    if (current === null || minDist === Infinity) {
      steps.push({
        highlights: [],
        type: STEP_TYPES.DONE,
        codeLine: 6,
        description: 'Remaining nodes unreachable from start',
        state: {
          distances: distMap(distances),
          visited: [...visited],
          current: null,
          relaxedEdges: [...relaxedEdges],
          pathEdges: [],
        },
      })
      break
    }

    unvisited.delete(current)
    visited.add(current)

    steps.push({
      highlights: [current],
      type: STEP_TYPES.VISIT,
      codeLine: 4,
      description: `Pick min-distance node ${nodeLabel(nodes, current)} (d=${distances.get(current)})`,
      state: {
        distances: distMap(distances),
        visited: [...visited],
        current,
        relaxedEdges: [...relaxedEdges],
        pathEdges: [],
      },
    })

    if (endId !== null && current === endId) {
      break
    }

    const neighbors = adj.get(current) || []
    for (const { to, weight, edge } of neighbors) {
      if (visited.has(to)) continue
      const alt = distances.get(current) + weight
      const key = edgeKey(edge.source, edge.target)
      relaxedEdges.add(key)

      if (alt < distances.get(to)) {
        distances.set(to, alt)
        previous.set(to, current)
        steps.push({
          highlights: [current, to],
          type: STEP_TYPES.SET,
          codeLine: 8,
          description: `Relax: ${nodeLabel(nodes, to)} = ${distances.get(current)} + ${weight} = ${alt}`,
          state: {
            distances: distMap(distances),
            visited: [...visited],
            current,
            relaxedEdges: [...relaxedEdges],
            pathEdges: [],
          },
        })
      } else {
        steps.push({
          highlights: [current, to],
          type: STEP_TYPES.COMPARE,
          codeLine: 9,
          description: `No improvement for ${nodeLabel(nodes, to)} (${distances.get(to)} ≤ ${alt})`,
          state: {
            distances: distMap(distances),
            visited: [...visited],
            current,
            relaxedEdges: [...relaxedEdges],
            pathEdges: [],
          },
        })
      }
    }
  }

  const pathEdges = []
  if (endId !== null && distances.get(endId) !== Infinity) {
    let cur = endId
    while (previous.get(cur) !== null) {
      const prev = previous.get(cur)
      pathEdges.push(edgeKey(prev, cur))
      cur = prev
    }
  }

  steps.push({
    highlights: endId !== null ? [endId] : [...visited],
    type: STEP_TYPES.DONE,
    codeLine: 11,
    description:
      endId !== null
        ? distances.get(endId) === Infinity
          ? `No path to ${nodeLabel(nodes, endId)}`
          : `Shortest path to ${nodeLabel(nodes, endId)}: distance = ${distances.get(endId)}`
        : `Dijkstra complete`,
    state: {
      distances: distMap(distances),
      visited: [...visited],
      current: null,
      relaxedEdges: [...relaxedEdges],
      pathEdges,
    },
  })

  return steps
}

export const dijkstraMeta = {
  id: 'dijkstra',
  name: "Dijkstra's Algorithm",
  category: 'graph',
  timeComplexity: 'O((V + E) log V)',
  spaceComplexity: 'O(V)',
  bestCase: 'O((V + E) log V)',
  worstCase: 'O((V + E) log V)',
  stable: true,
  description:
    'Finds the shortest path from a source to all other nodes in a weighted graph with non-negative edge weights.',
  code: {
    javascript: [
      'function dijkstra(graph, start) {',
      '  const dist = {}; const prev = {};',
      '  for (const v of graph.nodes) dist[v] = Infinity;',
      '  dist[start] = 0;',
      '  const pq = new MinHeap([[0, start]]);',
      '  while (!pq.isEmpty()) {',
      '    const [d, u] = pq.pop();',
      '    if (d > dist[u]) continue;',
      '    for (const [v, w] of graph.adj[u]) {',
      '      if (dist[u] + w < dist[v]) {',
      '        dist[v] = dist[u] + w;',
      '        prev[v] = u;',
      '        pq.push([dist[v], v]);',
      '      }',
      '    }',
      '  }',
      '  return { dist, prev };',
      '}',
    ],
    cpp: [
      'void dijkstra(vector<vector<pair<int,int>>>& g, int s, vector<int>& dist) {',
      '    dist.assign(g.size(), INT_MAX);',
      '    dist[s] = 0;',
      '    priority_queue<pair<int,int>, vector<pair<int,int>>, greater<>> pq;',
      '    pq.push({0, s});',
      '    while (!pq.empty()) {',
      '        auto [d, u] = pq.top(); pq.pop();',
      '        if (d > dist[u]) continue;',
      '        for (auto [v, w] : g[u]) {',
      '            if (dist[u] + w < dist[v]) {',
      '                dist[v] = dist[u] + w;',
      '                pq.push({dist[v], v});',
      '            }',
      '        }',
      '    }',
      '}',
    ],
    c: [
      'void dijkstra(int g[][N], int n, int s, int dist[]) {',
      '    int visited[N] = {0};',
      '    for (int i = 0; i < n; i++) dist[i] = INT_MAX;',
      '    dist[s] = 0;',
      '    for (int i = 0; i < n; i++) {',
      '        int u = -1, min = INT_MAX;',
      '        for (int j = 0; j < n; j++)',
      '            if (!visited[j] && dist[j] < min) { min = dist[j]; u = j; }',
      '        if (u == -1) break;',
      '        visited[u] = 1;',
      '        for (int v = 0; v < n; v++)',
      '            if (g[u][v] && dist[u] + g[u][v] < dist[v])',
      '                dist[v] = dist[u] + g[u][v];',
      '    }',
      '}',
    ],
    python: [
      'import heapq',
      '',
      'def dijkstra(graph, start):',
      '    dist = {v: float("inf") for v in graph}',
      '    dist[start] = 0',
      '    pq = [(0, start)]',
      '    while pq:',
      '        d, u = heapq.heappop(pq)',
      '        if d > dist[u]: continue',
      '        for v, w in graph[u]:',
      '            if dist[u] + w < dist[v]:',
      '                dist[v] = dist[u] + w',
      '                heapq.heappush(pq, (dist[v], v))',
      '    return dist',
    ],
    java: [
      'int[] dijkstra(List<int[]>[] g, int s) {',
      '    int n = g.length;',
      '    int[] dist = new int[n];',
      '    Arrays.fill(dist, Integer.MAX_VALUE);',
      '    dist[s] = 0;',
      '    PriorityQueue<int[]> pq = new PriorityQueue<>((a,b)->a[0]-b[0]);',
      '    pq.add(new int[]{0, s});',
      '    while (!pq.isEmpty()) {',
      '        int[] cur = pq.poll();',
      '        int d = cur[0], u = cur[1];',
      '        if (d > dist[u]) continue;',
      '        for (int[] nb : g[u]) {',
      '            if (dist[u] + nb[1] < dist[nb[0]]) {',
      '                dist[nb[0]] = dist[u] + nb[1];',
      '                pq.add(new int[]{dist[nb[0]], nb[0]});',
      '            }',
      '        }',
      '    }',
      '    return dist;',
      '}',
    ],
  },
}
