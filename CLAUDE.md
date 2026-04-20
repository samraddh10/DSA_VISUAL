# DSA Visual — Project Guidelines

## Overview
Interactive DSA (Data Structures & Algorithms) visualization website for students. Cyberpunk/glassmorphism UI with dark theme and neon accents.

## Tech Stack
- **Client:** React 19 (Vite 8) + Tailwind CSS 4 (`@tailwindcss/vite` plugin) + Framer Motion + Zustand + React Router 7
- **Server:** Node.js + Express 4 + MongoDB (Mongoose 8), ES Modules (`"type": "module"`)
- **Language:** JavaScript only (no TypeScript)
- **Visualization:** DOM elements (`<div>` bars) with Framer Motion layout animations; Canvas for Home page dot-grid background
- **Animation:** Framer Motion (GPU-accelerated, `transform`/`opacity` only for components; Canvas `requestAnimationFrame` for dot grid)
- **State:** Zustand (lightweight, works outside React)
- **Code Highlighting:** Prism React Renderer (nightOwl theme)
- **Graph Layout:** d3-force (installed, not yet used — reserved for future graph visualizers)
- **Icons:** Lucide React

## Architecture
Every algorithm is a **pure function** that takes input and returns `AnimationStep[]`. Each algorithm file also exports a `*Meta` object with metadata (complexity, description, multi-language code snippets). The `usePlayback` hook consumes the steps array and drives any visualizer. Per-topic engine hooks (e.g., `useSortingEngine`) wrap `usePlayback` and add domain-specific logic like stats. This decouples computation from rendering.

### Key Flow — Algorithm-based (Sorting, Searching)
```
Algorithm fn(input) → AnimationStep[]
  ↓
use*Engine(algoId, input)  — memoizes steps, computes stats
  ↓
usePlayback(steps)  — play/pause/step/seek/speed controls
  ↓
*Visualizer   — renders from currentStep.state
```

### Key Flow — Operation-based (Linked List, Stack & Queue)
```
User clicks operation → op(currentState, args) → AnimationStep[]
  ↓
setSteps(result.steps) + setItems(result.items)
  ↓
usePlayback(steps)  — play/pause/step/seek/speed controls
  ↓
*Visualizer   — renders from currentStep.state
```

## Current Implementation Status
- **Sorting:** Fully implemented — Bubble, Selection, Insertion, Merge, Quick, Heap sort
  - Bar chart visualizer with color-coded step types (compare/swap/pivot/merge/done)
  - Multi-language code viewer (JavaScript, C++, C, Python, Java)
  - Live stats tracking (comparisons, swaps, array accesses)
  - Playback controls with 6 speed levels (0.25x–4x)
- **Searching:** Fully implemented — Linear Search, Binary Search
  - Array cell visualizer with L/M/H pointers (binary) and current pointer (linear)
  - Auto-sorts array for binary search, custom target input
  - Stats: comparisons count
- **Linked Lists:** Fully implemented — Singly & Doubly linked lists
  - Operations: Insert Head/Tail/At Position, Delete Head/Tail, Search, Traverse
  - Node chain visualizer with forward arrows + dashed backward arrows (doubly)
  - AnimatePresence for node add/remove transitions
- **Stacks & Queues:** Fully implemented — Stack (LIFO) & Queue (FIFO)
  - Stack: vertical layout (top → bottom), Queue: horizontal layout (front → rear)
  - Operations: Push/Pop/Peek (Stack), Enqueue/Dequeue/Peek (Queue)
  - AnimatePresence for element add/remove transitions
- **Trees:** Fully implemented — Binary Search Tree
  - Operations: Insert, Delete, Search
  - Traversals: Inorder, Preorder, Postorder, Level-order
  - SVG tree visualizer with Reingold-Tilford layout, animated edges
  - Traversal result strip shows visited order
  - Multi-language code viewer (JavaScript, C++, C, Python, Java)
- **Heaps:** Fully implemented — Max-Heap & Min-Heap
  - Operations: Insert, Extract Max/Min, Peek, Heapify Random
  - Dual view: tree visualization + array representation
  - Mode toggle between Max-Heap and Min-Heap
  - Multi-language code viewer (JavaScript, C++, C, Python, Java)
- **Graphs:** Fully implemented — BFS, DFS, Dijkstra, Kruskal, Prim
  - SVG graph visualizer with d3-force layout (computeGraphLayout in lib/graphLayout.js)
  - Node/edge color states: default, current, visited, inMST, path, considering, rejected, candidate
  - Frontier strip shows live queue (BFS), stack (DFS), or visit order
  - Dijkstra shows distance labels above each node and highlights shortest path edges
  - Kruskal/Prim highlight MST edges green, rejected edges dashed red
  - Start/end node pickers, node count slider, random graph generator
  - Multi-language code viewer (JavaScript, C++, C, Python, Java)
  - Web Worker offloads computation when V²·E ≥ 120
- **Dynamic Programming:** Fully implemented — Fibonacci, 0/1 Knapsack, LCS
  - Fibonacci: 1D array fill with dependency arrows (current cell amber, deps cyan)
  - Knapsack: 2D table with row labels (item weight/value) and column labels (capacity)
  - LCS: 2D table with character row/col headers; path cells highlighted green on completion
  - Chosen items and LCS string shown below table on completion
  - Editable item list for Knapsack, string inputs for LCS, n slider for Fibonacci
  - Multi-language code viewer (JavaScript, C++, C, Python, Java)
  - Web Worker offloads when table cells × 2 ≥ 200
- **Home page:** Interactive dot-grid canvas background with mouse proximity effects; category cards linking to all planned topics
- **Planned (routes exist in Home but not yet implemented):** Hash Tables

## Web Worker Infrastructure
- `engine/stepWorker.js` — worker script; imports all graph/DP algorithm modules, dispatches by `type` key
- `engine/useWorkerSteps.js` — hook that computes a `cost` estimate; below threshold → sync, above → postMessage to worker singleton
- Both `useGraphEngine` and `useDPEngine` use this transparently; consumers just see `{ steps, loading }`

## Routes
| Path | Page | Status |
|------|------|--------|
| `/` | Home | Done |
| `/sorting` | SortingPage | Done |
| `/searching` | SearchingPage | Done |
| `/linked-list` | LinkedListPage | Done |
| `/stack-queue` | StackQueuePage | Done |
| `/trees` | TreePage | Done |
| `/heaps` | HeapPage | Done |
| `/graphs` | GraphPage | Done |
| `/dp` | DPPage | Done |
| `/hash-table` | — | Planned |

## API Endpoints
- `GET /api/algorithms` — List algorithms (optional `?category=` filter)
- `GET /api/algorithms/:algorithmId` — Single algorithm metadata
- `GET /api/visualizations` — List saved visualizations (optional `?category=` filter)
- `GET /api/visualizations/:shareId` — Single saved visualization
- `POST /api/visualizations` — Create saved visualization (body: `title`, `algorithmId`, `category`, `inputData`)
- `DELETE /api/visualizations/:shareId` — Delete saved visualization

## Project Structure
```
root/
  package.json          — Workspace scripts (concurrently for dev)
  client/
    vite.config.js      — Vite + React + Tailwind plugins, /api proxy to :5000
    src/
      main.jsx          — BrowserRouter + StrictMode entry
      App.jsx           — Layout shell + lazy-loaded routes
      index.css         — @theme tokens, glass/glow utilities, reduced-motion
      engine/
        types.js            — AnimationStep/AlgorithmMeta JSDoc, STEP_TYPES, PLAYBACK_SPEEDS
        usePlayback.js      — Core playback hook (play/pause/step/seek/speed)
        stepWorker.js       — Web Worker: runs any algorithm by type key
        useWorkerSteps.js   — Hook: sync for small inputs, worker for large (threshold-based)
      stores/
        visualizerStore.js — Zustand store (speed, algorithm, array input/generation)
      components/
        layout/         — Navbar.jsx, Footer.jsx
        ui/             — GlassCard.jsx, Button.jsx, Slider.jsx
        controls/       — PlaybackBar.jsx, InputPanel.jsx
        code-viewer/    — CodeHighlighter.jsx
        complexity/     — ComplexityBadge.jsx
      visualizers/
        sorting/
          SortingVisualizer.jsx  — Bar chart renderer
          useSortingEngine.js    — Sorting-specific playback + stats
          algorithms/            — bubbleSort.js, selectionSort.js, insertionSort.js,
                                   mergeSort.js, quickSort.js, heapSort.js
        searching/
          SearchVisualizer.jsx   — Array cell renderer with pointer labels
          useSearchEngine.js     — Searching-specific playback + stats
          algorithms/            — linearSearch.js, binarySearch.js
        linked-list/
          LinkedListVisualizer.jsx — Node chain renderer with arrows
          linkedListOps.js         — Insert/delete/search/traverse operations + meta
        stack-queue/
          StackQueueVisualizer.jsx — Vertical stack / horizontal queue renderer
          stackQueueOps.js         — Push/pop/enqueue/dequeue/peek operations + meta
        binary-tree/
          BSTVisualizer.jsx  — SVG tree renderer with Reingold-Tilford layout
          bstOps.js          — Insert/delete/search/traversals operations + meta
        heap/
          HeapVisualizer.jsx — Dual tree + array renderer
          heapOps.js         — Insert/extract/heapify/peek operations + meta
        graph/
          GraphVisualizer.jsx   — SVG node/edge renderer with d3-force layout positions
          useGraphEngine.js     — Engine hook wrapping usePlayback + optional worker
          algorithms/           — bfs.js, dfs.js, dijkstra.js, kruskal.js, prim.js
        dp/
          DPVisualizer.jsx      — 1D (Fibonacci) and 2D (Knapsack/LCS) table renderer
          useDPEngine.js        — Engine hook wrapping usePlayback + optional worker
          algorithms/           — fibonacci.js, knapsack.js, lcs.js
      lib/
        treeLayout.js       — Reingold-Tilford tree positioning algorithm
        graphLayout.js      — d3-force wrapper (computeGraphLayout) + generateRandomGraph
      pages/
        Home.jsx            — Landing page with canvas dot grid + category cards
        SortingPage.jsx     — Full sorting visualizer page (self-contained layout)
        SearchingPage.jsx   — Searching visualizer page with target input
        LinkedListPage.jsx  — Linked list visualizer with operation controls
        StackQueuePage.jsx  — Stack & queue visualizer with mode toggle
        TreePage.jsx        — BST visualizer with operations + traversals
        HeapPage.jsx        — Heap visualizer with Max/Min mode toggle
        GraphPage.jsx       — Graph visualizer (BFS/DFS/Dijkstra/Kruskal/Prim)
        DPPage.jsx          — DP visualizer (Fibonacci/Knapsack/LCS)
  server/
    index.js            — Express entry (compression, helmet, cors, static serving)
    config/db.js        — MongoDB connection via Mongoose
    models/             — Visualization.js, AlgorithmMeta.js
    routes/             — visualizations.js (CRUD), algorithms.js (read-only)
```

## Design System
- **Background:** `#0F0F23` (dark navy), `#1a1a3e` (secondary)
- **Primary:** `#7C3AED` (neon purple)
- **Secondary:** `#A78BFA` (light purple)
- **CTA:** `#F43F5E` (rose)
- **Success:** `#10B981`, **Warning:** `#F59E0B`, **Cyan:** `#22D3EE`, **Blue:** `#3B82F6`
- **Text:** `#E2E8F0` primary, `#94A3B8` secondary, `#64748B` muted
- **Borders:** `rgba(255,255,255,0.1)` glass, `rgba(124,58,237,0.4)` glow
- **Fonts:** Inter (UI) + JetBrains Mono (code) — loaded via Google Fonts in `index.css`
- **Effects:** Glass cards (`glass`/`glass-strong` classes + `backdrop-blur`), neon glow (`glow-purple`, `glow-rose`, `text-glow-purple`)
- **Motion:** 200ms ease-out transitions, respect `prefers-reduced-motion`
- **Contrast:** Minimum 4.5:1 ratio

## Commands
```bash
# Development
npm run dev          # Run client + server concurrently
npm run dev:client   # Client only (Vite, port 5173)
npm run dev:server   # Server only (Express, port 5000, --watch auto-restart)

# Production
npm run build        # Build client (Vite → client/dist/)
npm start            # Start production server (serves client/dist/ as static)

# Client-specific
cd client && npm run lint      # ESLint
cd client && npm run preview   # Preview production build
```

## Environment Variables (server/.env)
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/dsa-visual
NODE_ENV=development
```

## Conventions
- All files are `.js` / `.jsx` — no TypeScript
- Components use `export default function ComponentName()`
- Use Tailwind utility classes — theme tokens defined in `index.css` `@theme` block
- Use Lucide React for icons — never emojis
- Code-split visualizer pages with `React.lazy()` in `App.jsx`
- Algorithm functions are pure — input in, `AnimationStep[]` out, no side effects
- Each algorithm file exports both a default step-generator function and a `*Meta` named export
- Algorithm meta includes multi-language `code` object with keys: `javascript`, `cpp`, `c`, `python`, `java`
- Use `useMemo` for step generation keyed on `[algorithmId, inputArray]`
- Proxy `/api` requests from client to server in dev (configured in `vite.config.js`)
- Server uses ES Modules, Express middleware: `compression` + `helmet` + `cors`
- Mongoose models use indexed fields and `.lean()` queries
