import { STEP_TYPES } from '../../../engine/types.js'

function edgeKey(a, b) {
  return a < b ? `${a}-${b}` : `${b}-${a}`
}

function nodeLabel(nodes, id) {
  const n = nodes.find((x) => x.id === id)
  return n?.label ?? String(id)
}

class DSU {
  constructor(n) {
    this.parent = Array.from({ length: n }, (_, i) => i)
    this.rank = new Array(n).fill(0)
  }
  find(x) {
    while (this.parent[x] !== x) {
      this.parent[x] = this.parent[this.parent[x]]
      x = this.parent[x]
    }
    return x
  }
  union(a, b) {
    const ra = this.find(a)
    const rb = this.find(b)
    if (ra === rb) return false
    if (this.rank[ra] < this.rank[rb]) this.parent[ra] = rb
    else if (this.rank[ra] > this.rank[rb]) this.parent[rb] = ra
    else {
      this.parent[rb] = ra
      this.rank[ra]++
    }
    return true
  }
}

export default function kruskal(nodes, edges) {
  const steps = []
  if (!nodes || nodes.length === 0) return steps

  const n = nodes.length
  const idToIdx = new Map(nodes.map((nd, i) => [nd.id, i]))
  const sorted = [...edges]
    .map((e) => ({ ...e, weight: e.weight ?? 1 }))
    .sort((a, b) => a.weight - b.weight)

  const dsu = new DSU(n)
  const mstEdges = []
  const mstKeys = new Set()
  const rejectedKeys = new Set()
  let totalWeight = 0

  steps.push({
    highlights: [],
    type: STEP_TYPES.SET,
    codeLine: 1,
    description: `Sort edges by weight (ascending): ${sorted.length} edge${sorted.length === 1 ? '' : 's'}`,
    state: {
      mstEdges: [],
      consideringKey: null,
      rejectedEdges: [],
      totalWeight: 0,
      sortedEdges: sorted.map((e) => ({
        source: e.source,
        target: e.target,
        weight: e.weight,
      })),
    },
  })

  for (const e of sorted) {
    const key = edgeKey(e.source, e.target)
    const ua = idToIdx.get(e.source)
    const ub = idToIdx.get(e.target)

    steps.push({
      highlights: [e.source, e.target],
      type: STEP_TYPES.COMPARE,
      codeLine: 4,
      description: `Consider edge ${nodeLabel(nodes, e.source)}—${nodeLabel(nodes, e.target)} (w=${e.weight})`,
      state: {
        mstEdges: [...mstKeys],
        consideringKey: key,
        rejectedEdges: [...rejectedKeys],
        totalWeight,
      },
    })

    if (dsu.union(ua, ub)) {
      mstEdges.push(e)
      mstKeys.add(key)
      totalWeight += e.weight
      steps.push({
        highlights: [e.source, e.target],
        type: STEP_TYPES.INSERT,
        codeLine: 5,
        description: `Add edge to MST (total weight: ${totalWeight})`,
        state: {
          mstEdges: [...mstKeys],
          consideringKey: null,
          rejectedEdges: [...rejectedKeys],
          totalWeight,
        },
      })
      if (mstEdges.length === n - 1) break
    } else {
      rejectedKeys.add(key)
      steps.push({
        highlights: [e.source, e.target],
        type: STEP_TYPES.DELETE,
        codeLine: 7,
        description: `Cycle detected — reject edge`,
        state: {
          mstEdges: [...mstKeys],
          consideringKey: null,
          rejectedEdges: [...rejectedKeys],
          totalWeight,
        },
      })
    }
  }

  steps.push({
    highlights: [],
    type: STEP_TYPES.DONE,
    codeLine: 9,
    description: `MST complete — ${mstEdges.length} edges, total weight ${totalWeight}`,
    state: {
      mstEdges: [...mstKeys],
      consideringKey: null,
      rejectedEdges: [...rejectedKeys],
      totalWeight,
    },
  })

  return steps
}

export const kruskalMeta = {
  id: 'kruskal',
  name: "Kruskal's MST",
  category: 'graph',
  timeComplexity: 'O(E log E)',
  spaceComplexity: 'O(V)',
  bestCase: 'O(E log E)',
  worstCase: 'O(E log E)',
  stable: true,
  description:
    'Builds a minimum spanning tree by sorting edges by weight and adding each one that doesn\'t form a cycle (Union-Find).',
  code: {
    javascript: [
      'function kruskal(nodes, edges) {',
      '  edges.sort((a, b) => a.weight - b.weight);',
      '  const dsu = new DSU(nodes.length);',
      '  const mst = [];',
      '  for (const e of edges) {',
      '    if (dsu.union(e.source, e.target)) {',
      '      mst.push(e);',
      '      if (mst.length === nodes.length - 1) break;',
      '    }',
      '  }',
      '  return mst;',
      '}',
    ],
    cpp: [
      'struct Edge { int u, v, w; };',
      'vector<Edge> kruskal(int n, vector<Edge>& edges) {',
      '    sort(edges.begin(), edges.end(),',
      '         [](auto& a, auto& b){ return a.w < b.w; });',
      '    DSU dsu(n);',
      '    vector<Edge> mst;',
      '    for (auto& e : edges) {',
      '        if (dsu.unite(e.u, e.v)) {',
      '            mst.push_back(e);',
      '            if (mst.size() == n - 1) break;',
      '        }',
      '    }',
      '    return mst;',
      '}',
    ],
    c: [
      'typedef struct { int u, v, w; } Edge;',
      'int parent[N], rnk[N];',
      'int find(int x) {',
      '    while (parent[x] != x) { parent[x] = parent[parent[x]]; x = parent[x]; }',
      '    return x;',
      '}',
      'int unite(int a, int b) {',
      '    int ra = find(a), rb = find(b);',
      '    if (ra == rb) return 0;',
      '    if (rnk[ra] < rnk[rb]) parent[ra] = rb;',
      '    else if (rnk[ra] > rnk[rb]) parent[rb] = ra;',
      '    else { parent[rb] = ra; rnk[ra]++; }',
      '    return 1;',
      '}',
    ],
    python: [
      'def kruskal(n, edges):',
      '    edges.sort(key=lambda e: e[2])',
      '    parent = list(range(n))',
      '    def find(x):',
      '        while parent[x] != x:',
      '            parent[x] = parent[parent[x]]',
      '            x = parent[x]',
      '        return x',
      '    mst = []',
      '    for u, v, w in edges:',
      '        ru, rv = find(u), find(v)',
      '        if ru != rv:',
      '            parent[ru] = rv',
      '            mst.append((u, v, w))',
      '            if len(mst) == n - 1: break',
      '    return mst',
    ],
    java: [
      'int[] parent, rank;',
      'int find(int x) {',
      '    while (parent[x] != x) { parent[x] = parent[parent[x]]; x = parent[x]; }',
      '    return x;',
      '}',
      'List<int[]> kruskal(int n, int[][] edges) {',
      '    Arrays.sort(edges, (a, b) -> a[2] - b[2]);',
      '    parent = new int[n]; rank = new int[n];',
      '    for (int i = 0; i < n; i++) parent[i] = i;',
      '    List<int[]> mst = new ArrayList<>();',
      '    for (int[] e : edges) {',
      '        int ru = find(e[0]), rv = find(e[1]);',
      '        if (ru != rv) { parent[ru] = rv; mst.add(e); }',
      '    }',
      '    return mst;',
      '}',
    ],
  },
}
