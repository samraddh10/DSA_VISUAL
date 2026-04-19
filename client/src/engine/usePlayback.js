import { useState, useCallback, useRef, useEffect } from 'react'
import { DEFAULT_SPEED } from './types.js'

/**
 * Core playback hook — drives any visualizer from an AnimationStep array.
 *
 * @param {import('./types.js').AnimationStep[]} steps
 * @returns Playback controls and current state
 */
export default function usePlayback(steps, { autoPlay = false } = {}) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [speed, setSpeed] = useState(DEFAULT_SPEED)
  const timerRef = useRef(null)
  const stepsRef = useRef(steps)

  // Keep stepsRef in sync
  stepsRef.current = steps

  const totalSteps = steps.length
  const currentStep = steps[currentIndex] || null
  const isAtStart = currentIndex === 0
  const isAtEnd = currentIndex >= totalSteps - 1
  const progress = totalSteps > 1 ? currentIndex / (totalSteps - 1) : 0

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
  }, [])

  const stepForward = useCallback(() => {
    setCurrentIndex((prev) => {
      if (prev >= stepsRef.current.length - 1) {
        setIsPlaying(false)
        return prev
      }
      return prev + 1
    })
  }, [])

  const stepBackward = useCallback(() => {
    setCurrentIndex((prev) => Math.max(0, prev - 1))
  }, [])

  const goToStep = useCallback(
    (index) => {
      const clamped = Math.max(0, Math.min(index, totalSteps - 1))
      setCurrentIndex(clamped)
    },
    [totalSteps]
  )

  const play = useCallback(() => {
    if (currentIndex >= stepsRef.current.length - 1) {
      setCurrentIndex(0)
    }
    setIsPlaying(true)
  }, [currentIndex])

  const pause = useCallback(() => {
    setIsPlaying(false)
  }, [])

  const reset = useCallback(() => {
    setIsPlaying(false)
    setCurrentIndex(0)
  }, [])

  const togglePlay = useCallback(() => {
    if (isPlaying) {
      pause()
    } else {
      play()
    }
  }, [isPlaying, play, pause])

  // Auto-advance when playing
  useEffect(() => {
    clearTimer()

    if (!isPlaying || currentIndex >= stepsRef.current.length - 1) {
      if (isPlaying && currentIndex >= stepsRef.current.length - 1) {
        setIsPlaying(false)
      }
      return
    }

    const delay = 600 / speed
    timerRef.current = setTimeout(() => {
      stepForward()
    }, delay)

    return clearTimer
  }, [isPlaying, currentIndex, speed, stepForward, clearTimer])

  // Reset when steps change
  useEffect(() => {
    setCurrentIndex(0)
    setIsPlaying(false)
  }, [steps])

  return {
    // State
    currentStep,
    currentIndex,
    totalSteps,
    isPlaying,
    isAtStart,
    isAtEnd,
    speed,
    progress,

    // Actions
    play,
    pause,
    togglePlay,
    stepForward,
    stepBackward,
    goToStep,
    reset,
    setSpeed,
  }
}
