
import React, { ButtonHTMLAttributes, ReactElement, ReactNode, forwardRef } from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@lib/utils'

// Keep the old prop names for backwards compatibility
type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'outline' | 'ghost'
  size?: 'sm' | 'md' | 'lg' | 'icon'
  asChild?: boolean
  children?: ReactNode
}

// shadcn-style buttonVariants (exported) so other shadcn components can import it
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default: "bg-femme-magenta text-white hover:bg-femme-rose",
        destructive: "bg-red-600 text-white hover:bg-red-700",
        outline: "border bg-white text-femme-magenta hover:bg-femme-magenta hover:text-white",
        secondary: "bg-neutral-100 text-ink hover:bg-neutral-200",
        ghost: "bg-transparent text-femme-magenta hover:bg-femme-softyellow/50",
        link: "text-femme-magenta underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2 has-[>svg]:px-3",
        sm: "h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5",
        lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
        icon: "size-9",
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

type ShadcnButtonVariants = VariantProps<typeof buttonVariants>

export { buttonVariants }

function Button({
  className,
  variant = 'primary',
  size = 'md',
  asChild,
  children,
  type = 'button',
  ...props
}: Props, ref: any) {
  // map old variant/size to shadcn variants
  const mapVariant = (v?: Props['variant']): ShadcnButtonVariants['variant'] => {
    switch (v) {
      case 'outline':
        return 'outline'
      case 'ghost':
        return 'ghost'
      case 'primary':
      default:
        return 'default'
    }
  }

  const mapSize = (s?: Props['size']): ShadcnButtonVariants['size'] => {
    switch (s) {
      case 'sm':
        return 'sm'
      case 'lg':
        return 'lg'
      case 'icon':
        return 'icon'
      default:
        return 'default'
    }
  }

  const classes = cn(buttonVariants({ variant: mapVariant(variant), size: mapSize(size) }), className)

  const Comp: any = asChild && React.isValidElement(children) ? Slot : 'button'

  if (asChild && React.isValidElement(children)) {
    const child = children as ReactElement<any>
    return React.cloneElement(child, {
      className: cn(classes, child.props?.className),
      ...props,
    })
  }

  return (
    <Comp ref={ref} type={type} className={classes} {...props}>
      {children}
    </Comp>
  )
}

const ForwardRefButton = forwardRef(Button) as unknown as React.ForwardRefExoticComponent<React.PropsWithoutRef<Props> & React.RefAttributes<any>>

export default ForwardRefButton
export { ForwardRefButton as Button }

