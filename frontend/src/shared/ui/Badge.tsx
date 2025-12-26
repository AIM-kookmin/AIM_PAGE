import React from 'react'

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'success' | 'warning' | 'muted' | 'admin' | 'primary' | 'secondary' | 'error'
  size?: 'sm' | 'md' | 'lg'
  children: React.ReactNode
}

export const Badge: React.FC<BadgeProps> = ({
  variant = 'primary',
  size = 'md',
  children,
  className = '',
  ...props
}) => {
  const baseClasses = 'inline-flex items-center font-medium'
  
  const variants = {
    success: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30',
    warning: 'bg-amber-500/20 text-amber-400 border border-amber-500/30',
    error: 'bg-red-500/20 text-red-400 border border-red-500/30',
    muted: 'bg-white/10 text-white/60 border border-white/10',
    admin: 'bg-secondary-500/20 text-secondary-400 border border-secondary-500/30',
    primary: 'bg-primary-500/20 text-primary-400 border border-primary-500/30',
    secondary: 'bg-secondary-500/20 text-secondary-400 border border-secondary-500/30'
  }
  
  const sizes = {
    sm: 'px-2 py-0.5 text-xs rounded-md',
    md: 'px-3 py-1 text-sm rounded-full',
    lg: 'px-4 py-1.5 text-base rounded-full'
  }
  
  const badgeClasses = `${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`.trim()
  
  return (
    <span className={badgeClasses} {...props}>
      {children}
    </span>
  )
}

export default Badge
