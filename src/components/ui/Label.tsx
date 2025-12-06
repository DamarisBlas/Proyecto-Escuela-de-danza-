import { LabelHTMLAttributes, forwardRef } from 'react'
import { cn } from '@lib/utils'

type Props = LabelHTMLAttributes<HTMLLabelElement>

const Label = forwardRef<HTMLLabelElement, Props>(({ className, ...props }, ref) => {
  return (
    <label
      ref={ref}
      className={cn('block text-sm font-medium text-graphite', className)}
      {...props}
    />
  )
})
Label.displayName = 'Label'

export default Label
