import React from "react"
import { cn } from "@/lib/utils"

const Checkbox = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      type="checkbox"
      ref={ref}
      className={cn(
        "h-4 w-4 shrink-0 rounded-sm border border-gray-300 focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    />
  ),
)
Checkbox.displayName = "Checkbox"

export { Checkbox }
