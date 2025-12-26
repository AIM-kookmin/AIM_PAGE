import React from 'react'

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'dark' | 'gradient'
  padding?: 'sm' | 'md' | 'lg'
  children: React.ReactNode
}

export const Card: React.FC<CardProps> = ({
  variant = 'default',
  padding = 'md',
  children,
  className = '',
  ...props
}) => {
  const baseClasses = 'rounded-lg shadow-lg'
  
  const variants = {
    default: 'bg-gray-800 border border-gray-700',
    dark: 'bg-gray-700 border border-gray-600',
    gradient: 'bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700'
  }
  
  const paddings = {
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8'
  }
  
  const cardClasses = `${baseClasses} ${variants[variant]} ${paddings[padding]} ${className}`.trim()
  
  return (
    <div className={cardClasses} {...props}>
      {children}
    </div>
  )
}

interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

export const CardHeader: React.FC<CardHeaderProps> = ({
  children,
  className = '',
  ...props
}) => {
  return (
    <div className={`mb-4 ${className}`} {...props}>
      {children}
    </div>
  )
}

interface CardTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
  children: React.ReactNode
}

export const CardTitle: React.FC<CardTitleProps> = ({
  as: Component = 'h2',
  children,
  className = '',
  ...props
}) => {
  const titleClasses = `text-xl font-bold text-white ${className}`.trim()
  
  return (
    <Component className={titleClasses} {...props}>
      {children}
    </Component>
  )
}

interface CardContentProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

export const CardContent: React.FC<CardContentProps> = ({
  children,
  className = '',
  ...props
}) => {
  return (
    <div className={className} {...props}>
      {children}
    </div>
  )
}

export default Card
