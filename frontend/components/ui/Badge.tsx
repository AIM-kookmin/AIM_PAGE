import React from 'react'

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'success' | 'warning' | 'muted' | 'admin' | 'primary' | 'secondary'
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
    success: 'bg-green-600 text-white',
    warning: 'bg-red-600 text-white',
    muted: 'bg-gray-600 text-gray-300',
    admin: 'bg-pink-600 text-white',
    primary: 'bg-cyan-500 text-black',
    secondary: 'bg-pink-500 text-white'
  }
  
  const sizes = {
    sm: 'px-2 py-1 text-xs rounded',
    md: 'px-3 py-1 text-sm rounded-full',
    lg: 'px-4 py-2 text-base rounded-full'
  }
  
  const badgeClasses = `${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`.trim()
  
  return (
    <span className={badgeClasses} {...props}>
      {children}
    </span>
  )
}

export default Badge
