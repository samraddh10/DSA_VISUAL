import { motion } from 'framer-motion'

const variants = {
  primary: 'bg-neon-purple hover:bg-neon-purple/80 text-white glow-purple',
  secondary: 'bg-white/5 hover:bg-white/10 text-text-primary border border-border-glass',
  danger: 'bg-neon-rose/20 hover:bg-neon-rose/30 text-neon-rose border border-neon-rose/30',
  ghost: 'hover:bg-white/5 text-text-secondary hover:text-text-primary',
}

const sizes = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-3 text-base',
  icon: 'w-10 h-10 p-0 flex items-center justify-center',
}

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  disabled = false,
  ...props
}) {
  return (
    <motion.button
      whileHover={disabled ? {} : { scale: 1.03 }}
      whileTap={disabled ? {} : { scale: 0.97 }}
      className={`rounded-lg font-medium transition-colors duration-200 cursor-pointer
        ${variants[variant]} ${sizes[size]}
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        ${className}`}
      disabled={disabled}
      {...props}
    >
      {children}
    </motion.button>
  )
}
