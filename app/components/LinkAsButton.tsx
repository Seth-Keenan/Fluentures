import Link from 'next/link'
import React from 'react'

interface LinkAsButtonProps {
  onClick?: () => void
  children?: React.ReactNode
  className?: string
  href?: string
  size?: "sm" | "md" | "lg" // Select sizing for buttons
}

export const LinkAsButton: React.FC<LinkAsButtonProps> = ({ // sorry the other long format hurt my brain
  onClick,
  children,
  className = '',
  href = '',
  size = "md"
}) => {
  let sizeClass = "";
  switch (size) {
    case "sm":
      sizeClass = "w-16 h-16 text-base";
      break;
    case "md":
      sizeClass = "w-35 h-35 text-lg";
      break;
    case "lg":
      sizeClass = "w-50 h-50 text-xl";
      break;
  }

  const baseClass = `flex items-center justify-center bg-amber-400 text-white rounded-full hover:bg-amber-800 transition duration-200 ${sizeClass}`

  return (
    <Link href={href}>
      <button onClick={onClick} className={`${baseClass} ${className}`}>
        {children}
      </button>
    </Link>
  )
}
