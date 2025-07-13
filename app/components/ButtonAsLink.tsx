import Link from 'next/link'
import React from 'react'

interface ButtonAsLinkProps {
  onClick?: () => void
  children?: React.ReactNode
  className?: string,
  href?: string,
}

export const ButtonAsLink: React.FC<ButtonAsLinkProps> = ({ onClick, children, className = '', href= ''}) => {
  
    const baseClass = ""
    
    return (
    <button onClick={onClick} className={`${baseClass} ${className}`}>
        <Link href={`${href}`} style={{textDecoration: "underline"}}>
            {children}
        </Link>
    </button>
  )
}