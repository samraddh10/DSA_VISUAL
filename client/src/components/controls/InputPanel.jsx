import { useState } from 'react'
import { Shuffle, Pencil } from 'lucide-react'
import Button from '../ui/Button.jsx'
import Slider from '../ui/Slider.jsx'

export default function InputPanel({
  arraySize,
  onArraySizeChange,
  onGenerate,
  onCustomInput,
  disabled = false,
}) {
  const [customValue, setCustomValue] = useState('')

  const handleCustomSubmit = (e) => {
    e.preventDefault()
    const arr = customValue
      .split(',')
      .map((s) => parseInt(s.trim(), 10))
      .filter((n) => !isNaN(n) && n > 0 && n <= 200)
    if (arr.length >= 2) {
      onCustomInput(arr)
      setCustomValue('')
    }
  }

  return (
    <div className="glass rounded-2xl p-4 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-text-primary">Input</h3>
      </div>

      {/* Array size slider */}
      <Slider
        label={`Array Size: ${arraySize}`}
        value={arraySize}
        onChange={onArraySizeChange}
        min={5}
        max={50}
      />

      {/* Generate button */}
      <Button
        variant="secondary"
        size="md"
        onClick={onGenerate}
        disabled={disabled}
        className="w-full flex items-center justify-center gap-2"
      >
        <Shuffle className="w-4 h-4" />
        Generate Random Array
      </Button>

      {/* Custom input */}
      <form onSubmit={handleCustomSubmit} className="flex gap-2">
        <div className="flex-1 relative">
          <Pencil className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-muted" />
          <input
            type="text"
            value={customValue}
            onChange={(e) => setCustomValue(e.target.value)}
            placeholder="e.g. 34, 12, 56, 78, 23"
            disabled={disabled}
            className="w-full bg-white/5 border border-border-glass rounded-lg pl-9 pr-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-neon-purple/50 transition-colors duration-200 disabled:opacity-50"
          />
        </div>
        <Button type="submit" variant="ghost" size="md" disabled={disabled}>
          Set
        </Button>
      </form>
    </div>
  )
}
