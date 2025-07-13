import React from 'react'

interface TextAreaProps {
    children?: React.ReactNode,
    readOnly?: boolean,
    value?: string,
    className?: string,
    disabled?: boolean,
    placeholder?: string
}

export const TextArea: React.FC<TextAreaProps> = ({ children, readOnly, value, className, disabled, placeholder}) => {
  
    const baseClass = "w-full h-[80vh] p-4 border rounded-xl shadow-black shadow-2xl resize-none"
    
    return (
      <textarea className={`${baseClass} ${className}`} readOnly={readOnly} value={value} disabled={disabled} placeholder={placeholder}>
          {children}
      </textarea>
  )
}