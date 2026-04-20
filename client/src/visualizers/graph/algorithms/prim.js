import { STEP_TYPES } from '../../../engine/types.js'

function buildAdj(nodes, edges) {
  const adj = new Map()
  for (const n of nodes) adj.set(n.id, [])
  for (const e of edges) {
    const w = e.weight ?? 1
    adj.get(e.source).push({ to: e.target, weight: w, edge: e })
    adj.get(e.target).push({ to: e.source, weight: w, edge: e })
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

export default function prim(nodes, edges, startId) {
  const steps = []
  if (!nodes || nodes.length === 0) return steps

  const start = startId ?? nodes[0].id
  const adj = buildAdj(nodes, edges)
  const inMST = new Set([start])
  const mstKeys = new Set()
  let totalWeight = 0

  steps.push({
    highlights: [start],
    type: STEP_TYPES.VISIT,
    codeLine: 2,
    description: `Start at ${nodeLabel(nodes, start)} — add to MST`,
    state: {
      mstEdges: [],
      inMST: [...inMST],
      consideringKey: null,
      candidateEdges: [],
      totalWeight: 0,
    },
  })

  while (inMST.size < nodes.length) {
    let minEdge = null
    let minWeight = Infinity
    let minFrom = null
    let minTo = null

    const candidateKeys = []
    for (const u of inMST) {
      for (const { to, weight, edge } of adj.get(u) || []) {
        if (inMST.has(to)) continue
        candidateKeys.push(edgeKey(edge.source, edge.target))
        if (weight < minWeight) {
          minWeight = weight
          minEdge = edge
          minFrom = u
          minTo = to
        }
      }
    }

    if (!minEdge) {
      steps.push({
        highlights: [],
        type: STEP_TYPES.DONE,
        codeLine: 9,
        description: 'Graph disconnected — MST covers only reachable component',
        state: {
          mstEdges: [...mstKeys],
          inMST: [...inMST],
          consideringKey: null,
          candidateEdges: [],
          totalWeight,
        },
      })
      break
    }

    steps.push({
      highlights: [minFrom, minTo],
      type: STEP_TYPES.COMPARE,
      codeLine: 5,
      description: `Cheapest crossing edge: ${nodeLabel(nodes, minFrom)}—${nodeLabel(nodes, minTo)} (w=${minWeight})`,
      state: {
        mstEdges: [...mstKeys],
        inMST: [...inMST],
        consideringKey: edgeKey(minEdge.source, minEdge.target),
        candidateEdges: candidateKeys,
        totalWeight,
      },
    })

    inMST.add(minTo)
    mstKeys.add(edgeKey(minEdge.source, minEdge.target))
    totalWeight += minWeight

    steps.push({
      highlights: [minFrom, minTo],
      type: STEP_TYPES.INSERT,
      codeLine: 7,
      description: `Add ${nodeLabel(nodes, minTo)} to MST (total weight: ${totalWeight})`,
      state: {
        mstEdges: [...mstKeys],
        inMST: [...inMST],
        consideringKey: null,
        candidateEdges: [],
        totalWeight,
      },
    })
  }

  if (inMST.size === nodes.length) {
    steps.push({
      highlights: [],
      type: STEP_TYPES.DONE,
      codeLine: 10,
      description: `MST complete — ${mstKeys.size} edges, total weight ${totalWeight}`,
      state: {
        mstEdges: [...mstKeys],
        inMST: [...inMST],
        consideringKey: null,
        candidateEdges: [],
        totalWeight,
      },
    })
  }

  return steps
}

export const primMeta = {
  id: 'prim',
  name: "Prim's MST",
  category: 'graph',
  timeComplexity: 'O(E log V)',
  spaceComplexity: 'O(V)',
  bestCase: 'O(E log V)',
  worstCase: 'O(E log V)',
  stable: true,
  description:
    'Builds a minimum spanning tree by growing it one node at a time, always adding the cheapest edge that connects a new vertex.',
  code: {
    javascript: [
      'function prim(nodes, adj, start) {',
      '  const inMST = new Set([start]);',
      '  const mst = [];',
      '  while (inMST.size < nodes.length) {',
      '    let best = null;',
      '    for (const u of inMST) {',
      '      for (const [v, w] of adj[u]) {',
      '        if (!inMST.has(v) && (!best || w < best.w))',
      '          best = { u, v, w };',
      '      }',
      '    }',
      '    if (!best) break;',
      '    inMST.add(best.v);',
      '    mst.push(best);',
      '  }',
      '  return mst;',
      '}',
    ],
    cpp: [
      'vector<tuple<int,int,int>> prim(int n, vector<vector<pair<int,int>>>& adj) {',
      '    vector<bool> inMST(n, false);',
      '    priority_queue<tuple<int,int,int>, vector<tuple<int,int,int>>, greater<>> pq;',
      '    inMST[0] = true;',
      '    for (auto [v, w] : adj[0]) pq.push({w, 0, v});',
      '    vector<tuple<int,int,int>> mst;',
      '    while (!pq.empty() && mst.size() < n - 1) {',
      '        auto [w, u, v] = pq.top(); pq.pop();',
      '        if (inMST[v]) continue;',
      '        inMST[v] = true;',
      '        mst.push_back({u, v, w});',
      '        for (auto [nv, nw] : adj[v])',
      '            if (!inMST[nv]) pq.push({nw, v, nv});',
      '    }',
      '    return mst;',
      '}',
    ],
    c: [
      'void prim(int g[][N], int n, int parent[]) {',
      '    int key[N], inMST[N] = {0};',
      '    for (int i = 0; i < n; i++) key[i] = INT_MAX;',
      '    key[0] = 0; parent[0] = -1;',
      '    for (int c = 0; c < n - 1; c++) {',
      '        int u = -1, min = INT_MAX;',
      '        for (int v = 0; v < n; v++)',
      '            if (!inMST[v] && key[v] < min) { min = key[v]; u = v; }',
      '        inMST[u] = 1;',
      '        for (int v = 0; v < n; v++)',
      '            if (g[u][v] && !inMST[v] && g[u][v] < key[v]) {',
      '                parent[v] = u; key[v] = g[u][v];',
      '            }',
      '    }',
      '}',
    ],
    python: [
      'import heapq',
      '',
      'def prim(n, adj, start=0):',
      '    in_mst = {start}',
      '    pq = [(w, start, v) for v, w in adj[start]]',
      '    heapq.heapify(pq)',
      '    mst = []',
      '    while pq and len(mst) < n - 1:',
      '        w, u, v = heapq.heappop(pq)',
      '        if v in in_mst: continue',
      '        in_mst.add(v)',
      '        mst.append((u, v, w))',
      '        for nv, nw in adj[v]:',
      '            if nv not in in_mst:',
      '                heapq.heappush(pq, (nw, v, nv))',
      '    return mst',
    ],
    java: [
      'List<int[]> prim(int n, List<int[]>[] adj) {',
      '    boolean[] inMST = new boolean[n];',
      '    PriorityQueue<int[]> pq = new PriorityQueue<>((a,b)->a[2]-b[2]);',
      '    inMST[0] = true;',
      '    for (int[] nb : adj[0]) pq.add(new int[]{0, nb[0], nb[1]});',
      '    List<int[]> mst = new ArrayList<>();',
      '    while (!pq.isEmpty() && mst.size() < n - 1) {',
      '        int[] e = pq.poll();',
      '        if (inMST[e[1]]) continue;',
      '        inMST[e[1]] = true;',
      '        mst.add(e);',
      '        for (int[] nb : adj[e[1]])',
      '            if (!inMST[nb[0]]) pq.add(new int[]{e[1], nb[0], nb[1]});',
      '    }',
      '    return mst;',
      '}',
    ],
  },
}
