import { InputHTMLAttributes, forwardRef } from 'react'
import { cn } from '@lib/utils'

type Props = InputHTMLAttributes<HTMLInputElement>

const Input = forwardRef<HTMLInputElement, Props>(({ className, ...props }, ref) => {
  return (
    <input
      ref={ref}
      className={cn(
        // ancho completo + altura cómoda + estilos
        'block w-full h-11 md:h-12 rounded-[var(--radius)]',
        'border border-graphite/20 bg-white px-3 text-ink',
        'placeholder:text-graphite/50',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-femme-rose focus-visible:border-transparent',
        'transition-shadow',
        className
      )}
      {...props}
    />
  )
})
Input.displayName = 'Input'

export default Input
