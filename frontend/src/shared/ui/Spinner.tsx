import React from 'react'

interface SpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  color?: 'primary' | 'secondary' | 'white' | 'gray'
}

export const Spinner: React.FC<SpinnerProps> = ({
  size = 'md',
  color = 'primary',
  className = '',
  ...props
}) => {
  const sizes = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
    xl: 'h-16 w-16'
  }
  
  const colors = {
    primary: 'border-cyan-500',
    secondary: 'border-pink-500',
    white: 'border-white',
    gray: 'border-gray-400'
  }
  
  const spinnerClasses = `animate-spin rounded-full border-b-2 ${sizes[size]} ${colors[color]} ${className}`.trim()
  
  return (
    <div className={spinnerClasses} {...props} />
  )
}

interface LoadingProps {
  text?: string
  size?: 'sm' | 'md' | 'lg'
  center?: boolean
}

export const Loading: React.FC<LoadingProps> = ({
  text = '로딩중...',
  size = 'md',
  center = true
}) => {
  const containerClasses = center ? 'flex justify-center items-center' : 'flex items-center'
  
  return (
    <div className={containerClasses}>
      <Spinner size={size} />
      {text && (
        <span className="ml-3 text-gray-400">
          {text}
        </span>
      )}
    </div>
  )
}

export default Spinner
