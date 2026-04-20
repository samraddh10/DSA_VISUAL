# DSA Visual — Client Guidelines

## Structure
```
src/
  components/    — Reusable UI (layout, ui, controls, code-viewer, complexity)
  visualizers/   — Per-topic visualizers (sorting, searching, linked-list, stack-queue, binary-tree, heap, graph, dp)
  engine/        — Core playback engine (types.js, usePlayback.js, stepWorker.js, useWorkerSteps.js)
  lib/           — Layout algorithms (treeLayout.js, graphLayout.js)
  stores/        — Zustand state stores (visualizerStore.js)
  pages/         — Route-level page components (lazy-loaded via React.lazy)
```

## Commands
```bash
npm run dev      # Vite dev server on port 5173
npm run build    # Production build to dist/
npm run preview  # Preview production build
npm run lint     # ESLint check
```

## Conventions
- **JavaScript only** — all files `.js` or `.jsx`
- **Tailwind CSS 4** for styling — theme tokens in `index.css` `@theme` block, plugin via `@tailwindcss/vite`
- **Framer Motion** for animations — `motion.div` for bar charts, `AnimatePresence` for transitions
- **Lucide React** for icons
- Glass card pattern: `glass` or `glass-strong` CSS class + `rounded-2xl`
- Neon glow: `glow-purple`, `glow-rose`, `text-glow-purple` CSS classes
- Pages are code-split via `React.lazy()` in `App.jsx`
- Each algorithm exports a default step-generator fn + a `*Meta` named export with multi-language code
- Engine hooks: `usePlayback` (core), `useSortingEngine` (sorting-specific wrapper with stats)
- Keep algorithm functions pure — input in, `AnimationStep[]` out
- `prefers-reduced-motion` respected globally in `index.css`
- Minimum touch target: 44x44px
- Transitions: 200ms ease-out

## Theme Colors (defined in index.css @theme)
- `bg-primary`, `bg-secondary`, `bg-card`, `bg-card-hover`
- `neon-purple`, `neon-purple-light`, `neon-rose`, `neon-green`, `neon-amber`, `neon-cyan`, `neon-blue`
- `text-primary`, `text-secondary`, `text-muted`
- `border-glass`, `border-glow`

## Reusable Components (in components/)
Some are used by pages, some are available for future visualizers:
- `GlassCard` — glass card wrapper with optional hover animation and glow
- `Button` — themed button with variants (primary/secondary/danger/ghost) and sizes
- `Slider` — custom range slider with neon track
- `PlaybackBar` — full playback controls (play/pause/step/seek/speed)
- `InputPanel` — array size slider, generate random, custom input
- `CodeHighlighter` — Prism-based code viewer with active line highlighting
- `ComplexityBadge` — displays time/space complexity and stability info

Note: `SortingPage` currently has its own inline controls rather than using these reusable components.

## Web Worker
- `engine/stepWorker.js` — worker, dispatches by `type` key to any graph/DP algorithm
- `engine/useWorkerSteps.js` — transparent wrapper; computes `cost`, stays sync below threshold, posts to worker above it
- Graph engines use threshold 120 (V²·E), DP engines use threshold 200 (table cells × 2)

## Graph Algorithms (visualizers/graph/algorithms/)
Each exports a default step-generator fn + a `*Meta` named export.
- `bfs.js` — state: `{ visited, queue, current, exploredEdges, visitOrder }`
- `dfs.js` — state: `{ visited, stack, current, exploredEdges, visitOrder }`
- `dijkstra.js` — state: `{ distances, visited, current, relaxedEdges, pathEdges }`
- `kruskal.js` — state: `{ mstEdges, consideringKey, rejectedEdges, totalWeight, sortedEdges }`
- `prim.js` — state: `{ mstEdges, inMST, consideringKey, candidateEdges, totalWeight }`

## DP Algorithms (visualizers/dp/algorithms/)
Each exports a default step-generator fn + a `*Meta` named export.
- `fibonacci.js` — 1D `table`, `currentCell: [i]`, `dependencies: [[i-1],[i-2]]`
- `knapsack.js` — 2D `table`, `currentCell: [i,w]`, `rowLabels`, `colLabels`, `chosenItems`
- `lcs.js` — 2D `table`, `currentCell: [i,j]`, `rowLabels`, `colLabels`, `pathCells`, `lcsString`
