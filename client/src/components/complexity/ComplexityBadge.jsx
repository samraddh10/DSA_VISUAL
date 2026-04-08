import { Clock, HardDrive } from 'lucide-react'

export default function ComplexityBadge({ time, space, best, worst, stable }) {
  return (
    <div className="glass rounded-2xl p-4 flex flex-col gap-3">
      <h3 className="text-sm font-semibold text-text-primary">Complexity</h3>
      <div className="grid grid-cols-2 gap-2">
        <Badge icon={<Clock className="w-3.5 h-3.5" />} label="Time" value={time} />
        <Badge icon={<HardDrive className="w-3.5 h-3.5" />} label="Space" value={space} />
        {best && <Badge label="Best" value={best} color="text-neon-green" />}
        {worst && <Badge label="Worst" value={worst} color="text-neon-rose" />}
      </div>
      {typeof stable === 'boolean' && (
        <div className="flex items-center gap-2 text-xs text-text-muted">
          <span className={`w-2 h-2 rounded-full ${stable ? 'bg-neon-green' : 'bg-neon-rose'}`} />
          {stable ? 'Stable' : 'Unstable'}
        </div>
      )}
    </div>
  )
}

function Badge({ icon, label, value, color = 'text-neon-purple-light' }) {
  return (
    <div className="bg-white/5 rounded-lg px-3 py-2 flex flex-col gap-0.5">
      <div className="flex items-center gap-1.5 text-text-muted">
        {icon}
        <span className="text-[10px] uppercase tracking-wider font-medium">{label}</span>
      </div>
      <span className={`text-sm font-mono font-semibold ${color}`}>{value}</span>
    </div>
  )
}
