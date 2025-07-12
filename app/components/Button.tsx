import React from 'react'

interface Button {
  onClick?: () => void
  children?: React.ReactNode
  className?: string,
  disabled?: boolean
}

export const Button: React.FC<Button> = ({ onClick, children, className = '', disabled}) => {
  
    const baseClass = "px-4 py-2 bg-amber-400 text-white rounded hover:bg-amber-800 transition: duration-200"
    
    return (
        <button disabled={disabled} onClick={onClick} className={`${baseClass} ${className}`}>
          {children}
        </button>
  )
}