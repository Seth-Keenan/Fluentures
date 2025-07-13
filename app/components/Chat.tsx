import React from 'react'

interface ChatProps {
    children?: React.ReactNode,
    className?: string,
    readOnly?: boolean,
    value?: string,
    disabled?: boolean,
    placeholder?: string,
}

export const Chat: React.FC<ChatProps> = ({ children, className, readOnly, value, disabled, placeholder}) => {
  
    const baseClass = "w-full h-[74vh] p-4 resize-none"
    
    return (
        <textarea className={`${baseClass} ${className}`} readOnly={readOnly} value={value} disabled={disabled} placeholder={placeholder}>
          {children}
        </textarea>
  )
}