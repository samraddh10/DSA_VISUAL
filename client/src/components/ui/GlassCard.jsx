import { motion } from 'framer-motion'

export default function GlassCard({
  children,
  className = '',
  hover = false,
  glow = false,
  as = 'div',
  ...props
}) {
  const Component = hover ? motion.div : as

  const baseClasses = `glass rounded-2xl ${glow ? 'glow-purple' : ''} ${className}`

  if (hover) {
    return (
      <Component
        className={baseClasses}
        whileHover={{ scale: 1.02, y: -2 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        {...props}
      >
        {children}
      </Component>
    )
  }

  return (
    <Component className={baseClasses} {...props}>
      {children}
    </Component>
  )
}
