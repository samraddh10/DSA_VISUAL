import { useRef, useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ArrowRightLeft,
  Search,
  Link2,
  Layers,
  GitBranch,
  Triangle,
  Hash,
  Network,
  Cpu,
  Swords,
} from 'lucide-react'

/* ─── Category Card ─── */
function CategoryCard({ title, description, icon, path, index }) {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.8 + index * 0.1 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="relative group"
    >
      <Link to={path} className="block cursor-pointer">
        <div className="relative h-full rounded-xl overflow-hidden border border-neon-purple/20 bg-black/40 backdrop-blur-sm p-6 transition-all duration-300 hover:border-neon-purple/50 hover:bg-black/60">
          <div className="absolute inset-0 bg-gradient-to-br from-neon-purple/10 via-transparent to-neon-rose/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          <motion.div
            animate={{
              boxShadow: isHovered
                ? '0 0 20px rgba(124, 58, 237, 0.4)'
                : '0 0 10px rgba(124, 58, 237, 0.2)',
            }}
            className="relative z-10 w-12 h-12 rounded-lg bg-gradient-to-br from-neon-purple/20 to-neon-rose/20 flex items-center justify-center mb-4 border border-neon-purple/30"
          >
            <div className="text-neon-purple-light">{icon}</div>
          </motion.div>

          <h3 className="relative z-10 text-xl font-semibold text-white mb-2 group-hover:text-neon-purple-light transition-colors">
            {title}
          </h3>
          <p className="relative z-10 text-sm text-text-secondary group-hover:text-text-primary transition-colors">
            {description}
          </p>

          <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-neon-purple/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>
      </Link>
    </motion.div>
  )
}

/* ─── Dot Grid Background ─── */
function DotGrid({ canvasRef }) {
  const animationFrameId = useRef(null)
  const dotsRef = useRef([])
  const gridRef = useRef({})
  const canvasSizeRef = useRef({ width: 0, height: 0 })
  const mousePositionRef = useRef({ x: null, y: null })

  const DOT_SPACING = 30
  const BASE_OPACITY_MIN = 0.3
  const BASE_OPACITY_MAX = 0.5
  const BASE_RADIUS = 1.5
  const INTERACTION_RADIUS = 180
  const INTERACTION_RADIUS_SQ = INTERACTION_RADIUS * INTERACTION_RADIUS
  const OPACITY_BOOST = 0.7
  const RADIUS_BOOST = 3
  const GRID_CELL_SIZE = Math.max(50, Math.floor(INTERACTION_RADIUS / 1.5))

  const handleMouseMove = useCallback((event) => {
    const canvas = canvasRef.current
    if (!canvas) {
      mousePositionRef.current = { x: null, y: null }
      return
    }
    const rect = canvas.getBoundingClientRect()
    mousePositionRef.current = {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    }
  }, [canvasRef])

  const createDots = useCallback(() => {
    const { width, height } = canvasSizeRef.current
    if (width === 0 || height === 0) return

    const newDots = []
    const newGrid = {}
    const cols = Math.ceil(width / DOT_SPACING)
    const rows = Math.ceil(height / DOT_SPACING)

    for (let i = 0; i < cols; i++) {
      for (let j = 0; j < rows; j++) {
        const x = i * DOT_SPACING + DOT_SPACING / 2
        const y = j * DOT_SPACING + DOT_SPACING / 2
        const cellKey = `${Math.floor(x / GRID_CELL_SIZE)}_${Math.floor(y / GRID_CELL_SIZE)}`

        if (!newGrid[cellKey]) newGrid[cellKey] = []

        const dotIndex = newDots.length
        newGrid[cellKey].push(dotIndex)

        const baseOpacity = Math.random() * (BASE_OPACITY_MAX - BASE_OPACITY_MIN) + BASE_OPACITY_MIN
        newDots.push({
          x,
          y,
          targetOpacity: baseOpacity,
          currentOpacity: baseOpacity,
          opacitySpeed: Math.random() * 0.005 + 0.002,
          baseRadius: BASE_RADIUS,
          currentRadius: BASE_RADIUS,
        })
      }
    }
    dotsRef.current = newDots
    gridRef.current = newGrid
  }, [DOT_SPACING, GRID_CELL_SIZE, BASE_OPACITY_MIN, BASE_OPACITY_MAX, BASE_RADIUS])

  const handleResize = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const container = canvas.parentElement
    const width = container ? container.clientWidth : window.innerWidth
    const height = container ? container.clientHeight : window.innerHeight

    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width
      canvas.height = height
      canvasSizeRef.current = { width, height }
      createDots()
    }
  }, [canvasRef, createDots])

  const animateDots = useCallback(() => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    const dots = dotsRef.current
    const grid = gridRef.current
    const { width, height } = canvasSizeRef.current
    const { x: mouseX, y: mouseY } = mousePositionRef.current

    if (!ctx || !dots || width === 0 || height === 0) {
      animationFrameId.current = requestAnimationFrame(animateDots)
      return
    }

    ctx.clearRect(0, 0, width, height)

    const activeDotIndices = new Set()
    if (mouseX !== null && mouseY !== null) {
      const mouseCellX = Math.floor(mouseX / GRID_CELL_SIZE)
      const mouseCellY = Math.floor(mouseY / GRID_CELL_SIZE)
      const searchRadius = Math.ceil(INTERACTION_RADIUS / GRID_CELL_SIZE)
      for (let i = -searchRadius; i <= searchRadius; i++) {
        for (let j = -searchRadius; j <= searchRadius; j++) {
          const cellKey = `${mouseCellX + i}_${mouseCellY + j}`
          if (grid[cellKey]) {
            grid[cellKey].forEach((idx) => activeDotIndices.add(idx))
          }
        }
      }
    }

    dots.forEach((dot, index) => {
      dot.currentOpacity += dot.opacitySpeed
      if (dot.currentOpacity >= dot.targetOpacity || dot.currentOpacity <= BASE_OPACITY_MIN) {
        dot.opacitySpeed = -dot.opacitySpeed
        dot.currentOpacity = Math.max(BASE_OPACITY_MIN, Math.min(dot.currentOpacity, BASE_OPACITY_MAX))
        dot.targetOpacity = Math.random() * (BASE_OPACITY_MAX - BASE_OPACITY_MIN) + BASE_OPACITY_MIN
      }

      let interactionFactor = 0
      dot.currentRadius = dot.baseRadius

      if (mouseX !== null && mouseY !== null && activeDotIndices.has(index)) {
        const dx = dot.x - mouseX
        const dy = dot.y - mouseY
        const distSq = dx * dx + dy * dy
        if (distSq < INTERACTION_RADIUS_SQ) {
          const f = 1 - Math.sqrt(distSq) / INTERACTION_RADIUS
          interactionFactor = f * f
        }
      }

      const finalOpacity = Math.min(1, dot.currentOpacity + interactionFactor * OPACITY_BOOST)
      dot.currentRadius = dot.baseRadius + interactionFactor * RADIUS_BOOST

      ctx.beginPath()
      ctx.fillStyle = `rgba(124, 58, 237, ${finalOpacity.toFixed(3)})`
      ctx.arc(dot.x, dot.y, dot.currentRadius, 0, Math.PI * 2)
      ctx.fill()
    })

    animationFrameId.current = requestAnimationFrame(animateDots)
  }, [canvasRef, GRID_CELL_SIZE, INTERACTION_RADIUS, INTERACTION_RADIUS_SQ, OPACITY_BOOST, RADIUS_BOOST, BASE_OPACITY_MIN, BASE_OPACITY_MAX])

  useEffect(() => {
    handleResize()
    const handleMouseLeave = () => {
      mousePositionRef.current = { x: null, y: null }
    }

    window.addEventListener('mousemove', handleMouseMove, { passive: true })
    window.addEventListener('resize', handleResize)
    document.documentElement.addEventListener('mouseleave', handleMouseLeave)
    animationFrameId.current = requestAnimationFrame(animateDots)

    return () => {
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('mousemove', handleMouseMove)
      document.documentElement.removeEventListener('mouseleave', handleMouseLeave)
      if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current)
    }
  }, [handleResize, handleMouseMove, animateDots])

  return null
}

/* ─── Categories ─── */
const categories = [
  {
    title: 'Sorting',
    description: 'Visualize bubble, merge, quick sort and more',
    icon: <ArrowRightLeft size={24} />,
    path: '/sorting',
  },
  {
    title: 'Searching',
    description: 'Explore linear and binary search techniques',
    icon: <Search size={24} />,
    path: '/searching',
  },
  {
    title: 'Linked Lists',
    description: 'Learn pointer-based data structures',
    icon: <Link2 size={24} />,
    path: '/linked-list',
  },
  {
    title: 'Stacks & Queues',
    description: 'Understand LIFO and FIFO operations',
    icon: <Layers size={24} />,
    path: '/stack-queue',
  },
  {
    title: 'Trees',
    description: 'Explore BST operations and traversals',
    icon: <GitBranch size={24} />,
    path: '/trees',
  },
  {
    title: 'Heaps',
    description: 'Heapify, insert, and extract operations',
    icon: <Triangle size={24} />,
    path: '/heaps',
  },
  {
    title: 'Hash Tables',
    description: 'Visualize hashing and collision resolution',
    icon: <Hash size={24} />,
    path: '/hash-table',
  },
  {
    title: 'Graphs',
    description: 'BFS, DFS, Dijkstra, Kruskal, and Prim',
    icon: <Network size={24} />,
    path: '/graphs',
  },
  {
    title: 'Dynamic Programming',
    description: 'Solve complex problems with tabulation',
    icon: <Cpu size={24} />,
    path: '/dp',
  },
  {
    title: 'Compare Algorithms',
    description: 'Race two sorting algorithms side-by-side',
    icon: <Swords size={24} />,
    path: '/compare',
  },
]

/* ─── Home Page ─── */
export default function Home() {
  const canvasRef = useRef(null)

  return (
    <div className="relative min-h-screen flex flex-col overflow-x-hidden">
      {/* Dot grid background */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 z-0 pointer-events-none opacity-60"
      />
      <DotGrid canvasRef={canvasRef} />

      {/* Gradient overlays */}
      <div
        className="absolute inset-0 z-[1] pointer-events-none"
        style={{
          background:
            'linear-gradient(to bottom, transparent 0%, #0F0F23 95%), radial-gradient(ellipse at center, transparent 30%, #0F0F23 90%)',
        }}
      />
      <div className="absolute inset-0 z-[2] pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-neon-purple/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-neon-rose/20 rounded-full blur-[120px]" />
      </div>

      {/* Content */}
      <main className="relative z-10 flex-grow flex flex-col items-center justify-center text-center px-4 py-20">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-6"
        >
          <span className="inline-block bg-gradient-to-r from-neon-purple/20 to-neon-rose/20 border border-neon-purple/30 text-neon-purple-light px-4 py-2 rounded-full text-sm font-medium backdrop-blur-sm">
            Master Data Structures & Algorithms
          </span>
        </motion.div>

        {/* Heading */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white leading-tight mb-6 max-w-5xl"
        >
          Visualize & Learn
          <br />
          <span className="bg-gradient-to-r from-neon-purple via-neon-rose to-neon-amber bg-clip-text text-transparent">
            Algorithms
          </span>
        </motion.h1>

        {/* Tagline */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-lg sm:text-xl text-text-secondary max-w-2xl mx-auto mb-10"
        >
          Interactive step-by-step visualizations for every major algorithm and data structure. Play, pause, and step through each operation.
        </motion.p>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mb-16"
        >
          <Link
            to="/sorting"
            className="group relative overflow-hidden bg-gradient-to-r from-neon-purple to-neon-rose text-white px-8 py-4 rounded-lg text-lg font-semibold transition-all duration-300 hover:shadow-[0_0_30px_rgba(124,58,237,0.5)] hover:scale-105 inline-block cursor-pointer"
          >
            <span className="relative z-10">Start Exploring</span>
            <div className="absolute inset-0 bg-gradient-to-r from-neon-purple/80 to-neon-rose/80 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </Link>
        </motion.div>

        {/* Category Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="w-full max-w-7xl mx-auto px-4"
        >
          <h2 className="text-3xl font-bold text-white mb-8">
            Explore Topics
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((category, index) => (
              <CategoryCard key={category.title} index={index} {...category} />
            ))}
          </div>
        </motion.div>
      </main>
    </div>
  )
}
