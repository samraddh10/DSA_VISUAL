export default function Slider({ value, onChange, min = 0, max = 100, label, className = '' }) {
  const percent = ((value - min) / (max - min)) * 100

  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label className="text-xs font-medium text-text-secondary">{label}</label>
      )}
      <div className="relative w-full h-1.5 bg-white/10 rounded-full cursor-pointer">
        <div
          className="absolute top-0 left-0 h-full bg-neon-purple rounded-full"
          style={{ width: `${percent}%` }}
        />
        <input
          type="range"
          min={min}
          max={max}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="absolute inset-0 w-full opacity-0 cursor-pointer"
          step={1}
        />
        <div
          className="absolute top-1/2 -translate-y-1/2 w-3.5 h-3.5 bg-white rounded-full border-2 border-neon-purple shadow-md pointer-events-none"
          style={{ left: `calc(${percent}% - 7px)` }}
        />
      </div>
    </div>
  )
}
