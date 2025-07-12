import Link from 'next/link'
import React from 'react'

interface LinkAsButtonProps {
  onClick?: () => void
  children?: React.ReactNode
  className?: string,
  href?: string,
}

export const LinkAsButton: React.FC<LinkAsButtonProps> = ({ onClick, children, className = '', href= ''}) => {
  
    const baseClass = "px-4 py-2 bg-amber-400 text-white rounded hover:bg-amber-800 transition: duration-200"
    
    return (
      <Link href={`${href}`}>
        <button onClick={onClick} className={`${baseClass} ${className}`}>
          {children}
        </button>
      </Link>
  )
}