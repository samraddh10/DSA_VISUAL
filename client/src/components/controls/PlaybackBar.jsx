import { motion, AnimatePresence } from 'framer-motion'
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  RotateCcw,
  Gauge,
} from 'lucide-react'
import { PLAYBACK_SPEEDS } from '../../engine/types.js'

export default function PlaybackBar({
  isPlaying,
  isAtStart,
  isAtEnd,
  speed,
  progress,
  currentIndex,
  totalSteps,
  onTogglePlay,
  onStepForward,
  onStepBackward,
  onReset,
  onSpeedChange,
  onSeek,
}) {
  return (
    <div className="glass rounded-2xl p-4 flex flex-col gap-3">
      {/* Progress bar */}
      <div className="flex items-center gap-3">
        <span className="text-xs font-mono text-text-muted w-8 text-right">
          {currentIndex}
        </span>
        <div
          className="flex-1 h-1.5 bg-white/10 rounded-full cursor-pointer relative"
          onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect()
            const x = e.clientX - rect.left
            const pct = x / rect.width
            const step = Math.round(pct * (totalSteps - 1))
            onSeek(step)
          }}
        >
          <motion.div
            className="absolute top-0 left-0 h-full bg-neon-purple rounded-full"
            style={{ width: `${progress * 100}%` }}
            transition={{ duration: 0.1 }}
          />
        </div>
        <span className="text-xs font-mono text-text-muted w-8">
          {totalSteps > 0 ? totalSteps - 1 : 0}
        </span>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1">
          {/* Reset */}
          <button
            onClick={onReset}
            disabled={isAtStart}
            className="w-10 h-10 flex items-center justify-center rounded-lg text-text-secondary hover:text-text-primary hover:bg-white/5 transition-colors duration-200 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
            aria-label="Reset"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* Step back */}
          <button
            onClick={onStepBackward}
            disabled={isAtStart}
            className="w-10 h-10 flex items-center justify-center rounded-lg text-text-secondary hover:text-text-primary hover:bg-white/5 transition-colors duration-200 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
            aria-label="Step backward"
          >
            <SkipBack className="w-4 h-4" />
          </button>

          {/* Play / Pause */}
          <motion.button
            onClick={onTogglePlay}
            disabled={totalSteps === 0}
            className="w-12 h-12 flex items-center justify-center rounded-xl bg-neon-purple hover:bg-neon-purple/80 text-white glow-purple transition-colors duration-200 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            aria-label={isPlaying ? 'Pause' : 'Play'}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={isPlaying ? 'pause' : 'play'}
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.5 }}
                transition={{ duration: 0.15 }}
              >
                {isPlaying ? (
                  <Pause className="w-5 h-5" />
                ) : (
                  <Play className="w-5 h-5 ml-0.5" />
                )}
              </motion.div>
            </AnimatePresence>
          </motion.button>

          {/* Step forward */}
          <button
            onClick={onStepForward}
            disabled={isAtEnd}
            className="w-10 h-10 flex items-center justify-center rounded-lg text-text-secondary hover:text-text-primary hover:bg-white/5 transition-colors duration-200 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
            aria-label="Step forward"
          >
            <SkipForward className="w-4 h-4" />
          </button>
        </div>

        {/* Speed selector */}
        <div className="flex items-center gap-2">
          <Gauge className="w-4 h-4 text-text-muted" />
          <div className="flex items-center gap-1">
            {PLAYBACK_SPEEDS.map((s) => (
              <button
                key={s}
                onClick={() => onSpeedChange(s)}
                className={`px-2 py-1 rounded text-xs font-mono transition-colors duration-200 cursor-pointer
                  ${speed === s
                    ? 'bg-neon-purple/20 text-neon-purple border border-neon-purple/30'
                    : 'text-text-muted hover:text-text-secondary hover:bg-white/5'
                  }`}
              >
                {s}x
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
