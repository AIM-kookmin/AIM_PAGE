import React from 'react'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  as?: React.ElementType
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  fullWidth?: boolean
  children: React.ReactNode
}

export const Button: React.FC<ButtonProps> = ({
  as: Component = 'button',
  variant = 'primary',
  size = 'md',
  loading = false,
  fullWidth = false,
  children,
  className = '',
  disabled,
  ...props
}) => {
  const baseClasses = 'inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-black disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98]'
  
  const variants = {
    primary: 'bg-primary-500 hover:bg-primary-400 text-white hover:shadow-glow-primary focus:ring-primary-400',
    secondary: 'bg-secondary-500 hover:bg-secondary-400 text-white hover:shadow-glow-secondary focus:ring-secondary-400',
    ghost: 'bg-white/5 hover:bg-white/10 text-white border border-white/10 hover:border-white/20 focus:ring-white/20',
    outline: 'bg-transparent border-2 border-white/20 text-white hover:border-primary-400 hover:text-primary-400 hover:shadow-glow-sm focus:ring-primary-400'
  }
  
  const sizes = {
    sm: 'h-8 px-3 text-sm',
    md: 'h-10 px-4 text-base',
    lg: 'h-12 px-6 text-lg'
  }
  
  const widthClass = fullWidth ? 'w-full' : ''
  
  const buttonClasses = `${baseClasses} ${variants[variant]} ${sizes[size]} ${widthClass} ${className}`.trim()
  
  return (
    <Component
      className={buttonClasses}
      disabled={loading || disabled}
      {...props}
    >
      {loading ? (
        <div className="flex items-center">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
          로딩중...
        </div>
      ) : (
        children
      )}
    </Component>
  )
}

export default Button
