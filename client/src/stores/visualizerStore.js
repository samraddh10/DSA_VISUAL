import { create } from 'zustand'
import { DEFAULT_SPEED } from '../engine/types.js'

const useVisualizerStore = create((set) => ({
  // Playback
  speed: DEFAULT_SPEED,
  setSpeed: (speed) => set({ speed }),

  // Current algorithm
  currentAlgorithm: null,
  setCurrentAlgorithm: (algo) => set({ currentAlgorithm: algo }),

  // Array / data input
  inputArray: [],
  setInputArray: (arr) => set({ inputArray: arr }),

  // Array size for generators
  arraySize: 20,
  setArraySize: (size) => set({ arraySize: size }),

  // Generate random array
  generateRandomArray: (size) => {
    const s = size || useVisualizerStore.getState().arraySize
    const arr = Array.from({ length: s }, () => Math.floor(Math.random() * 100) + 5)
    set({ inputArray: arr, arraySize: s })
    return arr
  },
}))

export default useVisualizerStore
