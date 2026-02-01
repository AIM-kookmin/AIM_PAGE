import React from 'react'

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'dark' | 'gradient' | 'glass'
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
  const baseClasses = 'rounded-2xl'
  
  const variants = {
    default: 'bg-white/5 border border-white/10 hover:bg-white/[0.08] hover:border-white/20 hover:shadow-glow-sm transition-all duration-300',
    dark: 'bg-white/[0.03] border border-white/5 hover:bg-white/[0.06] transition-all duration-300',
    gradient: 'bg-gradient-to-br from-white/10 to-white/5 border border-white/10 hover:shadow-glow-sm transition-all duration-300',
    glass: 'bg-white/5 border border-white/10 rounded-2xl hover:bg-white/[0.08] hover:border-white/20 hover:shadow-glow-sm transition-all duration-300'
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
